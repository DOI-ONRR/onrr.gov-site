import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Given, Then } = createBdd()

const card = (page, title) => page.locator('.topic-card', { hasText: title })

Given('I navigate to the contact hub', async ({ page }) => {
  await page.goto('/about/contact', { waitUntil: 'networkidle' })
})

Then('the contact hub shows {int} topic cards', async ({ page }, n) => {
  await expect(page.locator('.topic-card')).toHaveCount(n)
})

Then('the topic card {string} links to {string}', async ({ page }, title, href) => {
  await expect(card(page, title).locator(`a[href="${href}"]`).first()).toBeVisible()
})

Then('the topic card {string} shows {string}', async ({ page }, title, text) => {
  await expect(card(page, title)).toContainText(text)
})
