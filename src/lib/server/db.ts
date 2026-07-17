import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

import { env } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
  });
}

function getPrismaClient() {
  const cached = globalForPrisma.prisma;

  // After `prisma generate` during `next dev`, a cached client can be missing
  // newly added model delegates until the process restarts.
  if (
    cached &&
    typeof (cached as { sitePageView?: unknown }).sitePageView !== "undefined"
  ) {
    return cached;
  }

  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const prisma = getPrismaClient();
