"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";

type SessionPayload = {
  user?: {
    name?: string | null;
    email?: string | null;
  };
} | null;

export function AuthStatus() {
  const [session, setSession] = useState<SessionPayload>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/auth/get-session", {
      credentials: "include",
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: SessionPayload) => {
        if (isMounted) setSession(payload);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function signOut() {
    await fetch("/api/auth/sign-out", {
      method: "POST",
      credentials: "include",
    });
    setSession(null);
    window.location.href = "/";
  }

  if (isLoading) {
    return <div className="h-10 w-24 rounded-md border border-line bg-white shadow-sm" aria-hidden />;
  }

  if (!session?.user) {
    return (
      <Link
        href="/sign-in"
        className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-medium text-ink shadow-sm"
      >
        <LogIn className="h-4 w-4" aria-hidden />
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-sm font-medium text-slate-700 sm:inline">
        {session.user.name || session.user.email}
      </span>
      <Button type="button" variant="secondary" onClick={signOut} className="h-10">
        <LogOut className="h-4 w-4" aria-hidden />
        Logout
      </Button>
    </div>
  );
}
