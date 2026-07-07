import "server-only";

import { generateSecureToken, hashToken } from "@/lib/auth/crypto";
import {
  MAGIC_LINK_TTL_MS,
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
} from "@/lib/auth/constants";
import { prisma } from "@/lib/server/db";
import { ensureUserByEmail } from "@/lib/server/users";

export { SESSION_COOKIE_NAME };

export async function createAuthSession(userId: string) {
  const sessionToken = generateSecureToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.authSession.create({
    data: {
      userId,
      tokenHash: hashToken(sessionToken),
      expiresAt,
    },
  });

  return {
    sessionToken,
    expiresAt,
  };
}

export async function getAuthSessionUserId(sessionToken: string | undefined) {
  if (!sessionToken) {
    return null;
  }

  const session = await prisma.authSession.findUnique({
    where: {
      tokenHash: hashToken(sessionToken),
    },
    select: {
      userId: true,
      expiresAt: true,
    },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session.userId;
}

export async function revokeAuthSession(sessionToken: string | undefined) {
  if (!sessionToken) {
    return;
  }

  await prisma.authSession.deleteMany({
    where: {
      tokenHash: hashToken(sessionToken),
    },
  });
}

export async function createMagicLink(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_MS);

  await prisma.authMagicLink.create({
    data: {
      email: normalizedEmail,
      tokenHash: hashToken(token),
      expiresAt,
    },
  });

  return {
    email: normalizedEmail,
    token,
    expiresAt,
  };
}

export async function consumeMagicLink(token: string) {
  const link = await prisma.authMagicLink.findUnique({
    where: {
      tokenHash: hashToken(token),
    },
  });

  if (!link || link.expiresAt < new Date()) {
    return null;
  }

  await prisma.authMagicLink.delete({
    where: {
      id: link.id,
    },
  });

  const user = await ensureUserByEmail(link.email, true);

  return user;
}
