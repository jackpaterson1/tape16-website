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

const siteHeader = document.querySelector(".site-header");
const navToggle = siteHeader?.querySelector(".nav-toggle") || null;
const siteNav = siteHeader?.querySelector("nav") || null;

if (siteHeader && navToggle && siteNav) {
  if (!siteNav.id) siteNav.id = "site-navigation";
  navToggle.setAttribute("aria-controls", siteNav.id);

  const setMenuOpen = (open) => {
    siteHeader.classList.toggle("is-nav-open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
  };

  navToggle.addEventListener("click", () => {
    setMenuOpen(!siteHeader.classList.contains("is-nav-open"));
  });

  siteNav.addEventListener("click", (event) => {
    const target = event.target;
    const element =
      target instanceof Element
        ? target
        : target instanceof Node
          ? target.parentElement
          : null;
    if (element?.closest("a") && window.matchMedia("(max-width: 700px)").matches) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuOpen(false);
  });

  window.addEventListener("resize", () => {
    if (!window.matchMedia("(max-width: 700px)").matches) setMenuOpen(false);
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
const themePagination = document.getElementById("theme-pagination");
const themeAccountLoginForm = document.getElementById("theme-account-login-form");
const themeAccountStatus = document.getElementById("theme-account-status");
const themeAccountLoginBtn = document.getElementById("theme-account-login-btn");
const themeAccountRefreshBtn = document.getElementById("theme-account-refresh-btn");
const themeAccountLogoutBtn = document.getElementById("theme-account-logout-btn");
const themeAccountPanel = document.getElementById("theme-account-panel");
const themeAccountSummary = document.getElementById("theme-account-summary");
const themeAccountList = document.getElementById("theme-account-list");
const themeEmailInput = document.getElementById("theme-email");
const fullDownloadLink = document.getElementById("full-download-link");
const downloadPageWindowsLink =
  document.getElementById("download-page-windows-link") ||
  document.getElementById("download-page-demo-link");
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
const THEME_ACCOUNT_SESSION_KEY = "tape16_theme_account_session_v1";
const BUILD_VERSION_CACHE_KEY = "tape16_latest_build_cache_v1";
const BUILD_VERSION_CACHE_TTL_MS = 10 * 60 * 1000;
const REDDIT_MATCH_STORAGE_KEY = "tape16_reddit_match_v1";
const PRIMARY_LICENSE_API_BASE = "https://licenses.emrmusicgroup.com";
const FALLBACK_LICENSE_API_BASE = "https://tape16-licensing.emrmusicgroup.workers.dev";

async function fetchWithLicensingFallback(resource, options) {
  const url = typeof resource === "string" ? resource : String(resource?.url || resource || "");
  try {
    return await window.fetch(resource, options);
  } catch (error) {
    if (url !== PRIMARY_LICENSE_API_BASE && !url.startsWith(`${PRIMARY_LICENSE_API_BASE}/`)) throw error;
    const fallbackUrl = `${FALLBACK_LICENSE_API_BASE}${url.slice(PRIMARY_LICENSE_API_BASE.length)}`;
    return await window.fetch(fallbackUrl, options);
  }
}
const PROMOTEKIT_REFERRAL_STORAGE_KEY = "tape16_promotekit_referral_v1";
const THEME_PAGE_SIZE = 12;
let themeLibraryItems = [];
let themeCurrentPage = 1;

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

  const oldBuyUrl = linkEl.getAttribute("href") || "";
  const newBuyUrl = stripeCheckoutUrlWithPromoteKitReferral(oldBuyUrl);
  if (!newBuyUrl) return;

  linkEl.setAttribute("href", newBuyUrl);
}

function stripeCheckoutUrlWithPromoteKitReferral(buyUrl) {
  const referralId = resolvePromoteKitReferral();
  if (!referralId) return "";

  const oldBuyUrl = String(buyUrl || "");
  if (!oldBuyUrl.startsWith("https://buy.stripe.com/")) return "";
  if (oldBuyUrl.includes("client_reference_id=")) return oldBuyUrl;

  const separator = oldBuyUrl.includes("?") ? "&" : "?";
  return oldBuyUrl + separator + "client_reference_id=" + encodeURIComponent(referralId);
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

const paypalSuccessStorageKey = "tape16.paypalSuccessAt";
const paypalSuccessWindowMs = 10 * 60 * 1000;

function rememberPayPalSuccess() {
  try {
    window.sessionStorage.setItem(paypalSuccessStorageKey, String(Date.now()));
  } catch {
    // Storage can be unavailable in some privacy modes. The in-memory state still protects this page view.
  }
}

function hasRecentPayPalSuccess() {
  try {
    const successAt = Number(window.sessionStorage.getItem(paypalSuccessStorageKey) || 0);
    return successAt > 0 && Date.now() - successAt < paypalSuccessWindowMs;
  } catch {
    return false;
  }
}

function redirectToCheckoutSuccess() {
  window.location.replace("success.html?checkout=success");
}

function payPalCaptureErrorLooksComplete(body) {
  const error = String(body?.error || body?.message || "").toLowerCase();
  const status = String(body?.status || body?.orderStatus || "").toLowerCase();
  return (
    status === "completed" ||
    error.includes("already captured") ||
    error.includes("order_already_captured") ||
    error.includes("order already captured")
  );
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

      const referralId = resolvePromoteKitReferral();

      const apiBase = checkoutApiBaseUrl();
      if (!apiBase) {
        const fallbackReferralUrl = stripeCheckoutUrlWithPromoteKitReferral(
          checkoutUrl || fallbackBuyUrl
        );
        const fallbackUrl = fallbackReferralUrl || checkoutUrl || fallbackBuyUrl;
        if (fallbackUrl) {
          window.open(fallbackUrl, "_blank", "noopener,noreferrer");
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
      if (referralId) payload.clientReferenceId = referralId;

      buyLink.setAttribute("disabled", "disabled");
      setBuyStatus("Starting secure checkout...", false);
      try {
        const response = await fetchWithLicensingFallback(endpoint, {
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
        const fallbackReferralUrl = stripeCheckoutUrlWithPromoteKitReferral(
          checkoutUrl || fallbackBuyUrl
        );
        const fallbackUrl = fallbackReferralUrl || checkoutUrl || fallbackBuyUrl;
        if (fallbackUrl) {
          window.open(fallbackUrl, "_blank", "noopener,noreferrer");
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
    let paypalCheckoutStarted = false;
    let paypalOrderInFlight = false;
    let activePayPalOrderId = "";
    let activePayPalClientReferenceId = "";
    let paypalCapturePromise = null;
    let paypalCaptureStarted = false;
    let paypalApproveReceived = false;
    let paypalPaymentCompleted = hasRecentPayPalSuccess();

    if (paypalPaymentCompleted) {
      setBuyStatus("Payment complete. Redirecting to your purchase confirmation...", false);
      redirectToCheckoutSuccess();
      return;
    }

    function clearPayPalState() {
      paypalCheckoutStarted = false;
      paypalCaptureStarted = false;
      paypalApproveReceived = false;
      activePayPalOrderId = "";
      activePayPalClientReferenceId = "";
      paypalCapturePromise = null;
    }

    function finishPayPalCheckout() {
      paypalPaymentCompleted = true;
      rememberPayPalSuccess();
      setBuyStatus("Payment complete. Your serial email is on the way.", false);
      paypalButtonContainer.hidden = true;
      if (checkoutDivider) checkoutDivider.hidden = true;
      redirectToCheckoutSuccess();
    }

    const buttonOptions = {
      style: {
        layout: "vertical",
        color: "gold",
        shape: "rect",
        label: "paypal",
        height: 44,
      },
      async createOrder() {
        if (activePayPalOrderId) return activePayPalOrderId;
        if (paypalOrderInFlight) {
          throw new Error("PayPal order creation is already in progress");
        }

        paypalCheckoutStarted = true;
        paypalOrderInFlight = true;
        activePayPalClientReferenceId =
          activePayPalClientReferenceId ||
          `site-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        setBuyStatus("Starting PayPal checkout...", false);
        try {
          const response = await fetchWithLicensingFallback(createOrderEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clientReferenceId: activePayPalClientReferenceId }),
          });
          const body = await response.json().catch(() => ({}));
          if (!response.ok || !body.ok || !body.orderId) {
            throw new Error(body.error || "PayPal order creation failed");
          }
          activePayPalOrderId = body.orderId;
          return activePayPalOrderId;
        } catch (error) {
          activePayPalClientReferenceId = "";
          activePayPalOrderId = "";
          throw error;
        } finally {
          paypalOrderInFlight = false;
        }
      },
      async onApprove(data) {
        if (paypalCapturePromise) return paypalCapturePromise;

        paypalApproveReceived = true;
        paypalCaptureStarted = true;
        paypalCapturePromise = (async () => {
          setBuyStatus("Finalising PayPal payment...", false);
          const response = await fetchWithLicensingFallback(captureOrderEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: data.orderID }),
          });
          const body = await response.json().catch(() => ({}));
          if (!response.ok || !body.ok) {
            if (payPalCaptureErrorLooksComplete(body)) {
              finishPayPalCheckout();
              return body;
            }
            throw new Error(body.error || "PayPal capture failed");
          }
          finishPayPalCheckout();
          return body;
        })();

        try {
          return await paypalCapturePromise;
        } catch (error) {
          console.error("PayPal capture confirmation error", error);
          finishPayPalCheckout();
          return { ok: true, redirectedAfterApprovalError: true };
        }
      },
      onCancel() {
        if (paypalPaymentCompleted || paypalCaptureStarted || paypalApproveReceived) {
          setBuyStatus("Finalising PayPal payment...", false);
          return;
        }
        clearPayPalState();
        setBuyStatus("PayPal checkout cancelled.", true);
      },
      onError(error) {
        console.error("PayPal checkout error", error);
        if (paypalPaymentCompleted || hasRecentPayPalSuccess()) {
          finishPayPalCheckout();
          return;
        }
        if (paypalApproveReceived) {
          finishPayPalCheckout();
          return;
        }
        if (paypalCaptureStarted && paypalCapturePromise) {
          setBuyStatus("Finalising PayPal payment...", false);
          paypalCapturePromise.catch(() => {
            if (!paypalPaymentCompleted) {
              finishPayPalCheckout();
            }
          });
          return;
        }
        if (paypalCheckoutStarted) {
          setBuyStatus(
            "We could not confirm PayPal checkout. If PayPal showed a completed payment, do not pay again. Check your email for the serial or contact support.",
            true,
          );
        } else {
          setBuyStatus("", false);
        }
        clearPayPalState();
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
  "https://github.com/jackpaterson1/TAPE-16-Public-Releases/releases/download/0.9.380/TAPE-16-v0.9.380-macOS.dmg";
const pinnedWindowsDownloadUrl =
  "https://github.com/jackpaterson1/TAPE-16-Public-Releases/releases/download/0.9.380/TAPE-16-v0.9.380-Windows-Setup.exe";
const pinnedGithubReleaseUrl =
  "https://github.com/jackpaterson1/TAPE-16-Public-Releases/releases/tag/0.9.380";
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

if (downloadPageWindowsLink) {
  configureDirectDownloadLink(downloadPageWindowsLink, windowsDownloadUrl);
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
bindDownloadClickTracking(downloadPageWindowsLink, "Download Windows");
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
      const response = await fetchWithLicensingFallback(endpoint, {
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
      const response = await fetchWithLicensingFallback(endpoint, {
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
      const response = await fetchWithLicensingFallback(endpoint, {
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

function setThemeAccountStatus(message, isError) {
  if (!themeAccountStatus) return;
  themeAccountStatus.textContent = message;
  themeAccountStatus.style.color = isError ? "#ff9d87" : "#f7c34b";
}

function readThemeAccountSession() {
  try {
    const raw = localStorage.getItem(THEME_ACCOUNT_SESSION_KEY);
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

function writeThemeAccountSession(session) {
  try {
    localStorage.setItem(THEME_ACCOUNT_SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    // Ignore storage errors; signed-in state can still continue for this page.
  }
}

function clearThemeAccountSession() {
  try {
    localStorage.removeItem(THEME_ACCOUNT_SESSION_KEY);
  } catch (error) {
    // Ignore storage errors.
  }
}

function themeAccountAuthHeaders(session, extra = {}) {
  return {
    ...extra,
    Authorization: `Bearer ${session.token}`,
  };
}

function setThemeAccountLoading(loading) {
  if (themeAccountLoginBtn) themeAccountLoginBtn.disabled = loading;
  if (themeAccountRefreshBtn) themeAccountRefreshBtn.disabled = loading;
}

function applyThemeAccountUploadState() {
  const session = readThemeAccountSession();
  if (!themeEmailInput) return;
  if (session?.email) {
    themeEmailInput.value = session.email;
    themeEmailInput.readOnly = true;
    themeEmailInput.setAttribute("aria-readonly", "true");
  } else {
    themeEmailInput.readOnly = false;
    themeEmailInput.removeAttribute("aria-readonly");
  }
}

function themeManageItemHtml(item) {
  const tags = Array.isArray(item.tags) ? item.tags.join(", ") : "";
  const packageSize = formatFileSize(item.packageSize);
  const previewSize = formatFileSize(item.previewSize);
  const fileMeta = [
    item.packageFilename || "ZIP package",
    packageSize,
    item.hasPreview ? `Preview${previewSize ? ` ${previewSize}` : ""}` : "No preview",
  ].filter(Boolean);

  return `
    <article class="theme-manage-item" data-theme-slug="${escapeHtml(item.slug || "")}">
      <div class="theme-manage-head">
        <div>
          <h3>${escapeHtml(item.name || "Untitled Theme")}</h3>
          <p>${fileMeta.map(escapeHtml).join(" • ")}</p>
        </div>
        <a class="btn btn-ghost" href="${escapeHtml(themeApiUrl(item.downloadUrl))}" data-theme-download>Download</a>
      </div>
      <div class="theme-manage-fields">
        <label>
          Theme Name
          <input name="themeName" type="text" value="${escapeHtml(item.name || "")}" />
        </label>
        <label>
          Creator Name
          <input name="creator" type="text" value="${escapeHtml(item.creatorName || "")}" />
        </label>
        <label>
          App Version
          <input name="appVersion" type="text" value="${escapeHtml(item.appVersion || "")}" />
        </label>
        <label>
          Tags
          <input name="tags" type="text" value="${escapeHtml(tags)}" />
        </label>
        <label class="theme-manage-full">
          Description
          <textarea name="description" rows="4">${escapeHtml(item.description || "")}</textarea>
        </label>
      </div>
      <div class="theme-manage-actions">
        <button class="btn btn-primary" type="button" data-theme-manage-save>Save Details</button>
        <div class="theme-file-action">
          <span>Replace ZIP</span>
          <input name="themeFile" type="file" accept=".zip,application/zip" />
          <button class="btn btn-ghost" type="button" data-theme-manage-package>Upload ZIP</button>
        </div>
        <div class="theme-file-action">
          <span>Replace Preview</span>
          <input name="previewImage" type="file" accept=".png,.jpg,.jpeg,.webp" />
          <button class="btn btn-ghost" type="button" data-theme-manage-preview>Upload Preview</button>
        </div>
        <button class="btn btn-ghost theme-delete-btn" type="button" data-theme-manage-delete>Delete Theme</button>
      </div>
      <p class="serial-status theme-manage-status" role="status" aria-live="polite"></p>
    </article>
  `;
}

function renderThemeAccountThemes(items) {
  if (!themeAccountPanel || !themeAccountSummary || !themeAccountList) return;
  const themes = Array.isArray(items) ? items : [];
  themeAccountSummary.textContent =
    themes.length === 1 ? "1 theme linked to this email." : `${themes.length} themes linked to this email.`;
  themeAccountList.innerHTML = themes.length
    ? themes.map(themeManageItemHtml).join("")
    : `<p class="activation-empty">No themes are linked to this email yet.</p>`;
  themeAccountPanel.hidden = false;
  bindThemeDownloads();
}

function setThemeManageStatus(itemEl, message, isError) {
  const status = itemEl?.querySelector(".theme-manage-status");
  if (!status) return;
  status.textContent = message;
  status.style.color = isError ? "#ff9d87" : "#f7c34b";
}

async function loadThemeAccountThemes(options = {}) {
  if (!themeAccountList) return;
  const session = readThemeAccountSession();
  if (!session) {
    if (themeAccountPanel) themeAccountPanel.hidden = true;
    applyThemeAccountUploadState();
    if (!options.silent) setThemeAccountStatus("Sign in to manage your themes.", false);
    return;
  }

  const supportBase = themeApiBaseUrl();
  if (!supportBase) {
    setThemeAccountStatus("Theme account service is not configured yet.", true);
    return;
  }

  setThemeAccountLoading(true);
  if (!options.silent) setThemeAccountStatus("Loading your themes...", false);
  try {
    const response = await fetch(`${supportBase.replace(/\/+$/, "")}/theme-account/themes`, {
      headers: themeAccountAuthHeaders(session),
    });
    const body = await response.json().catch(() => ({}));
    if (response.status === 401) {
      clearThemeAccountSession();
      applyThemeAccountUploadState();
      if (themeAccountPanel) themeAccountPanel.hidden = true;
      setThemeAccountStatus("Session expired. Please sign in again.", true);
      return;
    }
    if (!response.ok || !body.ok) throw new Error(body.error || "Could not load themes");
    renderThemeAccountThemes(body.items || []);
    applyThemeAccountUploadState();
    setThemeAccountStatus(`Signed in as ${session.email}.`, false);
  } catch (error) {
    setThemeAccountStatus("Could not load your themes right now.", true);
  } finally {
    setThemeAccountLoading(false);
  }
}

async function loginThemeAccount(credentials) {
  const supportBase = themeApiBaseUrl();
  if (!supportBase) {
    setThemeAccountStatus("Theme account service is not configured yet.", true);
    return;
  }

  setThemeAccountLoading(true);
  setThemeAccountStatus("Signing in...", false);
  try {
    const response = await fetch(`${supportBase.replace(/\/+$/, "")}/theme-account/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.ok || !body.token) throw new Error(body.error || "Sign in failed");
    const expiresInSeconds = Number(body.expiresInSeconds || 0);
    const session = {
      email: String(body.email || credentials.email || "").trim().toLowerCase(),
      serial: normalizeSerial(body.serial || credentials.serial),
      token: body.token,
      expiresAt: Date.now() + Math.max(60, expiresInSeconds) * 1000,
    };
    writeThemeAccountSession(session);
    saveRedditMatch({ email: session.email });
    await loadThemeAccountThemes({ silent: true });
    setThemeAccountStatus("Signed in. Your matching uploaded themes are linked.", false);
  } catch (error) {
    setThemeAccountStatus("Sign in failed. Check your purchase email and serial.", true);
  } finally {
    setThemeAccountLoading(false);
  }
}

async function saveManagedTheme(itemEl) {
  const session = readThemeAccountSession();
  const supportBase = themeApiBaseUrl();
  const slug = itemEl?.dataset.themeSlug || "";
  if (!session || !supportBase || !slug) return;

  const payload = {
    themeName: itemEl.querySelector('[name="themeName"]')?.value || "",
    creator: itemEl.querySelector('[name="creator"]')?.value || "",
    appVersion: itemEl.querySelector('[name="appVersion"]')?.value || "",
    tags: itemEl.querySelector('[name="tags"]')?.value || "",
    description: itemEl.querySelector('[name="description"]')?.value || "",
  };
  if (!payload.themeName.trim() || !payload.creator.trim()) {
    setThemeManageStatus(itemEl, "Theme name and creator name are required.", true);
    return;
  }

  setThemeManageStatus(itemEl, "Saving details...", false);
  try {
    const response = await fetch(`${supportBase.replace(/\/+$/, "")}/themes/${encodeURIComponent(slug)}`, {
      method: "PATCH",
      headers: themeAccountAuthHeaders(session, { "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.ok) throw new Error(body.error || "Save failed");
    setThemeManageStatus(itemEl, "Theme details saved.", false);
    await loadThemeLibrary();
    await loadThemeAccountThemes({ silent: true });
  } catch (error) {
    setThemeManageStatus(itemEl, "Could not save details right now.", true);
  }
}

async function replaceManagedThemeFile(itemEl, kind) {
  const session = readThemeAccountSession();
  const supportBase = themeApiBaseUrl();
  const slug = itemEl?.dataset.themeSlug || "";
  if (!session || !supportBase || !slug) return;

  const isPreview = kind === "preview";
  const input = itemEl.querySelector(isPreview ? '[name="previewImage"]' : '[name="themeFile"]');
  const file = input?.files?.[0] || null;
  if (!file) {
    setThemeManageStatus(itemEl, isPreview ? "Choose a preview image first." : "Choose a ZIP first.", true);
    return;
  }
  if (!isPreview && !/\.zip$/i.test(file.name || "")) {
    setThemeManageStatus(itemEl, "Upload the ZIP exported from the TAPE 16 Themes window.", true);
    return;
  }
  if (isPreview && !/\.(png|jpe?g|webp)$/i.test(file.name || "")) {
    setThemeManageStatus(itemEl, "Preview image must be PNG, JPG, or WebP.", true);
    return;
  }

  const formData = new FormData();
  formData.append(isPreview ? "previewImage" : "themeFile", file);
  setThemeManageStatus(itemEl, isPreview ? "Uploading preview..." : "Uploading ZIP...", false);
  try {
    const endpoint = `${supportBase.replace(/\/+$/, "")}/themes/${encodeURIComponent(slug)}/${isPreview ? "preview" : "package"}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: themeAccountAuthHeaders(session),
      body: formData,
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.ok) throw new Error(body.error || "Upload failed");
    input.value = "";
    setThemeManageStatus(itemEl, isPreview ? "Preview replaced." : "ZIP replaced.", false);
    await loadThemeLibrary();
    await loadThemeAccountThemes({ silent: true });
  } catch (error) {
    setThemeManageStatus(itemEl, isPreview ? "Could not replace preview right now." : "Could not replace ZIP right now.", true);
  }
}

async function deleteManagedTheme(itemEl) {
  const session = readThemeAccountSession();
  const supportBase = themeApiBaseUrl();
  const slug = itemEl?.dataset.themeSlug || "";
  if (!session || !supportBase || !slug) return;

  const name =
    itemEl.querySelector('[name="themeName"]')?.value?.trim() ||
    itemEl.querySelector("h3")?.textContent?.trim() ||
    "this theme";
  const confirmed = window.confirm(
    `Delete "${name}"? This removes it from the public theme library and cannot be undone.`,
  );
  if (!confirmed) return;

  setThemeManageStatus(itemEl, "Deleting theme...", false);
  try {
    const response = await fetch(`${supportBase.replace(/\/+$/, "")}/themes/${encodeURIComponent(slug)}`, {
      method: "DELETE",
      headers: themeAccountAuthHeaders(session),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.ok) throw new Error(body.error || "Delete failed");
    setThemeManageStatus(itemEl, "Theme deleted.", false);
    await loadThemeLibrary();
    await loadThemeAccountThemes({ silent: true });
  } catch (error) {
    setThemeManageStatus(itemEl, "Could not delete theme right now.", true);
  }
}

function formatFileSize(bytes) {
  const size = Number(bytes || 0);
  if (!Number.isFinite(size) || size <= 0) return "";
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${Math.round((size / (1024 * 1024)) * 10) / 10} MB`;
}

function selectedThemeDownloadRangeLabel() {
  const selectedValue = String(themeSort?.value || "");
  const fallbackOption = Array.from(themeSort?.options || []).find((option) => option.value === selectedValue);
  const optionText =
    themeSort?.selectedOptions?.[0]?.textContent ||
    fallbackOption?.textContent ||
    "";
  const range = String(optionText)
    .replace(/^most\s+downloads\s*/i, "")
    .replace(/^in\s+/i, "")
    .trim()
    .toLowerCase();
  return range || "selected range";
}

function formatPeriodDownloads(count) {
  const downloads = Number(count || 0);
  const range = selectedThemeDownloadRangeLabel();
  const countText = downloads === 1 ? "1" : String(downloads);
  return range === "all time" ? `${countText} all time` : `${countText} in ${range}`;
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
    formatPeriodDownloads(periodDownloads),
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
      <p class="theme-description" data-theme-description>${escapeHtml(item.description || "No description supplied.")}</p>
      <button class="theme-description-toggle" type="button" data-theme-description-toggle hidden>See more...</button>
      <div class="theme-meta">
        ${meta.map((value) => `<span>${escapeHtml(value)}</span>`).join("")}
        ${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
      </div>
      <a class="btn btn-primary theme-download" href="${escapeHtml(downloadUrl)}" data-theme-download>Download ZIP</a>
    </article>
  `;
}

function filteredThemeLibraryItems() {
  const query = String(themeSearch?.value || "").trim().toLowerCase();
  if (!query) return themeLibraryItems;
  return themeLibraryItems.filter((item) => {
    const tags = Array.isArray(item.tags) ? item.tags.join(" ") : "";
    return [
      item.name,
      item.creatorName,
      item.description,
      tags,
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
}

function renderThemePagination(totalItems) {
  if (!themePagination) return;
  const totalPages = Math.ceil(totalItems / THEME_PAGE_SIZE);
  if (totalPages <= 1) {
    themePagination.innerHTML = "";
    themePagination.hidden = true;
    return;
  }

  const pageButtons = Array.from({ length: totalPages }, (_, index) => {
    const page = index + 1;
    return `<button class="theme-page-btn${page === themeCurrentPage ? " is-active" : ""}" type="button" data-theme-page="${page}" aria-current="${page === themeCurrentPage ? "page" : "false"}">${page}</button>`;
  }).join("");

  themePagination.hidden = false;
  themePagination.innerHTML = `
    <button class="theme-page-btn" type="button" data-theme-page="prev" ${themeCurrentPage <= 1 ? "disabled" : ""}>Prev</button>
    <span>${themeCurrentPage} / ${totalPages}</span>
    ${pageButtons}
    <button class="theme-page-btn" type="button" data-theme-page="next" ${themeCurrentPage >= totalPages ? "disabled" : ""}>Next</button>
  `;
}

function renderThemeLibraryPage() {
  if (!themeLibraryGrid) return;
  const themes = filteredThemeLibraryItems();
  const totalPages = Math.max(1, Math.ceil(themes.length / THEME_PAGE_SIZE));
  themeCurrentPage = Math.min(Math.max(1, themeCurrentPage), totalPages);
  const start = (themeCurrentPage - 1) * THEME_PAGE_SIZE;
  const pageThemes = themes.slice(start, start + THEME_PAGE_SIZE);

  themeLibraryGrid.innerHTML = pageThemes.map(themeCardHtml).join("");
  if (themeEmptyState) themeEmptyState.hidden = themes.length > 0;
  themeLibraryGrid.hidden = themes.length === 0;
  renderThemePagination(themes.length);
  bindThemeDownloads();
  bindThemeDescriptionToggles();
}

function renderThemeLibrary(items) {
  if (!themeLibraryGrid) return;
  themeLibraryItems = Array.isArray(items) ? items : [];
  themeCurrentPage = 1;
  renderThemeLibraryPage();
}

async function loadThemeLibrary() {
  if (!themeLibraryGrid) return;
  if (window.location.protocol === "file:") {
    setThemeDownloadStatus(
      "Theme downloads only load on the live website or a local web server preview.",
      true
    );
    return;
  }
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
    themeCurrentPage = 1;
    renderThemeLibraryPage();
  };

  themeSearch.addEventListener("input", applyThemeSearch);
  themeSearch.addEventListener("change", applyThemeSearch);
}

function bindThemeSort() {
  if (!themeSort) return;
  themeSort.addEventListener("change", () => {
    themeCurrentPage = 1;
    loadThemeLibrary();
    trackAnalyticsEvent("theme_sort_change", {
      sort: themeSort.value,
      page_location: window.location.href,
    });
  });
}

function bindThemePagination() {
  if (!themePagination) return;
  themePagination.addEventListener("click", (event) => {
    const button = event.target.closest("[data-theme-page]");
    if (!button || button.disabled) return;
    const target = button.dataset.themePage || "";
    const totalPages = Math.max(1, Math.ceil(filteredThemeLibraryItems().length / THEME_PAGE_SIZE));
    if (target === "prev") {
      themeCurrentPage = Math.max(1, themeCurrentPage - 1);
    } else if (target === "next") {
      themeCurrentPage = Math.min(totalPages, themeCurrentPage + 1);
    } else {
      themeCurrentPage = Math.min(totalPages, Math.max(1, Number(target) || 1));
    }
    renderThemeLibraryPage();
    document.getElementById("theme-library")?.scrollIntoView({ behavior: "smooth", block: "start" });
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

function bindThemeDescriptionToggles() {
  document.querySelectorAll("[data-theme-description-toggle]").forEach((button) => {
    if (button.dataset.bound === "true") return;
    button.dataset.bound = "true";
    const card = button.closest(".theme-card");
    const description = card?.querySelector("[data-theme-description]");
    if (!card || !description) return;
    button.setAttribute("aria-expanded", "false");

    const updateVisibility = () => {
      const expanded = card.classList.contains("is-description-expanded");
      if (expanded) {
        button.hidden = false;
        return;
      }
      button.hidden = description.scrollHeight <= description.clientHeight + 1;
    };

    updateVisibility();
    window.setTimeout(updateVisibility, 0);

    button.addEventListener("click", () => {
      const expanded = card.classList.toggle("is-description-expanded");
      button.textContent = expanded ? "See less" : "See more...";
      button.setAttribute("aria-expanded", expanded ? "true" : "false");
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

    const session = readThemeAccountSession();
    const formData = new FormData(themeUploadForm);
    if (session?.email) formData.set("email", session.email);
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
        headers: session ? themeAccountAuthHeaders(session) : undefined,
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
      applyThemeAccountUploadState();
      await loadThemeLibrary();
      if (session) await loadThemeAccountThemes({ silent: true });
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

if (themeAccountLoginForm) {
  themeAccountLoginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(themeAccountLoginForm);
    const serial = normalizeSerial(data.get("serial"));
    const email = String(data.get("email") || "").trim().toLowerCase();
    if (!serial || !email) {
      setThemeAccountStatus("Enter your serial number and purchase email.", true);
      return;
    }
    await loginThemeAccount({ serial, email });
  });
}

if (themeAccountRefreshBtn) {
  themeAccountRefreshBtn.addEventListener("click", async () => {
    await loadThemeAccountThemes();
  });
}

if (themeAccountLogoutBtn) {
  themeAccountLogoutBtn.addEventListener("click", () => {
    clearThemeAccountSession();
    if (themeAccountPanel) themeAccountPanel.hidden = true;
    applyThemeAccountUploadState();
    setThemeAccountStatus("Signed out.", false);
  });
}

if (themeAccountList) {
  themeAccountList.addEventListener("click", async (event) => {
    const target = event.target;
    const element =
      target instanceof Element
        ? target
        : target instanceof Node
          ? target.parentElement
          : null;
    if (!element) return;

    const itemEl = element.closest(".theme-manage-item");
    if (!itemEl) return;

    if (element.closest("[data-theme-manage-save]")) {
      await saveManagedTheme(itemEl);
      return;
    }
    if (element.closest("[data-theme-manage-package]")) {
      await replaceManagedThemeFile(itemEl, "package");
      return;
    }
    if (element.closest("[data-theme-manage-preview]")) {
      await replaceManagedThemeFile(itemEl, "preview");
      return;
    }
    if (element.closest("[data-theme-manage-delete]")) {
      await deleteManagedTheme(itemEl);
    }
  });
}

applyThemeAccountUploadState();
loadThemeAccountThemes({ silent: true });
bindThemeSearch();
bindThemeSort();
bindThemePagination();
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
    const response = await fetchWithLicensingFallback(`${baseUrl.replace(/\/+$/, "")}/customer/activations`, {
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
    const response = await fetchWithLicensingFallback(`${baseUrl.replace(/\/+$/, "")}/customer/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serial: credentials.serial,
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
      email: credentials.email,
      token: body.token,
      expiresAt: Date.now() + Math.max(60, expiresInSeconds) * 1000,
    };
    writeAccountSession(session);
    await fetchAccountActivations(session, { silent: true });
    setAccountStatus("Signed in successfully.", false);
  } catch (error) {
    setAccountStatus("Sign in failed. Check your serial and purchase email, then try again.", true);
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
    const response = await fetchWithLicensingFallback(`${baseUrl.replace(/\/+$/, "")}/customer/activations/deactivate`, {
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
    const email = String(data.get("email") || "").trim().toLowerCase();
    if (!serial || !email) {
      setAccountStatus("Enter your serial and purchase email.", true);
      return;
    }
    saveRedditMatch({ email });
    await loginAccount({ serial, email });
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
