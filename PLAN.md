# PROJECT PRD — PERSONAL WATCH PARTY

## Project Name

WatchParty

## Overview

WatchParty adalah aplikasi web yang memungkinkan dua atau lebih pengguna menonton video bersama secara sinkron.

Target awal aplikasi adalah penggunaan personal untuk pasangan (2–5 pengguna aktif).

Aplikasi tidak melakukan streaming ulang video.

Setiap pengguna tetap membuka video pada provider masing-masing, sementara aplikasi hanya melakukan sinkronisasi playback (play, pause, seek) dan komunikasi realtime.

---

# Goals

## MVP Goals

Memungkinkan:

- Membuat room
- Join room melalui URL
- Menampilkan peserta online
- Realtime chat
- Sinkronisasi play
- Sinkronisasi pause
- Sinkronisasi seek

Target pengguna:

- 2 sampai 5 pengguna aktif dalam satu room

---

# Non Goals

Tidak termasuk dalam MVP:

- Video call
- Voice call
- Mobile app
- Streaming video sendiri
- Upload video
- Subscription system
- Payment gateway
- Public room discovery

---

# Target User

Primary User:

- Saya
- Pasangan saya

Use Case:

- Menonton film bersama dari lokasi berbeda
- Menonton serial bersama
- Menonton anime bersama

---

# Tech Stack

Framework:

- Next.js (App Router)
- TypeScript

UI:

- Tailwind CSS
- shadcn/ui
- Lucide React

State Management:

- TanStack Query

Validation:

- Zod
- React Hook Form

Authentication:

- Better Auth

Database:

- PostgreSQL (Neon)

ORM:

- Prisma

Realtime:

- Socket.IO

Deployment:

- Vercel

Package Management:

- pnpm

Code Quality:

- ESLint
- Prettier

---

# Architecture

Browser
↓
Next.js
↓
Socket.IO
↓
Room Sync

Database hanya digunakan untuk:

- User
- Room
- Session

Realtime state tidak perlu disimpan ke database.

---

# Core Features

## Authentication

User dapat:

- Register
- Login
- Logout

Provider:

- Email + Password

Future:

- Google OAuth

---

## Room System

User dapat:

- Create room
- Join room
- Leave room

Room memiliki:

- id
- code
- ownerId
- createdAt

Room code contoh:

ABC123

URL:

/room/ABC123

---

## Presence

Menampilkan:

- Siapa yang online
- Total peserta

Contoh:

🟢 Kamu
🟢 Partner

---

## Chat

Realtime room chat.

Fitur:

- Send message
- Receive message
- Timestamp

Tidak perlu:

- Attachment
- Emoji picker
- Read receipt

---

## Playback Sync

Event yang disupport:

- play
- pause
- seek

Payload:

{
type: "play",
currentTime: 120
}

Server akan broadcast ke seluruh participant dalam room.

---

# Database Design

## User

id
name
email
image
createdAt

---

## Room

id
code
ownerId
createdAt

---

# Prisma Schema

model User {
id String @id @default(cuid())
name String?
email String @unique
image String?
createdAt DateTime @default(now())

rooms Room[]
}

model Room {
id String @id @default(cuid())
code String @unique

ownerId String
owner User @relation(fields: [ownerId], references: [id])

createdAt DateTime @default(now())
}

---

# Socket Events

Join Room

join-room

Payload:

{
roomCode: "ABC123"
}

---

Play

play

Payload:

{
roomCode: "ABC123",
currentTime: 120
}

---

Pause

pause

Payload:

{
roomCode: "ABC123",
currentTime: 120
}

---

Seek

seek

Payload:

{
roomCode: "ABC123",
currentTime: 300
}

---

Chat

chat-message

Payload:

{
roomCode: "ABC123",
message: "Hai"
}

---

# Pages

/

Landing page

Features:

- Create Room
- Join Room

---

/sign-in

Login page

---

/sign-up

Register page

---

/room/[code]

Room page

Features:

- Room info
- Participants
- Chat
- Playback controls

---

# UI Components

Navbar

RoomHeader

ParticipantList

ChatPanel

ChatMessage

PlaybackControls

RoomStatus

AuthForm

CreateRoomForm

JoinRoomForm

---

# Success Criteria

MVP dianggap selesai jika:

1. User dapat login
2. User dapat membuat room
3. User dapat join room
4. Dua browser dapat terhubung ke room yang sama
5. Play tersinkron
6. Pause tersinkron
7. Seek tersinkron
8. Chat realtime berjalan

---

# Future Roadmap

## Version 2

- Google OAuth
- Reactions
- Room history
- Better UI

---

## Version 3

Browser Extension

Target provider:

- Netflix
- Disney+
- Prime Video
- Vidio

Extension bertugas:

- membaca currentTime
- play()
- pause()
- seek()

---

## Version 4

Custom Provider Adapter

Tujuan:

Support website yang tidak memiliki API resmi.

Contoh:

- IDLIX
- LK21-like websites
- Situs streaming lain yang menggunakan HTML5 video player

Architecture:

ProviderAdapter

interface ProviderAdapter {
play()
pause()
seek(seconds)
getCurrentTime()
}

Setiap website memiliki adapter sendiri.

Browser extension akan mendeteksi provider aktif lalu menggunakan adapter yang sesuai.

Website utama tetap tidak berinteraksi langsung dengan provider.

Semua kontrol dilakukan oleh extension pada browser pengguna.

---

# Development Principles

- Keep it simple
- Avoid overengineering
- No Redis
- No Microservices
- No Docker initially
- No Kafka
- No Queue System

Focus:

Ship MVP quickly.
Make it work.
Refactor later.
