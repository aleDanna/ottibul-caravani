import { test, expect, type APIRequestContext } from "@playwright/test";

test.use({
  viewport: { width: 1280, height: 800 },
  locale: "es-ES",
});

// Run all tests in this file serially within one worker to avoid
// triggering Next.js Turbopack dev-mode cold-start race conditions
// when multiple routes are compiled simultaneously.
test.describe.configure({ mode: "serial" });

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

/**
 * Fetch a page with retries to handle Next.js dev-mode cold-start
 * where the first request while the route is being compiled may
 * return an incomplete response.
 */
async function fetchWithRetry(
  request: APIRequestContext,
  path: string,
  maxAttempts = 4,
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const res = await request.get(path);
    const html = await res.text();
    // A good response is at least 10 KB and contains schema.org
    if (html.length > 10_000 && html.includes("schema.org")) {
      return html;
    }
    if (attempt < maxAttempts - 1) {
      await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
    }
  }
  // Return last attempt regardless
  return (await request.get(path)).text();
}

test("home emits LocalBusiness", async ({ request }) => {
  const html = await fetchWithRetry(request, "/es");
  const types = await getJsonLdTypes(html);
  expect(types).toContain("LocalBusiness");
});

test("catalog emits ItemList + BreadcrumbList", async ({ request }) => {
  const html = await fetchWithRetry(request, "/es/catalog");
  const types = await getJsonLdTypes(html);
  expect(types).toEqual(expect.arrayContaining(["BreadcrumbList", "ItemList"]));
});

test("faq emits FAQPage + BreadcrumbList (with seeded FAQs)", async ({ request }) => {
  const html = await fetchWithRetry(request, "/es/faq");
  const types = await getJsonLdTypes(html);
  expect(types).toEqual(expect.arrayContaining(["BreadcrumbList", "FAQPage"]));
});

test("about emits BreadcrumbList", async ({ request }) => {
  const html = await fetchWithRetry(request, "/es/about");
  const types = await getJsonLdTypes(html);
  expect(types).toContain("BreadcrumbList");
});

test("vehicle page emits Product + BreadcrumbList", async ({ request }) => {
  const sitemapHtml = await fetchWithRetry(request, "/sitemap.xml");
  const m = sitemapHtml.match(/<loc>([^<]+\/es\/vehicles\/[^<]+)<\/loc>/);
  if (!m) test.skip(true, "No published vehicles in test DB");
  const pathname = new URL(m![1]).pathname;
  const html = await fetchWithRetry(request, pathname);
  const types = await getJsonLdTypes(html);
  expect(types).toEqual(expect.arrayContaining(["Product", "BreadcrumbList"]));
});

test.describe("cookie consent", () => {
  test("banner appears, accepting persists", async ({ page, context }) => {
    await context.clearCookies();
    await page.goto("/es");

    const banner = page.getByRole("dialog", { name: /utilizamos cookies/i });
    await expect(banner).toBeVisible();

    await page.getByRole("button", { name: "Aceptar" }).click();
    await expect(banner).toBeHidden();

    const stored = await page.evaluate(() =>
      localStorage.getItem("ottibull-cookie-consent-v1"),
    );
    expect(stored).toBe("granted");

    await page.reload();
    await expect(banner).toBeHidden();
  });

  test("rejecting hides the banner and persists denial", async ({ page, context }) => {
    await context.clearCookies();
    await page.goto("/es");
    const banner = page.getByRole("dialog", { name: /utilizamos cookies/i });
    await expect(banner).toBeVisible();
    await page.getByRole("button", { name: "Rechazar" }).click();
    await expect(banner).toBeHidden();
    const stored = await page.evaluate(() =>
      localStorage.getItem("ottibull-cookie-consent-v1"),
    );
    expect(stored).toBe("denied");
  });
});
