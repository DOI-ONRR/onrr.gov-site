import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Given, Then } = createBdd()

const linkCards = (page) => page.locator('.page-band__card--link')

Given('I navigate to the payment options page', async ({ page }) => {
  await page.goto('/paying/payment-options', { waitUntil: 'networkidle' })
})

Then('the payment options heading {string} is visible', async ({ page }, text) => {
  await expect(page.locator('main h1', { hasText: text })).toBeVisible()
})

Then('the band heading {string} is visible', async ({ page }, text) => {
  await expect(page.locator('.page-band h2', { hasText: text })).toBeVisible()
})

Then('the band hint {string} is visible', async ({ page }, text) => {
  await expect(page.locator('.page-band__hint', { hasText: text })).toBeVisible()
})

Then('the card {string} links to {string}', async ({ page }, title, href) => {
  const link = linkCards(page).locator('h3 a', { hasText: title })
  await expect(link).toBeVisible()
  await expect(link).toHaveAttribute('href', href)
})

Then('the payment options page has no side navigation', async ({ page }) => {
  await expect(page.locator('nav[aria-label="Side navigation"]')).toHaveCount(0)
})

Then('there are {int} link-title cards', async ({ page }, n) => {
  await expect(linkCards(page)).toHaveCount(n)
})

Then('the link-title cards have no button', async ({ page }) => {
  await expect(linkCards(page).locator('.usa-button')).toHaveCount(0)
})
