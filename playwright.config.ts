import { defineConfig, devices } from '@playwright/test';

/**
 * Minimal e2e setup, separate from the Jest unit/integration suite (Jest
 * can't drive a real browser, and dictation UI order + mobile scroll
 * behaviour are exactly the kind of thing that's easy to get right in a
 * jsdom test and wrong in an actual layout).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:3100',
    trace: 'retain-on-failure',
  },
  // A production build rather than `next dev`: the dev server's HMR
  // websocket and Fast Refresh machinery introduced enough flakiness in this
  // sandbox to hang hydration on some navigations — a plain built server
  // sidesteps that entirely and is what CI should run against anyway. Its
  // own port (3100), separate from the 3000 dev server this repo's
  // `.claude/launch.json` attaches the Browser pane to.
  webServer: {
    command: 'npm run build && npm run start -- --port 3100',
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  // A single desktop project: specs that care about mobile-vs-desktop
  // behaviour (the scroll hint) set their own explicit viewport per test
  // rather than depending on a device profile, so they stay deterministic
  // without needing a second project to run everything twice.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
