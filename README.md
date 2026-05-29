# WatchParty

Personal watch party app for 2-5 people. The MVP syncs play, pause, seek, presence, and room chat without re-streaming provider video.

## Run locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`, create a room, then open the copied room link in another browser to test realtime sync.

## MVP status

- Email/password auth is wired with Better Auth.
- Rooms are created through the API and stored in PostgreSQL.
- Room URLs are validated against the database.
- Rooms include a shared in-page HTML5 video player for direct video URLs.
- Participants can rename their local display name in the room sidebar.
- Presence, chat, video source, play, pause, and seek sync work over Socket.IO.
- Chat history is retained in memory while a room still has active participants, so refresh keeps recent messages.
- Leaving a room removes that browser from presence; when the last participant leaves, runtime chat history is cleared.
- Optional browser extension scaffold can control an external HTML5 video provider tab such as `https://z2.idlixku.com/*`.
- Manual two-browser testing passed for room join and realtime chat.

## External provider sync

The `extension` folder contains a Chrome/Edge extension scaffold for controlling a separate provider tab.

```text
extension/
  manifest.json
  background.js
  watchparty-bridge.js
  html5-provider.js
```

Install it from `chrome://extensions` with Developer mode and Load unpacked. Open WatchParty on `http://localhost:3000`, open the provider video in another tab, then use WatchParty play/pause/seek controls.

The room header shows provider status from the extension:

- `Provider detected`: an external HTML5 video tab is visible to the extension.
- `Provider not detected`: reload the extension, refresh the provider tab, start the video once manually, and check the provider page badge.

The extension only controls a detected HTML5 `<video>` element in your own browser. It does not extract video URLs, bypass DRM, download videos, or re-stream provider content.

## Notes

- Socket.IO state is in memory and intentionally not stored in PostgreSQL.
- Prisma models include app rooms and Better Auth tables.
- Realtime state resets when the custom Next.js server restarts.
- Chat history is capped to the latest 100 messages per active room.
- The in-page player needs a direct browser-playable video URL, such as an allowed `.mp4` URL. Normal streaming site pages are not embedded or re-streamed by this app.
