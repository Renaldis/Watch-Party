const bridgeBadge = createBridgeBadge();
window.setInterval(() => {
  if (bridgeBadge) {
    bridgeBadge.textContent = "WatchParty extension connected";
  }
}, 1500);

window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  if (event.data?.type === "WATCHPARTY_GET_PROVIDER_STATUS") {
    requestProviderStatus();
    return;
  }

  if (event.data?.type !== "WATCHPARTY_PROVIDER_COMMAND") return;

  chrome.runtime.sendMessage({
    type: "WATCHPARTY_PROVIDER_COMMAND",
    command: event.data.command,
  });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type !== "WATCHPARTY_PROVIDER_STATUS") return false;

  window.postMessage(
    {
      type: "WATCHPARTY_PROVIDER_STATUS",
      status: message.status,
    },
    window.location.origin
  );

  return false;
});

requestProviderStatus();

function requestProviderStatus() {
  chrome.runtime.sendMessage({ type: "WATCHPARTY_GET_PROVIDER_STATUS" }, (response) => {
    if (chrome.runtime.lastError) return;
    if (!response?.status) return;

    window.postMessage(
      {
        type: "WATCHPARTY_PROVIDER_STATUS",
        status: response.status,
      },
      window.location.origin
    );
  });
}

window.postMessage(
  {
    type: "WATCHPARTY_EXTENSION_BRIDGE_READY",
  },
  window.location.origin
);

function createBridgeBadge() {
  if (window.top !== window) {
    return null;
  }

  const badge = document.createElement("div");
  badge.style.position = "fixed";
  badge.style.left = "12px";
  badge.style.bottom = "12px";
  badge.style.zIndex = "2147483647";
  badge.style.padding = "8px 10px";
  badge.style.borderRadius = "6px";
  badge.style.font = "12px system-ui, sans-serif";
  badge.style.fontWeight = "700";
  badge.style.color = "#ffffff";
  badge.style.background = "#16785f";
  badge.style.boxShadow = "0 8px 24px rgba(0,0,0,.22)";
  badge.style.pointerEvents = "none";
  badge.textContent = "WatchParty extension connected";

  const appendBadge = () => document.documentElement.appendChild(badge);

  if (document.documentElement) {
    appendBadge();
  } else {
    window.addEventListener("DOMContentLoaded", appendBadge, { once: true });
  }

  return badge;
}
