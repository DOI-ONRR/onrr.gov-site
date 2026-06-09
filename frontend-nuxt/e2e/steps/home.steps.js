import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Given, Then } = createBdd()

Given('I navigate to the home page', async ({ page }) => {
  await page.goto('/')
})

Then('the government banner is visible', async ({ page }) => {
  await expect(page.locator('section.usa-banner')).toBeVisible()
})

Then('the site header is visible', async ({ page }) => {
  await expect(page.locator('header.usa-header')).toBeVisible()
})

Then('the main content area is visible', async ({ page }) => {
  await expect(page.locator('main#main-content')).toBeVisible()
})

Then('the site footer is visible', async ({ page }) => {
  await expect(page.locator('footer.usa-footer')).toBeVisible()
})
