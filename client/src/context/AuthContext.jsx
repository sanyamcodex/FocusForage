import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("focusforge_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((response) => setUser(response.data?.user ?? response.user))
      .catch(() => localStorage.removeItem("focusforge_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (payload) => {
    const response = await api.post("/auth/login", payload);
    // Interceptor returns response.data (axios layer), so backend's { success, data:{user,token} }
    const { user, token } = response.data;
    localStorage.setItem("focusforge_token", token);
    setUser(user);
  };

  const register = async (payload) => {
    const response = await api.post("/auth/register", payload);
    const { user, token } = response.data;
    localStorage.setItem("focusforge_token", token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("focusforge_token");
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, register, logout, setUser }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

