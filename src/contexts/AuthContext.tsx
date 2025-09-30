import React, { createContext, useContext, useState, useEffect } from "react";
import { isPasswordSet } from "@/utils/storage";

interface AuthContextType {
  isAuthenticated: boolean;
  password: string | null;
  login: (password: string) => void;
  logout: () => void;
  needsSetup: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    setNeedsSetup(!isPasswordSet());
  }, []);

  const login = (pwd: string) => {
    setPassword(pwd);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setPassword(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, password, login, logout, needsSetup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
