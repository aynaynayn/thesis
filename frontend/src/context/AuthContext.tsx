import { createContext, useContext, useEffect, useState } from "react";
import { authApi, type User } from "../lib/api";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try { setUser((await authApi.me()).user); }
    catch { setUser(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { void refresh(); }, []);

  const login = async (email: string, password: string) => {
    const result = await authApi.login({ email, password });
    setUser(result.user);
    return result.user;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
