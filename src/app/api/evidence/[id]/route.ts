import { getEvidenceFileResponse } from "@/lib/server/evidence-access";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const response = await getEvidenceFileResponse(id);

  if (!response) {
    return Response.json({ error: "Evidence not found." }, { status: 404 });
  }

  return response;
}
