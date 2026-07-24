import { afterEach, describe, expect, it, vi } from "vitest";

import {
  baselineNearbyAlertSince,
  buildNearbyDeviceAlertCopy,
  readNearbyAlertSince,
  writeNearbyAlertSince,
} from "@/lib/nearby-alerts/device-notify";

describe("buildNearbyDeviceAlertCopy", () => {
  it("builds a normal nearby alert", () => {
    expect(
      buildNearbyDeviceAlertCopy({
        title: "Is the printer working?",
        locationHint: "Campus library",
      }),
    ).toEqual({
      title: "New nearby ask",
      body: "Is the printer working? · Campus library",
    });
  });

  it("marks urgent asks", () => {
    expect(
      buildNearbyDeviceAlertCopy({
        title: "How long is the queue?",
        locationHint: "West gate",
        urgent: true,
      }).title,
    ).toBe("Urgent nearby ask");
  });
});

describe("nearby alert since storage", () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it("stores and reads the baseline timestamp", () => {
    const iso = baselineNearbyAlertSince(new Date("2026-07-24T10:00:00.000Z"));
    expect(iso).toBe("2026-07-24T10:00:00.000Z");
    expect(readNearbyAlertSince()).toBe(iso);

    writeNearbyAlertSince("2026-07-24T11:00:00.000Z");
    expect(readNearbyAlertSince()).toBe("2026-07-24T11:00:00.000Z");
  });
});

describe("local nearby alert prefs", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("stores and reads device prefs without an account", async () => {
    const {
      readLocalNearbyAlertPrefs,
      writeLocalNearbyAlertPrefs,
      clearLocalNearbyAlertPrefs,
    } = await import("@/lib/nearby-alerts/device-notify");

    writeLocalNearbyAlertPrefs({
      enabled: true,
      location: "Campus library",
    });

    expect(readLocalNearbyAlertPrefs()).toEqual({
      enabled: true,
      location: "Campus library",
    });

    clearLocalNearbyAlertPrefs();
    expect(readLocalNearbyAlertPrefs()).toBeNull();
  });
});

describe("ensureNotificationPermission", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("returns unsupported when Notification is missing", async () => {
    vi.stubGlobal("Notification", undefined);
    const { ensureNotificationPermission } = await import(
      "@/lib/nearby-alerts/device-notify"
    );
    expect(await ensureNotificationPermission()).toBe("unsupported");
  });
});
