const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };
const GENERIC_RESEND_MESSAGE = "If a matching purchase exists, the serial email has been sent.";
const COMMUNITY_MAX_PACKAGE_BYTES = 25 * 1024 * 1024;
const COMMUNITY_MAX_PREVIEW_BYTES = 5 * 1024 * 1024;

const CHECKOUT_EVENT_TYPES = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
]);

const REFUND_EVENT_TYPES = new Set([
  "charge.refunded",
  "charge.refund.updated",
  "refund.created",
  "refund.updated",
]);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = normalizePath(url.pathname);
    const method = request.method.toUpperCase();
    const origin = request.headers.get("Origin") || "";

    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin, env) });
    }

    try {
      if (method === "GET" && path === "/healthz") {
        return json({ ok: true, service: "tape16-api" }, 200, origin, env);
      }

      if (method === "GET" && path === "/latest-release") {
        return await handleLatestRelease(origin, env);
      }

      if (method === "GET" && path === "/themes") {
        return await handleListCommunityItems("theme", origin, env);
      }

      if (method === "POST" && (path === "/themes" || path === "/submit-theme")) {
        return await handleSubmitCommunityItem(request, "theme", origin, env);
      }

      {
        const match = path.match(/^\/themes\/([^/]+)\/download$/);
        if (method === "GET" && match) {
          return await handleDownloadCommunityItem("theme", match[1], origin, env);
        }
      }

      {
        const match = path.match(/^\/themes\/([^/]+)\/preview$/);
        if (method === "GET" && match) {
          return await handlePreviewCommunityItem("theme", match[1], origin, env);
        }
      }

      {
        const match = path.match(/^\/themes\/([^/]+)\/rate$/);
        if (method === "POST" && match) {
          return await handleRateCommunityItem(request, "theme", match[1], origin, env);
        }
      }

      if (method === "GET" && path === "/mods") {
        return await handleListCommunityItems("mod", origin, env);
      }

      if (method === "POST" && (path === "/mods" || path === "/submit-mod")) {
        return await handleSubmitCommunityItem(request, "mod", origin, env);
      }

      {
        const match = path.match(/^\/mods\/([^/]+)\/download$/);
        if (method === "GET" && match) {
          return await handleDownloadCommunityItem("mod", match[1], origin, env);
        }
      }

      {
        const match = path.match(/^\/mods\/([^/]+)\/preview$/);
        if (method === "GET" && match) {
          return await handlePreviewCommunityItem("mod", match[1], origin, env);
        }
      }

      {
        const match = path.match(/^\/mods\/([^/]+)\/rate$/);
        if (method === "POST" && match) {
          return await handleRateCommunityItem(request, "mod", match[1], origin, env);
        }
      }

      if (method === "POST" && path === "/stripe/webhook") {
        return await handleStripeWebhook(request, env, origin, ctx);
      }

      if (method === "POST" && path === "/resend-serial") {
        return await handleResendSerial(request, env, origin, ctx);
      }

      if (method === "POST" && path === "/stripe/create-checkout-session") {
        return await handleCreateCheckoutSession(request, env, origin);
      }

      return json({ ok: false, error: "Not found" }, 404, origin, env);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Internal error";
      return json({ ok: false, error: message }, 500, origin, env);
    }
  },
};

async function handleStripeWebhook(request, env, origin, ctx) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return json({ ok: false, error: "Missing STRIPE_WEBHOOK_SECRET" }, 500, origin, env);
  }

  const rawBody = await request.text();
  const sigHeader = request.headers.get("stripe-signature") || "";
  const isValid = await verifyStripeSignature(rawBody, sigHeader, env.STRIPE_WEBHOOK_SECRET);
  if (!isValid) {
    return json({ ok: false, error: "Invalid signature" }, 400, origin, env);
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return json({ ok: false, error: "Invalid JSON payload" }, 400, origin, env);
  }

  const eventType = cleanString(event?.type);
  if (CHECKOUT_EVENT_TYPES.has(eventType)) {
    return await handleCheckoutEvent(event, env, origin, ctx);
  }

  if (REFUND_EVENT_TYPES.has(eventType)) {
    return await handleRefundEvent(event, env, origin);
  }

  return json({ ok: true, ignored: true, eventType: eventType || null }, 200, origin, env);
}

async function handleCheckoutEvent(event, env, origin, ctx) {
  const session = event?.data?.object || {};
  const processed = await issueOrReuseSerial({
    orderId: session.id,
    email: readSessionEmail(session),
    source: event.type,
    paymentIntentId: cleanString(session.payment_intent),
    env,
  });

  if (!processed.ok) {
    return json({ ok: false, error: processed.error || "Unable to process checkout session" }, 400, origin, env);
  }

  console.log(`[stripe processed] order=${processed.order.orderId} issued=${processed.issued}`);

  if (processed.order.revoked === true) {
    return json(
      {
        ok: true,
        issued: false,
        orderId: processed.order.orderId,
        emailQueued: false,
        revoked: true,
      },
      200,
      origin,
      env,
    );
  }

  const order = processed.order;
  const emailSend = sendSerialEmail({
    env,
    to: order.email,
    serial: order.serial,
    orderId: order.orderId,
    ctx,
  });

  const emailSent = await emailSend;
  return json(
    {
      ok: true,
      issued: processed.issued,
      orderId: order.orderId,
      emailQueued: emailSent,
    },
    200,
    origin,
    env,
  );
}

async function handleRefundEvent(event, env, origin) {
  const eventType = cleanString(event?.type);
  const object = event?.data?.object || {};

  if (!shouldRevokeFromRefundEvent(eventType, object)) {
    return json({ ok: true, ignored: true, eventType, reason: "refund_not_final" }, 200, origin, env);
  }

  const paymentIntentId = await resolveRefundPaymentIntent(eventType, object, env);
  if (!paymentIntentId) {
    return json({ ok: true, ignored: true, eventType, reason: "no_payment_intent" }, 200, origin, env);
  }

  const orderId = await findOrderIdByPaymentIntent(env, paymentIntentId);
  if (!orderId) {
    return json(
      { ok: true, ignored: true, eventType, reason: "no_matching_order", paymentIntentId },
      200,
      origin,
      env,
    );
  }

  const revoked = await revokeOrder(env, orderId, `refund:${eventType}`);
  return json({ ok: true, revoked, orderId, paymentIntentId }, 200, origin, env);
}

function shouldRevokeFromRefundEvent(eventType, object) {
  if (eventType.startsWith("charge.")) {
    const amountRefunded = Number(object?.amount_refunded || 0);
    return object?.refunded === true || amountRefunded > 0;
  }

  if (eventType.startsWith("refund.")) {
    return cleanString(object?.status) === "succeeded";
  }

  return false;
}

async function resolveRefundPaymentIntent(eventType, object, env) {
  const directPaymentIntent = cleanString(object?.payment_intent);
  if (directPaymentIntent) return directPaymentIntent;

  const chargeId = cleanString(object?.charge || (eventType.startsWith("charge.") ? object?.id : ""));
  if (!chargeId || !env.STRIPE_SECRET_KEY) return "";

  const response = await fetch(
    `https://api.stripe.com/v1/charges/${encodeURIComponent(chargeId)}`,
    { headers: stripeAuthHeaders(env.STRIPE_SECRET_KEY) },
  );
  if (!response.ok) return "";

  const charge = await response.json().catch(() => null);
  return cleanString(charge?.payment_intent);
}

async function findOrderIdByPaymentIntent(env, paymentIntentId) {
  const cleanPaymentIntent = cleanString(paymentIntentId);
  if (!cleanPaymentIntent) return "";

  const mappedOrderId = cleanString(await env.ORDERS_KV.get(paymentIntentKey(cleanPaymentIntent)));
  if (mappedOrderId) return mappedOrderId;

  const recoveredOrderId = await recoverOrderIdFromPaymentIntent(env, cleanPaymentIntent);
  if (!recoveredOrderId) return "";

  await env.ORDERS_KV.put(paymentIntentKey(cleanPaymentIntent), recoveredOrderId);
  return recoveredOrderId;
}

async function recoverOrderIdFromPaymentIntent(env, paymentIntentId) {
  if (!env.STRIPE_SECRET_KEY) return "";

  const endpoint =
    `https://api.stripe.com/v1/checkout/sessions?payment_intent=${encodeURIComponent(paymentIntentId)}&limit=1`;
  const response = await fetch(endpoint, { headers: stripeAuthHeaders(env.STRIPE_SECRET_KEY) });
  if (!response.ok) return "";

  const body = await response.json().catch(() => null);
  const firstSession = body?.data?.[0];
  return cleanString(firstSession?.id);
}

async function revokeOrder(env, orderId, reason) {
  const order = await readOrder(env, orderId);
  if (!order) return false;
  if (order.revoked === true) return false;

  const updated = {
    ...order,
    revoked: true,
    revokedAt: new Date().toISOString(),
    revokedReason: cleanString(reason) || "refund",
  };
  await env.ORDERS_KV.put(orderKey(orderId), JSON.stringify(updated));
  console.log(`[serial revoked] order=${orderId} reason=${updated.revokedReason}`);
  return true;
}

async function handleResendSerial(request, env, origin, ctx) {
  let payload = {};
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON payload" }, 400, origin, env);
  }

  const orderId = cleanString(payload.orderId);
  const email = cleanEmail(payload.email);
  if (!orderId || !email) {
    return json({ ok: false, error: "orderId and email are required" }, 400, origin, env);
  }

  let order = await readOrder(env, orderId);
  if (!order && env.STRIPE_SECRET_KEY) {
    order = await recoverOrderFromStripe(env, orderId);
    if (order) console.log(`[resend recovered] order=${orderId} email=${order.email}`);
  }

  if (!order) {
    return json({ ok: true, message: GENERIC_RESEND_MESSAGE }, 200, origin, env);
  }

  if (order.revoked === true) {
    console.log(`[resend blocked revoked] order=${order.orderId} email=${email}`);
    return json({ ok: true, message: GENERIC_RESEND_MESSAGE }, 200, origin, env);
  }

  if (cleanEmail(order.email) !== email) {
    return json({ ok: true, message: GENERIC_RESEND_MESSAGE }, 200, origin, env);
  }

  const sent = await sendSerialEmail({
    env,
    to: order.email,
    serial: order.serial,
    orderId: order.orderId,
    ctx,
  });

  return json(
    {
      ok: true,
      message: GENERIC_RESEND_MESSAGE,
      emailQueued: sent,
    },
    200,
    origin,
    env,
  );
}

async function handleCreateCheckoutSession(request, env, origin) {
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_PRICE_ID) {
    return json(
      { ok: false, error: "Missing STRIPE_SECRET_KEY or STRIPE_PRICE_ID" },
      500,
      origin,
      env,
    );
  }

  let payload = {};
  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const originBase = env.PUBLIC_SITE_ORIGIN || "https://emrmusicgroup.com";
  const successUrl = cleanString(payload.successUrl) || `${originBase}/tape16/?checkout=success`;
  const cancelUrl = cleanString(payload.cancelUrl) || `${originBase}/tape16/?checkout=cancel`;

  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("line_items[0][price]", env.STRIPE_PRICE_ID);
  form.set("line_items[0][quantity]", "1");
  form.set("allow_promotion_codes", "false");
  form.set("success_url", successUrl);
  form.set("cancel_url", cancelUrl);
  form.set("billing_address_collection", "auto");
  form.set("customer_creation", "if_required");
  form.set("tax_id_collection[enabled]", "false");

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: stripeAuthHeaders(env.STRIPE_SECRET_KEY),
    body: form,
  });
  const stripeBody = await stripeResponse.json().catch(() => ({}));
  if (!stripeResponse.ok) {
    return json({ ok: false, error: stripeBody?.error?.message || "Stripe API error" }, 502, origin, env);
  }

  return json({ ok: true, url: stripeBody.url, id: stripeBody.id }, 200, origin, env);
}

async function handleLatestRelease(origin, env) {
  const sourceUrl = "https://api.github.com/repos/jackpaterson1/TAPE-16-Public-Releases/releases/latest";
  const response = await fetch(sourceUrl, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "tape16-release-proxy",
    },
  });

  if (!response.ok) {
    return json({ ok: false, error: "Unable to fetch latest release" }, 502, origin, env);
  }

  const body = await response.json().catch(() => ({}));
  return json(
    {
      ok: true,
      tag_name: cleanString(body?.tag_name),
      published_at: cleanString(body?.published_at),
      updated_at: cleanString(body?.updated_at),
      created_at: cleanString(body?.created_at),
      html_url: cleanString(body?.html_url),
      name: cleanString(body?.name),
    },
    200,
    origin,
    env,
  );
}

async function handleListCommunityItems(type, origin, env) {
  const missing = missingCommunityBindings(env, { bucket: false });
  if (missing) return json({ ok: false, error: missing }, 500, origin, env);

  const rows = await env.COMMUNITY_DB.prepare(
    `SELECT id, type, slug, name, creator_name, app_version, description, tags,
      package_filename, package_size, preview_key, preview_filename, preview_size,
      download_count, rating_count, rating_total, created_at, updated_at
     FROM community_items
     WHERE type = ?
     ORDER BY created_at DESC
     LIMIT 100`,
  )
    .bind(type)
    .all();

  return json(
    {
      ok: true,
      items: (rows?.results || []).map((row) => publicCommunityItem(row)),
    },
    200,
    origin,
    env,
  );
}

async function handleSubmitCommunityItem(request, type, origin, env) {
  const missing = missingCommunityBindings(env);
  if (missing) return json({ ok: false, error: missing }, 500, origin, env);

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: "Invalid upload form" }, 400, origin, env);
  }

  const kind = communityKind(type);
  const email = cleanEmail(form.get("email"));
  const creatorName = cleanString(form.get("creator") || form.get("creatorName"));
  const name = cleanString(form.get(kind.nameField) || form.get("name"));
  const appVersion = cleanString(form.get("appVersion"));
  const description = cleanString(form.get("description")).slice(0, 1600);
  const tags = normalizeCommunityTags(form.get("tags"));
  const packageFile = readUploadFile(form, kind.fileField, "file", "package");
  const previewFile = readUploadFile(form, "previewImage", "preview", "image");

  if (!email || !creatorName || !name || !packageFile) {
    return json(
      { ok: false, error: "Email, creator name, item name, and ZIP file are required" },
      400,
      origin,
      env,
    );
  }

  if (!/\.zip$/i.test(packageFile.name || "")) {
    return json({ ok: false, error: "Upload the exported ZIP package" }, 400, origin, env);
  }

  const packageBuffer = await packageFile.arrayBuffer();
  if (!packageBuffer.byteLength || packageBuffer.byteLength > COMMUNITY_MAX_PACKAGE_BYTES) {
    return json({ ok: false, error: "ZIP package must be 25MB or smaller" }, 400, origin, env);
  }
  if (!looksLikeZip(packageBuffer)) {
    return json({ ok: false, error: "Theme package must be a valid ZIP file" }, 400, origin, env);
  }

  let previewBuffer = null;
  if (previewFile) {
    previewBuffer = await previewFile.arrayBuffer();
    if (!previewBuffer.byteLength || previewBuffer.byteLength > COMMUNITY_MAX_PREVIEW_BYTES) {
      return json({ ok: false, error: "Preview image must be 5MB or smaller" }, 400, origin, env);
    }
    if (!isAllowedPreviewFile(previewFile)) {
      return json({ ok: false, error: "Preview image must be PNG, JPG, or WebP" }, 400, origin, env);
    }
  }

  const id = makeCommunityId(type);
  const slug = await uniqueCommunitySlug(env, slugify(name), id);
  const now = new Date().toISOString();
  const packageFilename = sanitizeFilename(packageFile.name || `${slug}.zip`, `${slug}.zip`);
  const packageKey = `community/${kind.plural}/${id}/${packageFilename}`;
  const packageSha256 = await sha256Hex(packageBuffer);

  let previewKey = "";
  let previewFilename = "";
  if (previewFile && previewBuffer) {
    previewFilename = sanitizeFilename(previewFile.name || `${slug}-preview.png`, `${slug}-preview.png`);
    previewKey = `community/${kind.plural}/${id}/preview-${previewFilename}`;
  }

  await env.COMMUNITY_BUCKET.put(packageKey, packageBuffer, {
    httpMetadata: {
      contentType: "application/zip",
      contentDisposition: `attachment; filename="${packageFilename.replaceAll('"', "")}"`,
    },
    customMetadata: {
      id,
      type,
      slug,
      sha256: packageSha256,
    },
  });

  if (previewKey && previewBuffer) {
    await env.COMMUNITY_BUCKET.put(previewKey, previewBuffer, {
      httpMetadata: { contentType: previewFile.type || contentTypeForFilename(previewFilename) },
      customMetadata: { id, type, slug },
    });
  }

  const item = {
    id,
    type,
    slug,
    name,
    creator_name: creatorName,
    uploader_email: email,
    app_version: appVersion,
    description,
    tags: JSON.stringify(tags),
    package_key: packageKey,
    package_filename: packageFilename,
    package_size: packageBuffer.byteLength,
    package_sha256: packageSha256,
    preview_key: previewKey,
    preview_filename: previewFilename,
    preview_size: previewBuffer ? previewBuffer.byteLength : 0,
    download_count: 0,
    rating_count: 0,
    rating_total: 0,
    created_at: now,
    updated_at: now,
  };

  await env.COMMUNITY_DB.prepare(
    `INSERT INTO community_items (
      id, type, slug, name, creator_name, uploader_email, app_version, description, tags,
      package_key, package_filename, package_size, package_sha256,
      preview_key, preview_filename, preview_size,
      download_count, rating_count, rating_total, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      item.id,
      item.type,
      item.slug,
      item.name,
      item.creator_name,
      item.uploader_email,
      item.app_version,
      item.description,
      item.tags,
      item.package_key,
      item.package_filename,
      item.package_size,
      item.package_sha256,
      item.preview_key,
      item.preview_filename,
      item.preview_size,
      item.download_count,
      item.rating_count,
      item.rating_total,
      item.created_at,
      item.updated_at,
    )
    .run();

  return json(
    {
      ok: true,
      [`${type}Id`]: id,
      slug,
      item: publicCommunityItem(item),
    },
    201,
    origin,
    env,
  );
}

async function handleDownloadCommunityItem(type, slugOrId, origin, env) {
  const missing = missingCommunityBindings(env);
  if (missing) return json({ ok: false, error: missing }, 500, origin, env);

  const item = await getCommunityItem(env, type, slugOrId);
  if (!item) return json({ ok: false, error: "Item not found" }, 404, origin, env);

  const object = await env.COMMUNITY_BUCKET.get(item.package_key);
  if (!object) return json({ ok: false, error: "Package file not found" }, 404, origin, env);

  await env.COMMUNITY_DB.prepare(
    "UPDATE community_items SET download_count = download_count + 1, updated_at = ? WHERE id = ?",
  )
    .bind(new Date().toISOString(), item.id)
    .run();

  return new Response(object.body, {
    status: 200,
    headers: {
      ...corsHeaders(origin, env),
      "Content-Type": "application/zip",
      "Content-Length": String(object.size || item.package_size || 0),
      "Content-Disposition": `attachment; filename="${item.package_filename.replaceAll('"', "")}"`,
      "Cache-Control": "private, max-age=0",
    },
  });
}

async function handlePreviewCommunityItem(type, slugOrId, origin, env) {
  const missing = missingCommunityBindings(env);
  if (missing) return json({ ok: false, error: missing }, 500, origin, env);

  const item = await getCommunityItem(env, type, slugOrId);
  if (!item || !item.preview_key) return json({ ok: false, error: "Preview not found" }, 404, origin, env);

  const object = await env.COMMUNITY_BUCKET.get(item.preview_key);
  if (!object) return json({ ok: false, error: "Preview not found" }, 404, origin, env);

  return new Response(object.body, {
    status: 200,
    headers: {
      ...corsHeaders(origin, env),
      "Content-Type": object.httpMetadata?.contentType || contentTypeForFilename(item.preview_filename),
      "Content-Length": String(object.size || item.preview_size || 0),
      "Cache-Control": "public, max-age=3600",
    },
  });
}

async function handleRateCommunityItem(request, type, slugOrId, origin, env) {
  const missing = missingCommunityBindings(env, { bucket: false });
  if (missing) return json({ ok: false, error: missing }, 500, origin, env);

  let payload = {};
  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const rating = Number(payload.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return json({ ok: false, error: "Rating must be between 1 and 5" }, 400, origin, env);
  }

  const item = await getCommunityItem(env, type, slugOrId);
  if (!item) return json({ ok: false, error: "Item not found" }, 404, origin, env);

  const voterKey = await ratingVoterKey(request, env);
  const now = new Date().toISOString();
  await env.COMMUNITY_DB.prepare(
    `INSERT INTO community_ratings (item_id, voter_key, rating, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(item_id, voter_key)
     DO UPDATE SET rating = excluded.rating, updated_at = excluded.updated_at`,
  )
    .bind(item.id, voterKey, rating, now, now)
    .run();

  const totals = await env.COMMUNITY_DB.prepare(
    "SELECT COUNT(*) AS rating_count, COALESCE(SUM(rating), 0) AS rating_total FROM community_ratings WHERE item_id = ?",
  )
    .bind(item.id)
    .first();

  await env.COMMUNITY_DB.prepare(
    "UPDATE community_items SET rating_count = ?, rating_total = ?, updated_at = ? WHERE id = ?",
  )
    .bind(Number(totals?.rating_count || 0), Number(totals?.rating_total || 0), now, item.id)
    .run();

  const updated = await getCommunityItem(env, type, item.slug);
  return json({ ok: true, item: publicCommunityItem(updated), rating }, 200, origin, env);
}

async function issueOrReuseSerial({ orderId, email, source, paymentIntentId, env }) {
  const cleanOrderId = cleanString(orderId);
  const cleanOrderEmail = cleanEmail(email);
  const cleanPaymentIntentId = cleanString(paymentIntentId);
  if (!cleanOrderId || !cleanOrderEmail) {
    return { ok: false, error: "Missing order ID or customer email" };
  }

  const existing = await readOrder(env, cleanOrderId);
  if (existing) {
    if (cleanPaymentIntentId) {
      await env.ORDERS_KV.put(paymentIntentKey(cleanPaymentIntentId), existing.orderId);
    }
    return { ok: true, issued: false, order: existing };
  }

  const order = {
    orderId: cleanOrderId,
    email: cleanOrderEmail,
    serial: createSerial(),
    source,
    paymentIntentId: cleanPaymentIntentId || null,
    revoked: false,
    revokedAt: null,
    revokedReason: null,
    createdAt: new Date().toISOString(),
  };
  await env.ORDERS_KV.put(orderKey(cleanOrderId), JSON.stringify(order));
  if (cleanPaymentIntentId) {
    await env.ORDERS_KV.put(paymentIntentKey(cleanPaymentIntentId), cleanOrderId);
  }
  return { ok: true, issued: true, order };
}

async function recoverOrderFromStripe(env, orderId) {
  const response = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(orderId)}`,
    { headers: stripeAuthHeaders(env.STRIPE_SECRET_KEY) },
  );
  if (!response.ok) return null;

  const session = await response.json().catch(() => null);
  if (!session) return null;
  if (session.payment_status !== "paid" && session.status !== "complete") return null;

  const recoveredEmail = readSessionEmail(session);
  if (!recoveredEmail) return null;

  const out = await issueOrReuseSerial({
    orderId: session.id,
    email: recoveredEmail,
    source: "manual_recovery",
    paymentIntentId: cleanString(session.payment_intent),
    env,
  });
  return out.ok ? out.order : null;
}

async function sendSerialEmail({ env, to, serial, orderId, ctx }) {
  const toEmail = cleanEmail(to);
  if (!toEmail || !serial || !orderId) return false;
  if (!env.RESEND_API_KEY || !env.RESEND_FROM) return false;

  const send = async () => {
    const html = buildSerialHtml(serial, orderId);
    const text = [
      "Thanks for purchasing TAPE 16.",
      "",
      `Serial: ${serial}`,
      `Order ID: ${orderId}`,
    ].join("\n");

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.RESEND_FROM,
        to: [toEmail],
        subject: "Your TAPE 16 Serial Number",
        html,
        text,
      }),
    });
    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.log(`[email error] order=${orderId} to=${toEmail} err=${response.status} ${errorText}`);
      return false;
    }
    console.log(`[email sent] order=${orderId} to=${toEmail}`);
    return true;
  };

  if (ctx) {
    ctx.waitUntil(send());
    return true;
  }
  return await send();
}

function buildSerialHtml(serial, orderId) {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#101420">
      <h2 style="margin:0 0 12px;">Thanks for purchasing TAPE 16</h2>
      <p style="margin:0 0 12px;">Your serial number:</p>
      <p style="margin:0 0 16px;font-size:20px;font-weight:700;letter-spacing:0.08em;">${escapeHtml(serial)}</p>
      <p style="margin:0 0 8px;">Order ID: <code>${escapeHtml(orderId)}</code></p>
    </div>
  `;
}

async function readOrder(env, orderId) {
  const raw = await env.ORDERS_KV.get(orderKey(orderId));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function orderKey(orderId) {
  return `order:${orderId}`;
}

function paymentIntentKey(paymentIntentId) {
  return `pi:${paymentIntentId}`;
}

function readSessionEmail(session) {
  return (
    session?.customer_details?.email ||
    session?.customer_email ||
    session?.collected_information?.email ||
    ""
  );
}

function missingCommunityBindings(env, options = {}) {
  if (!env.COMMUNITY_DB) return "Missing COMMUNITY_DB binding";
  if (options.bucket !== false && !env.COMMUNITY_BUCKET) return "Missing COMMUNITY_BUCKET binding";
  return "";
}

function communityKind(type) {
  return type === "mod"
    ? { plural: "mods", nameField: "modName", fileField: "modFile" }
    : { plural: "themes", nameField: "themeName", fileField: "themeFile" };
}

function readUploadFile(form, ...names) {
  for (const name of names) {
    const value = form.get(name);
    if (value && typeof value === "object" && typeof value.arrayBuffer === "function") {
      if (value.size > 0 && value.name) return value;
    }
  }
  return null;
}

function makeCommunityId(type) {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const suffix = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${type}_${suffix}`;
}

function slugify(value) {
  const slug = cleanString(value)
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || "community-item";
}

async function uniqueCommunitySlug(env, baseSlug, id) {
  const base = baseSlug || "community-item";
  for (let i = 0; i < 100; i += 1) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const existing = await env.COMMUNITY_DB.prepare("SELECT id FROM community_items WHERE slug = ?")
      .bind(candidate)
      .first();
    if (!existing) return candidate;
  }
  return `${base}-${id.replace(/[^a-z0-9]/gi, "").slice(-8).toLowerCase()}`;
}

function sanitizeFilename(value, fallback) {
  const clean = cleanString(value)
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  return clean || fallback;
}

function normalizeCommunityTags(value) {
  return cleanString(value)
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);
}

function looksLikeZip(buffer) {
  const bytes = new Uint8Array(buffer);
  return bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b;
}

function isAllowedPreviewFile(file) {
  const name = cleanString(file?.name).toLowerCase();
  const type = cleanString(file?.type).toLowerCase();
  const allowedExt = /\.(png|jpe?g|webp)$/i.test(name);
  const allowedType = !type || ["image/png", "image/jpeg", "image/webp"].includes(type);
  return allowedExt && allowedType;
}

function contentTypeForFilename(filename) {
  const name = cleanString(filename).toLowerCase();
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".png")) return "image/png";
  return "application/octet-stream";
}

async function getCommunityItem(env, type, slugOrId) {
  const key = cleanString(decodeURIComponent(slugOrId || ""));
  if (!key) return null;

  return await env.COMMUNITY_DB.prepare(
    `SELECT id, type, slug, name, creator_name, app_version, description, tags,
      package_key, package_filename, package_size, package_sha256,
      preview_key, preview_filename, preview_size,
      download_count, rating_count, rating_total, created_at, updated_at
     FROM community_items
     WHERE type = ? AND (slug = ? OR id = ?)
     LIMIT 1`,
  )
    .bind(type, key, key)
    .first();
}

function publicCommunityItem(row) {
  if (!row) return null;
  const tags = parseCommunityTags(row.tags);
  const ratingCount = Number(row.rating_count || 0);
  const ratingTotal = Number(row.rating_total || 0);
  const ratingAverage = ratingCount ? Math.round((ratingTotal / ratingCount) * 10) / 10 : 0;
  const kind = communityKind(row.type);
  const basePath = `/${kind.plural}/${encodeURIComponent(row.slug)}`;

  return {
    id: row.id,
    type: row.type,
    slug: row.slug,
    name: row.name,
    creatorName: row.creator_name,
    appVersion: row.app_version || "",
    description: row.description || "",
    tags,
    packageFilename: row.package_filename,
    packageSize: Number(row.package_size || 0),
    packageSha256: row.package_sha256 || "",
    previewUrl: row.preview_key ? `${basePath}/preview` : "",
    downloadUrl: `${basePath}/download`,
    ratingUrl: `${basePath}/rate`,
    downloadCount: Number(row.download_count || 0),
    ratingCount,
    ratingAverage,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function parseCommunityTags(value) {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed.map(cleanString).filter(Boolean) : [];
  } catch {
    return [];
  }
}

async function ratingVoterKey(request, env) {
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const ua = request.headers.get("User-Agent") || "";
  const salt = env.RATING_SALT || "tape16-community-ratings";
  return await sha256Hex(`${salt}:${ip}:${ua}`);
}

async function sha256Hex(value) {
  const data = typeof value === "string" ? new TextEncoder().encode(value) : value;
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanEmail(value) {
  const out = cleanString(value).toLowerCase();
  return out.includes("@") ? out : "";
}

function createSerial() {
  const bytes = new Uint8Array(9);
  crypto.getRandomValues(bytes);
  const chunk = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  return `T16-${chunk.slice(0, 6)}-${chunk.slice(6, 12)}-${chunk.slice(12, 18)}`;
}

function normalizePath(pathname) {
  if (!pathname) return "/";
  const collapsed = pathname.replace(/\/+/g, "/");
  if (collapsed.length > 1 && collapsed.endsWith("/")) {
    return collapsed.slice(0, -1);
  }
  return collapsed;
}

function json(body, status = 200, origin = "", env) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...corsHeaders(origin, env) },
  });
}

function corsHeaders(origin, env) {
  const allowed = (env.ALLOWED_ORIGINS || env.ALLOWED_ORIGIN || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const isLocalDevOrigin = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(origin);
  const outOrigin =
    origin && (isLocalDevOrigin || allowed.includes(origin))
      ? origin
      : allowed[0] || "*";

  return {
    "Access-Control-Allow-Origin": outOrigin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Stripe-Signature",
    "Access-Control-Max-Age": "86400",
  };
}

function stripeAuthHeaders(secretKey) {
  return {
    Authorization: `Bearer ${secretKey}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
}

async function verifyStripeSignature(rawBody, stripeSignatureHeader, signingSecret) {
  if (!stripeSignatureHeader || !signingSecret || !rawBody) return false;

  const pairs = stripeSignatureHeader.split(",").map((part) => part.trim());
  let timestamp = "";
  const signatures = [];
  for (const pair of pairs) {
    const [key, value] = pair.split("=");
    if (key === "t") timestamp = value || "";
    if (key === "v1" && value) signatures.push(value);
  }
  if (!timestamp || signatures.length === 0) return false;

  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = await hmacSha256Hex(signingSecret, signedPayload);
  return signatures.some((sig) => safeEqual(sig, expected));
}

async function hmacSha256Hex(secret, message) {
  const enc = new TextEncoder();
  const keyData = enc.encode(secret);
  const msgData = enc.encode(message);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, msgData);
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
