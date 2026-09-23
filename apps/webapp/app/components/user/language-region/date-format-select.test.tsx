/**
 * DateFormatSelect — unit tests
 *
 * Verifies the controlled small-enum selector renders the label for its
 * current `value` and submits that value through the hidden input named by
 * `name`, so it rides the surrounding LanguageRegionForm.
 *
 * @see {@link file://./date-format-select.tsx}
 */
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { describe, it, expect, vi } from "vitest";
import { createI18n } from "~/i18n/i18n";
import { DateFormatSelect } from "./date-format-select";

function renderSelect(value: "DD_MM_YYYY" | "YYYY_MM_DD") {
  return render(
    <I18nextProvider i18n={createI18n("en")}>
      <DateFormatSelect
        name="dateFormat"
        value={value}
        // why: these tests verify render + hidden-input submission only; onChange is stubbed, not exercised
        onChange={vi.fn()}
      />
    </I18nextProvider>
  );
}

describe("DateFormatSelect", () => {
  it("renders the label for the current value", () => {
    renderSelect("YYYY_MM_DD");
    expect(screen.getByText("Year / Month / Day")).toBeTruthy();
  });

  it("submits the current value via a hidden input", () => {
    const { container } = renderSelect("DD_MM_YYYY");
    const hidden = container.querySelector<HTMLInputElement>(
      'input[type="hidden"][name="dateFormat"]'
    );
    expect(hidden?.value).toBe("DD_MM_YYYY");
  });
});
