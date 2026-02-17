window.TAPE16_SITE_CONFIG = {
  // Replace this with your live checkout URL (Stripe / Gumroad / Paddle / etc).
  buyNowUrl: "https://buy.stripe.com/5kQ6oH85L7e571u2TQ1ck00",
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
  // Base URL where licensing/auto_issue_webhook.py is hosted.
  // Example: "https://licenses.tape16.com"
  serialApiBaseUrl: "REPLACE_WITH_SERIAL_API_BASE_URL",
  // Optional dedicated support API. If empty, serialApiBaseUrl is used.
  supportApiBaseUrl: "REPLACE_WITH_SUPPORT_API_BASE_URL",
};
