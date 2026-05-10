"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createHeroImageAction,
  updateHeroImageAction,
  deleteHeroImageAction,
} from "@/app/actions/hero-images";
import type { HeroImageFormInput } from "@/lib/hero-image-form-schema";
import { ImageUploader } from "./ImageUploader";

type HeroImageRow = HeroImageFormInput & { id: string };

const empty: HeroImageFormInput = {
  url: "",
  altText: "",
  sortOrder: 0,
  status: "draft",
};

export function HeroImageForm(props: { mode: "create" } | { mode: "edit"; initial: HeroImageRow }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<HeroImageFormInput>(
    props.mode === "edit" ? (props.initial as HeroImageFormInput) : empty,
  );

  const update = <K extends keyof HeroImageFormInput>(k: K, v: HeroImageFormInput[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result =
        props.mode === "create"
          ? await createHeroImageAction(data)
          : await updateHeroImageAction(props.initial.id, data);
      if (result && "error" in result && result.error) setError(result.error);
      else if (props.mode === "edit") router.refresh();
    });
  }

  function onDelete() {
    if (props.mode !== "edit") return;
    if (!confirm("¿Eliminar esta imagen?")) return;
    startTransition(async () => {
      await deleteHeroImageAction(props.initial.id);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <fieldset
        className="space-y-3 rounded border p-4"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <legend className="px-2 font-semibold">Imagen</legend>
        <ImageUploader
          initialUrl={data.url || undefined}
          onChange={(urls) => update("url", urls[urls.length - 1] ?? "")}
        />
        <div>
          <label className="block text-sm font-medium">Alt text</label>
          <input
            type="text"
            value={data.altText ?? ""}
            onChange={(e) => update("altText", e.target.value)}
            className="mt-1 w-full rounded border p-2 text-sm"
            style={{ borderColor: "var(--border-default)" }}
          />
        </div>
      </fieldset>

      <fieldset
        className="space-y-3 rounded border p-4"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <legend className="px-2 font-semibold">Visualización</legend>
        <div>
          <label className="block text-sm font-medium">Estado</label>
          <select
            value={data.status}
            onChange={(e) => update("status", e.target.value as "draft" | "published")}
            className="mt-1 rounded border p-2"
            style={{ borderColor: "var(--border-default)" }}
          >
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Orden</label>
          <input
            type="number"
            value={data.sortOrder}
            onChange={(e) => update("sortOrder", Number(e.target.value))}
            className="mt-1 w-24 rounded border p-2 text-sm"
            style={{ borderColor: "var(--border-default)" }}
          />
          <p className="mt-1 text-xs" style={{ color: "var(--fg-3)" }}>
            Las imágenes con el orden más bajo aparecen primero en el hero.
          </p>
        </div>
      </fieldset>

      {error && <p style={{ color: "var(--terra-700)" }}>{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending || !data.url}
          className="rounded px-4 py-2 text-white"
          style={{ background: "var(--brand)" }}
        >
          {pending ? "…" : props.mode === "create" ? "Crear" : "Guardar"}
        </button>
        {props.mode === "edit" && (
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="rounded px-4 py-2"
            style={{ color: "var(--terra-700)" }}
          >
            Eliminar
          </button>
        )}
      </div>
    </form>
  );
}
