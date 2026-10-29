const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
  // Freeze the date near midnight in Nairobi; the browser uses a different timezone.
  await page.clock.setFixedTime(new Date("2026-10-29T22:30:00Z"));
  await page.addInitScript(() => {
    window.whatsAppUrls = [];
    window.open = (url) => { window.whatsAppUrls.push(url); };
  });
  // External fonts are not needed for these tests, and may be unavailable in CI.
  await page.route("https://fonts.googleapis.com/**", (route) => route.abort());
  await page.goto("/");
});

async function choose(page, trigger, option) {
  await page.locator(trigger).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

async function whatsAppMessage(page, index = 0) {
  const url = await page.evaluate((i) => window.whatsAppUrls[i], index);
  return new URL(url).searchParams.get("text");
}

test("styled dropdowns support keyboard, grouping and fee updates", async ({ page }) => {
  const type = page.locator("#tType-trigger");
  await expect(page.locator("#tType option", { hasText: "Shared House" })).toHaveCount(0);
  await type.focus();
  await page.keyboard.press("ArrowDown");
  await expect(type).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page.locator("#tType")).toHaveValue("Studio");
  await expect(page.locator("#feeAmount")).toHaveText("KSh 2,000");

  await choose(page, "#tType-trigger", "2 Bedroom");
  await expect(page.locator("#feeAmount")).toHaveText("KSh 3,000");
  await page.locator("#tLocation-trigger").click();
  await expect(page.getByRole("group", { name: "Kasarani" })).toBeVisible();
  await expect(page.getByRole("group", { name: "Roysambu" })).toBeAttached();
  await page.getByRole("option", { name: "Zimmerman", exact: true }).click();
  await expect(page.locator("#tLocation")).toHaveValue("Zimmerman");
  await page.locator("#tLocation-trigger").click();
  await page.keyboard.press("Escape");
  await expect(page.locator("#tLocation-trigger")).toHaveAttribute("aria-expanded", "false");
});

test("required dropdown errors focus and clear on the visible control", async ({ page }) => {
  await page.locator("#tName").fill("Jane Wanjiku");
  await page.locator("#tPhone").fill("0712345678");
  await page.locator("#tenantForm button[type=submit]").click();
  await expect(page.locator("#tType-trigger")).toBeFocused();
  await expect(page.locator("#tType-trigger")).toHaveAttribute("aria-invalid", "true");
  await choose(page, "#tType-trigger", "Bedsitter");
  await expect(page.locator("#tType-trigger")).not.toHaveAttribute("aria-invalid", "true");
});

test("viewing dates show the notice and reject dates before the Nairobi minimum", async ({ page }) => {
  await expect(page.locator("#tViewDateHint")).toContainText("at least 48 hours");
  await expect(page.locator("#tViewDate")).toHaveAttribute("min", "2026-11-01");
  await page.locator("#tName").fill("Jane Wanjiku");
  await page.locator("#tPhone").fill("0712345678");
  await choose(page, "#tType-trigger", "2 Bedroom");
  await choose(page, "#tLocation-trigger", "Zimmerman");
  await page.locator("#tBudgetMin").fill("8555");
  await page.locator("#tViewDate").fill("2026-10-31");
  await page.locator("#tenantForm button[type=submit]").click();
  await expect(page.locator("#tViewDate")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#tViewDateError")).toContainText("48 hours");
  expect(await page.evaluate(() => window.whatsAppUrls.length)).toBe(0);

  await page.locator("#tViewDate").fill("2026-11-01");
  await expect(page.locator("#tViewDateError")).toBeHidden();
  await page.locator("#tenantForm button[type=submit]").click();
  const message = await whatsAppMessage(page);
  expect(message).toContain("2 Bedroom");
  expect(message).toContain("Zimmerman");
  expect(message).toContain("KSh 3,000");
  expect(message).toContain("KSh 8,555");
  expect(message).toContain("1 Nov 2026");

  // A tab left open overnight must recompute the minimum before submitting.
  await page.clock.setFixedTime(new Date("2026-10-30T22:30:00Z"));
  await page.locator("#tenantForm button[type=submit]").click();
  await expect(page.locator("#tViewDate")).toHaveAttribute("min", "2026-11-02");
  expect(await page.evaluate(() => window.whatsAppUrls.length)).toBe(1);
});

test("landlords can submit multiple types and positive whole-number counts", async ({ page }) => {
  await page.locator("#lName").fill("Peter Otieno");
  await page.locator("#lPhone").fill("0722000111");
  await choose(page, "#lLocation-trigger", "Roysambu");
  await page.locator("#lRent").fill("KSh 7,000 – 15,000");
  await page.locator("#landlordForm button[type=submit]").click();
  await expect(page.locator("#lUnitError")).toContainText("Select at least one");
  expect(await page.evaluate(() => window.whatsAppUrls.length)).toBe(0);

  const bedsitters = page.getByRole("checkbox", { name: "Bedsitters" });
  await bedsitters.check();
  await page.locator("#landlordForm button[type=submit]").click();
  await expect(page.locator("#lUnitError")).toContainText("whole number");
  for (const invalid of ["0", "1.5"]) {
    await page.locator("#lCount-bedsitters").fill(invalid);
    await page.locator("#landlordForm button[type=submit]").click();
    expect(await page.evaluate(() => window.whatsAppUrls.length)).toBe(0);
  }

  await page.locator("#lCount-bedsitters").fill("3");
  await page.getByRole("checkbox", { name: "1 Bedroom", exact: true }).check();
  await page.locator("#lCount-oneBedroom").fill("2");
  await expect(page.locator("#lUnitSummary")).toHaveText("5 vacant units across 2 types.");
  await page.locator("#landlordForm button[type=submit]").click();
  const message = await whatsAppMessage(page);
  expect(message).toContain("Bedsitters: 3");
  expect(message).toContain("1 Bedroom: 2");
  expect(message).toContain("Vacant units now:* 5");

  await bedsitters.uncheck();
  await expect(page.locator("#lCount-bedsitters")).toBeDisabled();
  await page.locator("#landlordForm button[type=submit]").click();
  const updatedMessage = await whatsAppMessage(page, 1);
  expect(updatedMessage).not.toContain("Bedsitters");
  expect(updatedMessage).toContain("Vacant units now:* 2");

  await page.evaluate(() => document.querySelector("#landlordForm").reset());
  await expect(page.getByRole("checkbox", { name: "1 Bedroom", exact: true })).not.toBeChecked();
  await expect(page.locator("#lCount-oneBedroom")).toBeDisabled();
  await expect(page.locator("#lUnitSummary")).toHaveText("No vacant units selected yet.");
});

test("contact dropdown retains its selected value in WhatsApp", async ({ page }) => {
  await page.locator("#cName").fill("Mary Achieng");
  await choose(page, "#cSubject-trigger", "Just asking a question");
  await page.locator("#cMsg").fill("Hello there");
  await page.locator("#contactForm button[type=submit]").click();
  expect(await whatsAppMessage(page)).toContain("Just asking a question");
});
