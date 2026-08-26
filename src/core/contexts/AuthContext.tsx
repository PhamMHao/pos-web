import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import apiClient from "../api/apiClient";
import {
  RoleKey,
  getSavedRbacMatrix,
  saveRbacMatrix,
  resetRbacMatrix,
  canRoleAccessModule,
  canRolePerformAction,
  normalizeRoleKey,
  DEFAULT_RBAC_MATRIX,
} from "../../config/rbac.config";

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  email: string | null;
  phone?: string | null;
  role: RoleKey | string;
  avatar?: string | null;
  status?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface DemoUserAccount {
  id: string;
  username: string;
  name: string;
  role: RoleKey;
  roleNameVi: string;
  email: string;
  phone: string;
  avatarLetter: string;
  colorGradient: string;
  badgeBg: string;
}

export const DEMO_ACCOUNTS_LIST: DemoUserAccount[] = [];

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissionsMatrix: Record<RoleKey, string[]>;
  login: (username: string, password?: string) => Promise<void>;
  logout: () => void;
  switchUserDirectly: (usernameOrRole: string) => void;
  hasRole: (roles: string[]) => boolean;
  hasModuleAccess: (moduleId: string) => boolean;
  hasActionAccess: (actionId: string) => boolean;
  updatePermissionsMatrix: (newMatrix: Record<RoleKey, string[]>) => void;
  resetPermissionsToDefault: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("gperp_token"));
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("gperp_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [permissionsMatrix, setPermissionsMatrix] = useState<Record<RoleKey, string[]>>(() =>
    getSavedRbacMatrix()
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (token) {
      refreshProfile();
    }
  }, [token]);

  const refreshProfile = async () => {
    const currentToken = localStorage.getItem("gperp_token");
    if (!currentToken) {
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
    }
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  const login = async (username: string, password = "123456") => {
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
        return;
      }
      throw new Error("Đăng nhập không thành công. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.");
    } catch (err: any) {
      console.error("Login error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const switchUserDirectly = async (usernameOrRole: string) => {
    try {
      await login(usernameOrRole, "123456");
    } catch (err) {
      console.warn("switchUserDirectly error:", err);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("gperp_token");
    localStorage.removeItem("gperp_user");
  };

  const hasRole = (roles: string[]): boolean => {
    if (!user) return false;
    const currentRoleKey = normalizeRoleKey(user.role);
    if (currentRoleKey === "admin") return true;
    return roles.map(normalizeRoleKey).includes(currentRoleKey);
  };

  const hasModuleAccess = (moduleId: string): boolean => {
    if (!user) return false;
    return canRoleAccessModule(user.role, moduleId, permissionsMatrix);
  };

  const hasActionAccess = (actionId: string): boolean => {
    if (!user) return false;
    return canRolePerformAction(user.role, actionId, permissionsMatrix);
  };

  const updatePermissionsMatrix = (newMatrix: Record<RoleKey, string[]>) => {
    saveRbacMatrix(newMatrix);
    setPermissionsMatrix({ ...newMatrix });
  };

  const resetPermissionsToDefault = () => {
    const defaultMat = resetRbacMatrix();
    setPermissionsMatrix(defaultMat);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        permissionsMatrix,
        login,
        logout,
        switchUserDirectly,
        hasRole,
        hasModuleAccess,
        hasActionAccess,
        updatePermissionsMatrix,
        resetPermissionsToDefault,
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
