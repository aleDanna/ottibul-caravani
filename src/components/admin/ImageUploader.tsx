"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";

export function ImageUploader({
  initialUrl,
  onChange,
}: {
  initialUrl?: string;
  onChange: (url: string) => void;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/blob-upload",
      });
      setUrl(blob.url);
      onChange(blob.url);
    } catch (err) {
      setError(
        (err as Error).message || "Upload failed. Pega una URL manualmente como alternativa.",
      );
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium">Subir archivo</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFile}
          disabled={busy}
          className="mt-1 text-sm"
        />
        {busy && <p className="mt-1 text-sm">Subiendo…</p>}
        {error && (
          <p className="mt-1 text-sm" style={{ color: "var(--terra-700)" }}>
            {error}
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium">…o pegar URL</label>
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            onChange(e.target.value);
          }}
          placeholder="https://…"
          className="mt-1 w-full rounded border p-2 text-sm"
          style={{ borderColor: "var(--border-default)" }}
        />
      </div>
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt="preview"
          className="mt-2 max-h-40 rounded border"
          style={{ borderColor: "var(--border-subtle)" }}
        />
      )}
    </div>
  );
}
