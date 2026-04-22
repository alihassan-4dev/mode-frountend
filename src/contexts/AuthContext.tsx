import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import type { AuthSession, AuthUser } from "@/types/auth";

const STORAGE_KEY = "emode_auth_session";

type AuthContextValue = {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: Error | null; session: AuthSession | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.access_token || !parsed?.user?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persistSession(session: AuthSession | null) {
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = readStoredSession();
    setSession(s);
    setUser(s?.user ?? null);
    setLoading(false);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const data = await api.authLogin({ email: email.trim(), password });
      setSession(data);
      setUser(data.user);
      persistSession(data);
      return { error: null };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Sign in failed";
      return { error: new Error(message) };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      const data = await api.authRegister({
        email,
        password,
        full_name: fullName.trim() || null,
      });
      setSession(data);
      setUser(data.user);
      persistSession(data);
      return { error: null, session: data };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Registration failed";
      return { error: new Error(message), session: null };
    }
  }, []);

  const signOut = useCallback(async () => {
    setSession(null);
    setUser(null);
    persistSession(null);
  }, []);

  const resetPassword = useCallback(async (_email: string) => {
    return {
      error: new Error(
        "Email-based password reset is disabled. Sign in and change your password in Settings."
      ),
    };
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const token = session?.access_token ?? readStoredSession()?.access_token;
    if (!token) {
      return { error: new Error("Not signed in") };
    }
    try {
      const data = await api.authUpdatePassword(token, newPassword);
      setSession(data);
      setUser(data.user);
      persistSession(data);
      return { error: null };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not update password";
      return { error: new Error(message) };
    }
  }, [session?.access_token]);

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
    }),
    [user, session, loading, signIn, signUp, signOut, resetPassword, updatePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
