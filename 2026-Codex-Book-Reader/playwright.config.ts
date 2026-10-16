import { defineConfig, devices } from "@playwright/test";

declare const process: { env: Record<string, string | undefined> };

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "iphone-12-pro-max",
      use: {
        ...devices["iPhone 12 Pro Max"],
        viewport: { width: 428, height: 926 },
      },
    },
    {
      name: "ipad-portrait",
      use: {
        ...devices["iPad (gen 7)"],
        viewport: { width: 810, height: 1080 },
      },
    },
    {
      name: "ipad-landscape",
      use: {
        ...devices["iPad (gen 7) landscape"],
        viewport: { width: 1080, height: 810 },
      },
    },
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
  webServer: {
    command: "npm.cmd run preview -- --port 4173 --host 127.0.0.1",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
    timeout: 30000,
  },
});
