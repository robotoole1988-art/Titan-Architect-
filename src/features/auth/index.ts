/**
 * Founder auth feature (ADR-054) — public API.
 */

export { LoginForm } from "./components/login-form";
export {
  completeMagicLinkSignIn,
  createAuthClient,
  getFounderSession,
  requireFounder,
  supabaseAuthConfigured,
} from "./api/server-session";
export { requestMagicLink, signOutAction } from "./api/actions";
