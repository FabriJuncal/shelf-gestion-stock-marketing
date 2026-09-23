import type { ActionFunctionArgs } from "react-router";
import { data, redirect } from "react-router";

import { createI18n } from "~/i18n/i18n";
import { resolveRequestLanguage } from "~/i18n/language.server";
import { createSendOtpSchema } from "~/modules/auth/components/continue-with-email-form";
import { localizeAuthError } from "~/modules/auth/localize-error.server";
import { sendOTP } from "~/modules/auth/service.server";
import { makeShelfError, notAllowedMethod } from "~/utils/error";
import { error, getActionMethod, parseData } from "~/utils/http.server";
import { validateNonSSOSignup } from "~/utils/sso.server";

export async function action({ request }: ActionFunctionArgs) {
  const language = await resolveRequestLanguage({ request });
  const i18n = createI18n(language);

  try {
    const method = getActionMethod(request);

    switch (method) {
      case "POST": {
        const { email, mode } = parseData(
          await request.formData(),
          createSendOtpSchema((key) => i18n.t(key)),
          { shouldBeCaptured: false }
        );

        // Only validate SSO for signup attempts
        if (mode === "signup" || mode === "confirm_signup") {
          await validateNonSSOSignup(email);
        }

        await sendOTP(email, language);

        return redirect(`/otp?email=${encodeURIComponent(email)}&mode=${mode}`);
      }
    }

    throw notAllowedMethod(method);
  } catch (cause) {
    const reason = makeShelfError(cause);
    const localizedReason = localizeAuthError(reason, (key) => i18n.t(key));
    return data(error(localizedReason), { status: localizedReason.status });
  }
}
