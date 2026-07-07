export class AiHelperNotConfiguredError extends Error {
  constructor() {
    super("OpenAI is not configured for this environment.");
    this.name = "AiHelperNotConfiguredError";
  }
}

export class AiImproveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiImproveError";
  }
}
