import apiClient, { ApiResponse } from "../../../core/api/apiClient";
import { WarrantyTicket, SerialDeviceRecord } from "../../../types";

export interface WarrantyTicketQueryParams {
  search?: string;
  status?: string;
  type?: string;
  priority?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SerialDeviceQueryParams {
  search?: string;
  warrantyStatus?: string;
  page?: number;
  limit?: number;
}

export const warrantiesApi = {
  // --- WARRANTY TICKETS ---
  getWarrantyTickets: async (params?: WarrantyTicketQueryParams) => {
    const response = await apiClient.get<ApiResponse<WarrantyTicket[]>>("/warranties/tickets", {
      params,
    });
    return response.data;
  },

  getWarrantyTicketById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<WarrantyTicket>>(`/warranties/tickets/${id}`);
    return response.data.data;
  },

  createWarrantyTicket: async (ticket: Partial<WarrantyTicket>) => {
    const response = await apiClient.post<ApiResponse<WarrantyTicket>>("/warranties/tickets", ticket);
    return response.data.data;
  },

  updateWarrantyTicket: async (id: string, ticket: Partial<WarrantyTicket>) => {
    const response = await apiClient.put<ApiResponse<WarrantyTicket>>(`/warranties/tickets/${id}`, ticket);
    return response.data.data;
  },

  deleteWarrantyTicket: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/warranties/tickets/${id}`);
    return response.data.data;
  },

  // --- SERIAL DEVICES ---
  getSerialDevices: async (params?: SerialDeviceQueryParams) => {
    const response = await apiClient.get<ApiResponse<SerialDeviceRecord[]>>("/warranties/devices", {
      params,
    });
    return response.data;
  },

  getSerialDeviceByCode: async (serial: string) => {
    const response = await apiClient.get<ApiResponse<SerialDeviceRecord>>(`/warranties/devices/${encodeURIComponent(serial)}`);
    return response.data.data;
  },

  createOrUpdateSerialDevice: async (device: Partial<SerialDeviceRecord>) => {
    const response = await apiClient.post<ApiResponse<SerialDeviceRecord>>("/warranties/devices", device);
    return response.data.data;
  },
};
