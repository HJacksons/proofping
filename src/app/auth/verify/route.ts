import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME, SESSION_TTL_MS } from "@/lib/auth/constants";
import { env } from "@/lib/env";
import {
  consumeMagicLink,
  createAuthSession,
} from "@/lib/server/auth-sessions";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get("token");
  const nextPath = getSafeNextPath(requestUrl.searchParams.get("next"));
  const loginUrl = new URL("/login", env.APP_URL);
  if (nextPath) {
    loginUrl.searchParams.set("next", nextPath);
  }

  if (!token) {
    loginUrl.searchParams.set("error", "missing-token");
    return NextResponse.redirect(loginUrl);
  }

  const user = await consumeMagicLink(token);

  if (!user) {
    loginUrl.searchParams.set("error", "invalid-token");
    return NextResponse.redirect(loginUrl);
  }

  const session = await createAuthSession(user.id);
  const redirectUrl = new URL(nextPath ?? "/dashboard", env.APP_URL);
  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set(SESSION_COOKIE_NAME, session.sessionToken, {
    httpOnly: true,
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

function getSafeNextPath(next: string | null) {
  if (!next?.startsWith("/") || next.startsWith("//")) {
    return null;
  }

  return next;
}
