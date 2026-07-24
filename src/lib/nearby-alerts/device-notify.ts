const SINCE_STORAGE_KEY = "proofping.nearbyAlerts.since";
const PREFS_STORAGE_KEY = "proofping.nearbyAlerts.prefs";

export type LocalNearbyAlertPrefs = {
  enabled: boolean;
  location: string | null;
};

export function buildNearbyDeviceAlertCopy(input: {
  title: string;
  locationHint: string;
  urgent?: boolean;
}) {
  return {
    title: input.urgent ? "Urgent nearby ask" : "New nearby ask",
    body: input.locationHint
      ? `${input.title} · ${input.locationHint}`
      : input.title,
  };
}

export function readLocalNearbyAlertPrefs(): LocalNearbyAlertPrefs | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<LocalNearbyAlertPrefs>;
    if (typeof parsed.enabled !== "boolean") {
      return null;
    }

    const location =
      typeof parsed.location === "string" && parsed.location.trim()
        ? parsed.location.trim()
        : null;

    return {
      enabled: parsed.enabled,
      location,
    };
  } catch {
    return null;
  }
}

export function writeLocalNearbyAlertPrefs(prefs: LocalNearbyAlertPrefs) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      PREFS_STORAGE_KEY,
      JSON.stringify({
        enabled: prefs.enabled,
        location: prefs.enabled ? prefs.location : null,
      }),
    );
  } catch {
    // Ignore storage failures (private mode quotas, etc.).
  }
}

export function clearLocalNearbyAlertPrefs() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(PREFS_STORAGE_KEY);
  } catch {
    // Ignore.
  }
}

export function readNearbyAlertSince(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.sessionStorage.getItem(SINCE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeNearbyAlertSince(isoTimestamp: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(SINCE_STORAGE_KEY, isoTimestamp);
  } catch {
    // Ignore storage failures (private mode quotas, etc.).
  }
}

export function baselineNearbyAlertSince(now = new Date()) {
  const iso = now.toISOString();
  writeNearbyAlertSince(iso);
  return iso;
}

export async function ensureNotificationPermission(): Promise<
  NotificationPermission | "unsupported"
> {
  if (typeof window === "undefined" || typeof Notification === "undefined") {
    return "unsupported";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission === "denied") {
    return "denied";
  }

  return Notification.requestPermission();
}

export function showDeviceNotification(input: {
  title: string;
  body: string;
  url: string;
  tag?: string;
}) {
  if (typeof window === "undefined" || typeof Notification === "undefined") {
    return false;
  }

  if (Notification.permission !== "granted") {
    return false;
  }

  try {
    const notification = new Notification(input.title, {
      body: input.body,
      tag: input.tag ?? "proofping-nearby-ask",
    });

    notification.onclick = () => {
      window.focus();
      window.location.assign(input.url);
      notification.close();
    };

    return true;
  } catch {
    return false;
  }
}
