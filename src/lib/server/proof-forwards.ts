import "server-only";

import type { CreateProofForwardInput } from "@/lib/proof-forwards/validation";
import type { ProofForwardDTO } from "@/lib/proof-forwards/types";
import {
  ProofForwardForbiddenError,
  ProofForwardLimitError,
  ProofForwardNotAllowedError,
  ProofForwardSelfEmailError,
} from "@/lib/proof-forwards/errors";
import {
  MAX_FORWARDS_PER_REQUEST,
  MAX_FORWARDS_PER_USER_PER_DAY,
} from "@/lib/proof-forwards/limits";
import { canCreateProofForward } from "@/lib/proof-forwards/policy";
import { canViewOwnedProofRequest } from "@/lib/proof-requests/access";
import { buildProofRequestReplyShareUrl } from "@/lib/proof-requests/share";
import { canAcceptReplies } from "@/lib/proof-requests/status";
import { env } from "@/lib/env";
import { requireCurrentUser } from "@/lib/server/auth";
import {
  deliverForwardNotification,
  shouldExposeForwardLinkInResponse,
} from "@/lib/server/forward-email";
import { prisma } from "@/lib/server/db";
import { ensureUserForAuth } from "@/lib/server/users";

function toProofForwardDTO(
  forward: {
    id: string;
    requestId: string;
    recipientEmail: string;
    note: string | null;
    status: string;
    createdAt: Date;
    helperLinkUrl: string;
  },
  includeHelperLink = false,
): ProofForwardDTO {
  return {
    id: forward.id,
    requestId: forward.requestId,
    recipientEmail: forward.recipientEmail,
    note: forward.note,
    status: forward.status,
    createdAt: forward.createdAt.toISOString(),
    helperLinkUrl: includeHelperLink ? forward.helperLinkUrl : undefined,
  };
}

function startOfUtcDay(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export async function listProofForwards(
  requestId: string,
): Promise<ProofForwardDTO[] | null> {
  const authUser = await requireCurrentUser();
  const user = await ensureUserForAuth(authUser);

  const request = await prisma.proofRequest.findUnique({
    where: {
      id: requestId,
    },
    select: {
      creatorId: true,
    },
  });

  if (!request) {
    return null;
  }

  if (!canViewOwnedProofRequest(user.id, request.creatorId)) {
    throw new ProofForwardForbiddenError();
  }

  const forwards = await prisma.proofRequestForward.findMany({
    where: {
      requestId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return forwards.map((forward) => toProofForwardDTO(forward));
}

export async function createProofForward(
  requestId: string,
  input: CreateProofForwardInput,
): Promise<{ forward: ProofForwardDTO; requestTitle: string } | null> {
  const authUser = await requireCurrentUser();
  const user = await ensureUserForAuth(authUser);

  if (input.recipientEmail === user.email.toLowerCase()) {
    throw new ProofForwardSelfEmailError();
  }

  const request = await prisma.proofRequest.findUnique({
    where: {
      id: requestId,
    },
    select: {
      id: true,
      title: true,
      creatorId: true,
      status: true,
    },
  });

  if (!request) {
    return null;
  }

  if (!canViewOwnedProofRequest(user.id, request.creatorId)) {
    throw new ProofForwardForbiddenError();
  }

  if (!canAcceptReplies(request.status)) {
    throw new ProofForwardNotAllowedError();
  }

  const requestForwardCount = await prisma.proofRequestForward.count({
    where: {
      requestId,
    },
  });

  const userForwardCountToday = await prisma.proofRequestForward.count({
    where: {
      senderId: user.id,
      createdAt: {
        gte: startOfUtcDay(),
      },
    },
  });

  const forwardPolicy = canCreateProofForward({
    requestForwardCount,
    userForwardCountToday,
  });

  if (!forwardPolicy.ok) {
    if (forwardPolicy.reason.startsWith("request-limit:")) {
      throw new ProofForwardLimitError(
        `You can forward this request to at most ${MAX_FORWARDS_PER_REQUEST} people.`,
      );
    }

    throw new ProofForwardLimitError(
      `You can send at most ${MAX_FORWARDS_PER_USER_PER_DAY} forwards per day.`,
    );
  }

  const helperLinkUrl = buildProofRequestReplyShareUrl(env.APP_URL, request.id);

  let forward = await prisma.proofRequestForward.create({
    data: {
      requestId,
      senderId: user.id,
      recipientEmail: input.recipientEmail,
      note: input.note,
      helperLinkUrl,
      status: "SENT",
    },
  });

  try {
    await deliverForwardNotification({
      recipientEmail: input.recipientEmail,
      helperLinkUrl,
      note: input.note,
      requestTitle: request.title,
    });
  } catch {
    forward = await prisma.proofRequestForward.update({
      where: {
        id: forward.id,
      },
      data: {
        status: "FAILED",
      },
    });
  }

  return {
    forward: toProofForwardDTO(
      forward,
      shouldExposeForwardLinkInResponse(),
    ),
    requestTitle: request.title,
  };
}
