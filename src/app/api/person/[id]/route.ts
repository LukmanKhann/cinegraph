import { coStarsOf, getPerson } from "@/lib/queries";
import { errorResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, ctx: RouteContext<"/api/person/[id]">) {
  const { id } = await ctx.params;
  try {
    const [person, coStars] = await Promise.all([getPerson(id), coStarsOf(id)]);
    if (!person) {
      return Response.json(
        { error: { code: "not_found", message: "We couldn't find that person." } },
        { status: 404 },
      );
    }
    return Response.json({ person, coStars });
  } catch (error) {
    return errorResponse(error);
  }
}