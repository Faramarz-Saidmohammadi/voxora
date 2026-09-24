import { expect, test } from "@playwright/test";

test("presents the product and architecture clearly", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /voice infrastructure/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /open workspace/i }),
  ).toBeVisible();
  await expect(page.getByText(/tenant isolation/i).first()).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
});

test("keeps the dashboard usable on mobile", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(
    page.getByRole("heading", { name: /good morning/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /play voice preview/i }),
  ).toBeVisible();
  await expect(page.getByText(/usage this month/i)).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
});
