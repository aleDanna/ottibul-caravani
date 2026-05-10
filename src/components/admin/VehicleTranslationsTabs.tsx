"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

type Tr = {
  locale: "es" | "ca" | "en";
  title: string;
  description: string;
  metaTitle?: string;
  metaDescription?: string;
};

export function VehicleTranslationsTabs({
  translations,
  onChange,
}: {
  translations: Tr[];
  onChange: (t: Tr[]) => void;
}) {
  const [active, setActive] = useState<"es" | "ca" | "en">("es");
  const cur = translations.find((t) => t.locale === active)!;

  function update(patch: Partial<Tr>) {
    onChange(translations.map((t) => (t.locale === active ? { ...t, ...patch } : t)));
  }

  const inputCls = "w-full rounded-[var(--radius-sm)] border p-2 text-sm";
  const inputStyle: React.CSSProperties = { borderColor: "var(--border-default)" };

  return (
    <div>
      <div className="mb-3 flex gap-2">
        {(["es", "ca", "en"] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setActive(l)}
            className="rounded-[var(--radius-pill)] px-3 py-1 text-sm font-medium"
            style={
              active === l
                ? { background: "var(--bosco-700)", color: "var(--bianco)" }
                : { background: "var(--bg-sunken)", color: "var(--fg-2)" }
            }
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        <input
          placeholder="Título"
          value={cur.title}
          onChange={(e) => update({ title: e.target.value })}
          className={inputCls}
          style={inputStyle}
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <textarea
            placeholder="Descripción (markdown)"
            value={cur.description}
            rows={10}
            onChange={(e) => update({ description: e.target.value })}
            className={`${inputCls} font-mono`}
            style={inputStyle}
          />
          <div
            className="space-y-3 rounded-[var(--radius-sm)] border p-3 text-sm"
            style={{
              borderColor: "var(--border-subtle)",
              background: "var(--bg-elevated)",
              color: "var(--fg-2)",
            }}
          >
            <ReactMarkdown>{cur.description || "*Vista previa vacía*"}</ReactMarkdown>
          </div>
        </div>
        <input
          placeholder="Meta title (SEO, opcional)"
          value={cur.metaTitle ?? ""}
          onChange={(e) => update({ metaTitle: e.target.value })}
          className={inputCls}
          style={inputStyle}
        />
        <textarea
          placeholder="Meta description (SEO, opcional)"
          value={cur.metaDescription ?? ""}
          onChange={(e) => update({ metaDescription: e.target.value })}
          rows={2}
          className={inputCls}
          style={inputStyle}
        />
      </div>
    </div>
  );
}
