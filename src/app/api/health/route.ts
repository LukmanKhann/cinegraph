import { checkConnectivity } from "@/lib/neo4j";

export const dynamic = "force-dynamic";

export async function GET() {
  const ok = await checkConnectivity();
  return Response.json(
    ok
      ? { status: "ok" }
      : { status: "unreachable", error: { code: "db_unavailable" } },
    { status: ok ? 200 : 503 },
  );
}