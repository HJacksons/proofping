import { z } from "zod";

export const createProofForwardSchema = z.object({
  recipientEmail: z
    .string()
    .trim()
    .pipe(z.email("Enter a valid email address."))
    .pipe(z.string().max(320, "Keep the email under 320 characters."))
    .transform((value) => value.toLowerCase()),
  note: z
    .string()
    .trim()
    .max(500, "Keep the note under 500 characters.")
    .nullish()
    .transform((value) => (value ? value : null)),
});

export type CreateProofForwardInput = z.infer<typeof createProofForwardSchema>;
