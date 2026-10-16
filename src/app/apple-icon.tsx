import { ImageResponse } from "next/og";

/**
 * apple-icon (180×180 PNG) — placeholder derived from brand art direction.
 * Latin-only: the bundled default font cannot shape the Arabic glyph "ن".
 * Replaced by the official logo asset once supplied at this size.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1d3826 0%, #122517 100%)",
        borderRadius: 40,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 92,
          height: 92,
          borderRadius: 46,
          background: "#dec390",
          color: "#122517",
          fontSize: 40,
        }}
      >
        N
      </div>
    </div>,
    size,
  );
}
