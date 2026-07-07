export function mapOpenAiImproveError(status: number | undefined, message?: string) {
  if (status === 429) {
    return "AI wording is unavailable right now (OpenAI quota). You can still post your question as written.";
  }

  if (status === 401) {
    return "OpenAI API key is invalid. Check OPENAI_API_KEY in your environment.";
  }

  if (status === 403) {
    return "This OpenAI project cannot use the configured model. Set OPENAI_MODEL=gpt-4o-mini in .env.";
  }

  if (message) {
    return message;
  }

  return "Unable to improve wording right now.";
}
