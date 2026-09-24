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

async function parseJson<T>(res: Response): Promise<T> {
  const body = (await res.json()) as T | ApiError;
  if (!res.ok) {
    const err = body as ApiError;
    throw new Error(err?.error?.message || res.statusText);
  }
  return body as T;
}

export async function fetchList<T>(
  resource: string,
  params: {
    page?: number;
    pageSize?: number;
    search?: string;
    sort?: string;
  } = {},
): Promise<ListResponse<T>> {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.pageSize) q.set("pageSize", String(params.pageSize));
  if (params.search) q.set("search", params.search);
  if (params.sort) q.set("sort", params.sort);
  const qs = q.toString();
  const res = await fetch(`/api/admin/${resource}${qs ? `?${qs}` : ""}`, {
    credentials: "include",
  });
  return parseJson<ListResponse<T>>(res);
}

export async function getOne<T>(resource: string, id: string): Promise<T> {
  const res = await fetch(`/api/admin/${resource}/${encodeURIComponent(id)}`, {
    credentials: "include",
  });
  return parseJson<T>(res);
}

export async function createOne<T>(resource: string, data: Record<string, unknown>): Promise<T> {
  const res = await fetch(`/api/admin/${resource}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseJson<T>(res);
}

export async function updateOne<T>(
  resource: string,
  id: string,
  data: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`/api/admin/${resource}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseJson<T>(res);
}

export async function archiveOne(resource: string, id: string): Promise<void> {
  const res = await fetch(`/api/admin/${resource}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  });
  await parseJson(res);
}
