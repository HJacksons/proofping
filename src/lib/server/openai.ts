import "server-only";

import OpenAI from "openai";

import {
  buildImproveProofRequestPrompt,
  parseImprovedProofRequestWording,
  type ImproveProofRequestInput,
} from "@/lib/ai/improve-request";
import { AiHelperNotConfiguredError, AiImproveError } from "@/lib/ai/errors";
import { mapOpenAiImproveError } from "@/lib/ai/openai-errors";
import { env } from "@/lib/env";
import { isOpenAIConfigured } from "@/lib/server/integrations";

function getOpenAIClient() {
  if (!isOpenAIConfigured() || !env.OPENAI_API_KEY) {
    throw new AiHelperNotConfiguredError();
  }

  return new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  });
}

function toAiImproveError(error: unknown) {
  if (error instanceof OpenAI.APIError) {
    return new AiImproveError(mapOpenAiImproveError(error.status, error.message));
  }

  if (error instanceof Error) {
    return new AiImproveError(error.message);
  }

  return new AiImproveError("Unable to improve wording right now.");
}

export async function improveProofRequestWording(input: ImproveProofRequestInput) {
  const client = getOpenAIClient();

  try {
    const response = await client.chat.completions.create({
      model: env.OPENAI_MODEL,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content:
            "Improve proof request wording for clarity and trust. Keep it short, neutral, and lawful. Return JSON with keys title and details only.",
        },
        {
          role: "user",
          content: buildImproveProofRequestPrompt(input),
        },
      ],
    });

    const text = response.choices[0]?.message?.content?.trim() ?? "";
    const parsed = parseImprovedProofRequestWording(text);

    if (!parsed) {
      throw new AiImproveError("The AI suggestion was invalid. Try again.");
    }

    return parsed;
  } catch (error) {
    if (error instanceof AiImproveError || error instanceof AiHelperNotConfiguredError) {
      throw error;
    }

    throw toAiImproveError(error);
  }
}
