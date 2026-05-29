import { io, type Socket } from "socket.io-client";

export type PlaybackEvent = {
  roomCode: string;
  currentTime: number;
};

export type ChatMessage = {
  id: string;
  roomCode: string;
  senderId: string;
  senderClientId: string;
  senderName: string;
  message: string;
  timestamp: string;
};

export type Participant = {
  id: string;
  clientId: string;
  name: string;
};

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io({
      path: "/api/socket",
      autoConnect: false,
    });
  }

  return socket;
}
