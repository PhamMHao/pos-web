import apiClient, { ApiResponse } from "../../../core/api/apiClient";
import { StoreSettings } from "../../../types";

export const settingsApi = {
  getSettings: async () => {
    const response = await apiClient.get<ApiResponse<StoreSettings>>("/settings");
    return response.data.data;
  },

  updateSettings: async (settings: Partial<StoreSettings>) => {
    const response = await apiClient.put<ApiResponse<StoreSettings>>("/settings", settings);
    return response.data.data;
  },

  backupDatabase: async () => {
    const response = await apiClient.get<ApiResponse<any>>("/settings/backup");
    return response.data.data;
  },

  restoreDatabase: async (backupPayload: any) => {
    const response = await apiClient.post<ApiResponse<any>>("/settings/restore", backupPayload);
    return response.data;
  },

  wipeAllData: async (confirmation: string) => {
    const response = await apiClient.post<ApiResponse<any>>("/settings/wipe-data", { confirmation });
    return response.data;
  },
};

