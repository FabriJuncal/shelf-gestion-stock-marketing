import type { ActionFunctionArgs } from "react-router";

import { ORGANIZATION_ID, USER_EMAIL, USER_ID } from "@mocks/user";

import {
  refreshAccessToken,
  signInWithEmail,
} from "~/modules/auth/service.server";
import {
  getSelectedOrganization,
  setSelectedOrganizationIdCookie,
} from "~/modules/organization/context.server";
import { createUser, findUserByEmail } from "~/modules/user/service.server";
import { generateUniqueUsername } from "~/modules/user/utils.server";
import { detectFormatPrefsFromHints } from "~/utils/date-format";
import { db } from "~/database/db.server";
import { reconcileLanguageWithSupabase } from "~/i18n/language-sync.server";
import { getSupabaseAdmin } from "~/integrations/supabase/client";

import { action } from "~/routes/_auth+/login";
import { AUTH_ERROR_CODES } from "~/modules/auth/localize-error.server";
import { ShelfError } from "~/utils/error";

// @vitest-environment node

// why: exercise the login action without making a real Supabase request.
vitest.mock("~/modules/auth/service.server", () => ({
  refreshAccessToken: vitest.fn(),
  signInWithEmail: vitest.fn(),
}));
// why: exercise provisioning behavior without writing to Prisma.
vitest.mock("~/modules/user/service.server", () => ({
  createUser: vitest.fn(),
  findUserByEmail: vitest.fn(),
}));
// why: keep generated usernames deterministic for the provisioning assertion.
vitest.mock("~/modules/user/utils.server", () => ({
  generateUniqueUsername: vitest.fn(),
}));
// why: isolate login provisioning from organization selection and cookie I/O.
vitest.mock("~/modules/organization/context.server", () => ({
  getSelectedOrganization: vitest.fn(),
  setSelectedOrganizationIdCookie: vitest.fn(),
}));
// why: importing the route otherwise initializes Prisma in this DB-less test.
vitest.mock("~/database/db.server", () => ({
  db: { user: { findUnique: vitest.fn() } },
}));
// why: read signup metadata without calling the real Supabase Admin API.
vitest.mock("~/integrations/supabase/client", () => ({
  getSupabaseAdmin: vitest.fn(),
}));
// why: assert provisioning independently from the external metadata write.
vitest.mock("~/i18n/language-sync.server", () => ({
  reconcileLanguageWithSupabase: vitest.fn(),
  withLanguageSyncStatus: (destination: string, status: string) =>
    status === "pending"
      ? `${destination}${
          destination.includes("?") ? "&" : "?"
        }languageSync=pending`
      : destination,
}));
// why: pin browser-derived preferences so the assertion is host-independent.
vitest.mock("~/utils/date-format", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return { ...actual, detectFormatPrefsFromHints: vitest.fn() };
});

const authSession = {
  userId: USER_ID,
  email: USER_EMAIL,
  accessToken: "test-access-token",
  refreshToken: "test-refresh-token",
  expiresIn: 3600,
  expiresAt: 4102444800,
};
const username = `test-user-${USER_ID}`;
const detectedPrefs = {
  dateFormat: "YYYY_MM_DD",
  timeFormat: "H24",
  weekStart: "MONDAY",
  timeZone: "America/Argentina/Cordoba",
} as const;

function actionArgs(request: Request): ActionFunctionArgs {
  return {
    request,
    context: { isAuthenticated: false, setSession: vitest.fn() },
    params: {},
  } as ActionFunctionArgs;
}

function loginRequest() {
  return new Request("http://localhost/login", {
    method: "POST",
    headers: {
      "accept-language": "es-AR",
      "content-type": "application/x-www-form-urlencoded",
      cookie: "CH-time-zone=America%2FArgentina%2FCordoba",
    },
    body: new URLSearchParams({
      email: USER_EMAIL,
      password: "valid-test-password",
    }),
  });
}

function confirmationRequest() {
  return new Request("http://localhost/login", {
    method: "POST",
    headers: {
      "accept-language": "es-AR",
      "content-type": "application/x-www-form-urlencoded",
      cookie: "CH-time-zone=America%2FArgentina%2FCordoba",
    },
    body: new URLSearchParams({
      intent: "complete-email-confirmation",
      refreshToken: "test-refresh-token",
    }),
  });
}

describe("login action — missing Shelf account provisioning", () => {
  beforeEach(() => {
    vitest.clearAllMocks();
    vitest.mocked(refreshAccessToken).mockResolvedValue(authSession as never);
    vitest.mocked(signInWithEmail).mockResolvedValue(authSession);
    vitest.mocked(findUserByEmail).mockResolvedValue(null);
    vitest.mocked(generateUniqueUsername).mockResolvedValue(username);
    vitest.mocked(createUser).mockResolvedValue({ id: USER_ID } as never);
    vitest.mocked(getSelectedOrganization).mockResolvedValue({
      organizationId: ORGANIZATION_ID,
    } as never);
    vitest
      .mocked(setSelectedOrganizationIdCookie)
      .mockResolvedValue("selected-organization-cookie" as never);
    vitest.mocked(detectFormatPrefsFromHints).mockReturnValue(detectedPrefs);
    vitest.mocked(getSupabaseAdmin).mockReturnValue({
      auth: {
        admin: {
          getUserById: vitest.fn().mockResolvedValue({
            data: { user: { user_metadata: { language: "es" } } },
            error: null,
          }),
        },
      },
    } as never);
    vitest
      .mocked(db.user.findUnique)
      .mockResolvedValue({ language: "es" } as never);
    vitest.mocked(reconcileLanguageWithSupabase).mockResolvedValue("synced");
  });

  it("creates the application user and personal organization after password authentication", async () => {
    const args = actionArgs(loginRequest());
    const response = await action(args);

    expect(createUser).toHaveBeenCalledWith({
      ...authSession,
      username,
      formatPrefs: detectedPrefs,
      language: "es",
    });
    expect(getSelectedOrganization).toHaveBeenCalledWith({
      userId: USER_ID,
      request: args.request,
    });
    expect(args.context.setSession).toHaveBeenCalledWith(authSession);
    expect(response).toBeInstanceOf(Response);
    expect((response as Response).status).toBe(302);
    expect((response as Response).headers.get("location")).toBe("/assets");
  });

  it("does not recreate an existing application user", async () => {
    vitest.mocked(findUserByEmail).mockResolvedValue({ id: USER_ID } as never);

    await action(actionArgs(loginRequest()));

    expect(generateUniqueUsername).not.toHaveBeenCalled();
    expect(createUser).not.toHaveBeenCalled();
  });

  it("completes provisioning from a verified Supabase email link", async () => {
    const args = actionArgs(confirmationRequest());
    const response = await action(args);

    expect(refreshAccessToken).toHaveBeenCalledWith("test-refresh-token");
    expect(signInWithEmail).not.toHaveBeenCalled();
    expect(createUser).toHaveBeenCalledWith({
      ...authSession,
      username,
      formatPrefs: detectedPrefs,
      language: "es",
    });
    expect(args.context.setSession).toHaveBeenCalledWith(authSession);
    expect(response).toBeInstanceOf(Response);
    expect((response as Response).status).toBe(302);
    expect((response as Response).headers.get("location")).toBe("/assets");
  });

  it("does not provision when the Auth metadata lookup fails", async () => {
    vitest.mocked(getSupabaseAdmin).mockReturnValue({
      auth: {
        admin: {
          getUserById: vitest.fn().mockResolvedValue({
            data: { user: null },
            error: new Error("Auth API unavailable"),
          }),
        },
      },
    } as never);

    const response = await action(actionArgs(loginRequest()));

    expect(createUser).not.toHaveBeenCalled();
    expect((response as { init: ResponseInit }).init.status).toBe(500);
  });

  it("uses the validated request language when Auth metadata has no language", async () => {
    vitest.mocked(getSupabaseAdmin).mockReturnValue({
      auth: {
        admin: {
          getUserById: vitest.fn().mockResolvedValue({
            data: { user: { user_metadata: {} } },
            error: null,
          }),
        },
      },
    } as never);

    await action(actionArgs(loginRequest()));

    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({ language: "es" })
    );
  });

  it("keeps the session and exposes a pending metadata sync", async () => {
    vitest.mocked(reconcileLanguageWithSupabase).mockResolvedValue("pending");

    const args = actionArgs(loginRequest());
    const response = (await action(args)) as Response;

    expect(args.context.setSession).toHaveBeenCalledWith(authSession);
    expect(response.headers.get("location")).toBe(
      "/assets?languageSync=pending"
    );
  });

  it("localizes tagged authentication failures", async () => {
    vitest.mocked(signInWithEmail).mockRejectedValue(
      new ShelfError({
        cause: null,
        label: "Auth",
        message: "Incorrect email or password",
        shouldBeCaptured: false,
        additionalData: {
          authErrorCode: AUTH_ERROR_CODES.invalidCredentials,
        },
      })
    );

    const response = (await action(actionArgs(loginRequest()))) as {
      data: { error: { message: string } };
    };

    expect(response.data.error.message).toBe(
      "El correo o la contraseña son incorrectos."
    );
  });
});
