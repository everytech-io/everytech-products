export type Edition = {
  code: "ph" | "my";
  flag: string;
  country: string;
  city: string;
  app: string;
  unit: string;
  zones: number;
  joinKey: string;
  formats: string;
  sources: [string, string][];
};

export const EDITIONS: Edition[] = [
  {
    code: "ph",
    flag: "🇵🇭",
    country: "Philippines",
    city: "Quezon City",
    app: "/apps/franchiseiq.html",
    unit: "barangay",
    zones: 12,
    joinKey: "PSGC (10-digit)",
    formats: "siomai stand, Jollibee-class fast food, milk tea, pharmacy",
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
    app: "/apps/franchiseiq-my.html",
    unit: "zone",
    zones: 12,
    joinKey: "DOSM administrative code",
    formats:
      "mamak / nasi campur stall, McD/KFC-class fast food, Tealive-class bubble tea, Guardian/Watsons-class pharmacy",
    sources: [
      ["Population", "DOSM Census 2020 (MyCensus / OpenDOSM)"],
      ["Income", "DOSM household income & poverty estimates"],
      ["Traffic", "JKR / MOT volumes (data.gov.my)"],
      ["Points of interest", "OpenStreetMap Overpass"],
      ["Join key", "DOSM administrative code"],
    ],
  },
];
