import { env } from "@/lib/env";

const DEV_AUTH_SECRET = "dev-only-auth-secret-change-me-please!!";

export function getAuthSecret() {
  if (env.AUTH_SECRET) {
    return env.AUTH_SECRET;
  }

  if (env.ENABLE_DEMO_AUTH) {
    return DEV_AUTH_SECRET;
  }

  throw new Error("AUTH_SECRET is required when demo auth is disabled.");
}
