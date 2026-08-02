/**
 * Paths that more than one layer has to agree on.
 *
 * Deliberately dependency-free: `server-session.ts` is a `server-only`
 * module and should not pull an icon library into its bundle merely to
 * learn where to send the founder after sign-in.
 */

/**
 * Where the founder's OS begins (ADR-057, moved by ADR-064).
 *
 * This was "/" until TITAN's public company site took the root. It is a
 * constant rather than a literal because four places must agree on it — the
 * sign-in redirect, the already-signed-in bounce, the ⌘K palette's "am I
 * home?" check, and the navigation registry's home entry — and three of them
 * agreeing is how the founder would have discovered the fourth.
 */
export const COMMAND_CENTRE_PATH = "/command";
