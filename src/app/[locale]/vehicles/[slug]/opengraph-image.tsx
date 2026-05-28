import { ImageResponse } from "next/og";
import { eq, and } from "drizzle-orm";
import { db } from "@/db/client";
import { vehicles } from "@/db/schema";

export const alt = "Otti Bull";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  const v = await db.query.vehicles.findFirst({
    where: and(eq(vehicles.slug, slug), eq(vehicles.status, "published")),
    with: { translations: true, images: true },
  });

  const tr =
    v?.translations.find((t) => t.locale === locale) ??
    v?.translations.find((t) => t.locale === "es") ??
    v?.translations[0];
  const cover = v?.images.find((i) => i.isCover) ?? v?.images[0];
  const title = tr?.title ?? "Otti Bull";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#1b3527",
          color: "#fbf8f1",
          fontFamily: "Georgia, serif",
        }}
      >
        {cover && (
          <img
            src={cover.url}
            alt=""
            width={700}
            height={630}
            style={{ width: 700, height: 630, objectFit: "cover" }}
          />
        )}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: 60,
          }}
        >
          <div style={{ fontSize: 28, opacity: 0.7, marginBottom: 12 }}>Otti Bull</div>
          <div style={{ fontSize: 56, fontWeight: 400, lineHeight: 1.1 }}>{title}</div>
        </div>
      </div>
    ),
    size,
  );
}
