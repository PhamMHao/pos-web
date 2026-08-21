import apiClient, { ApiResponse } from "../../../core/api/apiClient";
import { ProductCosting } from "../../../types";

export interface CostingQueryParams {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const costingApi = {
  getCostings: async (params?: CostingQueryParams) => {
    const response = await apiClient.get<ApiResponse<ProductCosting[]>>("/costing", {
      params,
    });
    return response.data;
  },

  getCostingById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<ProductCosting>>(`/costing/${id}`);
    return response.data.data;
  },

  createCosting: async (costing: Partial<ProductCosting>) => {
    const response = await apiClient.post<ApiResponse<ProductCosting>>("/costing", costing);
    return response.data.data;
  },

  updateCosting: async (id: string, costing: Partial<ProductCosting>) => {
    const response = await apiClient.put<ApiResponse<ProductCosting>>(`/costing/${id}`, costing);
    return response.data.data;
  },

  deleteCosting: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/costing/${id}`);
    return response.data.data;
  },

  assembleProduct: async (payload: { costingId: string; quantity: number; technicianName?: string; warehouse?: string; note?: string }) => {
    const response = await apiClient.post<ApiResponse<any>>("/costing/assemble", payload);
    return response.data.data;
  },
};
