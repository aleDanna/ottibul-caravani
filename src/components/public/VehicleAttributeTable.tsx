import {
  vehicleAttributesSchemas,
  type VehicleType,
} from "@/lib/vehicle-attributes";
import type { Locale } from "@/i18n/routing";

const ATTR_LABELS: Record<Locale, Record<string, string>> = {
  es: {
    berths: "Plazas para dormir",
    travelSeats: "Plazas de viaje",
    lengthM: "Longitud (m)",
    year: "Año",
    transmission: "Transmisión",
    licenseRequired: "Permiso requerido",
    hasKitchen: "Cocina",
    hasBathroom: "Baño",
    displacementCc: "Cilindrada (cc)",
    helmetIncluded: "Casco incluido",
    seats: "Plazas",
    type: "Tipo",
    gears: "Marchas",
    capacity: "Capacidad",
  },
  ca: {
    berths: "Places per dormir",
    travelSeats: "Places de viatge",
    lengthM: "Longitud (m)",
    year: "Any",
    transmission: "Transmissió",
    licenseRequired: "Permís requerit",
    hasKitchen: "Cuina",
    hasBathroom: "Bany",
    displacementCc: "Cilindrada (cc)",
    helmetIncluded: "Casc inclòs",
    seats: "Places",
    type: "Tipus",
    gears: "Marxes",
    capacity: "Capacitat",
  },
  en: {
    berths: "Sleeping berths",
    travelSeats: "Travel seats",
    lengthM: "Length (m)",
    year: "Year",
    transmission: "Transmission",
    licenseRequired: "License required",
    hasKitchen: "Kitchen",
    hasBathroom: "Bathroom",
    displacementCc: "Displacement (cc)",
    helmetIncluded: "Helmet included",
    seats: "Seats",
    type: "Type",
    gears: "Gears",
    capacity: "Capacity",
  },
};

export function VehicleAttributeTable({
  type,
  attributes,
  locale,
}: {
  type: VehicleType;
  attributes: Record<string, unknown>;
  locale: Locale;
}) {
  const schema = vehicleAttributesSchemas[type];
  const shape = (schema as unknown as { shape?: Record<string, unknown> })
    .shape;
  const keys = shape ? Object.keys(shape) : [];
  const labels = ATTR_LABELS[locale];

  const rows = keys.filter(
    (k) => attributes[k] !== undefined && attributes[k] !== null,
  );
  if (rows.length === 0) return null;

  return (
    <div className="mt-8">
      <h2
        className="mb-4 text-2xl"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Características técnicas
      </h2>
      <table className="w-full border-collapse">
        <tbody>
          {rows.map((k) => {
            const v = attributes[k];
            const display =
              typeof v === "boolean" ? (v ? "✓" : "✗") : String(v);
            return (
              <tr
                key={k}
                className="border-b"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <th
                  className="py-3 pr-4 text-left text-sm font-medium"
                  style={{ color: "var(--fg-3)" }}
                >
                  {labels[k] ?? k}
                </th>
                <td className="py-3 text-sm">{display}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
