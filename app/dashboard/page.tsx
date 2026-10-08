
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Analytics = {
  overview: {
    totalApis: number;
    totalApiKeys: number;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
  };
  requestsPerApi: {
    id: string;
    name: string;
    slug: string;
    requests: number;
  }[];
  recentRequests: {
    id: string;
    statusCode: number;
    responseTime: number;
    createdAt: string;
    api: {
      name: string;
      slug: string;
    };
  }[];
};

export default function DashboardPage() {
  const router = useRouter();

  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const response = await fetch("/api/analytics");

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load analytics");
        }

        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("ANALYTICS_ERROR:", error);
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [router]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("LOGOUT_ERROR:", error);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-sm text-zinc-500">
            Loading APIFLOW...
          </div>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <p className="text-red-400">
              {error || "Something went wrong"}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const { overview, requestsPerApi, recentRequests } = data;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-zinc-800 bg-zinc-950 lg:flex lg:flex-col">

        <div className="flex h-16 items-center border-b border-zinc-800 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-bold text-black">
              AF
            </div>

            <span className="font-bold tracking-tight">
              APIFLOW
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">

          <NavItem
            label="Dashboard"
            active
            onClick={() => router.push("/dashboard")}
          />

          <NavItem
            label="APIs"
            onClick={() => router.push("/apis")}
          />

          <NavItem
            label="API Keys"
            onClick={() => router.push("/api-keys")}
          />
        </nav>

        <div className="border-t border-zinc-800 p-4">
          <button
            onClick={handleLogout}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-500 transition hover:bg-zinc-900 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">

        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-zinc-800 px-6 lg:px-8">
          <div>
            <p className="text-sm text-zinc-500">
              Developer Dashboard
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white lg:hidden"
          >
            Sign out
          </button>
        </header>

        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">

          {/* Heading */}
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-widest text-blue-400">
              Overview
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Dashboard
            </h1>

            <p className="mt-2 text-zinc-500">
              Monitor your APIs, traffic and performance.
            </p>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

            <StatCard
              title="Total APIs"
              value={overview.totalApis}
            />

            <StatCard
              title="API Keys"
              value={overview.totalApiKeys}
            />

            <StatCard
              title="Total Requests"
              value={overview.totalRequests}
            />

            <StatCard
              title="Successful Requests"
              value={overview.successfulRequests}
            />

            <StatCard
              title="Failed Requests"
              value={overview.failedRequests}
            />

            <StatCard
              title="Avg. Response Time"
              value={`${overview.averageResponseTime} ms`}
            />
          </div>

          {/* APIs */}
          <section className="mt-10">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">
                API Usage
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Requests routed through APIFLOW.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">

              {requestsPerApi.length === 0 ? (
                <div className="p-8 text-center text-sm text-zinc-500">
                  No APIs yet.
                </div>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {requestsPerApi.map((api) => (
                    <div
                      key={api.id}
                      className="flex items-center justify-between px-6 py-5"
                    >
                      <div>
                        <p className="font-medium">
                          {api.name}
                        </p>

                        <p className="mt-1 text-sm text-zinc-600">
                          /{api.slug}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">
                          {api.requests}
                        </p>

                        <p className="text-xs text-zinc-600">
                          requests
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Recent Requests */}
          <section className="mt-10">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">
                Recent Requests
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Latest requests processed by APIFLOW.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/50">

              {recentRequests.length === 0 ? (
                <div className="p-8 text-center text-sm text-zinc-500">
                  No requests yet.
                </div>
              ) : (
                <table className="w-full text-left text-sm">

                  <thead className="border-b border-zinc-800 text-zinc-500">
                    <tr>
                      <th className="px-6 py-4 font-medium">
                        API
                      </th>

                      <th className="px-6 py-4 font-medium">
                        Status
                      </th>

                      <th className="px-6 py-4 font-medium">
                        Response
                      </th>

                      <th className="px-6 py-4 font-medium">
                        Time
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-800">
                    {recentRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-zinc-900">

                        <td className="px-6 py-4">
                          <p className="font-medium">
                            {request.api.name}
                          </p>

                          <p className="mt-1 text-xs text-zinc-600">
                            /{request.api.slug}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={
                              request.statusCode >= 200 &&
                              request.statusCode < 300
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {request.statusCode}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-zinc-400">
                          {request.responseTime} ms
                        </td>

                        <td className="px-6 py-4 text-zinc-600">
                          {new Date(
                            request.createdAt
                          ).toLocaleString()}
                        </td>

                      </tr>
                    ))}
                  </tbody>

                </table>
              )}
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <p className="text-sm text-zinc-500">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold tracking-tight">
        {value}
      </p>
    </div>
  );
}

function NavItem({
  label,
  active = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${
        active
          ? "bg-zinc-900 text-white"
          : "text-zinc-500 hover:bg-zinc-900 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
