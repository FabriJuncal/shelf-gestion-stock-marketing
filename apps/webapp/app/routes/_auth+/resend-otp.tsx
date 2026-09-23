import type { ActionFunctionArgs } from "react-router";
import { data } from "react-router";
import { z } from "zod";
import { createI18n } from "~/i18n/i18n";
import { resolveRequestLanguage } from "~/i18n/language.server";
import { localizeAuthError } from "~/modules/auth/localize-error.server";
import { sendOTP } from "~/modules/auth/service.server";
import { makeShelfError, notAllowedMethod } from "~/utils/error";

import {
  payload,
  error,
  getActionMethod,
  parseData,
} from "~/utils/http.server";
import { validEmail } from "~/utils/misc";

export async function action({ request }: ActionFunctionArgs) {
  const language = await resolveRequestLanguage({ request });
  const i18n = createI18n(language);

  try {
    const method = getActionMethod(request);

    switch (method) {
      case "POST": {
        const { email } = parseData(
          await request.formData(),
          z.object({
            email: z
              .string()
              .transform((email) => email.toLowerCase())
              .refine(validEmail, () => ({
                message: i18n.t("auth:invalidEmail"),
              })),
          }),
          { shouldBeCaptured: false }
        );

        await sendOTP(email, language);
        return payload({ success: true });
      }
    }

    throw notAllowedMethod(method);
  } catch (cause) {
    const reason = makeShelfError(cause);
    const localizedReason = localizeAuthError(reason, (key) => i18n.t(key));
    return data(error(localizedReason), { status: localizedReason.status });
  }
}
