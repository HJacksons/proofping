import { z } from "zod";

import { proofRequestCategoryValues } from "@/lib/proof-requests/categories";

export const createProofRequestSchema = z.object({
  title: z
    .string()
    .trim()
    .min(8, "Use at least 8 characters.")
    .max(120, "Keep the title under 120 characters."),
  body: z
    .string()
    .trim()
    .min(20, "Add enough context for a real person to verify.")
    .max(2000, "Keep the request under 2,000 characters."),
  category: z.enum(proofRequestCategoryValues),
  locationHint: z
    .string()
    .trim()
    .max(160, "Keep the location hint under 160 characters.")
    .nullish()
    .transform((value) => (value ? value : null)),
  listingUrl: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return null;
      }

      const trimmed = value.trim();

      return trimmed.length > 0 ? trimmed : null;
    },
    z.union([
      z.url("Enter a valid listing link.").max(2048),
      z.null(),
    ]),
  ),
});

export type CreateProofRequestInput = z.infer<typeof createProofRequestSchema>;

export const updateProofRequestStatusSchema = z.object({
  status: z.enum([
    "OPEN",
    "SOLVED",
    "SUSPICIOUS",
    "UNRESOLVED",
    "CLOSED",
  ]),
});

export type UpdateProofRequestStatusInput = z.infer<
  typeof updateProofRequestStatusSchema
>;
