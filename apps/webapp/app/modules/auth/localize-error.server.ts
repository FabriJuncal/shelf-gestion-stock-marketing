import { isLikeShelfError, makeShelfError, ShelfError } from "~/utils/error";

export const AUTH_ERROR_CODE_KEY = "authErrorCode";

export const AUTH_ERROR_CODES = {
  invalidCredentials: "invalid_credentials",
  invalidOtp: "invalid_otp",
  rateLimited: "rate_limited",
  signupFailed: "signup_failed",
  otpSendFailed: "otp_send_failed",
  ssoRequired: "sso_required",
  ssoDomainRequired: "sso_domain_required",
  ssoProviderNotFound: "sso_provider_not_found",
  ssoEmailConflict: "sso_email_conflict",
  generic: "generic",
} as const;

export type AuthErrorCode =
  (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];

const translationKeyByCode: Record<AuthErrorCode, string> = {
  invalid_credentials: "auth:incorrectEmailOrPassword",
  invalid_otp: "auth:invalidExpiredCode",
  rate_limited: "auth:tooManyRequests",
  signup_failed: "auth:signupFailed",
  otp_send_failed: "auth:otpSendFailed",
  sso_required: "auth:ssoAccountRequired",
  sso_domain_required: "auth:ssoDomainRequired",
  sso_provider_not_found: "auth:ssoProviderNotFound",
  sso_email_conflict: "auth:ssoEmailConflict",
  generic: "auth:authenticationFailed",
};

export function authErrorData(
  code: AuthErrorCode,
  additionalData: Record<string, string> = {}
) {
  return { ...additionalData, [AUTH_ERROR_CODE_KEY]: code };
}

function isAuthErrorCode(value: unknown): value is AuthErrorCode {
  return Object.values(AUTH_ERROR_CODES).includes(value as AuthErrorCode);
}

/** Localizes only failures deliberately tagged by the Auth service. Validation
 * and business errors keep their already-localized route messages. */
export function localizeAuthError(
  cause: unknown,
  t: (key: string) => string
): ShelfError {
  const reason = makeShelfError(cause);
  const code = isLikeShelfError(cause)
    ? cause.additionalData?.[AUTH_ERROR_CODE_KEY]
    : undefined;

  if (!isAuthErrorCode(code)) return reason;

  return new ShelfError({
    cause: reason.cause,
    label: reason.label,
    message: t(translationKeyByCode[code]),
    title: reason.title,
    additionalData: reason.additionalData,
    shouldBeCaptured: reason.shouldBeCaptured,
    status: reason.status,
    traceId: reason.traceId,
  });
}
