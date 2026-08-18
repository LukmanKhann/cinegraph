import { DbQueryError, DbUnavailableError } from "@/lib/neo4j";
import type { ApiError } from "@/lib/types";

export function errorResponse(
  error: unknown,
  fallbackStatus = 500,
): Response {
  if (error instanceof DbUnavailableError) {
    return jsonError({ code: "db_unavailable", message: error.message }, 503);
  }
  if (error instanceof DbQueryError) {
    return jsonError({ code: "db_error", message: error.message }, 502);
  }
  return jsonError(
    { code: "internal", message: "Something went wrong on our side." },
    fallbackStatus,
  );
}

export function jsonError(error: ApiError["error"], status: number): Response {
  return Response.json({ error }, { status });
}