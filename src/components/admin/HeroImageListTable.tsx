import Link from "next/link";

type HeroImageRow = {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
  status: "draft" | "published";
};

export function HeroImageListTable({ rows }: { rows: HeroImageRow[] }) {
  if (rows.length === 0) {
    return (
      <div
        className="rounded-[var(--radius-md)] border p-6 text-center text-sm"
        style={{
          borderColor: "var(--border-subtle)",
          background: "var(--bianco)",
          color: "var(--fg-3)",
        }}
      >
        Aún no hay imágenes. Crea la primera con “+ Nueva imagen”.
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-[var(--radius-md)] border"
      style={{ borderColor: "var(--border-subtle)", background: "var(--bianco)" }}
    >
      <table className="w-full text-sm">
        <thead style={{ background: "var(--bg-page)" }}>
          <tr className="text-left">
            <th className="px-4 py-3 font-medium">Vista previa</th>
            <th className="px-4 py-3 font-medium">Alt</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium">Orden</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
              <td className="px-4 py-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.url}
                  alt={r.altText ?? ""}
                  className="h-12 w-20 rounded object-cover"
                  style={{
                    border: "1px solid var(--border-subtle)",
                  }}
                />
              </td>
              <td className="px-4 py-3" style={{ color: "var(--fg-2)" }}>
                {r.altText ?? <span style={{ color: "var(--fg-3)" }}>—</span>}
              </td>
              <td className="px-4 py-3">
                <span
                  className="rounded px-2 py-1 text-xs"
                  style={{
                    background: r.status === "published" ? "var(--bosco-100)" : "var(--bg-page)",
                    color: r.status === "published" ? "var(--bosco-700)" : "var(--fg-3)",
                  }}
                >
                  {r.status === "published" ? "Publicado" : "Borrador"}
                </span>
              </td>
              <td className="px-4 py-3 tabular-nums">{r.sortOrder}</td>
              <td className="px-4 py-3 text-right">
                <Link href={`/admin/hero-images/${r.id}`} className="underline">
                  Editar
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
