"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { PlaceAutocomplete } from "@/components/place-autocomplete";

export function NearbyLocationSearch({
  initialLocation = "",
}: {
  initialLocation?: string;
}) {
  const router = useRouter();
  const [location, setLocation] = useState(initialLocation);

  return (
    <form
      className="flex flex-col gap-3 rounded-md border border-line bg-surface p-3 sm:flex-row sm:items-end"
      onSubmit={(event) => {
        event.preventDefault();
        const params = new URLSearchParams();
        if (location.trim()) {
          params.set("location", location.trim());
        }
        const query = params.toString();
        router.push(query ? `/requests?${query}` : "/requests");
      }}
    >
      <div className="flex-1">
        <PlaceAutocomplete
          helpText="Pick a known place from the suggestions."
          inputClassName="min-h-12 w-full rounded-md border border-line bg-background px-4 text-base outline-none focus:border-accent"
          label="City or neighborhood"
          name="location"
          onChange={setLocation}
          placeholder="California, Denver, Lagos, London..."
          value={location}
        />
      </div>
      <button
        className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-accent px-5 text-base font-semibold text-white hover:bg-accent-strong sm:w-auto"
        type="submit"
      >
        Find requests
      </button>
    </form>
  );
}
