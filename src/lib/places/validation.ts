import { z } from "zod";

export const placesSearchQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(2, "Type at least 2 characters.")
    .max(120, "Keep the search under 120 characters."),
  limit: z.coerce.number().int().min(1).max(8).default(6),
});

export type PlacesSearchQuery = z.infer<typeof placesSearchQuerySchema>;

export type PlaceSuggestion = {
  id: string;
  label: string;
  detail: string | null;
};
