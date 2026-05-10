import Link from "next/link";

export function AdminNav({ user }: { user: { email: string } }) {
  return (
    <nav
      className="border-b"
      style={{
        background: "var(--bianco)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-3 md:px-8">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link href="/admin" className="font-semibold">
            Panel
          </Link>
          <Link href="/admin/vehicles" className="text-sm">
            Vehículos
          </Link>
          <Link href="/admin/faqs" className="text-sm">
            FAQs
          </Link>
          <Link href="/admin/hero-images" className="text-sm">
            Imágenes hero
          </Link>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span style={{ color: "var(--fg-3)" }}>{user.email}</span>
          <form action="/admin/logout" method="post">
            <button type="submit" className="underline">
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
