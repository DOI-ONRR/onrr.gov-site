import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Given, When, Then } = createBdd()

const cardFor = (page, name) => page.locator('.contact-card', { hasText: name })

Given('I open the {string} contacts page', async ({ page }, slug) => {
  await page.goto(`/about/contact/${slug}`, { waitUntil: 'networkidle' })
})

Then('the contacts page heading is {string}', async ({ page }, heading) => {
  await expect(page.locator('h1')).toHaveText(heading)
})

Then('the directory shows {int} groups', async ({ page }, n) => {
  await expect(page.locator('.contact-group')).toHaveCount(n)
})

Then('the directory shows {int} contact cards', async ({ page }, n) => {
  await expect(page.locator('.contact-card')).toHaveCount(n)
})

Then('the directory shows {int} contact card', async ({ page }, n) => {
  await expect(page.locator('.contact-card')).toHaveCount(n)
})

Then('the card for {string} has the {string} role style', async ({ page }, name, roleType) => {
  await expect(cardFor(page, name).locator(`.contact-card__role--${roleType}`)).toBeVisible()
})

Then('the directory shows the section {string}', async ({ page }, name) => {
  await expect(page.locator('.section-head', { hasText: name })).toBeVisible()
})

When('I filter contacts by {string}', async ({ page }, text) => {
  await page.locator('#contact-filter').fill(text)
})
