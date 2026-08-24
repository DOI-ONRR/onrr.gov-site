import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Given, Then } = createBdd()

const flat = (page) => page.locator('.data-table').first() // NYMEX (flat source)
const nested = (page) => page.locator('.data-table').nth(1) // index_zones (embedded source)

Given('I navigate to the valuation page', async ({ page }) => {
  await page.goto('/references/valuation', { waitUntil: 'networkidle' })
})

// --- flat source (NYMEX) ---

Then('the data table has columns {string}, {string}, {string}', async ({ page }, a, b, c) => {
  await expect(flat(page).locator('thead th')).toHaveText([a, b, c])
})

Then('the data table has {int} rows', async ({ page }, n) => {
  await expect(flat(page).locator('tbody tr')).toHaveCount(n)
})

Then('the data table shows {string}', async ({ page }, text) => {
  await expect(flat(page)).toContainText(text)
})

Then('the data table footnote links to {string}', async ({ page }, href) => {
  await expect(flat(page).locator(`.data-table__footnote a[href="${href}"]`)).toBeVisible()
})

// --- embedded-array source (index_zones) ---

Then('the nested data table has columns {string}, {string}, {string}', async ({ page }, a, b, c) => {
  await expect(nested(page).locator('thead th')).toHaveText([a, b, c])
})

Then('the nested data table has {int} rows', async ({ page }, n) => {
  await expect(nested(page).locator('tbody tr')).toHaveCount(n)
})

Then('the nested data table shows {string}', async ({ page }, text) => {
  await expect(nested(page)).toContainText(text)
})

Then('the nested data table shows the as-of {string}', async ({ page }, text) => {
  await expect(nested(page).locator('.as-of')).toHaveText(text)
})
