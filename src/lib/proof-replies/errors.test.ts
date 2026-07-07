import { describe, expect, it } from "vitest";

import { RequesterSelfReplyError } from "@/lib/proof-replies/errors";

describe("RequesterSelfReplyError", () => {
  it("has a clear message for blocked self-replies", () => {
    const error = new RequesterSelfReplyError();

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("RequesterSelfReplyError");
    expect(error.message).toBe(
      "Request creators cannot reply to their own proof requests.",
    );
  });
});
