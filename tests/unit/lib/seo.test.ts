import { describe, it, expect, beforeEach, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };
beforeEach(() => {
  vi.resetModules();
  process.env = { ...ORIGINAL_ENV, NEXT_PUBLIC_SITE_URL: "https://ottibull.com" };
});

describe("seo helpers", () => {
  it("siteBaseUrl returns NEXT_PUBLIC_SITE_URL when set", async () => {
    const { siteBaseUrl } = await import("@/lib/seo");
    expect(siteBaseUrl()).toBe("https://ottibull.com");
  });

  it("siteBaseUrl falls back to localhost:3000 when env missing", async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    const { siteBaseUrl } = await import("@/lib/seo");
    expect(siteBaseUrl()).toBe("http://localhost:3000");
  });

  it("breadcrumbJsonLd returns BreadcrumbList with positioned items", async () => {
    const { breadcrumbJsonLd } = await import("@/lib/seo");
    const ld = breadcrumbJsonLd([
      { name: "Inicio", url: "https://ottibull.com/es" },
      { name: "Catálogo", url: "https://ottibull.com/es/catalog" },
      { name: "Camper X", url: "https://ottibull.com/es/vehicles/camper-x" },
    ]);
    const items = ld.itemListElement as Record<string, unknown>[];
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("BreadcrumbList");
    expect(items).toHaveLength(3);
    expect(items[0]).toEqual({
      "@type": "ListItem",
      position: 1,
      name: "Inicio",
      item: "https://ottibull.com/es",
    });
    expect(items[2].position).toBe(3);
  });

  it("faqJsonLd returns FAQPage with each Q/A as Question + Answer", async () => {
    const { faqJsonLd } = await import("@/lib/seo");
    const ld = faqJsonLd([
      { question: "¿Cuánto cuesta?", answer: "Desde 80 €/día." },
      { question: "¿Seguro incluido?", answer: "Sí, a todo riesgo." },
    ]);
    const entities = ld.mainEntity as Record<string, unknown>[];
    expect(ld["@type"]).toBe("FAQPage");
    expect(entities).toHaveLength(2);
    expect(entities[0]).toEqual({
      "@type": "Question",
      name: "¿Cuánto cuesta?",
      acceptedAnswer: { "@type": "Answer", text: "Desde 80 €/día." },
    });
  });

  it("itemListJsonLd returns ItemList with positioned entries", async () => {
    const { itemListJsonLd } = await import("@/lib/seo");
    const ld = itemListJsonLd([
      { name: "Camper A", url: "https://ottibull.com/es/vehicles/a", image: "https://x/a.jpg" },
      { name: "Camper B", url: "https://ottibull.com/es/vehicles/b" },
    ]);
    const items = ld.itemListElement as Record<string, unknown>[];
    expect(ld["@type"]).toBe("ItemList");
    expect(items[0]).toEqual({
      "@type": "ListItem",
      position: 1,
      name: "Camper A",
      url: "https://ottibull.com/es/vehicles/a",
      image: "https://x/a.jpg",
    });
    expect(items[1]).not.toHaveProperty("image");
  });

  it("organizationJsonLd carries @id, areaServed, geo and priceRange", async () => {
    const { organizationJsonLd } = await import("@/lib/seo");
    const ld = organizationJsonLd();
    expect(ld["@id"]).toBe("https://ottibull.com/#organization");
    expect(ld.areaServed).toEqual({ "@type": "Country", name: "Spain" });
    expect(ld.priceRange).toBe("€€");
    expect(ld.geo).toEqual({
      "@type": "GeoCoordinates",
      latitude: 41.3826,
      longitude: 2.1429,
    });
    expect(ld.image).toBe("https://ottibull.com/logo-ottibull.svg");
  });
});
