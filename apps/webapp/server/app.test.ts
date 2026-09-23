import { Hono } from "hono";
import { createCookieSessionStorage } from "react-router";
import { PUBLIC_PATHS } from "./app";
import { protect } from "./middleware";
import { session } from "./session-middleware";
import type { SessionEnv } from "./session-middleware";

// why: the public-route assertion must not contact Supabase while importing
// the production authentication middleware.
vi.mock("~/modules/auth/service.server", () => ({
  refreshAccessToken: vi.fn(),
  validateSession: vi.fn(),
}));

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

describe("public language action", () => {
  it("reaches /api/language without an authenticated session", async () => {
    const app = new Hono<SessionEnv>();
    app.use(
      "*",
      session({ autoCommit: true, createSessionStorage: createTestStorage })
    );
    app.use(
      "*",
      protect({ publicPaths: PUBLIC_PATHS, onFailRedirectTo: "/login" })
    );
    app.post("/api/language", (context) => context.text("language saved"));

    const response = await app.request("/api/language", { method: "POST" });

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe("language saved");
  });
});
