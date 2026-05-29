import Link from "next/link";
import { Clapperboard, DoorOpen, PlayCircle, UsersRound } from "lucide-react";
import { AuthStatus } from "@/components/AuthStatus";
import { CreateRoomForm } from "@/components/CreateRoomForm";
import { JoinRoomForm } from "@/components/JoinRoomForm";

export default function Home() {
  return (
    <main className="min-h-screen">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-ink">
          <Clapperboard className="h-6 w-6 text-fern" aria-hidden />
          WatchParty
        </Link>
        <AuthStatus />
      </nav>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-5 pb-12 pt-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
        <div className="pt-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-sm font-medium text-fern shadow-sm">
            <UsersRound className="h-4 w-4" aria-hidden />
            Personal rooms for 2-5 people
          </div>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.03] tracking-normal text-ink md:text-6xl">
            WatchParty
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
            Create a room, share the URL, chat in realtime, and keep play, pause,
            and seek actions synced while everyone watches from their own provider.
          </p>
          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            {[
              ["Create", "Open a private room"],
              ["Sync", "Play, pause, seek"],
              ["Chat", "Talk while watching"],
            ].map(([title, body]) => (
              <div key={title} className="rounded-lg border border-line bg-white p-4 shadow-sm">
                <p className="font-semibold text-ink">{title}</p>
                <p className="mt-1 text-sm text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-lg border border-line bg-white p-5 shadow-panel">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-fern text-white">
                <PlayCircle className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-ink">Create room</h2>
                <p className="text-sm text-slate-600">Start a fresh watch session.</p>
              </div>
            </div>
            <CreateRoomForm />
          </div>

          <div className="rounded-lg border border-line bg-white p-5 shadow-panel">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-coral text-white">
                <DoorOpen className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-ink">Join room</h2>
                <p className="text-sm text-slate-600">Use the room code or shared link.</p>
              </div>
            </div>
            <JoinRoomForm />
          </div>
        </div>
      </section>
    </main>
  );
}
