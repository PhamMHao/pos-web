import apiClient, { ApiResponse } from "../../../core/api/apiClient";
import { PriceQuote } from "../../../types";

export interface QuoteQueryParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const quotesApi = {
  getQuotes: async (params?: QuoteQueryParams) => {
    const response = await apiClient.get<ApiResponse<PriceQuote[]>>("/quotes", {
      params,
    });
    return response.data;
  },

  getQuoteById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<PriceQuote>>(`/quotes/${id}`);
    return response.data.data;
  },

  createQuote: async (quote: Partial<PriceQuote>) => {
    const response = await apiClient.post<ApiResponse<PriceQuote>>("/quotes", quote);
    return response.data.data;
  },

  updateQuote: async (id: string, quote: Partial<PriceQuote>) => {
    const response = await apiClient.put<ApiResponse<PriceQuote>>(`/quotes/${id}`, quote);
    return response.data.data;
  },

  deleteQuote: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/quotes/${id}`);
    return response.data.data;
  },
};
