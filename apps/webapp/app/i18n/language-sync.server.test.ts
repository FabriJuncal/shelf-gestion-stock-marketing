import { beforeEach, describe, expect, it, vi } from "vitest";
import { getSupabaseAdmin } from "~/integrations/supabase/client";
import {
  reconcileLanguageWithSupabase,
  withLanguageSyncStatus,
} from "./language-sync.server";

// why: exercise reconciliation outcomes without writing remote Auth metadata.
vi.mock("~/integrations/supabase/client", () => ({
  getSupabaseAdmin: vi.fn(),
}));

describe("language metadata reconciliation", () => {
  const updateUserById = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSupabaseAdmin).mockReturnValue({
      auth: { admin: { updateUserById } },
    } as never);
  });

  it("reports API errors as pending without rejecting the login", async () => {
    updateUserById.mockResolvedValue({ error: new Error("unavailable") });

    await expect(reconcileLanguageWithSupabase("user-123", "es")).resolves.toBe(
      "pending"
    );
  });

  it("reports thrown failures as pending and preserves the destination", async () => {
    updateUserById.mockRejectedValue(new Error("network failure"));

    const status = await reconcileLanguageWithSupabase("user-123", "es");

    expect(status).toBe("pending");
    expect(withLanguageSyncStatus("/assets?page=2", status)).toBe(
      "/assets?page=2&languageSync=pending"
    );
  });

  it("skips accounts without a persisted language", async () => {
    await expect(reconcileLanguageWithSupabase("user-123", null)).resolves.toBe(
      "skipped"
    );
    expect(updateUserById).not.toHaveBeenCalled();
  });
});
