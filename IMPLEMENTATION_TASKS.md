# WatchParty Implementation Tasks

Dokumen ini dipakai untuk tracking progress implementasi WatchParty. `PLAN.md` tetap menjadi PRD utama, sementara file ini fokus ke status teknis, prioritas berikutnya, dan roadmap.

## Status Saat Ini

MVP skeleton sudah berjalan secara lokal.

- [x] Next.js App Router project scaffold
- [x] TypeScript setup
- [x] Tailwind CSS setup
- [x] Landing page
- [x] Create room flow
- [x] Join room flow
- [x] Dynamic room page `/room/[code]`
- [x] Realtime Socket.IO server
- [x] Room presence in memory
- [x] Realtime chat in memory
- [x] Active-room in-memory chat history
- [x] Playback sync events: play, pause, seek
- [x] Shared in-room HTML5 video player
- [x] Realtime video source sync
- [x] Rename participant display name
- [x] Prisma schema for `User`, `Room`, and Better Auth models
- [x] Better Auth email/password route handler
- [x] Better Auth database migration applied
- [x] `.env.example`
- [x] `pnpm lint` passing
- [x] `pnpm build` passing

## Important Notes

- Auth UI sudah terhubung ke Better Auth untuk register, login, session check, dan logout.
- Room creation sudah lewat API, membutuhkan login, dan tersimpan ke database.
- Presence, chat, dan playback state masih in-memory di Socket.IO server.
- Video source room disimpan di database, tapi file/video tetap berasal dari URL eksternal yang browser boleh putar.
- In-memory realtime state sudah sesuai MVP principle, tapi akan reset saat server restart.
- Chat history disimpan in-memory selama room masih punya peserta aktif, lalu dibersihkan saat room kosong.
- Aplikasi memakai custom `server.js` supaya Socket.IO bisa berjalan bersama Next.js.
- Migration `20260529035800_add_better_auth_models` sudah diterapkan ke database Neon.

## Next Priority

### 1. Authentication

- [x] Setup Better Auth config
- [x] Buat auth route handler
- [x] Hubungkan sign-up form ke Better Auth
- [x] Hubungkan sign-in form ke Better Auth
- [x] Tambahkan logout action
- [x] Tambahkan session check di navbar
- [x] Tambahkan server-side session helper
- [x] Protect room creation untuk user yang login
- [x] Redirect user yang belum login jika diperlukan

Acceptance criteria:

- User bisa register.
- User bisa login.
- User bisa logout.
- Session tetap aktif setelah refresh.

### 2. Database Room System

- [x] Buat API/action untuk create room
- [x] Simpan room ke PostgreSQL lewat Prisma
- [x] Pastikan room code unique
- [x] Validasi room exists saat membuka `/room/[code]`
- [x] Hubungkan owner room dengan logged-in user
- [x] Tambahkan empty/error state untuk room yang tidak ditemukan

Acceptance criteria:

- Room yang dibuat tersimpan di database.
- URL room valid bisa dibuka ulang.
- Room code tidak bentrok.

### 3. Realtime Hardening

- [x] Validasi payload Socket.IO dengan Zod
- [x] Batasi panjang chat message
- [x] Batasi room code format
- [x] Tambahkan server-side participant cleanup
- [x] Tambahkan basic rate limit untuk chat
- [x] Tambahkan event error untuk invalid room
- [x] Tambahkan chat history in-memory selama room aktif
- [x] Bersihkan runtime room state saat peserta terakhir keluar

Acceptance criteria:

- Socket server tidak menerima payload kosong/rusak.
- Chat tidak bisa spam terlalu cepat.
- Participant list tetap bersih setelah disconnect.

### 4. Playback UX

- [x] Tambahkan shared in-room video player
- [x] Tambahkan video source URL per room
- [x] Sinkronkan video source realtime ke peserta lain
- [x] Tambahkan current time input yang lebih nyaman
- [x] Tambahkan slider seek
- [x] Tampilkan status event terakhir
- [x] Tampilkan siapa yang mengirim sync terakhir
- [x] Tambahkan manual drift correction hint
- [x] Tambahkan local optimistic update yang konsisten

Acceptance criteria:

- Dua browser bisa play/pause/seek dengan status yang jelas.
- User tahu siapa yang terakhir mengontrol playback.

### 5. UI Polish

- [x] Rapikan mobile layout room page
- [x] Tambahkan loading states
- [x] Tambahkan disabled states
- [x] Tambahkan copy link success feedback
- [x] Tambahkan not-found room page
- [x] Tambahkan navbar state saat logged in

Acceptance criteria:

- Flow create/join/watch nyaman di desktop dan mobile.
- User mendapat feedback untuk action penting.

## MVP Completion Checklist

- [x] User dapat register
- [x] User dapat login
- [x] User dapat logout
- [x] User dapat membuat room
- [x] Room tersimpan di database
- [x] User dapat join room lewat URL
- [x] Dua browser dapat masuk room yang sama secara realtime
- [x] Peserta online tampil
- [x] Chat realtime berjalan
- [x] Chat history tetap ada setelah refresh selama room aktif
- [x] Play tersinkron
- [x] Pause tersinkron
- [x] Seek tersinkron
- [x] Video player tersedia di website room
- [x] Video source tersinkron realtime
- [x] Basic validation dan error state tersedia
- [x] MVP tested manual dengan dua browser

Manual test notes:

- Two-browser room test passed.
- Realtime chat works across browsers.

## Recommended Implementation Order

1. Wire Better Auth sampai register/login/logout selesai.
2. Connect create room ke Prisma dan PostgreSQL.
3. Validasi room code saat join/open room.
4. Tambahkan Zod validation untuk semua socket payload.
5. Polish room UX: slider seek, copy feedback, loading/error states.
6. Manual test dua browser dari create room sampai chat/playback sync.
7. Deploy preview ke Vercel.

## Future Roadmap

### Version 2

- [ ] Google OAuth
- [ ] Room history
- [ ] Reactions
- [ ] Better participant identity
- [ ] Persist optional chat history
- [ ] Invite link management

### Version 3

- [ ] Browser extension scaffold
- [ ] Detect active video provider
- [ ] Read provider video current time
- [ ] Control provider play/pause/seek
- [ ] Extension-to-webapp auth/session pairing

Target providers:

- [ ] Netflix
- [ ] Disney+
- [ ] Prime Video
- [ ] Vidio

### Version 4

- [ ] Provider adapter interface
- [ ] HTML5 video generic adapter
- [ ] Per-site adapter registry
- [ ] Provider detection strategy
- [ ] Adapter permissions model

Example interface:

```ts
interface ProviderAdapter {
  play(): void;
  pause(): void;
  seek(seconds: number): void;
  getCurrentTime(): number;
}
```

## Resolved Technical Debt

- [x] Room creation belum menggunakan session user
- [x] Room code generation is client-side
- [x] No database-backed room validation yet

## Known Technical Debt

- [ ] Socket server stores state in memory only
- [ ] Chat history is not persisted after room is empty or server restarts
- [ ] No automated tests yet
- [ ] No deployment config yet
- [ ] No production auth/session security review yet

## Useful Commands

```bash
pnpm dev
pnpm lint
pnpm build
pnpm prisma:generate
pnpm prisma:migrate
```
