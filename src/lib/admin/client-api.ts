import toast from "react-hot-toast";

export type ApiError = {
  error: { code: string; message: string; fieldErrors?: Record<string, string> };
};

export type ListResponse<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type MutateOptions = {
  /** Skip success toast (errors still toast unless silentAll). */
  silent?: boolean;
  /** Skip all toasts. */
  silentAll?: boolean;
  successMessage?: string;
};

async function parseJson<T>(res: Response): Promise<T> {
  const body = (await res.json()) as T | ApiError;
  if (!res.ok) {
    const err = body as ApiError;
    throw new Error(err?.error?.message || res.statusText || "Request failed");
  }
  return body as T;
}

function notifyError(e: unknown, fallback: string, opts?: MutateOptions) {
  if (opts?.silentAll) return;
  toast.error(e instanceof Error ? e.message : fallback);
}

function notifySuccess(message: string, opts?: MutateOptions) {
  if (opts?.silent || opts?.silentAll) return;
  toast.success(opts?.successMessage ?? message);
}

export async function fetchList<T>(
  resource: string,
  params: {
    page?: number;
    pageSize?: number;
    search?: string;
    sort?: string;
  } = {},
  opts?: MutateOptions,
): Promise<ListResponse<T>> {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.pageSize) q.set("pageSize", String(params.pageSize));
  if (params.search) q.set("search", params.search);
  if (params.sort) q.set("sort", params.sort);
  const qs = q.toString();
  try {
    const res = await fetch(`/api/admin/${resource}${qs ? `?${qs}` : ""}`, {
      credentials: "include",
    });
    return await parseJson<ListResponse<T>>(res);
  } catch (e) {
    notifyError(e, "Failed to load", opts);
    throw e;
  }
}

export async function getOne<T>(
  resource: string,
  id: string,
  opts?: MutateOptions,
): Promise<T> {
  try {
    const res = await fetch(`/api/admin/${resource}/${encodeURIComponent(id)}`, {
      credentials: "include",
    });
    return await parseJson<T>(res);
  } catch (e) {
    notifyError(e, "Failed to load", opts);
    throw e;
  }
}

export async function createOne<T>(
  resource: string,
  data: Record<string, unknown>,
  opts?: MutateOptions,
): Promise<T> {
  try {
    const res = await fetch(`/api/admin/${resource}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const created = await parseJson<T>(res);
    notifySuccess("Created successfully", opts);
    return created;
  } catch (e) {
    notifyError(e, "Create failed", opts);
    throw e;
  }
}

export async function updateOne<T>(
  resource: string,
  id: string,
  data: Record<string, unknown>,
  opts?: MutateOptions,
): Promise<T> {
  try {
    const res = await fetch(`/api/admin/${resource}/${encodeURIComponent(id)}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const updated = await parseJson<T>(res);
    notifySuccess("Updated successfully", opts);
    return updated;
  } catch (e) {
    notifyError(e, "Update failed", opts);
    throw e;
  }
}

export async function archiveOne(
  resource: string,
  id: string,
  opts?: MutateOptions,
): Promise<void> {
  try {
    const res = await fetch(`/api/admin/${resource}/${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    await parseJson(res);
    notifySuccess("Archived successfully", opts);
  } catch (e) {
    notifyError(e, "Archive failed", opts);
    throw e;
  }
}
