import { assertIsDataWithResponseInit } from "@helpers/assertions";
import type { ActionFunctionArgs } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { reconcileLanguageWithSupabase } from "~/i18n/language-sync.server";
import {
  AUTH_ERROR_CODES,
  authErrorData,
} from "~/modules/auth/localize-error.server";
import { createMobileAuthCode } from "~/modules/auth/mobile-sso.server";
import { refreshAccessToken } from "~/modules/auth/service.server";
import { setSelectedOrganizationIdCookie } from "~/modules/organization/context.server";
import { ShelfError } from "~/utils/error";
import { resolveUserAndOrgForSsoCallback } from "~/utils/sso.server";

// @vitest-environment node

// why: keep both callback actions independent of the deployment feature flag.
vi.mock("~/config/shelf.config", () => ({ config: { disableSSO: false } }));

// why: callbacks must re-derive, but tests must not contact Supabase Auth.
vi.mock("~/modules/auth/service.server", () => ({
  refreshAccessToken: vi.fn(),
}));

// why: isolate SSO provisioning while asserting post-provision reconciliation.
vi.mock("~/utils/sso.server", () => ({
  resolveUserAndOrgForSsoCallback: vi.fn(),
}));

// why: verify best-effort reconciliation without mutating Auth metadata.
vi.mock("~/i18n/language-sync.server", () => ({
  reconcileLanguageWithSupabase: vi.fn(),
  withLanguageSyncStatus: (
    destination: string,
    status: "skipped" | "synced" | "pending"
  ) =>
    status === "pending"
      ? `${destination}${
          destination.includes("?") ? "&" : "?"
        }languageSync=pending`
      : destination,
}));

// why: the web callback sets organization context but must not touch cookies
// backed by production configuration in this route test.
vi.mock("~/modules/organization/context.server", () => ({
  setSelectedOrganizationIdCookie: vi.fn(),
}));

// why: the selected-organization branch avoids these lookups; stubs prevent
// importing their database-backed implementation.
vi.mock("~/modules/organization/service.server", () => ({
  getUserOrganizations: vi.fn(),
  isSsoUser: vi.fn(),
}));

// why: mobile success should prove reconciliation happens before code minting
// without creating a real single-use authorization code.
vi.mock("~/modules/auth/mobile-sso.server", () => ({
  createMobileAuthCode: vi.fn(),
}));

// why: route modules import the browser client for their React component; no
// browser Auth listener is needed when testing server actions.
vi.mock("~/integrations/supabase/client", () => ({
  supabaseClient: { auth: { onAuthStateChange: vi.fn() } },
}));

const { action: webAction } = await import("~/routes/_auth+/oauth.callback");
const { action: mobileAction } = await import(
  "~/routes/_auth+/oauth.callback_.mobile"
);

const authSession = {
  userId: "user-1",
  email: "person@example.com",
  accessToken: "access-token",
  refreshToken: "refresh-token",
  expiresIn: 3600,
  expiresAt: 1_900_000_000,
};

function callbackRequest(path: string) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: {
      "accept-language": "es-AR",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      firstName: "Ada",
      lastName: "Lovelace",
      groups: "[]",
      refreshToken: "refresh-token",
    }),
  });
}

describe("SSO callback language reconciliation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(refreshAccessToken).mockResolvedValue(authSession);
    vi.mocked(resolveUserAndOrgForSsoCallback).mockResolvedValue({
      user: { id: "user-1", language: "es" },
      org: { id: "org-1" },
    } as never);
    vi.mocked(reconcileLanguageWithSupabase).mockResolvedValue("pending");
    vi.mocked(setSelectedOrganizationIdCookie).mockResolvedValue("org-cookie");
    vi.mocked(createMobileAuthCode).mockResolvedValue("mobile-code");
  });

  it("reconciles web SSO metadata and preserves a valid session on failure", async () => {
    const setSession = vi.fn();

    const response = (await webAction({
      request: callbackRequest("/oauth/callback"),
      context: { setSession },
      params: {},
    } as unknown as ActionFunctionArgs)) as Response;

    expect(reconcileLanguageWithSupabase).toHaveBeenCalledWith("user-1", "es");
    expect(setSession).toHaveBeenCalledWith(authSession);
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(
      "/assets?languageSync=pending"
    );
  });

  it("reconciles mobile SSO metadata before minting the app code", async () => {
    const response = await mobileAction({
      request: callbackRequest("/oauth/callback/mobile"),
      context: {},
      params: {},
    } as ActionFunctionArgs);

    assertIsDataWithResponseInit(response);
    expect(reconcileLanguageWithSupabase).toHaveBeenCalledWith("user-1", "es");
    expect(createMobileAuthCode).toHaveBeenCalledWith("user-1", undefined);
    expect(response.data).toEqual({
      deeplink: "shelf://auth-callback?code=mobile-code",
      error: null,
    });
  });

  it("localizes a tagged web callback failure in Spanish", async () => {
    vi.mocked(resolveUserAndOrgForSsoCallback).mockRejectedValue(
      new ShelfError({
        cause: null,
        label: "Auth",
        message: "Email conflict",
        additionalData: authErrorData(AUTH_ERROR_CODES.ssoEmailConflict),
        shouldBeCaptured: false,
      })
    );

    const response = await webAction({
      request: callbackRequest("/oauth/callback"),
      context: { setSession: vi.fn() },
      params: {},
    } as unknown as ActionFunctionArgs);

    assertIsDataWithResponseInit(response);
    expect(response.data.error?.message).toBe(
      "Este correo ya está vinculado a una cuenta personal de Shelf. Contactá a soporte para usar otro correo en esa cuenta antes de iniciar sesión con SSO."
    );
  });

  it("localizes a tagged mobile callback failure in Spanish", async () => {
    vi.mocked(resolveUserAndOrgForSsoCallback).mockRejectedValue(
      new ShelfError({
        cause: null,
        label: "Auth",
        message: "Email conflict",
        additionalData: authErrorData(AUTH_ERROR_CODES.ssoEmailConflict),
        shouldBeCaptured: false,
      })
    );

    const response = await mobileAction({
      request: callbackRequest("/oauth/callback/mobile"),
      context: {},
      params: {},
    } as ActionFunctionArgs);

    assertIsDataWithResponseInit(response);
    expect(response.data.error?.message).toBe(
      "Este correo ya está vinculado a una cuenta personal de Shelf. Contactá a soporte para usar otro correo en esa cuenta antes de iniciar sesión con SSO."
    );
  });
});
