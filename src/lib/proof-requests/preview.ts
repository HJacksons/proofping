/**
 * Card/list preview: strip create-form boilerplate so title + place aren't repeated.
 */
export function getRequestPreviewBody(
  body: string,
  options: { title?: string | null } = {},
): string | null {
  const title = options.title?.trim().toLowerCase() ?? "";

  const parts = body
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => {
      if (/^i need help verifying:/i.test(line)) {
        return false;
      }
      if (/^location:/i.test(line)) {
        return false;
      }
      if (/^link:/i.test(line)) {
        return false;
      }
      if (/^please check what you can/i.test(line)) {
        return false;
      }
      if (title && line.toLowerCase() === title) {
        return false;
      }
      if (title && /^i need help verifying:\s*/i.test(line)) {
        const rest = line.replace(/^i need help verifying:\s*/i, "").trim();
        if (rest.toLowerCase() === title) {
          return false;
        }
      }
      return true;
    });

  const preview = parts.join(" ").replace(/\s+/g, " ").trim();
  return preview.length > 0 ? preview : null;
}
