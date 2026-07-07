import { createReplyCapabilityToken } from "@/lib/proof-requests/reply-token";

export function buildProofRequestSharePath(
  requestId: string,
  replyToken?: string,
) {
  const path = `/requests/${requestId}`;

  if (!replyToken) {
    return path;
  }

  const searchParams = new URLSearchParams({
    reply: replyToken,
  });

  return `${path}?${searchParams.toString()}`;
}

export function buildProofRequestShareUrl(
  appUrl: string,
  requestId: string,
  replyToken?: string,
) {
  return new URL(
    buildProofRequestSharePath(requestId, replyToken),
    appUrl,
  ).toString();
}

export function buildProofRequestReplyShareUrl(appUrl: string, requestId: string) {
  return buildProofRequestShareUrl(
    appUrl,
    requestId,
    createReplyCapabilityToken(requestId),
  );
}
