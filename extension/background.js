const providerUrlPatterns = [
  "http://idlixku.com/*",
  "https://idlixku.com/*",
  "http://*.idlixku.com/*",
  "https://*.idlixku.com/*",
];
let providerStatus = {
  detected: false,
  url: "",
  currentTime: null,
  duration: null,
  paused: null,
  updatedAt: 0,
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "WATCHPARTY_PROVIDER_STATUS") {
    providerStatus = {
      ...message.status,
      tabId: sender.tab?.id ?? null,
      updatedAt: Date.now(),
    };
    broadcastStatusToWatchPartyTabs();
    return false;
  }

  if (message?.type === "WATCHPARTY_GET_PROVIDER_STATUS") {
    sendResponse({ ok: true, status: providerStatus });
    return false;
  }

  if (message?.type !== "WATCHPARTY_PROVIDER_COMMAND") {
    return false;
  }

  broadcastToProviderTabs(message.command)
    .then((results) => sendResponse({ ok: true, results }))
    .catch((error) => sendResponse({ ok: false, message: error.message }));

  return true;
});

async function broadcastStatusToWatchPartyTabs() {
  const tabs = await chrome.tabs.query({
    url: [
      "http://localhost/*",
      "http://127.0.0.1/*",
    ],
  });

  for (const tab of tabs) {
    if (!tab.id) continue;
    chrome.tabs.sendMessage(tab.id, {
      type: "WATCHPARTY_PROVIDER_STATUS",
      status: providerStatus,
    }).catch(() => {});
  }
}

async function broadcastToProviderTabs(command) {
  const tabs = await chrome.tabs.query({ url: providerUrlPatterns });
  const results = [];

  for (const tab of tabs) {
    if (!tab.id) continue;

    try {
      const result = await chrome.tabs.sendMessage(tab.id, {
        type: "WATCHPARTY_PROVIDER_COMMAND",
        command,
      });
      results.push({ tabId: tab.id, ...result });
    } catch (error) {
      results.push({ tabId: tab.id, ok: false, message: error.message });
    }
  }

  return results;
}
