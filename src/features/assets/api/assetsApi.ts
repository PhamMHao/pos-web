import apiClient, { ApiResponse } from "../../../core/api/apiClient";
import { EnterpriseAsset } from "../../../types";

export interface AssetQueryParams {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const assetsApi = {
  getAssets: async (params?: AssetQueryParams) => {
    const response = await apiClient.get<ApiResponse<EnterpriseAsset[]>>("/assets", {
      params,
    });
    return response.data;
  },

  getAssetById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<EnterpriseAsset>>(`/assets/${id}`);
    return response.data.data;
  },

  createAsset: async (asset: Partial<EnterpriseAsset>) => {
    const response = await apiClient.post<ApiResponse<EnterpriseAsset>>("/assets", asset);
    return response.data.data;
  },

  updateAsset: async (id: string, asset: Partial<EnterpriseAsset>) => {
    const response = await apiClient.put<ApiResponse<EnterpriseAsset>>(`/assets/${id}`, asset);
    return response.data.data;
  },

  deleteAsset: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/assets/${id}`);
    return response.data.data;
  },
};
