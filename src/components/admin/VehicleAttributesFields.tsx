"use client";

import type { VehicleType } from "@/lib/vehicle-attributes";
import { NumberInput } from "./NumberInput";

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
};

function asNumber(v: unknown): number | null {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string" && v !== "") {
    const n = Number(v);
    if (!Number.isNaN(n)) return n;
  }
  return null;
}

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
      {fields.map((f) => {
        if (f.type === "checkbox") {
          const checked = Boolean(attributes[f.key]);
          return (
            <label
              key={f.key}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-sm)] border p-3 transition-colors hover:bg-[var(--bg-sunken)]"
              style={{
                borderColor: checked ? "var(--brand)" : "var(--border-default)",
                background: checked ? "var(--brand-soft)" : "transparent",
              }}
            >
              <span className="text-sm font-medium" style={{ color: "var(--fg-1)" }}>
                {f.label}
              </span>
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => set(f.key, e.target.checked)}
                className="h-5 w-5 cursor-pointer"
                style={{ accentColor: "var(--brand)" }}
              />
            </label>
          );
        }
        return (
          <div key={f.key} className="grid grid-cols-[200px_1fr] items-center gap-2">
            <label className="text-sm">{f.label}</label>
            {f.type === "select" ? (
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
            ) : f.type === "number" ? (
              <NumberInput
                value={asNumber(attributes[f.key])}
                onChange={(n) => set(f.key, n ?? "")}
                className="rounded-[var(--radius-sm)] border p-2 text-sm"
                style={{ borderColor: "var(--border-default)" }}
              />
            ) : (
              <input
                type="text"
                value={String(attributes[f.key] ?? "")}
                onChange={(e) => set(f.key, e.target.value)}
                className="rounded-[var(--radius-sm)] border p-2 text-sm"
                style={{ borderColor: "var(--border-default)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
