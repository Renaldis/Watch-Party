const { createServer } = require("node:http");
const { randomUUID } = require("node:crypto");
const next = require("next");
const { PrismaClient } = require("@prisma/client");
const { Server } = require("socket.io");
const { z } = require("zod");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = Number(process.env.PORT || 3000);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const prisma = new PrismaClient();

const rooms = new Map();
const chatRateLimits = new Map();

const roomCodeSchema = z.string().trim().toUpperCase().regex(/^[A-Z0-9]{4,10}$/);
const joinRoomSchema = z.object({
  roomCode: roomCodeSchema,
  name: z.string().trim().min(1).max(40).default("Guest"),
});
const chatMessageSchema = z.object({
  roomCode: roomCodeSchema,
  message: z.string().trim().min(1).max(500),
  senderName: z.string().trim().min(1).max(40).default("Guest"),
});
const playbackSchema = z.object({
  roomCode: roomCodeSchema,
  currentTime: z.coerce.number().min(0).max(60 * 60 * 24),
  senderName: z.string().trim().min(1).max(40).default("Guest"),
});
const videoSourceSchema = z.object({
  roomCode: roomCodeSchema,
  videoUrl: z.string().trim().url().max(2000),
  videoTitle: z.string().trim().max(120).optional().nullable(),
  senderName: z.string().trim().min(1).max(40).default("Guest"),
});

function getRoom(roomCode) {
  if (!rooms.has(roomCode)) {
    rooms.set(roomCode, new Map());
  }

  return rooms.get(roomCode);
}

function broadcastParticipants(io, roomCode) {
  const room = getRoom(roomCode);
  io.to(roomCode).emit("participants", Array.from(room.values()));
}

function removeParticipant(io, socket) {
  const roomCode = socket.data.roomCode;
  if (!roomCode) return;

  const room = getRoom(roomCode);
  socket.leave(roomCode);
  room.delete(socket.id);
  socket.data.roomCode = null;

  if (room.size === 0) {
    rooms.delete(roomCode);
  } else {
    broadcastParticipants(io, roomCode);
  }
}

function canSendChat(socketId) {
  const now = Date.now();
  const windowMs = 3000;
  const maxMessages = 5;
  const history = (chatRateLimits.get(socketId) || []).filter((timestamp) => now - timestamp < windowMs);

  if (history.length >= maxMessages) {
    chatRateLimits.set(socketId, history);
    return false;
  }

  chatRateLimits.set(socketId, [...history, now]);
  return true;
}

function emitRoomError(socket, message) {
  socket.emit("room-error", { message });
}

app.prepare().then(() => {
  const httpServer = createServer(handle);
  const io = new Server(httpServer, {
    path: "/api/socket",
  });

  io.on("connection", (socket) => {
    socket.on("join-room", async (payload) => {
      const parsedPayload = joinRoomSchema.safeParse(payload);
      if (!parsedPayload.success) {
        emitRoomError(socket, "Invalid room code or display name.");
        return;
      }

      const { roomCode, name } = parsedPayload.data;
      const existingRoom = await prisma.room.findUnique({
        where: { code: roomCode },
        select: { id: true },
      });

      if (!existingRoom) {
        emitRoomError(socket, "Room does not exist.");
        return;
      }

      removeParticipant(io, socket);
      socket.data.roomCode = roomCode;
      socket.data.name = name;
      socket.join(roomCode);
      getRoom(roomCode).set(socket.id, { id: socket.id, name });
      broadcastParticipants(io, roomCode);
    });

    socket.on("leave-room", () => {
      removeParticipant(io, socket);
    });

    socket.on("chat-message", (payload) => {
      const parsedPayload = chatMessageSchema.safeParse(payload);
      if (!parsedPayload.success) {
        emitRoomError(socket, "Chat message is invalid.");
        return;
      }

      const { roomCode, message, senderName } = parsedPayload.data;
      if (socket.data.roomCode !== roomCode) {
        emitRoomError(socket, "Join this room before sending messages.");
        return;
      }

      if (!canSendChat(socket.id)) {
        emitRoomError(socket, "You are sending messages too quickly.");
        return;
      }

      io.to(roomCode).emit("chat-message", {
        id: randomUUID(),
        roomCode,
        senderId: socket.id,
        senderName,
        message,
        timestamp: new Date().toISOString(),
      });
    });

    for (const eventName of ["play", "pause", "seek"]) {
      socket.on(eventName, (payload) => {
        const parsedPayload = playbackSchema.safeParse(payload);
        if (!parsedPayload.success) {
          emitRoomError(socket, "Playback event is invalid.");
          return;
        }

        const { roomCode, currentTime, senderName } = parsedPayload.data;
        if (socket.data.roomCode !== roomCode) {
          emitRoomError(socket, "Join this room before syncing playback.");
          return;
        }

        socket.to(roomCode).emit(eventName, {
          roomCode,
          currentTime,
          senderName,
        });
      });
    }

    socket.on("video-source", (payload) => {
      const parsedPayload = videoSourceSchema.safeParse(payload);
      if (!parsedPayload.success) {
        emitRoomError(socket, "Video source is invalid.");
        return;
      }

      const { roomCode, videoUrl, videoTitle, senderName } = parsedPayload.data;
      if (socket.data.roomCode !== roomCode) {
        emitRoomError(socket, "Join this room before changing the video source.");
        return;
      }

      socket.to(roomCode).emit("video-source", {
        roomCode,
        videoUrl,
        videoTitle: videoTitle || null,
        senderName,
      });
    });

    socket.on("disconnect", () => {
      removeParticipant(io, socket);
      chatRateLimits.delete(socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`WatchParty ready on http://${hostname}:${port}`);
  });
});
