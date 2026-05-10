import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";

export function Header({ locale }: { locale: Locale }) {
  const t = useTranslations("nav");
  const navItems = [
    { href: `/${locale}`, label: t("home") },
    { href: `/${locale}/catalog`, label: t("catalog") },
    { href: `/${locale}/about`, label: t("about") },
    { href: `/${locale}/useful-links`, label: t("usefulLinks") },
    { href: `/${locale}/faq`, label: t("faq") },
  ];

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{
        background: "rgba(251, 248, 241, 0.85)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 md:px-8">
        <Link
          href={`/${locale}`}
          className="flex items-center"
          aria-label="Otti Bull"
        >
          <Logo variant="color" className="h-[40px] w-auto md:h-[52px]" />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="rounded-md px-3 py-2 text-[17px] transition-colors"
              style={{ color: "var(--fg-2)" }}
            >
              {it.label}
            </Link>
          ))}
          <LanguageSwitcher currentLocale={locale} />
        </nav>
        <div className="md:hidden">
          <MobileMenu items={navItems} currentLocale={locale} />
        </div>
      </div>
    </header>
  );
}
