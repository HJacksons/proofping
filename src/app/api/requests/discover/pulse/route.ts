import { getNearbyActivityPulse } from "@/lib/server/nearby-activity";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");
    const pulse = await getNearbyActivityPulse(location);

    return Response.json({ pulse });
  } catch {
    return Response.json(
      { error: "Unable to load nearby activity." },
      { status: 500 },
    );
  }
}
