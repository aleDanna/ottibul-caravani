"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

type Img = {
  url: string;
  altText: string | null;
  isCover: boolean;
  sortOrder: number;
};

// 1 main image + 4 thumbnails in a 2x2 grid = 5 visible.
const VISIBLE_LIMIT = 5;

export function VehicleGallery({ images, alt }: { images: Img[]; alt: string }) {
  const sorted = [...images].sort((a, b) => {
    if (a.isCover !== b.isCover) return a.isCover ? -1 : 1;
    return a.sortOrder - b.sortOrder;
  });

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openAt = (i: number) => setLightboxIndex(i);
  const close = useCallback(() => setLightboxIndex(null), []);
  const next = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % sorted.length));
  }, [sorted.length]);
  const prev = useCallback(() => {
    setLightboxIndex((i) =>
      i === null ? null : (i - 1 + sorted.length) % sorted.length,
    );
  }, [sorted.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    }
    document.addEventListener("keydown", onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
    };
  }, [lightboxIndex, close, next, prev]);

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

  const visible = sorted.slice(0, VISIBLE_LIMIT);
  const main = visible[0]!;
  const thumbs = visible.slice(1); // up to 4
  const overflow = Math.max(0, sorted.length - VISIBLE_LIMIT);

  const tileCls =
    "group relative overflow-hidden rounded-[var(--radius-lg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bosco-700)] focus-visible:ring-offset-2";

  return (
    <>
      {/* Desktop puzzle: 4 cols × 2 rows. Main occupies 2×2, then 4 thumbs fill the right 2×2 */}
      <div className="hidden gap-2 md:grid md:grid-cols-4 md:grid-rows-2">
        <button
          type="button"
          onClick={() => openAt(0)}
          aria-label={main.altText ?? alt}
          className={`${tileCls} col-span-2 row-span-2 aspect-square`}
          style={{ background: "var(--bg-sunken)" }}
        >
          <Image
            src={main.url}
            alt={main.altText ?? alt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </button>
        {thumbs.map((img, i) => {
          const realIndex = i + 1;
          const showOverflow = overflow > 0 && i === thumbs.length - 1;
          return (
            <button
              key={img.url}
              type="button"
              onClick={() => openAt(realIndex)}
              aria-label={
                showOverflow
                  ? `Ver todas (${sorted.length})`
                  : (img.altText ?? alt)
              }
              className={`${tileCls} aspect-square`}
              style={{ background: "var(--bg-sunken)" }}
            >
              <Image
                src={img.url}
                alt={img.altText ?? alt}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              {showOverflow && (
                <div
                  className="absolute inset-0 flex items-center justify-center text-2xl font-semibold text-white"
                  style={{ background: "rgba(20, 32, 26, 0.55)" }}
                >
                  +{overflow}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile: main image 4:3 + horizontal scroll of thumbs below */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => openAt(0)}
          aria-label={main.altText ?? alt}
          className={`${tileCls} block aspect-[4/3] w-full`}
          style={{ background: "var(--bg-sunken)" }}
        >
          <Image
            src={main.url}
            alt={main.altText ?? alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </button>
        {thumbs.length > 0 && (
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {thumbs.map((img, i) => {
              const realIndex = i + 1;
              const showOverflow = overflow > 0 && i === thumbs.length - 1;
              return (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => openAt(realIndex)}
                  className={`${tileCls} relative h-20 w-20 flex-shrink-0`}
                  style={{ background: "var(--bg-sunken)" }}
                  aria-label={
                    showOverflow
                      ? `Ver todas (${sorted.length})`
                      : (img.altText ?? alt)
                  }
                >
                  <Image
                    src={img.url}
                    alt={img.altText ?? alt}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                  {showOverflow && (
                    <div
                      className="absolute inset-0 flex items-center justify-center text-base font-semibold text-white"
                      style={{ background: "rgba(20, 32, 26, 0.55)" }}
                    >
                      +{overflow}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={sorted}
          index={lightboxIndex}
          onClose={close}
          onPrev={prev}
          onNext={next}
          alt={alt}
        />
      )}
    </>
  );
}

function Lightbox({
  images,
  index,
  onClose,
  onPrev,
  onNext,
  alt,
}: {
  images: Img[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  alt: string;
}) {
  const current = images[index];
  if (!current) return null;
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Galería ampliada"
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(20, 32, 26, 0.92)" }}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={(e) => {
          stop(e);
          onClose();
        }}
        aria-label="Cerrar"
        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20"
        style={{ background: "rgba(255, 255, 255, 0.12)" }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="18" y1="6" x2="6" y2="18" />
        </svg>
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              stop(e);
              onPrev();
            }}
            aria-label="Anterior"
            className="absolute left-3 z-10 flex h-12 w-12 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20 md:left-6"
            style={{ background: "rgba(255, 255, 255, 0.12)" }}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              stop(e);
              onNext();
            }}
            aria-label="Siguiente"
            className="absolute right-3 z-10 flex h-12 w-12 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20 md:right-6"
            style={{ background: "rgba(255, 255, 255, 0.12)" }}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      <div
        className="relative h-full max-h-[88vh] w-full max-w-[92vw]"
        onClick={stop}
      >
        <Image
          src={current.url}
          alt={current.altText ?? alt}
          fill
          sizes="92vw"
          priority
          className="object-contain"
        />
      </div>

      <div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-sm text-white"
        style={{ background: "rgba(255, 255, 255, 0.12)" }}
      >
        {index + 1} / {images.length}
      </div>
    </div>
  );
}
