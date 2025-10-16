import React, { createContext, useEffect, useState } from "react";
import type { UserProfile } from "@/api/types.api";
import { loginReq, meReq } from "@/api/auth.api";

type AuthContextValue = {
  user: UserProfile | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );

  useEffect(() => {
    if (token) refreshProfile().catch(() => logout());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    const res = await loginReq(email, password);
    if (res.data.success && res.data.data) {
      const { user, token } = res.data.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      setToken(token);
    } else throw new Error(res.data.message ?? "Login failed");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
  };

  const refreshProfile = async () => {
    const res = await meReq();
    if (res.data.success && res.data.data) {
      setUser(res.data.data);
      localStorage.setItem("user", JSON.stringify(res.data.data));
    } else logout();
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;