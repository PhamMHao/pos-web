import apiClient, { ApiResponse } from "../../../core/api/apiClient";
import { InventoryLog } from "../../../types";

export interface StockGoodsReceiptItem {
  id?: string;
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  quantity: number;
  oldStock: number;
  newStock: number;
  oldCostPrice: number;
  newCostPrice: number;
  unitCost: number;
  taxRate: number;
  totalAmount: number;
  storageLocation?: string | null;
  warehouse?: string | null;
  category?: string | null;
  notes?: string | null;
}

export interface StockGoodsReceipt {
  id: string;
  code: string;
  date: string;
  inboundInvoiceId?: string | null;
  inboundInvoiceCode?: string | null;
  supplierName: string;
  supplierTaxCode?: string | null;
  warehouseName: string;
  creatorName: string;
  receivedBy: string;
  totalItemsCount: number;
  totalQuantity: number;
  totalCostAmount: number;
  totalTaxAmount: number;
  grandTotal: number;
  paymentStatus: string;
  notes?: string | null;
  items: StockGoodsReceiptItem[];
}

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
