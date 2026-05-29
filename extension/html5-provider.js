chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "WATCHPARTY_PROVIDER_COMMAND") {
    return false;
  }

  try {
    const result = runCommand(message.command);
    sendResponse({ ok: true, ...result });
  } catch (error) {
    sendResponse({ ok: false, message: error.message });
  }

  return true;
});

const statusBadge = createStatusBadge();
refreshStatusBadge();
window.setInterval(refreshStatusBadge, 1500);

function runCommand(command) {
  const video = findVideo();

  if (!video) {
    throw new Error("No HTML5 video element found on this page.");
  }

  const currentTime = Number(command.currentTime);

  if (Number.isFinite(currentTime) && currentTime >= 0) {
    video.currentTime = currentTime;
  }

  if (command.action === "play") {
    void video.play();
  }

  if (command.action === "pause") {
    video.pause();
  }

  if (command.action === "seek") {
    video.currentTime = Math.max(0, currentTime || 0);
  }

  return {
    currentTime: video.currentTime,
    duration: Number.isFinite(video.duration) ? video.duration : null,
    paused: video.paused,
  };
}

function findVideo() {
  const videos = Array.from(document.querySelectorAll("video"));
  return videos.find((video) => video.readyState > 0) || videos[0] || null;
}

function createStatusBadge() {
  if (window.top !== window) {
    return null;
  }

  const badge = document.createElement("div");
  badge.style.position = "fixed";
  badge.style.right = "12px";
  badge.style.bottom = "12px";
  badge.style.zIndex = "2147483647";
  badge.style.padding = "8px 10px";
  badge.style.borderRadius = "6px";
  badge.style.font = "12px system-ui, sans-serif";
  badge.style.fontWeight = "700";
  badge.style.boxShadow = "0 8px 24px rgba(0,0,0,.22)";
  badge.style.pointerEvents = "none";
  badge.textContent = "WatchParty: checking";

  document.documentElement.appendChild(badge);
  return badge;
}

function refreshStatusBadge() {
  const video = findVideo();
  const status = {
    detected: Boolean(video),
    url: window.location.href,
    currentTime: video ? video.currentTime : null,
    duration: video && Number.isFinite(video.duration) ? video.duration : null,
    paused: video ? video.paused : null,
  };

  if (statusBadge) {
    statusBadge.textContent = video ? "WatchParty: video detected" : "WatchParty: video not found";
    statusBadge.style.color = video ? "#ffffff" : "#15171a";
    statusBadge.style.background = video ? "#16785f" : "#f5c542";
  }

  console.debug("[WatchParty]", video ? "HTML5 video detected" : "No HTML5 video found", {
    url: window.location.href,
    frame: window.top === window ? "top" : "iframe",
  });

  chrome.runtime.sendMessage({
    type: "WATCHPARTY_PROVIDER_STATUS",
    status,
  }).catch(() => {});
}
