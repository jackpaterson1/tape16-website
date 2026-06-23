# Cloudflare Payment + Serial Setup

Use the licensing Worker as the single production backend for Stripe, PayPal, serial issuing, activation, resend, support, refunds, and affiliate transfers.

Canonical Worker source:

```text
licensing/cloudflare-worker/src/index.ts
```

Do not subscribe `tape16-website/worker/index.js` to Stripe webhooks. That older Worker can issue serials from a separate store and can create duplicate fulfillment paths.

## 1) Deploy the Licensing Worker

In Cloudflare Workers, deploy from:

```text
licensing/cloudflare-worker
```

The Worker needs these KV bindings:

```text
LICENSES
ACTIVATIONS
```

## 2) Worker Secrets

Set these in the licensing Worker:

```text
TAPE16_LICENSE_SECRET
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_ID
RESEND_API_KEY
RESEND_FROM_EMAIL
PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET
PAYPAL_WEBHOOK_ID
PAYPAL_ENV
PAYPAL_CHECKOUT_ENABLED
```

`RESEND_FROM` is accepted as a fallback, but `RESEND_FROM_EMAIL` is the canonical variable.

## 3) Stripe Webhook

In Stripe, keep only one live fulfillment destination:

```text
https://<licensing-worker-domain>/stripe/webhook
```

Subscribe it to:

```text
checkout.session.completed
checkout.session.async_payment_succeeded
charge.refunded
refund.updated
```

Use that endpoint's signing secret as `STRIPE_WEBHOOK_SECRET`.

## 4) PayPal Webhook

In PayPal, point the webhook at:

```text
https://<licensing-worker-domain>/paypal/webhook
```

Use the resulting webhook ID as `PAYPAL_WEBHOOK_ID`.

## 5) Website Config

Point the static website at the same licensing Worker:

```js
stripeCheckoutEnabled: true,
stripeCheckoutPath: "/stripe/create-checkout-session",
serialApiBaseUrl: "https://<licensing-worker-domain>",
supportApiBaseUrl: "https://<licensing-worker-domain>",
```

## 6) Quick Tests

1. `GET /healthz` returns `{ "ok": true }`.
2. Stripe checkout creates one serial for one `cs_...` order.
3. Replaying the same Stripe event returns `issued: false` and does not mint a second serial.
4. `POST /resend-serial` with the order ID and customer email queues a serial email.
5. PayPal create/capture/webhook still issues one serial and records email status.
6. Resend shows the outgoing serial email, or the license record contains `serialEmailLastError`.
