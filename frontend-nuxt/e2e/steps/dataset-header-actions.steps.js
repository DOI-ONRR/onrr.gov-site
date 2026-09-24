import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Given, Then } = createBdd()

// DatasetView's header actions and download section depend on source_collection: a source-backed
// dataset shows the Preview button (primary), the Download button (outline), and the Download section;
// a dataset with no source_collection shows neither button and no download section — its download
// content is authored entirely in the supplemental_downloads WYSIWYG.
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

Then('the download section is rendered', async ({ page }) => {
  await expect(page.locator('#download')).toBeVisible()
})

Then('the download section is not rendered', async ({ page }) => {
  await expect(page.locator('#download')).toHaveCount(0)
})

// The supplemental_downloads WYSIWYG renders as free-form HTML in its own #supplemental-downloads block.
Then('the page shows a supplemental download link to {string}', async ({ page }, href) => {
  await expect(page.locator(`#supplemental-downloads a[href="${href}"]`)).toBeVisible()
})
