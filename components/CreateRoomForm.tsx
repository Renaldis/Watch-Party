"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CreateRoomForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function createRoom() {
    setError("");
    setIsPending(true);

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        credentials: "include",
      });

      if (response.status === 401) {
        router.push("/sign-in");
        return;
      }

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message || "Could not create room. Please try again.");
      }

      const room = (await response.json()) as { code: string };
      router.push(`/room/${room.code}`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not create room. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        void createRoom();
      }}
    >
      <Button type="submit" className="w-full" disabled={isPending}>
        <Plus className="h-4 w-4" aria-hidden />
        {isPending ? "Creating room" : "Create private room"}
      </Button>
      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
    </form>
  );
}
