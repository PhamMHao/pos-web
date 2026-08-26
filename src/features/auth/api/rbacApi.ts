import apiClient from '../../../core/api/apiClient';
import { RoleMetadata, ModulePermissionDef, RoleKey } from '../../../config/rbac.config';

export const rbacApi = {
  getRoles: async (): Promise<RoleMetadata[]> => {
    const res = await apiClient.get<{ success: boolean; data: RoleMetadata[] }>('/auth/rbac/roles');
    return res.data?.data || [];
  },

  getModules: async (): Promise<ModulePermissionDef[]> => {
    const res = await apiClient.get<{ success: boolean; data: ModulePermissionDef[] }>('/auth/rbac/modules');
    return res.data?.data || [];
  },

  getMatrix: async (): Promise<Record<RoleKey, string[]>> => {
    const res = await apiClient.get<{ success: boolean; data: Record<RoleKey, string[]> }>('/auth/rbac/matrix');
    return res.data?.data || ({} as Record<RoleKey, string[]>);
  },

  saveMatrix: async (matrix: Record<RoleKey, string[]>): Promise<Record<RoleKey, string[]>> => {
    const res = await apiClient.put<{ success: boolean; data: Record<RoleKey, string[]> }>('/auth/rbac/matrix', matrix);
    return res.data?.data || matrix;
  },

  saveRole: async (roleData: Partial<RoleMetadata> & { permissions?: string[] }) => {
    const res = await apiClient.post<{ success: boolean; data: any }>('/auth/rbac/roles', roleData);
    return res.data?.data;
  },

  deleteRole: async (roleKey: string) => {
    const res = await apiClient.delete<{ success: boolean; data: any }>(`/auth/rbac/roles/${roleKey}`);
    return res.data?.data;
  },
};
