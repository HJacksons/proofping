export class ProofRequestForbiddenError extends Error {
  constructor() {
    super("Only the request creator can update this proof request.");
    this.name = "ProofRequestForbiddenError";
  }
}

export class ProofRequestNotOpenForRepliesError extends Error {
  constructor() {
    super("This proof request is no longer accepting replies.");
    this.name = "ProofRequestNotOpenForRepliesError";
  }
}

export class InvalidReplyCapabilityTokenError extends Error {
  constructor() {
    super("A valid helper reply link is required to submit a reply.");
    this.name = "InvalidReplyCapabilityTokenError";
  }
}
