import { apiClient, ApiResponse } from '../../../core/api/apiClient';
import {
  SequentialApprovalProcess,
  ApprovalWorkflowTemplate,
  ApprovalAnalyticsData,
  ApprovalActionPayload,
} from '../../../components/approvals/approvals.types';

export const approvalsApi = {
  /**
   * Lấy danh sách phiếu trình ký theo bộ lọc
   */
  getProcesses: async (params?: {
    moduleType?: string;
    status?: string;
    search?: string;
    priority?: string;
  }) => {
    const res = await apiClient.get<ApiResponse<SequentialApprovalProcess[]>>('/approvals/processes', {
      params,
    });
    return res.data.data || [];
  },

  /**
   * Lấy chi tiết phiếu trình ký
   */
  getProcessById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<SequentialApprovalProcess>>(`/approvals/processes/${id}`);
    return res.data.data;
  },

  /**
   * Tạo mới phiếu trình ký
   */
  createProcess: async (data: any) => {
    const res = await apiClient.post<ApiResponse<SequentialApprovalProcess>>('/approvals/processes', data);
    return res.data.data;
  },

  /**
   * Ký duyệt / Từ chối / Yêu cầu làm lại
   */
  executeAction: async (processId: string, payload: ApprovalActionPayload) => {
    const res = await apiClient.post<ApiResponse<SequentialApprovalProcess>>(
      `/approvals/processes/${processId}/action`,
      payload
    );
    return res.data.data;
  },

  /**
   * Gửi nhắc nhở duyệt hồ sơ
   */
  sendReminder: async (processId: string, actorName: string) => {
    const res = await apiClient.post<ApiResponse<any>>(`/approvals/processes/${processId}/remind`, {
      actorName,
    });
    return res.data.data;
  },

  /**
   * Lấy danh sách 8 mẫu quy trình chuẩn
   */
  getTemplates: async () => {
    const res = await apiClient.get<ApiResponse<ApprovalWorkflowTemplate[]>>('/approvals/templates');
    return res.data.data || [];
  },

  /**
   * Thống kê KPI và điểm nghẽn
   */
  getAnalytics: async () => {
    const res = await apiClient.get<ApiResponse<ApprovalAnalyticsData>>('/approvals/analytics');
    return res.data.data;
  },
};
