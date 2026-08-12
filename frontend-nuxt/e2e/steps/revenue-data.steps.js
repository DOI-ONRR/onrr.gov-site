import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Given, Then } = createBdd()

// --- Given steps ---

Given('I navigate to the revenue data page', async ({ page }) => {
  await page.goto('/revenue-data', { waitUntil: 'networkidle' })
})

// --- Then steps ---

Then('the revenue data breadcrumbs show {string} and {string}', async ({ page }, first, second) => {
  const breadcrumbs = page.locator('.usa-breadcrumb__list-item')
  await expect(breadcrumbs.first()).toContainText(first)
  await expect(breadcrumbs.last()).toContainText(second)
})

Then('the revenue data heading {string} is visible', async ({ page }, heading) => {
  await expect(page.locator('h1', { hasText: heading })).toBeVisible()
})

Then('the {string} button is visible', async ({ page }, label) => {
  await expect(page.locator('a.usa-button', { hasText: label })).toBeVisible()
})

Then('the revenue data section heading {string} is visible', async ({ page }, heading) => {
  await expect(page.locator('h2', { hasText: heading })).toBeVisible()
})

// The two "Explore the data" charts render as <ChartCardByKey>/<ChartCard>; the mock
// API serves the chart_cards (by key) and their endpoint data, so the cards render
// with their titles. Assert on the title (present regardless of Highcharts drawing).
Then('the chart card {string} is visible', async ({ page }, title) => {
  const card = page
    .locator('.chart-card')
    .filter({ has: page.getByRole('heading', { name: title, exact: true }) })
  await expect(card).toBeVisible()
})

// Exact heading match so "Revenue" doesn't also match the "Revenue by company" card.
function datasetCard(page, title) {
  return page
    .locator('.ds-card')
    .filter({ has: page.getByRole('heading', { level: 3, name: title, exact: true }) })
}

Then('the dataset card {string} is visible', async ({ page }, title) => {
  await expect(datasetCard(page, title)).toBeVisible()
})

Then('the dataset card {string} links to {string}', async ({ page }, title, href) => {
  await expect(datasetCard(page, title).locator('a.ds-cta')).toHaveAttribute('href', href)
})
