import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Given, Then } = createBdd()

// --- Given steps ---

Given('I navigate to the audience hub page', async ({ page }) => {
  // The GetPageBySlug mock serves the audience-hub fixture for this slug.
  await page.goto('/indian-resources', { waitUntil: 'networkidle' })
})

// --- header band ---

Then('the hub header heading {string} is visible', async ({ page }, heading) => {
  await expect(page.locator('.hub-header h1', { hasText: heading })).toBeVisible()
})

Then('the hub header contains the breadcrumb', async ({ page }) => {
  await expect(page.locator('.hub-header .usa-breadcrumb')).toBeVisible()
})

Then('the hub header intro contains {string}', async ({ page }, text) => {
  await expect(page.locator('.hub-header .hub-intro')).toContainText(text)
})

Then('the hub header spans the full viewport width', async ({ page }) => {
  const width = await page.locator('.hub-header').evaluate((el) => el.getBoundingClientRect().width)
  const viewport = await page.evaluate(() => window.innerWidth)
  expect(Math.round(width)).toBe(viewport)
})

// --- audience cards ---

Then('the audience heading {string} is visible', async ({ page }, heading) => {
  await expect(page.locator('.audience-hub h2', { hasText: heading })).toBeVisible()
})

Then('the hub has {int} audience cards', async ({ page }, count) => {
  await expect(page.locator('.aud-card')).toHaveCount(count)
})

// --- services + help ---

Then('the services heading {string} is visible', async ({ page }, heading) => {
  await expect(page.locator('.audience-hub h2', { hasText: heading })).toBeVisible()
})

Then('the hub has {int} services', async ({ page }, count) => {
  await expect(page.locator('.svc-list li')).toHaveCount(count)
})

Then('the hub help box has a CTA {string}', async ({ page }, label) => {
  await expect(page.locator('.help-box a', { hasText: label })).toBeVisible()
})

// --- data band ---

Then('the data band heading {string} is visible', async ({ page }, heading) => {
  await expect(page.locator('.data-band h2', { hasText: heading })).toBeVisible()
})

Then('the data band has {int} links', async ({ page }, count) => {
  await expect(page.locator('.data-band .usa-list li')).toHaveCount(count)
})

// The chart's takeaway is interpolated from takeaway_variables against the endpoint rows
// (SSR), so it renders regardless of Highcharts drawing.
Then('the data band chart shows takeaway {string}', async ({ page }, text) => {
  await expect(page.locator('.data-band .chart-card__takeaway')).toHaveText(text)
})
