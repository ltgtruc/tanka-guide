import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({
  path: path.resolve(__dirname, '.env'),
});

const authFile = path.resolve(
  __dirname,
  './auth/admin.json',
);

export default defineConfig({
  testDir: './tests',

  timeout: 120_000,

  expect: {
    timeout: 15_000,
  },

  // Quay User Guide nên chạy một case tại một thời điểm.
  workers: 1,

  fullyParallel: false,

  retries: 0,

  reporter: [
    ['list', { printSteps: true }],
    [
      'html',
      {
        outputFolder: 'playwright-report',
        open: 'never',
      },
    ],
  ],

  use: {
    baseURL:
      process.env.BASE_URL ||
      'https://door-v1.test.tankasoft.com',

    headless: false,

    viewport: {
      width: 1440,
      height: 900,
    },

    video: {
      mode: 'on',
      size: {
        width: 1440,
        height: 900,
      },
    },

    screenshot: 'only-on-failure',

    trace: 'retain-on-failure',

    actionTimeout: 15_000,

    navigationTimeout: 30_000,

    locale: 'vi-VN',

    timezoneId: 'Asia/Ho_Chi_Minh',

    colorScheme: 'light',

    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    {
      name: 'tanka-user-guide',
      dependencies: ['setup'],

      use: {
        ...devices['Desktop Chrome'],

        browserName: 'chromium',

        channel: 'chrome',

        storageState: authFile,
      },
    },
  ],

  outputDir: 'test-results',
});