import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Given, When, Then } = createBdd()

const pivot = (page) => page.locator('table.pivot')
// The recipients multi-select (the .multi-select wrapper containing the #f-recipients trigger).
const recipients = (page) => page.locator('.multi-select').filter({ has: page.locator('#f-recipients') })

Given('I navigate to the monthly disbursements dataset page', async ({ page }) => {
  await page.goto('/revenue-data/monthly-disbursements', { waitUntil: 'networkidle' })
})

// --- pivot table ---

Then('the preview pivot has group {string}', async ({ page }, name) => {
  await expect(pivot(page).locator('.group-name', { hasText: name })).toBeVisible()
})

Then('the preview pivot has year columns {string} and {string}', async ({ page }, a, b) => {
  await expect(pivot(page).locator('thead th', { hasText: a })).toBeVisible()
  await expect(pivot(page).locator('thead th', { hasText: b })).toBeVisible()
})

Then('the preview pivot has a subtotal row', async ({ page }) => {
  await expect(pivot(page).locator('.subtotal-row').first()).toBeVisible()
})

When('I group the pivot by {string}', async ({ page }, label) => {
  await page.locator('.group-select').selectOption({ label })
})

Then('a negative pivot value is styled with text-secondary', async ({ page }) => {
  const neg = pivot(page).locator('td.text-secondary')
  await expect(neg.first()).toBeVisible()
  await expect(neg.first()).toContainText('-$')
})

// --- collapse / expand all ---

const toggleBtn = (page) => page.locator('.table-toolbar__group .usa-button--outline')

Then('the pivot toggle button reads {string}', async ({ page }, label) => {
  await expect(toggleBtn(page)).toHaveText(label)
})

Then('month detail rows are visible', async ({ page }) => {
  await expect(pivot(page).locator('.month-row').first()).toBeVisible()
})

Then('no month detail rows are visible', async ({ page }) => {
  await expect(pivot(page).locator('.month-row')).toHaveCount(0)
})

When('I click the pivot toggle button', async ({ page }) => {
  await toggleBtn(page).click()
})

// --- recipients multi-select ---

Then('the recipients trigger reads {string}', async ({ page }, text) => {
  await expect(page.locator('#f-recipients')).toContainText(text)
})

When('I open the recipients dropdown', async ({ page }) => {
  await page.locator('#f-recipients').click()
})

Then('the recipients dropdown has a {string} option', async ({ page }, text) => {
  await expect(recipients(page).locator('.multi-select__option--all', { hasText: text })).toBeVisible()
})

When('I toggle select-all in the recipients dropdown', async ({ page }) => {
  await recipients(page).locator('.multi-select__option--all').click()
})

// --- download section ---

const downloadCard = (page, heading) =>
  page.locator('#download .download-card').filter({ has: page.getByRole('heading', { name: heading, exact: true }) })

Then('the download card {string} shows {string}', async ({ page }, heading, note) => {
  await expect(downloadCard(page, heading).locator('.dl-size')).toHaveText(note)
})

Then('the {string} download card has a download link', async ({ page }, heading) => {
  await expect(downloadCard(page, heading).locator('a.usa-button')).toBeVisible()
})
