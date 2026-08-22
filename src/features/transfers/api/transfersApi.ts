import apiClient, { ApiResponse } from "../../../core/api/apiClient";
import { StockTransfer } from "../../../types";

export interface StockTransferQueryParams {
  search?: string;
  fromWarehouse?: string;
  toWarehouse?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const transfersApi = {
  getTransfers: async (params?: StockTransferQueryParams) => {
    const response = await apiClient.get<ApiResponse<StockTransfer[]>>("/transfers", {
      params,
    });
    return response.data;
  },

  getTransferById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<StockTransfer>>(`/transfers/${id}`);
    return response.data.data;
  },

  createTransfer: async (transfer: Partial<StockTransfer>) => {
    const response = await apiClient.post<ApiResponse<StockTransfer>>("/transfers", transfer);
    return response.data.data;
  },

  updateTransferStatus: async (
    id: string,
    payload: { status: string; receiverName?: string; receivedDate?: string; notes?: string }
  ) => {
    const response = await apiClient.patch<ApiResponse<StockTransfer>>(
      `/transfers/${id}/status`,
      payload
    );
    return response.data.data;
  },

  deleteTransfer: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/transfers/${id}`);
    return response.data.data;
  },
};
