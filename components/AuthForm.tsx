"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const endpoint = mode === "sign-in" ? "/api/auth/sign-in/email" : "/api/auth/sign-up/email";
    const body =
      mode === "sign-in"
        ? {
            email: String(formData.get("email") || ""),
            password: String(formData.get("password") || ""),
          }
        : {
            name: String(formData.get("name") || ""),
            email: String(formData.get("email") || ""),
            password: String(formData.get("password") || ""),
          };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        credentials: "include",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message || "Authentication failed. Please try again.");
      }

      setMessage(mode === "sign-in" ? "Signed in successfully." : "Account created successfully.");
      router.push("/");
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Authentication failed. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="mt-5 grid gap-3" onSubmit={handleSubmit}>
      {mode === "sign-up" ? (
        <TextInput aria-label="Name" name="name" placeholder="Name" autoComplete="name" required />
      ) : null}
      <TextInput aria-label="Email" name="email" placeholder="Email" type="email" autoComplete="email" required />
      <TextInput
        aria-label="Password"
        name="password"
        placeholder="Password"
        type="password"
        autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
        minLength={8}
        required
      />
      <Button type="submit" disabled={isPending}>
        {mode === "sign-in" ? <Mail className="h-4 w-4" aria-hidden /> : <UserPlus className="h-4 w-4" aria-hidden />}
        {isPending ? "Please wait" : mode === "sign-in" ? "Sign in" : "Create account"}
      </Button>
      {message ? <p className="rounded-md bg-mist px-3 py-2 text-sm text-slate-700">{message}</p> : null}
      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
    </form>
  );
}
