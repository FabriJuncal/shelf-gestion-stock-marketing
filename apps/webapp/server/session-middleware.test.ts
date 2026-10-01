import { Hono } from "hono";
import { createCookieSessionStorage } from "react-router";

import { getSession, session } from "./session-middleware";
import type { SessionEnv } from "./session-middleware";

function createTestStorage() {
  return createCookieSessionStorage<{ auth?: string }>({
    cookie: {
      name: "__testSession",
      httpOnly: true,
      path: "/",
      secrets: ["test-session-secret"],
    },
  });
}

describe("session middleware", () => {
  it("does not emit a cookie when an anonymous session is unchanged", async () => {
    const app = new Hono<SessionEnv>();
    app.use(
      "*",
      session({ autoCommit: true, createSessionStorage: createTestStorage })
    );
    app.get("/favicon.ico", (context) => context.notFound());

    const response = await app.request("/favicon.ico");

    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("commits a cookie when login changes the session", async () => {
    const app = new Hono<SessionEnv>();
    app.use(
      "*",
      session({ autoCommit: true, createSessionStorage: createTestStorage })
    );
    app.post("/login", (context) => {
      getSession<{ auth?: string }>(context).set("auth", "signed-in");
      return context.redirect("/assets");
    });

    const response = await app.request("/login", { method: "POST" });

    expect(response.headers.get("set-cookie")).toContain("__testSession=");
  });

  it("does not refresh an existing unchanged cookie", async () => {
    const storage = createTestStorage();
    const existingCookie = await storage.commitSession(
      await storage.getSession()
    );
    const app = new Hono<SessionEnv>();
    app.use(
      "*",
      session({ autoCommit: true, createSessionStorage: () => storage })
    );
    app.get("/assets", (context) => context.text("ok"));

    const response = await app.request("/assets", {
      headers: { cookie: existingCookie.split(";")[0] },
    });

    expect(response.headers.get("set-cookie")).toBeNull();
  });
});
