import apiClient, { ApiResponse } from "../../../core/api/apiClient";
import { InboundEInvoice } from "../../../types";

export interface InboundInvoiceQueryParams {
  search?: string;
  status?: string;
  source?: string;
  page?: number;
  limit?: number;
}

export const inboundInvoicesApi = {
  getInboundInvoices: async (params?: InboundInvoiceQueryParams) => {
    const response = await apiClient.get<ApiResponse<InboundEInvoice[]>>("/inbound-invoices", {
      params,
    });
    return response.data;
  },

  getInboundInvoiceById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<InboundEInvoice>>(`/inbound-invoices/${id}`);
    return response.data.data;
  },

  createInboundInvoice: async (invoice: Partial<InboundEInvoice>) => {
    const response = await apiClient.post<ApiResponse<InboundEInvoice>>("/inbound-invoices", invoice);
    return response.data.data;
  },

  deleteInboundInvoice: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/inbound-invoices/${id}`);
    return response.data.data;
  },

  importToInventory: async (id: string, payload?: { targetWarehouse?: string; performedBy?: string }) => {
    const response = await apiClient.post<ApiResponse<any>>(`/inbound-invoices/${id}/import-to-inventory`, payload || {});
    return response.data.data;
  },
};
