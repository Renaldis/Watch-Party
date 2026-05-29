"use client";

import { useEffect, useMemo, useState } from "react";
import { ChatMessage, getSocket, Participant } from "@/lib/socket";

export type PlaybackState = {
  status: "idle" | "playing" | "paused";
  currentTime: number;
  updatedBy: string;
};

export function useRoomSocket(roomCode: string) {
  const [name] = useState(() => `Guest ${Math.floor(100 + Math.random() * 900)}`);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [playback, setPlayback] = useState<PlaybackState>({
    status: "idle",
    currentTime: 0,
    updatedBy: "system",
  });
  const socket = useMemo(() => getSocket(), []);

  useEffect(() => {
    socket.connect();
    socket.emit("join-room", { roomCode, name });

    socket.on("participants", setParticipants);
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
      socket.off("participants");
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
