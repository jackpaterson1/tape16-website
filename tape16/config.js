window.TAPE16_SITE_CONFIG = {
  // Replace this with your live checkout URL (Stripe / Gumroad / Paddle / etc).
  buyNowUrl: "https://buy.stripe.com/aFabJ12Lrcyp0D6dyu1ck01",
  // Stripe direct checkout-session flow (recommended for Stripe).
  stripeCheckoutEnabled: false,
  // Optional custom endpoint path if different from default.
  // Example: "/stripe/create-checkout-session"
  stripeCheckoutPath: "/stripe/create-checkout-session",
  // Optional explicit return URLs. If empty, backend falls back to env/origin defaults.
  stripeSuccessUrl: "",
  stripeCancelUrl: "",
  // Point this to your demo build asset.
  demoDownloadUrl: "https://github.com/jackpaterson1/Tape-16/releases/latest/download/TAPE-16-Demo-macOS.dmg",
  // Point this to your full-license build asset.
  fullDownloadUrl: "https://github.com/jackpaterson1/TAPE-16-Public-Releases/releases/download/0.8.5/TAPE-16-v0.8.5-macOS.dmg",
  // Base URL where licensing/auto_issue_webhook.py is hosted.
  // Example: "https://licenses.tape16.com"
  serialApiBaseUrl: "https://tape16-webhook.onrender.com",
  // Optional dedicated support API. If empty, serialApiBaseUrl is used.
  supportApiBaseUrl: "https://tape16-webhook.onrender.com",
};
