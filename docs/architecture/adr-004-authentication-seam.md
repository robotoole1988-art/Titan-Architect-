# ADR-004: Authentication as a swappable seam

- **Status:** Accepted
- **Date:** 2026-06-30
- **Deciders:** Robert O'Toole
- **Tags:** auth, architecture, security
- **Supersedes:** —
- **Superseded by:** —

## Context

The platform must be **authentication-ready** from the start, but the specific
provider (Clerk, Auth.js, Supabase Auth, a custom IdP, enterprise SSO) is a
later business decision. We must not couple the entire application to a provider
prematurely, yet every page and component already needs a consistent way to ask
"who is the current user?".

## Decision

We will introduce an **authentication seam**: a single, provider-agnostic
integration point that the rest of the app depends on, with a placeholder
implementation today.

- `src/providers/auth-provider.tsx` exposes `useAuth()` returning a stable
  contract (`user`, `isAuthenticated`, `isLoading`, `signIn`, `signOut`).
- All UI reads auth state **only** through `useAuth()` — never a provider SDK
  directly.
- The protected `(app)` layout is the designated location for server-side
  enforcement (redirect to `/login` when unauthenticated).

Wiring a real provider later means replacing the seam's internals; every
consumer keeps working unchanged.

## Consequences

### Positive
- Zero provider lock-in; the auth vendor can change with one file's internals.
- A consistent auth contract is available everywhere immediately.
- The enforcement point is explicit and centralised.

### Negative / Trade-offs
- The placeholder grants access without real verification; it must be replaced
  before any non-public deployment. Tracked as a known TODO in `(app)/layout.tsx`.

### Neutral
- The contract may expand (roles, permissions, organisations) when real
  authorisation is designed — that will warrant its own ADR.

## Alternatives Considered

- **Integrate a provider now** — premature lock-in to an unmade business
  decision. Rejected.
- **No auth abstraction; call the SDK inline** — scatters vendor calls across
  the codebase, making future change expensive. Rejected.

## References

- ADR-003 (protected app shell).
