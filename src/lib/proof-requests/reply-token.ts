import { createHmac, timingSafeEqual } from "node:crypto";

import { getAuthSecret } from "@/lib/auth/secret";

const REPLY_TOKEN_VERSION = "v1";
const REPLY_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 90;

export function createReplyCapabilityToken(
  requestId: string,
  expiresAtMs = Date.now() + REPLY_TOKEN_TTL_MS,
) {
  const payload = `${REPLY_TOKEN_VERSION}.${requestId}.${expiresAtMs}`;
  const signature = signPayload(payload);

  return `${Buffer.from(payload, "utf8").toString("base64url")}.${signature}`;
}

export function verifyReplyCapabilityToken(requestId: string, token: string) {
  const [payloadPart, signature] = token.split(".");

  if (!payloadPart || !signature) {
    return false;
  }

  let payload: string;

  try {
    payload = Buffer.from(payloadPart, "base64url").toString("utf8");
  } catch {
    return false;
  }

  const expectedSignature = signPayload(payload);

  try {
    if (
      !timingSafeEqual(
        Buffer.from(signature, "utf8"),
        Buffer.from(expectedSignature, "utf8"),
      )
    ) {
      return false;
    }
  } catch {
    return false;
  }

  const [version, tokenRequestId, expiresAtRaw] = payload.split(".");

  if (version !== REPLY_TOKEN_VERSION || tokenRequestId !== requestId) {
    return false;
  }

  const expiresAtMs = Number(expiresAtRaw);

  if (!Number.isFinite(expiresAtMs) || Date.now() > expiresAtMs) {
    return false;
  }

  return true;
}

function signPayload(payload: string) {
  return createHmac("sha256", getAuthSecret()).update(payload).digest("base64url");
}
