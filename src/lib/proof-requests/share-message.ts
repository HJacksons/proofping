export function buildSharePayload(
  title: string,
  shareUrl: string,
  note?: string | null,
  urgent = false,
) {
  const trimmedTitle = title.trim();
  const displayTitle = urgent ? `Urgent: ${trimmedTitle}` : trimmedTitle;
  const trimmedNote = note?.trim();

  if (trimmedNote) {
    return `${trimmedNote}\n\n${displayTitle}\n${shareUrl}`;
  }

  return `${displayTitle}\n${shareUrl}`;
}
