import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import apiClient from "../api/apiClient";

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  email: string | null;
  role: "admin" | "manager" | "cashier" | "warehouse" | "accountant" | "technician";
  avatar?: string | null;
  isActive: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (roles: string[]) => boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_ADMIN_USER: UserProfile = {
  id: "u-admin",
  username: "admin",
  fullName: "Vũ Gia Phúc",
  email: "giaphuc@computer.vn",
  role: "admin",
  avatar: null,
  isActive: true,
  createdAt: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("gperp_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_ADMIN_USER;
      }
    }
    return DEFAULT_ADMIN_USER;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("gperp_token");
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    const currentToken = localStorage.getItem("gperp_token");
    if (!currentToken) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.get<{ success: boolean; data: UserProfile }>("/auth/me");
      if (response.data?.success && response.data.data) {
        setUser(response.data.data);
        localStorage.setItem("gperp_user", JSON.stringify(response.data.data));
      }
    } catch (err) {
      console.warn("Could not fetch /auth/me:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();

    const handleUnauthorized = () => {
      setUser(DEFAULT_ADMIN_USER);
      setToken(null);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<{
        success: boolean;
        data: { token: string; user: UserProfile };
      }>("/auth/login", { username, password });

      if (response.data?.success && response.data.data) {
        const { token: newToken, user: newUser } = response.data.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem("gperp_token", newToken);
        localStorage.setItem("gperp_user", JSON.stringify(newUser));
      }
    } catch (err: any) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(DEFAULT_ADMIN_USER);
    localStorage.removeItem("gperp_token");
    localStorage.removeItem("gperp_user");
  };

  const hasRole = (roles: string[]): boolean => {
    if (!user) return false;
    if (user.role === "admin") return true;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token || !!user,
        isLoading,
        login,
        logout,
        hasRole,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
