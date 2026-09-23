import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import { data, redirect, useActionData, useFetcher } from "react-router";
import { useZorm } from "react-zorm";
import { z } from "zod";
import { Form } from "~/components/custom-form";
import { ShelfOTP } from "~/components/forms/otp-input";
import { Button } from "~/components/shared/button";
import SubHeading from "~/components/shared/sub-heading";
import { db } from "~/database/db.server";
import { useSearchParams } from "~/hooks/search-params";
import { useDisabled } from "~/hooks/use-disabled";
import { createI18n } from "~/i18n/i18n";
import {
  reconcileLanguageWithSupabase,
  withLanguageSyncStatus,
} from "~/i18n/language-sync.server";
import { resolveRequestLanguage } from "~/i18n/language.server";
import { normalizeLanguage } from "~/i18n/types";
import { getSupabaseAdmin } from "~/integrations/supabase/client";
import {
  AUTH_ERROR_CODES,
  authErrorData,
  localizeAuthError,
} from "~/modules/auth/localize-error.server";
import { verifyOtpAndSignin } from "~/modules/auth/service.server";
import {
  getSelectedOrganization,
  setSelectedOrganizationIdCookie,
} from "~/modules/organization/context.server";
import { createUser, findUserByEmail } from "~/modules/user/service.server";
import { generateUniqueUsername } from "~/modules/user/utils.server";
import { appendToMetaTitle } from "~/utils/append-to-meta-title";
import { detectFormatPrefsForPersistence } from "~/utils/client-hints";
import { setCookie } from "~/utils/cookies.server";
import { ShelfError, makeShelfError, notAllowedMethod } from "~/utils/error";
import { isFormProcessing } from "~/utils/form";
import {
  payload,
  error,
  getActionMethod,
  parseData,
  safeRedirect,
} from "~/utils/http.server";
import { validEmail } from "~/utils/misc";
import { getOtpPageData, type OtpVerifyMode } from "~/utils/otp";
import { tw } from "~/utils/tw";
import type { action as resendOtpAction } from "./resend-otp";

export async function loader({ context, request }: LoaderFunctionArgs) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") as OtpVerifyMode;
  const i18n = createI18n(await resolveRequestLanguage({ request }));
  const title = i18n.t(getOtpPageData(mode).titleKey);

  if (context.isAuthenticated) {
    return redirect("/assets");
  }

  return payload({ title });
}

function createOtpSchema(t: (key: string) => string) {
  return z.object({
    otp: z.string().min(2, t("auth:otpCodeRequired")),
    email: z
      .string()
      .transform((email) => email.toLowerCase())
      .refine(validEmail, () => ({
        message: t("auth:invalidEmail"),
      })),
  });
}

export async function action({ context, request }: ActionFunctionArgs) {
  const i18n = createI18n(await resolveRequestLanguage({ request }));

  try {
    const method = getActionMethod(request);

    switch (method) {
      case "POST": {
        const OtpSchema = createOtpSchema((key) => i18n.t(key));
        let formData: FormData;
        try {
          formData = await request.formData();
        } catch (cause) {
          return data(
            error(
              new ShelfError({
                cause,
                message: i18n.t("auth:invalidRequestBody"),
                label: "Request validation",
                shouldBeCaptured: false,
                status: 400,
              }),
              false
            ),
            { status: 400 }
          );
        }

        const { email, otp } = parseData(formData, OtpSchema, {
          shouldBeCaptured: false,
        });

        const authSession = await verifyOtpAndSignin(email, otp);
        const userExists = Boolean(await findUserByEmail(email));

        if (!userExists) {
          try {
            const username = await generateUniqueUsername(authSession.email);
            // Detect the caller's date/time/week/timezone prefs from browser
            // hints (accept-language + CH-time-zone cookie) and stamp them on
            // the new row. timeZone is left null when the cookie hasn't
            // round-tripped yet (see detectFormatPrefsForPersistence), so the
            // lazy backfill fills the real zone on a later load — never the
            // "UTC" fallback, which would stick forever.
            const formatPrefs = detectFormatPrefsForPersistence(request);
            const { data: authUser, error: authUserError } =
              await getSupabaseAdmin().auth.admin.getUserById(
                authSession.userId
              );
            if (authUserError) {
              throw new ShelfError({
                cause: authUserError,
                label: "Auth",
                message: "Failed to read authentication metadata",
                additionalData: authErrorData(AUTH_ERROR_CODES.generic),
              });
            }

            const language =
              normalizeLanguage(authUser.user?.user_metadata?.language) ??
              (await resolveRequestLanguage({ request }));
            await createUser({
              ...authSession,
              username,
              formatPrefs,
              language,
            });
          } catch (createError) {
            // Handle race condition: if a concurrent request already
            // created this user, verify they exist and proceed.
            // This can happen when two OTP verification requests
            // run simultaneously for the same user.
            const userNowExists = Boolean(await findUserByEmail(email));
            if (!userNowExists) {
              throw createError;
            }
          }
        }

        const localUser = await db.user.findUnique({
          where: { id: authSession.userId },
          select: { language: true },
        });
        const languageSyncStatus = await reconcileLanguageWithSupabase(
          authSession.userId,
          localUser?.language ?? null
        );

        // Setting the auth session and redirecting user to assets page
        context.setSession(authSession);

        const { organizationId } = await getSelectedOrganization({
          userId: authSession.userId,
          request,
        });

        return redirect(
          withLanguageSyncStatus(safeRedirect("/assets"), languageSyncStatus),
          {
            headers: [
              setCookie(await setSelectedOrganizationIdCookie(organizationId)),
            ],
          }
        );
      }
    }

    throw notAllowedMethod(method);
  } catch (cause) {
    const reason = makeShelfError(cause);
    const localizedReason = localizeAuthError(reason, (key) => i18n.t(key));
    return data(error(localizedReason), { status: localizedReason.status });
  }
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data ? appendToMetaTitle(data.title) : "" },
];

type resendAction = typeof resendOtpAction;

export default function OtpPage() {
  const { t } = useTranslation();
  const [message, setMessage] = useState<{
    message: string;
    type: "success" | "error";
  }>();
  const data = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  const fetcher = useFetcher<resendAction>();

  const formRef = useRef<HTMLFormElement>(null);
  const OtpSchema = useMemo(() => createOtpSchema((key) => t(key)), [t]);
  const zo = useZorm("otpForm", OtpSchema);
  const zormRef = useCallback(
    (el: HTMLFormElement | null) => {
      zo.ref(el);
      formRef.current = el;
    },
    [zo]
  );
  const fetcherDisabled = isFormProcessing(fetcher.state);
  const disabled = useDisabled();

  const email = searchParams.get("email") || "";
  const mode = searchParams.get("mode") as OtpVerifyMode;
  const pageData = getOtpPageData(mode);

  function handleResendOtp() {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("mode", mode);

    try {
      void fetcher.submit(formData, {
        method: "POST",
        action: "/resend-otp",
      });
    } catch {
      setMessage({
        message: t("auth:resetUnexpectedError"),
        type: "error",
      });
    }
  }

  /** Handle success and error state when resending with fetcher */
  useEffect(() => {
    if (fetcher?.data) {
      if (fetcher.data.error) {
        setMessage({
          message: fetcher.data.error.message,
          type: "error",
        });
      } else {
        setMessage({
          message: t("auth:emailSent"),
          type: "success",
        });
      }
    }
  }, [fetcher, t]);

  return (
    <>
      <SubHeading className="-mt-4 text-center">
        {t(pageData.subHeadingKey, { email })}
      </SubHeading>

      <div className="mt-2 flex min-h-full flex-col justify-center">
        <div className="mx-auto w-full max-w-md px-8">
          <Form ref={zormRef} method="post" className="space-y-6">
            <ShelfOTP
              error={data?.error.message}
              onComplete={() => formRef.current?.requestSubmit()}
            />

            <input
              type="hidden"
              name="email"
              value={searchParams.get("email") || ""}
            />

            {message?.message && (
              <p
                className={tw(
                  " text-sm",
                  message.type === "error"
                    ? "text-error-500"
                    : "text-success-500"
                )}
              >
                {message.message}
              </p>
            )}

            <Button
              data-test-id="create-account"
              type="submit"
              className="w-full "
              disabled={fetcherDisabled || disabled}
            >
              {t(pageData.buttonKey)}
            </Button>
          </Form>

          <button
            className="mt-6 w-full text-center text-sm font-semibold"
            onClick={handleResendOtp}
          >
            {t("auth:didNotReceiveCode")}{" "}
            <span className="text-primary-500">
              {fetcherDisabled ? t("auth:sendingCode") : t("auth:sendAgain")}
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
