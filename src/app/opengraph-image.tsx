import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, OgCard } from "@/lib/og-card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "EveryTech App Store — location intelligence and AI apps built on real data";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <OgCard
        eyebrow="First-party apps · real data"
        title="Find the app for your use case."
        subtitle="Location intelligence · AI governance · deterministic agent pipelines. Real, working apps on real data — not slideware."
        chips={["Real data only", "Explains itself", "Ships as a surface"]}
      />
    ),
    size,
  );
}
