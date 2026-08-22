import apiClient, { ApiResponse } from "../../../core/api/apiClient";
import { FraudAlert } from "../../../types";

export interface FraudAlertQueryParams {
  search?: string;
  severity?: string;
  source?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const fraudAlertsApi = {
  getAlerts: async (params?: FraudAlertQueryParams) => {
    const response = await apiClient.get<ApiResponse<FraudAlert[]>>("/fraud-alerts", {
      params,
    });
    return response.data;
  },

  getAlertById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<FraudAlert>>(`/fraud-alerts/${id}`);
    return response.data.data;
  },

  createAlert: async (alert: Partial<FraudAlert>) => {
    const response = await apiClient.post<ApiResponse<FraudAlert>>("/fraud-alerts", alert);
    return response.data.data;
  },

  updateAlert: async (id: string, alert: Partial<FraudAlert>) => {
    const response = await apiClient.put<ApiResponse<FraudAlert>>(`/fraud-alerts/${id}`, alert);
    return response.data.data;
  },

  resolveAlert: async (id: string) => {
    const response = await apiClient.patch<ApiResponse<FraudAlert>>(`/fraud-alerts/${id}/resolve`);
    return response.data.data;
  },

  deleteAlert: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/fraud-alerts/${id}`);
    return response.data.data;
  },
};
