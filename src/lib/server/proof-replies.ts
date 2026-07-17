import "server-only";

import type { ProofReply, RequestEvidence } from "@/generated/prisma/client";
import { getReplyDisplayName } from "@/lib/proof-replies/display-name";
import type { CreateProofReplyInput } from "@/lib/proof-replies/validation";
import { RequesterSelfReplyError } from "@/lib/proof-replies/errors";
import { ProofRequestNotOpenForRepliesError } from "@/lib/proof-requests/errors";
import { InvalidReplyCapabilityTokenError } from "@/lib/proof-requests/errors";
import { canAcceptReplies } from "@/lib/proof-requests/status";
import { verifyReplyCapabilityToken } from "@/lib/proof-requests/reply-token";
import { canReplyThroughDiscovery } from "@/lib/proof-requests/visibility";
import {
  paginateByCursor,
  REPLIES_PAGE_SIZE,
  type PaginatedResult,
} from "@/lib/proof-requests/pagination";
import { getCurrentUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import {
  saveRequestEvidenceFiles,
  toRequestEvidenceDTO,
  type RequestEvidenceDTO,
} from "@/lib/server/request-evidence";

export type ProofReplyDTO = {
  id: string;
  requestId: string;
  displayName: string;
  body: string;
  verdict: string;
  createdAt: string;
  evidence: RequestEvidenceDTO[];
};

export function toProofReplyDTO(
  reply: ProofReply & { evidence?: RequestEvidence[] },
): ProofReplyDTO {
  return {
    id: reply.id,
    requestId: reply.requestId,
    displayName: getReplyDisplayName(reply.id, reply.helperName),
    body: reply.body,
    verdict: reply.verdict,
    createdAt: reply.createdAt.toISOString(),
    evidence: (reply.evidence ?? []).map(toRequestEvidenceDTO),
  };
}

export async function createProofReply(
  requestId: string,
  input: CreateProofReplyInput,
  attachments: File[] = [],
  replyToken?: string | null,
): Promise<ProofReplyDTO | null> {
  const request = await prisma.proofRequest.findUnique({
    where: {
      id: requestId,
    },
    select: {
      id: true,
      creatorId: true,
      status: true,
      visibility: true,
    },
  });

  if (!request) {
    return null;
  }

  if (!canAcceptReplies(request.status)) {
    throw new ProofRequestNotOpenForRepliesError();
  }

  const hasValidReplyToken =
    Boolean(replyToken) && verifyReplyCapabilityToken(requestId, replyToken ?? "");

  if (!hasValidReplyToken && !canReplyThroughDiscovery(request)) {
    throw new InvalidReplyCapabilityTokenError();
  }

  const authUser = await getCurrentUser();

  if (authUser && authUser.id === request.creatorId) {
    throw new RequesterSelfReplyError();
  }

  const reply = await prisma.proofReply.create({
    data: {
      requestId,
      helperName: input.helperName,
      body: input.body,
      verdict: input.verdict,
    },
  });

  if (attachments.length > 0) {
    await saveRequestEvidenceFiles(requestId, reply.id, "REPLY", attachments);
  }

  const refreshed = await prisma.proofReply.findUniqueOrThrow({
    where: {
      id: reply.id,
    },
    include: {
      evidence: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  return toProofReplyDTO(refreshed);
}

type ListProofRepliesOptions = {
  limit?: number;
  cursor?: string | null;
};

export async function listProofReplies(
  requestId: string,
  options: ListProofRepliesOptions = {},
): Promise<PaginatedResult<ProofReplyDTO>> {
  const limit = options.limit ?? REPLIES_PAGE_SIZE;
  const cursor = options.cursor ?? undefined;

  const replies = await prisma.proofReply.findMany({
    where: {
      requestId,
    },
    include: {
      evidence: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(cursor
      ? {
          skip: 1,
          cursor: {
            id: cursor,
          },
        }
      : {}),
  });

  const page = paginateByCursor(replies, limit);

  return {
    ...page,
    items: page.items.map((reply) => toProofReplyDTO(reply)),
  };
}
