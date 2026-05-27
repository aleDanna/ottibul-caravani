import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

export function siteBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

const BASE = siteBaseUrl();

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

export type JsonLd = Record<string, unknown>;

export function organizationJsonLd(): JsonLd {
  const base = siteBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${base}/#organization`,
    name: "Otti Bull",
    legalName: "Otti Bull SL",
    url: base,
    logo: `${base}/logo-ottibull.svg`,
    image: `${base}/logo-ottibull.svg`,
    priceRange: "€€",
    address: {
      "@type": "PostalAddress",
      streetAddress: "C/ L'Alfambra, 14, P.4 Pta.2",
      addressLocality: "Barcelona",
      postalCode: "08034",
      addressCountry: "ES",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 41.3826,
      longitude: 2.1429,
    },
    areaServed: { "@type": "Country", name: "Spain" },
    email: process.env.OWNER_EMAIL ?? "info@ottibull.com",
    telephone: "+34 691 82 02 42",
    sameAs: [],
  };
}

export function breadcrumbJsonLd(
  items: { name: string; url: string }[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqJsonLd(
  faqs: { question: string; answer: string }[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function itemListJsonLd(
  items: { name: string; url: string; image?: string }[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, i) => {
      const entry: JsonLd = {
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        url: item.url,
      };
      if (item.image) entry.image = item.image;
      return entry;
    }),
  };
}
