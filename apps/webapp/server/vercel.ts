// Import Sentry instrumentation before the application server.
import "./instrument.server.js";

import { Hono } from "hono";
import { createRequestHandler } from "react-router";
// Provided by React Router during the server build.
// eslint-disable-next-line import/no-unresolved
import * as build from "virtual:react-router/server-build";
import { initEnv } from "~/utils/env";

import { getLoadContext, honoServerOptions } from "./app";
import type { ServerEnv } from "./app";

initEnv();

const app = new Hono<ServerEnv>();

honoServerOptions.beforeAll?.(app);
honoServerOptions.configure?.(app);

const handleRequest = createRequestHandler(build, "production");

app.all("*", async (context) =>
  handleRequest(
    context.req.raw,
    await getLoadContext?.(context, { build, mode: "production" })
  )
);

export default app.fetch;
