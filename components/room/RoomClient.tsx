"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, LinkIcon, LogOut, Minus, Pause, Play, Plus, Send, SkipForward, UserPen, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { useRoomSocket } from "@/lib/hooks/useRoomSocket";

const fallbackMaxSeekSeconds = 4 * 60 * 60;

type ProviderStatus = {
  detected: boolean;
  url: string;
  currentTime: number | null;
  duration: number | null;
  paused: boolean | null;
  updatedAt: number;
};

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

function sendProviderCommand(action: "play" | "pause" | "seek", currentTime: number) {
  window.postMessage(
    {
      type: "WATCHPARTY_PROVIDER_COMMAND",
      command: {
        action,
        currentTime,
      },
    },
    window.location.origin
  );
}

export function RoomClient({
  roomCode,
  initialSource,
}: {
  roomCode: string;
  initialSource: {
    videoUrl: string | null;
    videoTitle: string | null;
  };
}) {
  const router = useRouter();
  const room = useRoomSocket(roomCode, initialSource);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isApplyingRemotePlayback = useRef(false);
  const [message, setMessage] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [time, setTime] = useState(0);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [sourceUrl, setSourceUrl] = useState(initialSource.videoUrl || "");
  const [sourceTitle, setSourceTitle] = useState(initialSource.videoTitle || "");
  const [sourceError, setSourceError] = useState("");
  const [isSavingSource, setIsSavingSource] = useState(false);
  const [duration, setDuration] = useState(fallbackMaxSeekSeconds);
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);
  const [isExtensionBridgeReady, setIsExtensionBridgeReady] = useState(false);
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return `/room/${roomCode}`;
    return `${window.location.origin}/room/${roomCode}`;
  }, [roomCode]);
  const displayTime = formatTimestamp(time);
  const displayDuration = formatTimestamp(duration);
  const canControlPlayback = room.isConnected && (Boolean(room.videoSource?.videoUrl) || Boolean(providerStatus?.detected));

  useEffect(() => {
    const timeout = window.setTimeout(() => setDisplayName(room.name), 0);
    return () => window.clearTimeout(timeout);
  }, [room.name]);

  useEffect(() => {
    function handleProviderStatus(event: MessageEvent) {
      if (event.source !== window) return;
      if (event.data?.type === "WATCHPARTY_EXTENSION_BRIDGE_READY") {
        setIsExtensionBridgeReady(true);
        return;
      }

      if (event.data?.type !== "WATCHPARTY_PROVIDER_STATUS") return;

      setProviderStatus(event.data.status);
    }

    window.addEventListener("message", handleProviderStatus);
    const interval = window.setInterval(() => {
      window.postMessage({ type: "WATCHPARTY_GET_PROVIDER_STATUS" }, window.location.origin);
    }, 1500);
    window.postMessage({ type: "WATCHPARTY_GET_PROVIDER_STATUS" }, window.location.origin);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("message", handleProviderStatus);
    };
  }, []);

  const updateTime = useCallback(
    (nextTime: number) => {
      setTime(Math.min(duration, Math.max(0, Math.round(nextTime))));
    },
    [duration]
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => updateTime(room.playback.currentTime), 0);
    return () => window.clearTimeout(timeout);
  }, [room.playback.currentTime, updateTime]);

  useEffect(() => {
    if (room.playback.updatedBy === room.name) return;

    if (room.playback.status === "playing") {
      sendProviderCommand("play", room.playback.currentTime);
    } else if (room.playback.status === "paused") {
      sendProviderCommand("pause", room.playback.currentTime);
    } else {
      sendProviderCommand("seek", room.playback.currentTime);
    }

    const video = videoRef.current;
    if (!video) return;

    isApplyingRemotePlayback.current = true;
    if (Math.abs(video.currentTime - room.playback.currentTime) > 0.75) {
      video.currentTime = room.playback.currentTime;
    }

    if (room.playback.status === "playing") {
      void video.play().catch(() => {
        // Browsers can block remote autoplay until the user interacts with the page.
      });
    }

    if (room.playback.status === "paused") {
      video.pause();
    }

    window.setTimeout(() => {
      isApplyingRemotePlayback.current = false;
    }, 300);
  }, [room.name, room.playback.currentTime, room.playback.status, room.playback.updatedBy]);

  async function copyLink() {
    await navigator.clipboard?.writeText(shareUrl);
    setCopyState("copied");
    window.setTimeout(() => setCopyState("idle"), 1800);
  }

  function leaveRoom() {
    room.leaveRoom();
    router.push("/");
  }

  async function saveVideoSource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSourceError("");
    setIsSavingSource(true);

    try {
      const response = await fetch(`/api/rooms/${roomCode}/source`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl: sourceUrl,
          videoTitle: sourceTitle || undefined,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message || "Could not save the video source.");
      }

      const source = (await response.json()) as { videoUrl: string; videoTitle: string | null };
      room.setVideoSource(source.videoUrl, source.videoTitle);
    } catch (caughtError) {
      setSourceError(caughtError instanceof Error ? caughtError.message : "Could not save the video source.");
    } finally {
      setIsSavingSource(false);
    }
  }

  function playVideo() {
    const video = videoRef.current;
    if (video) {
      video.currentTime = time;
      void video.play();
      sendProviderCommand("play", video.currentTime);
      room.play(video.currentTime);
      return;
    }

    sendProviderCommand("play", time);
    room.play(time);
  }

  function pauseVideo() {
    const video = videoRef.current;
    if (video) {
      video.pause();
      sendProviderCommand("pause", video.currentTime);
      room.pause(video.currentTime);
      return;
    }

    sendProviderCommand("pause", time);
    room.pause(time);
  }

  function seekVideo() {
    const video = videoRef.current;
    if (video) {
      video.currentTime = time;
    }

    sendProviderCommand("seek", time);
    room.seek(time);
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
            <div className="flex items-center gap-2 rounded-md border border-line bg-mist px-3 py-2 text-sm font-medium text-slate-700">
              <span
                className={providerStatus?.detected ? "h-2.5 w-2.5 rounded-full bg-fern" : "h-2.5 w-2.5 rounded-full bg-gold"}
                aria-hidden
              />
              {providerStatus?.detected
                ? "Provider detected"
                : isExtensionBridgeReady
                  ? "Provider not detected"
                  : "Extension not connected"}
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void copyLink()}
            >
              {copyState === "copied" ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
              {copyState === "copied" ? "Copied" : "Copy link"}
            </Button>
            <Button type="button" variant="danger" onClick={leaveRoom}>
              <LogOut className="h-4 w-4" aria-hidden />
              Leave
            </Button>
          </div>
          {room.error ? (
            <p className="mt-4 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
              {room.error}
            </p>
          ) : null}

          <form onSubmit={saveVideoSource} className="mt-6 rounded-lg border border-line bg-mist p-4">
            <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
              <TextInput
                aria-label="Video URL"
                type="url"
                value={sourceUrl}
                onChange={(event) => setSourceUrl(event.target.value)}
                placeholder="https://example.com/movie.mp4"
                required
              />
              <TextInput
                aria-label="Video title"
                value={sourceTitle}
                onChange={(event) => setSourceTitle(event.target.value)}
                placeholder="Movie title"
              />
              <Button type="submit" disabled={isSavingSource}>
                <LinkIcon className="h-4 w-4" aria-hidden />
                {isSavingSource ? "Saving" : "Set video"}
              </Button>
            </div>
            {sourceError ? <p className="mt-3 text-sm text-red-700">{sourceError}</p> : null}
          </form>

          <div className="mt-5 aspect-video w-full overflow-hidden rounded-lg border border-line bg-[#20252b] text-white">
            {room.videoSource?.videoUrl ? (
              <video
                ref={videoRef}
                key={room.videoSource.videoUrl}
                src={room.videoSource.videoUrl}
                controls
                playsInline
                className="h-full w-full bg-black"
                onTimeUpdate={(event) => updateTime(event.currentTarget.currentTime)}
                onLoadedMetadata={(event) => {
                  if (Number.isFinite(event.currentTarget.duration)) {
                    setDuration(Math.max(1, Math.round(event.currentTarget.duration)));
                  }
                  updateTime(event.currentTarget.currentTime);
                }}
                onPlay={(event) => {
                  if (!isApplyingRemotePlayback.current) {
                    sendProviderCommand("play", event.currentTarget.currentTime);
                    room.play(event.currentTarget.currentTime);
                  }
                }}
                onPause={(event) => {
                  if (!isApplyingRemotePlayback.current) {
                    sendProviderCommand("pause", event.currentTarget.currentTime);
                    room.pause(event.currentTarget.currentTime);
                  }
                }}
                onSeeked={(event) => {
                  if (!isApplyingRemotePlayback.current) {
                    updateTime(event.currentTarget.currentTime);
                    sendProviderCommand("seek", event.currentTarget.currentTime);
                    room.seek(event.currentTarget.currentTime);
                  }
                }}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-4 p-5 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/12">
                  <Play className="h-10 w-10" aria-hidden />
                </div>
                <div>
                  <p className="text-xl font-semibold">Set a video source</p>
                  <p className="mt-1 max-w-md text-sm text-white/70">
                    Add a direct video URL that can be played by the browser, then everyone in this room can watch it here.
                  </p>
                </div>
              </div>
            )}
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
                  max={duration}
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
              max={duration}
              step={1}
              value={time}
              onChange={(event) => updateTime(Number(event.target.value))}
              className="mt-4 h-2 w-full cursor-pointer accent-fern"
            />
            <div className="mt-2 flex justify-between text-xs font-medium text-slate-500">
              <span>0:00</span>
              <span>{displayDuration}</span>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_1fr]">
            <Button type="button" onClick={playVideo} disabled={!canControlPlayback}>
              <Play className="h-4 w-4" aria-hidden />
              Play
            </Button>
            <Button type="button" variant="secondary" onClick={pauseVideo} disabled={!canControlPlayback}>
              <Pause className="h-4 w-4" aria-hidden />
              Pause
            </Button>
            <Button type="button" variant="secondary" onClick={seekVideo} disabled={!canControlPlayback}>
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
              room.messages.map((chat) => {
                const isMine = chat.senderClientId === room.clientId;

                return (
                  <article
                    key={chat.id}
                    className={
                      isMine
                        ? "ml-auto w-fit max-w-[86%] rounded-md bg-fern p-3 text-white shadow-sm"
                        : "mr-auto w-fit max-w-[86%] rounded-md bg-white p-3 shadow-sm"
                    }
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className={isMine ? "font-semibold text-white" : "font-semibold text-ink"}>
                        {isMine ? `${chat.senderName} (You)` : chat.senderName}
                      </p>
                      <time className={isMine ? "text-xs text-white/75" : "text-xs text-slate-500"}>
                        {new Date(chat.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </div>
                    <p className={isMine ? "mt-1 text-sm text-white" : "mt-1 text-sm text-slate-700"}>{chat.message}</p>
                  </article>
                );
              })
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
        <form
          className="mt-4 grid gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            room.updateName(displayName);
          }}
        >
          <TextInput
            aria-label="Display name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            maxLength={40}
            placeholder="Your name"
          />
          <Button type="submit" variant="secondary" disabled={!displayName.trim() || displayName.trim() === room.name}>
            <UserPen className="h-4 w-4" aria-hidden />
            Rename
          </Button>
        </form>
        <div className="mt-4 grid gap-2">
          {room.participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between rounded-md border border-line bg-mist px-3 py-2"
            >
              <span className="font-medium text-ink">
                {participant.clientId === room.clientId ? `${participant.name} (You)` : participant.name}
              </span>
              <span className="flex items-center gap-2">
                {participant.clientId === room.clientId ? (
                  <span className="rounded-full bg-fern px-2 py-0.5 text-xs font-semibold text-white">Me</span>
                ) : null}
                <span className="h-2.5 w-2.5 rounded-full bg-fern" aria-label="Online" />
              </span>
            </div>
          ))}
        </div>
      </aside>
    </section>
  );
}
