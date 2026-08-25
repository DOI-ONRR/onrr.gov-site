import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Given, When, Then } = createBdd()

const card = (page, title) => page.locator('.topic-card', { hasText: title })
const result = (page, name) => page.locator('.contact-card', { hasText: name })

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

When('I search the hub for {string}', async ({ page }, text) => {
  await page.locator('#contact-search').fill(text)
})

When('I clear the hub search', async ({ page }) => {
  await page.getByText('Clear search and browse all topics').click()
})

Then('the hub shows {int} contact result(s)', async ({ page }, n) => {
  await expect(page.locator('.contact-card')).toHaveCount(n)
})

Then('the hub result {string} shows {string}', async ({ page }, name, text) => {
  await expect(result(page, name)).toContainText(text)
})

Then('the hub result {string} links to {string}', async ({ page }, name, href) => {
  await expect(result(page, name).locator(`a[href="${href}"]`)).toBeVisible()
})

Then('the topic router is hidden', async ({ page }) => {
  await expect(page.locator('.topic-card')).toHaveCount(0)
})
