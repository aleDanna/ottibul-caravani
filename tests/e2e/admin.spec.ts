import { test, expect } from "@playwright/test";

const EMAIL = process.env.TEST_ADMIN_EMAIL ?? "admin@ottibull.com";
const PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? "changemetoo";

test("admin login flow lands on dashboard", async ({ page }) => {
  await page.goto("/admin/login");
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/admin$/, { timeout: 10_000 });
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});

test("admin nav links exist after login", async ({ page }) => {
  await page.goto("/admin/login");
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/admin$/, { timeout: 10_000 });
  const nav = page.getByRole("navigation");
  await expect(nav.getByRole("link", { name: "Vehículos", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "FAQs", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Hero Images", exact: true })).toBeVisible();
});

test("admin hero-images list renders", async ({ page }) => {
  await page.goto("/admin/login");
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin$/, { timeout: 10_000 });
  await page.goto("/admin/hero-images");
  await expect(page.getByRole("heading", { name: "Hero Images" })).toBeVisible();
});
