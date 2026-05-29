import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <section className="w-full max-w-md rounded-lg border border-line bg-white p-6 shadow-panel">
        <h1 className="text-2xl font-semibold text-ink">Sign in</h1>
        <p className="mt-2 text-sm text-slate-600">Email authentication is ready for backend wiring.</p>
        <AuthForm mode="sign-in" />
        <p className="mt-5 text-sm text-slate-600">
          New here?{" "}
          <Link href="/sign-up" className="font-semibold text-fern">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
