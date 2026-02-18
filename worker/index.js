const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

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

  const allowed = new Set([
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
  ]);
  if (!allowed.has(event?.type)) {
    return json({ ok: true, ignored: true, eventType: event?.type || null }, 200, origin, env);
  }

  const session = event?.data?.object || {};
  const processed = await issueOrReuseSerial({
    orderId: session.id,
    email: readSessionEmail(session),
    source: event.type,
    env,
  });

  if (!processed.ok) {
    return json({ ok: false, error: processed.error || "Unable to process checkout session" }, 400, origin, env);
  }
  console.log(`[stripe processed] order=${processed.order.orderId} issued=${processed.issued}`);

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
    return json(
      { ok: true, message: "If a matching purchase exists, the serial email has been sent." },
      200,
      origin,
      env,
    );
  }

  if (cleanEmail(order.email) !== email) {
    return json(
      { ok: true, message: "If a matching purchase exists, the serial email has been sent." },
      200,
      origin,
      env,
    );
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
      message: "If a matching purchase exists, the serial email has been sent.",
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

async function issueOrReuseSerial({ orderId, email, source, env }) {
  const cleanOrderId = cleanString(orderId);
  const cleanOrderEmail = cleanEmail(email);
  if (!cleanOrderId || !cleanOrderEmail) {
    return { ok: false, error: "Missing order ID or customer email" };
  }

  const existing = await readOrder(env, cleanOrderId);
  if (existing) {
    return { ok: true, issued: false, order: existing };
  }

  const order = {
    orderId: cleanOrderId,
    email: cleanOrderEmail,
    serial: createSerial(),
    source,
    createdAt: new Date().toISOString(),
  };
  await env.ORDERS_KV.put(orderKey(cleanOrderId), JSON.stringify(order));
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

function readSessionEmail(session) {
  return (
    session?.customer_details?.email ||
    session?.customer_email ||
    session?.collected_information?.email ||
    ""
  );
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
  const allowed = (env.ALLOWED_ORIGIN || "").trim();
  const outOrigin =
    !allowed ? "*" : origin && origin === allowed ? allowed : allowed;

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
