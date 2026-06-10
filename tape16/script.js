const links = document.querySelectorAll('a[href^="#"]');

for (const link of links) {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

const config = window.TAPE16_SITE_CONFIG || {};
const buyLink = document.getElementById("buy-link");
const demoLink = document.getElementById("demo-link");
const serialForm = document.getElementById("serial-resend-form");
const serialStatus = document.getElementById("serial-form-status");
const serialSubmitBtn = document.getElementById("serial-submit-btn");
const buyStatus = document.getElementById("buy-status");
const checkoutDivider = document.getElementById("checkout-divider");
const paypalButtonContainer = document.getElementById("paypal-button-container");
const bugForm = document.getElementById("bug-report-form");
const bugStatus = document.getElementById("bug-form-status");
const bugSubmitBtn = document.getElementById("bug-submit-btn");
const featureForm = document.getElementById("feature-request-form");
const featureStatus = document.getElementById("feature-form-status");
const featureSubmitBtn = document.getElementById("feature-submit-btn");
const themeUploadForm = document.getElementById("theme-upload-form");
const themeUploadStatus = document.getElementById("theme-form-status");
const themeUploadSubmitBtn = document.getElementById("theme-submit-btn");
const themeDownloadStatus = document.getElementById("theme-download-status");
const themeLibraryGrid = document.getElementById("theme-library-grid");
const themeEmptyState = document.getElementById("theme-empty-state");
const themeSort = document.getElementById("theme-sort");
const themeSearch = document.getElementById("theme-search");
const fullDownloadLink = document.getElementById("full-download-link");
const downloadPageDemoLink = document.getElementById("download-page-demo-link");
const downloadCtaLink = document.getElementById("download-cta-link");
const getTape16Link = document.getElementById("get-tape-16-link");
const directDownloadMacLink = document.getElementById("direct-download-mac-link");
const directDownloadWindowsLink = document.getElementById("direct-download-windows-link");
const directDownloadReleaseLink = document.getElementById("direct-download-release-link");
const accountLoginForm = document.getElementById("account-login-form");
const accountStatus = document.getElementById("account-status");
const accountLoginBtn = document.getElementById("account-login-btn");
const accountRefreshBtn = document.getElementById("account-refresh-btn");
const accountLogoutBtn = document.getElementById("account-logout-btn");
const accountPanel = document.getElementById("account-panel");
const accountSummary = document.getElementById("account-summary");
const accountActivations = document.getElementById("account-activations");
const currentBuildLabel = document.getElementById("current-build-label");
const currentBuildDateLabel = document.getElementById("current-build-date-label");
const checkoutResultSection = document.getElementById("checkout-result");
const checkoutResultEyebrow = document.getElementById("checkout-result-eyebrow");
const checkoutResultTitle = document.getElementById("checkout-result-title");
const checkoutResultCopy = document.getElementById("checkout-result-copy");
const checkoutResultCardTitle = document.getElementById("checkout-result-card-title");
const checkoutResultCardCopy = document.getElementById("checkout-result-card-copy");
const checkoutResultPrimaryLink = document.getElementById("checkout-result-primary-link");

const ACCOUNT_SESSION_KEY = "tape16_account_session_v1";
const BUILD_VERSION_CACHE_KEY = "tape16_latest_build_cache_v1";
const BUILD_VERSION_CACHE_TTL_MS = 10 * 60 * 1000;
const REDDIT_MATCH_STORAGE_KEY = "tape16_reddit_match_v1";
const PROMOTEKIT_REFERRAL_STORAGE_KEY = "tape16_promotekit_referral_v1";

function configUrl(value) {
  if (typeof value !== "string") return "";
  const out = value.trim();
  if (!out || out.includes("REPLACE_WITH_")) return "";
  return out;
}

function sanitizeMatchValue(value) {
  const out = String(value || "").trim();
  return out || "";
}

function sanitizePromoteKitReferral(value) {
  const out = String(value || "").trim();
  if (!out) return "";
  const lower = out.toLowerCase();
  if (lower === "null" || lower === "undefined") return "";
  return out;
}

function readCookieValue(cookieName) {
  if (!cookieName) return "";
  const prefix = `${cookieName}=`;
  const cookies = String(document.cookie || "").split(/;\s*/);
  for (const cookie of cookies) {
    if (!cookie.startsWith(prefix)) continue;
    return decodeURIComponent(cookie.slice(prefix.length));
  }
  return "";
}

function readReferralFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const candidates = [
      params.get("promotekit_referral"),
      params.get("ref"),
      params.get("referral"),
      params.get("client_reference_id"),
    ];
    for (const candidate of candidates) {
      const value = sanitizePromoteKitReferral(candidate);
      if (value) return value;
    }
  } catch (error) {
    // Ignore malformed URLs.
  }
  return "";
}

function readStoredPromoteKitReferral() {
  try {
    const raw = localStorage.getItem(PROMOTEKIT_REFERRAL_STORAGE_KEY);
    return sanitizePromoteKitReferral(raw);
  } catch (error) {
    return "";
  }
}

function writeStoredPromoteKitReferral(referralId) {
  const value = sanitizePromoteKitReferral(referralId);
  if (!value) return;
  try {
    localStorage.setItem(PROMOTEKIT_REFERRAL_STORAGE_KEY, value);
  } catch (error) {
    // Ignore storage errors.
  }
}

function resolvePromoteKitReferral() {
  const urlReferral = readReferralFromUrl();
  if (urlReferral) {
    writeStoredPromoteKitReferral(urlReferral);
    return urlReferral;
  }

  const liveReferral = sanitizePromoteKitReferral(window.promotekit_referral);
  if (liveReferral) {
    writeStoredPromoteKitReferral(liveReferral);
    return liveReferral;
  }

  const cookieReferral = sanitizePromoteKitReferral(readCookieValue("promotekit_referral"));
  if (cookieReferral) {
    writeStoredPromoteKitReferral(cookieReferral);
    return cookieReferral;
  }

  return readStoredPromoteKitReferral();
}

function attachPromoteKitReferral(linkEl) {
  if (!linkEl) return;

  const referralId = resolvePromoteKitReferral();
  if (!referralId) return;

  const oldBuyUrl = linkEl.getAttribute("href") || "";
  if (!oldBuyUrl.startsWith("https://buy.stripe.com/") || oldBuyUrl.includes("client_reference_id=")) {
    return;
  }

  const separator = oldBuyUrl.includes("?") ? "&" : "?";
  const newBuyUrl = oldBuyUrl + separator + "client_reference_id=" + encodeURIComponent(referralId);
  linkEl.setAttribute("href", newBuyUrl);
}

function refreshPromoteKitRefs() {
  document.querySelectorAll('a[href^="https://buy.stripe.com/"]').forEach((link) => {
    attachPromoteKitReferral(link);
  });

  const referralId = resolvePromoteKitReferral();
  if (!referralId) return;

  document.querySelectorAll("[pricing-table-id]").forEach((element) => {
    element.setAttribute("client-reference-id", referralId);
  });

  document.querySelectorAll("[buy-button-id]").forEach((element) => {
    element.setAttribute("client-reference-id", referralId);
  });
}

function startPromoteKitTracking() {
  const run = () => {
    refreshPromoteKitRefs();

    let pollCount = 0;
    const pollInterval = window.setInterval(() => {
      refreshPromoteKitRefs();
      pollCount += 1;
      if (pollCount >= 10 || readStoredPromoteKitReferral()) {
        window.clearInterval(pollInterval);
      }
    }, 400);

    window.addEventListener("focus", refreshPromoteKitRefs, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        refreshPromoteKitRefs();
      }
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
}

function saveRedditMatch(payload) {
  if (!payload || typeof payload !== "object") return;
  try {
    const raw = localStorage.getItem(REDDIT_MATCH_STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : {};
    const next = {
      email: sanitizeMatchValue(payload.email || existing.email || "").toLowerCase(),
      phoneNumber: sanitizeMatchValue(payload.phoneNumber || existing.phoneNumber || ""),
      externalId: sanitizeMatchValue(payload.externalId || existing.externalId || ""),
      idfa: sanitizeMatchValue(payload.idfa || existing.idfa || ""),
      aaid: sanitizeMatchValue(payload.aaid || existing.aaid || ""),
      updatedAt: Date.now(),
    };
    localStorage.setItem(REDDIT_MATCH_STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    // Ignore storage errors.
  }
}

function configureDirectDownloadLink(linkEl, downloadUrl) {
  if (!linkEl) return;

  linkEl.removeAttribute("target");
  linkEl.removeAttribute("rel");

  if (downloadUrl) {
    linkEl.href = downloadUrl;
    linkEl.removeAttribute("aria-disabled");
    if (linkEl.dataset.boundMissingClick === "1") {
      linkEl.dataset.missingDownload = "0";
    }
    return;
  }

  linkEl.href = "#";
  linkEl.setAttribute("aria-disabled", "true");
  linkEl.dataset.missingDownload = "1";
  if (linkEl.dataset.boundMissingClick === "1") return;

  linkEl.addEventListener("click", (event) => {
    if (linkEl.dataset.missingDownload === "1") {
      event.preventDefault();
      window.alert("Download is not configured yet. Please contact support.");
    }
  });
  linkEl.dataset.boundMissingClick = "1";
}

function trackAnalyticsEvent(eventName, params) {
  if (typeof window.gtag !== "function") return;
  try {
    window.gtag("event", eventName, params || {});
  } catch (error) {
    // Ignore analytics dispatch failures.
  }
}

function bindDownloadClickTracking(linkEl, buttonName) {
  if (!linkEl || linkEl.dataset.boundAnalyticsClick === "1") return;
  linkEl.addEventListener("click", () => {
    trackAnalyticsEvent("download_click", {
      button_name: buttonName,
      destination: linkEl.href || "",
      page_location: window.location.href,
    });
  });
  linkEl.dataset.boundAnalyticsClick = "1";
}

function setBuyStatus(message, isError) {
  if (!buyStatus) return;
  buyStatus.textContent = message;
  buyStatus.style.color = isError ? "#ff9d87" : "#f7c34b";
}

function checkoutApiBaseUrl() {
  return (
    configUrl(config.supportApiBaseUrl) ||
    configUrl(config.accountApiBaseUrl) ||
    configUrl(config.serialApiBaseUrl) ||
    ""
  );
}

function checkoutEndpoint(path) {
  const apiBase = checkoutApiBaseUrl();
  const cleanPath = configUrl(path);
  if (!apiBase || !cleanPath) return "";
  return `${apiBase.replace(/\/+$/, "")}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
}

function loadScriptOnce(src, id) {
  return new Promise((resolve, reject) => {
    if (id) {
      const existing = document.getElementById(id);
      if (existing) {
        existing.addEventListener("load", () => resolve(existing), { once: true });
        existing.addEventListener("error", () => reject(new Error("Script load failed")), { once: true });
        if (existing.dataset.loaded === "1") resolve(existing);
        return;
      }
    }

    const script = document.createElement("script");
    if (id) script.id = id;
    script.src = src;
    script.async = true;
    script.addEventListener("load", () => {
      script.dataset.loaded = "1";
      resolve(script);
    });
    script.addEventListener("error", () => reject(new Error("Script load failed")));
    document.head.appendChild(script);
  });
}

async function loadPayPalSdk() {
  if (window.paypal && typeof window.paypal.Buttons === "function") return window.paypal;
  const clientId = configUrl(config.paypalClientId);
  if (!clientId) throw new Error("PayPal client ID is not configured.");
  const currency = String(config.paypalCurrency || "USD").trim().toUpperCase() || "USD";
  const params = new URLSearchParams({
    "client-id": clientId,
    currency,
    intent: "capture",
    components: "buttons",
  });
  await loadScriptOnce(`https://www.paypal.com/sdk/js?${params.toString()}`, "paypal-sdk");
  if (!window.paypal || typeof window.paypal.Buttons !== "function") {
    throw new Error("PayPal SDK did not initialize.");
  }
  return window.paypal;
}

function renderCheckoutResult() {
  if (!checkoutResultSection || !checkoutResultTitle || !checkoutResultCopy) return;

  const params = new URLSearchParams(window.location.search);
  const state = String(params.get("checkout") || "").trim().toLowerCase();
  if (!state) return;

  checkoutResultSection.hidden = false;

  if (state === "success") {
    if (checkoutResultEyebrow) checkoutResultEyebrow.textContent = "Payment complete";
    checkoutResultTitle.textContent = "Thanks for your purchase.";
    checkoutResultCopy.textContent =
      "Your payment went through. Your serial will be emailed automatically.";
    if (checkoutResultCardTitle) checkoutResultCardTitle.textContent = "Next step";
    if (checkoutResultCardCopy) {
      checkoutResultCardCopy.textContent =
        "Check your inbox for the serial email, then open the downloads page if you need the installer.";
    }
    if (checkoutResultPrimaryLink) {
      checkoutResultPrimaryLink.textContent = "Open Downloads";
      checkoutResultPrimaryLink.href = "download.html";
    }
    return;
  }

  if (state === "cancel") {
    if (checkoutResultEyebrow) checkoutResultEyebrow.textContent = "Checkout cancelled";
    checkoutResultTitle.textContent = "No charge was made.";
    checkoutResultCopy.textContent =
      "You backed out of checkout before paying. You can return to the buy page whenever you are ready.";
    if (checkoutResultCardTitle) checkoutResultCardTitle.textContent = "Try again";
    if (checkoutResultCardCopy) {
      checkoutResultCardCopy.textContent =
        "Use the buy page to restart secure checkout.";
    }
    if (checkoutResultPrimaryLink) {
      checkoutResultPrimaryLink.textContent = "Back to Buy Page";
      checkoutResultPrimaryLink.href = "buy.html";
    }
    return;
  }

  checkoutResultSection.hidden = true;
}

function formatReleaseTag(tag) {
  const value = String(tag || "").trim();
  if (!value) return "";
  return value.startsWith("v") ? value : `v${value}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderBuildLabel(label) {
  if (!currentBuildLabel) return;
  const text = String(label || "").trim();
  if (!text) {
    currentBuildLabel.textContent = "";
    return;
  }
  const hasTest = /test/i.test(text);
  if (!hasTest) {
    currentBuildLabel.textContent = text;
    return;
  }
  currentBuildLabel.innerHTML = escapeHtml(text).replace(
    /(test)/gi,
    '<span class="build-test">$1</span>'
  );
}

function formatReleaseDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function renderBuildDate(value) {
  if (!currentBuildDateLabel) return;
  const formatted = formatReleaseDate(value);
  currentBuildDateLabel.textContent = formatted || "Last updated";
}

function readCachedBuildLabel() {
  try {
    const raw = localStorage.getItem(BUILD_VERSION_CACHE_KEY);
    if (!raw) return { label: "", date: "" };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.ts !== "number") return { label: "", date: "" };
    if (Date.now() - parsed.ts > BUILD_VERSION_CACHE_TTL_MS) return { label: "", date: "" };
    if (typeof parsed.label !== "string") return { label: "", date: "" };
    const date = typeof parsed.date === "string" ? parsed.date : "";
    return { label: parsed.label, date };
  } catch (error) {
    return { label: "", date: "" };
  }
}

function writeCachedBuildLabel(label, date) {
  try {
    localStorage.setItem(
      BUILD_VERSION_CACHE_KEY,
      JSON.stringify({ label, date, ts: Date.now() })
    );
  } catch (error) {
    // Ignore storage errors (private mode / disabled storage).
  }
}

async function updateCurrentBuildLabel() {
  if (!currentBuildLabel) return;

  const cached = readCachedBuildLabel();
  if (cached.label) {
    renderBuildLabel(cached.label);
  }
  if (cached.date) {
    renderBuildDate(cached.date);
  }

  const latestReleaseApiUrl =
    configUrl(config.latestReleaseApiUrl) ||
    "https://api.github.com/repos/jackpaterson1/TAPE-16-Public-Releases/releases/latest";

  try {
    const response = await fetch(latestReleaseApiUrl, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) throw new Error("Could not fetch latest release");
    const body = await response.json().catch(() => ({}));
    const label = formatReleaseTag(body.tag_name);
    if (!label) throw new Error("No tag name in release payload");
    const date = String(body.updated_at || body.published_at || body.created_at || "").trim();
    renderBuildLabel(label);
    renderBuildDate(date);
    writeCachedBuildLabel(label, date);
  } catch (error) {
    if (!cached.label && !currentBuildLabel.textContent.trim()) {
      renderBuildLabel("Latest on GitHub");
    }
    if (!cached.date && !currentBuildDateLabel.textContent.trim()) {
      renderBuildDate("");
    }
  }
}

updateCurrentBuildLabel();
renderCheckoutResult();

if (buyLink) {
  const fallbackBuyUrl =
    "https://buy.stripe.com/28E9AT4Tz7e50D6bqm1ck02";
  const checkoutUrl = configUrl(config.buyNowUrl);
  buyLink.href = checkoutUrl || fallbackBuyUrl;

  const stripeCheckoutEnabled =
    config.stripeCheckoutEnabled === true || String(config.stripeCheckoutEnabled) === "true";
  if (stripeCheckoutEnabled) {
    buyLink.removeAttribute("target");
    buyLink.addEventListener("click", async (event) => {
      event.preventDefault();

      const apiBase = checkoutApiBaseUrl();
      if (!apiBase) {
        if (checkoutUrl) {
          window.open(checkoutUrl, "_blank", "noopener,noreferrer");
          return;
        }
        setBuyStatus("Checkout service is not configured yet.", true);
        return;
      }

      const path = configUrl(config.stripeCheckoutPath) || "/stripe/create-checkout-session";
      const endpoint = `${apiBase.replace(/\/+$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
      const payload = {
        successUrl: configUrl(config.stripeSuccessUrl),
        cancelUrl: configUrl(config.stripeCancelUrl),
      };

      buyLink.setAttribute("disabled", "disabled");
      setBuyStatus("Starting secure checkout...", false);
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok || !body.ok || !body.url) {
          throw new Error(body.error || "Checkout start failed");
        }
        window.location.assign(body.url);
      } catch (error) {
        setBuyStatus("Could not start Stripe checkout. Try again in a moment.", true);
        if (checkoutUrl) {
          window.open(checkoutUrl, "_blank", "noopener,noreferrer");
        }
      } finally {
        buyLink.removeAttribute("disabled");
      }
    });
  }
}

async function configurePayPalCheckout() {
  if (!paypalButtonContainer) return;

  const paypalCheckoutEnabled =
    config.paypalCheckoutEnabled === true || String(config.paypalCheckoutEnabled) === "true";
  const createOrderEndpoint = checkoutEndpoint(config.paypalCreateOrderPath || "/paypal/create-order");
  const captureOrderEndpoint = checkoutEndpoint(config.paypalCaptureOrderPath || "/paypal/capture-order");

  if (!paypalCheckoutEnabled) {
    paypalButtonContainer.hidden = true;
    if (checkoutDivider) checkoutDivider.hidden = true;
    return;
  }

  if (!createOrderEndpoint || !captureOrderEndpoint) {
    setBuyStatus("PayPal checkout is not configured yet.", true);
    return;
  }

  try {
    const paypal = await loadPayPalSdk();
    paypalButtonContainer.hidden = false;
    if (checkoutDivider) checkoutDivider.hidden = false;
    const buttonOptions = {
      style: {
        layout: "vertical",
        color: "gold",
        shape: "rect",
        label: "paypal",
        height: 44,
      },
      async createOrder() {
        setBuyStatus("Starting PayPal checkout...", false);
        const response = await fetch(createOrderEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientReferenceId: `site-${Date.now()}` }),
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok || !body.ok || !body.orderId) {
          throw new Error(body.error || "PayPal order creation failed");
        }
        return body.orderId;
      },
      async onApprove(data) {
        setBuyStatus("Finalising PayPal payment...", false);
        const response = await fetch(captureOrderEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: data.orderID }),
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok || !body.ok) {
          throw new Error(body.error || "PayPal capture failed");
        }
        setBuyStatus("Payment complete. Your serial email is on the way.", false);
        window.location.assign("success.html?checkout=success");
      },
      onCancel() {
        setBuyStatus("PayPal checkout cancelled.", true);
      },
      onError(error) {
        console.error("PayPal checkout error", error);
        setBuyStatus("Could not complete PayPal checkout. Try again in a moment.", true);
      },
    };

    if (paypal.FUNDING && paypal.FUNDING.PAYPAL) {
      buttonOptions.fundingSource = paypal.FUNDING.PAYPAL;
    }

    paypal
      .Buttons(buttonOptions)
      .render(paypalButtonContainer);
  } catch (error) {
    console.error("PayPal setup error", error);
    paypalButtonContainer.hidden = true;
    if (checkoutDivider) checkoutDivider.hidden = true;
    setBuyStatus("PayPal checkout is not available yet.", true);
  }
}

configurePayPalCheckout();

const pinnedReleaseDownloadUrl =
  "https://github.com/jackpaterson1/TAPE-16-Public-Releases/releases/download/0.9.272/TAPE-16-v0.9.272-macOS.dmg";
const pinnedWindowsDownloadUrl =
  "https://github.com/jackpaterson1/TAPE-16-Public-Releases/releases/download/0.9.272/TAPE-16-v0.9.272-Windows-Setup.zip";
const pinnedGithubReleaseUrl =
  "https://github.com/jackpaterson1/TAPE-16-Public-Releases/releases/tag/0.9.272";
const releaseDownloadUrl = configUrl(config.releaseDownloadUrl) || pinnedReleaseDownloadUrl;
const windowsDownloadUrl = configUrl(config.windowsDownloadUrl) || pinnedWindowsDownloadUrl;
const githubReleaseUrl = configUrl(config.githubReleaseUrl) || pinnedGithubReleaseUrl;

if (demoLink) {
  const demoUrl = releaseDownloadUrl;
  configureDirectDownloadLink(demoLink, demoUrl);
}

if (fullDownloadLink) {
  const fullUrl = releaseDownloadUrl;
  configureDirectDownloadLink(fullDownloadLink, fullUrl);
}

if (downloadPageDemoLink) {
  configureDirectDownloadLink(downloadPageDemoLink, windowsDownloadUrl);
}

if (downloadCtaLink) {
  const fullUrl = releaseDownloadUrl;
  configureDirectDownloadLink(downloadCtaLink, fullUrl);
}

if (getTape16Link) {
  configureDirectDownloadLink(getTape16Link, releaseDownloadUrl);
}

if (directDownloadMacLink) {
  configureDirectDownloadLink(directDownloadMacLink, releaseDownloadUrl);
}

if (directDownloadWindowsLink) {
  configureDirectDownloadLink(directDownloadWindowsLink, windowsDownloadUrl);
}

if (directDownloadReleaseLink) {
  configureDirectDownloadLink(directDownloadReleaseLink, githubReleaseUrl);
}

bindDownloadClickTracking(getTape16Link, "Get TAPE 16");
bindDownloadClickTracking(downloadCtaLink, "Download Full Installer");
bindDownloadClickTracking(fullDownloadLink, "Download Full");
bindDownloadClickTracking(downloadPageDemoLink, "Download Windows");
bindDownloadClickTracking(demoLink, "Download Demo");

startPromoteKitTracking();
bindDownloadClickTracking(directDownloadMacLink, "Direct Download Mac");
bindDownloadClickTracking(directDownloadWindowsLink, "Direct Download Windows");
bindDownloadClickTracking(directDownloadReleaseLink, "Direct Downloads");

function setSerialStatus(message, isError) {
  if (!serialStatus) return;
  serialStatus.textContent = message;
  serialStatus.style.color = isError ? "#ff9d87" : "#f7c34b";
}

if (serialForm) {
  serialForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const baseUrl =
      configUrl(config.serialApiBaseUrl);
    if (!baseUrl) {
      setSerialStatus("Serial service is not configured yet. Please contact support.", true);
      return;
    }

    const formData = new FormData(serialForm);
    const orderId = String(formData.get("orderId") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    if (!orderId || !email) {
      setSerialStatus("Enter your order ID and purchase email.", true);
      return;
    }
    saveRedditMatch({ email });

    const endpoint = `${baseUrl.replace(/\/+$/, "")}/resend-serial`;
    if (serialSubmitBtn) serialSubmitBtn.setAttribute("disabled", "disabled");
    setSerialStatus("Sending request...", false);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, email }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.ok) {
        throw new Error(body.error || "Request failed");
      }
      setSerialStatus("If your purchase matches, your serial email is on the way.", false);
      serialForm.reset();
    } catch (error) {
      setSerialStatus("Could not submit request right now. Please try again shortly.", true);
    } finally {
      if (serialSubmitBtn) serialSubmitBtn.removeAttribute("disabled");
    }
  });
}

function setBugStatus(message, isError) {
  if (!bugStatus) return;
  bugStatus.textContent = message;
  bugStatus.style.color = isError ? "#ff9d87" : "#f7c34b";
}

if (bugForm) {
  bugForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const supportBase =
      configUrl(config.supportApiBaseUrl) ||
      configUrl(config.serialApiBaseUrl) ||
      "";
    if (!supportBase) {
      setBugStatus("Bug service is not configured yet. Please contact support.", true);
      return;
    }

    const formData = new FormData(bugForm);
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const summary = String(formData.get("summary") || "").trim();
    const files = Array.from(
      document.getElementById("bug-attachments")?.files || []
    );

    if (!email || !summary) {
      setBugStatus("Email and summary are required.", true);
      return;
    }
    saveRedditMatch({ email });
    if (files.length > 5) {
      setBugStatus("You can upload up to 5 attachments.", true);
      return;
    }
    const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
    if (totalSize > 25 * 1024 * 1024) {
      setBugStatus("Attachments exceed 25MB total.", true);
      return;
    }

    if (bugSubmitBtn) bugSubmitBtn.setAttribute("disabled", "disabled");
    setBugStatus("Submitting bug report...", false);

    try {
      const endpoint = `${supportBase.replace(/\/+$/, "")}/submit-bug`;
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.ok) {
        throw new Error(body.error || "Submit failed");
      }
      const reportIdText = body.reportId ? ` (${body.reportId})` : "";
      setBugStatus(`Bug report submitted${reportIdText}. Thank you.`, false);
      bugForm.reset();
    } catch (error) {
      setBugStatus("Could not submit bug report right now. Please try again shortly.", true);
    } finally {
      if (bugSubmitBtn) bugSubmitBtn.removeAttribute("disabled");
    }
  });
}

function setFeatureStatus(message, isError) {
  if (!featureStatus) return;
  featureStatus.textContent = message;
  featureStatus.style.color = isError ? "#ff9d87" : "#f7c34b";
}

if (featureForm) {
  featureForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const supportBase =
      configUrl(config.supportApiBaseUrl) ||
      configUrl(config.serialApiBaseUrl) ||
      "";
    if (!supportBase) {
      setFeatureStatus("Feature service is not configured yet. Please contact support.", true);
      return;
    }

    const formData = new FormData(featureForm);
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const summary = String(formData.get("summary") || "").trim();
    const files = Array.from(document.getElementById("feature-attachments")?.files || []);

    if (!email || !summary) {
      setFeatureStatus("Email and feature summary are required.", true);
      return;
    }
    saveRedditMatch({ email });
    if (files.length > 5) {
      setFeatureStatus("You can upload up to 5 attachments.", true);
      return;
    }
    const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
    if (totalSize > 25 * 1024 * 1024) {
      setFeatureStatus("Attachments exceed 25MB total.", true);
      return;
    }

    if (featureSubmitBtn) featureSubmitBtn.setAttribute("disabled", "disabled");
    setFeatureStatus("Submitting feature request...", false);

    try {
      const endpoint = `${supportBase.replace(/\/+$/, "")}/submit-feature`;
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.ok) {
        throw new Error(body.error || "Submit failed");
      }
      const requestIdText = body.requestId ? ` (${body.requestId})` : "";
      setFeatureStatus(`Feature request submitted${requestIdText}. Thank you.`, false);
      featureForm.reset();
    } catch (error) {
      setFeatureStatus("Could not submit feature request right now. Please try again shortly.", true);
    } finally {
      if (featureSubmitBtn) featureSubmitBtn.removeAttribute("disabled");
    }
  });
}

function setThemeUploadStatus(message, isError) {
  if (!themeUploadStatus) return;
  themeUploadStatus.textContent = message;
  themeUploadStatus.style.color = isError ? "#ff9d87" : "#f7c34b";
}

function setThemeDownloadStatus(message, isError) {
  if (!themeDownloadStatus) return;
  themeDownloadStatus.textContent = message;
  themeDownloadStatus.style.color = isError ? "#ff9d87" : "#f7c34b";
}

function themeApiBaseUrl() {
  return (
    configUrl(config.themeApiBaseUrl) ||
    configUrl(config.supportApiBaseUrl) ||
    configUrl(config.serialApiBaseUrl) ||
    ""
  );
}

function themeApiUrl(path) {
  const value = String(path || "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  const base = themeApiBaseUrl();
  if (!base) return value;
  return `${base.replace(/\/+$/, "")}/${value.replace(/^\/+/, "")}`;
}

function formatFileSize(bytes) {
  const size = Number(bytes || 0);
  if (!Number.isFinite(size) || size <= 0) return "";
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${Math.round((size / (1024 * 1024)) * 10) / 10} MB`;
}

function themeCardHtml(item) {
  const tags = Array.isArray(item.tags) ? item.tags.filter(Boolean) : [];
  const downloadUrl = themeApiUrl(item.downloadUrl);
  const previewUrl = themeApiUrl(item.previewUrl);
  const size = formatFileSize(item.packageSize);
  const downloads = Number(item.downloadCount || 0);
  const periodDownloads = Number(item.periodDownloadCount || 0);
  const meta = [
    item.appVersion ? `TAPE 16 ${item.appVersion}` : "",
    size,
    downloads === 1 ? "1 download" : `${downloads} downloads`,
    periodDownloads === 1 ? "1 in selected range" : `${periodDownloads} in selected range`,
  ].filter(Boolean);
  const preview = previewUrl
    ? `<img src="${escapeHtml(previewUrl)}" alt="${escapeHtml(item.name)} preview" loading="lazy" />`
    : `<span>${escapeHtml(String(item.packageFilename || "ZIP").replace(/^.*\./, "").toUpperCase())}</span>`;

  return `
    <article
      class="theme-card"
      data-theme-id="${escapeHtml(item.id || item.slug || "")}"
      data-theme-name="${escapeHtml(item.name || "")}"
      data-theme-creator="${escapeHtml(item.creatorName || "")}"
      data-theme-tags="${escapeHtml(tags.join(" "))}"
    >
      <div class="theme-preview">${preview}</div>
      <div class="theme-card-head">
        <div>
          <h3>${escapeHtml(item.name || "Untitled Theme")}</h3>
          <p>By ${escapeHtml(item.creatorName || "Unknown creator")}</p>
        </div>
      </div>
      <p>${escapeHtml(item.description || "No description supplied.")}</p>
      <div class="theme-meta">
        ${meta.map((value) => `<span>${escapeHtml(value)}</span>`).join("")}
        ${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
      </div>
      <a class="btn btn-primary theme-download" href="${escapeHtml(downloadUrl)}" data-theme-download>Download ZIP</a>
    </article>
  `;
}

function renderThemeLibrary(items) {
  if (!themeLibraryGrid) return;
  const themes = Array.isArray(items) ? items : [];
  themeLibraryGrid.innerHTML = themes.map(themeCardHtml).join("");
  if (themeEmptyState) themeEmptyState.hidden = themes.length > 0;
  themeLibraryGrid.hidden = themes.length === 0;
  bindThemeDownloads();
  if (themeSearch) themeSearch.dispatchEvent(new Event("input"));
}

async function loadThemeLibrary() {
  if (!themeLibraryGrid) return;
  const supportBase = themeApiBaseUrl();
  if (!supportBase) {
    setThemeDownloadStatus("Theme library service is not configured yet.", true);
    return;
  }

  try {
    const sort = themeSort ? String(themeSort.value || "popular_1_month") : "popular_1_month";
    const response = await fetch(`${supportBase.replace(/\/+$/, "")}/themes?sort=${encodeURIComponent(sort)}`);
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.ok) throw new Error(body.error || "Theme library failed");
    renderThemeLibrary(body.items || []);
    setThemeDownloadStatus("", false);
  } catch (error) {
    setThemeDownloadStatus("Could not load themes right now. Please try again shortly.", true);
  }
}

function bindThemeSearch() {
  if (!themeSearch) return;

  const applyThemeSearch = () => {
    const query = String(themeSearch.value || "").trim().toLowerCase();
    document.querySelectorAll(".theme-card[data-theme-id]").forEach((card) => {
      const haystack = [
        card.dataset.themeName,
        card.dataset.themeCreator,
        card.dataset.themeTags,
      ].join(" ").toLowerCase();
      card.hidden = query ? !haystack.includes(query) : false;
    });
  };

  themeSearch.addEventListener("input", applyThemeSearch);
  themeSearch.addEventListener("change", applyThemeSearch);
}

function bindThemeSort() {
  if (!themeSort) return;
  themeSort.addEventListener("change", () => {
    loadThemeLibrary();
    trackAnalyticsEvent("theme_sort_change", {
      sort: themeSort.value,
      page_location: window.location.href,
    });
  });
}

function bindThemeDownloads() {
  document.querySelectorAll("[data-theme-download]").forEach((link) => {
    if (link.dataset.bound === "true") return;
    link.dataset.bound = "true";
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href") || "";
      const card = link.closest(".theme-card");
      const themeId = card?.dataset.themeId || "";

      trackAnalyticsEvent("theme_download_click", {
        theme_id: themeId,
        destination: href,
        page_location: window.location.href,
      });

      if (href && href !== "#") return;

      event.preventDefault();
      setThemeDownloadStatus(
        "Theme files are not attached yet. Add each theme file URL to enable downloads.",
        true
      );
    });
  });
}

if (themeUploadForm) {
  themeUploadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const supportBase = themeApiBaseUrl();
    if (!supportBase) {
      setThemeUploadStatus("Theme upload service is not configured yet. Please contact support.", true);
      return;
    }

    const formData = new FormData(themeUploadForm);
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const creator = String(formData.get("creator") || "").trim();
    const themeName = String(formData.get("themeName") || "").trim();
    const themeFile = document.getElementById("theme-file")?.files?.[0] || null;
    const previewImage = document.getElementById("theme-preview-image")?.files?.[0] || null;

    if (!email || !creator || !themeName || !themeFile) {
      setThemeUploadStatus("Email, creator name, theme name, and theme file are required.", true);
      return;
    }
    saveRedditMatch({ email });
    if (!/\.zip$/i.test(themeFile.name || "")) {
      setThemeUploadStatus("Upload the ZIP exported from the TAPE 16 Themes window.", true);
      return;
    }

    const files = [themeFile, previewImage].filter(Boolean);
    const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
    if (totalSize > 50 * 1024 * 1024) {
      setThemeUploadStatus("Theme upload exceeds 50MB total.", true);
      return;
    }

    if (themeUploadSubmitBtn) themeUploadSubmitBtn.setAttribute("disabled", "disabled");
    setThemeUploadStatus("Submitting theme...", false);

    try {
      const endpoint = `${supportBase.replace(/\/+$/, "")}/submit-theme`;
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.ok) {
        const message = String(body.error || "");
        throw new Error(
          message.includes("COMMUNITY_BUCKET") || message.includes("file storage")
            ? "Theme file storage is not enabled yet. Please try again later."
            : message || "Submit failed"
        );
      }
      const themeIdText = body.themeId ? ` (${body.themeId})` : "";
      setThemeUploadStatus(`Theme uploaded${themeIdText}. Thank you.`, false);
      themeUploadForm.reset();
      await loadThemeLibrary();
    } catch (error) {
      setThemeUploadStatus(
        error instanceof Error && error.message
          ? error.message
          : "Could not submit theme right now. Please try again shortly.",
        true
      );
    } finally {
      if (themeUploadSubmitBtn) themeUploadSubmitBtn.removeAttribute("disabled");
    }
  });
}

bindThemeSearch();
bindThemeSort();
loadThemeLibrary();

function accountApiBaseUrl() {
  return configUrl(config.accountApiBaseUrl) || "";
}

function setAccountStatus(message, isError) {
  if (!accountStatus) return;
  accountStatus.textContent = message;
  accountStatus.style.color = isError ? "#ff9d87" : "#f7c34b";
}

function normalizeSerial(serialIn) {
  return String(serialIn || "")
    .trim()
    .toUpperCase()
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, "-")
    .replace(/[^0-9A-Z-]/g, "");
}

function readAccountSession() {
  try {
    const raw = localStorage.getItem(ACCOUNT_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.token || !parsed.expiresAt || Date.now() >= Number(parsed.expiresAt)) {
      return null;
    }
    return parsed;
  } catch (error) {
    return null;
  }
}

function writeAccountSession(session) {
  try {
    localStorage.setItem(ACCOUNT_SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    // Ignore storage errors; account still works for current page session.
  }
}

function clearAccountSession() {
  try {
    localStorage.removeItem(ACCOUNT_SESSION_KEY);
  } catch (error) {
    // Ignore storage errors.
  }
}

function setAccountLoading(loading) {
  if (accountLoginBtn) accountLoginBtn.disabled = loading;
  if (accountRefreshBtn) accountRefreshBtn.disabled = loading;
}

function renderAccountPanel(payload) {
  if (!accountPanel || !accountSummary || !accountActivations) return;
  const serial = payload.serial || "";
  const used = Number(payload.usedActivations || 0);
  const max = Number(payload.maxActivations || 0);
  accountSummary.textContent = `Serial ${serial} • ${used} / ${max} activations used`;

  const rows = Array.isArray(payload.activations) ? payload.activations : [];
  if (rows.length === 0) {
    accountActivations.innerHTML = `<p class="activation-empty">No active machines yet.</p>`;
  } else {
    accountActivations.innerHTML = rows
      .map((item) => {
        const machineId = String(item.machineId || "");
        const activatedAt = item.activatedAt
          ? new Date(item.activatedAt).toLocaleString()
          : "Unknown";
        return `
          <div class="activation-item">
            <div class="activation-meta">
              <span class="activation-machine">${machineId}</span>
              <span class="activation-time">Activated: ${activatedAt}</span>
            </div>
            <button class="btn btn-ghost account-deactivate-btn" data-machine-id="${machineId}" type="button">Deactivate</button>
          </div>
        `;
      })
      .join("");
  }

  accountPanel.hidden = false;
}

async function fetchAccountActivations(session, options = {}) {
  const baseUrl = accountApiBaseUrl();
  if (!baseUrl) {
    setAccountStatus("Account service is not configured yet.", true);
    return;
  }
  setAccountLoading(true);
  if (!options.silent) {
    setAccountStatus("Loading licenses...", false);
  }
  try {
    const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/customer/activations`, {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    });
    const body = await response.json().catch(() => ({}));
    if (response.status === 401) {
      clearAccountSession();
      if (accountPanel) accountPanel.hidden = true;
      setAccountStatus("Session expired. Please sign in again.", true);
      return;
    }
    if (!response.ok || !body.ok) {
      throw new Error(body.error || "Could not load account");
    }
    renderAccountPanel(body);
    setAccountStatus("Account loaded.", false);
  } catch (error) {
    setAccountStatus("Could not load account right now. Please try again shortly.", true);
  } finally {
    setAccountLoading(false);
  }
}

async function loginAccount(credentials) {
  const baseUrl = accountApiBaseUrl();
  if (!baseUrl) {
    setAccountStatus("Account service is not configured yet.", true);
    return;
  }
  setAccountLoading(true);
  setAccountStatus("Signing in...", false);
  try {
    const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/customer/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serial: credentials.serial,
        orderId: credentials.orderId,
        email: credentials.email,
      }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.ok || !body.token) {
      throw new Error(body.error || "Sign in failed");
    }
    const expiresInSeconds = Number(body.expiresInSeconds || 0);
    const session = {
      serial: credentials.serial,
      orderId: credentials.orderId,
      email: credentials.email,
      token: body.token,
      expiresAt: Date.now() + Math.max(60, expiresInSeconds) * 1000,
    };
    writeAccountSession(session);
    await fetchAccountActivations(session, { silent: true });
    setAccountStatus("Signed in successfully.", false);
  } catch (error) {
    setAccountStatus("Sign in failed. Check serial/order/email and try again.", true);
  } finally {
    setAccountLoading(false);
  }
}

async function deactivateMachine(machineId) {
  const session = readAccountSession();
  if (!session) {
    setAccountStatus("Session expired. Please sign in again.", true);
    return;
  }
  const baseUrl = accountApiBaseUrl();
  if (!baseUrl) {
    setAccountStatus("Account service is not configured yet.", true);
    return;
  }
  setAccountStatus(`Deactivating ${machineId}...`, false);
  try {
    const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/customer/activations/deactivate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify({ machineId }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.ok) {
      throw new Error(body.error || "Deactivate failed");
    }
    setAccountStatus(`Machine ${machineId} deactivated.`, false);
    await fetchAccountActivations(session, { silent: true });
  } catch (error) {
    setAccountStatus("Could not deactivate that machine right now.", true);
  }
}

if (accountLoginForm) {
  accountLoginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(accountLoginForm);
    const serial = normalizeSerial(data.get("serial"));
    const orderId = String(data.get("orderId") || "").trim();
    const email = String(data.get("email") || "").trim().toLowerCase();
    if (!serial || !orderId || !email) {
      setAccountStatus("Enter serial, order ID, and purchase email.", true);
      return;
    }
    saveRedditMatch({ email });
    await loginAccount({ serial, orderId, email });
  });
}

if (accountRefreshBtn) {
  accountRefreshBtn.addEventListener("click", async () => {
    const session = readAccountSession();
    if (!session) {
      setAccountStatus("No active session. Sign in first.", true);
      return;
    }
    await fetchAccountActivations(session);
  });
}

if (accountLogoutBtn) {
  accountLogoutBtn.addEventListener("click", () => {
    clearAccountSession();
    if (accountPanel) accountPanel.hidden = true;
    setAccountStatus("Signed out.", false);
  });
}

if (accountActivations) {
  accountActivations.addEventListener("click", async (event) => {
    const target = event.target;
    const element =
      target instanceof Element
        ? target
        : target instanceof Node
          ? target.parentElement
          : null;
    if (!element) return;
    const button = element.closest(".account-deactivate-btn");
    if (!button) return;
    const machineId = String(button.getAttribute("data-machine-id") || "").trim();
    if (!machineId) return;
    await deactivateMachine(machineId);
  });
}

{
  const session = readAccountSession();
  if (session) {
    fetchAccountActivations(session, { silent: true });
  }
}
