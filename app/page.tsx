"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <button
            onClick={() => router.push("/")}
            className="text-xl font-bold tracking-tight"
          >
            APIFLOW
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/login")}
              className="rounded-lg px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
            >
              Login
            </button>

            <button
              onClick={() => router.push("/register")}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pb-24 pt-24 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 inline-flex rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-400">
            API Gateway & Management Platform
          </div>

          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            One gateway for
            <span className="block text-zinc-400">
              all your APIs.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-zinc-400">
            APIFLOW lets you connect, secure, rate-limit and monitor APIs
            through a single gateway. Manage API keys and track usage from one
            dashboard.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              onClick={() => router.push("/register")}
              className="rounded-lg bg-white px-6 py-3 font-semibold text-black transition hover:bg-zinc-200"
            >
              Start Building
            </button>

            <button
              onClick={() => router.push("/login")}
              className="rounded-lg border border-zinc-700 px-6 py-3 font-semibold text-zinc-200 transition hover:bg-zinc-900"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="border-y border-zinc-800 bg-zinc-900/30">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-500">
              HOW IT WORKS
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Put APIFLOW between your app and your APIs
            </h2>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <Feature
              number="01"
              title="Connect"
              description="Register your API and configure the target endpoint you want APIFLOW to proxy."
            />

            <Feature
              number="02"
              title="Secure"
              description="Generate API keys and validate every request before it reaches your target API."
            />

            <Feature
              number="03"
              title="Monitor"
              description="Rate-limit requests, record usage and monitor API performance from your dashboard."
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-zinc-500">
            FEATURES
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            Everything you need to manage API traffic
          </h2>

          <p className="mt-4 text-zinc-400">
            A simple gateway layer designed to centralize authentication,
            traffic control and API observability.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="API Gateway"
            description="Route requests through a centralized gateway before forwarding them to your target API."
          />

          <FeatureCard
            title="API Keys"
            description="Create, manage and revoke secure API keys for your APIs."
          />

          <FeatureCard
            title="Rate Limiting"
            description="Protect your APIs with Redis-powered request rate limiting."
          />

          <FeatureCard
            title="Usage Tracking"
            description="Record API requests, response status and response time for observability."
          />

          <FeatureCard
            title="Analytics"
            description="Monitor total requests, success rates, failures and API usage."
          />

          <FeatureCard
            title="Secure Architecture"
            description="Keep target API endpoints behind a controlled gateway layer."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-800">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <h2 className="text-4xl font-bold">
            Ready to manage your APIs?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
            Create your first API gateway and start monitoring your API traffic
            with APIFLOW.
          </p>

          <button
            onClick={() => router.push("/register")}
            className="mt-8 rounded-lg bg-white px-6 py-3 font-semibold text-black transition hover:bg-zinc-200"
          >
            Create Your Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} APIFLOW</p>

          <p>API Gateway & Management Platform</p>
        </div>
      </footer>
    </main>
  );
}

function Feature({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
      <span className="font-mono text-sm text-zinc-600">
        {number}
      </span>

      <h3 className="mt-5 text-xl font-semibold">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-zinc-400">
        {description}
      </p>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 transition hover:border-zinc-700">
      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
        <div className="h-2 w-2 rounded-full bg-zinc-400" />
      </div>

      <h3 className="text-lg font-semibold">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-zinc-400">
        {description}
      </p>
    </div>
  );
}