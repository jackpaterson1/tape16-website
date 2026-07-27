const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };
const GENERIC_RESEND_MESSAGE = "If a matching purchase exists, the serial email has been sent.";
const COMMUNITY_MAX_PACKAGE_BYTES = 50 * 1024 * 1024;
const COMMUNITY_MAX_MIDI_PROFILE_BYTES = 5 * 1024 * 1024;
const COMMUNITY_MAX_CONTROLLER_PROFILE_COMPRESSED_BYTES = 20 * 1024 * 1024;
const COMMUNITY_MAX_CONTROLLER_PROFILE_EXPANDED_BYTES = 16 * 1024 * 1024;
const COMMUNITY_MAX_CONTROLLER_PROFILE_ENTRIES = 64;
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
        return await handleListCommunityItems("theme", origin, env, url.searchParams);
      }

      if (method === "POST" && (path === "/theme-account/login" || path === "/mod-account/login")) {
        return await handleThemeAccountLogin(request, origin, env);
      }

      if (method === "GET" && (path === "/theme-account/themes" || path === "/mod-account/items")) {
        return await handleThemeAccountThemes(request, origin, env);
      }

      if (method === "POST" && path === "/admin/theme-login-index/backfill") {
        return await handleThemeLoginIndexBackfill(request, origin, env, url.searchParams);
      }

      if (method === "POST" && (path === "/themes" || path === "/submit-theme")) {
        return await handleSubmitCommunityItem(request, "theme", origin, env);
      }

      {
        const match = path.match(/^\/themes\/([^/]+)$/);
        if (method === "PATCH" && match) {
          return await handleUpdateCommunityItem(request, "theme", match[1], origin, env);
        }
        if (method === "DELETE" && match) {
          return await handleDeleteCommunityItem(request, "theme", match[1], origin, env);
        }
      }

      {
        const match = path.match(/^\/themes\/([^/]+)\/package$/);
        if (method === "POST" && match) {
          return await handleReplaceCommunityPackage(request, "theme", match[1], origin, env);
        }
      }

      {
        const match = path.match(/^\/themes\/([^/]+)\/preview$/);
        if (method === "POST" && match) {
          return await handleReplaceCommunityPreview(request, "theme", match[1], origin, env);
        }
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

      if (method === "GET" && path === "/midi-profiles") {
        return await handleListCommunityItems("midi_profile", origin, env, url.searchParams);
      }

      if (method === "POST" && (path === "/midi-profiles" || path === "/submit-midi-profile")) {
        return await handleSubmitCommunityItem(request, "midi_profile", origin, env);
      }

      {
        const match = path.match(/^\/midi-profiles\/([^/]+)$/);
        if (method === "PATCH" && match) {
          return await handleUpdateCommunityItem(request, "midi_profile", match[1], origin, env);
        }
        if (method === "DELETE" && match) {
          return await handleDeleteCommunityItem(request, "midi_profile", match[1], origin, env);
        }
      }

      {
        const match = path.match(/^\/midi-profiles\/([^/]+)\/package$/);
        if (method === "POST" && match) {
          return await handleReplaceCommunityPackage(request, "midi_profile", match[1], origin, env);
        }
      }

      {
        const match = path.match(/^\/midi-profiles\/([^/]+)\/preview$/);
        if (method === "POST" && match) {
          return await handleReplaceCommunityPreview(request, "midi_profile", match[1], origin, env);
        }
      }

      {
        const match = path.match(/^\/midi-profiles\/([^/]+)\/download$/);
        if (method === "GET" && match) {
          return await handleDownloadCommunityItem("midi_profile", match[1], origin, env);
        }
      }

      {
        const match = path.match(/^\/midi-profiles\/([^/]+)\/preview$/);
        if (method === "GET" && match) {
          return await handlePreviewCommunityItem("midi_profile", match[1], origin, env);
        }
      }

      if (method === "GET" && path === "/controller-profiles") {
        return await handleListCommunityItems("controller_profile", origin, env, url.searchParams);
      }

      if (method === "POST" && (path === "/controller-profiles" || path === "/submit-controller-profile")) {
        return await handleSubmitCommunityItem(request, "controller_profile", origin, env);
      }

      {
        const match = path.match(/^\/controller-profiles\/([^/]+)$/);
        if (method === "PATCH" && match) {
          return await handleUpdateCommunityItem(request, "controller_profile", match[1], origin, env);
        }
        if (method === "DELETE" && match) {
          return await handleDeleteCommunityItem(request, "controller_profile", match[1], origin, env);
        }
      }

      {
        const match = path.match(/^\/controller-profiles\/([^/]+)\/package$/);
        if (method === "POST" && match) {
          return await handleReplaceCommunityPackage(request, "controller_profile", match[1], origin, env);
        }
      }

      {
        const match = path.match(/^\/controller-profiles\/([^/]+)\/preview$/);
        if (method === "POST" && match) {
          return await handleReplaceCommunityPreview(request, "controller_profile", match[1], origin, env);
        }
      }

      {
        const match = path.match(/^\/controller-profiles\/([^/]+)\/download$/);
        if (method === "GET" && match) {
          return await handleDownloadCommunityItem("controller_profile", match[1], origin, env);
        }
      }

      {
        const match = path.match(/^\/controller-profiles\/([^/]+)\/preview$/);
        if (method === "GET" && match) {
          return await handlePreviewCommunityItem("controller_profile", match[1], origin, env);
        }
      }

      if (method === "GET" && path === "/mods") {
        return await handleListCommunityItems("mod", origin, env, url.searchParams);
      }

      if (method === "POST" && (path === "/mods" || path === "/submit-mod")) {
        return await handleSubmitCommunityItem(request, "mod", origin, env);
      }

      {
        const match = path.match(/^\/mods\/([^/]+)$/);
        if (method === "PATCH" && match) {
          return await handleUpdateCommunityItem(request, "mod", match[1], origin, env);
        }
        if (method === "DELETE" && match) {
          return await handleDeleteCommunityItem(request, "mod", match[1], origin, env);
        }
      }

      {
        const match = path.match(/^\/mods\/([^/]+)\/package$/);
        if (method === "POST" && match) {
          return await handleReplaceCommunityPackage(request, "mod", match[1], origin, env);
        }
      }

      {
        const match = path.match(/^\/mods\/([^/]+)\/preview$/);
        if (method === "POST" && match) {
          return await handleReplaceCommunityPreview(request, "mod", match[1], origin, env);
        }
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

async function handleThemeAccountLogin(request, origin, env) {
  if (!env.ORDERS_KV) return json({ ok: false, error: "Order storage is not configured" }, 500, origin, env);
  if (!env.THEME_ACCOUNT_TOKEN_SECRET) {
    return json({ ok: false, error: "Theme account auth is not configured" }, 500, origin, env);
  }

  let payload = {};
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON payload" }, 400, origin, env);
  }

  const email = cleanEmail(payload.email);
  const serial = normalizeSerial(payload.serial);
  if (!email || !serial) {
    return json({ ok: false, error: "Email and serial are required" }, 400, origin, env);
  }

  const account = await findThemeAccountByEmailAndSerial(env, email, serial);
  if (!account) return json({ ok: false, error: "Invalid email or serial" }, 401, origin, env);

  const expiresInSeconds = 24 * 60 * 60;
  const token = await signThemeAccountToken(account, env, expiresInSeconds);
  return json(
    {
      ok: true,
      token,
      expiresInSeconds,
      email: account.email,
      serial: account.serial,
    },
    200,
    origin,
    env,
  );
}

async function handleThemeAccountThemes(request, origin, env) {
  const missing = missingCommunityBindings(env, { bucket: false });
  if (missing) return json({ ok: false, error: missing }, 500, origin, env);

  const accountResult = await requireThemeAccount(request, env);
  if (!accountResult.ok) return json({ ok: false, error: accountResult.error }, accountResult.status, origin, env);

  const account = accountResult.account;
  const now = new Date().toISOString();
  await env.COMMUNITY_DB.prepare(
    `UPDATE community_items
     SET owner_key = ?, owner_email = ?, owner_order_id = ?, updated_at = ?
     WHERE type IN ('theme', 'mod', 'midi_profile', 'controller_profile')
       AND (owner_key IS NULL OR owner_key = '')
       AND lower(uploader_email) = ?`,
  )
    .bind(account.ownerKey, account.email, account.orderId, now, account.email)
    .run();

  const rows = await env.COMMUNITY_DB.prepare(
    `SELECT id, type, slug, name, creator_name, app_version, description, tags,
      package_key, package_filename, package_size, package_sha256,
      preview_key, preview_filename, preview_size,
      download_count, created_at, updated_at
     FROM community_items
     WHERE type IN ('theme', 'mod', 'midi_profile', 'controller_profile') AND owner_key = ?
     ORDER BY updated_at DESC, created_at DESC
     LIMIT 100`,
  )
    .bind(account.ownerKey)
    .all();

  return json(
    {
      ok: true,
      items: (rows?.results || []).map((row) => managedCommunityItem(row)),
    },
    200,
    origin,
    env,
  );
}

async function handleThemeLoginIndexBackfill(request, origin, env, searchParams = new URLSearchParams()) {
  if (!env.ADMIN_BACKFILL_SECRET) {
    return json({ ok: false, error: "Backfill auth is not configured" }, 500, origin, env);
  }
  const expected = `Bearer ${env.ADMIN_BACKFILL_SECRET}`;
  const actual = request.headers.get("Authorization") || "";
  if (!safeEqual(actual, expected)) return json({ ok: false, error: "Unauthorized" }, 401, origin, env);
  if (!env.ORDERS_KV) return json({ ok: false, error: "Order storage is not configured" }, 500, origin, env);

  let payload = {};
  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const cursor = cleanString(payload.cursor || searchParams.get("cursor"));
  const source = cleanString(payload.source || searchParams.get("source")) === "licenses" ? "licenses" : "orders";
  const namespace = source === "licenses" ? env.LICENSES : env.ORDERS_KV;
  if (!namespace) return json({ ok: false, error: `${source} storage is not configured` }, 500, origin, env);

  const listOptions = { prefix: source === "licenses" ? "lic:" : "order:", limit: 1000 };
  if (cursor) listOptions.cursor = cursor;
  const page = await namespace.list(listOptions);

  let processed = 0;
  let indexed = 0;
  for (const key of page.keys || []) {
    processed += 1;
    if (source === "licenses") {
      const serial = cleanString(key.name).replace(/^lic:/, "");
      const license = await readLicense(env, serial);
      if (!license || !cleanEmail(license.email) || !normalizeSerial(license.serial) || license.revoked === true) {
        continue;
      }
      await writeThemeLoginIndex(env, {
        orderId: cleanString(license.orderId) || normalizeSerial(license.serial),
        email: license.email,
        serial: license.serial,
      });
      indexed += 1;
    } else {
      const orderId = cleanString(key.name).replace(/^order:/, "");
      const order = await readOrder(env, orderId);
      if (!order || !cleanEmail(order.email) || !normalizeSerial(order.serial)) continue;
      await writeThemeLoginIndex(env, order);
      indexed += 1;
    }
  }

  return json(
    {
      ok: true,
      source,
      cursor: page.list_complete ? "" : page.cursor || "",
      listComplete: Boolean(page.list_complete),
      processed,
      indexed,
    },
    200,
    origin,
    env,
  );
}

async function handleListCommunityItems(type, origin, env, searchParams = new URLSearchParams()) {
  const missing = missingCommunityBindings(env, { bucket: false });
  if (missing) return json({ ok: false, error: missing }, 500, origin, env);

  const sort = normalizeCommunitySort(searchParams.get("sort"));
  const windowStart = communitySortWindowStart(sort);
  let query;
  let statement;
  let rows;

  if (windowStart) {
    query = `SELECT i.id, i.type, i.slug, i.name, i.creator_name, i.app_version, i.description, i.tags,
        i.package_filename, i.package_size, i.preview_key, i.preview_filename, i.preview_size,
        i.download_count, COALESCE(d.period_download_count, 0) AS period_download_count,
        i.created_at, i.updated_at
       FROM community_items i
       LEFT JOIN (
         SELECT item_id, COUNT(*) AS period_download_count
         FROM community_downloads
         WHERE downloaded_at >= ?
         GROUP BY item_id
       ) d ON d.item_id = i.id
       WHERE i.type = ?
       ORDER BY period_download_count DESC, i.download_count DESC, i.created_at DESC
       LIMIT 100`;
    statement = env.COMMUNITY_DB.prepare(query);
    rows = await statement.bind(windowStart, type).all();
  } else {
    const orderBy =
      sort === "latest"
        ? "i.created_at DESC"
        : sort === "oldest"
          ? "i.created_at ASC"
          : "i.download_count DESC, i.created_at DESC";
    query = `SELECT i.id, i.type, i.slug, i.name, i.creator_name, i.app_version, i.description, i.tags,
        i.package_filename, i.package_size, i.preview_key, i.preview_filename, i.preview_size,
        i.download_count, i.download_count AS period_download_count,
        i.created_at, i.updated_at
       FROM community_items i
       WHERE i.type = ?
       ORDER BY ${orderBy}
       LIMIT 100`;
    statement = env.COMMUNITY_DB.prepare(query);
    rows = await statement.bind(type).all();
  }

  return json(
    {
      ok: true,
      sort,
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

  const accountResult = await optionalThemeAccount(request, env);
  if (!accountResult.ok) return json({ ok: false, error: accountResult.error }, accountResult.status, origin, env);
  const account =
    type === "theme" || type === "mod" || type === "midi_profile" || type === "controller_profile"
      ? accountResult.account
      : null;

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: "Invalid upload form" }, 400, origin, env);
  }

  const kind = communityKind(type);
  const email = account ? account.email : cleanEmail(form.get("email"));
  const creatorName = cleanString(form.get("creator") || form.get("creatorName"));
  const name = cleanString(form.get(kind.nameField) || form.get("name"));
  const appVersion = cleanString(form.get("appVersion"));
  const description = cleanString(form.get("description")).slice(0, 1600);
  const tags = normalizeCommunityTags(form.get("tags"));
  const packageFile = readUploadFile(form, kind.fileField, "file", "package");
  const previewFile = readUploadFile(form, "previewImage", "preview", "image");

  if (!email || !creatorName || !name || !packageFile || !previewFile) {
    return json(
      { ok: false, error: "Email, creator name, item name, upload file, and preview image are required" },
      400,
      origin,
      env,
    );
  }

  const packageBuffer = await packageFile.arrayBuffer();
  const packageError = validateCommunityPackage(type, packageFile, packageBuffer);
  if (packageError) {
    return json({ ok: false, error: packageError }, 400, origin, env);
  }

  let previewBuffer = await previewFile.arrayBuffer();
  if (!previewBuffer.byteLength || previewBuffer.byteLength > COMMUNITY_MAX_PREVIEW_BYTES) {
    return json({ ok: false, error: "Preview image must be 5MB or smaller" }, 400, origin, env);
  }
  if (!isAllowedPreviewFile(previewFile)) {
    return json({ ok: false, error: "Preview image must be PNG, JPG, or WebP" }, 400, origin, env);
  }

  const id = makeCommunityId(type);
  const slug = await uniqueCommunitySlug(env, slugify(name), id);
  const now = new Date().toISOString();
  const fallbackPackageName = communityFallbackPackageName(type, slug);
  const packageFilename = sanitizeFilename(packageFile.name || fallbackPackageName, fallbackPackageName);
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
      contentType: communityPackageContentType(type, packageFilename),
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
    owner_key: account ? account.ownerKey : "",
    owner_email: account ? account.email : "",
    owner_order_id: account ? account.orderId : "",
    created_at: now,
    updated_at: now,
  };

  await env.COMMUNITY_DB.prepare(
    `INSERT INTO community_items (
      id, type, slug, name, creator_name, uploader_email, app_version, description, tags,
      package_key, package_filename, package_size, package_sha256,
      preview_key, preview_filename, preview_size,
      download_count, owner_key, owner_email, owner_order_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      item.owner_key,
      item.owner_email,
      item.owner_order_id,
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

async function handleUpdateCommunityItem(request, type, slugOrId, origin, env) {
  const missing = missingCommunityBindings(env, { bucket: false });
  if (missing) return json({ ok: false, error: missing }, 500, origin, env);

  const owned = await requireOwnedCommunityItem(request, env, type, slugOrId);
  if (!owned.ok) return json({ ok: false, error: owned.error }, owned.status, origin, env);

  let payload = {};
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON payload" }, 400, origin, env);
  }

  const kind = communityKind(type);
  const name = cleanString(payload[kind.nameField] || payload.name);
  const creatorName = cleanString(payload.creator || payload.creatorName);
  const appVersion = cleanString(payload.appVersion);
  const description = cleanString(payload.description).slice(0, 1600);
  const tags = JSON.stringify(normalizeCommunityTags(payload.tags));
  if (!name || !creatorName) {
    return json({ ok: false, error: "Creator name and item name are required" }, 400, origin, env);
  }

  const now = new Date().toISOString();
  await env.COMMUNITY_DB.prepare(
    `UPDATE community_items
     SET name = ?, creator_name = ?, app_version = ?, description = ?, tags = ?, updated_at = ?
     WHERE id = ?`,
  )
    .bind(name, creatorName, appVersion, description, tags, now, owned.item.id)
    .run();

  const item = await getCommunityItem(env, type, owned.item.id);
  return json({ ok: true, item: managedCommunityItem(item) }, 200, origin, env);
}

async function handleReplaceCommunityPackage(request, type, slugOrId, origin, env) {
  const missing = missingCommunityBindings(env);
  if (missing) return json({ ok: false, error: missing }, 500, origin, env);

  const owned = await requireOwnedCommunityItem(request, env, type, slugOrId);
  if (!owned.ok) return json({ ok: false, error: owned.error }, owned.status, origin, env);

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: "Invalid upload form" }, 400, origin, env);
  }

  const kind = communityKind(type);
  const packageFile = readUploadFile(form, kind.fileField, "themeFile", "file", "package");
  if (!packageFile) return json({ ok: false, error: "Upload file is required" }, 400, origin, env);
  const packageBuffer = await packageFile.arrayBuffer();
  const packageError = validateCommunityPackage(type, packageFile, packageBuffer);
  if (packageError) {
    return json({ ok: false, error: packageError }, 400, origin, env);
  }

  const fallbackPackageName = communityFallbackPackageName(type, owned.item.slug);
  const packageFilename = sanitizeFilename(packageFile.name || fallbackPackageName, fallbackPackageName);
  const packageKey = `community/${kind.plural}/${owned.item.id}/${Date.now()}-${packageFilename}`;
  const packageSha256 = await sha256Hex(packageBuffer);
  const oldPackageKey = owned.item.package_key;

  await env.COMMUNITY_BUCKET.put(packageKey, packageBuffer, {
    httpMetadata: {
      contentType: communityPackageContentType(type, packageFilename),
      contentDisposition: `attachment; filename="${packageFilename.replaceAll('"', "")}"`,
    },
    customMetadata: {
      id: owned.item.id,
      type,
      slug: owned.item.slug,
      sha256: packageSha256,
    },
  });

  const now = new Date().toISOString();
  await env.COMMUNITY_DB.prepare(
    `UPDATE community_items
     SET package_key = ?, package_filename = ?, package_size = ?, package_sha256 = ?, updated_at = ?
     WHERE id = ?`,
  )
    .bind(packageKey, packageFilename, packageBuffer.byteLength, packageSha256, now, owned.item.id)
    .run();

  if (oldPackageKey && oldPackageKey !== packageKey) {
    await env.COMMUNITY_BUCKET.delete(oldPackageKey).catch(() => {});
  }

  const item = await getCommunityItem(env, type, owned.item.id);
  return json({ ok: true, item: managedCommunityItem(item) }, 200, origin, env);
}

async function handleReplaceCommunityPreview(request, type, slugOrId, origin, env) {
  const missing = missingCommunityBindings(env);
  if (missing) return json({ ok: false, error: missing }, 500, origin, env);

  const owned = await requireOwnedCommunityItem(request, env, type, slugOrId);
  if (!owned.ok) return json({ ok: false, error: owned.error }, owned.status, origin, env);

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: "Invalid upload form" }, 400, origin, env);
  }

  const kind = communityKind(type);
  const previewFile = readUploadFile(form, "previewImage", "preview", "image");
  if (!previewFile) return json({ ok: false, error: "Preview image is required" }, 400, origin, env);

  const previewBuffer = await previewFile.arrayBuffer();
  if (!previewBuffer.byteLength || previewBuffer.byteLength > COMMUNITY_MAX_PREVIEW_BYTES) {
    return json({ ok: false, error: "Preview image must be 5MB or smaller" }, 400, origin, env);
  }
  if (!isAllowedPreviewFile(previewFile)) {
    return json({ ok: false, error: "Preview image must be PNG, JPG, or WebP" }, 400, origin, env);
  }

  const previewFilename = sanitizeFilename(previewFile.name || `${owned.item.slug}-preview.png`, `${owned.item.slug}-preview.png`);
  const previewKey = `community/${kind.plural}/${owned.item.id}/${Date.now()}-preview-${previewFilename}`;
  const oldPreviewKey = owned.item.preview_key;

  await env.COMMUNITY_BUCKET.put(previewKey, previewBuffer, {
    httpMetadata: { contentType: previewFile.type || contentTypeForFilename(previewFilename) },
    customMetadata: { id: owned.item.id, type, slug: owned.item.slug },
  });

  const now = new Date().toISOString();
  await env.COMMUNITY_DB.prepare(
    `UPDATE community_items
     SET preview_key = ?, preview_filename = ?, preview_size = ?, updated_at = ?
     WHERE id = ?`,
  )
    .bind(previewKey, previewFilename, previewBuffer.byteLength, now, owned.item.id)
    .run();

  if (oldPreviewKey && oldPreviewKey !== previewKey) {
    await env.COMMUNITY_BUCKET.delete(oldPreviewKey).catch(() => {});
  }

  const item = await getCommunityItem(env, type, owned.item.id);
  return json({ ok: true, item: managedCommunityItem(item) }, 200, origin, env);
}

async function handleDeleteCommunityItem(request, type, slugOrId, origin, env) {
  const missing = missingCommunityBindings(env);
  if (missing) return json({ ok: false, error: missing }, 500, origin, env);

  const owned = await requireOwnedCommunityItem(request, env, type, slugOrId);
  if (!owned.ok) return json({ ok: false, error: owned.error }, owned.status, origin, env);

  const item = owned.item;
  await env.COMMUNITY_DB.batch([
    env.COMMUNITY_DB.prepare("DELETE FROM community_ratings WHERE item_id = ?").bind(item.id),
    env.COMMUNITY_DB.prepare("DELETE FROM community_downloads WHERE item_id = ?").bind(item.id),
    env.COMMUNITY_DB.prepare("DELETE FROM community_items WHERE id = ?").bind(item.id),
  ]);

  const objectDeletes = [item.package_key, item.preview_key]
    .map((key) => cleanString(key))
    .filter((key, index, keys) => key && keys.indexOf(key) === index)
    .map((key) => env.COMMUNITY_BUCKET.delete(key).catch(() => {}));
  await Promise.all(objectDeletes);

  return json({ ok: true, deleted: true, itemId: item.id, slug: item.slug }, 200, origin, env);
}

async function handleDownloadCommunityItem(type, slugOrId, origin, env) {
  const missing = missingCommunityBindings(env);
  if (missing) return json({ ok: false, error: missing }, 500, origin, env);

  const item = await getCommunityItem(env, type, slugOrId);
  if (!item) return json({ ok: false, error: "Item not found" }, 404, origin, env);

  const object = await env.COMMUNITY_BUCKET.get(item.package_key);
  if (!object) return json({ ok: false, error: "Package file not found" }, 404, origin, env);

  const now = new Date().toISOString();
  await env.COMMUNITY_DB.batch([
    env.COMMUNITY_DB.prepare(
      "UPDATE community_items SET download_count = download_count + 1, updated_at = ? WHERE id = ?",
    ).bind(now, item.id),
    env.COMMUNITY_DB.prepare(
      "INSERT INTO community_downloads (id, item_id, downloaded_at) VALUES (?, ?, ?)",
    ).bind(makeCommunityDownloadId(), item.id, now),
  ]);

  return new Response(object.body, {
    status: 200,
    headers: {
      ...corsHeaders(origin, env),
      "Content-Type": object.httpMetadata?.contentType || communityPackageContentType(type, item.package_filename),
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
    await writeThemeLoginIndex(env, existing);
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
  await writeThemeLoginIndex(env, order);
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

async function readLicense(env, serial) {
  if (!env.LICENSES) return null;
  const cleanSerial = normalizeSerial(serial);
  if (!cleanSerial) return null;
  const raw = await env.LICENSES.get(`lic:${cleanSerial}`);
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

async function themeLoginKey(email, serial) {
  return `theme_login:${await sha256Hex(cleanEmail(email))}:${await sha256Hex(normalizeSerial(serial))}`;
}

async function writeThemeLoginIndex(env, order) {
  const email = cleanEmail(order?.email);
  const serial = normalizeSerial(order?.serial);
  const orderId = cleanString(order?.orderId);
  if (!env.ORDERS_KV || !email || !serial || !orderId) return false;
  await env.ORDERS_KV.put(await themeLoginKey(email, serial), orderId);
  return true;
}

function isValidThemeAccountOrder(order, email, serial) {
  if (!order || order.revoked === true) return false;
  return cleanEmail(order.email) === cleanEmail(email) && normalizeSerial(order.serial) === normalizeSerial(serial);
}

async function themeOwnerKey(email) {
  return await sha256Hex(`theme-owner:${cleanEmail(email)}`);
}

async function themeAccountFromOrder(order) {
  const email = cleanEmail(order.email);
  return {
    email,
    serial: normalizeSerial(order.serial),
    orderId: cleanString(order.orderId),
    source: "order",
    ownerKey: await themeOwnerKey(email),
  };
}

async function themeAccountFromLicense(license) {
  const email = cleanEmail(license?.email);
  const serial = normalizeSerial(license?.serial);
  if (!email || !serial || license?.revoked === true) return null;
  return {
    email,
    serial,
    orderId: cleanString(license?.orderId) || serial,
    source: "license",
    ownerKey: await themeOwnerKey(email),
  };
}

async function findThemeAccountByEmailAndSerial(env, email, serial) {
  const cleanAccountEmail = cleanEmail(email);
  const cleanAccountSerial = normalizeSerial(serial);
  if (!cleanAccountEmail || !cleanAccountSerial) return null;

  const orderId = cleanString(await env.ORDERS_KV.get(await themeLoginKey(cleanAccountEmail, cleanAccountSerial)));
  if (orderId) {
    const order = await readOrder(env, orderId);
    if (isValidThemeAccountOrder(order, cleanAccountEmail, cleanAccountSerial)) {
      return await themeAccountFromOrder(order);
    }
  }

  const license = await readLicense(env, cleanAccountSerial);
  if (license && cleanEmail(license.email) === cleanAccountEmail && license.revoked !== true) {
    return await themeAccountFromLicense(license);
  }

  return null;
}

async function optionalThemeAccount(request, env) {
  const header = request.headers.get("Authorization") || "";
  if (!header) return { ok: true, account: null };
  return await requireThemeAccount(request, env);
}

async function requireThemeAccount(request, env) {
  if (!env.THEME_ACCOUNT_TOKEN_SECRET) {
    return { ok: false, status: 500, error: "Theme account auth is not configured" };
  }

  const header = request.headers.get("Authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return { ok: false, status: 401, error: "Missing theme account session" };

  const payload = await verifyThemeAccountToken(match[1], env);
  if (!payload) return { ok: false, status: 401, error: "Invalid or expired theme account session" };

  let account = null;
  if (payload.source === "license") {
    const license = await readLicense(env, payload.serial);
    if (license && cleanEmail(license.email) === payload.email && license.revoked !== true) {
      account = await themeAccountFromLicense(license);
    }
  } else {
    const order = await readOrder(env, payload.orderId);
    if (isValidThemeAccountOrder(order, payload.email, payload.serial)) {
      account = await themeAccountFromOrder(order);
    }
  }

  if (!account) return { ok: false, status: 401, error: "Theme account session is no longer valid" };
  return { ok: true, account };
}

async function requireOwnedCommunityItem(request, env, type, slugOrId) {
  const accountResult = await requireThemeAccount(request, env);
  if (!accountResult.ok) return accountResult;

  const item = await getCommunityItem(env, type, slugOrId);
  if (!item) return { ok: false, status: 404, error: "Item not found" };
  if (cleanString(item.owner_key) !== accountResult.account.ownerKey) {
    return { ok: false, status: 403, error: "You do not own this item" };
  }
  return { ok: true, account: accountResult.account, item };
}

async function signThemeAccountToken(account, env, expiresInSeconds) {
  const exp = Math.floor(Date.now() / 1000) + Math.max(60, Number(expiresInSeconds || 0));
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    email: account.email,
    serial: account.serial,
    orderId: account.orderId,
    source: account.source || "order",
    ownerKey: account.ownerKey,
    exp,
  };
  const encodedHeader = base64UrlEncodeJson(header);
  const encodedPayload = base64UrlEncodeJson(payload);
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = await hmacSha256Base64Url(env.THEME_ACCOUNT_TOKEN_SECRET, signingInput);
  return `${signingInput}.${signature}`;
}

async function verifyThemeAccountToken(token, env) {
  const parts = cleanString(token).split(".");
  if (parts.length !== 3) return null;
  const signingInput = `${parts[0]}.${parts[1]}`;
  const expected = await hmacSha256Base64Url(env.THEME_ACCOUNT_TOKEN_SECRET, signingInput);
  if (!safeEqual(parts[2], expected)) return null;

  let payload;
  try {
    payload = JSON.parse(base64UrlDecodeString(parts[1]));
  } catch {
    return null;
  }

  if (!payload || Math.floor(Date.now() / 1000) >= Number(payload.exp || 0)) return null;
  const email = cleanEmail(payload.email);
  const serial = normalizeSerial(payload.serial);
  const orderId = cleanString(payload.orderId);
  const source = cleanString(payload.source) === "license" ? "license" : "order";
  const ownerKey = cleanString(payload.ownerKey);
  if (!email || !serial || !orderId || !ownerKey) return null;
  return { email, serial, orderId, source, ownerKey, exp: Number(payload.exp) };
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
  if (!env.COMMUNITY_DB) return "Community database is not configured yet";
  if (options.bucket !== false && !env.COMMUNITY_BUCKET) return "Community file storage is not enabled yet";
  return "";
}

function communityKind(type) {
  if (type === "mod") return { plural: "mods", nameField: "modName", fileField: "modFile" };
  if (type === "midi_profile") {
    return { plural: "midi-profiles", nameField: "midiProfileName", fileField: "midiProfileFile" };
  }
  if (type === "controller_profile") {
    return {
      plural: "controller-profiles",
      nameField: "controllerProfileName",
      fileField: "controllerProfileFile",
    };
  }
  return { plural: "themes", nameField: "themeName", fileField: "themeFile" };
}

function communityFallbackPackageName(type, slug) {
  if (type === "midi_profile") return `${slug}.tape16-midi-profile`;
  if (type === "controller_profile") return `${slug}.tape16controller`;
  return `${slug}.zip`;
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

function makeCommunityDownloadId() {
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  const suffix = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `dl_${suffix}`;
}

function normalizeCommunitySort(value) {
  const sort = cleanString(value).toLowerCase().replace(/-/g, "_");
  if (sort === "latest" || sort === "newest" || sort === "recent") return "latest";
  if (sort === "oldest" || sort === "first") return "oldest";
  if (sort === "downloads" || sort === "all_time" || sort === "all") return "downloads";
  if (sort === "popular_3_months" || sort === "3_months" || sort === "three_months") {
    return "popular_3_months";
  }
  if (sort === "popular_1_week" || sort === "1_week" || sort === "week") return "popular_1_week";
  return "popular_1_month";
}

function communitySortWindowStart(sort) {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  if (sort === "popular_3_months") return new Date(now - 90 * day).toISOString();
  if (sort === "popular_1_week") return new Date(now - 7 * day).toISOString();
  if (sort === "popular_1_month") return new Date(now - 30 * day).toISOString();
  return "";
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
  if (Array.isArray(value)) {
    return value.map((tag) => cleanString(tag).toLowerCase()).filter(Boolean).slice(0, 8);
  }

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

function looksLikeMidiProfile(buffer) {
  const text = new TextDecoder().decode(buffer.slice(0, Math.min(buffer.byteLength, 4096)));
  return /<\s*(MidiLearnProfile|MidiLearnMappings)\b/i.test(text);
}

function controllerProfileEntryKind(path, directory) {
  const lower = path.toLowerCase();
  if (directory) {
    return path === "docs" || path.startsWith("docs/") || path === "icons" || path.startsWith("icons/")
      ? "directory"
      : "";
  }
  if (path === "profile.json") return "profile";
  if (path === "controller.js") return "script";
  if (lower === "readme.md" || lower === "readme.txt" || path.startsWith("docs/")) {
    return /\.(md|txt|pdf|png|jpe?g|webp)$/i.test(lower) ? "asset" : "";
  }
  const rootIcon =
    !lower.includes("/") &&
    (lower.startsWith("icon.") ||
      lower.startsWith("icon-") ||
      lower.startsWith("icon_") ||
      lower.startsWith("icon@"));
  if (rootIcon || path.startsWith("icons/")) {
    return /\.(png|jpe?g|webp)$/i.test(lower) ? "asset" : "";
  }
  return "";
}

function validateControllerProfilePath(rawPath, directory) {
  const path = rawPath.replaceAll("\\", "/").replace(directory ? /\/+$/ : /$^/, "");
  if (
    !path ||
    path.length > 240 ||
    path.startsWith("/") ||
    path.includes("//") ||
    path.includes(":")
  ) {
    return "";
  }
  const components = path.split("/");
  if (
    components.some(
      (component) =>
        !component ||
        component.length > 80 ||
        component.startsWith(".") ||
        !/^[A-Za-z0-9 _().-]+$/.test(component),
    )
  ) {
    return "";
  }
  return path;
}

function validateControllerProfileZip(buffer) {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const minimumEocdOffset = Math.max(0, bytes.length - 65557);
  let eocdOffset = -1;
  for (let offset = bytes.length - 22; offset >= minimumEocdOffset; offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) {
      eocdOffset = offset;
      break;
    }
  }
  if (eocdOffset < 0) return "Controller profile package has an invalid ZIP directory";

  const diskNumber = view.getUint16(eocdOffset + 4, true);
  const centralDisk = view.getUint16(eocdOffset + 6, true);
  const entriesOnDisk = view.getUint16(eocdOffset + 8, true);
  const entryCount = view.getUint16(eocdOffset + 10, true);
  const centralSize = view.getUint32(eocdOffset + 12, true);
  const centralOffset = view.getUint32(eocdOffset + 16, true);
  if (
    diskNumber !== 0 ||
    centralDisk !== 0 ||
    entriesOnDisk !== entryCount ||
    entryCount < 1 ||
    entryCount > COMMUNITY_MAX_CONTROLLER_PROFILE_ENTRIES ||
    centralOffset + centralSize > eocdOffset
  ) {
    return "Controller profile package exceeds TAPE 16 package limits";
  }

  const decoder = new TextDecoder("utf-8", { fatal: true });
  const seenPaths = new Set();
  let offset = centralOffset;
  let expandedBytes = 0;
  let profileCount = 0;
  for (let index = 0; index < entryCount; index += 1) {
    if (offset + 46 > eocdOffset || view.getUint32(offset, true) !== 0x02014b50) {
      return "Controller profile package has an invalid ZIP directory";
    }
    const flags = view.getUint16(offset + 8, true);
    const compression = view.getUint16(offset + 10, true);
    const expandedSize = view.getUint32(offset + 24, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const entryEnd = offset + 46 + nameLength + extraLength + commentLength;
    if (entryEnd > eocdOffset || nameLength < 1 || (flags & 0x1) !== 0 || ![0, 8].includes(compression)) {
      return "Controller profile package contains an unsupported ZIP entry";
    }

    let rawPath;
    try {
      rawPath = decoder.decode(bytes.slice(offset + 46, offset + 46 + nameLength));
    } catch {
      return "Controller profile package contains a non-portable filename";
    }
    const directory = rawPath.endsWith("/");
    const path = validateControllerProfilePath(rawPath, directory);
    const kind = path ? controllerProfileEntryKind(path, directory) : "";
    const pathKey = path.toLowerCase();
    if (!path || !kind || seenPaths.has(pathKey)) {
      return "Controller profile package contains an unsupported or duplicate file";
    }
    seenPaths.add(pathKey);

    if (!directory) {
      const perFileLimit =
        kind === "profile" ? 2 * 1024 * 1024 : kind === "script" ? 256 * 1024 : 4 * 1024 * 1024;
      if (expandedSize > perFileLimit) {
        return "Controller profile package contains a file that exceeds TAPE 16 limits";
      }
      expandedBytes += expandedSize;
      if (expandedBytes > COMMUNITY_MAX_CONTROLLER_PROFILE_EXPANDED_BYTES) {
        return "Controller profile package expands beyond the 16MB TAPE 16 limit";
      }
      if (kind === "profile") {
        if (expandedSize < 1) return "Controller profile package contains an empty profile.json";
        profileCount += 1;
      }
    }
    offset = entryEnd;
  }
  if (offset !== centralOffset + centralSize || profileCount !== 1) {
    return "Controller profile package must contain one root-level profile.json";
  }
  return "";
}

function validateCommunityPackage(type, file, buffer) {
  if (!buffer.byteLength) return "File is required";
  const name = cleanString(file?.name).toLowerCase();
  if (type === "controller_profile") {
    if (!/\.tape16controller$/i.test(name)) {
      return "Upload the controller profile exported from TAPE 16 (.tape16controller)";
    }
    if (buffer.byteLength > COMMUNITY_MAX_CONTROLLER_PROFILE_COMPRESSED_BYTES) {
      return "Controller profile package must be 20MB or smaller";
    }
    if (!looksLikeZip(buffer)) return "Controller profile package must be a valid ZIP file";
    return validateControllerProfileZip(buffer);
  }
  if (type === "midi_profile") {
    if (!/\.(tape16-midi-profile|xml)$/i.test(name)) {
      return "Upload a TAPE 16 MIDI profile file (.tape16-midi-profile or .xml)";
    }
    if (buffer.byteLength > COMMUNITY_MAX_MIDI_PROFILE_BYTES) {
      return "MIDI profile file must be 5MB or smaller";
    }
    if (!looksLikeMidiProfile(buffer)) {
      return "MIDI profile file must be a readable TAPE 16 MIDI Learn profile";
    }
    return "";
  }

  if (!/\.zip$/i.test(name)) return "Upload the exported ZIP package";
  if (buffer.byteLength > COMMUNITY_MAX_PACKAGE_BYTES) return "ZIP package must be 50MB or smaller";
  if (!looksLikeZip(buffer)) return "Package must be a valid ZIP file";
  return "";
}

function communityPackageContentType(type, filename) {
  if (type === "midi_profile") return "application/xml";
  if (type === "controller_profile") return "application/zip";
  return contentTypeForFilename(filename) === "application/octet-stream"
    ? "application/zip"
    : contentTypeForFilename(filename);
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
      download_count, owner_key, owner_email, owner_order_id, created_at, updated_at
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
  const kind = communityKind(row.type);
  const basePath = `/${kind.plural}/${encodeURIComponent(row.slug)}`;
  const downloadCount = Number(row.download_count || 0);

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
    downloadCount,
    periodDownloadCount: Number(row.period_download_count ?? downloadCount),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function managedCommunityItem(row) {
  const item = publicCommunityItem(row);
  if (!item) return null;
  return {
    ...item,
    hasPreview: Boolean(row.preview_key),
    previewFilename: row.preview_filename || "",
    previewSize: Number(row.preview_size || 0),
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

function normalizeSerial(serialIn) {
  return String(serialIn || "")
    .trim()
    .toUpperCase()
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, "-")
    .replace(/[^0-9A-Z-]/g, "");
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
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Stripe-Signature,Authorization",
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

async function hmacSha256Base64Url(secret, message) {
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
  return base64UrlEncodeBytes(new Uint8Array(sig));
}

function base64UrlEncodeJson(value) {
  return base64UrlEncodeBytes(new TextEncoder().encode(JSON.stringify(value)));
}

function base64UrlEncodeBytes(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecodeString(value) {
  const base64 = cleanString(value).replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
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
