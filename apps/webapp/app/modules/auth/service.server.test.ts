import { config } from "~/config/shelf.config";
import { db } from "~/database/db.server";
import { getSupabaseAdmin } from "~/integrations/supabase/client";

import { AUTH_ERROR_CODES } from "./localize-error.server";
import {
  createEmailAuthAccount,
  sendOTP,
  signInWithSSO,
} from "./service.server";

// @vitest-environment node

// why: verify the Supabase Auth request without sending a real OTP email.
vitest.mock("~/integrations/supabase/client", () => ({
  getSupabaseAdmin: vitest.fn(),
}));

// why: validate the SSO guard without connecting to PostgreSQL.
vitest.mock("~/database/db.server", () => ({
  db: { user: { findUnique: vitest.fn() } },
}));

// why: make the account-creation option deterministic for this unit test.
vitest.mock("~/config/shelf.config", () => ({
  config: { disableSignup: false },
}));

describe("sendOTP", () => {
  it("attaches the resolved language before Supabase creates an OTP user", async () => {
    const signInWithOtp = vitest.fn().mockResolvedValue({ error: null });
    vitest.mocked(getSupabaseAdmin).mockReturnValue({
      auth: { signInWithOtp },
    } as never);
    vitest.mocked(db.user.findUnique).mockResolvedValue(null);

    await sendOTP("person@example.com", "es");

    expect(config.disableSignup).toBe(false);
    expect(signInWithOtp).toHaveBeenCalledWith({
      email: "person@example.com",
      options: {
        shouldCreateUser: true,
        data: {
          signup_method: "otp",
          language: "es",
        },
      },
    });
  });
});

describe("createEmailAuthAccount", () => {
  it("stores the selected language in Auth metadata for invited users", async () => {
    const createUser = vitest.fn().mockResolvedValue({
      data: { user: { id: "auth-user-1" } },
      error: null,
    });
    vitest.mocked(getSupabaseAdmin).mockReturnValue({
      auth: { admin: { createUser } },
    } as never);

    await createEmailAuthAccount(
      "invited@example.com",
      "valid-test-password",
      "es"
    );

    expect(createUser).toHaveBeenCalledWith({
      email: "invited@example.com",
      password: "valid-test-password",
      email_confirm: true,
      user_metadata: { language: "es" },
    });
  });
});

describe("signInWithSSO", () => {
  it("tags a missing provider for route-level localization", async () => {
    const signInWithSso = vitest.fn().mockResolvedValue({
      data: { url: null },
      error: { code: "sso_provider_not_found" },
    });
    vitest.mocked(getSupabaseAdmin).mockReturnValue({
      auth: { signInWithSSO: signInWithSso },
    } as never);

    await expect(signInWithSSO("example.com")).rejects.toMatchObject({
      additionalData: {
        authErrorCode: AUTH_ERROR_CODES.ssoProviderNotFound,
        domain: "example.com",
      },
      shouldBeCaptured: false,
    });
  });
});
