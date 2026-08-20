import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Given, When, Then } = createBdd()

// A glossary term entry located by its term text.
function term(page, text) {
  return page.locator('.g-term').filter({ hasText: text })
}

Given('I navigate to the glossary page', async ({ page }) => {
  await page.goto('/glossary', { waitUntil: 'networkidle' })
})

Then('the glossary heading {string} is visible', async ({ page }, text) => {
  await expect(page.locator('.glossary h1', { hasText: text })).toBeVisible()
})

Then('the glossary lists {int} term', async ({ page }, n) => {
  await expect(page.locator('.g-term')).toHaveCount(n)
})

Then('the glossary lists {int} terms', async ({ page }, n) => {
  await expect(page.locator('.g-term')).toHaveCount(n)
})

Then('the glossary count reads {string}', async ({ page }, text) => {
  await expect(page.locator('.g-count')).toHaveText(text)
})

Then('the glossary has a letter heading {string}', async ({ page }, letter) => {
  await expect(page.getByRole('heading', { level: 2, name: letter, exact: true })).toBeVisible()
})

Then('the glossary term {string} is visible', async ({ page }, text) => {
  await expect(term(page, text)).toBeVisible()
})

When('I filter the glossary by {string}', async ({ page }, text) => {
  await page.fill('#g-filter', text)
})

When('I select the glossary category {string}', async ({ page }, category) => {
  await page.selectOption('#g-cat', category)
})

// Active letters render as links; empty letters render as (disabled) spans.
Then('the A-Z rail links to letter {string}', async ({ page }, letter) => {
  await expect(page.locator('.az a').filter({ hasText: new RegExp(`^${letter}$`) })).toBeVisible()
})

Then('the A-Z rail disables letter {string}', async ({ page }, letter) => {
  await expect(page.locator('.az span').filter({ hasText: new RegExp(`^${letter}$`) })).toBeVisible()
})

Then('the glossary term {string} has anchor id {string}', async ({ page }, text, id) => {
  await expect(term(page, text)).toHaveAttribute('id', id)
})
