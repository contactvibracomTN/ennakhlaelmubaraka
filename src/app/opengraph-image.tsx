import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/config/site.config";

/**
 * OpenGraph/Twitter share image (1200×630) — art-direction placeholder.
 * NOTE: Latin-only on purpose — the bundled default font (Geist) cannot shape
 * Arabic. The production share image replaces this once the official logo
 * asset and an Arabic-capable font (e.g. Amiri) are loaded via `fonts`.
 */
export const alt = "Al Nakhlah Al Mubarakah — Premium Dates";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #fbf5ee 0%, #f4ead9 100%)",
        color: "#1d3826",
      }}
    >
      <div style={{ fontSize: 72, letterSpacing: 2 }}>
        {siteConfig.brand.nameEn}
      </div>
      <div
        style={{
          marginTop: 24,
          fontSize: 32,
          color: "#b89a63",
          letterSpacing: 4,
        }}
      >
        {siteConfig.brand.taglineEn}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 56,
          fontSize: 26,
          color: "#756d60",
        }}
      >
        Premium dates & gifts — Madinah, Saudi Arabia
      </div>
    </div>,
    size,
  );
}
