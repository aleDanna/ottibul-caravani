import { ImageResponse } from "next/og";
import { eq, and } from "drizzle-orm";
import { db } from "@/db/client";
import { vehicles } from "@/db/schema";

export const alt = "Otti Bull";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function VehicleOG({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const v = await db.query.vehicles.findFirst({
    where: and(eq(vehicles.slug, slug), eq(vehicles.status, "published")),
    with: { translations: true, images: true },
  });
  const tr = v?.translations.find((t) => t.locale === locale) ?? v?.translations[0];
  const cover = v?.images.find((i) => i.isCover) ?? v?.images[0];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#1B3527",
        color: "#FBF8F1",
        padding: 60,
        position: "relative",
        fontFamily: "Helvetica, Arial, sans-serif",
      }}
    >
      {cover && (
        <img
          src={cover.url}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.55,
          }}
        />
      )}
      <div
        style={{
          marginTop: "auto",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            fontSize: 24,
            opacity: 0.85,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Otti Bull
        </div>
        <div style={{ fontSize: 72, fontWeight: 700, marginTop: 8, lineHeight: 1.05 }}>
          {tr?.title ?? "Vehicle"}
        </div>
        {v && (
          <div style={{ fontSize: 32, marginTop: 12, opacity: 0.92 }}>
            desde {v.basePricePerDay} €/día
          </div>
        )}
      </div>
    </div>,
    size,
  );
}
