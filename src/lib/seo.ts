import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function pathWithoutLocale(path: string): string {
  return path.replace(/^\/[a-z]{2}(?=\/|$)/, "");
}

export function localeAlternates(currentLocalePath: string): Metadata["alternates"] {
  const tail = pathWithoutLocale(currentLocalePath);
  return {
    canonical: `${BASE}${currentLocalePath}`,
    languages: {
      ...Object.fromEntries(routing.locales.map((l) => [l, `${BASE}/${l}${tail}`])),
      "x-default": `${BASE}/${routing.defaultLocale}${tail}`,
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Otti Bull",
    legalName: "Otti Bull SL",
    url: BASE,
    logo: `${BASE}/logo-ottibull.svg`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "C/ L'Alfambra, 14, P.4 Pta.2",
      addressLocality: "Barcelona",
      postalCode: "08034",
      addressCountry: "ES",
    },
    email: process.env.OWNER_EMAIL ?? "info@ottibull.com",
    telephone: "+34 691 82 02 42",
    sameAs: [],
  };
}
