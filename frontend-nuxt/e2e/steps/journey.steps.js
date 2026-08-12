import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Given, Then } = createBdd()

// --- Given steps ---

Given('I navigate to the journey landing page', async ({ page }) => {
  // The GetPageBySlug mock serves the journey-landing fixture for this slug.
  await page.goto('/getting-started', { waitUntil: 'networkidle' })
})

// --- Then steps ---

Then('the journey landing heading {string} is visible', async ({ page }, heading) => {
  await expect(page.locator('.journey-landing h1', { hasText: heading })).toBeVisible()
})

Then('the journey has {int} steps', async ({ page }, count) => {
  await expect(page.locator('.usa-process-list__item')).toHaveCount(count)
})

Then('the first journey step is {string}', async ({ page }, label) => {
  await expect(page.locator('.usa-process-list__item').first()).toContainText(label)
})

// --- aside: callout ---

Then('the journey callout is visible', async ({ page }) => {
  await expect(page.locator('.journey-callout')).toBeVisible()
})

Then('the journey callout contains {string}', async ({ page }, text) => {
  await expect(page.locator('.journey-callout')).toContainText(text)
})

Then('the journey callout has a CTA {string}', async ({ page }, label) => {
  await expect(page.locator('.journey-callout a', { hasText: label })).toBeVisible()
})

// --- aside: references ---

Then('the journey references heading {string} is visible', async ({ page }, heading) => {
  await expect(page.locator('.journey-aside h2', { hasText: heading })).toBeVisible()
})

Then('the journey has {int} references', async ({ page }, count) => {
  await expect(page.locator('.journey-refs li')).toHaveCount(count)
})

// --- path cards ---

Then('the journey path heading {string} is visible', async ({ page }, heading) => {
  await expect(page.locator('.journey-paths h2', { hasText: heading })).toBeVisible()
})

Then('the journey has {int} path cards', async ({ page }, count) => {
  await expect(page.locator('.journey-paths .jl-card')).toHaveCount(count)
})

// --- related band ---

Then('the journey related heading {string} is visible', async ({ page }, heading) => {
  await expect(page.locator('.journey-related-band h2', { hasText: heading })).toBeVisible()
})

Then('the journey related band has {int} cards', async ({ page }, count) => {
  await expect(page.locator('.journey-related-band .jl-card')).toHaveCount(count)
})

Then('the {string} related card links to {string}', async ({ page }, title, href) => {
  const card = page
    .locator('.journey-related-band .jl-card')
    .filter({ has: page.getByRole('heading', { level: 3, name: title, exact: true }) })
  await expect(card.locator('a')).toHaveAttribute('href', href)
})
