import { z } from "zod";

import { productFeedbackCategoryValues } from "@/lib/feedback/categories";

export const createProductFeedbackSchema = z.object({
  category: z.enum(productFeedbackCategoryValues),
  message: z
    .string()
    .trim()
    .max(1000, "Keep feedback under 1000 characters.")
    .default(""),
  path: z.string().trim().max(512).optional().nullable(),
  requestId: z.string().trim().max(64).optional().nullable(),
}).superRefine((value, ctx) => {
  if (value.category !== "all_good" && value.message.length < 4) {
    ctx.addIssue({
      code: "custom",
      path: ["message"],
      message: "Add a short note so we can fix it.",
    });
  }
});

export type CreateProductFeedbackInput = z.infer<
  typeof createProductFeedbackSchema
>;
