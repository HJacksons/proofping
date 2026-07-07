import "server-only";

import type { AuthUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";

export async function ensureUserForAuth(authUser: AuthUser) {
  return prisma.user.upsert({
    where: {
      email: authUser.email,
    },
    create: {
      id: authUser.id,
      email: authUser.email,
      isAdultVerified: authUser.isAdultVerified,
    },
    update: {
      isAdultVerified: authUser.isAdultVerified,
    },
  });
}

export async function ensureUserByEmail(email: string, isAdultVerified: boolean) {
  return prisma.user.upsert({
    where: {
      email,
    },
    create: {
      email,
      isAdultVerified,
    },
    update: {
      isAdultVerified,
    },
  });
}
