"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { authApi, type User, type ApiError } from "@/lib/api-client";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    preferred_language?: string;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; phone?: string; preferred_language?: string }) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
    error: null,
  });

  // Hydrate from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("gba_token");
    if (!token) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }
    authApi
      .me()
      .then((user) => setState({ user, token, loading: false, error: null }))
      .catch(() => {
        localStorage.removeItem("gba_token");
        setState({ user: null, token: null, loading: false, error: null });
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await authApi.login({ email, password });
      localStorage.setItem("gba_token", res.access_token);
      setState({ user: res.user, token: res.access_token, loading: false, error: null });
    } catch (err) {
      const msg = (err as ApiError).message ?? "Login failed. Please try again.";
      setState((s) => ({ ...s, loading: false, error: msg }));
      throw err;
    }
  }, []);

  const register = useCallback(
    async (data: {
      name: string;
      email: string;
      password: string;
      phone?: string;
      preferred_language?: string;
    }) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const res = await authApi.register(data);
        localStorage.setItem("gba_token", res.access_token);
        setState({ user: res.user, token: res.access_token, loading: false, error: null });
      } catch (err) {
        const msg = (err as ApiError).message ?? "Registration failed. Please try again.";
        setState((s) => ({ ...s, loading: false, error: msg }));
        throw err;
      }
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("gba_token");
    setState({ user: null, token: null, loading: false, error: null });
  }, []);

  const updateProfile = useCallback(
    async (data: { name?: string; phone?: string; preferred_language?: string }) => {
      const user = await authApi.updateProfile(data);
      setState((s) => ({ ...s, user }));
    },
    [],
  );

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, updateProfile, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
