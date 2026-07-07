export class AdminRequiredError extends Error {
  constructor() {
    super("Admin access is required.");
    this.name = "AdminRequiredError";
  }
}
