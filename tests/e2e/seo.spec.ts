import { test, expect } from "@playwright/test";

test.use({
  viewport: { width: 1280, height: 800 },
  locale: "es-ES",
});

async function getJsonLdTypes(html: string): Promise<string[]> {
  const matches = html.matchAll(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
  );
  const types: string[] = [];
  for (const m of matches) {
    try {
      const parsed = JSON.parse(m[1]);
      if (parsed["@type"]) types.push(parsed["@type"]);
    } catch {
      // ignore parse errors
    }
  }
  return types;
}

test("home emits LocalBusiness", async ({ request }) => {
  const res = await request.get("/es");
  const html = await res.text();
  const types = await getJsonLdTypes(html);
  expect(types).toContain("LocalBusiness");
});

test("catalog emits ItemList + BreadcrumbList", async ({ request }) => {
  const res = await request.get("/es/catalog");
  const html = await res.text();
  const types = await getJsonLdTypes(html);
  expect(types).toEqual(expect.arrayContaining(["BreadcrumbList", "ItemList"]));
});

test("faq emits FAQPage + BreadcrumbList (with seeded FAQs)", async ({ request }) => {
  const res = await request.get("/es/faq");
  const html = await res.text();
  const types = await getJsonLdTypes(html);
  expect(types).toEqual(expect.arrayContaining(["BreadcrumbList", "FAQPage"]));
});

test("about emits BreadcrumbList", async ({ request }) => {
  const res = await request.get("/es/about");
  const html = await res.text();
  const types = await getJsonLdTypes(html);
  expect(types).toContain("BreadcrumbList");
});

test("vehicle page emits Product + BreadcrumbList", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  const m = sitemap.match(/<loc>([^<]+\/es\/vehicles\/[^<]+)<\/loc>/);
  if (!m) test.skip(true, "No published vehicles in test DB");
  const res = await request.get(new URL(m![1]).pathname);
  const html = await res.text();
  const types = await getJsonLdTypes(html);
  expect(types).toEqual(expect.arrayContaining(["Product", "BreadcrumbList"]));
});
