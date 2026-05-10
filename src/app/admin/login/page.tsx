import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Login · Otti Bull",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const session = await auth();
  if (session?.user) redirect(sp.next ?? "/admin");

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="mb-4 text-2xl">Admin Login</h1>
      <LoginForm next={sp.next} />
    </main>
  );
}
