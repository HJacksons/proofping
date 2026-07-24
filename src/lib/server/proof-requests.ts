import "server-only";

import type { ProofRequest, RequestEvidence } from "@/generated/prisma/client";
import type { ProofReplyDTO } from "@/lib/server/proof-replies";
import type { CreateProofRequestInput } from "@/lib/proof-requests/validation";
import type { UpdateProofRequestStatusInput } from "@/lib/proof-requests/validation";
import { generatePosterDisplayName } from "@/lib/proof-replies/display-name";
import { canViewOwnedProofRequest } from "@/lib/proof-requests/access";
import { ProofRequestForbiddenError } from "@/lib/proof-requests/errors";
import {
  DASHBOARD_REQUESTS_PAGE_SIZE,
  NEARBY_REQUESTS_PAGE_SIZE,
  paginateByCursor,
  REPLIES_PAGE_SIZE,
  type PaginatedResult,
} from "@/lib/proof-requests/pagination";
import { buildProofRequestReplyShareUrl } from "@/lib/proof-requests/share";
import {
  buildReplySummariesByRequestId,
  summarizeProofReplies,
  summarizeVerdictGroups,
  type ProofReplySummary,
} from "@/lib/proof-replies/summary";
import { env } from "@/lib/env";
import { getCurrentUser, requireCurrentUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { listProofReplies } from "@/lib/server/proof-replies";
import {
  saveRequestEvidenceFiles,
  toRequestEvidenceDTO,
  type RequestEvidenceDTO,
} from "@/lib/server/request-evidence";
import { ensureUserForAuth } from "@/lib/server/users";

type ProofRequestBase = ProofRequest & {
  evidence: RequestEvidence[];
};

export type ProofRequestDTO = {
  id: string;
  posterDisplayName: string;
  title: string;
  body: string;
  category: string;
  locationHint: string | null;
  listingUrl: string | null;
  visibility: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  isOwner: boolean;
  replyShareUrl: string | null;
  replySummary: ProofReplySummary;
  evidence: RequestEvidenceDTO[];
  isUrgentBoosted: boolean;
};

export type PublicProofRequestDTO = ProofRequestDTO & {
  replies: ProofReplyDTO[];
  repliesNextCursor: string | null;
  repliesHasMore: boolean;
  repliesTotal: number;
};

type ListOwnProofRequestsOptions = {
  limit?: number;
  cursor?: string | null;
};

type ListDiscoverableProofRequestsOptions = {
  limit?: number;
  cursor?: string | null;
  location?: string | null;
  createdAfter?: Date | null;
};

type GetPublicProofRequestOptions = {
  replyLimit?: number;
  replyCursor?: string | null;
};

const requestEvidenceInclude = {
  where: {
    ownerKind: "REQUEST" as const,
  },
  orderBy: {
    createdAt: "asc" as const,
  },
};

function toProofRequestDTO(
  request: ProofRequestBase,
  viewerUserId: string | null,
  replySummary: ProofReplySummary,
): ProofRequestDTO {
  const isOwner = canViewOwnedProofRequest(viewerUserId, request.creatorId);

  return {
    id: request.id,
    posterDisplayName: generatePosterDisplayName(request.id),
    title: request.title,
    body: request.body,
    category: request.category,
    locationHint: request.locationHint,
    listingUrl: request.listingUrl,
    visibility: request.visibility,
    status: request.status,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    isOwner,
    replyShareUrl: isOwner
      ? buildProofRequestReplyShareUrl(env.APP_URL, request.id)
      : null,
    replySummary,
    evidence: request.evidence.map(toRequestEvidenceDTO),
    isUrgentBoosted: Boolean(request.urgentBoostPaidAt),
  };
}

async function getReplySummaryForRequest(requestId: string): Promise<ProofReplySummary> {
  const groups = await prisma.proofReply.groupBy({
    by: ["verdict"],
    where: {
      requestId,
    },
    _count: {
      _all: true,
    },
  });

  return summarizeVerdictGroups(groups);
}

export async function createProofRequest(
  input: CreateProofRequestInput,
  attachments: File[] = [],
): Promise<ProofRequestDTO> {
  const authUser = await requireCurrentUser();
  const user = await ensureUserForAuth(authUser);

  const request = await prisma.proofRequest.create({
    data: {
      creatorId: user.id,
      title: input.title,
      body: input.body,
      category: input.category,
      locationHint: input.locationHint,
      listingUrl: input.listingUrl,
      visibility: input.visibility,
    },
    include: {
      evidence: requestEvidenceInclude,
    },
  });

  if (attachments.length > 0) {
    await saveRequestEvidenceFiles(request.id, null, "REQUEST", attachments);
  }

  const refreshed = await prisma.proofRequest.findUniqueOrThrow({
    where: {
      id: request.id,
    },
    include: {
      evidence: requestEvidenceInclude,
    },
  });

  return toProofRequestDTO(
    refreshed,
    user.id,
    summarizeProofReplies([]),
  );
}

export async function listOwnProofRequests(
  options: ListOwnProofRequestsOptions = {},
): Promise<PaginatedResult<ProofRequestDTO>> {
  const authUser = await requireCurrentUser();
  const user = await ensureUserForAuth(authUser);
  const limit = options.limit ?? DASHBOARD_REQUESTS_PAGE_SIZE;
  const cursor = options.cursor ?? undefined;

  const requests = await prisma.proofRequest.findMany({
    where: {
      creatorId: user.id,
    },
    include: {
      evidence: requestEvidenceInclude,
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

  const page = paginateByCursor(requests, limit);
  const requestIds = page.items.map((request) => request.id);
  const summaryGroups =
    requestIds.length > 0
      ? await prisma.proofReply.groupBy({
          by: ["requestId", "verdict"],
          where: {
            requestId: {
              in: requestIds,
            },
          },
          _count: {
            _all: true,
          },
        })
      : [];
  const summariesByRequestId = buildReplySummariesByRequestId(summaryGroups);
  const emptySummary = summarizeVerdictGroups([]);

  return {
    ...page,
    items: page.items.map((request) =>
      toProofRequestDTO(
        request,
        user.id,
        summariesByRequestId.get(request.id) ?? emptySummary,
      ),
    ),
  };
}

export async function listDiscoverableProofRequests(
  options: ListDiscoverableProofRequestsOptions = {},
): Promise<PaginatedResult<ProofRequestDTO>> {
  const authUser = await getCurrentUser();
  const viewerUserId = authUser?.id ?? null;
  const limit = options.limit ?? NEARBY_REQUESTS_PAGE_SIZE;
  const cursor = options.cursor ?? undefined;
  const location = options.location?.trim();
  const createdAfter = options.createdAfter ?? null;

  const requests = await prisma.proofRequest.findMany({
    where: {
      visibility: "LOCAL_DISCOVERY",
      status: {
        in: ["OPEN", "UNRESOLVED", "SUSPICIOUS"],
      },
      ...(location
        ? {
            locationHint: {
              contains: location,
              mode: "insensitive",
            },
          }
        : {}),
      ...(createdAfter
        ? {
            createdAt: {
              gt: createdAfter,
            },
          }
        : {}),
    },
    include: {
      evidence: requestEvidenceInclude,
    },
    orderBy: [
      { urgentBoostPaidAt: { sort: "desc", nulls: "last" } },
      { createdAt: "desc" },
      { id: "desc" },
    ],
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

  const page = paginateByCursor(requests, limit);
  const requestIds = page.items.map((request) => request.id);
  const summaryGroups =
    requestIds.length > 0
      ? await prisma.proofReply.groupBy({
          by: ["requestId", "verdict"],
          where: {
            requestId: {
              in: requestIds,
            },
          },
          _count: {
            _all: true,
          },
        })
      : [];
  const summariesByRequestId = buildReplySummariesByRequestId(summaryGroups);
  const emptySummary = summarizeVerdictGroups([]);

  return {
    ...page,
    items: page.items.map((request) =>
      toProofRequestDTO(
        request,
        viewerUserId,
        summariesByRequestId.get(request.id) ?? emptySummary,
      ),
    ),
  };
}


export async function getPublicProofRequest(
  id: string,
  options: GetPublicProofRequestOptions = {},
): Promise<PublicProofRequestDTO | null> {
  const authUser = await getCurrentUser();
  const viewerUserId = authUser?.id ?? null;
  const replyLimit = options.replyLimit ?? REPLIES_PAGE_SIZE;

  const request = await prisma.proofRequest.findUnique({
    where: {
      id,
    },
    include: {
      evidence: requestEvidenceInclude,
    },
  });

  if (!request) {
    return null;
  }

  const [replySummary, repliesPage, repliesTotal] = await Promise.all([
    getReplySummaryForRequest(id),
    listProofReplies(id, {
      limit: replyLimit,
      cursor: options.replyCursor,
    }),
    prisma.proofReply.count({
      where: {
        requestId: id,
      },
    }),
  ]);

  return {
    ...toProofRequestDTO(request, viewerUserId, replySummary),
    replies: repliesPage.items,
    repliesNextCursor: repliesPage.nextCursor,
    repliesHasMore: repliesPage.hasMore,
    repliesTotal,
  };
}

export async function updateProofRequestStatus(
  id: string,
  input: UpdateProofRequestStatusInput,
): Promise<ProofRequestDTO | null> {
  const authUser = await requireCurrentUser();
  const user = await ensureUserForAuth(authUser);

  const request = await prisma.proofRequest.findUnique({
    where: {
      id,
    },
    select: {
      creatorId: true,
    },
  });

  if (!request) {
    return null;
  }

  if (!canViewOwnedProofRequest(user.id, request.creatorId)) {
    throw new ProofRequestForbiddenError();
  }

  const updated = await prisma.proofRequest.update({
    where: {
      id,
    },
    data: {
      status: input.status,
    },
    include: {
      evidence: requestEvidenceInclude,
    },
  });

  const replySummary = await getReplySummaryForRequest(id);

  return toProofRequestDTO(updated, user.id, replySummary);
}
