import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Given, When, Then } = createBdd()

// A top-level megamenu trigger, located by its visible label (the <svg> caret is
// aria-hidden, so the accessible name is just the label text).
const navButton = (page, label) =>
  page.locator('.usa-nav__primary').getByRole('button', { name: label, exact: true })

// The submenu panel a trigger controls (its `aria-controls` target).
async function navPanel(page, label) {
  const id = await navButton(page, label).getAttribute('aria-controls')
  return page.locator(`#${id}`)
}

Given('I am on a page with the primary navigation', async ({ page }) => {
  // Default Playwright viewport (1280px) is desktop (>= 64em), so the megamenu —
  // not the mobile drawer — is in play.
  await page.goto('/', { waitUntil: 'networkidle' })
  await expect(navButton(page, 'Revenue Data')).toBeVisible()
})

When('I open the {string} nav menu', async ({ page }, label) => {
  await navButton(page, label).click()
  await expect(navButton(page, label)).toHaveAttribute('aria-expanded', 'true')
})

// A bare click on the trigger, without asserting the resulting state (used to toggle
// an already-open menu closed).
When('I click the {string} nav button', async ({ page }, label) => {
  await navButton(page, label).click()
})

When('I click outside the navigation', async ({ page }) => {
  // The government-banner text sits above the nav and is inert, so the full-bleed
  // dropdown panel (which opens downward) never covers it.
  await page.locator('.usa-banner__header-text').click()
})

When('I press Escape', async ({ page }) => {
  await page.keyboard.press('Escape')
})

When('I click inside the open {string} nav panel', async ({ page }, label) => {
  // Top-left of the panel is its own padding, not a link — a click the outside-click
  // handler must ignore (it's inside <nav>).
  const panel = await navPanel(page, label)
  await panel.click({ position: { x: 4, y: 4 } })
})

Then('the {string} nav menu is open', async ({ page }, label) => {
  await expect(navButton(page, label)).toHaveAttribute('aria-expanded', 'true')
  await expect(await navPanel(page, label)).toBeVisible()
})

Then('the {string} nav menu is closed', async ({ page }, label) => {
  await expect(navButton(page, label)).toHaveAttribute('aria-expanded', 'false')
  await expect(await navPanel(page, label)).toBeHidden()
})

Then('the {string} nav button is focused', async ({ page }, label) => {
  await expect(navButton(page, label)).toBeFocused()
})
