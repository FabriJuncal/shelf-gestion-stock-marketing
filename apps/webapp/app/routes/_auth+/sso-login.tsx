import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import {
  data,
  redirect,
  Form,
  useActionData,
  useNavigation,
} from "react-router";
import { useZorm } from "react-zorm";
import { z } from "zod";
import Input from "~/components/forms/input";
import { Button } from "~/components/shared/button";
import { config } from "~/config/shelf.config";
import { useSearchParams } from "~/hooks/search-params";
import { useAutoFocus } from "~/hooks/use-auto-focus";
import { createI18n } from "~/i18n/i18n";
import { resolveRequestLanguage } from "~/i18n/language.server";
import { localizeAuthError } from "~/modules/auth/localize-error.server";
import { signInWithSSO } from "~/modules/auth/service.server";
import { appendToMetaTitle } from "~/utils/append-to-meta-title";
import { mobilePkceChallengeCookie } from "~/utils/cookies.server";
import { DEFAULT_SSO_DOMAIN } from "~/utils/env";
import { notAllowedMethod, ShelfError } from "~/utils/error";
import { isFormProcessing } from "~/utils/form";
import {
  payload,
  error,
  getActionMethod,
  parseData,
} from "~/utils/http.server";
import { isValidDomain } from "~/utils/misc";

function createSsoLoginFormSchema(t: (key: string) => string) {
  return z.object({
    domain: z
      .string()
      .transform((email) => email.toLowerCase())
      .refine(isValidDomain, () => ({
        message: t("auth:invalidDomain"),
      })),
    redirectTo: z.string().optional(),
    // "mobile" routes the post-auth redirect to the native-app callback so the
    // companion app can complete SSO login (see signInWithSSO).
    platform: z.enum(["web", "mobile"]).optional(),
  });
}

export async function loader({ context, request }: LoaderFunctionArgs) {
  const i18n = createI18n(await resolveRequestLanguage({ request }));
  const title = i18n.t("auth:ssoTitle");
  const subHeading = i18n.t("auth:ssoHelp");
  const { disableSSO } = config;

  const url = new URL(request.url);
  // The native-app flow opens this page with `?platform=mobile`. The in-app
  // browser may carry a stale web cookie, but the app still needs to complete
  // the SSO handoff to obtain its OWN session — so don't short-circuit it to
  // /assets. The web flow still redirects an already-authenticated session.
  const isMobile = url.searchParams.get("platform") === "mobile";

  try {
    if (context.isAuthenticated && !isMobile) {
      return redirect("/assets");
    }

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

    // PKCE (native SSO): the companion appends an S256 `code_challenge`. Stash
    // it in a short-lived cookie so it survives the SSO redirect chain back to
    // `/oauth/callback/mobile`, where it is bound to the minted auth code.
    const codeChallenge = url.searchParams.get("code_challenge");
    const validChallenge =
      codeChallenge && /^[A-Za-z0-9_-]{43}$/.test(codeChallenge)
        ? codeChallenge
        : null;

    // A mobile flow MUST carry a well-formed challenge. The native callback
    // hands the auth code back over the `shelf://` custom scheme, which any app
    // on the device may claim, so an unbound code would be a bearer token for a
    // full session (RFC 8252 §8.1). Refuse rather than degrade: a request
    // without one cannot have come from the companion, which always sends it.
    if (isMobile && !validChallenge) {
      throw new ShelfError({
        cause: null,
        title: i18n.t("auth:signInNotSupported"),
        message: i18n.t("auth:updateAppForSso"),
        label: "Auth",
        status: 400,
        shouldBeCaptured: false,
      });
    }

    if (isMobile && validChallenge) {
      return data(payload({ title, subHeading }), {
        headers: {
          "Set-Cookie":
            await mobilePkceChallengeCookie.serialize(validChallenge),
        },
      });
    }

    // If a default SSO domain is configured, skip the domain input form and
    // redirect straight to the identity provider. Guarded to web only: mobile
    // (PKCE) requests are handled above and must complete their own handoff,
    // so they should not be short-circuited into the web SSO redirect.
    if (DEFAULT_SSO_DOMAIN && !isMobile) {
      const redirectUrl = await signInWithSSO(DEFAULT_SSO_DOMAIN);
      return redirect(redirectUrl);
    }

    return payload({ title, subHeading });
  } catch (cause) {
    const reason = localizeAuthError(cause, (key) => i18n.t(key));
    throw data(error(reason), { status: reason.status });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const i18n = createI18n(await resolveRequestLanguage({ request }));
  try {
    const method = getActionMethod(request);

    switch (method) {
      case "POST": {
        const { domain, platform } = parseData(
          await request.formData(),
          createSsoLoginFormSchema((key) => i18n.t(key)),
          { shouldBeCaptured: false }
        );
        const url = await signInWithSSO(domain, { platform });

        return redirect(url);
      }
    }

    throw notAllowedMethod(method);
  } catch (cause) {
    const reason = localizeAuthError(cause, (key) => i18n.t(key));
    return data(error(reason), { status: reason.status });
  }
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data ? appendToMetaTitle(data.title) : "" },
];

export default function SSOLogin() {
  const { t } = useTranslation();
  const schema = useMemo(() => createSsoLoginFormSchema((key) => t(key)), [t]);
  const zo = useZorm("NewQuestionWizardScreen", schema);
  const navigation = useNavigation();
  const disabled = isFormProcessing(navigation.state);
  const data = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  // Native-app SSO opens this page with `?platform=mobile`; forward it so the
  // action targets the mobile callback. Defaults to web for the normal flow.
  const platform = searchParams.get("platform") === "mobile" ? "mobile" : "web";

  /** Focus the domain field on mount (intentional first-field focus on auth pages). */
  const domainInputRef = useAutoFocus<HTMLInputElement>();

  return (
    <>
      <div className="flex flex-col gap-3">
        <Form method="post" ref={zo.ref}>
          {/* Forwarded so the action can target the native-app callback. */}
          <input type="hidden" name="platform" value={platform} />
          <div className="flex flex-col gap-3">
            <Input
              ref={domainInputRef}
              data-test-id="domain"
              label={t("auth:companyDomain")}
              placeholder="yourdomain.com"
              required
              name={zo.fields.domain()}
              type="text"
              autoComplete="domain"
              disabled={disabled}
              inputClassName="w-full"
              error={zo.errors.domain()?.message}
            />
            <Button
              className="text-center"
              type="submit"
              data-test-id="login"
              disabled={disabled}
              width="full"
            >
              {t("auth:login")}
            </Button>
          </div>
        </Form>
        {data?.error?.message && (
          <div className="text-sm text-error-500">{data.error.message}</div>
        )}
        <div>
          {t("auth:enableSso")}{" "}
          <Button
            as="a"
            href="mailto:hello@shelf.nu?subject=SSO request"
            variant="link"
          >
            {t("auth:contactUs")}
          </Button>
        </div>
      </div>
    </>
  );
}
