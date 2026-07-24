import "server-only";

import { env } from "@/lib/env";
import { AdminRequiredError } from "@/lib/server/admin-errors";
import type { AuthUser } from "@/lib/server/auth";
import { requireCurrentUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";

function normalizeEmail(value: string) {
  return value.trim().replace(/^["']+|["']+$/g, "").toLowerCase();
}

function parseAdminEmails() {
  const raw = env.ADMIN_EMAILS ?? env.ADMIN_EMAIL ?? "";

  return raw
    .split(",")
    .map((email) => normalizeEmail(email))
    .filter(Boolean);
}

export async function isAdminUser(user: AuthUser) {
  const adminEmails = parseAdminEmails();

  if (adminEmails.includes(normalizeEmail(user.email))) {
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
