"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Api = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  endpoint: string;
  createdAt: string;
};

type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  status: string;
  createdAt: string;
  lastUsedAt: string | null;
};

export default function ApiDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const apiId = params.id as string;

  const [api, setApi] = useState<Api | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedKey, setSelectedKey] = useState("");
  const [requestBody, setRequestBody] = useState(
    JSON.stringify(
      {
        title: "Hello APIFLOW",
        body: "Testing the API gateway",
        userId: 1,
      },
      null,
      2
    )
  );

  const [response, setResponse] = useState("");
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [apiResponse, keysResponse] = await Promise.all([
        fetch(`/api/apis/${apiId}`),
        fetch(`/api/apis/${apiId}/keys`),
      ]);

      if (apiResponse.status === 401 || keysResponse.status === 401) {
        router.push("/login");
        return;
      }

      if (!apiResponse.ok) {
        throw new Error("API not found");
      }

      const apiData = await apiResponse.json();
      const keysData = await keysResponse.json();

      setApi(apiData.api);
      setApiKeys(keysData.apiKeys || []);
    } catch (error) {
      console.error("LOAD_API_DETAILS_ERROR:", error);
      setApi(null);
    } finally {
      setLoading(false);
    }
  }

  async function testApi() {
    if (!api) return;

    if (!selectedKey) {
      setResponse("Please select an API key first.");
      setResponseStatus(null);
      return;
    }

    try {
      setTesting(true);
      setResponse("");
      setResponseStatus(null);

      let body;

      try {
        body = JSON.parse(requestBody);
      } catch {
        setResponse("Invalid JSON request body.");
        return;
      }

      const res = await fetch(`/api/gateway/${api.slug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": selectedKey,
        },
        body: JSON.stringify(body),
      });

      const text = await res.text();

      setResponseStatus(res.status);

      try {
        const json = JSON.parse(text);
        setResponse(JSON.stringify(json, null, 2));
      } catch {
        setResponse(text);
      }
    } catch (error) {
      console.error("TEST_API_ERROR:", error);
      setResponse("Request failed. Check your API gateway.");
    } finally {
      setTesting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <p className="text-zinc-400">Loading API...</p>
      </div>
    );
  }

  if (!api) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold">API not found</h1>

          <button
            onClick={() => router.push("/apis")}
            className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
          >
            Back to APIs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 bg-zinc-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <button
              onClick={() => router.push("/apis")}
              className="text-sm text-zinc-400 hover:text-white"
            >
              ← Back to APIs
            </button>

            <h1 className="mt-3 text-2xl font-semibold">{api.name}</h1>

            <p className="mt-1 text-sm text-zinc-400">
              {api.description || "No description provided"}
            </p>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2">
            <p className="text-xs text-zinc-500">Slug</p>
            <p className="font-mono text-sm text-zinc-200">{api.slug}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* API information */}
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-lg font-semibold">API Information</h2>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Name
                </p>
                <p className="mt-1 text-sm">{api.name}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Slug
                </p>
                <p className="mt-1 break-all font-mono text-sm">
                  {api.slug}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Target Endpoint
                </p>
                <p className="mt-1 break-all font-mono text-sm text-zinc-300">
                  {api.endpoint}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Gateway
                </p>
                <p className="mt-1 break-all font-mono text-sm text-zinc-300">
                  POST /api/gateway/{api.slug}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  Created
                </p>
                <p className="mt-1 text-sm text-zinc-300">
                  {new Date(api.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </section>

          {/* API keys */}
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">API Keys</h2>

              <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-400">
                {apiKeys.length}
              </span>
            </div>

            {apiKeys.length === 0 ? (
              <div className="mt-6 rounded-lg border border-dashed border-zinc-700 p-6 text-center">
                <p className="text-sm text-zinc-400">
                  No API keys created yet.
                </p>

                <button
                  onClick={() => router.push("/api-keys")}
                  className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
                >
                  Create API Key
                </button>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {apiKeys.map((key) => (
                  <button
                    key={key.id}
                    onClick={() => {
                      if (key.status === "ACTIVE") {
                        setSelectedKey(key.id);
                      }
                    }}
                    className={`w-full rounded-lg border p-4 text-left transition ${
                      selectedKey === key.id
                        ? "border-white bg-zinc-800"
                        : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{key.name}</span>

                      <span
                        className={`text-xs ${
                          key.status === "ACTIVE"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {key.status}
                      </span>
                    </div>

                    <p className="mt-2 font-mono text-xs text-zinc-500">
                      {key.prefix}...
                    </p>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Quick test */}
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-lg font-semibold">Gateway Test</h2>

            <p className="mt-2 text-sm text-zinc-500">
              Send a request through the APIFLOW gateway.
            </p>

            <div className="mt-6">
              <label className="text-xs uppercase tracking-wide text-zinc-500">
                API Key
              </label>

              <select
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
                className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm outline-none focus:border-zinc-600"
              >
                <option value="">Select API key</option>

                {apiKeys
                  .filter((key) => key.status === "ACTIVE")
                  .map((key) => (
                    <option key={key.id} value={key.id}>
                      {key.name} — {key.prefix}...
                    </option>
                  ))}
              </select>
            </div>

            <div className="mt-5">
              <label className="text-xs uppercase tracking-wide text-zinc-500">
                Request Body
              </label>

              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                rows={10}
                className="mt-2 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs text-zinc-300 outline-none focus:border-zinc-600"
              />
            </div>

            <button
              onClick={testApi}
              disabled={testing}
              className="mt-4 w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {testing ? "Sending..." : "Send Request"}
            </button>
          </section>
        </div>

        {/* Response */}
        <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Response</h2>

            {responseStatus !== null && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  responseStatus >= 200 && responseStatus < 300
                    ? "bg-green-500/10 text-green-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                HTTP {responseStatus}
              </span>
            )}
          </div>

          <pre className="mt-5 min-h-40 overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs leading-6 text-zinc-300">
            {response || "Response will appear here..."}
          </pre>
        </section>
      </main>
    </div>
  );
}