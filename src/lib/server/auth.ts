import "server-only";

import { cookies } from "next/headers";

import { env } from "@/lib/env";
import {
  getAuthSessionUserId,
  SESSION_COOKIE_NAME,
} from "@/lib/server/auth-sessions";
import { prisma } from "@/lib/server/db";
import { ensureUserForAuth } from "@/lib/server/users";

export type AuthUser = {
  id: string;
  email: string;
  isAdultVerified: boolean;
};

export const demoAuthUser: AuthUser = {
  id: "demo-user",
  email: "demo@proofping.local",
  isAdultVerified: true,
};

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (env.ENABLE_DEMO_AUTH) {
    return demoAuthUser;
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const userId = await getAuthSessionUserId(sessionToken);

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      email: true,
      isAdultVerified: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    isAdultVerified: user.isAdultVerified,
  };
}

export async function requireCurrentUser(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthRequiredError();
  }

  if (!user.isAdultVerified) {
    throw new AdultVerificationRequiredError();
  }

  return user;
}

export async function bootstrapDemoUser() {
  if (!env.ENABLE_DEMO_AUTH) {
    return;
  }

  await ensureUserForAuth(demoAuthUser);
}

export class AuthRequiredError extends Error {
  constructor() {
    super("Authentication is required.");
    this.name = "AuthRequiredError";
  }
}

export class AdultVerificationRequiredError extends Error {
  constructor() {
    super("ProofPing is for adults only.");
    this.name = "AdultVerificationRequiredError";
  }
}
