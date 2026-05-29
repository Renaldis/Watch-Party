import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <section className="w-full max-w-md rounded-lg border border-line bg-white p-6 shadow-panel">
        <h1 className="text-2xl font-semibold text-ink">Create account</h1>
        <p className="mt-2 text-sm text-slate-600">Use email and password for the personal MVP.</p>
        <AuthForm mode="sign-up" />
        <p className="mt-5 text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-fern">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
