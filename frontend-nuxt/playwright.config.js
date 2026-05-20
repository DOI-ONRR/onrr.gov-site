import { defineConfig } from '@playwright/test'
import { defineBddConfig } from 'playwright-bdd'

const isCI = !!process.env.CI
const MOCK_API_PORT = 4000
const MOCK_API_URL = `http://localhost:${MOCK_API_PORT}`

const testDir = defineBddConfig({
  features: 'e2e/features/**/*.feature',
  steps: 'e2e/steps/**/*.js',
  outputDir: 'e2e/.features-gen',
})

export default defineConfig({
  testDir,
  reporter: isCI ? [['html', { open: 'never' }], ['github']] : 'html',
  use: {
    baseURL: isCI ? 'http://localhost:3000' : 'http://localhost:3001',
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
      command: `node e2e/mock-api/server.js`,
      url: `${MOCK_API_URL}/health`,
      reuseExistingServer: !isCI,
      timeout: 10_000,
      env: { MOCK_API_PORT: String(MOCK_API_PORT) },
    },
    {
      command: isCI ? 'npx nuxt preview' : 'npx nuxt dev --port 3001',
      url: isCI ? 'http://localhost:3000' : 'http://localhost:3001',
      reuseExistingServer: false,
      timeout: 120_000,
      env: { NUXT_PUBLIC_API_URL: MOCK_API_URL },
    },
  ],
})
