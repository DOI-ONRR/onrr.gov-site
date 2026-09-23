import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Given, Then } = createBdd()

// DatasetView's header actions change with whether the dataset has a preview (driven by
// source_collection): with a preview, "Preview & filter data" is the primary button and "Download
// files" is an outline button; with no source_collection there is no preview, so the Preview button
// is dropped and Download becomes the primary (solid) button.
const HEADER_BTN = {
  'Preview & filter data': '#preview',
  'Download files': '#download',
  'API access': '#api',
}
const headerBtn = (page, name) => page.locator(`.dataset a.usa-button[href="${HEADER_BTN[name]}"]`)

Given('I navigate to the reference tables dataset page', async ({ page }) => {
  await page.goto('/revenue-data/reference-tables', { waitUntil: 'networkidle' })
})

Then('the dataset header button {string} is not rendered', async ({ page }, name) => {
  await expect(headerBtn(page, name)).toHaveCount(0)
})

Then('the dataset header button {string} is a primary button', async ({ page }, name) => {
  await expect(headerBtn(page, name)).toBeVisible()
  await expect(headerBtn(page, name)).not.toHaveClass(/usa-button--outline/)
})

Then('the dataset header button {string} is an outline button', async ({ page }, name) => {
  await expect(headerBtn(page, name)).toBeVisible()
  await expect(headerBtn(page, name)).toHaveClass(/usa-button--outline/)
})

Then('the download card {string} is not rendered', async ({ page }, heading) => {
  await expect(
    page.locator('#download .download-card').filter({ has: page.getByRole('heading', { name: heading, exact: true }) }),
  ).toHaveCount(0)
})
