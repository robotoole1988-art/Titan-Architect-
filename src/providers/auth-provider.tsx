"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * AUTHENTICATION SEAM — now REAL (ADR-054, delivering ADR-004).
 *
 * The founder session is established server-side (Supabase magic link,
 * httpOnly cookies); this provider simply carries the resolved user to the
 * client shell. `signOut` invokes the server action passed down from the
 * layout (providers sit below features in the layer model, so the action
 * arrives as a prop, never an import).
 */

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (user?: AuthUser) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser,
  onSignOut,
}: {
  children: ReactNode;
  initialUser: AuthUser | null;
  onSignOut?: () => Promise<void> | void;
}) {
  const [user] = useState<AuthUser | null>(initialUser);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading: false,
      // Sign-in happens at /login via the server flow; this is a no-op kept
      // for interface compatibility with early consumers.
      signIn: () => undefined,
      signOut: () => {
        void onSignOut?.();
      },
    }),
    [user, onSignOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Access the current auth state. Must be used inside <AuthProvider>. */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an <AuthProvider>.");
  }
  return context;
}
