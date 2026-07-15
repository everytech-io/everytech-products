// Market metadata for the FranchiseIQ app (provenance panel + header copy).
// The app itself now fetches locations/formats/scores from /api/fiq/* — this file
// no longer points at any bundled HTML (the static /apps/*.html pilots were retired).

import type { MarketCode } from "@/lib/fiq/types";

export type Edition = {
  code: MarketCode;
  flag: string;
  country: string;
  city: string;
  unit: string; // "barangay" | "zone"
  joinKey: string;
  formats: string;
  /** Default format id highlighted on load (mirrors the original pilots). */
  defaultFormat: string;
  /** Map center + zoom. */
  center: [number, number];
  zoom: number;
  tag: string; // header sub-line
  sources: [string, string][];
};

export const EDITIONS: Edition[] = [
  {
    code: "ph",
    flag: "🇵🇭",
    country: "Philippines",
    city: "Metro Manila + Calabarzon",
    unit: "barangay",
    joinKey: "PSGC (10-digit)",
    formats: "siomai stand, Jollibee-class fast food, milk tea, pharmacy",
    defaultFormat: "foodcart",
    center: [14.55, 121.05],
    zoom: 11,
    tag: "location intelligence · open government data · Metro Manila + Calabarzon",
    sources: [
      ["Population", "PSA POPCEN 2024 / CPH 2020 (OpenSTAT)"],
      ["Income", "PSA small-area poverty estimates"],
      ["Traffic", "DPWH AADT (data.gov.ph)"],
      ["Points of interest", "OpenStreetMap Overpass"],
      ["Join key", "PSGC (10-digit)"],
    ],
  },
  {
    code: "my",
    flag: "🇲🇾",
    country: "Malaysia",
    city: "Kuala Lumpur",
    unit: "zone",
    joinKey: "DOSM administrative code",
    formats:
      "mamak / nasi campur stall, McD/KFC-class fast food, Tealive-class bubble tea, Guardian/Watsons-class pharmacy",
    defaultFormat: "mamak",
    center: [3.147, 101.7],
    zoom: 11,
    tag: "location intelligence · open government data · pilot: Kuala Lumpur",
    sources: [
      ["Population", "DOSM Census 2020 (MyCensus / OpenDOSM)"],
      ["Income", "DOSM household income & poverty estimates"],
      ["Traffic", "JKR / MOT volumes (data.gov.my)"],
      ["Points of interest", "OpenStreetMap Overpass"],
      ["Join key", "DOSM administrative code"],
    ],
  },
];

export function editionOf(code: MarketCode): Edition {
  return EDITIONS.find((e) => e.code === code) ?? EDITIONS[0];
}
