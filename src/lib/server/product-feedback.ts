import "server-only";

import type { CreateProductFeedbackInput } from "@/lib/feedback/validation";
import { getCurrentUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";

export async function createProductFeedback(
  input: CreateProductFeedbackInput,
) {
  const user = await getCurrentUser();
  const message =
    input.category === "all_good" && !input.message.trim()
      ? "All good"
      : input.message.trim();

  const feedback = await prisma.productFeedback.create({
    data: {
      category: input.category,
      message,
      path: input.path?.trim() || null,
      requestId: input.requestId?.trim() || null,
      userId: user?.id ?? null,
    },
    select: {
      id: true,
      category: true,
      createdAt: true,
    },
  });

  return {
    id: feedback.id,
    category: feedback.category,
    createdAt: feedback.createdAt.toISOString(),
  };
}

export async function listProductFeedback(limit = 50) {
  const rows = await prisma.productFeedback.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      category: true,
      message: true,
      path: true,
      requestId: true,
      createdAt: true,
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    category: row.category,
    message: row.message,
    path: row.path,
    requestId: row.requestId,
    userEmail: row.user?.email ?? null,
    createdAt: row.createdAt.toISOString(),
  }));
}
