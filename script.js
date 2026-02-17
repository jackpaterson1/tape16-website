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
