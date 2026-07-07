import {
  MAX_FORWARDS_PER_REQUEST,
  MAX_FORWARDS_PER_USER_PER_DAY,
} from "@/lib/proof-forwards/limits";

export function canCreateProofForward(input: {
  requestForwardCount: number;
  userForwardCountToday: number;
}) {
  if (input.requestForwardCount >= MAX_FORWARDS_PER_REQUEST) {
    return {
      ok: false as const,
      reason: `request-limit:${MAX_FORWARDS_PER_REQUEST}`,
    };
  }

  if (input.userForwardCountToday >= MAX_FORWARDS_PER_USER_PER_DAY) {
    return {
      ok: false as const,
      reason: `daily-limit:${MAX_FORWARDS_PER_USER_PER_DAY}`,
    };
  }

  return { ok: true as const };
}
