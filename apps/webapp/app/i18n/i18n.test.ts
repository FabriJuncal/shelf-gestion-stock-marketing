import { describe, expect, it } from "vitest";
import { createI18n } from "./i18n";

describe("createI18n", () => {
  it("keeps request instances isolated", () => {
    const english = createI18n("en");
    const spanish = createI18n("es");

    expect(english.t("auth:login")).toBe("Log in");
    expect(spanish.t("auth:login")).toBe("Iniciar sesión");
    expect(english.t("welcome:selectPaymentPlan")).toBe(
      "Select your payment plan"
    );
    expect(spanish.t("welcome:selectPaymentPlan")).toBe(
      "Elegí tu plan de pago"
    );
    expect(spanish.t("format:MMM_DD_YYYY.description")).toBe(
      "ej.: jul. 20, 2026"
    );
    expect(spanish.t("format:DD_MMM_YYYY.description")).toBe(
      "ej.: 20 jul. 2026"
    );
    expect(english.language).toBe("en");
  });
});
