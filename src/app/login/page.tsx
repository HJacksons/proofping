import { redirect } from "next/navigation";
import { Suspense } from "react";

import { LoginForm } from "@/components/login-form";
import { SiteShell } from "@/components/site-shell";
import { env } from "@/lib/env";
import { getCurrentUser } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <SiteShell className="py-10 sm:py-16" width="narrow">
      <div className="mx-auto w-full max-w-md">
        <div className="text-center">
          <p className="text-sm font-medium text-accent-strong">Sign in</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Manage your requests
          </h1>
          <p className="mt-3 text-base leading-7 text-muted">
            We&apos;ll email you a one-time link. Helpers reply without an
            account.
          </p>
        </div>

        <div className="mt-8">
          <Suspense fallback={<p className="text-sm text-muted">Loading...</p>}>
            <LoginForm />
          </Suspense>
        </div>

        {env.ENABLE_DEMO_AUTH ? (
          <p className="mt-6 text-center text-xs leading-5 text-muted">
            Demo auth is on locally — dashboard works without signing in.
          </p>
        ) : env.AUTH_LINK_DELIVERY === "response" ? (
          <p className="mt-6 text-center text-xs leading-5 text-muted">
            Local test mode: the sign-in link appears on this page after submit.
          </p>
        ) : null}
      </div>
    </SiteShell>
  );
}
