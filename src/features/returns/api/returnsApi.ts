import apiClient, { ApiResponse } from "../../../core/api/apiClient";
import { ReturnOrder } from "../../../types";

export interface ReturnOrderQueryParams {
  search?: string;
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const returnsApi = {
  getReturnOrders: async (params?: ReturnOrderQueryParams) => {
    const response = await apiClient.get<ApiResponse<ReturnOrder[]>>("/returns", {
      params,
    });
    return response.data;
  },

  getReturnOrderById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<ReturnOrder>>(`/returns/${id}`);
    return response.data.data;
  },

  createReturnOrder: async (returnOrder: Partial<ReturnOrder>) => {
    const response = await apiClient.post<ApiResponse<ReturnOrder>>("/returns", returnOrder);
    return response.data.data;
  },

  deleteReturnOrder: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/returns/${id}`);
    return response.data.data;
  },
};
