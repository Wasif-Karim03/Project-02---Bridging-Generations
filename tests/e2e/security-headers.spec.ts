import { expect, test } from "@playwright/test";

test("security headers are served on the home route", async ({ request }) => {
  const res = await request.get("/");
  const headers = res.headers();

  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["strict-transport-security"]).toContain("max-age=");
  expect(headers["permissions-policy"]).toContain("camera=()");

  const csp = headers["content-security-policy"];
  expect(csp).toBeDefined();
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("givebutter.com");
  expect(csp).not.toContain("usefathom.com");
  expect(csp).toContain("frame-ancestors 'none'");
});
