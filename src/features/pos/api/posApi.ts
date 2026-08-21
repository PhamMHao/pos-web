import apiClient, { ApiResponse } from "../../../core/api/apiClient";
import { Order, CashShift } from "../../../types";

export interface OrderQueryParams {
  search?: string;
  status?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  shiftId?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const posApi = {
  // --- ORDERS ---
  getOrders: async (params?: OrderQueryParams) => {
    const response = await apiClient.get<ApiResponse<Order[]>>("/pos/orders", {
      params,
    });
    return response.data;
  },

  getOrderById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Order>>(`/pos/orders/${id}`);
    return response.data.data;
  },

  createOrder: async (order: any) => {
    const response = await apiClient.post<ApiResponse<Order>>("/pos/orders", order);
    return response.data.data;
  },

  updateOrderStatus: async (id: string, data: { status: string; paymentStatus?: string; note?: string }) => {
    const response = await apiClient.put<ApiResponse<Order>>(`/pos/orders/${id}/status`, data);
    return response.data.data;
  },

  // --- CASH SHIFTS ---
  getCurrentShift: async () => {
    const response = await apiClient.get<ApiResponse<CashShift | null>>("/pos/shifts/current");
    return response.data.data;
  },

  getShiftHistory: async (limit = 30) => {
    const response = await apiClient.get<ApiResponse<CashShift[]>>("/pos/shifts/history", {
      params: { limit },
    });
    return response.data.data;
  },

  openShift: async (data: {
    shiftName: string;
    staffId?: string;
    staffName: string;
    initialCash: number;
    note?: string;
  }) => {
    const response = await apiClient.post<ApiResponse<CashShift>>("/pos/shifts/open", data);
    return response.data.data;
  },

  closeShift: async (
    id: string,
    data: {
      actualEndingCash: number;
      note?: string;
    }
  ) => {
    const response = await apiClient.post<ApiResponse<CashShift>>(`/pos/shifts/${id}/close`, data);
    return response.data.data;
  },
};
