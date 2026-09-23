import type { Context } from "hono";
import type { AppLoadContext } from "react-router";
import type { HonoServerOptions } from "react-router-hono-server/node";
import { ShelfError } from "~/utils/error";
import { runWithTabId } from "~/utils/tab-id.server";

import { logger } from "./logger";
import {
  ensureHostHeaders,
  protect,
  refreshSession,
  urlShortener,
} from "./middleware";
import {
  appLoaderRateLimit,
  calendarFeedRateLimit,
  mobileIpRateLimit,
} from "./rate-limit";
import { runWithRequestCache } from "./request-cache.server";
import { securityHeaders } from "./security-headers";
import { authSessionKey, createSessionStorage } from "./session";
import type { FlashData, SessionData } from "./session";
import { getSession, session } from "./session-middleware";
import { serverTiming } from "./timing.server";

export type ServerEnv = {
  Variables: Record<symbol, unknown>;
};

export const PUBLIC_PATHS = [
  "/",
  "/_root",
  "/accept-invite/*path",
  "/forgot-password",
  "/join",
  "/login",
  "/sso-login",
  "/oauth/callback",
  "/oauth/callback/mobile",
  "/logout",
  "/otp",
  "/resend-otp",
  "/reset-password",
  "/send-otp",
  "/healthcheck",
  "/.well-known/apple-app-site-association",
  "/.well-known/assetlinks.json",
  "/api/language",
  "/api/public-stats",
  "/api/oss-friends",
  "/api/stripe-webhook",
  "/api/scim/v2/*path",
  "/qr",
  "/qr/:qrId",
  "/qr/:qrId/not-logged-in",
  "/qr/:qrId/contact-owner",
  "/api/mobile/*path",
  "/api/calendar/feed/*path",
];

export const getLoadContext: HonoServerOptions<ServerEnv>["getLoadContext"] = (
  c,
  { build, mode }
) => {
  const session = getSession<SessionData, FlashData>(c);

  return {
    appVersion: mode === "production" ? build.assets.version : "dev",
    isAuthenticated: session.has(authSessionKey),
    getSession: () => {
      const auth = session.get(authSessionKey);

      if (!auth) {
        throw new ShelfError({
          cause: null,
          message:
            "There is no session here. This should not happen because if you require it, this route should be mark as protected and catch by the protect middleware.",
          status: 403,
          label: "Dev error",
        });
      }

      return auth;
    },
    setSession: (auth: SessionData["auth"]) => {
      session.set(authSessionKey, auth);
    },
    destroySession: () => {
      session.unset(authSessionKey);
    },
    errorMessage: session.get("errorMessage") || null,
  } satisfies AppLoadContext;
};

export const honoServerOptions = {
  defaultLogger: false,
  useWebSocket: false,
  getLoadContext,
  beforeAll: (app) => {
    app.use("*", securityHeaders());
  },
  configure: (server) => {
    server.use("*", serverTiming());
    server.use("*", ensureHostHeaders());
    server.use("*", async (_c, next) => runWithRequestCache(() => next()));
    server.use("*", async (c, next) =>
      runWithTabId(c.req.header("X-Tab-Id"), () => next())
    );

    server.use("*", async (c, next) => {
      const host = c.req.header("host");

      if (process.env.URL_SHORTENER && host === process.env.URL_SHORTENER) {
        return urlShortener({
          excludePaths: ["/file-assets", "/healthcheck", "/static"],
        })(c, next);
      }

      return next();
    });

    server.use("*", logger());
    server.use("/api/mobile/*", mobileIpRateLimit());
    server.use("/api/calendar/feed/*", calendarFeedRateLimit());

    server.use(
      session({
        autoCommit: true,
        createSessionStorage() {
          const sessionStorage = createSessionStorage();

          return {
            ...sessionStorage,
            async commitSession(session) {
              return sessionStorage.commitSession(session, {
                maxAge: 60 * 60 * 24 * 3,
              });
            },
          };
        },
      })
    );

    const appLoaderLimiter = appLoaderRateLimit();
    server.use("*", async (c, next) => {
      const path = c.req.path;
      if (!path.endsWith(".data") || path.startsWith("/__")) return next();
      return appLoaderLimiter(c as unknown as Context, next);
    });

    server.use("*", refreshSession());
    server.use(
      "*",
      protect({
        onFailRedirectTo: "/login",
        publicPaths: PUBLIC_PATHS,
      })
    );
  },
} satisfies HonoServerOptions<ServerEnv>;

declare module "react-router" {
  interface AppLoadContext {
    readonly appVersion: string;
    isAuthenticated: boolean;
    getSession(): SessionData["auth"];
    setSession(session: SessionData["auth"]): void;
    destroySession(): void;
    errorMessage: string | null;
  }
}
