import Link from "next/link";

type Row = {
  id: string;
  status: "draft" | "published";
  sortOrder: number;
  updatedAt: Date;
  translations: { locale: string; question: string }[];
};

export function FaqListTable({ rows }: { rows: Row[] }) {
  if (rows.length === 0) {
    return (
      <div
        className="rounded-[var(--radius-md)] border p-8 text-center"
        style={{ borderColor: "var(--border-subtle)", color: "var(--fg-3)" }}
      >
        Aún no hay FAQs. Crea la primera con &ldquo;+ Nueva FAQ&rdquo;.
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
            <th className="px-3 py-2">Pregunta (es)</th>
            <th className="px-3 py-2">Estado</th>
            <th className="px-3 py-2">Orden</th>
            <th className="px-3 py-2">Actualizado</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const qEs = r.translations.find((t) => t.locale === "es")?.question ?? "—";
            return (
              <tr key={r.id} className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
                <td className="px-3 py-2">{qEs}</td>
                <td className="px-3 py-2">
                  <span
                    style={{
                      color: r.status === "published" ? "var(--bosco-700)" : "var(--fg-3)",
                    }}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-3 py-2">{r.sortOrder}</td>
                <td className="px-3 py-2" style={{ color: "var(--fg-3)" }}>
                  {new Date(r.updatedAt).toLocaleDateString("es-ES")}
                </td>
                <td className="px-3 py-2">
                  <Link href={`/admin/faqs/${r.id}`} className="underline">
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
