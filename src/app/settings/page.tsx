import Link from "next/link";

import { NearbyAlertsOptIn } from "@/components/nearby-alerts-opt-in";
import { SiteShell } from "@/components/site-shell";
import { getCurrentUser } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Settings — ProofPing",
  description: "Device alerts and nearby notification preferences.",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string }>;
}) {
  const { location } = await searchParams;
  const user = await getCurrentUser();
  const locationQuery = location?.trim() ?? "";

  return (
    <SiteShell width="narrow">
      <div className="grid gap-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Settings
        </h1>
        <p className="text-sm leading-6 text-muted">
          Preferences for this device. No account required for alerts.
        </p>
      </div>

      <NearbyAlertsOptIn
        initialLocation={locationQuery}
        signedIn={Boolean(user)}
      />

      <p className="text-sm text-muted">
        <Link
          className="font-semibold text-accent-strong hover:underline"
          href="/requests"
        >
          Back to Help nearby
        </Link>
      </p>
    </SiteShell>
  );
}
