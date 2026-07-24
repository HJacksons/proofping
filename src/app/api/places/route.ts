import { ZodError } from "zod";

import { placesSearchQuerySchema } from "@/lib/places/validation";
import { searchPlaces } from "@/lib/server/places";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const input = placesSearchQuerySchema.parse({
      q: searchParams.get("q") ?? "",
      limit: searchParams.get("limit") ?? undefined,
    });

    const places = await searchPlaces({
      query: input.q,
      limit: input.limit,
    });

    return Response.json({ places });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        {
          error: "Invalid places search.",
          issues: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 },
      );
    }

    console.error("[ProofPing] Places search failed", error);
    return Response.json(
      { error: "Unable to search places right now." },
      { status: 502 },
    );
  }
}
