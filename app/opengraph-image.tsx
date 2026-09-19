import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#0f3d38",
          color: "#f4efe4",
          padding: 80,
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 4, textTransform: "uppercase", color: "#c9e4d6" }}>
          Australia
        </div>
        <div style={{ fontSize: 84, fontWeight: 700, marginTop: 16 }}>{SITE_NAME}</div>
        <div style={{ fontSize: 36, marginTop: 20, color: "#e6d7b8" }}>{SITE_TAGLINE}</div>
      </div>
    ),
    size,
  );
}
