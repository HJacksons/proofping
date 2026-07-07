import { z } from "zod";

import { proofReplyVerdictValues } from "@/lib/proof-replies/verdicts";

export const createProofReplySchema = z.object({
  helperName: z
    .string()
    .trim()
    .max(80, "Keep the helper name under 80 characters.")
    .nullish()
    .transform((value) => (value ? value : null)),
  body: z
    .string()
    .trim()
    .min(8, "Add a little more detail if you are writing your own reply.")
    .max(500, "Keep the reply short and clear."),
  verdict: z.enum(proofReplyVerdictValues).default("UNSURE"),
});

export type CreateProofReplyInput = z.infer<typeof createProofReplySchema>;
