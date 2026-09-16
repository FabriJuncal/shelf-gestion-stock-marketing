// Import Sentry instrumentation before the application server.
import "./instrument.server.js";

import { createHonoServer } from "react-router-hono-server/node";
import { initEnv } from "~/utils/env";

import { honoServerOptions } from "./app";

// Fail fast when required runtime configuration is missing.
initEnv();

export { getLoadContext } from "./app";
export default createHonoServer(honoServerOptions);
