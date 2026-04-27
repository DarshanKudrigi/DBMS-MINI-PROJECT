import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

function parseStoredUser() {
  const saved = localStorage.getItem("auth_user");

  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved);
  } catch {
    localStorage.removeItem("auth_user");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(parseStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem("auth_token") || "");

  const login = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem("auth_token", nextToken);
    localStorage.setItem("auth_user", JSON.stringify(nextUser));
  };

  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");

    if (window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
  };

  const value = useMemo(
    () => ({ user, token, login, logout, isAuthenticated: Boolean(token && user) }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
