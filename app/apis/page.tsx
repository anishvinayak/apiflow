"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Api = {
id: string;
name: string;
slug: string;
description: string | null;
endpoint: string;
createdAt: string;
updatedAt: string;
};

export default function APIsPage() {
const router = useRouter();

const [apis, setApis] = useState<Api[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const [showCreate, setShowCreate] = useState(false);
const [creating, setCreating] = useState(false);

const [name, setName] = useState("");
const [slug, setSlug] = useState("");
const [description, setDescription] = useState("");
const [endpoint, setEndpoint] = useState("");

const [editingApi, setEditingApi] = useState<Api | null>(null);
const [editName, setEditName] = useState("");
const [editDescription, setEditDescription] = useState("");
const [editEndpoint, setEditEndpoint] = useState("");
const [updating, setUpdating] = useState(false);

useEffect(() => {
loadApis();
}, []);

async function loadApis() {
try {
setLoading(true);
setError("");


  const response = await fetch("/api/apis");

  if (response.status === 401) {
    router.push("/login");
    return;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to load APIs");
  }

  setApis(data.apis || []);
} catch (error) {
  console.error("LOAD_APIS_ERROR:", error);
  setError("Failed to load APIs");
} finally {
  setLoading(false);
}


}

function resetCreateForm() {
setName("");
setSlug("");
setDescription("");
setEndpoint("");
}

function closeCreateModal() {
setShowCreate(false);
resetCreateForm();
}

async function handleCreate(event: FormEvent<HTMLFormElement>) {
event.preventDefault();


setCreating(true);
setError("");

try {
  const response = await fetch("/api/apis", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      slug,
      description: description || undefined,
      endpoint,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    setError(data.error || "Failed to create API");
    return;
  }

  setApis((current) => [data.api, ...current]);

  closeCreateModal();
} catch (error) {
  console.error("CREATE_API_ERROR:", error);
  setError("Something went wrong while creating the API");
} finally {
  setCreating(false);
}


}

function openEditModal(api: Api) {
setEditingApi(api);
setEditName(api.name);
setEditDescription(api.description || "");
setEditEndpoint(api.endpoint);
setError("");
}

function closeEditModal() {
setEditingApi(null);
setEditName("");
setEditDescription("");
setEditEndpoint("");
}

async function handleUpdate(event: FormEvent<HTMLFormElement>) {
event.preventDefault();


if (!editingApi) return;

setUpdating(true);
setError("");

try {
  const response = await fetch(`/api/apis/${editingApi.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: editName,
      description: editDescription || undefined,
      endpoint: editEndpoint,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    setError(data.error || "Failed to update API");
    return;
  }

  setApis((current) =>
    current.map((api) =>
      api.id === editingApi.id ? data.api : api
    )
  );

  closeEditModal();
} catch (error) {
  console.error("UPDATE_API_ERROR:", error);
  setError("Something went wrong while updating the API");
} finally {
  setUpdating(false);
}

}

async function handleDelete(api: Api) {
const confirmed = window.confirm(
`Delete "${api.name}"? This action cannot be undone.`
);

if (!confirmed) return;

try {
  const response = await fetch(`/api/apis/${api.id}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    setError(data.error || "Failed to delete API");
    return;
  }

  setApis((current) =>
    current.filter((item) => item.id !== api.id)
  );
} catch (error) {
  console.error("DELETE_API_ERROR:", error);
  setError("Something went wrong while deleting the API");
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
        active
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

  <div className="lg:pl-64">

    <header className="flex h-16 items-center justify-between border-b border-zinc-800 px-6 lg:px-8">

      <div>
        <p className="text-sm text-zinc-500">
          Developer Dashboard
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-white lg:hidden"
      >
        Sign out
      </button>

    </header>

    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">

      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-blue-400">
            Infrastructure
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            APIs
          </h1>

          <p className="mt-2 text-zinc-500">
            Manage the APIs connected to APIFLOW.
          </p>
        </div>

        <button
          onClick={() => {
            setError("");
            setShowCreate(true);
          }}
          className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
        >
          + Create API
        </button>

      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <p className="text-sm text-zinc-500">
            Loading APIs...
          </p>
        </div>
      ) : apis.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-12 text-center">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-500">
            API
          </div>

          <h2 className="mt-5 text-lg font-semibold">
            No APIs yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
            Create your first API and route requests through
            APIFLOW with API key authentication and rate limiting.
          </p>

          <button
            onClick={() => setShowCreate(true)}
            className="mt-6 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-zinc-200"
          >
            Create your first API
          </button>

        </div>
      ) : (
        <div className="grid gap-5">

          {apis.map((api) => (
            <div
              key={api.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
            >

              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                <div className="min-w-0">

                  <div className="flex items-center gap-3">
                    <h2 className="truncate text-lg font-semibold">
                      {api.name}
                    </h2>

                    <span className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-500">
                      /{api.slug}
                    </span>
                  </div>

                  {api.description && (
                    <p className="mt-2 text-sm text-zinc-500">
                      {api.description}
                    </p>
                  )}

                </div>

                <div className="flex shrink-0 gap-2">

                  <button
                    onClick={() => openEditModal(api)}
                    className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(api)}
                    className="rounded-lg border border-red-950 px-3 py-2 text-sm text-red-500 transition hover:bg-red-950/40"
                  >
                    Delete
                  </button>

                </div>

              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">

                <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-xs uppercase tracking-wider text-zinc-600">
                    Target Endpoint
                  </p>

                  <p className="mt-2 break-all font-mono text-sm text-zinc-300">
                    {api.endpoint}
                  </p>
                </div>

                <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-xs uppercase tracking-wider text-zinc-600">
                    APIFLOW Gateway
                  </p>

                  <p className="mt-2 break-all font-mono text-sm text-blue-400">
                    POST /api/gateway/{api.slug}
                  </p>
                </div>

              </div>

              <div className="mt-5 flex items-center justify-between border-t border-zinc-800 pt-4">

                <p className="text-xs text-zinc-600">
                  Created{" "}
                  {new Date(api.createdAt).toLocaleDateString()}
                </p>

                <button
                  onClick={() =>
                    router.push(`/apis/${api.id}`)
                  }
                  className="text-sm text-zinc-400 transition hover:text-white"
                >
                  View details →
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  </div>

  {showCreate && (
    <Modal
      title="Create API"
      onClose={closeCreateModal}
    >
      <form onSubmit={handleCreate} className="space-y-5">

        <FormField
          label="API Name"
          value={name}
          onChange={setName}
          placeholder="JSONPlaceholder"
          required
        />

        <FormField
          label="Slug"
          value={slug}
          onChange={setSlug}
          placeholder="jsonplaceholder"
          required
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Description
          </label>

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="A short description of your API"
            rows={3}
            className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-600"
          />
        </div>

        <FormField
          label="Target Endpoint"
          value={endpoint}
          onChange={setEndpoint}
          placeholder="https://api.example.com"
          type="url"
          required
        />

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
            {creating ? "Creating..." : "Create API"}
          </button>

        </div>

      </form>
    </Modal>
  )}

  {editingApi && (
    <Modal
      title="Edit API"
      onClose={closeEditModal}
    >
      <form onSubmit={handleUpdate} className="space-y-5">

        <FormField
          label="API Name"
          value={editName}
          onChange={setEditName}
          placeholder="API name"
          required
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Slug
          </label>

          <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 font-mono text-sm text-zinc-600">
            /{editingApi.slug}
          </div>

          <p className="mt-2 text-xs text-zinc-600">
            Slugs cannot be changed after creation.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Description
          </label>

          <textarea
            value={editDescription}
            onChange={(event) =>
              setEditDescription(event.target.value)
            }
            placeholder="API description"
            rows={3}
            className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-600"
          />
        </div>

        <FormField
          label="Target Endpoint"
          value={editEndpoint}
          onChange={setEditEndpoint}
          placeholder="https://api.example.com"
          type="url"
          required
        />

        <div className="flex justify-end gap-3 pt-2">

          <button
            type="button"
            onClick={closeEditModal}
            className="rounded-lg border border-zinc-800 px-4 py-2.5 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={updating}
            className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {updating ? "Saving..." : "Save changes"}
          </button>

        </div>

      </form>
    </Modal>
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

function FormField({
label,
value,
onChange,
placeholder,
type = "text",
required = false,
}: {
label: string;
value: string;
onChange: (value: string) => void;
placeholder: string;
type?: string;
required?: boolean;
}) {
return ( <div> <label className="mb-2 block text-sm font-medium text-zinc-300">
{label} </label>

  <input
    type={type}
    value={value}
    onChange={(event) => onChange(event.target.value)}
    placeholder={placeholder}
    required={required}
    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-600"
  />
</div>


);
}

function Modal({
title,
children,
onClose,
}: {
title: string;
children: React.ReactNode;
onClose: () => void;
}) {
return ( <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 py-8">


  <div className="w-full max-w-lg overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl">

    <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">

      <h2 className="font-semibold">
        {title}
      </h2>

      <button
        onClick={onClose}
        className="text-xl text-zinc-500 hover:text-white"
      >
        ×
      </button>

    </div>

    <div className="p-6">
      {children}
    </div>

  </div>

</div>


);
}
