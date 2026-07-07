export class RequesterSelfReplyError extends Error {
  constructor() {
    super("Request creators cannot reply to their own proof requests.");
    this.name = "RequesterSelfReplyError";
  }
}
