/**
 * Mobile SSO callback (native-app web-delegated auth).
 *
 * Supabase redirects here (instead of `/oauth/callback`) after it validates the
 * SAML assertion for a `platform=mobile` SSO sign-in. SSO completion is
 * identical to the web callback — user/org provisioning + SCIM linking via
 * `resolveUserAndOrgForSsoCallback` — except that instead of establishing a web
 * session we mint a single-use authorization code and hand it back to the app
 * through the `shelf://auth-callback?code=…` deeplink. The app then redeems the
 * code at `POST /api/mobile/exchange` for a fresh, independent session.
 *
 * No tokens ever appear in the deeplink — only the short-lived, single-use code.
 *
 * @see apps/webapp/app/modules/auth/mobile-sso.server.ts
 * @see apps/webapp/app/routes/api+/mobile+/exchange.ts
 * @see apps/webapp/app/routes/_auth+/oauth.callback.tsx — web counterpart
 */

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import { data, useFetcher } from "react-router";
import { z } from "zod";
import { Button } from "~/components/shared/button";
import { Spinner } from "~/components/shared/spinner";
import { config } from "~/config/shelf.config";
import { createI18n } from "~/i18n/i18n";
import { reconcileLanguageWithSupabase } from "~/i18n/language-sync.server";
import { resolveRequestLanguage } from "~/i18n/language.server";
import { supabaseClient } from "~/integrations/supabase/client";
import { localizeAuthError } from "~/modules/auth/localize-error.server";
import { createMobileAuthCode } from "~/modules/auth/mobile-sso.server";
import { refreshAccessToken } from "~/modules/auth/service.server";
import { appendToMetaTitle } from "~/utils/append-to-meta-title";
import { createSSOFormData } from "~/utils/auth";
import { detectFormatPrefsForPersistence } from "~/utils/client-hints";
import { mobilePkceChallengeCookie } from "~/utils/cookies.server";
import { notAllowedMethod, ShelfError } from "~/utils/error";
import {
  getActionMethod,
  logException,
  parseData,
  payload,
  readFormData,
} from "~/utils/http.server";
import { resolveUserAndOrgForSsoCallback } from "~/utils/sso.server";

/** Custom-scheme deeplink the companion app registers and listens for. */
const MOBILE_CALLBACK_URL = "shelf://auth-callback";

/**
 * Mirrors the web callback's payload: the client reads the Supabase session
 * from the URL fragment and posts the refresh token + SAML claims. We re-derive
 * the session server-side and never trust the client-supplied tokens.
 */
function createMobileCallbackSchema(t: (key: string) => string) {
  return z.object({
    firstName: z.string().min(1, t("auth:firstNameRequired")),
    lastName: z.string().min(1, t("auth:lastNameRequired")),
    groups: z
      .union([
        z.string().transform((str) => {
          try {
            const parsed = JSON.parse(str);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        }),
        z.array(z.string()),
      ])
      .default([]),
    refreshToken: z.string().min(1),
    // `createSSOFormData` always includes a redirectTo; it is unused on mobile.
    redirectTo: z.string().optional(),
    phone: z.string().optional(),
    streetAddress: z.string().optional(),
    city: z.string().optional(),
    stateProvince: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const { disableSSO } = config;
  // Clears the one-shot PKCE challenge cookie. Applied on every exit path —
  // success (once the challenge is bound to the code) and failure (so an
  // abandoned flow doesn't leave the challenge readable for its full TTL).
  const clearChallengeCookie = await mobilePkceChallengeCookie.serialize("", {
    maxAge: 0,
  });
  const language = await resolveRequestLanguage({ request });
  const i18n = createI18n(language);
  try {
    if (disableSSO) {
      throw new ShelfError({
        cause: null,
        title: i18n.t("auth:ssoDisabled"),
        message: i18n.t("auth:contactWorkspaceAdmin"),
        label: "User onboarding",
        status: 403,
        shouldBeCaptured: false,
      });
    }

    const method = getActionMethod(request);

    switch (method) {
      case "POST": {
        // why: readFormData (not request.formData()) so a malformed body / wrong
        // Content-Type is downgraded to a non-captured 400, rather than a
        // TypeError that logException would otherwise surface as a captured 5xx.
        const {
          refreshToken,
          firstName,
          lastName,
          groups,
          phone,
          streetAddress,
          city,
          stateProvince,
          postalCode,
          country,
        } = parseData(
          await readFormData(request),
          createMobileCallbackSchema((key) => i18n.t(key))
        );

        // Don't trust client tokens — re-derive the session from the refresh
        // token server-side (same trust boundary as the web callback).
        const authSession = await refreshAccessToken(refreshToken);

        const contactInfo = {
          phone,
          street: streetAddress,
          city,
          stateProvince,
          zipPostalCode: postalCode,
          countryRegion: country,
        };

        // Provision the user/org exactly as the web flow does (creates the user
        // on first login, links SCIM groups). The app's bearer-auth API looks
        // the user up by email, so this must run before we mint a code.
        // Same detection as the web callback; timeZone is null when the mobile
        // Request lacks the CH-time-zone cookie (see
        // detectFormatPrefsForPersistence), so the lazy backfill fills the real
        // zone later rather than sticking on the "UTC" fallback.
        const formatPrefs = detectFormatPrefsForPersistence(request);
        const { user } = await resolveUserAndOrgForSsoCallback({
          authSession,
          firstName,
          lastName,
          groups,
          contactInfo,
          formatPrefs,
          language,
        });
        await reconcileLanguageWithSupabase(authSession.userId, user.language);

        // PKCE: `/sso-login` stashes the S256 challenge in a short-lived cookie
        // at the start of the flow. Bind it to the auth code so the exchange
        // must present a matching verifier. Whenever that cookie does not reach
        // us the code is minted unbound, and redemption refuses it outright —
        // an unbound code is never honoured as a bearer token.
        const codeChallenge = await mobilePkceChallengeCookie.parse(
          request.headers.get("Cookie")
        );

        // Hand the device a single-use code via the deeplink — never tokens.
        const code = await createMobileAuthCode(
          authSession.userId,
          typeof codeChallenge === "string" ? codeChallenge : undefined
        );

        return data(
          payload({
            deeplink: `${MOBILE_CALLBACK_URL}?code=${encodeURIComponent(code)}`,
          }),
          {
            // Clear the one-shot challenge cookie now that it's bound to the code.
            headers: { "Set-Cookie": clearChallengeCookie },
          }
        );
      }
    }

    throw notAllowedMethod(method);
  } catch (cause) {
    const reason = localizeAuthError(cause, (key) => i18n.t(key));
    // why: the client renders `result.error` and never re-throws, so without an
    // explicit log a genuine 5xx (refresh-token exchange, user/org provisioning,
    // or code mint failing) would never reach Sentry. `logException` mirrors
    // `error()`'s logging (5xx → Sentry, handled 4xx → trail, aborts skipped).
    logException(reason);
    return data(
      { error: { message: reason.message } },
      {
        status: reason.status,
        headers: { "Set-Cookie": clearChallengeCookie },
      }
    );
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const i18n = createI18n(await resolveRequestLanguage({ request }));
  const title = i18n.t("auth:signingYouIn");
  const subHeading = i18n.t("auth:connectingAccount");

  return data(payload({ title, subHeading }));
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data ? appendToMetaTitle(data.title) : "" },
];

export default function MobileLoginCallback() {
  const { t } = useTranslation();
  const fetcher = useFetcher<typeof action>();
  const result = fetcher.data;

  useEffect(() => {
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, supabaseSession) => {
      if (event === "SIGNED_IN") {
        // Supabase reads the session from the URL fragment (client-only). We
        // forward only the refresh token; the action re-derives the session.
        const refreshToken = supabaseSession?.refresh_token;
        if (!refreshToken) return;

        const formData = createSSOFormData(supabaseSession, refreshToken, "");
        void fetcher.submit(formData, { method: "post" });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetcher]);

  // Once the server returns the deeplink, bounce back into the app. In the
  // system browser opened by `expo-web-browser`, navigating to the `shelf://`
  // scheme closes the auth session and returns the code to the app.
  useEffect(() => {
    if (result && "deeplink" in result && result.deeplink) {
      window.location.href = result.deeplink;
    }
  }, [result]);

  const errorMessage =
    result && "error" in result ? result.error?.message : undefined;

  return (
    <div className="flex justify-center text-center">
      {errorMessage ? (
        <div>
          <div className="text-sm text-error-500">{errorMessage}</div>
          <Button to="/" className="mt-4">
            {t("auth:backToLogin")}
          </Button>
        </div>
      ) : (
        <Spinner />
      )}
    </div>
  );
}
