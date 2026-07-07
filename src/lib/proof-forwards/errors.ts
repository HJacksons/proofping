export class ProofForwardForbiddenError extends Error {
  constructor() {
    super("Only the request creator can forward this proof request.");
    this.name = "ProofForwardForbiddenError";
  }
}

export class ProofForwardLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProofForwardLimitError";
  }
}

export class ProofForwardSelfEmailError extends Error {
  constructor() {
    super("You cannot forward a proof request to your own email.");
    this.name = "ProofForwardSelfEmailError";
  }
}

export class ProofForwardNotAllowedError extends Error {
  constructor() {
    super("This proof request cannot be forwarded right now.");
    this.name = "ProofForwardNotAllowedError";
  }
}
