const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  use: {
    baseURL: "http://127.0.0.1:8765",
    // Optional for environments that provide their own Chromium binary.
    launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
    timezoneId: "America/Los_Angeles"
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } }
  ],
  webServer: {
    command: "python3 -m http.server 8765 --bind 0.0.0.0",
    url: "http://127.0.0.1:8765",
    reuseExistingServer: !process.env.CI
  }
});
