import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Given, Then } = createBdd()

const formCard = (page, title) => page.locator('.form-card').filter({ hasText: title })

Given('I navigate to the renewable energy page', async ({ page }) => {
  await page.goto('/paying/payment-options/renewable-energy', { waitUntil: 'networkidle' })
})

Then('the renewable heading {string} is visible', async ({ page }, text) => {
  await expect(page.locator('main h1', { hasText: text })).toBeVisible()
})

Then('the topic eyebrow is not shown', async ({ page }) => {
  await expect(page.locator('.topic-eyebrow')).toHaveCount(0)
})

Then('the renewable rail links to {string}', async ({ page }, label) => {
  await expect(page.locator('.onpage a', { hasText: label })).toBeVisible()
})

Then('a Pay.gov form card titled {string} is visible', async ({ page }, title) => {
  await expect(formCard(page, title)).toBeVisible()
  await expect(formCard(page, title).locator('h3')).toHaveText(title)
})

Then('that form links to Pay.gov at {string}', async ({ page }, href) => {
  const link = page.locator('.form-card a.usa-button--outline', { hasText: 'Submit form on Pay.gov' }).first()
  await expect(link).toHaveAttribute('href', href)
})

Then('there are {int} Pay.gov form cards', async ({ page }, n) => {
  await expect(page.locator('.form-card')).toHaveCount(n)
})

Then('the contact box heading {string} is visible', async ({ page }, text) => {
  await expect(page.locator('.contact-box', { hasText: text })).toBeVisible()
})
// 'the contact box has a mailto link for {string}' is defined in handbook-detail.steps.js
// (same .contact-box target) and reused here — playwright-bdd shares step defs globally.
