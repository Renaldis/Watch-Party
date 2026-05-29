"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Minus, Pause, Play, Plus, Send, SkipForward, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { useRoomSocket } from "@/lib/hooks/useRoomSocket";

const maxSeekSeconds = 4 * 60 * 60;

function formatTimestamp(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function RoomClient({ roomCode }: { roomCode: string }) {
  const room = useRoomSocket(roomCode);
  const [message, setMessage] = useState("");
  const [time, setTime] = useState(0);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return `/room/${roomCode}`;
    return `${window.location.origin}/room/${roomCode}`;
  }, [roomCode]);
  const displayTime = formatTimestamp(time);

  useEffect(() => {
    updateTime(room.playback.currentTime);
  }, [room.playback.currentTime]);

  function updateTime(nextTime: number) {
    setTime(Math.min(maxSeekSeconds, Math.max(0, Math.round(nextTime))));
  }

  async function copyLink() {
    await navigator.clipboard?.writeText(shareUrl);
    setCopyState("copied");
    window.setTimeout(() => setCopyState("idle"), 1800);
  }

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
            <div className="flex items-center gap-2 rounded-md border border-line bg-mist px-3 py-2 text-sm font-medium text-slate-700">
              <span
                className={room.isConnected ? "h-2.5 w-2.5 rounded-full bg-fern" : "h-2.5 w-2.5 rounded-full bg-coral"}
                aria-hidden
              />
              {room.isConnected ? "Connected" : "Connecting"}
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void copyLink()}
            >
              {copyState === "copied" ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
              {copyState === "copied" ? "Copied" : "Copy link"}
            </Button>
          </div>
          {room.error ? (
            <p className="mt-4 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
              {room.error}
            </p>
          ) : null}

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
                <p className="mt-1 text-sm text-white/70">
                  Local target {displayTime}. Match this time in your provider if playback drifts.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-line bg-mist p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-ink">Current time</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{displayTime}</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button type="button" variant="secondary" onClick={() => updateTime(time - 10)}>
                  <Minus className="h-4 w-4" aria-hidden />
                  10s
                </Button>
                <TextInput
                  aria-label="Current time in seconds"
                  type="number"
                  min={0}
                  max={maxSeekSeconds}
                  value={time}
                  onChange={(event) => updateTime(Number(event.target.value))}
                  className="text-center tabular-nums"
                />
                <Button type="button" variant="secondary" onClick={() => updateTime(time + 10)}>
                  <Plus className="h-4 w-4" aria-hidden />
                  10s
                </Button>
              </div>
            </div>
            <input
              aria-label="Seek slider"
              type="range"
              min={0}
              max={maxSeekSeconds}
              step={1}
              value={time}
              onChange={(event) => updateTime(Number(event.target.value))}
              className="mt-4 h-2 w-full cursor-pointer accent-fern"
            />
            <div className="mt-2 flex justify-between text-xs font-medium text-slate-500">
              <span>0:00</span>
              <span>4:00:00</span>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_1fr]">
            <Button type="button" onClick={() => room.play(time)} disabled={!room.isConnected}>
              <Play className="h-4 w-4" aria-hidden />
              Play
            </Button>
            <Button type="button" variant="secondary" onClick={() => room.pause(time)} disabled={!room.isConnected}>
              <Pause className="h-4 w-4" aria-hidden />
              Pause
            </Button>
            <Button type="button" variant="secondary" onClick={() => room.seek(time)} disabled={!room.isConnected}>
              <SkipForward className="h-4 w-4" aria-hidden />
              Seek to {displayTime}
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
            <Button type="submit" disabled={!room.isConnected}>
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
