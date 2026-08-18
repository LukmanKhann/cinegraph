import { castNeighbourhood, getMovie, recommendMoviesFor } from "@/lib/queries";
import { errorResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, ctx: RouteContext<"/api/movie/[id]">) {
  const { id } = await ctx.params;
  try {
    const [movie, recommendations, network] = await Promise.all([
      getMovie(id),
      recommendMoviesFor(id),
      castNeighbourhood(id),
    ]);
    if (!movie) {
      return Response.json(
        { error: { code: "not_found", message: "We couldn't find that movie." } },
        { status: 404 },
      );
    }
    return Response.json({ movie, recommendations, network });
  } catch (error) {
    return errorResponse(error);
  }
}