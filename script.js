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
const bugForm = document.getElementById("bug-report-form");
const bugStatus = document.getElementById("bug-form-status");
const bugSubmitBtn = document.getElementById("bug-submit-btn");
const featureForm = document.getElementById("feature-request-form");
const featureStatus = document.getElementById("feature-form-status");
const featureSubmitBtn = document.getElementById("feature-submit-btn");
const fullDownloadLink = document.getElementById("full-download-link");
const downloadPageDemoLink = document.getElementById("download-page-demo-link");
const accountLoginForm = document.getElementById("account-login-form");
const accountStatus = document.getElementById("account-status");
const accountLoginBtn = document.getElementById("account-login-btn");
const accountRefreshBtn = document.getElementById("account-refresh-btn");
const accountLogoutBtn = document.getElementById("account-logout-btn");
const accountPanel = document.getElementById("account-panel");
const accountSummary = document.getElementById("account-summary");
const accountActivations = document.getElementById("account-activations");

const ACCOUNT_SESSION_KEY = "tape16_account_session_v1";

function configUrl(value) {
  if (typeof value !== "string") return "";
  const out = value.trim();
  if (!out || out.includes("REPLACE_WITH_")) return "";
  return out;
}

function setBuyStatus(message, isError) {
  if (!buyStatus) return;
  buyStatus.textContent = message;
  buyStatus.style.color = isError ? "#ff9d87" : "#f7c34b";
}

if (buyLink) {
  const fallbackBuyUrl =
    "mailto:emrmusicgroup@gmail.com?subject=TAPE%2016%20License%20Purchase%20-%20$19%20USD";
  const checkoutUrl = configUrl(config.buyNowUrl);
  buyLink.href = checkoutUrl || fallbackBuyUrl;

  const stripeCheckoutEnabled =
    config.stripeCheckoutEnabled === true || String(config.stripeCheckoutEnabled) === "true";
  if (stripeCheckoutEnabled) {
    buyLink.removeAttribute("target");
    buyLink.addEventListener("click", async (event) => {
      event.preventDefault();

      const apiBase =
        configUrl(config.supportApiBaseUrl) ||
        configUrl(config.serialApiBaseUrl) ||
        "";
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

if (demoLink) {
  const fallbackDemoUrl = "https://github.com/jackpaterson1/Tape-16/releases/latest";
  const hasDemoUrl =
    typeof config.demoDownloadUrl === "string" && config.demoDownloadUrl.length > 0;
  demoLink.href = hasDemoUrl ? config.demoDownloadUrl : fallbackDemoUrl;
}

if (fullDownloadLink) {
  const fallbackFullUrl = "https://github.com/jackpaterson1/Tape-16/releases/latest";
  const fullUrl = configUrl(config.fullDownloadUrl);
  fullDownloadLink.href = fullUrl || fallbackFullUrl;
}

if (downloadPageDemoLink) {
  const fallbackDemoUrl = "https://github.com/jackpaterson1/Tape-16/releases/latest";
  const demoUrl = configUrl(config.demoDownloadUrl);
  downloadPageDemoLink.href = demoUrl || fallbackDemoUrl;
}

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
    if (!(target instanceof HTMLElement)) return;
    const button = target.closest(".account-deactivate-btn");
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
