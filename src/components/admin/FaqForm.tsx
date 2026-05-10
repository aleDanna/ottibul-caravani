"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createFaqAction, updateFaqAction, deleteFaqAction } from "@/app/actions/faqs";
import type { FaqFormInput } from "@/lib/faq-form-schema";

type Props = { mode: "create" } | { mode: "edit"; initial: FaqFormInput & { id: string } };

const empty: FaqFormInput = {
  status: "draft",
  sortOrder: 0,
  translations: [
    { locale: "es", question: "", answer: "" },
    { locale: "ca", question: "", answer: "" },
    { locale: "en", question: "", answer: "" },
  ],
};

export function FaqForm(props: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FaqFormInput>(
    props.mode === "edit" ? (props.initial as FaqFormInput) : empty,
  );
  const [active, setActive] = useState<"es" | "ca" | "en">("es");

  const update = <K extends keyof FaqFormInput>(k: K, v: FaqFormInput[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const cur = data.translations.find((t) => t.locale === active)!;

  function setTranslation(patch: Partial<{ question: string; answer: string }>) {
    update(
      "translations",
      data.translations.map((t) => (t.locale === active ? { ...t, ...patch } : t)),
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result =
        props.mode === "create"
          ? await createFaqAction(data)
          : await updateFaqAction((props as { initial: { id: string } }).initial.id, data);
      if (result && "error" in result && result.error) setError(result.error);
      else if (props.mode === "edit") router.refresh();
    });
  }

  function onDelete() {
    if (props.mode !== "edit") return;
    if (!confirm("¿Eliminar esta FAQ?")) return;
    startTransition(async () => {
      await deleteFaqAction(props.initial.id);
    });
  }

  const inputCls = "rounded-[var(--radius-sm)] border p-2 text-sm";
  const inputStyle: React.CSSProperties = { borderColor: "var(--border-default)" };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <fieldset
        className="space-y-3 rounded-[var(--radius-md)] border p-4"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <legend className="px-2 font-semibold">Datos comunes</legend>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-[200px_1fr] md:items-center">
          <label className="text-sm">Estado</label>
          <div>
            <select
              value={data.status}
              onChange={(e) => update("status", e.target.value as typeof data.status)}
              className={inputCls}
              style={inputStyle}
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
            </select>
          </div>
          <label className="text-sm">Orden</label>
          <div>
            <input
              type="number"
              value={data.sortOrder}
              onChange={(e) => update("sortOrder", Number(e.target.value))}
              className={`${inputCls} w-24`}
              style={inputStyle}
            />
          </div>
        </div>
      </fieldset>

      <fieldset
        className="space-y-3 rounded-[var(--radius-md)] border p-4"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <legend className="px-2 font-semibold">Traducciones</legend>
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
            placeholder="Pregunta"
            value={cur.question}
            onChange={(e) => setTranslation({ question: e.target.value })}
            className={`${inputCls} w-full`}
            style={inputStyle}
          />
          <textarea
            placeholder="Respuesta"
            rows={6}
            value={cur.answer}
            onChange={(e) => setTranslation({ answer: e.target.value })}
            className={`${inputCls} w-full`}
            style={inputStyle}
          />
        </div>
      </fieldset>

      {error && (
        <p className="text-sm" style={{ color: "var(--terra-700)" }}>
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-[var(--radius-sm)] px-4 py-2 text-white"
          style={{ background: "var(--brand)" }}
        >
          {pending ? "…" : props.mode === "create" ? "Crear" : "Guardar"}
        </button>
        {props.mode === "edit" && (
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="rounded-[var(--radius-sm)] px-4 py-2"
            style={{ color: "var(--terra-700)" }}
          >
            Eliminar
          </button>
        )}
      </div>
    </form>
  );
}
