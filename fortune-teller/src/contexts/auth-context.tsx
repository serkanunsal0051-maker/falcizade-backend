import { createContext, useContext, useState, useCallback, ReactNode } from "react";

const STORAGE_KEY = "falcizade_auth";

export type AuthUser =
  | { type: "guest" }
  | { type: "google"; id: string; name: string; email: string; picture?: string };

interface AuthContextValue {
  user: AuthUser | null;
  loginAsGuest: () => void;
  loginWithGoogle: (info: { id: string; name: string; email: string; picture?: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function writeUser(user: AuthUser | null): void {
  try {
    if (user === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readUser());

  const loginAsGuest = useCallback(() => {
    const u: AuthUser = { type: "guest" };
    writeUser(u);
    setUser(u);
  }, []);

  const loginWithGoogle = useCallback(
    (info: { id: string; name: string; email: string; picture?: string }) => {
      const u: AuthUser = { type: "google", ...info };
      writeUser(u);
      setUser(u);
    },
    []
  );

  const logout = useCallback(() => {
    writeUser(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loginAsGuest, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
