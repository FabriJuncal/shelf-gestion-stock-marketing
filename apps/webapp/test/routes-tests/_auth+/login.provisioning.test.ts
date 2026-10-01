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

import { action } from "~/routes/_auth+/login";

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
vitest.mock("~/database/db.server", () => ({ db: {} }));
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
  });

  it("creates the application user and personal organization after password authentication", async () => {
    const args = actionArgs(loginRequest());
    const response = await action(args);

    expect(createUser).toHaveBeenCalledWith({
      ...authSession,
      username,
      formatPrefs: detectedPrefs,
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
    });
    expect(args.context.setSession).toHaveBeenCalledWith(authSession);
    expect(response).toBeInstanceOf(Response);
    expect((response as Response).status).toBe(302);
    expect((response as Response).headers.get("location")).toBe("/assets");
  });
});
