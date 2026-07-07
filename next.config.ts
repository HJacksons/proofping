import type { NextConfig } from "next";

const lanDevOrigins = (process.env.DEV_LAN_ORIGIN ?? "192.168.0.104")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  // Allow HMR when testing from a phone or another machine on your Wi‑Fi.
  allowedDevOrigins: ["localhost", "127.0.0.1", ...lanDevOrigins, "192.168.*.*"],
};

export default nextConfig;
