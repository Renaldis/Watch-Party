import Link from "next/link";
import { Clapperboard } from "lucide-react";
import { RoomClient } from "@/components/room/RoomClient";

export default async function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const roomCode = code.toUpperCase();

  return (
    <main className="min-h-screen px-5 py-5">
      <nav className="mx-auto mb-5 flex w-full max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-ink">
          <Clapperboard className="h-6 w-6 text-fern" aria-hidden />
          WatchParty
        </Link>
        <span className="rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink shadow-sm">
          Room {roomCode}
        </span>
      </nav>
      <RoomClient roomCode={roomCode} />
    </main>
  );
}
