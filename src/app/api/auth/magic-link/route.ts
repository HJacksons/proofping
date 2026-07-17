import { ZodError } from "zod";
import { z } from "zod";

import { AdultVerificationRequiredError } from "@/lib/server/auth";
import { createMagicLink } from "@/lib/server/auth-sessions";
import {
  deliverMagicLink,
  EmailDeliveryError,
  shouldExposeMagicLinkInResponse,
} from "@/lib/server/auth-email";
import { env } from "@/lib/env";

const requestMagicLinkSchema = z.object({
  email: z.email("Enter a valid email address."),
  isAdultVerified: z.boolean().refine((value) => value, {
    message: "Please agree to the Terms to continue.",
  }),
  next: z
    .string()
    .optional()
    .nullable()
    .transform((value) => getSafeNextPath(value)),
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const input = requestMagicLinkSchema.parse(json);
    const magicLink = await createMagicLink(input.email);
    const verifyUrl = new URL("/auth/verify", env.APP_URL);

    verifyUrl.searchParams.set("token", magicLink.token);
    if (input.next) {
      verifyUrl.searchParams.set("next", input.next);
    }
    await deliverMagicLink(magicLink.email, verifyUrl.toString());

    return Response.json({
      message: "Check your email for a sign-in link.",
      verifyUrl: shouldExposeMagicLinkInResponse()
        ? verifyUrl.toString()
        : undefined,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        {
          error: "Invalid sign-in request.",
          issues: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 },
      );
    }

    if (error instanceof AdultVerificationRequiredError) {
      return Response.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof EmailDeliveryError) {
      return Response.json({ error: error.message }, { status: 503 });
    }

    return Response.json({ error: "Unable to send sign-in link." }, { status: 500 });
  }
}

function getSafeNextPath(next?: string | null) {
  if (!next?.startsWith("/") || next.startsWith("//")) {
    return null;
  }

  return next;
}
