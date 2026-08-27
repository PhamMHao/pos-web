import apiClient, { ApiResponse } from "../../../core/api/apiClient";
import { InventoryLog, StockGoodsReceipt, StockGoodsIssue } from "../../../types";

export interface GoodsReceiptQueryParams {
  search?: string;
  supplierName?: string;
  paymentStatus?: string;
  warehouseName?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface GoodsIssueQueryParams {
  search?: string;
  orderCode?: string;
  customerName?: string;
  warehouseName?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface InventoryLogQueryParams {
  productId?: string;
  sku?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const warehouseApi = {
  // 1. Goods Receipts (Phiếu Nhập Kho)
  getGoodsReceipts: async (params?: GoodsReceiptQueryParams) => {
    const response = await apiClient.get<ApiResponse<StockGoodsReceipt[]>>("/warehouse/receipts", {
      params,
    });
    return response.data;
  },

  getGoodsReceiptById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<StockGoodsReceipt>>(`/warehouse/receipts/${id}`);
    return response.data.data;
  },

  createGoodsReceipt: async (receipt: Partial<StockGoodsReceipt>) => {
    const response = await apiClient.post<ApiResponse<StockGoodsReceipt>>("/warehouse/receipts", receipt);
    return response.data.data;
  },

  // 2. Goods Issues (Phiếu Xuất Kho)
  getGoodsIssues: async (params?: GoodsIssueQueryParams) => {
    const response = await apiClient.get<ApiResponse<StockGoodsIssue[]>>("/warehouse/issues", {
      params,
    });
    return response.data;
  },

  getGoodsIssueById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<StockGoodsIssue>>(`/warehouse/issues/${id}`);
    return response.data.data;
  },

  createGoodsIssue: async (issue: Partial<StockGoodsIssue>) => {
    const response = await apiClient.post<ApiResponse<StockGoodsIssue>>("/warehouse/issues", issue);
    return response.data.data;
  },

  // 3. Stock Adjustments & Logs
  adjustStock: async (data: {
    productId: string;
    productName: string;
    sku: string;
    type: "import" | "export" | "audit_adjustment" | "sale_deduct";
    quantityChange: number;
    oldStock: number;
    newStock: number;
    unitPrice?: number | null;
    reason: string;
    performedBy?: string;
  }) => {
    const response = await apiClient.post<ApiResponse<InventoryLog>>("/warehouse/adjust-stock", data);
    return response.data.data;
  },

  getInventoryLogs: async (params?: InventoryLogQueryParams) => {
    const response = await apiClient.get<ApiResponse<InventoryLog[]>>("/warehouse/logs", {
      params,
    });
    return response.data;
  },
};
