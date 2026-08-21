import apiClient, { ApiResponse } from "../../../core/api/apiClient";
import { Promotion } from "../../../types";

export interface PromotionQueryParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export const promotionsApi = {
  getPromotions: async (params?: PromotionQueryParams) => {
    const response = await apiClient.get<ApiResponse<Promotion[]>>("/promotions", {
      params: {
        ...params,
        isActive: params?.isActive !== undefined ? String(params.isActive) : undefined,
      },
    });
    return response.data;
  },

  getPromotionById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Promotion>>(`/promotions/${id}`);
    return response.data.data;
  },

  getPromotionByCode: async (code: string) => {
    const response = await apiClient.get<ApiResponse<Promotion>>(`/promotions/code/${encodeURIComponent(code)}`);
    return response.data.data;
  },

  createPromotion: async (promo: Partial<Promotion>) => {
    const response = await apiClient.post<ApiResponse<Promotion>>("/promotions", promo);
    return response.data.data;
  },

  updatePromotion: async (id: string, promo: Partial<Promotion>) => {
    const response = await apiClient.put<ApiResponse<Promotion>>(`/promotions/${id}`, promo);
    return response.data.data;
  },

  deletePromotion: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/promotions/${id}`);
    return response.data.data;
  },

  validatePromoCode: async (code: string, orderTotal: number) => {
    const response = await apiClient.post<ApiResponse<{ valid: boolean; discountAmount: number; message: string }>>(
      "/promotions/validate",
      { code, orderTotal }
    );
    return response.data.data;
  },
};
