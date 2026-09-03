import axios from "axios";
import { ProductExchange, ReturnPolicyConfig } from "../../../types";

const API_BASE = "/api/exchanges";

export interface ExchangeQueryParams {
  search?: string;
  status?: string;
  paymentAction?: string;
  warehouseName?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedExchangesResponse {
  items: ProductExchange[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const exchangesApi = {
  /**
   * Lấy danh sách phiếu đổi hàng
   */
  async getExchanges(params?: ExchangeQueryParams): Promise<PaginatedExchangesResponse> {
    const res = await axios.get(API_BASE, { params });
    return res.data.data;
  },

  /**
   * Lấy chi tiết 1 phiếu đổi hàng
   */
  async getExchangeById(id: string): Promise<ProductExchange> {
    const res = await axios.get(`${API_BASE}/${id}`);
    return res.data.data;
  },

  /**
   * Tạo phiếu đổi hàng mới
   */
  async createExchange(payload: any): Promise<ProductExchange> {
    const res = await axios.post(API_BASE, payload);
    return res.data.data;
  },

  /**
   * Hoàn tất / Commit phiếu đổi hàng từ Draft sang Completed
   */
  async commitExchange(id: string, userId?: string): Promise<ProductExchange> {
    const res = await axios.post(`${API_BASE}/${id}/commit`, { userId });
    return res.data.data;
  },

  /**
   * Hủy phiếu đổi hàng
   */
  async cancelExchange(id: string, payload: { cancelledBy: string; cancelReason: string }): Promise<ProductExchange> {
    const res = await axios.post(`${API_BASE}/${id}/cancel`, payload);
    return res.data.data;
  },

  /**
   * Lấy cấu hình chính sách đổi trả
   */
  async getReturnPolicy(): Promise<ReturnPolicyConfig> {
    const res = await axios.get(`${API_BASE}/policy/config`);
    return res.data.data;
  },

  /**
   * Cập nhật chính sách đổi trả
   */
  async updateReturnPolicy(payload: Partial<ReturnPolicyConfig>): Promise<ReturnPolicyConfig> {
    const res = await axios.put(`${API_BASE}/policy/config`, payload);
    return res.data.data;
  },
};
