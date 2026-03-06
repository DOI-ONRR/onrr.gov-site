import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import eventsFixtures from '../fixtures/events.json' with { type: 'json' }

const { Given, When, Then } = createBdd()

function mockGraphQL(page, fixture) {
  return page.route('**/graphql', (route, request) => {
    const body = request.postDataJSON()
    if (body?.query?.includes('events')) {
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(fixture),
      })
    }
    return route.fallback()
  })
}

// --- Given steps ---

Given('the API returns events data', async ({ page }) => {
  await mockGraphQL(page, eventsFixtures.withEvents)
})

Given('the API returns no events', async ({ page }) => {
  await mockGraphQL(page, eventsFixtures.noEvents)
})

Given('the API returns outreach events only', async ({ page }) => {
  await mockGraphQL(page, eventsFixtures.outreachOnly)
})

Given('I navigate to the events page', async ({ page }) => {
  await page.goto('/events')
})

// --- When steps ---

When('I click the {string} tab', async ({ page }, tabName) => {
  const tab = page.locator('button.events-tab', { hasText: tabName })
  await tab.click()
})

// --- Then steps ---

Then('the {string} tab is visible', async ({ page }, tabName) => {
  const tab = page.locator('button.events-tab', { hasText: tabName })
  await expect(tab).toBeVisible()
})

Then('the {string} tab is selected', async ({ page }, tabName) => {
  const tab = page.locator('button.events-tab--selected', { hasText: tabName })
  await expect(tab).toBeVisible()
})

Then('I see {int} event card(s) on the {string} tab', async ({ page }, count, tabName) => {
  const panel = page.locator('[role="tabpanel"]:not([hidden])')
  const cards = panel.locator('.event-card')
  await expect(cards).toHaveCount(count)
})

Then('the first event card title is {string}', async ({ page }, expectedTitle) => {
  const title = page.locator('[role="tabpanel"]:not([hidden]) .event-card').first().locator('.event-card__title')
  await expect(title).toHaveText(expectedTitle)
})

Then('the first event card date contains {string}', async ({ page }, expectedDate) => {
  const date = page.locator('[role="tabpanel"]:not([hidden]) .event-card').first().locator('.event-card__date')
  await expect(date).toContainText(expectedDate)
})

Then('the second event card date contains {string}', async ({ page }, expectedDate) => {
  const date = page.locator('[role="tabpanel"]:not([hidden]) .event-card').nth(1).locator('.event-card__date')
  await expect(date).toContainText(expectedDate)
})

Then('the first event card shows the field {string} with {string}', async ({ page }, fieldLabel, expectedValue) => {
  const card = page.locator('[role="tabpanel"]:not([hidden]) .event-card').first()
  const field = card.locator('.event-card__body div', { hasText: new RegExp(`${fieldLabel}:`) })
  await expect(field).toBeVisible()
  await expect(field).toContainText(expectedValue)
})

Then('the first event card shows the field {string}', async ({ page }, fieldLabel) => {
  const card = page.locator('[role="tabpanel"]:not([hidden]) .event-card').first()
  const field = card.locator('.event-card__body div', { hasText: new RegExp(`${fieldLabel}:`) })
  await expect(field).toBeVisible()
})

Then('the first event card has a mailto link for {string}', async ({ page }, email) => {
  const card = page.locator('[role="tabpanel"]:not([hidden]) .event-card').first()
  const link = card.locator(`a[href="mailto:${email}"]`)
  await expect(link).toBeVisible()
  await expect(link).toHaveText(email)
})

Then('the first event card has an external link with class {string}', async ({ page }, className) => {
  const card = page.locator('[role="tabpanel"]:not([hidden]) .event-card').first()
  const link = card.locator(`a.${className}`)
  await expect(link).toBeVisible()
})

Then('I see the message {string} on the {string} tab', async ({ page }, message, tabName) => {
  const panel = page.locator('[role="tabpanel"]:not([hidden])')
  await expect(panel.locator(`text=${message}`)).toBeVisible()
})

Then('the breadcrumbs show {string} and {string}', async ({ page }, first, second) => {
  const breadcrumbs = page.locator('.usa-breadcrumb__list-item')
  await expect(breadcrumbs.first()).toContainText(first)
  await expect(breadcrumbs.last()).toContainText(second)
})
