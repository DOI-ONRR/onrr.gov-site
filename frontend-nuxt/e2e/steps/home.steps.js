import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Given, Then } = createBdd()

// A page_band located by its <h2> heading.
function band(page, heading) {
  return page
    .locator('.page-band')
    .filter({ has: page.getByRole('heading', { level: 2, name: heading, exact: true }) })
}

Given('I navigate to the home page', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
})

// --- page chrome ---

Then('the government banner is visible', async ({ page }) => {
  await expect(page.locator('section.usa-banner')).toBeVisible()
})

Then('the site header is visible', async ({ page }) => {
  await expect(page.locator('header.usa-header')).toBeVisible()
})

Then('the main content area is visible', async ({ page }) => {
  await expect(page.locator('main#main-content')).toBeVisible()
})

Then('the site footer is visible', async ({ page }) => {
  await expect(page.locator('footer.usa-footer')).toBeVisible()
})

// --- hero ---

Then('the hero heading {string} is visible', async ({ page }, text) => {
  await expect(page.locator('.hero h1', { hasText: text })).toBeVisible()
})

Then('the hero has {int} CTAs', async ({ page }, n) => {
  await expect(page.locator('.hero-actions a')).toHaveCount(n)
})

Then('the first hero CTA is a primary button', async ({ page }) => {
  const cta = page.locator('.hero-actions a').first()
  await expect(cta).toHaveClass(/usa-button--big/)
  await expect(cta).not.toHaveClass(/usa-button--outline/)
})

Then('the second hero CTA is an outline-inverse button', async ({ page }) => {
  const cta = page.locator('.hero-actions a').nth(1)
  await expect(cta).toHaveClass(/usa-button--outline/)
  await expect(cta).toHaveClass(/usa-button--inverse/)
})

// --- bands ---

Then('the band {string} is a cards band with {int} cards', async ({ page }, heading, n) => {
  await expect(band(page, heading).locator('.page-band__card')).toHaveCount(n)
})

Then('the {string} cards use an auto-fit grid', async ({ page }, heading) => {
  const grid = band(page, heading).locator('.page-band__cards')
  await expect(grid).toBeVisible()
  // auto-fit resolves to multiple column tracks (not a single stacked column).
  const cols = await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns)
  expect(cols.trim().split(/\s+/).length).toBeGreaterThan(1)
})

Then('the band {string} has body and aside columns', async ({ page }, heading) => {
  await expect(band(page, heading).locator('.page-band__body')).toBeVisible()
  await expect(band(page, heading).locator('.page-band__aside')).toBeVisible()
})

Then('the {string} band background is {word}', async ({ page }, heading, token) => {
  await expect(band(page, heading)).toHaveClass(new RegExp(`page-band--${token}`))
})

Then('the band {string} renders a chart', async ({ page }, heading) => {
  await expect(band(page, heading).locator('.chart-card')).toBeVisible()
})

Then('the {string} chart shows takeaway {string}', async ({ page }, heading, text) => {
  await expect(band(page, heading).locator('.chart-card__takeaway')).toHaveText(text)
})

Then('the band {string} is a steps band with {int} steps', async ({ page }, heading, n) => {
  await expect(band(page, heading).locator('.page-band__step')).toHaveCount(n)
})

Then('the first step is numbered {string} titled {string}', async ({ page }, num, title) => {
  const first = page.locator('.page-band__step').first()
  await expect(first.locator('.page-band__step-num')).toHaveText(num)
  await expect(first.locator('h3')).toHaveText(title)
})
