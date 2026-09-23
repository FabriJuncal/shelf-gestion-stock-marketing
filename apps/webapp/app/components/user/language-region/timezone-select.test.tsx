/**
 * TimezoneSelect — unit tests
 *
 * Verifies the searchable timezone selector renders the current value in its
 * trigger, exposes a non-empty option list (from Intl.supportedValuesOf with
 * a fallback), and submits the value through the hidden input named by `name`.
 *
 * @see {@link file://./timezone-select.tsx}
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { describe, it, expect, vi } from "vitest";
import { createI18n } from "~/i18n/i18n";
import { TIMEZONE_OPTIONS, TimezoneSelect } from "./timezone-select";

describe("TimezoneSelect", () => {
  function renderWithLanguage(language: "en" | "es") {
    return render(
      <I18nextProvider i18n={createI18n(language)}>
        <TimezoneSelect
          name="timeZone"
          value="Europe/London"
          // why: this test checks rendered localization; selecting a value is outside its scope
          onChange={vi.fn()}
        />
      </I18nextProvider>
    );
  }

  it("exposes a non-empty option list", () => {
    expect(TIMEZONE_OPTIONS.length).toBeGreaterThan(0);
    expect(TIMEZONE_OPTIONS).toContain("UTC");
  });

  it("renders the current value in the trigger", () => {
    renderWithLanguage("en");
    expect(screen.getByText("Europe/London")).toBeTruthy();
  });

  it("uses Spanish labels when Spanish is active", () => {
    renderWithLanguage("es");
    fireEvent.click(screen.getByRole("button"));
    expect(
      screen.getByRole("combobox", { name: "Buscar zona horaria" })
    ).toBeTruthy();
  });

  it("submits the current value via a hidden input", () => {
    const { container } = render(
      <TimezoneSelect
        name="timeZone"
        value="America/New_York"
        // why: these tests verify render + hidden-input submission only; onChange is stubbed, not exercised
        onChange={vi.fn()}
      />
    );
    const hidden = container.querySelector<HTMLInputElement>(
      'input[type="hidden"][name="timeZone"]'
    );
    expect(hidden?.value).toBe("America/New_York");
  });
});
