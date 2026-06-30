"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * AUTHENTICATION SEAM
 * -------------------
 * This provider is the single integration point for authentication.
 * Today it holds a placeholder user so the shell renders realistically.
 *
 * To wire in real auth (Clerk, Auth.js, Supabase, etc.) later, replace the
 * placeholder state below with the provider's session — every component that
 * calls `useAuth()` keeps working unchanged.
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

/** Temporary stand-in user. Remove once real auth is connected. */
const PLACEHOLDER_USER: AuthUser = {
  id: "placeholder-user",
  name: "Robert O'Toole",
  email: "robotoole1988@gmail.com",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(PLACEHOLDER_USER);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading: false,
      signIn: (next = PLACEHOLDER_USER) => setUser(next),
      signOut: () => setUser(null),
    }),
    [user],
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
