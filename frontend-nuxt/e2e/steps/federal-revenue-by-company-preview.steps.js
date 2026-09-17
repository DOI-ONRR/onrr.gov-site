import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Given, When, Then } = createBdd()

const wrap = (page) => page.locator('.data-table-wrap')

Given('I navigate to the federal revenue by company dataset page', async ({ page }) => {
  await page.goto('/revenue-data/federal-revenue-by-company', { waitUntil: 'networkidle' })
})

Given('I navigate to the federal revenue by company dataset page with query {string}', async ({ page }, qs) => {
  await page.goto(`/revenue-data/federal-revenue-by-company${qs}`, { waitUntil: 'networkidle' })
})

Then('the company chart title contains {string}', async ({ page }, text) => {
  await expect(page.locator('.chart-card h3').first()).toContainText(text)
})

Then('the company table has column {string}', async ({ page }, header) => {
  await expect(wrap(page).locator('thead th', { hasText: header }).first()).toBeVisible()
})

Then('the company table has company row {string}', async ({ page }, name) => {
  await expect(wrap(page).locator('.prod-name', { hasText: name })).toBeVisible()
})

Then('the company table has group band {string}', async ({ page }, name) => {
  await expect(wrap(page).locator('.group-name', { hasText: name })).toBeVisible()
})

Then('the company table has detail row {string}', async ({ page }, name) => {
  await expect(wrap(page).locator('.breakout-cell', { hasText: name }).first()).toBeVisible()
})

Then('the company filter {string} is present', async ({ page }, label) => {
  await expect(page.locator('.filter-bar label', { hasText: label }).first()).toBeVisible()
})

When('I set the company breakout to {string}', async ({ page }, label) => {
  await page.locator('#frbc-breakout').selectOption({ label })
})

When('I sort the company table by {string}', async ({ page }, label) => {
  await wrap(page).locator('thead th button', { hasText: label }).first().click()
})

Then('the first company row is {string}', async ({ page }, name) => {
  await expect(wrap(page).locator('tbody .prod-name').first()).toHaveText(name)
})
