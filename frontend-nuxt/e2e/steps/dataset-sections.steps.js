import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Then } = createBdd()

// DatasetView renders each `sections` repeater entry with an id of slugify(header), so
// "Scope" -> #scope and "Data publication" -> #data-publication. A section renders only
// when the entry exists (non-empty).
const SECTION_ID = {
  Scope: 'scope',
  'Data publication': 'data-publication',
}

Then('the dataset section {string} is visible', async ({ page }, name) => {
  await expect(page.locator(`#${SECTION_ID[name]}`)).toBeVisible()
})

Then('the dataset section {string} is not rendered', async ({ page }, name) => {
  await expect(page.locator(`#${SECTION_ID[name]}`)).toHaveCount(0)
})
