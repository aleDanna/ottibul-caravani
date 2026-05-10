"use client";

import { useState } from "react";
import Image from "next/image";

type Img = {
  url: string;
  altText: string | null;
  isCover: boolean;
  sortOrder: number;
};

export function VehicleGallery({
  images,
  alt,
}: {
  images: Img[];
  alt: string;
}) {
  // Cover image first; remaining images in admin-defined sort order.
  const sorted = [...images].sort((a, b) => {
    if (a.isCover !== b.isCover) return a.isCover ? -1 : 1;
    return a.sortOrder - b.sortOrder;
  });
  const [active, setActive] = useState(0);
  if (sorted.length === 0) {
    return (
      <div
        className="aspect-[16/9] w-full rounded-[var(--radius-lg)]"
        style={{
          background:
            "linear-gradient(135deg, var(--cielo-100), var(--sole-100), var(--crema-100), var(--bosco-100))",
        }}
        aria-label={alt}
      />
    );
  }
  const current = sorted[active] ?? sorted[0];
  return (
    <div>
      <div
        className="relative aspect-[16/9] w-full overflow-hidden rounded-[var(--radius-lg)]"
        style={{ background: "var(--bg-sunken)" }}
      >
        <Image
          src={current.url}
          alt={current.altText ?? alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 66vw"
          className="object-cover"
        />
      </div>
      {sorted.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {sorted.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Imagen ${i + 1}`}
              className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-[var(--radius-sm)] border"
              style={{
                borderColor:
                  i === active ? "var(--bosco-700)" : "var(--border-default)",
                outline: i === active ? "2px solid var(--bosco-700)" : "none",
                outlineOffset: "2px",
              }}
            >
              <Image
                src={img.url}
                alt={img.altText ?? alt}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
