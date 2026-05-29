import Link from "next/link";
import { Clapperboard, Home } from "lucide-react";

export function RoomNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <section className="w-full max-w-md rounded-lg border border-line bg-white p-6 text-center shadow-panel">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-mist text-fern">
          <Clapperboard className="h-6 w-6" aria-hidden />
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-ink">Room not found</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          This room code does not exist yet. Create a new private room or check the shared URL.
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-fern px-4 text-sm font-semibold text-white"
        >
          <Home className="h-4 w-4" aria-hidden />
          Back home
        </Link>
      </section>
    </main>
  );
}

export default RoomNotFound;
