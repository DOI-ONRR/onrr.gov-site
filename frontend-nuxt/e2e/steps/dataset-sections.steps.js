import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'

const { Then } = createBdd()

// DatasetView renders the "Scope" (#scope) and "Data publication" (#publication) sections
// only when the corresponding dataset_metadata field is non-empty.
const SECTION_ID = {
  Scope: 'scope',
  'Data publication': 'publication',
}

Then('the dataset section {string} is visible', async ({ page }, name) => {
  await expect(page.locator(`#${SECTION_ID[name]}`)).toBeVisible()
})

Then('the dataset section {string} is not rendered', async ({ page }, name) => {
  await expect(page.locator(`#${SECTION_ID[name]}`)).toHaveCount(0)
})
