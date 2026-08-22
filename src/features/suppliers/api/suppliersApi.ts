import apiClient, { ApiResponse } from "../../../core/api/apiClient";
import { Supplier, PurchaseOrder } from "../../../types";

export interface SupplierQueryParams {
  search?: string;
  category?: string;
  tier?: string;
  page?: number;
  limit?: number;
}

export interface PurchaseOrderQueryParams {
  search?: string;
  supplierId?: string;
  status?: string;
  paymentStatus?: string;
  page?: number;
  limit?: number;
}

export const suppliersApi = {
  // --- SUPPLIERS ---
  getSuppliers: async (params?: SupplierQueryParams) => {
    const response = await apiClient.get<ApiResponse<Supplier[]>>("/suppliers", {
      params,
    });
    return response.data;
  },

  getSupplierById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Supplier>>(`/suppliers/${id}`);
    return response.data.data;
  },

  createSupplier: async (supplier: Partial<Supplier>) => {
    const response = await apiClient.post<ApiResponse<Supplier>>("/suppliers", supplier);
    return response.data.data;
  },

  updateSupplier: async (id: string, supplier: Partial<Supplier>) => {
    const response = await apiClient.put<ApiResponse<Supplier>>(`/suppliers/${id}`, supplier);
    return response.data.data;
  },

  deleteSupplier: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/suppliers/${id}`);
    return response.data.data;
  },

  // --- PURCHASE ORDERS ---
  getPurchaseOrders: async (params?: PurchaseOrderQueryParams) => {
    const response = await apiClient.get<ApiResponse<PurchaseOrder[]>>("/suppliers/orders/list", {
      params,
    });
    return response.data;
  },

  getPurchaseOrderById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<PurchaseOrder>>(`/suppliers/orders/${id}`);
    return response.data.data;
  },

  createPurchaseOrder: async (po: Partial<PurchaseOrder>) => {
    const response = await apiClient.post<ApiResponse<PurchaseOrder>>("/suppliers/orders", po);
    return response.data.data;
  },

  updatePurchaseOrderStatus: async (
    id: string,
    payload: { status: string; paidAmount?: number; paymentStatus?: string; notes?: string }
  ) => {
    const response = await apiClient.patch<ApiResponse<PurchaseOrder>>(`/suppliers/orders/${id}/status`, payload);
    return response.data.data;
  },

  deletePurchaseOrder: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/suppliers/orders/${id}`);
    return response.data.data;
  },
};
