"use client";

import { usePathname, useRouter } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";

export function LanguageSwitcher({
  currentLocale,
}: {
  currentLocale: Locale;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const switchTo = (locale: Locale) => {
    const segments = pathname.split("/");
    if (
      segments[1] &&
      (routing.locales as readonly string[]).includes(segments[1])
    ) {
      segments[1] = locale;
    } else {
      segments.splice(1, 0, locale);
    }
    router.push(segments.join("/") || `/${locale}`);
  };
  return (
    <div
      className="flex items-center gap-1 text-xs font-semibold uppercase"
      style={{
        letterSpacing: "var(--tracking-caps)",
        color: "var(--fg-3)",
      }}
    >
      {routing.locales.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span className="text-[var(--border-default)]">/</span>}
          <button
            onClick={() => switchTo(l)}
            aria-current={l === currentLocale}
            className={
              l === currentLocale
                ? "font-bold text-[var(--fg-1)]"
                : "hover:text-[var(--fg-1)]"
            }
          >
            {l.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}
