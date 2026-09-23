import { describe, expect, it } from "vitest";
import { isAuthSessionTransition } from "./revalidation";

describe("language root revalidation", () => {
  it.each([
    "/login",
    "/logout",
    "/otp",
    "/oauth/callback",
    "/accept-invite/invite-123",
    "https://example.com/login?redirectTo=%2Fassets",
  ])("revalidates after an auth session transition at %s", (formAction) => {
    expect(isAuthSessionTransition(formAction)).toBe(true);
  });

  it.each([undefined, "/assets", "/api/language-preferences"])(
    "does not classify %s as an auth session transition",
    (formAction) => {
      expect(isAuthSessionTransition(formAction)).toBe(false);
    }
  );
});
