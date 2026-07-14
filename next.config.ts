import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    const base = [
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
    ];
    return [
      {
        // Deny framing of the site chrome (clickjacking guard). The bundled
        // product apps under /apps/* are same-origin embeds, so they are
        // allowed to be framed by this site (SAMEORIGIN) below.
        source: "/((?!apps/).*)",
        headers: [...base, { key: "X-Frame-Options", value: "DENY" }],
      },
      {
        source: "/apps/:path*",
        headers: [...base, { key: "X-Frame-Options", value: "SAMEORIGIN" }],
      },
    ];
  },
};

export default nextConfig;
