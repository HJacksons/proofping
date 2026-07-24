import { z } from "zod";

export const nearbyAlertsPrefsSchema = z.object({
  enabled: z.boolean(),
  location: z
    .string()
    .trim()
    .max(160, "Keep the location under 160 characters.")
    .optional()
    .nullable()
    .transform((value) => (value && value.length > 0 ? value : null)),
}).superRefine((prefs, context) => {
  if (prefs.enabled && !prefs.location) {
    context.addIssue({
      code: "custom",
      path: ["location"],
      message: "Add a place to watch for nearby asks.",
    });
  }
});

export type NearbyAlertsPrefsInput = z.infer<typeof nearbyAlertsPrefsSchema>;
