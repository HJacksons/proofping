import { listDiscoverableProofRequests } from "@/lib/server/proof-requests";
import { NEARBY_REQUESTS_PAGE_SIZE } from "@/lib/proof-requests/pagination";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");
    const since = searchParams.get("since");
    const cursor = searchParams.get("cursor");
    const createdAfter = since ? new Date(since) : null;

    if (createdAfter && Number.isNaN(createdAfter.getTime())) {
      return Response.json({ error: "Invalid since timestamp." }, { status: 400 });
    }

    const page = await listDiscoverableProofRequests({
      location,
      createdAfter,
      cursor,
      limit: createdAfter ? 5 : NEARBY_REQUESTS_PAGE_SIZE,
    });

    const newest = page.items[0] ?? null;
    const latestCreatedAt = newest?.createdAt ?? since ?? null;

    return Response.json({
      hasNew: Boolean(createdAfter) && page.items.length > 0,
      count: page.items.length,
      latestCreatedAt,
      newest: newest
        ? {
            id: newest.id,
            title: newest.title,
            locationHint: newest.locationHint,
            isUrgentBoosted: newest.isUrgentBoosted,
            createdAt: newest.createdAt,
          }
        : null,
      requests: createdAfter ? undefined : page.items,
      nextCursor: page.nextCursor,
      hasMore: page.hasMore,
    });
  } catch {
    return Response.json(
      { error: "Unable to load nearby asks." },
      { status: 500 },
    );
  }
}
