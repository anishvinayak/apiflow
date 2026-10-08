
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid email or password");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("LOGIN_ERROR:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
        <div className="grid w-full gap-12 lg:grid-cols-2 lg:gap-20">

          {/* Branding */}
          <div className="hidden flex-col justify-center lg:flex">
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white font-bold text-black">
                AF
              </div>

              <span className="text-xl font-bold tracking-tight">
                APIFLOW
              </span>
            </div>

            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-blue-400">
              API Infrastructure
            </p>

            <h1 className="max-w-lg text-5xl font-bold leading-tight">
              Your APIs.
              <br />
              Your infrastructure.
              <br />
              One flow.
            </h1>

            <p className="mt-6 max-w-md text-lg leading-8 text-zinc-400">
              Manage API access, secure your endpoints, control
              traffic and monitor usage from one developer platform.
            </p>

            <div className="mt-10 space-y-4">
              <Feature text="API key authentication" />
              <Feature text="Redis-powered rate limiting" />
              <Feature text="Request analytics" />
            </div>
          </div>

          {/* Login */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">

              {/* Mobile branding */}
              <div className="mb-10 flex items-center gap-3 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white font-bold text-black">
                  AF
                </div>

                <span className="text-xl font-bold">
                  APIFLOW
                </span>
              </div>

              <div className="mb-8">
                <p className="mb-3 text-sm font-medium uppercase tracking-widest text-blue-400">
                  Welcome back
                </p>

                <h2 className="text-3xl font-bold">
                  Sign in to APIFLOW
                </h2>

                <p className="mt-2 text-zinc-400">
                  Access your APIs and analytics dashboard.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-zinc-300"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-zinc-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-zinc-300"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Your password"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-zinc-600"
                  />
                </div>

                {error && (
                  <div className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-zinc-500">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/register")}
                  className="font-medium text-white hover:underline"
                >
                  Create an account
                </button>
              </p>

              <p className="mt-8 text-center text-xs text-zinc-600">
                APIFLOW — API infrastructure for developers
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-zinc-400">
      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 text-xs text-blue-400">
        ✓
      </div>

      <span>{text}</span>
    </div>
  );
}
