import { defineConfig } from '@playwright/test'
import { defineBddConfig } from 'playwright-bdd'

const isCI = !!process.env.CI

const testDir = defineBddConfig({
  features: 'e2e/features/**/*.feature',
  steps: 'e2e/steps/**/*.js',
  outputDir: 'e2e/.features-gen',
})

export default defineConfig({
  testDir,
  reporter: isCI ? [['html', { open: 'never' }], ['github']] : 'html',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: {
    command: isCI ? 'npx nuxt preview' : 'npx nuxt dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
})
