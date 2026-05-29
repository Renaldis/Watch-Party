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
- [x] Playback sync events: play, pause, seek
- [x] Prisma schema for `User`, `Room`, and Better Auth models
- [x] Better Auth email/password route handler
- [x] Better Auth database migration applied
- [x] `.env.example`
- [x] `pnpm lint` passing
- [x] `pnpm build` passing

## Important Notes

- Auth UI sudah terhubung ke Better Auth untuk register, login, session check, dan logout.
- Room creation saat ini masih client-side random code, belum tersimpan ke database.
- Presence, chat, dan playback state masih in-memory di Socket.IO server.
- In-memory realtime state sudah sesuai MVP principle, tapi akan reset saat server restart.
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
- [ ] Tambahkan server-side session helper
- [ ] Protect room creation untuk user yang login
- [ ] Redirect user yang belum login jika diperlukan

Acceptance criteria:

- User bisa register.
- User bisa login.
- User bisa logout.
- Session tetap aktif setelah refresh.

### 2. Database Room System

- [ ] Buat API/action untuk create room
- [ ] Simpan room ke PostgreSQL lewat Prisma
- [ ] Pastikan room code unique
- [ ] Validasi room exists saat membuka `/room/[code]`
- [ ] Hubungkan owner room dengan logged-in user
- [ ] Tambahkan empty/error state untuk room yang tidak ditemukan

Acceptance criteria:

- Room yang dibuat tersimpan di database.
- URL room valid bisa dibuka ulang.
- Room code tidak bentrok.

### 3. Realtime Hardening

- [ ] Validasi payload Socket.IO dengan Zod
- [ ] Batasi panjang chat message
- [ ] Batasi room code format
- [ ] Tambahkan server-side participant cleanup
- [ ] Tambahkan basic rate limit untuk chat
- [ ] Tambahkan event error untuk invalid room

Acceptance criteria:

- Socket server tidak menerima payload kosong/rusak.
- Chat tidak bisa spam terlalu cepat.
- Participant list tetap bersih setelah disconnect.

### 4. Playback UX

- [ ] Tambahkan current time input yang lebih nyaman
- [ ] Tambahkan slider seek
- [ ] Tampilkan status event terakhir
- [ ] Tampilkan siapa yang mengirim sync terakhir
- [ ] Tambahkan manual drift correction hint
- [ ] Tambahkan local optimistic update yang konsisten

Acceptance criteria:

- Dua browser bisa play/pause/seek dengan status yang jelas.
- User tahu siapa yang terakhir mengontrol playback.

### 5. UI Polish

- [ ] Rapikan mobile layout room page
- [ ] Tambahkan loading states
- [ ] Tambahkan disabled states
- [ ] Tambahkan copy link success feedback
- [ ] Tambahkan not-found room page
- [x] Tambahkan navbar state saat logged in

Acceptance criteria:

- Flow create/join/watch nyaman di desktop dan mobile.
- User mendapat feedback untuk action penting.

## MVP Completion Checklist

- [x] User dapat register
- [x] User dapat login
- [x] User dapat logout
- [ ] User dapat membuat room
- [ ] Room tersimpan di database
- [x] User dapat join room lewat URL
- [x] Dua browser dapat masuk room yang sama secara realtime
- [x] Peserta online tampil
- [x] Chat realtime berjalan
- [x] Play tersinkron
- [x] Pause tersinkron
- [x] Seek tersinkron
- [ ] Basic validation dan error state tersedia
- [ ] MVP tested manual dengan dua browser

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

## Known Technical Debt

- [ ] Room creation belum menggunakan session user
- [ ] Room code generation is client-side
- [ ] No database-backed room validation yet
- [ ] Socket server stores state in memory only
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
