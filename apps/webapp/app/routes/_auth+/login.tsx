import { useEffect, useRef } from "react";

import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import {
  data,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "react-router";

import { useZorm } from "react-zorm";
import { z } from "zod";
import { Form } from "~/components/custom-form";

import Input from "~/components/forms/input";
import PasswordInput from "~/components/forms/password-input";
import { Button } from "~/components/shared/button";
import { config } from "~/config/shelf.config";
import { useSearchParams } from "~/hooks/search-params";
import { useAutoFocus } from "~/hooks/use-auto-focus";
import { ContinueWithEmailForm } from "~/modules/auth/components/continue-with-email-form";
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
import { appendToMetaTitle } from "~/utils/append-to-meta-title";
import { detectFormatPrefsForPersistence } from "~/utils/client-hints";
import { setCookie } from "~/utils/cookies.server";
import {
  ShelfError,
  isLikeShelfError,
  isZodValidationError,
  makeShelfError,
  notAllowedMethod,
} from "~/utils/error";
import { isFormProcessing } from "~/utils/form";
import {
  payload,
  error,
  getActionMethod,
  parseData,
  safeRedirect,
} from "~/utils/http.server";
import { validEmail } from "~/utils/misc";

export function loader({ context }: LoaderFunctionArgs) {
  const title = "Log in";
  const subHeading = "Welcome back! Enter your details below to log in.";
  const { disableSignup, disableSSO } = config;

  if (context.isAuthenticated) {
    return redirect("/assets");
  }

  return data(payload({ title, subHeading, disableSignup, disableSSO }));
}

const LoginFormSchema = z.object({
  email: z
    .string()
    .transform((email) => email.toLowerCase())
    .refine(validEmail, () => ({
      message: "Please enter a valid email",
    })),
  password: z.string().min(8, "Password is too short. Minimum 8 characters."),
  redirectTo: z.string().optional(),
});

const EmailConfirmationSchema = z.object({
  intent: z.literal("complete-email-confirmation"),
  refreshToken: z.string().min(1),
  redirectTo: z.string().optional(),
});

async function completeLogin({
  authSession,
  context,
  request,
  redirectTo,
}: {
  authSession: Awaited<ReturnType<typeof refreshAccessToken>>;
  context: ActionFunctionArgs["context"];
  request: Request;
  redirectTo?: string;
}) {
  const { email, userId } = authSession;

  /**
   * A Supabase confirmation link can authenticate a user before Shelf has
   * provisioned its application user and personal organization. Complete that
   * setup idempotently for both confirmation links and password login.
   */
  const userExists = Boolean(await findUserByEmail(email));

  if (!userExists) {
    try {
      const username = await generateUniqueUsername(email);
      const formatPrefs = detectFormatPrefsForPersistence(request);
      await createUser({
        ...authSession,
        username,
        formatPrefs,
      });
    } catch (createError) {
      // A simultaneous OTP/password request may already have created it.
      const userNowExists = Boolean(await findUserByEmail(email));
      if (!userNowExists) {
        throw createError;
      }
    }
  }

  const { organizationId } = await getSelectedOrganization({
    userId,
    request,
  });

  context.setSession(authSession);

  return redirect(safeRedirect(redirectTo || "/assets"), {
    headers: [setCookie(await setSelectedOrganizationIdCookie(organizationId))],
  });
}

export async function action({ context, request }: ActionFunctionArgs) {
  try {
    const method = getActionMethod(request);

    switch (method) {
      case "POST": {
        // Guard against bots sending non-form content types
        const contentType = request.headers.get("content-type") || "";
        if (
          !contentType.includes("application/x-www-form-urlencoded") &&
          !contentType.includes("multipart/form-data")
        ) {
          return data(
            error(
              new ShelfError({
                cause: null,
                message: "Invalid request",
                label: "Request validation",
                shouldBeCaptured: false,
                status: 400,
              }),
              false
            ),
            { status: 400 }
          );
        }

        let formData: FormData;
        try {
          formData = await request.formData();
        } catch (cause) {
          return data(
            error(
              new ShelfError({
                cause,
                message: "Invalid request body",
                label: "Request validation",
                shouldBeCaptured: false,
                status: 400,
              }),
              false
            ),
            { status: 400 }
          );
        }

        if (formData.get("intent") === "complete-email-confirmation") {
          const { refreshToken, redirectTo } = parseData(
            formData,
            EmailConfirmationSchema,
            { shouldBeCaptured: false }
          );
          const authSession = await refreshAccessToken(refreshToken);

          return await completeLogin({
            authSession,
            context,
            request,
            redirectTo,
          });
        }

        const { email, password, redirectTo } = parseData(
          formData,
          LoginFormSchema,
          { shouldBeCaptured: false }
        );

        const authSession = await signInWithEmail(email, password);

        if (!authSession) {
          return redirect(`/otp?email=${encodeURIComponent(email)}&mode=login`);
        }

        return await completeLogin({
          authSession,
          context,
          request,
          redirectTo,
        });
      }
    }

    throw notAllowedMethod(method);
  } catch (cause) {
    const reason = makeShelfError(
      cause,
      undefined,
      isLikeShelfError(cause)
        ? cause.shouldBeCaptured
        : !isZodValidationError(cause)
    );
    return data(error(reason), { status: reason.status });
  }
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data ? appendToMetaTitle(data.title) : "" },
];

export default function IndexLoginForm() {
  const { disableSignup, disableSSO } = useLoaderData<typeof loader>();
  const zo = useZorm("NewQuestionWizardScreen", LoginFormSchema);
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const acceptedInvite = searchParams.get("acceptedInvite");
  const passwordReset = searchParams.get("password_reset");
  const data = useActionData<typeof action>();
  const submit = useSubmit();
  const confirmationSubmitted = useRef(false);

  useEffect(() => {
    if (confirmationSubmitted.current || !window.location.hash) return;

    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");

    if (!accessToken || !refreshToken) return;

    confirmationSubmitted.current = true;
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${window.location.search}`
    );

    const formData = new FormData();
    formData.set("intent", "complete-email-confirmation");
    formData.set("refreshToken", refreshToken);
    if (redirectTo) formData.set("redirectTo", redirectTo);

    void submit(formData, { method: "post", replace: true });
  }, [redirectTo, submit]);

  const navigation = useNavigation();
  const disabled = isFormProcessing(navigation.state);

  /** Focus the email field on mount (intentional first-field focus on auth pages). */
  const emailInputRef = useAutoFocus<HTMLInputElement>();

  return (
    <div className="w-full max-w-md">
      {acceptedInvite ? (
        <div className="mb-8 text-center text-success-600">
          Successfully accepted workspace invite. Please login to see your new
          workspace.
        </div>
      ) : null}

      {passwordReset ? (
        <div className="mb-8 text-center text-success-600">
          You have successfully reset your password. You can now use your new
          password to login.
        </div>
      ) : null}
      <Form ref={zo.ref} method="post" replace className="flex flex-col gap-5">
        <div>
          <Input
            ref={emailInputRef}
            data-test-id="email"
            label="Email address"
            placeholder="zaans@huisje.com"
            required
            name={zo.fields.email()}
            type="email"
            autoComplete="username"
            disabled={disabled}
            inputClassName="w-full"
            error={zo.errors.email()?.message || data?.error.message}
          />
        </div>
        <PasswordInput
          label="Password"
          placeholder="**********"
          data-test-id="password"
          name={zo.fields.password()}
          autoComplete="current-password"
          disabled={disabled}
          inputClassName="w-full"
          error={zo.errors.password()?.message || data?.error.message}
        />
        <input type="hidden" name={zo.fields.redirectTo()} value={redirectTo} />
        <Button
          className="text-center"
          type="submit"
          data-test-id="login"
          disabled={disabled}
        >
          Log In
        </Button>
        <div className="flex flex-col items-center justify-center">
          <div className="text-center text-sm text-gray-500">
            Don't remember your password?{" "}
            <Button
              variant="link"
              to={{
                pathname: "/forgot-password",
                search: searchParams.toString(),
              }}
            >
              Reset password
            </Button>
          </div>
        </div>
      </Form>
      {!disableSSO && (
        <div className="mt-6 text-center">
          <Button variant="link" to="/sso-login">
            Login with SSO
          </Button>
        </div>
      )}

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">
              Or use a{" "}
              <strong title="One Time Password (OTP) is the most secure way to login. We will send you a code to your email.">
                One Time Password
              </strong>
            </span>
          </div>
        </div>
        <div className="mt-6">
          <ContinueWithEmailForm mode="login" />
        </div>
        {disableSignup ? null : (
          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Button
              variant="link"
              data-test-id="signupButton"
              to={{
                pathname: "/join",
                search: searchParams.toString(),
              }}
            >
              Sign up
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
