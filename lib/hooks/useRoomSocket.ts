"use client";

import { useEffect, useMemo, useState } from "react";
import { ChatMessage, getSocket, Participant } from "@/lib/socket";

export type PlaybackState = {
  status: "idle" | "playing" | "paused";
  currentTime: number;
  updatedBy: string;
};

export function useRoomSocket(roomCode: string) {
  const socket = useMemo(() => getSocket(), []);
  const [name] = useState(() => `Guest ${Math.floor(100 + Math.random() * 900)}`);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(() => socket.connected);
  const [playback, setPlayback] = useState<PlaybackState>({
    status: "idle",
    currentTime: 0,
    updatedBy: "system",
  });

  useEffect(() => {
    socket.connect();
    if (socket.connected) {
      socket.emit("join-room", { roomCode, name });
    }

    socket.on("connect", () => {
      setIsConnected(true);
      setError("");
      socket.emit("join-room", { roomCode, name });
    });
    socket.on("disconnect", () => {
      setIsConnected(false);
    });
    socket.on("participants", setParticipants);
    socket.on("room-error", (payload: { message: string }) => {
      setError(payload.message);
    });
    socket.on("chat-message", (message: ChatMessage) => {
      setMessages((current) => [...current, message]);
    });
    socket.on("play", (payload: { currentTime: number; senderName: string }) => {
      setPlayback({ status: "playing", currentTime: payload.currentTime, updatedBy: payload.senderName });
    });
    socket.on("pause", (payload: { currentTime: number; senderName: string }) => {
      setPlayback({ status: "paused", currentTime: payload.currentTime, updatedBy: payload.senderName });
    });
    socket.on("seek", (payload: { currentTime: number; senderName: string }) => {
      setPlayback((current) => ({
        status: current.status,
        currentTime: payload.currentTime,
        updatedBy: payload.senderName,
      }));
    });

    return () => {
      socket.emit("leave-room", { roomCode });
      socket.off("connect");
      socket.off("disconnect");
      socket.off("participants");
      socket.off("room-error");
      socket.off("chat-message");
      socket.off("play");
      socket.off("pause");
      socket.off("seek");
    };
  }, [name, roomCode, socket]);

  return {
    name,
    participants,
    messages,
    error,
    isConnected,
    playback,
    sendMessage(message: string) {
      socket.emit("chat-message", { roomCode, message, senderName: name });
    },
    play(currentTime: number) {
      socket.emit("play", { roomCode, currentTime, senderName: name });
      setPlayback({ status: "playing", currentTime, updatedBy: name });
    },
    pause(currentTime: number) {
      socket.emit("pause", { roomCode, currentTime, senderName: name });
      setPlayback({ status: "paused", currentTime, updatedBy: name });
    },
    seek(currentTime: number) {
      socket.emit("seek", { roomCode, currentTime, senderName: name });
      setPlayback((current) => ({ ...current, currentTime, updatedBy: name }));
    },
  };
}
