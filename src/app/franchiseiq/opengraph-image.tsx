import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, OgCard } from "@/lib/og-card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt =
  "FranchiseIQ — franchise-site location intelligence scoring, live in the Philippines and Malaysia";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <OgCard
        eyebrow="Live pilot · PH + MY"
        title="FranchiseIQ"
        subtitle="Score any neighborhood 0 to 100 for a franchise format — with the reasoning shown for every point."
        chips={["Open gov data", "Geospatial", "PH + MY"]}
      />
    ),
    size,
  );
}
