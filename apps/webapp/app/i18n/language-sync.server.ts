import { getSupabaseAdmin } from "~/integrations/supabase/client";
import type { AppLanguage } from "./types";

export type LanguageReconciliationStatus = "skipped" | "synced" | "pending";

/** Updates only Auth metadata used by Supabase's email templates. */
export async function syncLanguageToSupabase(
  userId: string,
  language: AppLanguage
) {
  const { error } = await getSupabaseAdmin().auth.admin.updateUserById(userId, {
    user_metadata: { language },
  });
  return error;
}

/** Best-effort reconciliation after authentication. A stale email locale must
 * never prevent a valid session from being established. */
export async function reconcileLanguageWithSupabase(
  userId: string,
  language: AppLanguage | null
): Promise<LanguageReconciliationStatus> {
  if (!language) return "skipped";
  try {
    const error = await syncLanguageToSupabase(userId, language);
    return error ? "pending" : "synced";
  } catch {
    // The next authenticated request can retry; preserve login availability.
    return "pending";
  }
}

export function withLanguageSyncStatus(
  destination: string,
  status: LanguageReconciliationStatus
) {
  if (status !== "pending") return destination;

  const url = new URL(destination, "https://shelf.local");
  url.searchParams.set("languageSync", "pending");
  return `${url.pathname}${url.search}${url.hash}`;
}
