import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { Logo } from "./Logo";

export function Footer({ locale }: { locale: Locale }) {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tBrand = useTranslations("common");

  const groups = [
    {
      title: t("groupRental"),
      items: [
        { href: `/${locale}`, label: tNav("home") },
        { href: `/${locale}/catalog`, label: tNav("catalog") },
        { href: `/${locale}/about`, label: tNav("about") },
      ],
    },
    {
      title: t("groupHelp"),
      items: [
        { href: `/${locale}/faq`, label: tNav("faq") },
        { href: `/${locale}/useful-links`, label: tNav("usefulLinks") },
      ],
    },
    {
      title: t("groupCompany"),
      items: [
        { href: `/${locale}/privacy`, label: t("privacy") },
        { href: `/${locale}/terms`, label: t("terms") },
        { href: `/${locale}/cookies`, label: t("cookies") },
      ],
    },
  ];

  return (
    <footer
      className="mt-24 px-6 py-14 md:px-8 md:py-20"
      style={{ background: "var(--bosco-900)", color: "var(--fg-on-dark)" }}
    >
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-10 md:grid-cols-4 md:gap-16">
        <div className="col-span-2 md:col-span-1">
          <Logo variant="light" className="h-12 w-auto mb-4" />
          <p
            className="text-sm"
            style={{ color: "rgba(251, 248, 241, 0.75)" }}
          >
            {tBrand("tagline")}
          </p>
        </div>
        {groups.map((g) => (
          <div key={g.title}>
            <h4
              className="mb-4 text-xs font-semibold uppercase"
              style={{
                letterSpacing: "var(--tracking-caps)",
                color: "rgba(251, 248, 241, 0.6)",
              }}
            >
              {g.title}
            </h4>
            <ul className="space-y-2 text-sm">
              {g.items.map((it) => (
                <li key={it.href}>
                  <Link href={it.href} className="hover:underline">
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div
        className="mx-auto mt-12 max-w-[1280px] border-t pt-6 text-sm md:flex md:items-center md:justify-between"
        style={{
          borderColor: "rgba(255, 255, 255, 0.1)",
          color: "rgba(251, 248, 241, 0.6)",
        }}
      >
        <p>
          © {new Date().getFullYear()} {tBrand("brand")}. {t("rights")}
        </p>
      </div>
    </footer>
  );
}
