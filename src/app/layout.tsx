import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { VisitTracker } from "@/components/visit-tracker";
import { NearbyDeviceAlerts } from "@/components/nearby-device-alerts";
import { getAdminNavVisible } from "@/lib/server/admin";
import { getCurrentUser } from "@/lib/server/auth";
import { getIntegrationAvailability } from "@/lib/server/integrations";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProofPing — What’s true right now",
  description:
    "Before you pay, go, or miss a better option — ask someone who’s actually there. Schools, markets, offices, beaches, events, concerts.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#faf9f7",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const integrations = getIntegrationAvailability();
  const user = await getCurrentUser();
  const showAdminLink = await getAdminNavVisible(user);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <VisitTracker />
        <NearbyDeviceAlerts />
        <SiteHeader />
        <main className="flex-1 pb-[calc(4.25rem+env(safe-area-inset-bottom))] sm:pb-0">
          {children}
        </main>
        <SiteFooter donationsEnabled={integrations.donations} />
        <MobileBottomNav showAdminLink={showAdminLink} />
      </body>
    </html>
  );
}
