# WatchParty

Personal watch party app for 2-5 people. The MVP syncs play, pause, seek, presence, and room chat without re-streaming provider video.

## Run locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`, create a room, then open the copied room link in another browser to test realtime sync.

## Notes

- Socket.IO state is in memory and intentionally not stored in PostgreSQL.
- Prisma models match `PLAN.md` for `User` and `Room`.
- Auth screens are scaffolded; connect Better Auth endpoints before treating login/register as complete.
