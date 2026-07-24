export function buildSharePayload(
  title: string,
  shareUrl: string,
  note?: string | null,
  urgent = false,
) {
  const trimmedTitle = title.trim() || "Quick check";
  const trimmedNote = note?.trim();
  const hook = urgent
    ? "Need eyes on this NOW."
    : "Can you check this right now?";
  const cta = "30-sec reply on ProofPing:";

  const blocks = [hook, trimmedTitle, `${cta}\n${shareUrl}`];

  if (trimmedNote) {
    return `${trimmedNote}\n\n${blocks.join("\n\n")}`;
  }

  return blocks.join("\n\n");
}
