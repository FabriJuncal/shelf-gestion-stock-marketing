import { describe, expect, it } from "vitest";
import { languageCookie, resolveRequestLanguage } from "./language.server";
import { normalizeLanguage } from "./types";

describe("language resolution", () => {
  function request(headers: Record<string, string> = {}) {
    // why: happy-dom's Request deliberately omits Cookie (a forbidden browser
    // header), while a server Request passed to this resolver exposes it.
    return { headers: new Headers(headers) } as Request;
  }

  it("normalizes supported regional browser tags", () => {
    expect(normalizeLanguage("es-AR")).toBe("es");
    expect(normalizeLanguage("EN-gb")).toBe("en");
    expect(normalizeLanguage("pt-BR")).toBeNull();
  });

  it("prefers the authenticated account over the browser cookie", async () => {
    const cookie = (await languageCookie.serialize("es")).split(";", 1)[0];
    const language = await resolveRequestLanguage({
      request: request({ Cookie: cookie, "Accept-Language": "en-US,en;q=0.8" }),
      userLanguage: "en",
    });

    expect(language).toBe("en");
  });

  it("uses cookie, then Accept-Language, then English", async () => {
    const cookie = (await languageCookie.serialize("es")).split(";", 1)[0];
    await expect(
      resolveRequestLanguage({
        request: request({ Cookie: cookie, "Accept-Language": "en-US" }),
      })
    ).resolves.toBe("es");

    await expect(
      resolveRequestLanguage({
        request: request({ "Accept-Language": "es-MX,fr;q=0.5" }),
      })
    ).resolves.toBe("es");

    await expect(resolveRequestLanguage({ request: request() })).resolves.toBe(
      "en"
    );
  });

  it("honors quality weights and excludes explicitly unacceptable languages", async () => {
    await expect(
      resolveRequestLanguage({
        request: request({
          "Accept-Language": "fr,es;q=0,en;q=0.8",
        }),
      })
    ).resolves.toBe("en");

    await expect(
      resolveRequestLanguage({
        request: request({
          "Accept-Language": "en;q=0.4,es-AR;q=0.9",
        }),
      })
    ).resolves.toBe("es");
  });
});
