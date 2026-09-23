const AUTH_SESSION_ACTIONS = new Set([
  "/login",
  "/logout",
  "/otp",
  "/oauth/callback",
]);

/** Auth actions can establish or destroy a session without a document reload.
 * Revalidating the root loader reapplies account > cookie > browser precedence
 * immediately after either transition. */
export function isAuthSessionTransition(formAction?: string): boolean {
  if (!formAction) return false;

  const pathname = new URL(formAction, "https://shelf.local").pathname;
  return (
    AUTH_SESSION_ACTIONS.has(pathname) || pathname.startsWith("/accept-invite/")
  );
}
