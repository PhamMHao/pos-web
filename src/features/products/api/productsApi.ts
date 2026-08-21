import apiClient, { ApiResponse } from "../../../core/api/apiClient";
import { Product } from "../../../types";

export interface ProductQueryParams {
  search?: string;
  category?: string;
  warehouse?: string;
  lowStockOnly?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const productsApi = {
  getProducts: async (params?: ProductQueryParams) => {
    const response = await apiClient.get<ApiResponse<Product[]>>("/products", {
      params: {
        ...params,
        lowStockOnly: params?.lowStockOnly ? "true" : undefined,
      },
    });
    return response.data;
  },

  getProductById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data.data;
  },

  getProductByBarcode: async (code: string) => {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/barcode/${encodeURIComponent(code)}`);
    return response.data.data;
  },

  createProduct: async (product: Partial<Product>) => {
    const response = await apiClient.post<ApiResponse<Product>>("/products", product);
    return response.data.data;
  },

  updateProduct: async (id: string, product: Partial<Product>) => {
    const response = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, product);
    return response.data.data;
  },

  deleteProduct: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/products/${id}`);
    return response.data.data;
  },

  bulkImport: async (products: Partial<Product>[]) => {
    const response = await apiClient.post<ApiResponse<{ total: number; successCount: number; failedCount: number; errors: string[] }>>(
      "/products/bulk-import",
      { products }
    );
    return response.data.data;
  },

  getCategories: async () => {
    const response = await apiClient.get<ApiResponse<{ name: string; count: number }[]>>("/products/categories/list");
    return response.data.data;
  },
};
