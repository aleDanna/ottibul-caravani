import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { verifyPayload } from "@/lib/hmac";
import { WhatsAppButton } from "@/components/public/WhatsAppButton";
import { Container } from "@/components/public/Container";

export const dynamic = "force-dynamic";

export const metadata = { robots: { index: false, follow: false } };

export default async function ThankYou({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ w?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "thankYou" });

  let waUrl: string | null = null;
  if (sp.w) {
    const result = verifyPayload<{ url: string }>(decodeURIComponent(sp.w));
    if (result.valid) waUrl = result.payload.url;
  }

  return (
    <Container>
      <div className="mx-auto max-w-xl py-16 text-center">
        <h1 className="text-3xl md:text-4xl">{t("title")}</h1>
        <p className="my-6" style={{ color: "var(--fg-2)" }}>
          {t("body")}
        </p>
        {waUrl && <WhatsAppButton href={waUrl} label={t("whatsapp")} />}
        <div className="mt-8">
          <Link href={`/${locale}/catalog`} className="underline" style={{ color: "var(--fg-2)" }}>
            {t("back")}
          </Link>
        </div>
      </div>
    </Container>
  );
}
