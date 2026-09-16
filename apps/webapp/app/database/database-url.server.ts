const VERCEL_CONNECTION_LIMIT = "5";
const VERCEL_POOL_TIMEOUT_SECONDS = "30";

/**
 * Shelf loaders intentionally issue several independent reads in parallel.
 * A single Prisma connection makes those requests queue until Prisma's
 * default 10-second pool timeout, which is too small for a Vercel cold start.
 * Keep the pool bounded, but large enough for the application's read fan-out.
 */
export function databaseUrlForRuntime(
  databaseUrl: string,
  isVercel: boolean
): string | undefined {
  if (!isVercel) return undefined;

  const url = new URL(databaseUrl);
  url.searchParams.set("connection_limit", VERCEL_CONNECTION_LIMIT);
  url.searchParams.set("pool_timeout", VERCEL_POOL_TIMEOUT_SECONDS);

  return url.toString();
}
