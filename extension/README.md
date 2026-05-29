# WatchParty Provider Sync Extension

This extension lets WatchParty control a browser-playable HTML5 video on an external provider tab.

## Local install

1. Open Chrome or Edge.
2. Go to `chrome://extensions`.
3. Enable Developer mode.
4. Click Load unpacked.
5. Select this `extension` folder.

## Current provider

- `https://z2.idlixku.com/*`

## How it works

- `watchparty-bridge.js` runs on `http://localhost:3000/*` and forwards room sync commands from the WatchParty web app to the extension background service worker.
- `background.js` broadcasts those commands to matching provider tabs.
- `html5-provider.js` runs on provider pages and controls the first available HTML5 `<video>` element.

The extension does not extract direct video URLs, bypass DRM, download videos, or re-stream provider content.
