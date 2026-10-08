"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
const router = useRouter();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

async function handleSubmit(event: FormEvent<HTMLFormElement>) {
event.preventDefault();

setError("");

if (password !== confirmPassword) {
  setError("Passwords do not match");
  return;
}

if (password.length < 8) {
  setError("Password must be at least 8 characters");
  return;
}

setLoading(true);

try {
  const response = await fetch("/api/auth/register", {
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
    setError(data.error || "Registration failed");
    return;
  }

  router.push("/login");
} catch (error) {
  console.error("REGISTER_ERROR:", error);
  setError("Something went wrong. Please try again.");
} finally {
  setLoading(false);
}


}

return ( <main className="min-h-screen bg-zinc-950 text-white"> <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12"> <div className="grid w-full gap-12 lg:grid-cols-2 lg:gap-20">


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
          Build and manage your APIs with confidence.
        </h1>

        <p className="mt-6 max-w-md text-lg leading-8 text-zinc-400">
          Secure your APIs, generate API keys, control traffic
          with rate limits, and monitor usage from one dashboard.
        </p>

        <div className="mt-10 space-y-4">
          <Feature text="Secure API key authentication" />
          <Feature text="Built-in Redis rate limiting" />
          <Feature text="Request analytics and monitoring" />
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div className="w-full max-w-md">

          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white font-bold text-black">
              AF
            </div>

            <span className="text-xl font-bold">
              APIFLOW
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold">
              Create your account
            </h2>

            <p className="mt-2 text-zinc-400">
              Start building with APIFLOW.
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
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                required
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-zinc-600"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Confirm password
              </label>

              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Repeat your password"
                autoComplete="new-password"
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
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="font-medium text-white hover:underline"
            >
              Sign in
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
return ( <div className="flex items-center gap-3 text-zinc-400"> <div className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 text-xs text-blue-400">
✓ </div>


  <span>{text}</span>
</div>


);
}
