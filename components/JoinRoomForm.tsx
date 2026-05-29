"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { normalizeRoomCode } from "@/lib/utils";

export function JoinRoomForm() {
  const router = useRouter();
  const [room, setRoom] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = normalizeRoomCode(room);
    if (code) {
      router.push(`/room/${code}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-[1fr_auto]">
      <TextInput
        aria-label="Room code"
        value={room}
        onChange={(event) => setRoom(event.target.value)}
        placeholder="ABC123"
        autoComplete="off"
      />
      <Button type="submit">
        <ArrowRight className="h-4 w-4" aria-hidden />
        Join
      </Button>
    </form>
  );
}
