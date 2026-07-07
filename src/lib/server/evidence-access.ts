import "server-only";

import { readEvidenceFile } from "@/lib/server/evidence-storage";
import { getPublicEvidenceById } from "@/lib/server/request-evidence";

export async function getEvidenceFileResponse(id: string) {
  const evidence = await getPublicEvidenceById(id);

  if (!evidence) {
    return null;
  }

  const buffer = await readEvidenceFile(evidence.storageKey);

  return new Response(buffer, {
    headers: {
      "Content-Type": evidence.mimeType,
      "Content-Length": String(evidence.sizeBytes),
      "Cache-Control": "private, max-age=3600",
    },
  });
}
