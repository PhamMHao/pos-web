import apiClient, { ApiResponse } from "../../../core/api/apiClient";
import { Customer } from "../../../types";

export interface CustomerQueryParams {
  search?: string;
  tier?: string;
  hasDebt?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const customersApi = {
  getCustomers: async (params?: CustomerQueryParams) => {
    const response = await apiClient.get<ApiResponse<Customer[]>>("/customers", {
      params: {
        ...params,
        hasDebt: params?.hasDebt ? "true" : undefined,
      },
    });
    return response.data;
  },

  getCustomerById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Customer>>(`/customers/${id}`);
    return response.data.data;
  },

  getCustomerByPhone: async (phone: string) => {
    const response = await apiClient.get<ApiResponse<Customer>>(`/customers/phone/${encodeURIComponent(phone)}`);
    return response.data.data;
  },

  createCustomer: async (customer: Partial<Customer>) => {
    const response = await apiClient.post<ApiResponse<Customer>>("/customers", customer);
    return response.data.data;
  },

  updateCustomer: async (id: string, customer: Partial<Customer>) => {
    const response = await apiClient.put<ApiResponse<Customer>>(`/customers/${id}`, customer);
    return response.data.data;
  },

  deleteCustomer: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/customers/${id}`);
    return response.data.data;
  },

  adjustPoints: async (id: string, pointsChange: number, reason?: string) => {
    const response = await apiClient.post<ApiResponse<Customer>>(`/customers/${id}/adjust-points`, {
      pointsChange,
      reason,
    });
    return response.data.data;
  },

  adjustDebt: async (id: string, debtChange: number, reason?: string) => {
    const response = await apiClient.post<ApiResponse<Customer>>(`/customers/${id}/adjust-debt`, {
      debtChange,
      reason,
    });
    return response.data.data;
  },

  bulkImport: async (customers: Partial<Customer>[]) => {
    const response = await apiClient.post<ApiResponse<{ total: number; successCount: number; failedCount: number; errors: string[] }>>(
      "/customers/bulk-import",
      { customers }
    );
    return response.data.data;
  },
};
