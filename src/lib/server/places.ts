import "server-only";

import type { PlaceSuggestion } from "@/lib/places/validation";
import { env } from "@/lib/env";

type NominatimResult = {
  place_id: number;
  display_name: string;
  name?: string;
  type?: string;
  class?: string;
  address?: {
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    country?: string;
  };
};

function buildLabel(result: NominatimResult): { label: string; detail: string | null } {
  const address = result.address ?? {};
  const primary =
    result.name?.trim() ||
    address.neighbourhood ||
    address.suburb ||
    address.city ||
    address.town ||
    address.village ||
    result.display_name.split(",")[0]?.trim() ||
    result.display_name;

  const locality =
    address.city ||
    address.town ||
    address.village ||
    address.county ||
    address.state ||
    null;
  const country = address.country || null;

  const detailParts = [locality, country].filter(
    (part, index, all) => Boolean(part) && all.indexOf(part) === index,
  );

  // Avoid "Kampala, Kampala"
  const detail = detailParts
    .filter((part) => part && part.toLowerCase() !== primary.toLowerCase())
    .join(", ");

  return {
    label: primary,
    detail: detail || null,
  };
}

export async function searchPlaces(input: {
  query: string;
  limit?: number;
}): Promise<PlaceSuggestion[]> {
  const query = input.query.trim();
  const limit = input.limit ?? 6;

  if (query.length < 2) {
    return [];
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": `ProofPing/1.0 (${env.APP_URL})`,
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`Places lookup failed (${response.status}).`);
  }

  const payload = (await response.json()) as NominatimResult[];
  const seen = new Set<string>();
  const suggestions: PlaceSuggestion[] = [];

  for (const result of payload) {
    const { label, detail } = buildLabel(result);
    const fullLabel = detail ? `${label}, ${detail}` : label;
    const key = fullLabel.toLowerCase();

    if (seen.has(key)) {
      continue;
    }
    seen.add(key);

    suggestions.push({
      id: String(result.place_id),
      label: fullLabel,
      detail,
    });
  }

  return suggestions;
}
