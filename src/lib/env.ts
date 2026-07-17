import "server-only";

import { z } from "zod";

const envSchema = z.object({
  APP_URL: z.url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  ENABLE_DEMO_AUTH: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  DEMO_AUTH_EMAIL: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.email().optional(),
  ),
  AUTH_SECRET: z
    .string()
    .min(32, "AUTH_SECRET must be at least 32 characters.")
    .optional(),
  AUTH_LINK_DELIVERY: z.enum(["response", "log", "email"]).default("response"),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_PRICE_DONATION: z.string().min(1).optional(),
  STRIPE_PRICE_URGENT_BOOST: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().min(1).default("gpt-4o-mini"),
});

export const env = envSchema.parse({
  APP_URL: process.env.APP_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  ENABLE_DEMO_AUTH: process.env.ENABLE_DEMO_AUTH,
  DEMO_AUTH_EMAIL: process.env.DEMO_AUTH_EMAIL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  AUTH_LINK_DELIVERY: process.env.AUTH_LINK_DELIVERY,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_PRICE_DONATION: process.env.STRIPE_PRICE_DONATION,
  STRIPE_PRICE_URGENT_BOOST: process.env.STRIPE_PRICE_URGENT_BOOST,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
});

export type AppEnv = z.infer<typeof envSchema>;
