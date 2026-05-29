"use client";

import { useEffect, useMemo, useState } from "react";
import { ChatMessage, getSocket, Participant } from "@/lib/socket";

export type PlaybackState = {
  status: "idle" | "playing" | "paused";
  currentTime: number;
  updatedBy: string;
};

export type VideoSource = {
  videoUrl: string;
  videoTitle: string | null;
  updatedBy: string;
};

export function useRoomSocket(
  roomCode: string,
  initialSource?: {
    videoUrl: string | null;
    videoTitle: string | null;
  }
) {
  const socket = useMemo(() => getSocket(), []);
  const [clientId] = useState(() => {
    if (typeof window === "undefined") {
      return crypto.randomUUID();
    }

    const existingClientId = window.localStorage.getItem("watchparty-client-id");
    if (existingClientId) return existingClientId;

    const nextClientId = crypto.randomUUID();
    window.localStorage.setItem("watchparty-client-id", nextClientId);
    return nextClientId;
  });
  const [name, setName] = useState(() => {
    if (typeof window === "undefined") {
      return `Guest ${Math.floor(100 + Math.random() * 900)}`;
    }

    return window.localStorage.getItem("watchparty-display-name") || `Guest ${Math.floor(100 + Math.random() * 900)}`;
  });
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(() => socket.connected);
  const [playback, setPlayback] = useState<PlaybackState>({
    status: "idle",
    currentTime: 0,
    updatedBy: "system",
  });
  const [videoSource, setVideoSource] = useState<VideoSource | null>(() =>
    initialSource?.videoUrl
      ? {
          videoUrl: initialSource.videoUrl,
          videoTitle: initialSource.videoTitle,
          updatedBy: "room",
        }
      : null
  );

  useEffect(() => {
    socket.connect();
    if (socket.connected) {
      socket.emit("join-room", { roomCode, name, clientId });
    }

    socket.on("connect", () => {
      setIsConnected(true);
      setError("");
      socket.emit("join-room", { roomCode, name, clientId });
    });
    socket.on("disconnect", () => {
      setIsConnected(false);
    });
    socket.on("participants", setParticipants);
    socket.on("room-error", (payload: { message: string }) => {
      setError(payload.message);
    });
    socket.on("chat-history", (history: ChatMessage[]) => {
      setMessages(history);
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
    socket.on(
      "video-source",
      (payload: { videoUrl: string; videoTitle: string | null; senderName: string }) => {
        setVideoSource({
          videoUrl: payload.videoUrl,
          videoTitle: payload.videoTitle,
          updatedBy: payload.senderName,
        });
      }
    );

    return () => {
      socket.emit("leave-room", { roomCode });
      socket.off("connect");
      socket.off("disconnect");
      socket.off("participants");
      socket.off("room-error");
      socket.off("chat-history");
      socket.off("chat-message");
      socket.off("play");
      socket.off("pause");
      socket.off("seek");
      socket.off("video-source");
    };
  }, [clientId, name, roomCode, socket]);

  return {
    socketId: socket.id,
    clientId,
    name,
    participants,
    messages,
    error,
    isConnected,
    playback,
    videoSource,
    updateName(nextName: string) {
      const cleanName = nextName.trim().slice(0, 40);
      if (!cleanName) return;

      window.localStorage.setItem("watchparty-display-name", cleanName);
      setName(cleanName);
      socket.emit("join-room", { roomCode, name: cleanName, clientId });
    },
    sendMessage(message: string) {
      socket.emit("chat-message", { roomCode, message, senderName: name, senderClientId: clientId });
    },
    leaveRoom() {
      socket.emit("leave-room", { roomCode });
      setParticipants([]);
      setMessages([]);
    },
    setVideoSource(videoUrl: string, videoTitle: string | null) {
      socket.emit("video-source", { roomCode, videoUrl, videoTitle, senderName: name, senderClientId: clientId });
      setVideoSource({ videoUrl, videoTitle, updatedBy: name });
    },
    play(currentTime: number) {
      socket.emit("play", { roomCode, currentTime, senderName: name, senderClientId: clientId });
      setPlayback({ status: "playing", currentTime, updatedBy: name });
    },
    pause(currentTime: number) {
      socket.emit("pause", { roomCode, currentTime, senderName: name, senderClientId: clientId });
      setPlayback({ status: "paused", currentTime, updatedBy: name });
    },
    seek(currentTime: number) {
      socket.emit("seek", { roomCode, currentTime, senderName: name, senderClientId: clientId });
      setPlayback((current) => ({ ...current, currentTime, updatedBy: name }));
    },
  };
}
