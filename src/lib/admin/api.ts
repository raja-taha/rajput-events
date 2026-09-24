import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, { status: 200, ...init });
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function fail(
  code: string,
  message: string,
  status = 400,
  fieldErrors?: Record<string, string>,
) {
  return NextResponse.json(
    { error: { code, message, fieldErrors } },
    { status },
  );
}

export function unauthorized(message = "Authentication required") {
  return fail("UNAUTHORIZED", message, 401);
}

export function forbidden(message = "Forbidden") {
  return fail("FORBIDDEN", message, 403);
}

export function notFound(message = "Not found") {
  return fail("NOT_FOUND", message, 404);
}

export type ListResult<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export function listResult<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
): ListResult<T> {
  return {
    data,
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export function parseListParams(url: URL) {
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const pageSize = Math.min(
    100,
    Math.max(1, Number(url.searchParams.get("pageSize") || 25)),
  );
  const search = (url.searchParams.get("search") || "").trim();
  const sortRaw = url.searchParams.get("sort") || "createdAt:desc";
  const [sortField, sortDir] = sortRaw.split(":");
  const sort: Record<string, 1 | -1> = {
    [sortField || "createdAt"]: sortDir === "asc" ? 1 : -1,
  };
  return { page, pageSize, search, sort, skip: (page - 1) * pageSize };
}
