"use client";

import type { VehicleType } from "@/lib/vehicle-attributes";

type FieldDef =
  | { key: string; label: string; type: "number" | "text" | "checkbox" }
  | { key: string; label: string; type: "select"; options: string[] };

const FIELDS: Record<VehicleType, FieldDef[]> = {
  camper: [
    { key: "berths", label: "Plazas para dormir", type: "number" },
    { key: "travelSeats", label: "Plazas de viaje", type: "number" },
    { key: "lengthM", label: "Longitud (m)", type: "number" },
    { key: "year", label: "Año", type: "number" },
    {
      key: "transmission",
      label: "Transmisión",
      type: "select",
      options: ["manual", "automatic"],
    },
    { key: "licenseRequired", label: "Permiso", type: "select", options: ["B", "C1", "C"] },
    { key: "hasKitchen", label: "Cocina", type: "checkbox" },
    { key: "hasBathroom", label: "Baño", type: "checkbox" },
  ],
  motorcycle: [
    { key: "displacementCc", label: "Cilindrada (cc)", type: "number" },
    { key: "year", label: "Año", type: "number" },
    {
      key: "licenseRequired",
      label: "Permiso",
      type: "select",
      options: ["AM", "A1", "A2", "A"],
    },
    { key: "helmetIncluded", label: "Casco incluido", type: "checkbox" },
  ],
  car: [
    { key: "seats", label: "Plazas", type: "number" },
    { key: "year", label: "Año", type: "number" },
    {
      key: "transmission",
      label: "Transmisión",
      type: "select",
      options: ["manual", "automatic"],
    },
  ],
  bicycle: [
    { key: "type", label: "Tipo", type: "select", options: ["mtb", "road", "city", "electric"] },
    { key: "gears", label: "Marchas", type: "number" },
  ],
  boat: [
    { key: "lengthM", label: "Longitud (m)", type: "number" },
    { key: "year", label: "Año", type: "number" },
    { key: "capacity", label: "Capacidad", type: "number" },
  ],
};

export function VehicleAttributesFields({
  type,
  attributes,
  onChange,
}: {
  type: VehicleType;
  attributes: Record<string, unknown>;
  onChange: (a: Record<string, unknown>) => void;
}) {
  const fields = FIELDS[type];
  function set(k: string, v: unknown) {
    onChange({ ...attributes, [k]: v });
  }
  return (
    <div className="space-y-2">
      {fields.map((f) => (
        <div key={f.key} className="grid grid-cols-[200px_1fr] items-center gap-2">
          <label className="text-sm">{f.label}</label>
          {f.type === "checkbox" ? (
            <input
              type="checkbox"
              checked={Boolean(attributes[f.key])}
              onChange={(e) => set(f.key, e.target.checked)}
            />
          ) : f.type === "select" ? (
            <select
              value={String(attributes[f.key] ?? "")}
              onChange={(e) => set(f.key, e.target.value)}
              className="rounded-[var(--radius-sm)] border p-2 text-sm"
              style={{ borderColor: "var(--border-default)" }}
            >
              <option value="">—</option>
              {f.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={f.type}
              value={String(attributes[f.key] ?? "")}
              onChange={(e) =>
                set(
                  f.key,
                  f.type === "number"
                    ? e.target.value === ""
                      ? ""
                      : Number(e.target.value)
                    : e.target.value,
                )
              }
              className="rounded-[var(--radius-sm)] border p-2 text-sm"
              style={{ borderColor: "var(--border-default)" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
