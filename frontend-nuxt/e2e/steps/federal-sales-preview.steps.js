import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Given, When, Then } = createBdd()

const wrap = (page) => page.locator('.data-table-wrap')

Given('I navigate to the federal sales dataset page', async ({ page }) => {
  await page.goto('/revenue-data/federal-sales', { waitUntil: 'networkidle' })
})

Given('I navigate to the federal sales dataset page with query {string}', async ({ page }, qs) => {
  await page.goto(`/revenue-data/federal-sales${qs}`, { waitUntil: 'networkidle' })
})

Then('the federal sales table has column {string}', async ({ page }, header) => {
  await expect(wrap(page).locator('thead th', { hasText: header }).first()).toBeVisible()
})

Then('the federal sales table has commodity row {string}', async ({ page }, name) => {
  await expect(wrap(page).locator('.prod-name', { hasText: name })).toBeVisible()
})

Then('the federal sales table has group band {string}', async ({ page }, name) => {
  await expect(wrap(page).locator('.group-name', { hasText: name })).toBeVisible()
})

Then('the federal sales table has detail row {string}', async ({ page }, name) => {
  await expect(wrap(page).locator('.breakout-cell', { hasText: name }).first()).toBeVisible()
})

Then('the federal sales filter {string} is present', async ({ page }, label) => {
  await expect(page.locator('.filter-bar label', { hasText: label }).first()).toBeVisible()
})

When('I set the federal sales breakout to {string}', async ({ page }, label) => {
  await page.locator('#fs-breakout').selectOption({ label })
})

When('I sort the federal sales table by {string}', async ({ page }, label) => {
  await wrap(page).locator('thead th button', { hasText: label }).first().click()
})

Then('the first federal sales commodity row is {string}', async ({ page }, name) => {
  await expect(wrap(page).locator('tbody .prod-name').first()).toHaveText(name)
})
