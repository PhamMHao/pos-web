import apiClient, { ApiResponse } from '../../../core/api/apiClient';
import {
  CustomerContract,
  ContractQueryParams,
  CreateContractPayload,
  SignContractPayload,
  CreateHandoverPayload,
  CreateLiquidationPayload,
} from '../../../components/contracts/contracts.types';

export const contractsApi = {
  getContracts: async (params?: ContractQueryParams) => {
    const response = await apiClient.get<ApiResponse<CustomerContract[]>>('/contracts', {
      params,
    });
    return response.data;
  },

  getContractById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<CustomerContract>>(`/contracts/${id}`);
    return response.data.data;
  },

  createContract: async (payload: CreateContractPayload) => {
    const response = await apiClient.post<ApiResponse<CustomerContract>>('/contracts', payload);
    return response.data.data;
  },

  createFromQuote: async (payload: { quoteId: string; notes?: string }) => {
    const response = await apiClient.post<ApiResponse<CustomerContract>>(
      '/contracts/from-quote',
      payload
    );
    return response.data.data;
  },

  signContract: async (id: string, payload: SignContractPayload) => {
    const response = await apiClient.post<ApiResponse<CustomerContract>>(
      `/contracts/${id}/sign`,
      payload
    );
    return response.data.data;
  },

  createHandover: async (id: string, payload: CreateHandoverPayload) => {
    const response = await apiClient.post<ApiResponse<CustomerContract>>(
      `/contracts/${id}/handovers`,
      payload
    );
    return response.data.data;
  },

  createLiquidation: async (id: string, payload: CreateLiquidationPayload) => {
    const response = await apiClient.post<
      ApiResponse<{ contract: CustomerContract; invoiceCode?: string }>
    >(`/contracts/${id}/liquidations`, payload);
    return response.data;
  },

  deleteContract: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/contracts/${id}`);
    return response.data;
  },
};
