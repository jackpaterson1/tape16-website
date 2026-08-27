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
const navMenuGroups = siteNav?.querySelectorAll("details.nav-menu-group") || [];

if (siteHeader && navToggle && siteNav) {
  if (!siteNav.id) siteNav.id = "site-navigation";
  navToggle.setAttribute("aria-controls", siteNav.id);

  const setMenuOpen = (open) => {
    siteHeader.classList.toggle("is-nav-open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
  };

  const closeNavGroups = () => {
    navMenuGroups.forEach((group) => group.removeAttribute("open"));
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
    if (element?.closest("a")) {
      closeNavGroups();
      if (window.matchMedia("(max-width: 700px)").matches) setMenuOpen(false);
    }
  });

  document.addEventListener("click", (event) => {
    if (!siteNav.contains(event.target)) closeNavGroups();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuOpen(false);
      closeNavGroups();
    }
  });

  window.addEventListener("resize", () => {
    if (!window.matchMedia("(max-width: 700px)").matches) {
      setMenuOpen(false);
      closeNavGroups();
    }
  });
}

function initializePlatformDownloadHighlight() {
  const platformCards = Array.from(document.querySelectorAll("[data-download-platform]"));
  if (platformCards.length === 0) return;

  const userAgent = navigator.userAgent || "";
  const platformName = navigator.userAgentData?.platform || navigator.platform || "";
  const isTouchMac = /Mac/i.test(platformName) && Number(navigator.maxTouchPoints || 0) > 1;
  let detectedPlatform = "";

  if (/iPad|iPhone|iPod/i.test(userAgent) || isTouchMac) {
    detectedPlatform = "ios";
  } else if (/Win/i.test(platformName) || /Windows/i.test(userAgent)) {
    detectedPlatform = "windows";
  } else if (/Mac/i.test(platformName) || /Macintosh/i.test(userAgent)) {
    detectedPlatform = "macos";
  } else if (/Linux/i.test(platformName) || /Linux/i.test(userAgent)) {
    detectedPlatform = "linux";
  }

  platformCards.forEach((card) => {
    const button = card.querySelector(".btn");
    if (!button) return;

    const matchesDevice = card.dataset.downloadPlatform === detectedPlatform;
    card.classList.toggle("is-detected-platform", matchesDevice);
    button.classList.toggle("btn-primary", matchesDevice);
    button.classList.toggle("btn-ghost", !matchesDevice);
  });
}

initializePlatformDownloadHighlight();

function initializeYoutubeTestimonials() {
  const root = document.querySelector(".youtube-testimonials");
  if (!root) return;

  const field = root.querySelector(".youtube-testimonials__field");
  const pauseButton = root.querySelector(".youtube-testimonials__pause");
  if (!field || !pauseButton) return;

  const videos = {
    official: "https://www.youtube.com/watch?v=i4SQbAUNSsE",
    demonic: "https://www.youtube.com/watch?v=Y7Hm3g2m66k",
    feezo: "https://www.youtube.com/watch?v=l27K8XEbgz8",
    twin: "https://www.youtube.com/watch?v=bwLmy1gktHs",
    jeej: "https://www.youtube.com/watch?v=Ur-HzVmPnZI",
    greg: "https://www.youtube.com/watch?v=xwcc-qKRiNM",
    compare: "https://www.youtube.com/watch?v=UJkRTIOGuxg",
    questions: "https://www.youtube.com/watch?v=Y-SXRIO2sZg",
    crow: "https://www.youtube.com/watch?v=g4UO0QJf9fo",
    trev: "https://www.youtube.com/watch?v=9EuWs5NwNVg",
    tales: "https://www.youtube.com/watch?v=f282IEMjKXg",
  };

  const comments = [
    ["Just bought it and recorded my first song within 10 minutes... I love Tape16!", videos.official],
    ["This has become one of my favorite music applications. I use this on a daily basis.", videos.official],
    ["Just downloaded the free trial, OUTSTANDING", videos.official],
    ["Bought it and already love it! great idea!", videos.official],
    ["Full song recorded and mixed on TAPE 16 in Los Angeles at Forward Motion Studios.", videos.tales],
    ["Just downloaded the demo. I love it. The saturation, wow, flutter etc sound great.", videos.official],
    ["Purchased this yesterday. Been enjoying playing with this software. I just laid down a few acoustic tracks.", videos.official],
    ["Awesome DAW. That tape saturation sounds sweet and better than most tape plugins I've tried.", videos.official],
    ["I'm enjoying this! I love Ableton and this isn't meant to be a replacement but it's a pleasant change up.", videos.official],
    ["Picked it up, and found it to be a thoughtful design.", videos.questions],
    ["Picked up from your last video. This is exactly the DAW I've been wanting.", videos.questions],
    ["No horizontal scrolling — unthinkable — I like it.", videos.tales],
    ["I'm having fun trying this out", videos.questions],
    ["Actually it excellent just got it it’s very close to the reel thing", videos.questions],
    ["Love tape-16 makes music sound like its back in the day", videos.questions],
    ["I bought this straight away... I am really enjoying using it. It sounds great.", videos.demonic],
    ["Got it yesterday, it’s great!", videos.demonic],
    ["You convinced me, and it was totally worth it.", videos.demonic],
    ["I absolutely love this. I started fooling around with it last night.", videos.demonic],
    ["It’s easily worth the entry fee. This is so much fun to use... the latency is super low and sounds great.", videos.demonic],
    ["I bought it. Like it. I wanted an analog workflow.", videos.demonic],
    ["I instantly downloaded it after watching the video, and it's amazing.", videos.feezo],
    ["Love this DAW.", videos.feezo],
    ["For me the core creation in Tape 16 works. It's simple, to the point, without the extra options or noise.", videos.feezo],
    ["I downloaded this the day he released it and like it a lot.", videos.twin],
    ["I downloaded the product and I have to say it’s well thought out and designed... I really like the workflow.", videos.twin],
    ["Love this DAW, now my main workflow", videos.twin],
    ["just got it it is good", videos.twin],
    ["I like this, love the limitation and the way it opens up ideas.", videos.crow],
    ["Me doing live recording on Youtube to Tape 16. Extremely love it!!!", videos.jeej],
    ["This is quickly becoming my jam. Love having to use ears rather than eyes to create", videos.jeej],
    ["Love Tape 16 — it’s easy on the mind, it doesn't stress.", videos.jeej],
    ["I used it for the first time and really loved the feeling of what making music when I was younger felt like.", videos.greg],
    ["I use it more after I finish a track, but I still enjoy creating with it too. The hybrid approach just works best for me.", videos.greg],
    ["Did my 1st tune today with it, fun to use", videos.greg],
    ["I just finished a more than decent track with this thing. A lot of fun and so freeing.", videos.greg],
    ["Its actually quite good. I was sceptical but it does seem a simple way without the stress.", videos.greg],
    ["For me the core creation in Tape 16 works. It's simple to the point without the extra options or noise.", videos.greg],
    ["Tape 16 is it for me. It gets updated almost every Friday and the developer is super responsive.", videos.compare],
    ["I’ve been using Tape 16 for tracking... Tape 16 just feels like home for me.", videos.compare],
    ["I've got Tape 16 and just love the workflow with outboard gear and the weekly upgrades.", videos.compare],
    ["Using it myself, I love the simplicity of the UI... concentrating on composition and performance is very liberating.", videos.crow],
    ["I find this DAW fantastic. This concept is so quick, easy and performance-centric.", videos.crow],
    ["It's great fun, reminds me of being 15 again in 1984. I find it fun, which is enough for me.", videos.crow],
    ["I have been playing with it. I love that it slows me down, makes me think and be more intentional.", videos.trev],
    ["Just downloaded it. Super cool. I need those limitations.", videos.trev],
    ["I've been using it myself for a couple weeks. It has been pretty stable on the Mac.", videos.trev],
    ["I bought it as soon as I found out it's available. Tape 16 makes me feel home again.", videos.tales],
    ["I've been using it for the last few days and it's a whole lot of fun.", videos.tales],
    ["This is like coming home since I lost my 388. As a drummer, thank you for the remote, icing on the cake!", videos.tales],
  ];

  const rowSettings = [
    { duration: 116, reverse: false },
    { duration: 128, reverse: true },
    { duration: 122, reverse: false },
  ];

  const makeCard = ([quote, url], duplicate = false) => {
    const card = document.createElement("a");
    card.className = "youtube-testimonials__card";
    card.href = url;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
    card.style.width = `${Math.max(242, Math.min(360, 208 + quote.length * 1.45))}px`;

    if (duplicate) {
      card.setAttribute("aria-hidden", "true");
      card.tabIndex = -1;
    } else {
      card.setAttribute("aria-label", `${quote} — open source video`);
    }

    const quoteText = document.createElement("span");
    quoteText.className = "youtube-testimonials__quote";
    quoteText.textContent = `“${quote}”`;

    const source = document.createElement("span");
    source.className = "youtube-testimonials__source";
    source.textContent = "YouTube ↗";

    card.append(quoteText, source);
    return card;
  };

  rowSettings.forEach((settings, rowIndex) => {
    const row = document.createElement("div");
    row.className = "youtube-testimonials__row";
    row.dataset.direction = settings.reverse ? "reverse" : "forward";
    row.style.setProperty("--testimonial-duration", `${settings.duration}s`);

    const rowComments = comments.filter((_, index) => index % rowSettings.length === rowIndex);
    const originalGroup = document.createElement("div");
    originalGroup.className = "youtube-testimonials__group";
    const duplicateGroup = document.createElement("div");
    duplicateGroup.className = "youtube-testimonials__group";
    duplicateGroup.setAttribute("aria-hidden", "true");

    rowComments.forEach((comment) => {
      originalGroup.append(makeCard(comment));
      duplicateGroup.append(makeCard(comment, true));
    });

    row.append(originalGroup, duplicateGroup);
    field.append(row);
  });

  pauseButton.addEventListener("click", () => {
    const paused = root.classList.toggle("is-paused");
    pauseButton.setAttribute("aria-pressed", String(paused));
    pauseButton.innerHTML = paused ? "▶&nbsp;&nbsp;Resume" : "Ⅱ&nbsp;&nbsp;Pause";
  });
}

initializeYoutubeTestimonials();

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
const communityUploadForm = document.getElementById("community-upload-form");
const communityUploadStatus = document.getElementById("community-upload-form-status");
const communityUploadSubmitBtn = document.getElementById("community-upload-submit-btn");
const communityUploadType = document.getElementById("community-upload-type");
const communityUploadNameLabel = document.getElementById("community-upload-name-label");
const communityUploadFileLabel = document.getElementById("community-upload-file-label");
const communityUploadPreviewLabel = document.getElementById("community-upload-preview-label");
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
const communityUploadEmailInput = document.getElementById("community-upload-email");
const modBrowser = document.getElementById("mod-browser");
const modBrowserGrid = document.getElementById("mod-browser-grid");
const modBrowserEmpty = document.getElementById("mod-browser-empty");
const modBrowserStatus = document.getElementById("mod-browser-status");
const modBrowserSearch = document.getElementById("mod-browser-search");
const modBrowserSort = document.getElementById("mod-browser-sort");
const modBrowserTitle = document.getElementById("mod-browser-title");
const modBrowserEyebrow = document.getElementById("mod-browser-eyebrow");
const modBrowserCopy = document.getElementById("mod-browser-copy");
const modBrowserUploadLink = document.getElementById("mod-browser-upload-link");
const modBrowserEmptyAction = document.getElementById("mod-browser-empty-action");
const modBrowserPagination = document.querySelectorAll("[data-mod-browser-pagination]");
const modCategoryFilters = document.querySelectorAll("[data-mod-category]");
const fullDownloadLink = document.getElementById("full-download-link");
const downloadPageWindowsLink =
  document.getElementById("download-page-windows-link") ||
  document.getElementById("download-page-demo-link");
const downloadPageLinuxLink = document.getElementById("download-page-linux-link");
const downloadCtaLink = document.getElementById("download-cta-link");
const getTape16Link = document.getElementById("get-tape-16-link");
const homeWindowsDownloadLink = document.getElementById("home-windows-download-link");
const homeLinuxDownloadLink = document.getElementById("home-linux-download-link");
const directDownloadMacLink = document.getElementById("direct-download-mac-link");
const directDownloadWindowsLink = document.getElementById("direct-download-windows-link");
const directDownloadReleaseLink = document.getElementById("direct-download-release-link");
const accountLoginForm = document.getElementById("account-login-form");
const accountStatus = document.getElementById("account-status");
const accountLoginBtn = document.getElementById("account-login-btn");
const accountRefreshBtn = document.getElementById("account-refresh-btn");
const accountLogoutBtn = document.getElementById("account-logout-btn");
const accountSessionActions = document.getElementById("account-session-actions");
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
const MOD_BROWSER_PAGE_SIZE = 12;
let themeLibraryItems = [];
let themeCurrentPage = 1;
let activeModCategory = "themes";
let modBrowserCurrentPage = 1;
let modBrowserItems = [];
let modBrowserCategoryCounts = {
  themes: 0,
  controller_profiles: 0,
  midi_profiles: 0,
  tape_mods: 0,
};

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

const META_TAPE16_PRODUCT = {
  content_ids: ["tape16_full_license"],
  content_name: "TAPE 16 Full License",
  content_type: "product",
  value: 29.0,
  currency: "USD",
  num_items: 1,
};

function trackMetaCheckoutEvent(eventName, paymentMethod) {
  if (typeof window.fbq !== "function") return;
  try {
    window.fbq("track", eventName, {
      ...META_TAPE16_PRODUCT,
      payment_method: paymentMethod,
    });
  } catch (error) {
    // Never let analytics prevent checkout from continuing.
  }
}

function bindMetaStartTrialTracking(linkEl) {
  if (!linkEl || linkEl.dataset.boundMetaStartTrial === "1") return;

  linkEl.addEventListener("click", () => {
    const destination = linkEl.href || "";
    if (!destination || destination === "#" || linkEl.dataset.missingDownload === "1") return;
    if (typeof window.fbq !== "function") return;

    try {
      window.fbq("track", "StartTrial", {
        content_ids: ["tape16_7_day_demo"],
        content_name: "TAPE 16 7-Day Demo",
        content_type: "product",
        value: 0.0,
        currency: "USD",
        predicted_ltv: 29.0,
        platform: linkEl.dataset.metaStartTrial || "desktop",
      });
    } catch (error) {
      // Never let analytics prevent an installer download.
    }
  });

  linkEl.dataset.boundMetaStartTrial = "1";
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

      trackMetaCheckoutEvent("AddToCart", "stripe");

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
        trackMetaCheckoutEvent("InitiateCheckout", "stripe");
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

        trackMetaCheckoutEvent("AddToCart", "paypal");
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
          trackMetaCheckoutEvent("InitiateCheckout", "paypal");
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
  "https://github.com/jackpaterson1/TAPE-16-Public-Releases/releases/download/0.9.371/TAPE-16-v0.9.371-macOS.dmg";
const pinnedWindowsDownloadUrl =
  "https://github.com/jackpaterson1/TAPE-16-Public-Releases/releases/download/0.9.371/TAPE-16-v0.9.371-Windows-Setup.zip";
const pinnedGithubReleaseUrl =
  "https://github.com/jackpaterson1/TAPE-16-Public-Releases/releases/tag/0.9.371";
const releaseDownloadUrl = configUrl(config.releaseDownloadUrl) || pinnedReleaseDownloadUrl;
const windowsDownloadUrl = configUrl(config.windowsDownloadUrl) || pinnedWindowsDownloadUrl;
const linuxDownloadUrl = configUrl(config.linuxDownloadUrl);
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

if (downloadPageLinuxLink) {
  configureDirectDownloadLink(downloadPageLinuxLink, linuxDownloadUrl);
}

if (downloadCtaLink) {
  const fullUrl = releaseDownloadUrl;
  configureDirectDownloadLink(downloadCtaLink, fullUrl);
}

if (getTape16Link) {
  configureDirectDownloadLink(getTape16Link, releaseDownloadUrl);
}

if (homeWindowsDownloadLink) {
  configureDirectDownloadLink(homeWindowsDownloadLink, windowsDownloadUrl);
}

if (homeLinuxDownloadLink) {
  configureDirectDownloadLink(homeLinuxDownloadLink, linuxDownloadUrl);
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
bindDownloadClickTracking(downloadPageLinuxLink, "Download Linux");
bindDownloadClickTracking(demoLink, "Download Demo");
bindDownloadClickTracking(homeWindowsDownloadLink, "Download Windows");
bindDownloadClickTracking(homeLinuxDownloadLink, "Download Linux");

startPromoteKitTracking();
bindDownloadClickTracking(directDownloadMacLink, "Direct Download Mac");
bindDownloadClickTracking(directDownloadWindowsLink, "Direct Download Windows");
bindDownloadClickTracking(directDownloadReleaseLink, "Direct Downloads");
document.querySelectorAll("[data-meta-start-trial]").forEach(bindMetaStartTrialTracking);

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

function setCommunityUploadStatus(message, isError) {
  if (!communityUploadStatus) return;
  communityUploadStatus.textContent = message;
  communityUploadStatus.style.color = isError ? "#ff9d87" : "#f7c34b";
}

const previewCropFiles = new WeakMap();
const previewCropOriginalFiles = new WeakMap();
const PREVIEW_CROP_WIDTH = 1600;
const PREVIEW_CROP_HEIGHT = 900;

function selectedPreviewFile(input) {
  return previewCropFiles.get(input) || input?.files?.[0] || null;
}

function previewCropStateElement(input) {
  return input
    ?.closest(".preview-upload-control, .theme-file-action, .theme-manage-replace, label")
    ?.querySelector("[data-preview-crop-state]") || null;
}

function setPreviewCropState(input, message, isReady = false) {
  const state = previewCropStateElement(input);
  if (!state) return;
  state.textContent = message;
  state.classList.toggle("is-ready", Boolean(isReady));
}

function clearPreviewCropSelection(input) {
  if (!input) return;
  previewCropFiles.delete(input);
  previewCropOriginalFiles.delete(input);
  setPreviewCropState(input, "Choose a photo to crop it to the card’s 16:9 shape.", false);
}

function loadPreviewCropImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => resolve({ image, objectUrl });
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read image"));
    };
    image.src = objectUrl;
  });
}

async function openPreviewCropper(file) {
  const loaded = await loadPreviewCropImage(file);
  const dialog = document.createElement("dialog");
  dialog.className = "preview-crop-dialog";
  dialog.setAttribute("aria-labelledby", "preview-crop-title");
  dialog.innerHTML = `
    <div class="preview-crop-shell">
      <div class="preview-crop-head">
        <div>
          <p class="eyebrow">Preview photo</p>
          <h2 id="preview-crop-title">Crop for the community card</h2>
        </div>
        <button class="preview-crop-close" type="button" data-preview-crop-cancel aria-label="Close photo cropper">×</button>
      </div>
      <div class="preview-crop-stage">
        <canvas
          width="${PREVIEW_CROP_WIDTH}"
          height="${PREVIEW_CROP_HEIGHT}"
          tabindex="0"
          aria-label="Photo crop. Drag to reposition, or use the arrow keys."
        ></canvas>
      </div>
      <p class="preview-crop-help">Drag the photo to position it. The frame matches the 16:9 preview shown on every mod card.</p>
      <label class="preview-crop-zoom">
        <span>Zoom <output>100%</output></span>
        <input type="range" min="1" max="3" value="1" step="0.01" aria-label="Photo zoom" />
      </label>
      <div class="preview-crop-actions">
        <button class="btn btn-ghost" type="button" data-preview-crop-original>Use Original</button>
        <button class="btn btn-primary" type="button" data-preview-crop-apply>Apply Crop</button>
      </div>
    </div>
  `;
  document.body.append(dialog);

  const canvas = dialog.querySelector("canvas");
  const context = canvas.getContext("2d");
  const zoomInput = dialog.querySelector('input[type="range"]');
  const zoomOutput = dialog.querySelector("output");
  const image = loaded.image;
  const baseScale = Math.max(
    PREVIEW_CROP_WIDTH / image.naturalWidth,
    PREVIEW_CROP_HEIGHT / image.naturalHeight,
  );
  let zoom = 1;
  let offsetX = 0;
  let offsetY = 0;
  let dragging = false;
  let activePointerId = null;
  let lastPointerX = 0;
  let lastPointerY = 0;

  function clampCropPosition() {
    const drawnWidth = image.naturalWidth * baseScale * zoom;
    const drawnHeight = image.naturalHeight * baseScale * zoom;
    const maxX = Math.max(0, (drawnWidth - PREVIEW_CROP_WIDTH) / 2);
    const maxY = Math.max(0, (drawnHeight - PREVIEW_CROP_HEIGHT) / 2);
    offsetX = Math.max(-maxX, Math.min(maxX, offsetX));
    offsetY = Math.max(-maxY, Math.min(maxY, offsetY));
  }

  function renderPreviewCrop() {
    clampCropPosition();
    const drawnWidth = image.naturalWidth * baseScale * zoom;
    const drawnHeight = image.naturalHeight * baseScale * zoom;
    const x = (PREVIEW_CROP_WIDTH - drawnWidth) / 2 + offsetX;
    const y = (PREVIEW_CROP_HEIGHT - drawnHeight) / 2 + offsetY;
    context.clearRect(0, 0, PREVIEW_CROP_WIDTH, PREVIEW_CROP_HEIGHT);
    context.drawImage(image, x, y, drawnWidth, drawnHeight);
    zoomOutput.value = `${Math.round(zoom * 100)}%`;
  }

  function moveCropBy(clientDeltaX, clientDeltaY) {
    const bounds = canvas.getBoundingClientRect();
    offsetX += clientDeltaX * (PREVIEW_CROP_WIDTH / bounds.width);
    offsetY += clientDeltaY * (PREVIEW_CROP_HEIGHT / bounds.height);
    renderPreviewCrop();
  }

  zoomInput.addEventListener("input", () => {
    zoom = Number(zoomInput.value || 1);
    renderPreviewCrop();
  });

  canvas.addEventListener("pointerdown", (event) => {
    dragging = true;
    activePointerId = event.pointerId;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add("is-dragging");
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!dragging || event.pointerId !== activePointerId) return;
    moveCropBy(event.clientX - lastPointerX, event.clientY - lastPointerY);
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
  });

  const endDrag = (event) => {
    if (event.pointerId !== activePointerId) return;
    dragging = false;
    activePointerId = null;
    canvas.classList.remove("is-dragging");
  };
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);

  canvas.addEventListener("keydown", (event) => {
    const movement = event.shiftKey ? 4 : 16;
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "ArrowLeft") offsetX -= movement;
    if (event.key === "ArrowRight") offsetX += movement;
    if (event.key === "ArrowUp") offsetY -= movement;
    if (event.key === "ArrowDown") offsetY += movement;
    renderPreviewCrop();
  });

  renderPreviewCrop();
  dialog.showModal();
  zoomInput.focus();

  return await new Promise((resolve) => {
    let finished = false;

    const finish = (result) => {
      if (finished) return;
      finished = true;
      URL.revokeObjectURL(loaded.objectUrl);
      if (dialog.open) dialog.close();
      dialog.remove();
      resolve(result);
    };

    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      finish({ action: "cancel", file: null });
    });
    dialog.querySelectorAll("[data-preview-crop-cancel]").forEach((button) => {
      button.addEventListener("click", () => finish({ action: "cancel", file: null }));
    });
    dialog.querySelectorAll("[data-preview-crop-original]").forEach((button) => {
      button.addEventListener("click", () => finish({ action: "original", file }));
    });
    dialog.querySelector("[data-preview-crop-apply]").addEventListener("click", () => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            finish({ action: "cancel", file: null });
            return;
          }
          const baseName = String(file.name || "preview").replace(/\.[^.]+$/, "") || "preview";
          const extension = blob.type === "image/webp" ? "webp" : "jpg";
          finish({
            action: "cropped",
            file: new File([blob], `${baseName}-cropped.${extension}`, {
              type: blob.type || "image/jpeg",
              lastModified: Date.now(),
            }),
          });
        },
        "image/webp",
        0.9,
      );
    });
  });
}

async function cropPreviewInput(input) {
  const originalFile = previewCropOriginalFiles.get(input) || input?.files?.[0] || null;
  if (!input || !originalFile) {
    setPreviewCropState(input, "Choose a photo first.", false);
    return "cancel";
  }
  try {
    const result = await openPreviewCropper(originalFile);
    if (result?.action === "cropped" && result.file) {
      previewCropFiles.set(input, result.file);
      setPreviewCropState(input, `Cropped to 16:9 • ${formatFileSize(result.file.size)}`, true);
      return "cropped";
    }
    if (result?.action === "original" && result.file) {
      previewCropFiles.set(input, result.file);
      setPreviewCropState(input, "Using the original photo.", true);
      return "original";
    }
    previewCropFiles.delete(input);
    setPreviewCropState(input, "Photo change cancelled.", false);
    return "cancel";
  } catch (error) {
    previewCropFiles.delete(input);
    setPreviewCropState(input, "Could not open this photo for cropping. The original will be used.", false);
    return "cancel";
  }
}

async function cropCurrentManagedPreview(button, itemEl) {
  const input = itemEl?.querySelector('input[name="previewImage"]') || null;
  const previewUrl = String(button?.dataset.previewUrl || "");
  if (!input || !previewUrl) return;

  button.disabled = true;
  setThemeManageStatus(itemEl, "Loading current preview...", false);
  try {
    const response = await fetch(previewUrl, { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load current preview");
    const blob = await response.blob();
    if (!blob.size || !String(blob.type || "").startsWith("image/")) {
      throw new Error("Current preview is not a readable image");
    }

    const type = blob.type || "image/png";
    const extension =
      type === "image/webp"
        ? "webp"
        : type === "image/jpeg"
          ? "jpg"
          : "png";
    const baseName =
      String(button.dataset.previewFilename || "current-preview").replace(/\.[^.]+$/, "") ||
      "current-preview";
    const currentPreview = new File([blob], `${baseName}.${extension}`, {
      type,
      lastModified: Date.now(),
    });
    previewCropFiles.delete(input);
    previewCropOriginalFiles.set(input, currentPreview);
    const cropAction = await cropPreviewInput(input);

    if (cropAction === "cropped" && previewCropFiles.has(input)) {
      setThemeManageStatus(itemEl, "Saving cropped preview...", false);
      await replaceManagedThemeFile(itemEl, "preview");
    } else {
      setThemeManageStatus(itemEl, "Current preview was not changed.", false);
    }
  } catch (error) {
    setThemeManageStatus(itemEl, "Could not load the current preview for cropping.", true);
  } finally {
    button.disabled = false;
  }
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
  [themeEmailInput, communityUploadEmailInput].forEach((input) => {
    if (!input) return;
    if (session?.email) {
      input.value = session.email;
      input.readOnly = true;
      input.setAttribute("aria-readonly", "true");
    } else {
      input.readOnly = false;
      input.removeAttribute("aria-readonly");
    }
  });
}

function communityManageConfig(type) {
  if (type === "mod") {
    return {
      label: "Tape Mod",
      pluralLabel: "tape mods",
      route: "mods",
      nameField: "modName",
      fileField: "modFile",
      fileAccept: ".zip,application/zip",
      fileLabel: "Mod ZIP",
      filePattern: /\.zip$/i,
      fileError: "Upload a ZIP package.",
      maxBytes: 50 * 1024 * 1024,
      category: "tape_mods",
    };
  }
  if (type === "controller_profile") {
    return {
      label: "Controller Profile",
      pluralLabel: "controller profiles",
      route: "controller-profiles",
      nameField: "controllerProfileName",
      fileField: "controllerProfileFile",
      fileAccept: ".tape16controller,application/zip",
      fileLabel: "Profile Package",
      filePattern: /\.tape16controller$/i,
      fileError: "Upload a .tape16controller package.",
      maxBytes: 20 * 1024 * 1024,
      category: "controller_profiles",
    };
  }
  if (type === "midi_profile") {
    return {
      label: "MIDI Profile",
      pluralLabel: "MIDI profiles",
      route: "midi-profiles",
      nameField: "midiProfileName",
      fileField: "midiProfileFile",
      fileAccept: ".tape16-midi-profile,.xml,text/xml,application/xml",
      fileLabel: "Profile File",
      filePattern: /\.(tape16-midi-profile|xml)$/i,
      fileError: "Upload a .tape16-midi-profile or .xml file.",
      maxBytes: 5 * 1024 * 1024,
      category: "midi_profiles",
    };
  }
  return {
    label: "Theme",
    pluralLabel: "themes",
    route: "themes",
    nameField: "themeName",
    fileField: "themeFile",
    fileAccept: ".zip,application/zip",
    fileLabel: "ZIP",
    filePattern: /\.zip$/i,
    fileError: "Upload a ZIP package.",
    maxBytes: 50 * 1024 * 1024,
    category: "themes",
  };
}

function themeManageItemHtml(item) {
  const config = communityManageConfig(item.type);
  const tags = Array.isArray(item.tags) ? item.tags.join(", ") : "";
  const packageSize = formatFileSize(item.packageSize);
  const previewSize = formatFileSize(item.previewSize);
  const previewUrl = item.hasPreview ? themeApiUrl(item.previewUrl) : "";
  const fileMeta = [
    item.packageFilename || "ZIP package",
    packageSize,
    item.hasPreview ? `Preview${previewSize ? ` ${previewSize}` : ""}` : "No preview",
  ].filter(Boolean);
  const fileMetaHtml = fileMeta.map((value) => `<span>${escapeHtml(value)}</span>`).join("");

  return `
    <article class="theme-manage-item${previewUrl ? " has-current-preview" : ""}" data-theme-slug="${escapeHtml(item.slug || "")}" data-community-type="${escapeHtml(item.type || "theme")}">
      <div class="theme-manage-head">
        <div>
          <h3>${escapeHtml(item.name || `Untitled ${config.label}`)}</h3>
          <p class="mod-card-kicker">${escapeHtml(config.label)}</p>
          <div class="theme-manage-meta">${fileMetaHtml}</div>
        </div>
        <a class="btn btn-ghost" href="${escapeHtml(themeApiUrl(item.downloadUrl))}" data-theme-download>Download</a>
      </div>
      ${
        previewUrl
          ? `
            <div class="theme-manage-current-preview">
              <span>Current Preview</span>
              <img src="${escapeHtml(previewUrl)}" alt="${escapeHtml(item.name || config.label)} current preview" loading="lazy" />
              <button
                class="btn btn-ghost"
                type="button"
                data-preview-crop-current
                data-preview-url="${escapeHtml(previewUrl)}"
                data-preview-filename="${escapeHtml(item.previewFilename || "current-preview.png")}"
              >Adjust Current Photo</button>
            </div>
          `
          : ""
      }
      <div class="theme-manage-fields">
        <label>
          ${escapeHtml(config.label)} Name
          <input name="${escapeHtml(config.nameField)}" type="text" value="${escapeHtml(item.name || "")}" />
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
          <textarea name="description" rows="2">${escapeHtml(item.description || "")}</textarea>
        </label>
        <div class="theme-manage-field-actions">
          <button class="btn btn-primary" type="button" data-theme-manage-save disabled>Saved</button>
          <p class="serial-status theme-manage-status" role="status" aria-live="polite"></p>
        </div>
      </div>
      <div class="theme-manage-actions">
        <div class="theme-manage-replace">
          <span>${escapeHtml(config.fileLabel)}</span>
          <button class="btn btn-ghost" type="button" data-managed-file-picker="package">Replace ${escapeHtml(config.fileLabel)}</button>
          <input hidden data-managed-file-input="package" name="${escapeHtml(config.fileField)}" type="file" accept="${escapeHtml(config.fileAccept)}" />
        </div>
        <div class="theme-manage-replace">
          <span>Preview Photo</span>
          <button class="btn btn-ghost" type="button" data-managed-file-picker="preview">Replace Photo</button>
          <input hidden data-managed-file-input="preview" name="previewImage" type="file" accept=".png,.jpg,.jpeg,.webp" />
          <small data-preview-crop-state>Choose, crop, and save a new photo.</small>
        </div>
        <details class="theme-manage-more">
          <summary class="btn btn-ghost">More</summary>
          <div class="theme-manage-more-menu">
            <button class="btn btn-ghost theme-delete-btn" type="button" data-theme-manage-delete>Delete ${escapeHtml(config.label)}</button>
          </div>
        </details>
      </div>
    </article>
  `;
}

function renderThemeAccountThemes(items) {
  if (!themeAccountPanel || !themeAccountSummary || !themeAccountList) return;
  const uploads = Array.isArray(items) ? items : [];
  themeAccountSummary.textContent =
    uploads.length === 1 ? "1 community upload linked to this email." : `${uploads.length} community uploads linked to this email.`;
  themeAccountList.innerHTML = uploads.length
    ? uploads.map(themeManageItemHtml).join("")
    : `<p class="activation-empty">No community uploads are linked to this email yet.</p>`;
  themeAccountPanel.hidden = false;
  bindThemeDownloads();
}

async function refreshCommunityManagedViews(category) {
  if (category === "themes") await loadThemeLibrary();
  if (modBrowser && (!category || activeModCategory === category)) {
    await loadModBrowserCategory(category || activeModCategory);
  }
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
    if (!options.silent) setThemeAccountStatus("Sign in to manage your community uploads.", false);
    return;
  }

  const supportBase = themeApiBaseUrl();
  if (!supportBase) {
    setThemeAccountStatus("Mod account service is not configured yet.", true);
    return;
  }

  setThemeAccountLoading(true);
  if (!options.silent) setThemeAccountStatus("Loading your community uploads...", false);
  try {
    const response = await fetch(`${supportBase.replace(/\/+$/, "")}/mod-account/items`, {
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
    if (!response.ok || !body.ok) throw new Error(body.error || "Could not load uploads");
    renderThemeAccountThemes(body.items || []);
    applyThemeAccountUploadState();
    setThemeAccountStatus(`Signed in as ${session.email}.`, false);
  } catch (error) {
    setThemeAccountStatus("Could not load your community uploads right now.", true);
  } finally {
    setThemeAccountLoading(false);
  }
}

async function loginThemeAccount(credentials) {
  const supportBase = themeApiBaseUrl();
  if (!supportBase) {
    setThemeAccountStatus("Mod account service is not configured yet.", true);
    return;
  }

  setThemeAccountLoading(true);
  setThemeAccountStatus("Signing in...", false);
  try {
    const response = await fetch(`${supportBase.replace(/\/+$/, "")}/mod-account/login`, {
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
    setThemeAccountStatus("Signed in. Your matching community uploads are linked.", false);
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
  const config = communityManageConfig(itemEl?.dataset.communityType || "theme");
  const saveButton = itemEl.querySelector("[data-theme-manage-save]");

  const payload = {
    [config.nameField]: itemEl.querySelector(`[name="${config.nameField}"]`)?.value || "",
    creator: itemEl.querySelector('[name="creator"]')?.value || "",
    appVersion: itemEl.querySelector('[name="appVersion"]')?.value || "",
    tags: itemEl.querySelector('[name="tags"]')?.value || "",
    description: itemEl.querySelector('[name="description"]')?.value || "",
  };
  if (!payload[config.nameField].trim() || !payload.creator.trim()) {
    setThemeManageStatus(itemEl, `${config.label} name and creator name are required.`, true);
    return;
  }

  if (saveButton) {
    saveButton.disabled = true;
    saveButton.textContent = "Saving...";
  }
  setThemeManageStatus(itemEl, "Saving details...", false);
  try {
    const response = await fetch(`${supportBase.replace(/\/+$/, "")}/${config.route}/${encodeURIComponent(slug)}`, {
      method: "PATCH",
      headers: themeAccountAuthHeaders(session, { "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.ok) throw new Error(body.error || "Save failed");
    setThemeManageStatus(itemEl, `${config.label} details saved.`, false);
    await refreshCommunityManagedViews(config.category);
    await loadThemeAccountThemes({ silent: true });
  } catch (error) {
    if (saveButton) {
      saveButton.disabled = false;
      saveButton.textContent = "Save Details";
    }
    setThemeManageStatus(itemEl, "Could not save details right now.", true);
  }
}

async function replaceManagedThemeFile(itemEl, kind) {
  const session = readThemeAccountSession();
  const supportBase = themeApiBaseUrl();
  const slug = itemEl?.dataset.themeSlug || "";
  if (!session || !supportBase || !slug) return;
  const config = communityManageConfig(itemEl?.dataset.communityType || "theme");

  const isPreview = kind === "preview";
  const input = itemEl.querySelector(isPreview ? '[name="previewImage"]' : `[name="${config.fileField}"]`);
  const file = isPreview ? selectedPreviewFile(input) : input?.files?.[0] || null;
  if (!file) {
    setThemeManageStatus(itemEl, isPreview ? "Choose a preview image first." : `Choose a ${config.fileLabel.toLowerCase()} first.`, true);
    return;
  }
  const validPackage = config.filePattern.test(file.name || "");
  if (!isPreview && !validPackage) {
    setThemeManageStatus(itemEl, config.fileError, true);
    return;
  }
  if (!isPreview && (file.size || 0) > config.maxBytes) {
    setThemeManageStatus(itemEl, `${config.fileLabel} exceeds ${formatFileSize(config.maxBytes)}.`, true);
    return;
  }
  if (isPreview && !/\.(png|jpe?g|webp)$/i.test(file.name || "")) {
    setThemeManageStatus(itemEl, "Preview image must be PNG, JPG, or WebP.", true);
    return;
  }
  if (isPreview && (file.size || 0) > 5 * 1024 * 1024) {
    setThemeManageStatus(itemEl, "Preview image must be 5MB or smaller. Crop it to reduce the file size.", true);
    return;
  }

  const formData = new FormData();
  formData.append(isPreview ? "previewImage" : config.fileField, file);
  setThemeManageStatus(itemEl, isPreview ? "Uploading preview..." : `Uploading ${config.fileLabel.toLowerCase()}...`, false);
  try {
    const endpoint = `${supportBase.replace(/\/+$/, "")}/${config.route}/${encodeURIComponent(slug)}/${isPreview ? "preview" : "package"}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: themeAccountAuthHeaders(session),
      body: formData,
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.ok) throw new Error(body.error || "Upload failed");
    input.value = "";
    if (isPreview) clearPreviewCropSelection(input);
    setThemeManageStatus(itemEl, isPreview ? "Preview replaced." : `${config.fileLabel} replaced.`, false);
    await refreshCommunityManagedViews(config.category);
    await loadThemeAccountThemes({ silent: true });
  } catch (error) {
    setThemeManageStatus(itemEl, isPreview ? "Could not replace preview right now." : `Could not replace ${config.fileLabel.toLowerCase()} right now.`, true);
  }
}

async function deleteManagedTheme(itemEl) {
  const session = readThemeAccountSession();
  const supportBase = themeApiBaseUrl();
  const slug = itemEl?.dataset.themeSlug || "";
  if (!session || !supportBase || !slug) return;
  const config = communityManageConfig(itemEl?.dataset.communityType || "theme");

  const name =
    itemEl.querySelector(`[name="${config.nameField}"]`)?.value?.trim() ||
    itemEl.querySelector("h3")?.textContent?.trim() ||
    `this ${config.label.toLowerCase()}`;
  const confirmed = window.confirm(
    `Delete "${name}"? This removes it from the public community library and cannot be undone.`,
  );
  if (!confirmed) return;

  setThemeManageStatus(itemEl, `Deleting ${config.label.toLowerCase()}...`, false);
  try {
    const response = await fetch(`${supportBase.replace(/\/+$/, "")}/${config.route}/${encodeURIComponent(slug)}`, {
      method: "DELETE",
      headers: themeAccountAuthHeaders(session),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.ok) throw new Error(body.error || "Delete failed");
    setThemeManageStatus(itemEl, `${config.label} deleted.`, false);
    await refreshCommunityManagedViews(config.category);
    await loadThemeAccountThemes({ silent: true });
  } catch (error) {
    setThemeManageStatus(itemEl, `Could not delete ${config.label.toLowerCase()} right now.`, true);
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

const MOD_BROWSER_CATEGORIES = {
  themes: {
    label: "Themes",
    title: "Download themes",
    copy: "Browse exported TAPE 16 theme ZIPs from the community.",
    endpoint: "themes",
    uploadHref: "#upload-community-mod",
    uploadLabel: "Upload Mod",
    downloadLabel: "Download ZIP",
    emptyTitle: "No themes match",
    emptyCopy: "Try another search, or upload the first theme that fits this filter.",
  },
  controller_profiles: {
    label: "Controller Profiles",
    title: "Browse controller profiles",
    copy: "Download custom hardware mappings exported from TAPE 16, including controls, feedback, and setup notes.",
    endpoint: "controller-profiles",
    uploadHref: "#upload-community-mod",
    uploadLabel: "Upload Profile",
    downloadLabel: "Download Profile",
    emptyTitle: "No controller profiles yet",
    emptyCopy: "Upload the first custom controller profile for the community.",
  },
  midi_profiles: {
    label: "MIDI Profiles",
    title: "Browse MIDI profiles",
    copy: "Shared MIDI learn profiles and portable setup mappings from the community.",
    endpoint: "midi-profiles",
    uploadHref: "#upload-community-mod",
    uploadLabel: "Upload Mod",
    downloadLabel: "Download Profile",
    emptyTitle: "No MIDI profiles yet",
    emptyCopy: "Upload the first shared MIDI profile for the community.",
  },
  tape_mods: {
    label: "Tape Mods",
    title: "Browse tape mods",
    copy: "Community tape modulation presets and sound-shaping packs will appear here.",
    endpoint: "mods",
    uploadHref: "feature-request.html",
    uploadLabel: "Request Uploads",
    downloadLabel: "Download Mod",
    emptyTitle: "No tape mods yet",
    emptyCopy: "This category is ready for tape mod uploads.",
  },
};

function currentModCategoryConfig() {
  return MOD_BROWSER_CATEGORIES[activeModCategory] || MOD_BROWSER_CATEGORIES.themes;
}

function setModBrowserStatus(message, isError = false) {
  if (!modBrowserStatus) return;
  modBrowserStatus.textContent = message || "";
  modBrowserStatus.classList.toggle("is-error", Boolean(isError));
}

function updateModCategoryCounts() {
  Object.entries(modBrowserCategoryCounts).forEach(([category, count]) => {
    const el = document.querySelector(`[data-mod-category-count="${category}"]`);
    if (el) el.textContent = String(count || 0);
  });
}

function setActiveModCategory(category) {
  activeModCategory = MOD_BROWSER_CATEGORIES[category] ? category : "themes";
  modCategoryFilters.forEach((button) => {
    const isActive = button.dataset.modCategory === activeModCategory;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  const config = currentModCategoryConfig();
  if (modBrowserEyebrow) modBrowserEyebrow.textContent = config.label;
  if (modBrowserTitle) modBrowserTitle.textContent = config.title;
  if (modBrowserCopy) modBrowserCopy.textContent = config.copy;
  if (modBrowserUploadLink) {
    modBrowserUploadLink.href = config.uploadHref;
    modBrowserUploadLink.textContent = config.uploadLabel;
  }
  if (modBrowserEmptyAction) {
    modBrowserEmptyAction.href = config.uploadHref;
    modBrowserEmptyAction.textContent = config.uploadLabel;
  }
}

function modBrowserApiUrl(path) {
  return themeApiUrl(path);
}

function modBrowserMetaLabel(item) {
  const downloads = Number(item.downloadCount || 0);
  const size = formatFileSize(item.packageSize);
  return [
    item.appVersion ? `TAPE 16 ${item.appVersion}` : "",
    size,
    downloads === 1 ? "1 download" : `${downloads} downloads`,
  ].filter(Boolean);
}

function modBrowserCardHtml(item) {
  const config = currentModCategoryConfig();
  const tags = Array.isArray(item.tags) ? item.tags.filter(Boolean) : [];
  const downloadUrl = modBrowserApiUrl(item.downloadUrl);
  const previewUrl = modBrowserApiUrl(item.previewUrl);
  const preview = previewUrl
    ? `<img src="${escapeHtml(previewUrl)}" alt="${escapeHtml(item.name)} preview" loading="lazy" />`
    : `<span>${escapeHtml(String(item.packageFilename || config.label).replace(/^.*\./, "").toUpperCase())}</span>`;
  const meta = modBrowserMetaLabel(item);

  return `
    <article class="mod-card" data-mod-id="${escapeHtml(item.id || item.slug || "")}">
      <div class="mod-card-preview">${preview}</div>
      <div class="mod-card-body">
        <p class="mod-card-kicker">${escapeHtml(config.label)}</p>
        <h3>${escapeHtml(item.name || "Untitled Upload")}</h3>
        <p class="mod-card-creator">By ${escapeHtml(item.creatorName || "Unknown creator")}</p>
        <p class="mod-card-description" data-theme-description>${escapeHtml(item.description || "No description supplied.")}</p>
        <button class="theme-description-toggle" type="button" data-theme-description-toggle hidden>See more...</button>
        <div class="mod-card-meta">
          ${meta.map((value) => `<span>${escapeHtml(value)}</span>`).join("")}
        </div>
        <div class="mod-card-tags">
          ${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
        </div>
      </div>
      <div class="mod-card-actions">
        <a class="btn btn-primary" href="${escapeHtml(downloadUrl)}" data-mod-browser-download>${escapeHtml(config.downloadLabel)}</a>
      </div>
    </article>
  `;
}

function filteredModBrowserItems() {
  const query = String(modBrowserSearch?.value || "").trim().toLowerCase();
  if (!query) return modBrowserItems;
  return modBrowserItems.filter((item) => {
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

function renderModBrowserPagination(totalItems) {
  if (!modBrowserPagination.length) return;
  const totalPages = Math.ceil(totalItems / MOD_BROWSER_PAGE_SIZE);
  if (totalPages <= 1) {
    modBrowserPagination.forEach((pagination) => {
      pagination.innerHTML = "";
      pagination.hidden = true;
    });
    return;
  }

  const pageButtons = Array.from({ length: totalPages }, (_, index) => {
    const page = index + 1;
    return `<button class="theme-page-btn${page === modBrowserCurrentPage ? " is-active" : ""}" type="button" data-mod-browser-page="${page}" aria-current="${page === modBrowserCurrentPage ? "page" : "false"}">${page}</button>`;
  }).join("");

  const paginationHtml = `
    <button class="theme-page-btn" type="button" data-mod-browser-page="prev" ${modBrowserCurrentPage <= 1 ? "disabled" : ""}>Prev</button>
    <span>${modBrowserCurrentPage} / ${totalPages}</span>
    ${pageButtons}
    <button class="theme-page-btn" type="button" data-mod-browser-page="next" ${modBrowserCurrentPage >= totalPages ? "disabled" : ""}>Next</button>
  `;

  modBrowserPagination.forEach((pagination) => {
    pagination.hidden = false;
    pagination.innerHTML = paginationHtml;
  });
}

function renderModBrowser() {
  if (!modBrowserGrid || !modBrowserEmpty) return;
  const config = currentModCategoryConfig();
  const items = filteredModBrowserItems();
  const totalPages = Math.max(1, Math.ceil(items.length / MOD_BROWSER_PAGE_SIZE));
  modBrowserCurrentPage = Math.min(Math.max(1, modBrowserCurrentPage), totalPages);
  const start = (modBrowserCurrentPage - 1) * MOD_BROWSER_PAGE_SIZE;
  const visibleItems = items.slice(start, start + MOD_BROWSER_PAGE_SIZE);
  modBrowserGrid.innerHTML = visibleItems.map(modBrowserCardHtml).join("");
  modBrowserGrid.hidden = items.length === 0;
  modBrowserEmpty.hidden = items.length > 0;
  renderModBrowserPagination(items.length);
  const emptyTitle = modBrowserEmpty.querySelector("h3");
  const emptyCopy = modBrowserEmpty.querySelector("p");
  if (emptyTitle) emptyTitle.textContent = config.emptyTitle;
  if (emptyCopy) emptyCopy.textContent = config.emptyCopy;
  bindModBrowserDownloads();
  bindThemeDescriptionToggles();
}

async function loadModBrowserCategory(category = activeModCategory) {
  if (!modBrowserGrid) return;
  setActiveModCategory(category);
  const config = currentModCategoryConfig();
  modBrowserItems = [];
  modBrowserCurrentPage = 1;
  renderModBrowser();

  if (!config.endpoint) {
    setModBrowserStatus("", false);
    modBrowserCategoryCounts[activeModCategory] = 0;
    updateModCategoryCounts();
    return;
  }

  if (window.location.protocol === "file:") {
    setModBrowserStatus("Community downloads only load on the live website or a local web server preview.", true);
    return;
  }

  const supportBase = themeApiBaseUrl();
  if (!supportBase) {
    setModBrowserStatus("Community library service is not configured yet.", true);
    return;
  }

  setModBrowserStatus(`Loading ${config.label.toLowerCase()}...`, false);
  try {
    const sort = modBrowserSort ? String(modBrowserSort.value || "popular_1_month") : "popular_1_month";
    const response = await fetch(`${supportBase.replace(/\/+$/, "")}/${config.endpoint}?sort=${encodeURIComponent(sort)}`);
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.ok) throw new Error(body.error || "Community library failed");
    modBrowserItems = Array.isArray(body.items) ? body.items : [];
    const counts = body.counts && typeof body.counts === "object" ? body.counts : {};
    Object.keys(modBrowserCategoryCounts).forEach((category) => {
      const count = Number(counts[category]);
      if (Number.isFinite(count) && count >= 0) {
        modBrowserCategoryCounts[category] = count;
      }
    });
    if (!Object.prototype.hasOwnProperty.call(counts, activeModCategory)) {
      modBrowserCategoryCounts[activeModCategory] = modBrowserItems.length;
    }
    updateModCategoryCounts();
    renderModBrowser();
    setModBrowserStatus("", false);
  } catch (error) {
    setModBrowserStatus(`Could not load ${config.label.toLowerCase()} right now.`, true);
  }
}

function bindModBrowser() {
  if (!modBrowser) return;

  modCategoryFilters.forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.modCategory || "themes";
      if (modBrowserSearch) modBrowserSearch.value = "";
      loadModBrowserCategory(category);
      trackAnalyticsEvent("community_mod_category_change", {
        category,
        page_location: window.location.href,
      });
    });
  });

  const applyModBrowserSearch = () => {
    modBrowserCurrentPage = 1;
    renderModBrowser();
  };

  modBrowserSearch?.addEventListener("input", applyModBrowserSearch);
  modBrowserSearch?.addEventListener("change", applyModBrowserSearch);
  modBrowser.addEventListener("click", (event) => {
    const button = event.target.closest("[data-mod-browser-page]");
    if (!button || button.disabled) return;
    const target = button.dataset.modBrowserPage || "";
    const totalPages = Math.max(1, Math.ceil(filteredModBrowserItems().length / MOD_BROWSER_PAGE_SIZE));
    if (target === "prev") {
      modBrowserCurrentPage = Math.max(1, modBrowserCurrentPage - 1);
    } else if (target === "next") {
      modBrowserCurrentPage = Math.min(totalPages, modBrowserCurrentPage + 1);
    } else {
      modBrowserCurrentPage = Math.min(totalPages, Math.max(1, Number(target) || 1));
    }
    renderModBrowser();
    modBrowserGrid?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  modBrowserSort?.addEventListener("change", () => {
    modBrowserCurrentPage = 1;
    loadModBrowserCategory(activeModCategory);
    trackAnalyticsEvent("community_mod_sort_change", {
      category: activeModCategory,
      sort: modBrowserSort.value,
      page_location: window.location.href,
    });
  });

  loadModBrowserCategory(activeModCategory);
}

function bindModBrowserDownloads() {
  document.querySelectorAll("[data-mod-browser-download]").forEach((link) => {
    if (link.dataset.bound === "true") return;
    link.dataset.bound = "true";
    link.addEventListener("click", () => {
      trackAnalyticsEvent("community_mod_download_click", {
        category: activeModCategory,
        destination: link.getAttribute("href") || "",
        page_location: window.location.href,
      });
    });
  });
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
    const card = button.closest(".theme-card, .mod-card");
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
    const previewInput = document.getElementById("theme-preview-image");
    const previewImage = selectedPreviewFile(previewInput);
    if (previewImage) formData.set("previewImage", previewImage);

    if (!email || !creator || !themeName || !themeFile || !previewImage) {
      setThemeUploadStatus("Email, creator name, theme name, theme file, and preview image are required.", true);
      return;
    }
    saveRedditMatch({ email });
    if (!/\.zip$/i.test(themeFile.name || "")) {
      setThemeUploadStatus("Upload the ZIP exported from the TAPE 16 Themes window.", true);
      return;
    }
    if (!/\.(png|jpe?g|webp)$/i.test(previewImage.name || "")) {
      setThemeUploadStatus("Preview image must be PNG, JPG, or WebP.", true);
      return;
    }
    if ((previewImage.size || 0) > 5 * 1024 * 1024) {
      setThemeUploadStatus("Preview image must be 5MB or smaller. Crop it to reduce the file size.", true);
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
      clearPreviewCropSelection(previewInput);
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

function communityUploadConfig(type) {
  if (type === "mod") {
    return {
      label: "tape mod",
      endpoint: "submit-mod",
      idField: "modId",
      category: "tape_mods",
      nameLabel: "Tape Mod Name",
      fileLabel: "Tape Mod ZIP (50MB max)",
      fileAccept: ".zip,application/zip",
      filePattern: /\.zip$/i,
      maxBytes: 50 * 1024 * 1024,
      fileError: "Upload the tape mod as a ZIP package.",
      previewLabel: "Preview Image",
      tagsPlaceholder: "saturation, wobble, lo-fi, mastering",
      descriptionPlaceholder: "Describe the tape mod, its sound, and any setup notes.",
    };
  }
  if (type === "controller_profile") {
    return {
      label: "controller profile",
      endpoint: "submit-controller-profile",
      idField: "controller_profileId",
      category: "controller_profiles",
      nameLabel: "Controller Profile Name",
      fileLabel: "Controller Profile Package (20MB max)",
      fileAccept: ".tape16controller,application/zip",
      filePattern: /\.tape16controller$/i,
      maxBytes: 20 * 1024 * 1024,
      fileError: "Upload the controller profile exported from TAPE 16 (.tape16controller).",
      previewLabel: "Preview Image Of Controller",
      tagsPlaceholder: "mackie, faders, transport, studio",
      descriptionPlaceholder: "Name the controller hardware and describe the mapped controls, feedback, and setup notes.",
    };
  }
  if (type === "midi_profile") {
    return {
      label: "MIDI profile",
      endpoint: "submit-midi-profile",
      idField: "midi_profileId",
      category: "midi_profiles",
      nameLabel: "MIDI Profile Name",
      fileLabel: "MIDI Profile File (5MB max)",
      fileAccept: ".tape16-midi-profile,.xml,text/xml,application/xml",
      filePattern: /\.(tape16-midi-profile|xml)$/i,
      maxBytes: 5 * 1024 * 1024,
      fileError: "Upload the MIDI profile exported from TAPE 16 (.tape16-midi-profile or .xml).",
      previewLabel: "Preview Image Of Controller",
      tagsPlaceholder: "novation, transport, live setup",
      descriptionPlaceholder: "Describe the controller, mapping style, and any setup notes.",
    };
  }
  return {
    label: "theme",
    endpoint: "submit-theme",
    idField: "themeId",
    category: "themes",
    nameLabel: "Theme Name",
    fileLabel: "Theme ZIP (50MB max)",
    fileAccept: ".zip,application/zip",
    filePattern: /\.zip$/i,
    maxBytes: 50 * 1024 * 1024,
    fileError: "Upload the theme as a ZIP package.",
    previewLabel: "Preview Image",
    tagsPlaceholder: "dark, tracking, low glare",
    descriptionPlaceholder: "Describe the feel of the theme and any ideal use cases.",
  };
}

function updateCommunityUploadTypeFields() {
  if (!communityUploadType) return;
  const config = communityUploadConfig(communityUploadType.value);
  if (communityUploadNameLabel) communityUploadNameLabel.textContent = config.nameLabel;
  if (communityUploadFileLabel) communityUploadFileLabel.textContent = config.fileLabel;
  if (communityUploadPreviewLabel) communityUploadPreviewLabel.textContent = config.previewLabel;
  const nameInput = document.getElementById("community-upload-name");
  const tagsInput = document.getElementById("community-upload-tags");
  const descriptionInput = document.getElementById("community-upload-description");
  const fileInput = document.getElementById("community-upload-file");
  const submitButton = communityUploadSubmitBtn;
  if (nameInput) nameInput.placeholder = config.nameLabel === "Theme Name" ? "Your theme name" : "Your profile name";
  if (tagsInput) tagsInput.placeholder = config.tagsPlaceholder;
  if (descriptionInput) descriptionInput.placeholder = config.descriptionPlaceholder;
  if (fileInput) fileInput.accept = config.fileAccept;
  if (submitButton) submitButton.textContent = `Submit ${config.label.replace(/^\w/, (char) => char.toUpperCase())}`;
}

if (communityUploadType) {
  communityUploadType.addEventListener("change", updateCommunityUploadTypeFields);
  updateCommunityUploadTypeFields();
}

if (communityUploadForm) {
  communityUploadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const supportBase = themeApiBaseUrl();
    if (!supportBase) {
      setCommunityUploadStatus("Community upload service is not configured yet. Please contact support.", true);
      return;
    }

    const session = readThemeAccountSession();
    const formData = new FormData(communityUploadForm);
    if (session?.email) formData.set("email", session.email);
    const config = communityUploadConfig(String(formData.get("modType") || "theme"));
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const creator = String(formData.get("creator") || "").trim();
    const itemName = String(formData.get("name") || "").trim();
    const packageFile = document.getElementById("community-upload-file")?.files?.[0] || null;
    const previewInput = document.getElementById("community-upload-preview-image");
    const previewImage = selectedPreviewFile(previewInput);
    if (previewImage) formData.set("previewImage", previewImage);

    if (!email || !creator || !itemName || !packageFile || !previewImage) {
      setCommunityUploadStatus("Email, creator name, mod name, upload file, and preview image are required.", true);
      return;
    }
    saveRedditMatch({ email });
    const packageName = packageFile.name || "";
    const validPackage = config.filePattern.test(packageName);
    if (!validPackage) {
      setCommunityUploadStatus(config.fileError, true);
      return;
    }
    if (!/\.(png|jpe?g|webp)$/i.test(previewImage.name || "")) {
      setCommunityUploadStatus("Preview image must be PNG, JPG, or WebP.", true);
      return;
    }

    if ((packageFile.size || 0) > config.maxBytes) {
      setCommunityUploadStatus(`${config.fileLabel.replace(/\s*\([^)]*\)/, "")} exceeds ${formatFileSize(config.maxBytes)}.`, true);
      return;
    }
    if ((previewImage.size || 0) > 5 * 1024 * 1024) {
      setCommunityUploadStatus("Preview image must be 5MB or smaller.", true);
      return;
    }

    if (communityUploadSubmitBtn) communityUploadSubmitBtn.setAttribute("disabled", "disabled");
    setCommunityUploadStatus(`Submitting ${config.label}...`, false);

    try {
      const endpoint = `${supportBase.replace(/\/+$/, "")}/${config.endpoint}`;
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
            ? "Community file storage is not enabled yet. Please try again later."
            : message || "Submit failed"
        );
      }
      const uploadIdText = body[config.idField] ? ` (${body[config.idField]})` : "";
      setCommunityUploadStatus(`${config.label.replace(/^\w/, (char) => char.toUpperCase())} uploaded${uploadIdText}. Thank you.`, false);
      communityUploadForm.reset();
      clearPreviewCropSelection(previewInput);
      updateCommunityUploadTypeFields();
      applyThemeAccountUploadState();
      if (modBrowser && activeModCategory === config.category) {
        await loadModBrowserCategory(config.category);
      }
      if (config.category === "themes") await loadThemeLibrary();
      if (session) await loadThemeAccountThemes({ silent: true });
    } catch (error) {
      setCommunityUploadStatus(
        error instanceof Error && error.message
          ? error.message
          : "Could not submit community upload right now. Please try again shortly.",
        true
      );
    } finally {
      if (communityUploadSubmitBtn) communityUploadSubmitBtn.removeAttribute("disabled");
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
  themeAccountList.addEventListener("input", (event) => {
    const field = event.target instanceof Element ? event.target.closest(".theme-manage-fields input, .theme-manage-fields textarea") : null;
    const itemEl = field?.closest(".theme-manage-item");
    const saveButton = itemEl?.querySelector("[data-theme-manage-save]");
    if (!saveButton) return;
    saveButton.disabled = false;
    saveButton.textContent = "Save Details";
    setThemeManageStatus(itemEl, "Unsaved changes", false);
  });

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

    const filePicker = element.closest("[data-managed-file-picker]");
    if (filePicker) {
      const kind = filePicker.dataset.managedFilePicker;
      const input = itemEl.querySelector(`[data-managed-file-input="${kind}"]`);
      if (input) {
        input.value = "";
        if (kind === "preview") clearPreviewCropSelection(input);
        input.click();
      }
      return;
    }
    if (element.closest("[data-theme-manage-save]")) {
      await saveManagedTheme(itemEl);
      return;
    }
    if (element.closest("[data-theme-manage-delete]")) {
      await deleteManagedTheme(itemEl);
    }
  });
}

document.addEventListener("change", async (event) => {
  const input = event.target instanceof HTMLInputElement ? event.target : null;
  if (!input) return;

  if (input.matches('[data-managed-file-input="package"]')) {
    const itemEl = input.closest(".theme-manage-item");
    if (input.files?.[0] && itemEl) await replaceManagedThemeFile(itemEl, "package");
    return;
  }
  if (!input.matches('input[name="previewImage"]')) return;
  previewCropFiles.delete(input);
  const file = input.files?.[0] || null;
  if (!file) {
    clearPreviewCropSelection(input);
    return;
  }
  previewCropOriginalFiles.set(input, file);
  const cropAction = await cropPreviewInput(input);
  const itemEl = input.closest(".theme-manage-item");
  if (itemEl && (cropAction === "cropped" || cropAction === "original")) {
    await replaceManagedThemeFile(itemEl, "preview");
  }
});

document.addEventListener("click", async (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const currentCropButton = target?.closest("[data-preview-crop-current]");
  if (currentCropButton) {
    const itemEl = currentCropButton.closest(".theme-manage-item");
    await cropCurrentManagedPreview(currentCropButton, itemEl);
    return;
  }
  const cropButton = target?.closest("[data-preview-crop-open]");
  if (!cropButton) return;
  const control = cropButton.closest(".preview-upload-control, .theme-file-action, .theme-manage-replace, label");
  const input = control?.querySelector('input[name="previewImage"]') || null;
  await cropPreviewInput(input);
});

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

function setAccountSessionState(signedIn) {
  if (accountLoginForm) accountLoginForm.hidden = signedIn;
  if (accountSessionActions) accountSessionActions.hidden = !signedIn;
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
      setAccountSessionState(false);
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
    setAccountSessionState(true);
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
    setAccountSessionState(false);
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
  setAccountSessionState(Boolean(session));
  if (session) {
    fetchAccountActivations(session, { silent: true });
  }
}

bindModBrowser();
