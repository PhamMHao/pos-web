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

export const DEMO_ACCOUNTS_LIST: DemoUserAccount[] = [
  {
    id: "usr-admin-01",
    username: "admin",
    name: "Phạm Gia Phúc (Quản Trị Viên)",
    role: "admin",
    roleNameVi: "Quản Trị Viên (Admin)",
    email: "admin@vitinhgiaphuc.com",
    phone: "0985 862 609",
    avatarLetter: "A",
    colorGradient: "from-rose-600 to-red-600",
    badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  },
  {
    id: "usr-manager-01",
    username: "manager01",
    name: "Trần Quốc Bảo (Quản Lý)",
    role: "manager",
    roleNameVi: "Quản Lý Cửa Hàng",
    email: "quanly@vitinhgiaphuc.com",
    phone: "0914 665 994",
    avatarLetter: "M",
    colorGradient: "from-blue-600 to-indigo-600",
    badgeBg: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
  {
    id: "usr-thungan-01",
    username: "thungan01",
    name: "Nguyễn Thị Thu Ngân (Thu Ngân)",
    role: "cashier",
    roleNameVi: "Thu Ngân POS",
    email: "thungan@vitinhgiaphuc.com",
    phone: "0914 665 994",
    avatarLetter: "T",
    colorGradient: "from-emerald-600 to-teal-600",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  {
    id: "usr-thukho-01",
    username: "thukho01",
    name: "Nguyễn Văn Minh (Thủ Kho)",
    role: "warehouse",
    roleNameVi: "Thủ Kho Vật Tư",
    email: "thukho@vitinhgiaphuc.com",
    phone: "0985 862 609",
    avatarLetter: "K",
    colorGradient: "from-amber-600 to-orange-600",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  {
    id: "usr-ketoan-01",
    username: "ketoan01",
    name: "Lê Thị Thu Thảo (Kế Toán)",
    role: "accountant",
    roleNameVi: "Kế Toán Trưởng",
    email: "ketoan@vitinhgiaphuc.com",
    phone: "0977 112 233",
    avatarLetter: "K",
    colorGradient: "from-purple-600 to-pink-600",
    badgeBg: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
  {
    id: "usr-sale-01",
    username: "sale01",
    name: "Phạm Hoàng Minh (Kinh Doanh)",
    role: "sales",
    roleNameVi: "Nhân Viên Kinh Doanh",
    email: "sales@vitinhgiaphuc.com",
    phone: "0908 123 456",
    avatarLetter: "S",
    colorGradient: "from-cyan-600 to-blue-600",
    badgeBg: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  },
  {
    id: "usr-kythuat-01",
    username: "kythuat01",
    name: "Đỗ Minh Khang (Kỹ Thuật)",
    role: "technician",
    roleNameVi: "Kỹ Thuật Viên & Bảo Hành",
    email: "kythuat@vitinhgiaphuc.com",
    phone: "0933 888 999",
    avatarLetter: "B",
    colorGradient: "from-teal-600 to-emerald-600",
    badgeBg: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  },
];

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

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("gperp_token") || null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [permissionsMatrix, setPermissionsMatrix] = useState<Record<RoleKey, string[]>>(() => {
    return getSavedRbacMatrix();
  });

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
      // First check if it's one of the demo users
      const demoAccount = DEMO_ACCOUNTS_LIST.find(
        (a) => a.username.toLowerCase() === username.toLowerCase() || a.role === username.toLowerCase()
      );

      // Try API login
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
      } catch (apiErr) {
        // Fallback to client-side login if API / DB not reachable
        if (demoAccount) {
          const mockUser: UserProfile = {
            id: demoAccount.id,
            username: demoAccount.username,
            fullName: demoAccount.name,
            email: demoAccount.email,
            phone: demoAccount.phone,
            role: demoAccount.role,
            avatar: null,
            status: "active",
            isActive: true,
            createdAt: new Date().toISOString(),
          };
          const mockTok = `token_${demoAccount.username}_${Date.now()}`;
          setToken(mockTok);
          setUser(mockUser);
          localStorage.setItem("gperp_token", mockTok);
          localStorage.setItem("gperp_user", JSON.stringify(mockUser));
          return;
        }
        throw apiErr;
      }
    } catch (err: any) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const switchUserDirectly = (usernameOrRole: string) => {
    const match = DEMO_ACCOUNTS_LIST.find(
      (a) =>
        a.username.toLowerCase() === usernameOrRole.toLowerCase() ||
        a.role.toLowerCase() === usernameOrRole.toLowerCase()
    );

    if (match) {
      const switchedUser: UserProfile = {
        id: match.id,
        username: match.username,
        fullName: match.name,
        email: match.email,
        phone: match.phone,
        role: match.role,
        avatar: null,
        status: "active",
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      const newTok = `token_${match.username}_${Date.now()}`;
      setToken(newTok);
      setUser(switchedUser);
      localStorage.setItem("gperp_token", newTok);
      localStorage.setItem("gperp_user", JSON.stringify(switchedUser));
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
