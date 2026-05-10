import { ImageResponse } from "next/og";

export const alt = "Otti Bull";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    <div
      style={{
        background: "#FBF8F1",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 96,
        fontWeight: 700,
        color: "#1B3527",
        fontFamily: "Georgia, serif",
      }}
    >
      Otti Bull
    </div>,
    size,
  );
}
