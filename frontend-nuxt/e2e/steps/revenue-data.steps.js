import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Given, When, Then } = createBdd()

// --- Given steps ---

Given('I navigate to the revenue data page', async ({ page }) => {
  await page.goto('/revenue-data', { waitUntil: 'networkidle' })
})

// --- When steps ---

When('I click the {string} data tab', async ({ page }, tabName) => {
  const tab = page.locator('button.tabs-block__tab', { hasText: tabName })
  await tab.click()
})

When('I click the {string} frequency button', async ({ page }, label) => {
  const button = page.locator('[role="tabpanel"]:not([hidden]) button.usa-button', { hasText: label })
  await button.click()
})

// --- Then steps ---

Then('the revenue data breadcrumbs show {string} and {string}', async ({ page }, first, second) => {
  const breadcrumbs = page.locator('.usa-breadcrumb__list-item')
  await expect(breadcrumbs.first()).toContainText(first)
  await expect(breadcrumbs.last()).toContainText(second)
})

Then('the heading {string} is visible', async ({ page }, heading) => {
  await expect(page.locator('h1', { hasText: heading })).toBeVisible()
})

Then('the {string} data tab is visible', async ({ page }, tabName) => {
  const tab = page.locator('button.tabs-block__tab', { hasText: tabName })
  await expect(tab).toBeVisible()
})

Then('the {string} data tab is selected by default', async ({ page }, tabName) => {
  const tab = page.locator('button.tabs-block__tab--selected', { hasText: tabName })
  await expect(tab).toBeVisible()
})

Then('the {string} data tab is selected', async ({ page }, tabName) => {
  const tab = page.locator('button.tabs-block__tab--selected', { hasText: tabName })
  await expect(tab).toBeVisible()
})

Then('the side navigation is visible', async ({ page }) => {
  await expect(page.locator('nav[aria-label="Side navigation"]')).toBeVisible()
})

Then('the side navigation contains {string}', async ({ page }, text) => {
  await expect(page.locator('.usa-sidenav')).toContainText(text)
})

Then('the {string} frequency button is active', async ({ page }, label) => {
  const panel = page.locator('[role="tabpanel"]:not([hidden])')
  const button = panel.locator('button.usa-button:not(.usa-button--outline)', { hasText: label })
  await expect(button).toBeVisible()
})

Then('the {string} select is visible', async ({ page }, label) => {
  const panel = page.locator('[role="tabpanel"]:not([hidden])')
  const select = panel.locator(`label:has-text("${label}") + select, label:has-text("${label}") ~ select`)
  await expect(select.first()).toBeVisible()
})

Then('the production chart is visible', async ({ page }) => {
  const panel = page.locator('[role="tabpanel"]:not([hidden])')
  const chart = panel.locator('.highcharts-container')
  await expect(chart).toBeVisible({ timeout: 10000 })
})

Then('the comparison heading {string} is visible', async ({ page }, heading) => {
  const panel = page.locator('[role="tabpanel"]:not([hidden])')
  await expect(panel.locator('h4', { hasText: heading })).toBeVisible()
})

Then('the comparison table is visible', async ({ page }) => {
  const panel = page.locator('[role="tabpanel"]:not([hidden])')
  await expect(panel.locator('table.usa-table')).toBeVisible()
})

Then('the comparison table has a {string} row', async ({ page }, rowLabel) => {
  const panel = page.locator('[role="tabpanel"]:not([hidden])')
  await expect(panel.locator('tfoot td', { hasText: rowLabel })).toBeVisible()
})

Then('the {string} select contains {string}', async ({ page }, label, optionText) => {
  const panel = page.locator('[role="tabpanel"]:not([hidden])')
  const select = panel.locator(`label:has-text("${label}") + select, label:has-text("${label}") ~ select`).first()
  await expect(select.locator('option', { hasText: optionText })).toBeAttached()
})

Then('the What\'s New section is visible', async ({ page }) => {
  await expect(page.locator('h2', { hasText: "What's New" })).toBeVisible()
})

Then('the {string} card is visible in the sidebar', async ({ page }, cardTitle) => {
  const sidebar = page.locator('.grid-col-3')
  const card = sidebar.locator('.usa-card__heading', { hasText: cardTitle })
  await expect(card).toBeVisible()
})

Then('the {string} card contains {string}', async ({ page }, cardTitle, text) => {
  const sidebar = page.locator('.grid-col-3')
  const card = sidebar.locator('.usa-card__container').filter({ has: page.locator('.usa-card__heading', { hasText: cardTitle }) })
  await expect(card).toContainText(text)
})
