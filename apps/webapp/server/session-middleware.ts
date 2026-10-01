import type { Context } from "hono";
import { createMiddleware } from "hono/factory";
import type { Session, SessionData, SessionStorage } from "react-router";

export type SessionEnv = {
  Variables: Record<symbol, unknown>;
};

const sessionStorageKey = Symbol();
const sessionKey = Symbol();

/**
 * Exposes a React Router session to Hono without reissuing an unchanged cookie.
 *
 * Committing an empty session on every response creates a race in browsers:
 * an unauthenticated request started alongside login (for example favicon.ico)
 * can finish last and overwrite the newly authenticated cookie. Only changed
 * session data needs to be committed.
 */
export function session<Data = SessionData, FlashData = Data>(options: {
  autoCommit?: boolean;
  createSessionStorage(c: Context): SessionStorage<Data, FlashData>;
}) {
  return createMiddleware<SessionEnv>(async (c, next) => {
    const sessionStorage = options.createSessionStorage(c);
    c.set(sessionStorageKey, sessionStorage);

    if (!options.autoCommit) return next();

    const currentSession = await sessionStorage.getSession(
      c.req.raw.headers.get("cookie")
    );
    const initialData = JSON.stringify(currentSession.data);
    c.set(sessionKey, currentSession);

    await next();

    if (JSON.stringify(currentSession.data) !== initialData) {
      c.header(
        "set-cookie",
        await sessionStorage.commitSession(currentSession),
        { append: true }
      );
    }
  });
}

export function getSessionStorage<Data = SessionData, FlashData = Data>(
  c: Context<SessionEnv>
): SessionStorage<Data, FlashData> {
  const sessionStorage = c.get(sessionStorageKey);
  if (!sessionStorage) {
    throw new Error("A session middleware was not set.");
  }
  return sessionStorage as SessionStorage<Data, FlashData>;
}

export function getSession<Data = SessionData, FlashData = Data>(
  c: Context<SessionEnv>
): Session<Data, FlashData> {
  const currentSession = c.get(sessionKey);
  if (!currentSession) {
    throw new Error("A session middleware was not set.");
  }
  return currentSession as Session<Data, FlashData>;
}
