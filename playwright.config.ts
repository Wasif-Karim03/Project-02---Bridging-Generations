import { defineConfig, devices } from "@playwright/test";

// Cross-browser policy (R3.3): Firefox + WebKit run only specs tagged
// `@cross-browser` (smoke). Chromium runs the full suite. Donor traffic
// is assumed Chromium-majority — revisit after analytics show otherwise.
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
      // Don't run @mobile-safari tests under chromium — they require touch
      // support that desktop chromium doesn't expose without device emulation.
      grepInvert: /@mobile-safari/,
    },
    { name: "firefox", use: { browserName: "firefox" }, grep: /@cross-browser/ },
    { name: "webkit", use: { browserName: "webkit" }, grep: /@cross-browser/ },
    // Mobile Safari surfaces iOS-specific bugs that desktop WebKit + Chromium
    // viewport-emulation miss — e.g. <dialog>.showModal() top-layer timing,
    // touch event handling. Scoped to @mobile-safari-tagged tests.
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 15 Pro"] },
      grep: /@mobile-safari/,
    },
  ],
});
