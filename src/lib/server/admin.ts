import "server-only";

import { AdminRequiredError } from "@/lib/server/admin-errors";
import type { AuthUser } from "@/lib/server/auth";
import { requireCurrentUser } from "@/lib/server/auth";
import { env } from "@/lib/env";
import { prisma } from "@/lib/server/db";

function parseAdminEmails() {
  const fallback = env.ENABLE_DEMO_AUTH ? "demo@proofping.local" : "";
  const raw =
    process.env.ADMIN_EMAILS ??
    process.env.ADMIN_EMAIL ??
    fallback;

  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function isAdminUser(user: AuthUser) {
  const adminEmails = parseAdminEmails();

  if (adminEmails.includes(user.email.toLowerCase())) {
    return true;
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      email: user.email,
    },
    select: {
      role: true,
    },
  });

  return dbUser?.role === "ADMIN";
}

export async function requireAdminUser() {
  const user = await requireCurrentUser();

  if (!(await isAdminUser(user))) {
    throw new AdminRequiredError();
  }

  return user;
}

export async function getAdminNavVisible(user: AuthUser | null) {
  if (!user) {
    return false;
  }

  return isAdminUser(user);
}
