import { useTranslation } from "react-i18next";
import { useFetcher, useRouteLoaderData } from "react-router";
import type { AppLanguage } from "~/i18n/types";
import type { loader as rootLoader } from "~/root";

/** Small, accessible selector for visitors and the authentication shell. */
export function LanguageSwitcher() {
  const fetcher = useFetcher<{
    language: AppLanguage;
    languageSyncPending?: boolean;
  }>();
  const root = useRouteLoaderData<typeof rootLoader>("root");
  const { t } = useTranslation();
  const language = root?.requestInfo.language ?? "en";

  return (
    <fetcher.Form action="/api/language" method="post">
      <label className="sr-only" htmlFor="visitor-language">
        {t("common:language")}
      </label>
      <select
        id="visitor-language"
        name="language"
        defaultValue={language}
        onChange={(event) => {
          void fetcher.submit(
            { language: event.target.value as AppLanguage },
            { action: "/api/language", method: "post" }
          );
        }}
        className="rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700"
      >
        <option value="en">{t("common:english")}</option>
        <option value="es">{t("common:spanish")}</option>
      </select>
      {fetcher.data?.languageSyncPending ? (
        <p className="mt-1 max-w-52 text-xs text-warning-600" role="status">
          {t("common:languageSyncPending")}
        </p>
      ) : null}
    </fetcher.Form>
  );
}
