import { test, expect } from "@playwright/test";

test.use({
  viewport: { width: 1280, height: 800 },
  locale: "es-ES",
  extraHTTPHeaders: { "Accept-Language": "es-ES,es;q=0.9" },
});

test("redirects root to /es", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/es$/);
});

test("home renders Otti Bull brand", async ({ page }) => {
  await page.goto("/es");
  await expect(page.getByRole("link", { name: "Otti Bull" }).first()).toBeVisible();
});

test("catalog page renders with empty state when no vehicles", async ({ page }) => {
  await page.goto("/es/catalog");
  await expect(page.getByRole("heading", { name: "Nuestra flota" })).toBeVisible();
});

test("about page renders", async ({ page }) => {
  await page.goto("/es/about");
  await expect(page.locator("h1")).toBeVisible();
});

test("useful-links page renders", async ({ page }) => {
  await page.goto("/es/useful-links");
  await expect(page.locator("h1")).toContainText(/Enlaces de Interés/i);
});

test("faq page renders the seeded entries", async ({ page }) => {
  await page.goto("/es/faq");
  // 9 FAQs were seeded in Task 11.5
  await expect(page.getByRole("button", { name: /requisitos/i })).toBeVisible();
});

test("language switcher swaps locale", async ({ page }) => {
  await page.goto("/es");
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page).toHaveURL(/\/en$/);
});

test("sitemap.xml is served", async ({ request }) => {
  const r = await request.get("/sitemap.xml");
  expect(r.status()).toBe(200);
  const text = await r.text();
  expect(text).toContain("<urlset");
  expect(text).toContain("/es/about");
});

test("robots.txt disallows admin", async ({ request }) => {
  const r = await request.get("/robots.txt");
  expect(r.status()).toBe(200);
  expect(await r.text()).toContain("Disallow: /admin/");
});

test("admin without session redirects to login", async ({ page, context }) => {
  await context.clearCookies();
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
});
