"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createRoomCode } from "@/lib/utils";

export function CreateRoomForm() {
  const router = useRouter();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        router.push(`/room/${createRoomCode()}`);
      }}
    >
      <Button type="submit" className="w-full">
        <Plus className="h-4 w-4" aria-hidden />
        Create private room
      </Button>
    </form>
  );
}
