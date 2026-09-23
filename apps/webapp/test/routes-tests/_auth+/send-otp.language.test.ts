import type { ActionFunctionArgs } from "react-router";

import { sendOTP } from "~/modules/auth/service.server";
import { AUTH_ERROR_CODES } from "~/modules/auth/localize-error.server";
import { action } from "~/routes/_auth+/send-otp";
import { ShelfError } from "~/utils/error";
import { validateNonSSOSignup } from "~/utils/sso.server";

// @vitest-environment node

// why: exercise request-language propagation without sending a real OTP.
vitest.mock("~/modules/auth/service.server", () => ({
  sendOTP: vitest.fn(),
}));

// why: keep the test focused on language propagation rather than SSO lookup.
vitest.mock("~/utils/sso.server", () => ({
  validateNonSSOSignup: vitest.fn(),
}));

describe("send OTP route", () => {
  beforeEach(() => {
    vitest.clearAllMocks();
  });

  it("passes the visitor language to the Auth service before redirecting", async () => {
    const request = new Request("http://localhost/send-otp", {
      method: "POST",
      headers: {
        "accept-language": "es-AR,es;q=0.9,en;q=0.8",
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        email: "person@example.com",
        mode: "signup",
      }),
    });

    const response = await action({
      request,
      context: {},
      params: {},
    } as ActionFunctionArgs);

    expect(sendOTP).toHaveBeenCalledWith("person@example.com", "es");
    const redirectResponse = response as Response;
    expect(redirectResponse.status).toBe(302);
    expect(redirectResponse.headers.get("location")).toBe(
      "/otp?email=person%40example.com&mode=signup"
    );
  });

  it("returns the validation message in the visitor language", async () => {
    const request = new Request("http://localhost/send-otp", {
      method: "POST",
      headers: {
        "accept-language": "es-AR,es;q=0.9",
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        email: "not-an-email",
        mode: "signup",
      }),
    });

    const response = (await action({
      request,
      context: {},
      params: {},
    } as ActionFunctionArgs)) as Response & {
      data?: unknown;
      init?: ResponseInit;
    };

    expect(response.status ?? response.init?.status).toBe(400);
    expect(JSON.stringify(response.data)).toContain(
      "Ingresá un correo electrónico válido"
    );
    expect(sendOTP).not.toHaveBeenCalled();
  });

  it("localizes OTP service failures in the visitor language", async () => {
    vitest.mocked(sendOTP).mockRejectedValue(
      new ShelfError({
        cause: null,
        label: "Auth",
        message: "Something went wrong while sending the OTP.",
        additionalData: {
          authErrorCode: AUTH_ERROR_CODES.otpSendFailed,
        },
      })
    );
    const request = new Request("http://localhost/send-otp", {
      method: "POST",
      headers: {
        "accept-language": "es-AR",
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        email: "person@example.com",
        mode: "signup",
      }),
    });

    const response = (await action({
      request,
      context: {},
      params: {},
    } as ActionFunctionArgs)) as {
      data: { error: { message: string } };
    };

    expect(response.data.error.message).toBe(
      "No pudimos enviar el código de verificación. Intentá nuevamente más tarde."
    );
  });

  it("localizes the SSO-domain signup error in the visitor language", async () => {
    vitest.mocked(validateNonSSOSignup).mockRejectedValue(
      new ShelfError({
        cause: null,
        label: "Auth",
        message: "This email domain uses SSO authentication.",
        additionalData: {
          authErrorCode: AUTH_ERROR_CODES.ssoDomainRequired,
        },
        status: 400,
        shouldBeCaptured: false,
      })
    );
    const request = new Request("http://localhost/send-otp", {
      method: "POST",
      headers: {
        "accept-language": "es-AR",
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        email: "person@example.com",
        mode: "signup",
      }),
    });

    const response = (await action({
      request,
      context: {},
      params: {},
    } as ActionFunctionArgs)) as {
      data: { error: { message: string } };
    };

    expect(response.data.error.message).toBe(
      "Este dominio de correo usa SSO. Iniciá sesión con el proveedor SSO de tu organización."
    );
    expect(sendOTP).not.toHaveBeenCalled();
  });
});
