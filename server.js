const { createServer } = require("node:http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = Number(process.env.PORT || 3000);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const rooms = new Map();

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

app.prepare().then(() => {
  const httpServer = createServer(handle);
  const io = new Server(httpServer, {
    path: "/api/socket",
  });

  io.on("connection", (socket) => {
    socket.on("join-room", ({ roomCode, name }) => {
      const normalizedRoomCode = String(roomCode || "").toUpperCase();
      const displayName = String(name || "Guest").slice(0, 40);

      socket.data.roomCode = normalizedRoomCode;
      socket.data.name = displayName;
      socket.join(normalizedRoomCode);
      getRoom(normalizedRoomCode).set(socket.id, { id: socket.id, name: displayName });
      broadcastParticipants(io, normalizedRoomCode);
    });

    socket.on("leave-room", () => {
      const roomCode = socket.data.roomCode;
      if (!roomCode) return;

      socket.leave(roomCode);
      getRoom(roomCode).delete(socket.id);
      broadcastParticipants(io, roomCode);
    });

    socket.on("chat-message", ({ roomCode, message, senderName }) => {
      const normalizedRoomCode = String(roomCode || "").toUpperCase();
      const text = String(message || "").trim().slice(0, 500);
      if (!normalizedRoomCode || !text) return;

      io.to(normalizedRoomCode).emit("chat-message", {
        id: crypto.randomUUID(),
        roomCode: normalizedRoomCode,
        senderId: socket.id,
        senderName: String(senderName || socket.data.name || "Guest").slice(0, 40),
        message: text,
        timestamp: new Date().toISOString(),
      });
    });

    for (const eventName of ["play", "pause", "seek"]) {
      socket.on(eventName, ({ roomCode, currentTime, senderName }) => {
        const normalizedRoomCode = String(roomCode || "").toUpperCase();
        if (!normalizedRoomCode) return;

        socket.to(normalizedRoomCode).emit(eventName, {
          roomCode: normalizedRoomCode,
          currentTime: Number(currentTime) || 0,
          senderName: String(senderName || socket.data.name || "Guest").slice(0, 40),
        });
      });
    }

    socket.on("disconnect", () => {
      const roomCode = socket.data.roomCode;
      if (!roomCode) return;

      const room = getRoom(roomCode);
      room.delete(socket.id);
      if (room.size === 0) {
        rooms.delete(roomCode);
      } else {
        broadcastParticipants(io, roomCode);
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`WatchParty ready on http://${hostname}:${port}`);
  });
});
