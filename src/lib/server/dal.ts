import "server-only";

import { getCurrentUser } from "@/lib/server/auth";

export type ViewerContext = {
  userId: string | null;
  isAuthenticated: boolean;
};

export async function getViewerContext(): Promise<ViewerContext> {
  const user = await getCurrentUser();

  return {
    userId: user?.id ?? null,
    isAuthenticated: Boolean(user),
  };
}
