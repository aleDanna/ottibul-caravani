"use client";

import Image from "next/image";
import { ImageUploader } from "./ImageUploader";

type Img = {
  url: string;
  altText?: string | null;
  sortOrder: number;
  isCover: boolean;
};

export function ImageGalleryManager({
  images,
  onChange,
}: {
  images: Img[];
  onChange: (imgs: Img[]) => void;
}) {
  function add(url: string) {
    const next: Img = {
      url,
      altText: null,
      sortOrder: images.length,
      isCover: images.length === 0,
    };
    onChange([...images, next]);
  }
  function remove(i: number) {
    const next = images
      .filter((_, idx) => idx !== i)
      .map((img, idx) => ({ ...img, sortOrder: idx }));
    if (!next.some((x) => x.isCover) && next[0]) next[0].isCover = true;
    onChange(next);
  }
  function setCover(i: number) {
    onChange(images.map((img, idx) => ({ ...img, isCover: idx === i })));
  }
  function setAlt(i: number, alt: string) {
    onChange(images.map((img, idx) => (idx === i ? { ...img, altText: alt } : img)));
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next.map((img, idx) => ({ ...img, sortOrder: idx })));
  }

  return (
    <div className="space-y-3">
      {images.length >= 10 ? (
        <p className="text-sm" style={{ color: "var(--fg-3)" }}>
          Máximo 10 imágenes alcanzado.
        </p>
      ) : (
        // Reuse the ImageUploader from hero-images. It expects { initialUrl?, onChange(url) }
        // We feed it a one-shot use: onChange triggers add() and the uploader resets via key remount.
        <ImageUploader
          key={images.length}
          onChange={(url) => {
            if (url) add(url);
          }}
        />
      )}
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img, i) => (
          <li
            key={img.url + i}
            className="space-y-2 rounded-[var(--radius-sm)] border p-2"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-sm)]">
              <Image
                src={img.url}
                alt={img.altText ?? ""}
                fill
                sizes="200px"
                className="object-cover"
              />
              {img.isCover && (
                <span
                  className="absolute top-1 left-1 rounded-[var(--radius-xs)] px-1.5 py-0.5 text-xs"
                  style={{ background: "var(--sole-500)", color: "var(--inchiostro-900)" }}
                >
                  Cover
                </span>
              )}
            </div>
            <input
              placeholder="Alt text"
              value={img.altText ?? ""}
              onChange={(e) => setAlt(i, e.target.value)}
              className="w-full rounded-[var(--radius-sm)] border p-1 text-sm"
              style={{ borderColor: "var(--border-default)" }}
            />
            <div className="flex items-center justify-between text-sm">
              <button type="button" onClick={() => setCover(i)} className="underline">
                {img.isCover ? "★ cover" : "Set cover"}
              </button>
              <div className="flex gap-1">
                <button type="button" onClick={() => move(i, -1)} aria-label="Up">
                  ↑
                </button>
                <button type="button" onClick={() => move(i, 1)} aria-label="Down">
                  ↓
                </button>
              </div>
              <button type="button" onClick={() => remove(i)} style={{ color: "var(--terra-700)" }}>
                Borrar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
