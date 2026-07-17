import { z } from "zod";

const trackedPathSchema = z
  .string()
  .trim()
  .min(1)
  .max(512)
  .regex(/^\/[A-Za-z0-9\-._~!$&'()*+,;=:@/%]*$/, "Path must be a relative URL path.")
  .refine((path) => !path.startsWith("/api"), "API paths are not tracked.")
  .refine((path) => !path.startsWith("/_next"), "Next.js paths are not tracked.");

export const recordSiteVisitSchema = z.object({
  path: trackedPathSchema,
  referrer: z.string().trim().max(2048).optional().nullable(),
});

export const adminVisitsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).default(14),
});
