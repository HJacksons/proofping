import { prisma } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return Response.json({
      ok: true,
      database: "ok",
    });
  } catch {
    return Response.json(
      {
        ok: false,
        database: "unavailable",
      },
      { status: 503 },
    );
  }
}
