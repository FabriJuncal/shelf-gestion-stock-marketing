export type OtpVerifyMode = "login" | "signup" | "confirm_signup";

export type OtpPageData = Record<
  OtpVerifyMode,
  {
    titleKey: string;
    subHeadingKey: string;
    buttonKey: string;
  }
>;

export const OTP_PAGE_MAP: OtpPageData = {
  login: {
    titleKey: "auth:otpLoginTitle",
    subHeadingKey: "auth:otpLoginHelp",
    buttonKey: "auth:login",
  },
  signup: {
    titleKey: "auth:createAccount",
    subHeadingKey: "auth:otpSignupHelp",
    buttonKey: "auth:createAccount",
  },
  confirm_signup: {
    titleKey: "auth:confirmEmail",
    subHeadingKey: "auth:otpConfirmHelp",
    buttonKey: "auth:confirm",
  },
};

export const DEFAULT_PAGE_DATA: OtpPageData["login"] = {
  titleKey: "auth:otp",
  buttonKey: "auth:continue",
  subHeadingKey: "auth:otpDefaultHelp",
};

export function getOtpPageData(mode: OtpVerifyMode) {
  return OTP_PAGE_MAP[mode] ?? DEFAULT_PAGE_DATA;
}
