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
};
