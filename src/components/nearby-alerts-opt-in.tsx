"use client";

import { useState } from "react";

import {
  baselineNearbyAlertSince,
  ensureNotificationPermission,
  readLocalNearbyAlertPrefs,
  writeLocalNearbyAlertPrefs,
  type LocalNearbyAlertPrefs,
} from "@/lib/nearby-alerts/device-notify";
import { PlaceAutocomplete } from "@/components/place-autocomplete";

type NearbyAlertsOptInProps = {
  initialLocation?: string;
  /** When signed in, also save prefs server-side for admin place insights. */
  signedIn?: boolean;
};

function notifyPrefsChanged() {
  window.dispatchEvent(new Event("proofping:nearby-alerts-changed"));
}

function getInitialPrefs(initialLocation: string): {
  prefs: LocalNearbyAlertPrefs | null;
  location: string;
  enabled: boolean;
} {
  const local = readLocalNearbyAlertPrefs();
  if (local) {
    return {
      prefs: local,
      location: local.location ?? initialLocation,
      enabled: local.enabled,
    };
  }

  return {
    prefs: null,
    location: initialLocation,
    enabled: false,
  };
}

export function NearbyAlertsOptIn({
  initialLocation = "",
  signedIn = false,
}: NearbyAlertsOptInProps) {
  const initial = getInitialPrefs(initialLocation);
  const [prefs, setPrefs] = useState<LocalNearbyAlertPrefs | null>(initial.prefs);
  const [location, setLocation] = useState(initial.location);
  const [enabled, setEnabled] = useState(initial.enabled);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function savePrefs(nextEnabled: boolean) {
    setSaving(true);
    setError(null);
    setMessage(null);

    const nextLocation = location.trim() || null;

    if (nextEnabled && !nextLocation) {
      setError("Add a place to watch, then turn on alerts.");
      setSaving(false);
      return;
    }

    try {
      if (nextEnabled) {
        const permission = await ensureNotificationPermission();
        if (permission === "denied") {
          setError(
            "Notifications are blocked on this device. Allow them for ProofPing, then try again.",
          );
          setSaving(false);
          return;
        }
        if (permission === "unsupported") {
          setError(
            "This browser can’t show device notifications. You’ll still get an in-app banner while ProofPing is open.",
          );
        }
      }

      const nextPrefs: LocalNearbyAlertPrefs = {
        enabled: nextEnabled,
        location: nextEnabled ? nextLocation : null,
      };

      writeLocalNearbyAlertPrefs(nextPrefs);
      setPrefs(nextPrefs);
      setEnabled(nextPrefs.enabled);
      setLocation(nextPrefs.location ?? "");

      if (signedIn) {
        void fetch("/api/nearby-alerts", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nextPrefs),
        }).catch(() => {
          // Local alerts still work without the server sync.
        });
      }

      if (nextPrefs.enabled) {
        baselineNearbyAlertSince();
        setMessage(
          `Alerts on for ${nextPrefs.location}. Keep ProofPing open (even in a background tab).`,
        );
      } else {
        setMessage("Alerts are off.");
      }

      notifyPrefsChanged();
    } catch {
      setError("Unable to save alerts.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="grid gap-4 rounded-md border border-line bg-surface px-4 py-4">
      <div>
        <h2 className="text-base font-semibold">Device alerts</h2>
        <p className="mt-1 text-sm text-muted">
          Ping when a Help nearby ask matches your place. Works without signing
          in while ProofPing is open.
        </p>
      </div>

      <PlaceAutocomplete
        helpText="Choose a known place from the list so alerts match real asks."
        label="Place to watch"
        onChange={setLocation}
        placeholder="Campus library, downtown cafe, neighborhood..."
        value={location}
      />

      <div className="grid gap-2 sm:flex sm:flex-wrap">
        <button
          className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-accent px-4 text-base font-semibold text-white hover:bg-accent-strong disabled:opacity-60 sm:w-auto"
          disabled={saving}
          onClick={() => {
            void savePrefs(true);
          }}
          type="button"
        >
          {saving ? "Saving..." : enabled ? "Save" : "Turn on"}
        </button>
        {enabled || prefs?.enabled ? (
          <button
            className="inline-flex min-h-12 w-full items-center justify-center rounded-md border border-line px-4 text-sm font-semibold text-muted hover:text-foreground disabled:opacity-60 sm:w-auto"
            disabled={saving}
            onClick={() => {
              void savePrefs(false);
            }}
            type="button"
          >
            Turn off
          </button>
        ) : null}
      </div>

      {message ? (
        <p className="text-xs font-medium text-accent-strong" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="text-xs font-medium text-amber-800" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
