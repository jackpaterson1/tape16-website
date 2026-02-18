# Cloudflare + Stripe Setup (Replace Render)

This moves webhook + serial issuing to Cloudflare Worker and keeps your site static.

## 1) Deploy Worker from this repo

1. In Cloudflare dashboard, go to **Workers & Pages**.
2. Create Worker from GitHub repo: `jackpaterson1/tape16-website`.
3. Use these build settings:
   - Root directory: `/`
   - Entry point: `worker/index.js`
4. Add a KV namespace:
   - Name: `tape16-orders`
   - Copy its namespace ID into `wrangler.toml` for `ORDERS_KV`.

## 2) Worker environment variables

Set these in Worker settings:

- `STRIPE_WEBHOOK_SECRET` = `whsec_...` (from Stripe webhook endpoint)
- `STRIPE_SECRET_KEY` = `sk_live_...`
- `STRIPE_PRICE_ID` = `price_...` (for optional `/stripe/create-checkout-session`)
- `RESEND_API_KEY` = `re_...`
- `RESEND_FROM` = `no-reply@emrmusicgroup.com`
- `ALLOWED_ORIGIN` = `https://emrmusicgroup.com`
- `PUBLIC_SITE_ORIGIN` = `https://emrmusicgroup.com`

## 3) Stripe webhook destination

In Stripe -> Developers -> Webhooks:

- Endpoint URL: `https://<your-worker-domain>/stripe/webhook`
- Events:
  - `checkout.session.completed`
  - `checkout.session.async_payment_succeeded`
  - `charge.refunded`
  - `refund.updated`

Use the endpoint signing secret for `STRIPE_WEBHOOK_SECRET`.

## 4) Update website config to Worker URL

In `config.js`, change:

- `serialApiBaseUrl`
- `supportApiBaseUrl`

to your Worker base URL, for example:

`https://tape16-api.<your-subdomain>.workers.dev`

## 5) Quick tests

1. Health:
   - `GET /healthz` returns `{"ok":true,...}`
2. Stripe webhook:
   - In Stripe, resend a recent `checkout.session.completed` event.
3. Manual resend:
   - `POST /resend-serial` with `{ "orderId": "...", "email": "..." }`

## 6) Cutover complete

After tests pass:

- Remove Render webhook URL from Stripe.
- Keep only Worker webhook endpoint enabled.
