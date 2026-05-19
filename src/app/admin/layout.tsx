import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import "../globals.css";

export const metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-[var(--bg-page)] text-[var(--fg-1)]" suppressHydrationWarning>
        {session?.user && <AdminNav user={{ email: session.user.email ?? "" }} />}
        <main className="mx-auto max-w-[1280px] px-5 py-6 md:px-8 md:py-8">{children}</main>
      </body>
    </html>
  );
}
