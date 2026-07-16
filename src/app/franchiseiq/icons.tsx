// Format glyphs — inline SVGs ported verbatim from the pilot HTML apps. They
// inherit each format's color via currentColor and match the line-drawn civic
// aesthetic. Keyed by format id (PH: fastfood/foodcart/coffee/pharmacy,
// MY: fastfood/mamak/bubbletea/pharmacy).
import type { JSX } from "react";

const svg = {
  strokeWidth: 1.8,
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  // decorative — the button/rank labels carry the meaning
  "aria-hidden": true,
  focusable: false,
};

export const FORMAT_ICONS: Record<string, JSX.Element> = {
  // burger — quick-service / fast food
  fastfood: (
    <svg {...svg}>
      <path d="M4 11a8 4.5 0 0 1 16 0Z" />
      <path d="M4 14.5h16" />
      <path d="M6 18h12a2 2 0 0 0 2-2H4a2 2 0 0 0 2 2Z" />
    </svg>
  ),
  // steamer basket — food cart / siomai stand
  foodcart: (
    <svg {...svg}>
      <ellipse cx="12" cy="7.5" rx="7" ry="2.5" />
      <path d="M5 7.5v3c0 1.3 3.1 2.4 7 2.4s7-1.1 7-2.4v-3" />
      <path d="M5 13v3c0 1.3 3.1 2.4 7 2.4s7-1.1 7-2.4v-3" />
    </svg>
  ),
  // cup with steam — coffee / milk tea
  coffee: (
    <svg {...svg}>
      <path d="M5 9h11v4.5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4Z" />
      <path d="M16 10h2.2a2 2 0 0 1 0 4H16" />
      <path d="M8 3.5v2M11.5 3.5v2" />
    </svg>
  ),
  // steaming bowl — mamak / nasi campur
  mamak: (
    <svg {...svg}>
      <path d="M3.5 11.5h17a8.5 8.5 0 0 1-17 0Z" />
      <path d="M2.5 11.5h19" />
      <path d="M9 4.5c0 1.6 1.6 1.6 1.6 3.2M13 4.5c0 1.6 1.6 1.6 1.6 3.2" />
    </svg>
  ),
  // sealed cup with pearls — bubble tea / kopitiam
  bubbletea: (
    <svg {...svg}>
      <path d="M7 8h10l-1 11a2 2 0 0 1-2 1.8H10A2 2 0 0 1 8 19Z" />
      <path d="M6 8h12" />
      <path d="M14 3l-1.5 5" />
      <circle cx="11" cy="16" r=".8" fill="currentColor" />
      <circle cx="14" cy="18" r=".8" fill="currentColor" />
    </svg>
  ),
  // medical cross — pharmacy
  pharmacy: (
    <svg {...svg}>
      <rect x="4" y="4" width="16" height="16" rx="3.5" />
      <path d="M12 8.5v7M8.5 12h7" />
    </svg>
  ),
};
