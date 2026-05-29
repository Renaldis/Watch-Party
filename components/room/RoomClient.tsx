"use client";

import { useMemo, useState } from "react";
import { Copy, Pause, Play, Send, SkipForward, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { useRoomSocket } from "@/lib/hooks/useRoomSocket";

export function RoomClient({ roomCode }: { roomCode: string }) {
  const room = useRoomSocket(roomCode);
  const [message, setMessage] = useState("");
  const [time, setTime] = useState(0);
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return `/room/${roomCode}`;
    return `${window.location.origin}/room/${roomCode}`;
  }, [roomCode]);

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-5 lg:grid-cols-[1fr_340px]">
      <div className="grid gap-5">
        <div className="rounded-lg border border-line bg-white p-5 shadow-panel">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-ink">Sync controls</h1>
              <p className="mt-1 text-sm text-slate-600">
                Last update: {room.playback.updatedBy} at {Math.round(room.playback.currentTime)}s
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigator.clipboard?.writeText(shareUrl)}
            >
              <Copy className="h-4 w-4" aria-hidden />
              Copy link
            </Button>
          </div>

          <div className="mt-6 aspect-video w-full rounded-lg border border-line bg-[#20252b] p-5 text-white">
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/12">
                {room.playback.status === "playing" ? (
                  <Play className="h-10 w-10" aria-hidden />
                ) : (
                  <Pause className="h-10 w-10" aria-hidden />
                )}
              </div>
              <div>
                <p className="text-xl font-semibold">
                  {room.playback.status === "playing" ? "Playing" : "Paused"}
                </p>
                <p className="mt-1 text-sm text-white/70">Use these controls while your provider video is open.</p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-[auto_auto_1fr_auto]">
            <Button type="button" onClick={() => room.play(time)}>
              <Play className="h-4 w-4" aria-hidden />
              Play
            </Button>
            <Button type="button" variant="secondary" onClick={() => room.pause(time)}>
              <Pause className="h-4 w-4" aria-hidden />
              Pause
            </Button>
            <TextInput
              aria-label="Current time in seconds"
              type="number"
              min={0}
              value={time}
              onChange={(event) => setTime(Number(event.target.value))}
            />
            <Button type="button" variant="secondary" onClick={() => room.seek(time)}>
              <SkipForward className="h-4 w-4" aria-hidden />
              Seek
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-line bg-white p-5 shadow-panel">
          <h2 className="text-lg font-semibold text-ink">Chat</h2>
          <div className="mt-4 flex h-72 flex-col gap-3 overflow-y-auto rounded-md border border-line bg-mist p-3">
            {room.messages.length === 0 ? (
              <p className="m-auto text-sm text-slate-500">No messages yet.</p>
            ) : (
              room.messages.map((chat) => (
                <article key={chat.id} className="rounded-md bg-white p-3 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-ink">{chat.senderName}</p>
                    <time className="text-xs text-slate-500">
                      {new Date(chat.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{chat.message}</p>
                </article>
              ))
            )}
          </div>
          <form
            className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              if (!message.trim()) return;
              room.sendMessage(message.trim());
              setMessage("");
            }}
          >
            <TextInput
              aria-label="Chat message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Type a message"
            />
            <Button type="submit">
              <Send className="h-4 w-4" aria-hidden />
              Send
            </Button>
          </form>
        </div>
      </div>

      <aside className="rounded-lg border border-line bg-white p-5 shadow-panel">
        <div className="flex items-center gap-2">
          <UsersRound className="h-5 w-5 text-fern" aria-hidden />
          <h2 className="text-lg font-semibold text-ink">Participants</h2>
        </div>
        <p className="mt-1 text-sm text-slate-600">{room.participants.length} online</p>
        <div className="mt-4 grid gap-2">
          {room.participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between rounded-md border border-line bg-mist px-3 py-2"
            >
              <span className="font-medium text-ink">{participant.name}</span>
              <span className="h-2.5 w-2.5 rounded-full bg-fern" aria-label="Online" />
            </div>
          ))}
        </div>
      </aside>
    </section>
  );
}
