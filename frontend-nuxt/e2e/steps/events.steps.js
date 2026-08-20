import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import * as eventsFixtures from '../fixtures/events.js'

const { Given, When, Then } = createBdd()

const MOCK_API_URL = 'http://localhost:4000'

async function setMockState(key, value) {
  await fetch(`${MOCK_API_URL}/__mock/state`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  })
}

async function resetMock() {
  await fetch(`${MOCK_API_URL}/__mock/reset`, { method: 'POST' })
}

// Section helpers.
const outreachSection = (page) => page.locator('#indian-outreach-and-events')
const otherSection = (page) => page.locator('#other-onrr-events')

// --- Given ---

Given('the API returns events data', async () => {
  await resetMock()
  await setMockState('events', eventsFixtures.withEvents)
})

Given('the API returns no events', async () => {
  await resetMock()
  await setMockState('events', eventsFixtures.noEvents)
})

Given('the API returns outreach events only', async () => {
  await resetMock()
  await setMockState('events', eventsFixtures.outreachOnly)
})

Given('I navigate to the events page', async ({ page }) => {
  await page.goto('/events', { waitUntil: 'networkidle' })
})

// --- Header + rail ---

Then('the events heading {string} is visible', async ({ page }, text) => {
  await expect(page.locator('.events h1', { hasText: text })).toBeVisible()
})

Then('the breadcrumbs show {string} and {string}', async ({ page }, first, second) => {
  const crumbs = page.locator('.usa-breadcrumb__list-item')
  await expect(crumbs.first()).toContainText(first)
  await expect(crumbs.last()).toContainText(second)
})

Then('the on-this-page rail links to {string}', async ({ page }, label) => {
  await expect(page.locator('.onpage a', { hasText: label })).toBeVisible()
})

Then('the on-this-page rail does not link to {string}', async ({ page }, label) => {
  await expect(page.locator('.onpage a', { hasText: label })).toHaveCount(0)
})

// --- Training card ---

Then('the training card shows the tag {string}', async ({ page }, text) => {
  await expect(page.locator('.training-card .usa-tag', { hasText: text })).toBeVisible()
})

Then('the training card title is {string}', async ({ page }, text) => {
  await expect(page.locator('.training-card h2')).toHaveText(text)
})

Then('the training card has {int} registration button(s)', async ({ page }, n) => {
  await expect(page.locator('.training-card a.usa-button--outline')).toHaveCount(n)
})

Then('the first registration button reads {string}', async ({ page }, text) => {
  await expect(page.locator('.training-card a.usa-button--outline').first()).toHaveText(text)
})

Then('the training card shows the venue {string}', async ({ page }, text) => {
  const venue = page.locator('.training-card .reg-note').filter({ hasText: 'Venue' })
  await expect(venue).toBeVisible()
  await expect(venue).toContainText(text)
})

Then('the training card has a mailto link for {string}', async ({ page }, email) => {
  await expect(page.locator(`.training-card a[href="mailto:${email}"]`)).toBeVisible()
})

// --- Outreach / other cards ---

Then('the outreach section has {int} event card(s)', async ({ page }, n) => {
  await expect(outreachSection(page).locator('.event-card')).toHaveCount(n)
})

Then('the other section has {int} event card(s)', async ({ page }, n) => {
  await expect(otherSection(page).locator('.event-card')).toHaveCount(n)
})

Then('the first outreach card title is {string}', async ({ page }, text) => {
  await expect(outreachSection(page).locator('.event-card h3').first()).toHaveText(text)
})

Then('the first other card title is {string}', async ({ page }, text) => {
  await expect(otherSection(page).locator('.event-card h3').first()).toHaveText(text)
})

Then('the first outreach card shows field {string} with value {string}', async ({ page }, label, value) => {
  const card = outreachSection(page).locator('.event-card').first()
  await expect(card.locator('dt', { hasText: label })).toBeVisible()
  await expect(card.locator('dd', { hasText: value })).toBeVisible()
})

Then('the first outreach card shows field {string}', async ({ page }, label) => {
  const card = outreachSection(page).locator('.event-card').first()
  await expect(card.locator('dt', { hasText: label })).toBeVisible()
})

Then('the first outreach card has a mailto link for {string}', async ({ page }, email) => {
  const card = outreachSection(page).locator('.event-card').first()
  await expect(card.locator(`a[href="mailto:${email}"]`)).toHaveText(email)
})

Then('the first outreach card has an external link with class {string}', async ({ page }, className) => {
  const card = outreachSection(page).locator('.event-card').first()
  await expect(card.locator(`a.${className}`)).toBeVisible()
})

Then('the second outreach card date contains the outreach 2 start date', async ({ page }) => {
  const date = outreachSection(page).locator('.event-card').nth(1).locator('.event-date')
  await expect(date).toContainText(eventsFixtures.outreach2StartFormatted)
})

Then('the second outreach card date contains the outreach 2 end date', async ({ page }) => {
  const date = outreachSection(page).locator('.event-card').nth(1).locator('.event-date')
  await expect(date).toContainText(eventsFixtures.outreach2EndFormatted)
})

// --- Empty states ---

Then('the outreach section shows {string}', async ({ page }, message) => {
  await expect(outreachSection(page).locator('.empty-state')).toHaveText(message)
})

Then('the other section shows {string}', async ({ page }, message) => {
  await expect(otherSection(page).locator('.empty-state')).toHaveText(message)
})
