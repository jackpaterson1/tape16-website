window.TAPE16_SITE_CONFIG = {
  releaseDownloadUrl: "https://github.com/jackpaterson1/TAPE-16-Public-Releases/releases/download/0.8.91v/TAPE-16-v0.8.91v-macOS.dmg",
  // Replace this with your live checkout URL (Stripe / Gumroad / Paddle / etc).
  buyNowUrl: "https://buy.stripe.com/aFabJ12Lrcyp0D6dyu1ck01",
  // Stripe direct checkout-session flow (recommended only when you host that endpoint).
  stripeCheckoutEnabled: false,
  // Optional custom endpoint path if different from default.
  // Example: "/stripe/create-checkout-session"
  stripeCheckoutPath: "/stripe/create-checkout-session",
  // Optional explicit return URLs. If empty, backend falls back to env/origin defaults.
  stripeSuccessUrl: "",
  stripeCancelUrl: "",
  // Point this to your demo build asset.
  demoDownloadUrl: "https://github.com/jackpaterson1/TAPE-16-Public-Releases/releases/download/0.8.91v/TAPE-16-v0.8.91v-macOS.dmg",
  // Point this to your full-license build asset.
  fullDownloadUrl:
    "https://github.com/jackpaterson1/TAPE-16-Public-Releases/releases/download/0.8.91v/TAPE-16-v0.8.91v-macOS.dmg",
  // Base URL where licensing/auto_issue_webhook.py is hosted.
  // Example: "https://licenses.tape16.com"
  serialApiBaseUrl: "",
  // Optional dedicated support API. If empty, serialApiBaseUrl is used.
  supportApiBaseUrl: "",
  // Account/licensing API base (Cloudflare Worker recommended).
  // Example: "https://tape16-licensing.youraccount.workers.dev"
  accountApiBaseUrl: "https://tape16-licensing.emrmusicgroup.workers.dev",
  // Latest release endpoint for displaying the current build automatically.
  latestReleaseApiUrl: "https://api.github.com/repos/jackpaterson1/TAPE-16-Public-Releases/releases/latest",
};
