import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Given, When, Then } = createBdd()

const tocRows = (page) => page.locator('#table-of-contents tbody tr')

Given('I navigate to the handbook detail page', async ({ page }) => {
  await page.goto('/references/handbooks/minerals-revenue-reporter-handbook', { waitUntil: 'networkidle' })
})

// --- Header + rail ---

Then('the handbook heading {string} is visible', async ({ page }, text) => {
  await expect(page.locator('main h1', { hasText: text })).toBeVisible()
})

Then('the handbook shows the release {string}', async ({ page }, text) => {
  await expect(page.locator('.hb-release')).toHaveText(text)
})

Then('the handbook rail links to {string}', async ({ page }, label) => {
  await expect(page.locator('.onpage a', { hasText: label })).toBeVisible()
})

Then('the handbook has a complete-handbook button to {string}', async ({ page }, href) => {
  const btn = page.locator('a.usa-button', { hasText: 'View complete handbook' })
  await expect(btn).toBeVisible()
  await expect(btn).toHaveAttribute('href', href)
})

Then('the handbook has no side navigation', async ({ page }) => {
  await expect(page.locator('nav[aria-label="Side navigation"]')).toHaveCount(0)
})

// --- Table of contents ---

Then('the TOC has {int} entry', async ({ page }, n) => {
  await expect(tocRows(page)).toHaveCount(n)
})

Then('the TOC has {int} entries', async ({ page }, n) => {
  await expect(tocRows(page)).toHaveCount(n)
})

Then('the TOC entry {string} links to {string}', async ({ page }, title, href) => {
  const link = tocRows(page).locator('a', { hasText: title })
  await expect(link).toBeVisible()
  await expect(link).toHaveAttribute('href', href)
})

Then('the TOC row {string} has no link', async ({ page }, title) => {
  const row = tocRows(page).filter({ hasText: title })
  await expect(row).toHaveCount(1)
  await expect(row.locator('a')).toHaveCount(0)
})

When('I search the TOC for {string}', async ({ page }, text) => {
  await page.fill('#toc-filter', text)
})

// --- Chapters + contact ---

Then('the chapters section lists {int} documents', async ({ page }, n) => {
  await expect(page.locator('#chapters .doc-list li')).toHaveCount(n)
})

Then('the contact box shows {string}', async ({ page }, text) => {
  await expect(page.locator('.contact-box')).toContainText(text)
})

Then('the contact box has a mailto link for {string}', async ({ page }, email) => {
  await expect(page.locator(`.contact-box a[href="mailto:${email}"]`)).toBeVisible()
})
