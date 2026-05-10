"use client";

import { useState } from "react";

type Props = {
  multiple?: boolean;
  initialUrl?: string;
  onChange: (urls: string[]) => void;
};

async function uploadOne(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/blob-upload", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? `HTTP ${res.status}`);
  }
  const { url } = (await res.json()) as { url: string };
  return url;
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

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium">
          {multiple ? "Subir archivos" : "Subir archivo"}
        </label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple={multiple}
          onChange={handleFiles}
          disabled={busy}
          className="mt-1 text-sm"
        />
        {busy && progress && (
          <p className="mt-1 text-sm">
            Subiendo {progress.done} / {progress.total}…
          </p>
        )}
        {error && (
          <p className="mt-1 text-sm" style={{ color: "var(--terra-700)" }}>
            {error}
          </p>
        )}
      </div>
      {!multiple && (
        <>
          <div>
            <label className="block text-sm font-medium">…o pegar URL</label>
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
