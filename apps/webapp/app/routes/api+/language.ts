import type { ActionFunctionArgs } from "react-router";
import { data } from "react-router";
import { z } from "zod";
import { reconcileLanguageWithSupabase } from "~/i18n/language-sync.server";
import { languageCookie } from "~/i18n/language.server";
import { validateSession } from "~/modules/auth/service.server";
import { updateUser } from "~/modules/user/service.server";
import { payload, parseData } from "~/utils/http.server";

const LanguageSchema = z.object({ language: z.enum(["en", "es"]) });

/** Stores a visitor's choice in a cookie. If the request has an authenticated
 * session, the same action also persists the canonical account preference and
 * best-effort Auth metadata used by email templates. */
export async function action({ context, request }: ActionFunctionArgs) {
  const { language } = parseData(await request.formData(), LanguageSchema, {
    shouldBeCaptured: false,
  });
  const headers = {
    "Set-Cookie": await languageCookie.serialize(language),
  };

  if (!context.isAuthenticated) {
    return data(payload({ language }), { headers });
  }

  const { refreshToken, userId } = context.getSession();
  const hasValidSession = await validateSession(refreshToken);

  if (!hasValidSession) {
    context.destroySession();
    return data(payload({ language }), { headers });
  }

  await updateUser({ id: userId, language });
  const languageSyncStatus = await reconcileLanguageWithSupabase(
    userId,
    language
  );

  return data(
    payload({
      language,
      ...(languageSyncStatus === "pending"
        ? { languageSyncPending: true }
        : {}),
    }),
    { headers }
  );
}
