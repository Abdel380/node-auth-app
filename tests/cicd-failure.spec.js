import { test, expect } from "@playwright/test";

test("CI/CD - intentional failure", async () => {
  expect(1).toBe(2);
});
