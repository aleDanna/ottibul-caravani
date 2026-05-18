"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";

type Props = {
  multiple?: boolean;
  initialUrl?: string;
  onChange: (urls: string[]) => void;
};

async function uploadOne(file: File): Promise<string> {
  const blob = await upload(file.name, file, {
    access: "public",
    handleUploadUrl: "/api/blob-upload",
    contentType: file.type,
  });
  return blob.url;
}

export function ImageUploader({ multiple = false, initialUrl, onChange }: Props) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setBusy(true);
    setError(null);
    setProgress({ done: 0, total: files.length });
    const uploaded: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]!;
        const uploadedUrl = await uploadOne(file);
        uploaded.push(uploadedUrl);
        setProgress({ done: i + 1, total: files.length });
      }
    } catch (err) {
      setError((err as Error).message || "Upload failed");
    } finally {
      setBusy(false);
      setProgress(null);
      e.target.value = "";
      if (uploaded.length > 0) {
        if (!multiple) setUrl(uploaded[uploaded.length - 1]!);
        onChange(uploaded);
      }
    }
  }

  const buttonLabel = multiple ? "Añadir imágenes" : "Añadir imagen";

  return (
    <div className="space-y-3">
      <div>
        <label
          className={`inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] border px-4 py-2 text-sm font-medium transition-colors ${
            busy ? "cursor-not-allowed opacity-60" : "hover:bg-[var(--bg-sunken)]"
          }`}
          style={{
            borderColor: "var(--border-default)",
            color: "var(--fg-1)",
            background: "var(--bianco)",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
            <line x1="12" y1="5" x2="12" y2="11" />
            <line x1="9" y1="8" x2="15" y2="8" />
          </svg>
          {buttonLabel}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple={multiple}
            onChange={handleFiles}
            disabled={busy}
            className="sr-only"
          />
        </label>
        <p className="mt-1 text-xs" style={{ color: "var(--fg-3)" }}>
          JPG, PNG o WebP.
        </p>
        {busy && progress && (
          <p className="mt-2 text-sm">
            Subiendo {progress.done} / {progress.total}…
          </p>
        )}
        {error && (
          <p className="mt-2 text-sm" style={{ color: "var(--terra-700)" }}>
            {error}
          </p>
        )}
      </div>
      {!multiple && (
        <>
          <div>
            <label className="block text-sm font-medium">… o pegar URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                onChange(e.target.value ? [e.target.value] : []);
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
        </>
      )}
    </div>
  );
}
