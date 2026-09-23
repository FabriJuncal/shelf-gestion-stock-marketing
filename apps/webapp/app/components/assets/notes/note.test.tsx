import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createI18n } from "~/i18n/i18n";
import { Note } from "./note";

// why: this test targets the relative-time language wiring, not absolute date formatting.
vi.mock("~/components/shared/date", () => ({
  DateS: () => <span>absolute date</span>,
}));

// why: Markdoc rendering is unrelated to the language passed to timeAgo.
vi.mock("~/components/markdown/markdown-viewer", () => ({
  MarkdownViewer: ({ content }: { content: string }) => <span>{content}</span>,
}));

describe("Note", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders relative time with the active Spanish language", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-21T12:00:00.000Z"));

    render(
      <I18nextProvider i18n={createI18n("es")}>
        <Note
          note={{
            id: "note-1",
            content: "Comentario",
            type: "COMMENT",
            createdAt: "2026-09-20T11:00:00.000Z",
          }}
        />
      </I18nextProvider>
    );

    expect(screen.getByText("ayer")).toBeInTheDocument();
  });
});
