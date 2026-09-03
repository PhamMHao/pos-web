import apiClient, { ApiResponse } from "../../../core/api/apiClient";
import { EInvoice, TaxRiskAssessmentResult } from "../../../types";

export interface EInvoiceQueryParams {
  search?: string;
  status?: string;
  invoiceType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const einvoicesApi = {
  getInvoices: async (params?: EInvoiceQueryParams) => {
    const response = await apiClient.get<ApiResponse<EInvoice[]>>("/einvoices", {
      params,
    });
    return response.data;
  },

  getInvoiceById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<EInvoice>>(`/einvoices/${id}`);
    return response.data.data;
  },

  createInvoice: async (invoice: Partial<EInvoice>) => {
    const response = await apiClient.post<ApiResponse<EInvoice>>("/einvoices", invoice);
    return response.data.data;
  },

  updateInvoiceStatus: async (id: string, status: string) => {
    const response = await apiClient.put<ApiResponse<EInvoice>>(`/einvoices/${id}/status`, { status });
    return response.data.data;
  },

  deleteInvoice: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/einvoices/${id}`);
    return response.data.data;
  },

  lookupTaxCode: async (taxCode: string): Promise<TaxRiskAssessmentResult> => {
    const response = await apiClient.get<ApiResponse<TaxRiskAssessmentResult>>(`/einvoices/lookup-tax/${encodeURIComponent(taxCode.trim())}`);
    return response.data.data;
  },
};
