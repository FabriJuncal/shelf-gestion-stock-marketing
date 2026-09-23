export const APP_LANGUAGES = ["en", "es"] as const;
export type AppLanguage = (typeof APP_LANGUAGES)[number];

export function isAppLanguage(value: unknown): value is AppLanguage {
  return (
    typeof value === "string" && APP_LANGUAGES.includes(value as AppLanguage)
  );
}

/** Turns BCP-47 browser tags into the two languages the product supports. */
export function normalizeLanguage(value: unknown): AppLanguage | null {
  if (typeof value !== "string") return null;
  const primary = value.trim().toLowerCase().split("-")[0];
  return isAppLanguage(primary) ? primary : null;
}
