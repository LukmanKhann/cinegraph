import { browseAll } from "@/lib/queries";
import { errorResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(await browseAll());
  } catch (error) {
    return errorResponse(error);
  }
}