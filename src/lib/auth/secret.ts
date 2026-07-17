import { env } from "@/lib/env";

export function getAuthSecret() {
  if (env.AUTH_SECRET) {
    return env.AUTH_SECRET;
  }

  throw new Error("AUTH_SECRET is required.");
}
