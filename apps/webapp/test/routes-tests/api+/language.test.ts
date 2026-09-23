import { assertIsDataWithResponseInit } from "@helpers/assertions";
import { createActionArgs } from "@mocks/remix";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { reconcileLanguageWithSupabase } from "~/i18n/language-sync.server";
import { languageCookie } from "~/i18n/language.server";
import { validateSession } from "~/modules/auth/service.server";
import { updateUser } from "~/modules/user/service.server";
import { action } from "~/routes/api+/language";

// @vitest-environment node

// why: verify route orchestration without writing account data.
vi.mock("~/modules/user/service.server", () => ({ updateUser: vi.fn() }));

// why: exercise partial-success behavior without changing remote Auth metadata.
vi.mock("~/i18n/language-sync.server", () => ({
  reconcileLanguageWithSupabase: vi.fn(),
}));

// why: exercise valid and revoked optional sessions without querying the
// hosted Supabase Auth schema.
vi.mock("~/modules/auth/service.server", () => ({ validateSession: vi.fn() }));

function request(language: "en" | "es") {
  return new Request("http://localhost/api/language", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ language }),
  });
}

describe("POST /api/language", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stores only a cookie for an anonymous visitor", async () => {
    const getSession = vi.fn();

    const response = await action(
      createActionArgs({
        request: request("es"),
        context: { isAuthenticated: false, getSession } as never,
      })
    );

    assertIsDataWithResponseInit(response);
    expect(response.data).toEqual({ error: null, language: "es" });
    await expect(
      languageCookie.parse(
        new Headers(response.init?.headers).get("set-cookie")
      )
    ).resolves.toBe("es");
    expect(getSession).not.toHaveBeenCalled();
    expect(validateSession).not.toHaveBeenCalled();
    expect(updateUser).not.toHaveBeenCalled();
    expect(reconcileLanguageWithSupabase).not.toHaveBeenCalled();
  });

  it("persists an authenticated choice and reports pending Auth sync", async () => {
    vi.mocked(validateSession).mockResolvedValue(true);
    vi.mocked(reconcileLanguageWithSupabase).mockResolvedValue("pending");

    const response = await action(
      createActionArgs({
        request: request("es"),
        context: {
          isAuthenticated: true,
          getSession: () => ({
            refreshToken: "valid-refresh-token",
            userId: "user-1",
          }),
        } as never,
      })
    );

    assertIsDataWithResponseInit(response);
    expect(validateSession).toHaveBeenCalledWith("valid-refresh-token");
    expect(updateUser).toHaveBeenCalledWith({
      id: "user-1",
      language: "es",
    });
    expect(reconcileLanguageWithSupabase).toHaveBeenCalledWith("user-1", "es");
    expect(response.data).toEqual({
      error: null,
      language: "es",
      languageSyncPending: true,
    });
    await expect(
      languageCookie.parse(
        new Headers(response.init?.headers).get("set-cookie")
      )
    ).resolves.toBe("es");
  });

  it("treats a revoked optional session as a visitor", async () => {
    vi.mocked(validateSession).mockResolvedValue(false);
    const destroySession = vi.fn();

    const response = await action(
      createActionArgs({
        request: request("es"),
        context: {
          destroySession,
          isAuthenticated: true,
          getSession: () => ({
            refreshToken: "revoked-refresh-token",
            userId: "user-1",
          }),
        } as never,
      })
    );

    assertIsDataWithResponseInit(response);
    expect(validateSession).toHaveBeenCalledWith("revoked-refresh-token");
    expect(destroySession).toHaveBeenCalledOnce();
    expect(response.data).toEqual({ error: null, language: "es" });
    await expect(
      languageCookie.parse(
        new Headers(response.init?.headers).get("set-cookie")
      )
    ).resolves.toBe("es");
    expect(updateUser).not.toHaveBeenCalled();
    expect(reconcileLanguageWithSupabase).not.toHaveBeenCalled();
  });
});
