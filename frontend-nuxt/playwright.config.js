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
  workers: 1,
  reporter: isCI ? [['html', { open: 'never' }], ['github']] : 'html',
  use: {
    baseURL: 'http://localhost:3001',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: [
    {
      command: 'node e2e/mock-api.js',
      url: 'http://localhost:5199',
      reuseExistingServer: !isCI,
      timeout: 10_000,
    },
    {
      command: isCI
        ? 'NUXT_PUBLIC_API_URL=http://localhost:5199 npx nuxt preview --port 3001'
        : 'NUXT_PUBLIC_API_URL=http://localhost:5199 npx nuxt dev --port 3001',
      url: 'http://localhost:3001',
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
})
