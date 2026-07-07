import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME, SESSION_TTL_MS } from "@/lib/auth/constants";
import { env } from "@/lib/env";
import {
  consumeMagicLink,
  createAuthSession,
} from "@/lib/server/auth-sessions";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  const loginUrl = new URL("/login", env.APP_URL);

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
  const dashboardUrl = new URL("/dashboard", env.APP_URL);
  const response = NextResponse.redirect(dashboardUrl);

  response.cookies.set(SESSION_COOKIE_NAME, session.sessionToken, {
    httpOnly: true,
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
