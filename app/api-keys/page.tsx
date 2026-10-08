"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Api = {
id: string;
name: string;
slug: string;
};

type ApiKey = {
id: string;
name: string;
prefix: string;
status: "ACTIVE" | "REVOKED";
createdAt: string;
lastUsedAt: string | null;
api: {
id: string;
name: string;
slug: string;
} | null;
};

export default function APIKeysPage() {
const router = useRouter();

const [keys, setKeys] = useState<ApiKey[]>([]);
const [apis, setApis] = useState<Api[]>([]);

const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const [showCreate, setShowCreate] = useState(false);
const [creating, setCreating] = useState(false);

const [keyName, setKeyName] = useState("");
const [selectedApi, setSelectedApi] = useState("");

const [newKey, setNewKey] = useState("");

useEffect(() => {
loadData();
}, []);

async function loadData() {
try {
setLoading(true);
setError("");

  const [apisResponse, keysResponse] = await Promise.all([
    fetch("/api/apis"),
    fetch("/api/keys"),
  ]);

  if (
    apisResponse.status === 401 ||
    keysResponse.status === 401
  ) {
    router.push("/login");
    return;
  }

  const apisData = await apisResponse.json();
  const keysData = await keysResponse.json();

  if (!apisResponse.ok) {
    throw new Error(
      apisData.error || "Failed to load APIs"
    );
  }

  if (!keysResponse.ok) {
    throw new Error(
      keysData.error || "Failed to load API keys"
    );
  }

  setApis(apisData.apis || []);
  setKeys(keysData.keys || []);
} catch (error) {
  console.error("LOAD_API_KEYS_ERROR:", error);
  setError("Failed to load API keys");
} finally {
  setLoading(false);
}

}

function openCreateModal() {
setError("");
setKeyName("");
setSelectedApi(apis[0]?.id || "");
setNewKey("");
setShowCreate(true);
}

function closeCreateModal() {
setShowCreate(false);
setKeyName("");
setSelectedApi("");
}

async function handleCreate(event: FormEvent<HTMLFormElement>) {
event.preventDefault();

if (!selectedApi) {
  setError("Please select an API");
  return;
}

setCreating(true);
setError("");
setNewKey("");

try {
  const response = await fetch(
    `/api/apis/${selectedApi}/keys`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: keyName,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    setError(data.error || "Failed to create API key");
    return;
  }

  setNewKey(data.key);

  setKeys((current) => [
    {
      ...data.apiKey,
      api: apis.find((api) => api.id === selectedApi) || null,
    },
    ...current,
  ]);
} catch (error) {
  console.error("CREATE_API_KEY_ERROR:", error);
  setError("Something went wrong while creating the API key");
} finally {
  setCreating(false);
}

}

async function handleRevoke(key: ApiKey) {
const confirmed = window.confirm(
`Revoke "${key.name}"? This key will no longer work.`
);

if (!confirmed) return;

try {
  const response = await fetch(`/api/keys/${key.id}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    setError(data.error || "Failed to revoke API key");
    return;
  }

  setKeys((current) =>
    current.map((item) =>
      item.id === key.id
        ? { ...item, status: "REVOKED" }
        : item
    )
  );
} catch (error) {
  console.error("REVOKE_API_KEY_ERROR:", error);
  setError("Something went wrong while revoking the key");
}

}

async function copyKey() {
if (!newKey) return;

try {
  await navigator.clipboard.writeText(newKey);
} catch (error) {
  console.error("COPY_KEY_ERROR:", error);
}

}

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

return ( <main className="min-h-screen bg-zinc-950 text-white">

  <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-zinc-800 bg-zinc-950 lg:flex lg:flex-col">

    <div className="flex h-16 items-center border-b border-zinc-800 px-6">
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-3"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-bold text-black">
          AF
        </div>

        <span className="font-bold tracking-tight">
          APIFLOW
        </span>
      </button>
    </div>

    <nav className="flex-1 space-y-1 p-4">

      <NavItem
        label="Dashboard"
        onClick={() => router.push("/dashboard")}
      />

      <NavItem
        label="APIs"
        onClick={() => router.push("/apis")}
      />

      <NavItem
        label="API Keys"
        active
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

  <div className="lg:pl-64">

    <header className="flex h-16 items-center justify-between border-b border-zinc-800 px-6 lg:px-8">

      <p className="text-sm text-zinc-500">
        Developer Dashboard
      </p>

      <button
        onClick={handleLogout}
        className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white lg:hidden"
      >
        Sign out
      </button>

    </header>

    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">

      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-blue-400">
            Security
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            API Keys
          </h1>

          <p className="mt-2 text-zinc-500">
            Manage credentials used to access your APIs.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          disabled={apis.length === 0}
          className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          + Create API Key
        </button>

      </div>

      <div className="mb-6 rounded-lg border border-yellow-900/50 bg-yellow-950/20 px-4 py-3 text-sm text-yellow-500">
        API keys provide access to your APIs. Never share them
        publicly or commit them to GitHub.
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <p className="text-sm text-zinc-500">
            Loading API keys...
          </p>
        </div>
      ) : keys.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-12 text-center">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 font-mono text-zinc-500">
            key
          </div>

          <h2 className="mt-5 text-lg font-semibold">
            No API keys yet
          </h2>

          {apis.length === 0 ? (
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
              Create an API first before generating an API key.
            </p>
          ) : (
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
              Generate a key to authenticate requests through
              the APIFLOW gateway.
            </p>
          )}

        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">

          <div className="divide-y divide-zinc-800">

            {keys.map((key) => (
              <div
                key={key.id}
                className="p-6"
              >

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                  <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-3">

                      <h2 className="font-semibold">
                        {key.name}
                      </h2>

                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          key.status === "ACTIVE"
                            ? "bg-green-950/50 text-green-400"
                            : "bg-red-950/50 text-red-400"
                        }`}
                      >
                        {key.status}
                      </span>

                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3">

                      <code className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-400">
                        {key.prefix}...
                      </code>

                      {key.api && (
                        <span className="text-sm text-zinc-500">
                          → {key.api.name}
                        </span>
                      )}

                    </div>

                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-600">

                      <span>
                        Created{" "}
                        {new Date(
                          key.createdAt
                        ).toLocaleDateString()}
                      </span>

                      <span>
                        {key.lastUsedAt
                          ? `Last used ${new Date(
                              key.lastUsedAt
                            ).toLocaleString()}`
                          : "Never used"}
                      </span>

                    </div>

                  </div>

                  {key.status === "ACTIVE" && (
                    <button
                      onClick={() => handleRevoke(key)}
                      className="shrink-0 rounded-lg border border-red-950 px-3 py-2 text-sm text-red-500 transition hover:bg-red-950/40"
                    >
                      Revoke
                    </button>
                  )}

                </div>

              </div>
            ))}

          </div>

        </div>
      )}

    </div>
  </div>

  {showCreate && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-8">

      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl">

        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">

          <h2 className="font-semibold">
            Create API Key
          </h2>

          <button
            onClick={closeCreateModal}
            className="text-xl text-zinc-500 hover:text-white"
          >
            ×
          </button>

        </div>

        {newKey ? (
          <div className="p-6">

            <div className="rounded-lg border border-green-900 bg-green-950/20 p-4">

              <p className="text-sm font-medium text-green-400">
                API key created successfully
              </p>

              <p className="mt-2 text-xs leading-5 text-zinc-500">
                Copy this key now. For security, APIFLOW will
                not show the full key again.
              </p>

              <div className="mt-4 flex gap-2">

                <input
                  readOnly
                  value={newKey}
                  className="min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-300 outline-none"
                />

                <button
                  onClick={copyKey}
                  className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200"
                >
                  Copy
                </button>

              </div>

            </div>

            <button
              onClick={closeCreateModal}
              className="mt-5 w-full rounded-lg border border-zinc-800 px-4 py-2.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Done
            </button>

          </div>
        ) : (
          <form
            onSubmit={handleCreate}
            className="space-y-5 p-6"
          >

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Key Name
              </label>

              <input
                type="text"
                value={keyName}
                onChange={(event) =>
                  setKeyName(event.target.value)
                }
                placeholder="Production Key"
                required
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                API
              </label>

              <select
                value={selectedApi}
                onChange={(event) =>
                  setSelectedApi(event.target.value)
                }
                required
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-zinc-600"
              >
                {apis.map((api) => (
                  <option key={api.id} value={api.id}>
                    {api.name} — /{api.slug}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">

              <button
                type="button"
                onClick={closeCreateModal}
                className="rounded-lg border border-zinc-800 px-4 py-2.5 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={creating}
                className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating
                  ? "Generating..."
                  : "Generate Key"}
              </button>

            </div>

          </form>
        )}

      </div>

    </div>
  )}

</main>

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
{label} </button>
);
}
