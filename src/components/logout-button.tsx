"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      className="rounded-md px-2.5 py-2 text-sm font-semibold text-muted transition hover:bg-foreground/5 hover:text-foreground"
      onClick={handleLogout}
      type="button"
    >
      Sign out
    </button>
  );
}
