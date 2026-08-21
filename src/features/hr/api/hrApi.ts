import apiClient, { ApiResponse } from "../../../core/api/apiClient";
import { Employee, LaborContract } from "../../../types";

export interface EmployeeQueryParams {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface LaborContractQueryParams {
  search?: string;
  status?: string;
  contractType?: string;
  page?: number;
  limit?: number;
}

export const hrApi = {
  // --- EMPLOYEES ---
  getEmployees: async (params?: EmployeeQueryParams) => {
    const response = await apiClient.get<ApiResponse<Employee[]>>("/hr/employees", {
      params,
    });
    return response.data;
  },

  getEmployeeById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Employee>>(`/hr/employees/${id}`);
    return response.data.data;
  },

  createEmployee: async (employee: Partial<Employee>) => {
    const response = await apiClient.post<ApiResponse<Employee>>("/hr/employees", employee);
    return response.data.data;
  },

  updateEmployee: async (id: string, employee: Partial<Employee>) => {
    const response = await apiClient.put<ApiResponse<Employee>>(`/hr/employees/${id}`, employee);
    return response.data.data;
  },

  deleteEmployee: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/hr/employees/${id}`);
    return response.data.data;
  },

  // --- LABOR CONTRACTS ---
  getLaborContracts: async (params?: LaborContractQueryParams) => {
    const response = await apiClient.get<ApiResponse<LaborContract[]>>("/hr/contracts", {
      params,
    });
    return response.data;
  },

  getLaborContractById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<LaborContract>>(`/hr/contracts/${id}`);
    return response.data.data;
  },

  createLaborContract: async (contract: Partial<LaborContract>) => {
    const response = await apiClient.post<ApiResponse<LaborContract>>("/hr/contracts", contract);
    return response.data.data;
  },

  updateLaborContract: async (id: string, contract: Partial<LaborContract>) => {
    const response = await apiClient.put<ApiResponse<LaborContract>>(`/hr/contracts/${id}`, contract);
    return response.data.data;
  },

  deleteLaborContract: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/hr/contracts/${id}`);
    return response.data.data;
  },
};
