import { SiteHeaderNav } from "@/components/site-header-nav";
import { env } from "@/lib/env";
import { getCurrentUser } from "@/lib/server/auth";
import { getAdminNavVisible } from "@/lib/server/admin";
import { getIntegrationAvailability } from "@/lib/server/integrations";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const showAdminLink = await getAdminNavVisible(user);
  const integrations = getIntegrationAvailability();

  return (
    <SiteHeaderNav
      donationsEnabled={integrations.donations}
      isDemoAuth={env.ENABLE_DEMO_AUTH}
      showAdminLink={showAdminLink}
      userEmail={user?.email ?? null}
    />
  );
}
