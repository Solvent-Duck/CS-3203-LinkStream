"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  type User,
  getProfile,
  login as apiLogin,
  signup as apiSignup,
  logout as apiLogout,
  clearToken,
} from "./api";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    fullName: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setLoading(false);
      return;
    }
    getProfile()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user } = await apiLogin({ email, password });
    setUser(user);
  }, []);

  const signup = useCallback(
    async (
      fullName: string,
      email: string,
      password: string,
      passwordConfirmation: string
    ) => {
      const { user } = await apiSignup({
        fullName,
        email,
        password,
        passwordConfirmation,
      });
      setUser(user);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      clearToken();
    }
    setUser(null);
  }, []);

  return (
    <AuthContext value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
