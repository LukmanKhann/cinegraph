import { moviesExistByIds, shortestConnection } from "@/lib/queries";
import { errorResponse, jsonError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const kind = searchParams.get("kind") === "movie" ? "movie" : "person";
  const maxHops = Math.min(Math.max(Number(searchParams.get("maxHops") ?? 4), 2), 8);

  if (!from || !to) {
    return jsonError(
      { code: "bad_request", message: "Both 'from' and 'to' are required." },
      400,
    );
  }
  try {
    if (kind === "movie") {
      const [fromExists, toExists] = await moviesExistByIds([from, to]);
      if (!fromExists || !toExists) {
        return jsonError(
          { code: "not_found", message: "One of those movies doesn't exist in the graph." },
          404,
        );
      }
    }
    const result = await shortestConnection(from, to, kind, maxHops);
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}