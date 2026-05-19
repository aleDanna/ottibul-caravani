"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createVehicleAction,
  updateVehicleAction,
  deleteVehicleAction,
} from "@/app/actions/vehicles";
import type { VehicleFormInput } from "@/lib/vehicle-form-schema";
import { VehicleAttributesFields } from "./VehicleAttributesFields";
import { VehicleTranslationsTabs } from "./VehicleTranslationsTabs";
import { ImageGalleryManager } from "./ImageGalleryManager";
import { NumberInput } from "./NumberInput";

type Props = { mode: "create" } | { mode: "edit"; initial: VehicleFormInput & { id: string } };

const empty: VehicleFormInput = {
  type: "camper",
  basePricePerDay: 0,
  minRentalDays: 1,
  maxRentalDays: null,
  location: "Barcelona",
  attributes: {},
  featured: false,
  sortOrder: 0,
  translations: [
    { locale: "es", title: "", description: "" },
    { locale: "ca", title: "", description: "" },
    { locale: "en", title: "", description: "" },
  ],
  images: [],
};

export function VehicleForm(props: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<VehicleFormInput>(
    props.mode === "edit" ? (props.initial as VehicleFormInput) : empty,
  );

  const update = <K extends keyof VehicleFormInput>(k: K, v: VehicleFormInput[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result =
        props.mode === "create"
          ? await createVehicleAction(data)
          : await updateVehicleAction((props as { initial: { id: string } }).initial.id, data);
      if (result && "error" in result && result.error) {
        setError(result.error);
        return;
      }
      // Always navigate back to the vehicles list so the admin gets visible
      // confirmation that the save succeeded.
      router.push("/admin/vehicles");
      router.refresh();
    });
  }

  function onDelete() {
    if (props.mode !== "edit") return;
    if (!confirm("¿Eliminar este vehículo?")) return;
    startTransition(async () => {
      await deleteVehicleAction(props.initial.id);
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
        <Row label="Tipo">
          <select
            value={data.type}
            onChange={(e) => update("type", e.target.value as typeof data.type)}
            className={inputCls}
            style={inputStyle}
          >
            <option value="camper">Camper</option>
            <option value="motorcycle">Moto</option>
            <option value="car">Coche</option>
            <option value="bicycle">Bici</option>
            <option value="boat">Barco</option>
          </select>
        </Row>
        <Row label="Precio/día (€)">
          <NumberInput
            step="0.01"
            min="0"
            value={data.basePricePerDay}
            emptyValue={0}
            onChange={(n) => update("basePricePerDay", n ?? 0)}
            className={inputCls}
            style={inputStyle}
            placeholder="0"
          />
        </Row>
        <Row label="Días mín / máx">
          <div className="flex gap-2">
            <NumberInput
              min="1"
              value={data.minRentalDays}
              emptyValue={1}
              onChange={(n) => update("minRentalDays", n ?? 1)}
              className={`${inputCls} w-24`}
              style={inputStyle}
              placeholder="1"
            />
            <NumberInput
              min="1"
              value={data.maxRentalDays}
              emptyValue={null}
              onChange={(n) => update("maxRentalDays", n)}
              className={`${inputCls} w-24`}
              style={inputStyle}
              placeholder="—"
            />
          </div>
        </Row>
        <Row label="Ubicación">
          <input
            value={data.location}
            onChange={(e) => update("location", e.target.value)}
            className={`${inputCls} w-full`}
            style={inputStyle}
          />
        </Row>
        <Row label="Orden">
          <NumberInput
            value={data.sortOrder}
            emptyValue={0}
            onChange={(n) => update("sortOrder", n ?? 0)}
            className={`${inputCls} w-24`}
            style={inputStyle}
            placeholder="0"
          />
        </Row>
      </fieldset>

      <fieldset
        className="space-y-3 rounded-[var(--radius-md)] border p-4"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <legend className="px-2 font-semibold">Atributos</legend>
        <VehicleAttributesFields
          type={data.type}
          attributes={data.attributes as Record<string, unknown>}
          onChange={(a) => update("attributes", a)}
        />
      </fieldset>

      <fieldset
        className="space-y-3 rounded-[var(--radius-md)] border p-4"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <legend className="px-2 font-semibold">Traducciones</legend>
        <VehicleTranslationsTabs
          translations={data.translations}
          onChange={(t) => update("translations", t)}
        />
      </fieldset>

      <fieldset
        className="space-y-3 rounded-[var(--radius-md)] border p-4"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <legend className="px-2 font-semibold">Imágenes</legend>
        <ImageGalleryManager images={data.images} onChange={(imgs) => update("images", imgs)} />
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

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-[200px_1fr] md:items-center">
      <label className="text-sm">{label}</label>
      <div>{children}</div>
    </div>
  );
}
