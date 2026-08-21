import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  errors?: any;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Bearer Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("gperp_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format errors and handle 401
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      // Handle 401 Unauthorized
      if (status === 401) {
        // Token expired or invalid
        localStorage.removeItem("gperp_token");
        localStorage.removeItem("gperp_user");
        // Dispatch custom event for app-wide auth state update
        window.dispatchEvent(new Event("auth:unauthorized"));
      }

      const errorMessage = data?.message || error.message || "Đã xảy ra lỗi kết nối máy chủ";
      return Promise.reject(new Error(errorMessage));
    }
    return Promise.reject(error);
  }
);

export default apiClient;
