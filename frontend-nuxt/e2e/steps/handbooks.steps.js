import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import * as handbooksFixtures from '../fixtures/handbooks.js'

const { Given, When, Then } = createBdd()

const MOCK_API_URL = 'http://localhost:4000'

async function setMockState(key, value) {
  await fetch(`${MOCK_API_URL}/__mock/state`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  })
}

async function resetMock() {
  await fetch(`${MOCK_API_URL}/__mock/reset`, { method: 'POST' })
}

// nth handbook card (1-indexed to match the feature wording).
const card = (page, n) => page.locator('.hb-card').nth(n - 1)

// --- Given ---

Given('the API returns handbooks data', async () => {
  await resetMock()
  await setMockState('handbooks', handbooksFixtures.handbooks)
})

Given('I navigate to the handbooks page', async ({ page }) => {
  await page.goto('/references/handbooks', { waitUntil: 'networkidle' })
})

// --- Then ---

Then('I see {int} handbook cards', async ({ page }, n) => {
  await expect(page.locator('.hb-card')).toHaveCount(n)
})

Then('handbook card {int} has the title {string}', async ({ page }, n, title) => {
  await expect(card(page, n).locator('h2')).toHaveText(title)
})

Then('handbook card {int} shows the release {string}', async ({ page }, n, release) => {
  await expect(card(page, n).locator('.hb-release')).toHaveText(release)
})

Then('handbook card {int} has no release badge', async ({ page }, n) => {
  await expect(card(page, n).locator('.hb-release')).toHaveCount(0)
})

Then('handbook card {int} has an interactive link to {string}', async ({ page }, n, href) => {
  const link = card(page, n).locator('a.usa-button--outline', { hasText: 'Interactive handbook' })
  await expect(link).toBeVisible()
  await expect(link).toHaveAttribute('href', href)
})

Then('handbook card {int} has no interactive link', async ({ page }, n) => {
  await expect(card(page, n).locator('a.usa-button--outline')).toHaveCount(0)
})

Then('handbook card {int} has a download link {string}', async ({ page }, n, text) => {
  const link = card(page, n).locator('a.usa-button--unstyled')
  await expect(link).toBeVisible()
  await expect(link).toHaveText(text)
})

Then('the handbooks page heading {string} is visible', async ({ page }, text) => {
  await expect(page.locator('main h1', { hasText: text })).toBeVisible()
})

Then('the handbooks page has no side navigation', async ({ page }) => {
  await expect(page.locator('nav[aria-label="Side navigation"]')).toHaveCount(0)
})
