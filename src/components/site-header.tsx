import { SiteHeaderNav } from "@/components/site-header-nav";
import { env } from "@/lib/env";
import { getCurrentUser } from "@/lib/server/auth";
import { getAdminNavVisible } from "@/lib/server/admin";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const showAdminLink = await getAdminNavVisible(user);

  return (
    <SiteHeaderNav
      isDemoAuth={env.ENABLE_DEMO_AUTH}
      showAdminLink={showAdminLink}
      userEmail={user?.email ?? null}
    />
  );
}
