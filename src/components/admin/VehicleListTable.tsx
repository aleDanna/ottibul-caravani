import Link from "next/link";
import Image from "next/image";

type Row = {
  id: string;
  slug: string;
  type: string;
  basePricePerDay: string;
  status: "draft" | "published";
  featured: boolean;
  translations: { locale: string; title: string }[];
  images: { url: string; isCover: boolean }[];
};

export function VehicleListTable({ vehicles }: { vehicles: Row[] }) {
  if (vehicles.length === 0) {
    return (
      <div
        className="rounded-[var(--radius-md)] border p-8 text-center"
        style={{ borderColor: "var(--border-subtle)", color: "var(--fg-3)" }}
      >
        Aún no hay vehículos. Crea el primero con &ldquo;+ Nuevo vehículo&rdquo;.
      </div>
    );
  }
  return (
    <div
      className="overflow-x-auto rounded-[var(--radius-md)] border"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <table className="w-full text-sm">
        <thead style={{ background: "var(--bg-sunken)" }}>
          <tr className="text-left">
            <th className="px-3 py-2"></th>
            <th className="px-3 py-2">Título</th>
            <th className="px-3 py-2">Tipo</th>
            <th className="px-3 py-2">Precio</th>
            <th className="px-3 py-2">Estado</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v) => {
            const titleEs = v.translations.find((t) => t.locale === "es")?.title ?? v.slug;
            const cover = v.images.find((i) => i.isCover) ?? v.images[0];
            return (
              <tr key={v.id} className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
                <td className="w-16 px-3 py-2">
                  {cover && (
                    <div className="relative h-10 w-14 overflow-hidden rounded">
                      <Image
                        src={cover.url}
                        alt={titleEs}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                  )}
                </td>
                <td className="px-3 py-2">{titleEs}</td>
                <td className="px-3 py-2">{v.type}</td>
                <td className="px-3 py-2">{v.basePricePerDay} €</td>
                <td className="px-3 py-2">
                  <span
                    style={{
                      color: v.status === "published" ? "var(--bosco-700)" : "var(--fg-3)",
                    }}
                  >
                    {v.status}
                  </span>
                  {v.featured && (
                    <span className="ml-1" aria-label="featured">
                      ★
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <Link href={`/admin/vehicles/${v.id}`} className="underline">
                    Editar
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
