import { describe, expect, it, vi, afterEach } from "vitest";

import { placesSearchQuerySchema } from "@/lib/places/validation";

describe("placesSearchQuerySchema", () => {
  it("requires at least 2 characters", () => {
    expect(placesSearchQuerySchema.safeParse({ q: "a" }).success).toBe(false);
  });

  it("accepts a place query", () => {
    expect(placesSearchQuerySchema.parse({ q: "  Makerere  " })).toEqual({
      q: "Makerere",
      limit: 6,
    });
  });
});

describe("searchPlaces", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("maps Nominatim results into suggestions", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          {
            place_id: 1,
            display_name: "Makerere Kikoni, Kampala, Uganda",
            name: "Makerere Kikoni",
            address: {
              suburb: "Makerere Kikoni",
              city: "Kampala",
              country: "Uganda",
            },
          },
        ],
      }),
    );

    const { searchPlaces } = await import("@/lib/server/places");
    const places = await searchPlaces({ query: "Makerere" });

    expect(places[0]).toMatchObject({
      id: "1",
      label: "Makerere Kikoni, Kampala, Uganda",
    });
  });
});
