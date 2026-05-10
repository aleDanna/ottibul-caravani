import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("home");
  const tBrand = useTranslations("common");

  return (
    <div className="mx-auto max-w-[1280px] px-5 py-16 md:px-8 md:py-24">
      <p
        className="mb-6 text-xs font-semibold uppercase"
        style={{
          letterSpacing: "var(--tracking-caps)",
          color: "var(--fg-3)",
        }}
      >
        {tBrand("brand")}
      </p>
      <h1 className="text-5xl md:text-6xl">{t("heroTitle")}</h1>
      <p className="mt-6 max-w-xl text-lg" style={{ color: "var(--fg-2)" }}>
        {t("heroSubtitle")}
      </p>
    </div>
  );
}
