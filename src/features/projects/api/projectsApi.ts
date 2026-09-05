import { apiClient, ApiResponse } from "../../../core/api/apiClient";
import {
  EnterpriseProject,
  ProjectTask,
  TaskProgressLog,
  TaskApproval,
  ProjectMaterialTicket,
} from "../../../types";

export interface ProjectWithStats extends EnterpriseProject {
  totalTasks: number;
  completedTasks: number;
  overallProgress: number;
}

export const projectsApi = {
  // 1. Projects
  getProjects: async () => {
    const res = await apiClient.get<ApiResponse<ProjectWithStats[]>>("/projects");
    return res.data.data || [];
  },

  getProjectById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<EnterpriseProject>>(`/projects/${id}`);
    return res.data.data;
  },

  createProject: async (data: Partial<EnterpriseProject>) => {
    const res = await apiClient.post<ApiResponse<EnterpriseProject>>("/projects", data);
    return res.data.data;
  },

  updateProject: async (id: string, data: Partial<EnterpriseProject>) => {
    const res = await apiClient.put<ApiResponse<EnterpriseProject>>(`/projects/${id}`, data);
    return res.data.data;
  },

  deleteProject: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<{ id: string }>>(`/projects/${id}`);
    return res.data.data;
  },

  // 2. Tasks
  getTasks: async (projectId?: string) => {
    const url = projectId ? `/projects/tasks/list?projectId=${projectId}` : "/projects/tasks/list";
    const res = await apiClient.get<ApiResponse<ProjectTask[]>>(url);
    return res.data.data || [];
  },

  createTask: async (data: Partial<ProjectTask> & { materialDemands?: any[] }) => {
    const res = await apiClient.post<ApiResponse<ProjectTask>>("/projects/tasks", data);
    return res.data.data;
  },

  updateTask: async (id: string, data: Partial<ProjectTask>) => {
    const res = await apiClient.put<ApiResponse<ProjectTask>>(`/projects/tasks/${id}`, data);
    return res.data.data;
  },

  deleteTask: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<{ id: string }>>(`/projects/tasks/${id}`);
    return res.data.data;
  },

  // 3. Progress Log & Weighted Steps
  updateTaskSteps: async (taskId: string, steps: any[], updatedBy?: string) => {
    const res = await apiClient.put<ApiResponse<ProjectTask>>(
      `/projects/tasks/${taskId}/steps`,
      { steps, updatedBy }
    );
    return res.data.data;
  },

  submitTaskForReview: async (taskId: string, updatedBy?: string) => {
    const res = await apiClient.post<ApiResponse<ProjectTask>>(
      `/projects/tasks/${taskId}/submit-review`,
      { updatedBy }
    );
    return res.data.data;
  },

  resubmitTaskAfterRework: async (
    taskId: string,
    data: { reworkNotes: string; updatedBy?: string }
  ) => {
    const res = await apiClient.post<ApiResponse<ProjectTask>>(
      `/projects/tasks/${taskId}/resubmit`,
      data
    );
    return res.data.data;
  },

  addProgressLog: async (
    taskId: string,
    data: {
      updatedBy: string;
      newPercent: number;
      statusChange?: string;
      workLogContent: string;
      issuesFaced?: string;
      attachments?: string[];
    }
  ) => {
    const res = await apiClient.post<ApiResponse<TaskProgressLog>>(
      `/projects/tasks/${taskId}/progress`,
      data
    );
    return res.data.data;
  },

  // 4. Hierarchical Approval (4 Cấp: KCS -> PM -> Director)
  approveTask: async (
    taskId: string,
    data: {
      level: number;
      reviewerName: string;
      reviewerRole: string;
      status: "approved" | "rejected";
      qualityRating?: number;
      reviewNotes?: string;
      punchList?: string;
      signatureData?: string;
      approvalMethod?: "pin" | "pki_ca" | "drawing";
      pinCode?: string;
      pkiCertificateSerial?: string;
    }
  ) => {
    const res = await apiClient.post<ApiResponse<TaskApproval>>(
      `/projects/tasks/${taskId}/approve`,
      data
    );
    return res.data.data;
  },

  // 5. Materials
  getMaterialTickets: async (projectId?: string) => {
    const url = projectId
      ? `/projects/materials/tickets?projectId=${projectId}`
      : "/projects/materials/tickets";
    const res = await apiClient.get<ApiResponse<ProjectMaterialTicket[]>>(url);
    return res.data.data || [];
  },

  createMaterialTicket: async (data: any) => {
    const res = await apiClient.post<ApiResponse<ProjectMaterialTicket>>(
      "/projects/materials/tickets",
      data
    );
    return res.data.data;
  },

  returnMaterials: async (ticketId: string, data: { items: any[]; notes?: string; returneeName?: string }) => {
    const res = await apiClient.post<ApiResponse<ProjectMaterialTicket>>(
      `/projects/materials/tickets/${ticketId}/return`,
      data
    );
    return res.data.data;
  },

  convertInstalledMaterialsToOrder: async (ticketId: string, data: any) => {
    const res = await apiClient.post<ApiResponse<{ order: any; ticketCode: string }>>(
      `/projects/materials/tickets/${ticketId}/convert-to-order`,
      data
    );
    return res.data.data;
  },

  // 6. Backup & Restore
  exportProjectsData: async () => {
    const res = await apiClient.get<ApiResponse<any>>("/projects/export");
    return res.data.data;
  },

  restoreProjectsData: async (backupData: any) => {
    const res = await apiClient.post<ApiResponse<any>>("/projects/restore", backupData);
    return res.data.data;
  },

  // 7. ERP Extensions (CBS, Gantt, PO, Billing, Site Diary, VO)
  addBudgetItem: async (projectId: string, data: any) => {
    const res = await apiClient.post<ApiResponse<any>>(`/projects/${projectId}/budget-items`, data);
    return res.data.data;
  },

  deleteBudgetItem: async (projectId: string, itemId: string) => {
    const res = await apiClient.delete<ApiResponse<any>>(`/projects/${projectId}/budget-items/${itemId}`);
    return res.data.data;
  },

  addActualExpense: async (projectId: string, data: any) => {
    const res = await apiClient.post<ApiResponse<any>>(`/projects/${projectId}/actual-expenses`, data);
    return res.data.data;
  },

  addTaskDependency: async (taskId: string, data: { dependsOnTaskId: string; type?: string; lagDays?: number }) => {
    const res = await apiClient.post<ApiResponse<any>>(`/projects/tasks/${taskId}/dependencies`, data);
    return res.data.data;
  },

  deleteTaskDependency: async (depId: string) => {
    const res = await apiClient.delete<ApiResponse<any>>(`/projects/tasks/dependencies/${depId}`);
    return res.data.data;
  },

  createPoFromDemands: async (projectId: string, data: any) => {
    const res = await apiClient.post<ApiResponse<any>>(`/projects/${projectId}/create-po-from-demands`, data);
    return res.data.data;
  },

  addBillingMilestone: async (projectId: string, data: any) => {
    const res = await apiClient.post<ApiResponse<any>>(`/projects/${projectId}/billing-milestones`, data);
    return res.data.data;
  },

  updateBillingMilestone: async (projectId: string, milestoneId: string, data: any) => {
    const res = await apiClient.put<ApiResponse<any>>(`/projects/${projectId}/billing-milestones/${milestoneId}`, data);
    return res.data.data;
  },

  addHandoverCertificate: async (projectId: string, data: any) => {
    const res = await apiClient.post<ApiResponse<any>>(`/projects/${projectId}/handover-certificates`, data);
    return res.data.data;
  },

  addDailySiteDiary: async (projectId: string, data: any) => {
    const res = await apiClient.post<ApiResponse<any>>(`/projects/${projectId}/site-diaries`, data);
    return res.data.data;
  },

  addVariationOrder: async (projectId: string, data: any) => {
    const res = await apiClient.post<ApiResponse<any>>(`/projects/${projectId}/variation-orders`, data);
    return res.data.data;
  },

  approveVariationOrder: async (projectId: string, voId: string, approvedBy?: string) => {
    const res = await apiClient.put<ApiResponse<any>>(`/projects/${projectId}/variation-orders/${voId}/approve`, { approvedBy });
    return res.data.data;
  },

  // 7. Task Lifecycle & BOM Requisition
  acceptTask: async (taskId: string, data?: { acceptedBy?: string }) => {
    const res = await apiClient.post<ApiResponse<ProjectTask>>(`/projects/tasks/${taskId}/accept`, data || {});
    return res.data.data;
  },

  reassignTask: async (
    taskId: string,
    data: { assigneeId?: string; assigneeName: string; departmentName?: string; reason: string; updatedBy?: string }
  ) => {
    const res = await apiClient.post<ApiResponse<ProjectTask>>(`/projects/tasks/${taskId}/reassign`, data);
    return res.data.data;
  },

  blockTask: async (taskId: string, data: { reason: string; updatedBy?: string }) => {
    const res = await apiClient.post<ApiResponse<ProjectTask>>(`/projects/tasks/${taskId}/block`, data);
    return res.data.data;
  },

  unblockTask: async (taskId: string, data?: { notes?: string; updatedBy?: string }) => {
    const res = await apiClient.post<ApiResponse<ProjectTask>>(`/projects/tasks/${taskId}/unblock`, data || {});
    return res.data.data;
  },

  addTaskMaterialDemand: async (taskId: string, data: any) => {
    const res = await apiClient.post<ApiResponse<any>>(`/projects/tasks/${taskId}/materials`, data);
    return res.data.data;
  },

  deleteTaskMaterialDemand: async (taskId: string, materialId: string) => {
    const res = await apiClient.delete<ApiResponse<any>>(`/projects/tasks/${taskId}/materials/${materialId}`);
    return res.data.data;
  },

  borrowMaterialsFromBom: async (
    taskId: string,
    data?: { requesterName?: string; requesterId?: string; warehouseName?: string; notes?: string }
  ) => {
    const res = await apiClient.post<ApiResponse<ProjectMaterialTicket>>(
      `/projects/tasks/${taskId}/borrow-from-bom`,
      data || {}
    );
    return res.data.data;
  },
};
