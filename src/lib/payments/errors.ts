export class PaymentsNotConfiguredError extends Error {
  constructor() {
    super("Stripe is not configured for this environment.");
    this.name = "PaymentsNotConfiguredError";
  }
}

export class UrgentBoostNotAllowedError extends Error {
  constructor(message = "This request cannot be boosted right now.") {
    super(message);
    this.name = "UrgentBoostNotAllowedError";
  }
}
