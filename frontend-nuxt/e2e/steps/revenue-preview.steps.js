import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Given, When, Then } = createBdd()

const wrap = (page) => page.locator('.data-table-wrap')

Given('I navigate to the revenue dataset page', async ({ page }) => {
  await page.goto('/revenue-data/revenue-by-commodity', { waitUntil: 'networkidle' })
})

Then('the revenue pivot has commodity row {string}', async ({ page }, name) => {
  await expect(wrap(page).locator('.prod-name', { hasText: name })).toBeVisible()
})

Then('the revenue pivot has group band {string}', async ({ page }, name) => {
  await expect(wrap(page).locator('.group-name', { hasText: name })).toBeVisible()
})

Then('the revenue pivot has column header {string}', async ({ page }, h) => {
  await expect(wrap(page).locator('thead th', { hasText: h }).first()).toBeVisible()
})

Then('the revenue pivot is a flat table', async ({ page }) => {
  await expect(page.locator('.data-table-wrap.pivot--flat')).toBeVisible()
})

Then('the revenue pivot shows a currency value', async ({ page }) => {
  await expect(wrap(page).locator('td.text-right', { hasText: '$' }).first()).toBeVisible()
})

Then('the revenue filter {string} is present', async ({ page }, label) => {
  await expect(page.locator('.filter-bar label', { hasText: label }).first()).toBeVisible()
})

Then('the revenue period options are {string}, {string} and {string}', async ({ page }, a, b, c) => {
  await expect(page.locator('#r-period option')).toHaveText([a, b, c])
})

When('I set the revenue period to {string}', async ({ page }, label) => {
  await page.locator('#r-period').selectOption({ label })
})

Then('the revenue chart title contains {string}', async ({ page }, text) => {
  await expect(page.locator('.chart-card h3').first()).toContainText(text)
})

Then('the revenue chart is not small multiples', async ({ page }) => {
  // Multi-series shared-axis chart: several series, but at most the primary (+secondary)
  // y-axis — not one self-scaled y-axis pane per series (which is the small-multiples layout).
  await expect(page.locator('.chart-card .highcharts-series').first()).toBeVisible()
  const yAxes = await page.locator('.chart-card .highcharts-yaxis').count()
  expect(yAxes).toBeLessThanOrEqual(2)
})
