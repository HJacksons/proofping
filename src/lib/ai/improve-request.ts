import { z } from "zod";

export const improveProofRequestSchema = z.object({
  title: z.string().trim().min(1).max(120),
  locationHint: z.string().trim().max(160).optional(),
  details: z.string().trim().max(2000).optional(),
});

export type ImproveProofRequestInput = z.infer<typeof improveProofRequestSchema>;

export type ImprovedProofRequestWording = {
  title: string;
  details: string;
};

export function buildImproveProofRequestPrompt(input: ImproveProofRequestInput) {
  const lines = [
    "Improve this proof request wording for clarity and trust.",
    "Keep it short, neutral, and lawful.",
    "Return JSON only with keys: title, details.",
    `Title: ${input.title}`,
  ];

  if (input.locationHint) {
    lines.push(`Location: ${input.locationHint}`);
  }

  if (input.details) {
    lines.push(`Details: ${input.details}`);
  }

  return lines.join("\n");
}

export function parseImprovedProofRequestWording(
  raw: string,
): ImprovedProofRequestWording | null {
  try {
    const parsed = JSON.parse(raw) as {
      title?: unknown;
      details?: unknown;
    };

    if (typeof parsed.title !== "string" || typeof parsed.details !== "string") {
      return null;
    }

    const title = parsed.title.trim();
    const details = parsed.details.trim();

    if (title.length < 8 || title.length > 120 || details.length > 2000) {
      return null;
    }

    return { title, details };
  } catch {
    return null;
  }
}
