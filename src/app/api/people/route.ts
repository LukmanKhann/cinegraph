import { searchPeople } from "@/lib/queries";
import { errorResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!q) {
    return Response.json({ people: [] });
  }
  try {
    const people = await searchPeople(q);
    return Response.json({ people });
  } catch (error) {
    return errorResponse(error);
  }
}