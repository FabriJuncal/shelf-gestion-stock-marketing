import { createCookie } from "react-router";
import { normalizeLanguage, type AppLanguage } from "./types";

export const languageCookie = createCookie("shelf-language", {
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 365,
});

function languageFromAcceptLanguage(value: string | null): AppLanguage | null {
  if (!value) return null;

  return (
    value
      .split(",")
      .map((candidate, index) => {
        const [tag, ...parameters] = candidate.split(";");
        const qualityParameter = parameters
          .map((parameter) => parameter.trim())
          .find((parameter) => parameter.startsWith("q="));
        const parsedQuality = qualityParameter
          ? Number(qualityParameter.slice(2))
          : 1;
        const quality =
          Number.isFinite(parsedQuality) &&
          parsedQuality >= 0 &&
          parsedQuality <= 1
            ? parsedQuality
            : 0;

        return {
          index,
          language: normalizeLanguage(tag),
          quality,
        };
      })
      .filter(
        (
          candidate
        ): candidate is {
          index: number;
          language: AppLanguage;
          quality: number;
        } => candidate.language !== null && candidate.quality > 0
      )
      .sort(
        (left, right) =>
          right.quality - left.quality || left.index - right.index
      )[0]?.language ?? null
  );
}

export async function resolveRequestLanguage({
  request,
  userLanguage,
}: {
  request: Request;
  userLanguage?: string | null;
}): Promise<AppLanguage> {
  return (
    normalizeLanguage(userLanguage) ??
    normalizeLanguage(
      await languageCookie.parse(request.headers.get("Cookie"))
    ) ??
    languageFromAcceptLanguage(request.headers.get("Accept-Language")) ??
    "en"
  );
}
