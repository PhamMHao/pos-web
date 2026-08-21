import apiClient, { ApiResponse } from "../../../core/api/apiClient";
import { AccountingRecord } from "../../../types";

export interface FinanceQueryParams {
  search?: string;
  type?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  totalRecords: number;
}

export const financeApi = {
  getRecords: async (params?: FinanceQueryParams) => {
    const response = await apiClient.get<ApiResponse<AccountingRecord[]>>("/finance", {
      params,
    });
    return response.data;
  },

  getSummary: async () => {
    const response = await apiClient.get<ApiResponse<FinanceSummary>>("/finance/summary");
    return response.data.data;
  },

  getRecordById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<AccountingRecord>>(`/finance/${id}`);
    return response.data.data;
  },

  createRecord: async (record: Partial<AccountingRecord>) => {
    const response = await apiClient.post<ApiResponse<AccountingRecord>>("/finance", record);
    return response.data.data;
  },

  updateRecord: async (id: string, record: Partial<AccountingRecord>) => {
    const response = await apiClient.put<ApiResponse<AccountingRecord>>(`/finance/${id}`, record);
    return response.data.data;
  },

  deleteRecord: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/finance/${id}`);
    return response.data.data;
  },
};
