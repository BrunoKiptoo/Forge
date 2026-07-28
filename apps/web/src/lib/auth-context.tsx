"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { apiFetch, setAccessToken } from "./api";

const API_BASE = typeof window === "undefined"
  ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001")
  : "";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  emailVerified: boolean;
  githubId?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const data = await apiFetch<{ data: AuthUser }>("/auth/me", {
        skipAuth: false,
      });
      setUser(data.data);
    } catch {
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      console.log('[auth] init — attempting refresh, API_BASE:', API_BASE || '(relative/proxy)');
      console.log('[auth] cookies visible to JS:', document.cookie || '(none — all HttpOnly or empty)');
      try {
        const res = await fetch(`${API_BASE}/api/auth/refresh`,
          { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" } },
        );
        console.log('[auth] refresh response status:', res.status);
        if (res.ok) {
          const json = await res.json();
          console.log('[auth] refresh OK — got accessToken, setting user');
          setAccessToken(json.data.accessToken);
          await refreshUser();
        } else {
          const body = await res.json().catch(() => ({}));
          console.warn('[auth] refresh failed:', body);
          // Clear any stale cookie by hitting logout (best-effort)
          fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
        }
      } catch (e) {
        console.error('[auth] refresh threw:', e);
      }
      setIsLoading(false);
    };
    init();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const data = await apiFetch<{
      data: { accessToken: string; user: AuthUser };
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
  };

  const register = async (email: string, password: string, name: string) => {
    const data = await apiFetch<{
      data: { accessToken: string; user: AuthUser };
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
      skipAuth: true,
    });
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
  };

  const logout = async () => {
    await apiFetch("/auth/logout", { method: "POST" }).catch(() => {});
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
