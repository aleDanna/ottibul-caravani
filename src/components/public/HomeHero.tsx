import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { Container } from "./Container";

type Stat = { value: string; label: string };

export type HomeHeroImage = { url: string; altText: string | null };

const stackPositions: { inset: string; rotate: string }[] = [
  { inset: "0 35% 30% 0", rotate: "rotate(-3deg)" },
  { inset: "25% 0 5% 30%", rotate: "rotate(2deg)" },
  { inset: "55% 50% 0 5%", rotate: "rotate(-1deg)" },
];

const gradientBackgrounds = [
  "linear-gradient(135deg, var(--cielo-100), var(--sole-100), var(--crema-100))",
  "linear-gradient(135deg, var(--bosco-100), var(--bosco-50), var(--crema-100))",
  "linear-gradient(135deg, var(--terra-100), var(--sole-100), var(--crema-50))",
];

export function HomeHero({
  locale,
  images = [],
}: {
  locale: Locale;
  images?: HomeHeroImage[];
}) {
  const t = useTranslations("home");
  const stats = t.raw("stats") as Stat[];
  const photos = images.slice(0, 3);
  const hasPhotos = photos.length > 0;

  return (
    <section
      className="relative overflow-hidden py-16 md:py-24"
      style={{
        background: "var(--bg-page)",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 80% 30%, rgba(242,180,65,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 10% 80%, rgba(95,160,188,0.12) 0%, transparent 60%)",
        }}
      />
      <Container className="relative">
        <div className="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
          <div>
            <p
              className="text-xs font-semibold uppercase"
              style={{ letterSpacing: "var(--tracking-caps)", color: "var(--fg-3)" }}
            >
              {t("heroEyebrow")}
            </p>
            <h1
              className="mt-4 text-5xl leading-[0.98] tracking-tight md:text-7xl"
              style={{ textWrap: "balance" }}
            >
              {t("heroTitle")}
            </h1>
            <p
              className="mt-6 max-w-xl text-lg leading-relaxed"
              style={{ color: "var(--fg-2)" }}
            >
              {t("heroSubtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/${locale}/catalog`}
                className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] px-6 py-3.5 text-base font-semibold transition-colors"
                style={{
                  background: "var(--brand)",
                  color: "var(--fg-on-dark)",
                }}
              >
                {t("heroPrimaryCta")}
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border px-6 py-3.5 text-base font-semibold transition-colors"
                style={{
                  borderColor: "var(--border-default)",
                  color: "var(--fg-1)",
                }}
              >
                {t("heroSecondaryCta")}
              </a>
            </div>
            <div className="mt-12 flex flex-wrap gap-8">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col gap-1">
                  <span
                    className="text-4xl leading-none md:text-5xl"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {s.value}
                  </span>
                  <span className="text-sm" style={{ color: "var(--fg-3)" }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="relative aspect-[4/5]">
              {hasPhotos
                ? photos.map((photo, i) => {
                    const pos = stackPositions[i] ?? stackPositions[0];
                    return (
                      <div
                        key={`${photo.url}-${i}`}
                        className="absolute overflow-hidden rounded-[var(--radius-xl)]"
                        style={{
                          inset: pos.inset,
                          boxShadow: "var(--shadow-lg)",
                          transform: pos.rotate,
                        }}
                      >
                        <Image
                          src={photo.url}
                          alt={photo.altText ?? ""}
                          fill
                          priority={i === 0}
                          fetchPriority={i === 0 ? "high" : "auto"}
                          sizes="(min-width: 768px) 40vw, 0px"
                          className="object-cover"
                        />
                      </div>
                    );
                  })
                : stackPositions.map((pos, i) => (
                    <div
                      key={i}
                      className="absolute overflow-hidden rounded-[var(--radius-xl)]"
                      style={{
                        inset: pos.inset,
                        boxShadow: "var(--shadow-lg)",
                        background: gradientBackgrounds[i],
                        transform: pos.rotate,
                      }}
                    />
                  ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
