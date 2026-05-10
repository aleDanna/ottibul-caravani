import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = {
  title: "Admin Login · Otti Bull",
  robots: { index: false, follow: false },
};

export default function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="mb-4 text-2xl">Admin Login</h1>
      <AsyncLogin searchParams={searchParams} />
    </main>
  );
}

async function AsyncLogin({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const sp = await searchParams;
  return <LoginForm next={sp.next} />;
}
