import {
  EnterpriseProject as BaseEnterpriseProject,
  ProjectTask as BaseProjectTask,
  TaskProgressLog,
  TaskApproval,
  ProjectMaterialTicket,
  ProjectTaskStatus,
  ProjectTaskPriority,
  WeightedTaskStep,
  Product,
  Customer,
  Employee,
} from "../../../types";

export type {
  TaskProgressLog,
  TaskApproval,
  ProjectMaterialTicket,
  ProjectTaskStatus,
  ProjectTaskPriority,
  WeightedTaskStep,
  Product,
  Customer,
  Employee,
};

// =========================================================
// 1. PERSONA RBAC 4 CẤP BẬC & BỘ NĂNG LỰC THẨM QUYỀN
// =========================================================
export interface PersonaCapabilities {
  canCreateTask: boolean;
  canAssignTask: boolean;
  canAcceptTask: boolean;
  canUpdateProgress: boolean;
  canBlockTask: boolean;
  canUnblockTask: boolean;
  canInspectKcs: boolean;
  canRejectRework: boolean;
  canApproveL2: boolean;
  canApproveL3: boolean;
  canApproveL4: boolean;
  canSettleOrder: boolean;
  canReturnStock: boolean;
  maxApprovalBudget: number; // Hạn mức tài chính tối đa (VNĐ)
}

export type RoleQueueFilter =
  | "all"
  | "my_tasks"
  | "inspection_queue"
  | "dispatch_queue"
  | "executive_queue";

export interface Persona {
  id: string;
  name: string;
  role: string;
  level: number; // 1 | 2 | 3 | 4
  rank: number; // 10 | 30 | 60 | 100
  title: string;
  department?: string;
  description: string;
  badgeColor: string;
  avatar: string;
  employeeId: string;
  username?: string;
  capabilities: PersonaCapabilities;
}

export const PERSONAS: Persona[] = [
  {
    id: "persona-tech",
    name: "Đỗ Minh Khang",
    role: "Kỹ Thuật Viên Thi Công",
    level: 1,
    rank: 10,
    title: "Cấp 1 (Hạng 10)",
    department: "Phòng Thi Công Kỹ Thuật",
    description: "Tiếp nhận việc, tích chọn tiến độ theo trọng số từng bước, đề xuất mượn kho & khắc phục lỗi.",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    avatar: "👨‍🔧",
    employeeId: "emp-5",
    username: "kythuat01",
    capabilities: {
      canCreateTask: false,
      canAssignTask: false,
      canAcceptTask: true,
      canUpdateProgress: true,
      canBlockTask: true,
      canUnblockTask: false,
      canInspectKcs: false,
      canRejectRework: false,
      canApproveL2: false,
      canApproveL3: false,
      canApproveL4: false,
      canSettleOrder: false,
      canReturnStock: true,
      maxApprovalBudget: 0,
    },
  },
  {
    id: "persona-kcs",
    name: "Lê Văn Tuấn",
    role: "Giám Sát KCS / QA-QC",
    level: 2,
    rank: 30,
    title: "Cấp 2 (Hạng 30)",
    department: "Phòng Đảm Bảo Chất Lượng QA-QC",
    description: "Kiểm tra chất lượng thi công, ký duyệt nghiệm thu Cấp 2 hoặc Từ chối yêu cầu sửa chữa (Rework).",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    avatar: "👷‍♂️",
    employeeId: "emp-6",
    username: "kcs01",
    capabilities: {
      canCreateTask: false,
      canAssignTask: false,
      canAcceptTask: false,
      canUpdateProgress: false,
      canBlockTask: false,
      canUnblockTask: false,
      canInspectKcs: true,
      canRejectRework: true,
      canApproveL2: true,
      canApproveL3: false,
      canApproveL4: false,
      canSettleOrder: false,
      canReturnStock: false,
      maxApprovalBudget: 0,
    },
  },
  {
    id: "persona-pm",
    name: "Trần Quốc Bảo",
    role: "Quản Lý Dự Án / PM",
    level: 3,
    rank: 60,
    title: "Cấp 3 (Hạng 60)",
    department: "Ban Quản Lý Dự Án PMO",
    description: "Ký duyệt kỹ thuật tổng thể Cấp 3 (Chỉ mở khóa ký sau khi KCS hoàn tất phê duyệt đạt chuẩn).",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    avatar: "🧑‍💼",
    employeeId: "emp-7",
    username: "manager01",
    capabilities: {
      canCreateTask: true,
      canAssignTask: true,
      canAcceptTask: true,
      canUpdateProgress: true,
      canBlockTask: true,
      canUnblockTask: true,
      canInspectKcs: true,
      canRejectRework: true,
      canApproveL2: false,
      canApproveL3: true,
      canApproveL4: false,
      canSettleOrder: false,
      canReturnStock: true,
      maxApprovalBudget: 50000000,
    },
  },
  {
    id: "persona-dir",
    name: "Phạm Ngọc Thơm",
    role: "Tổng Giám Đốc",
    level: 4,
    rank: 100,
    title: "Cấp 4 (Hạng 100)",
    department: "Ban Giám Đốc Điều Hành",
    description: "Ký duyệt đóng dự án, nghiệm thu bàn giao và kích hoạt quy trình quyết toán / xuất hóa đơn POS.",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    avatar: "👑",
    employeeId: "emp-8",
    username: "admin",
    capabilities: {
      canCreateTask: true,
      canAssignTask: true,
      canAcceptTask: true,
      canUpdateProgress: true,
      canBlockTask: true,
      canUnblockTask: true,
      canInspectKcs: true,
      canRejectRework: true,
      canApproveL2: true,
      canApproveL3: true,
      canApproveL4: true,
      canSettleOrder: true,
      canReturnStock: true,
      maxApprovalBudget: 10000000000,
    },
  },
];

// =========================================================
// 2. PHỤ THUỘC CÔNG VIỆC & CPM GANTT (PHASE 4)
// =========================================================
export type DependencyType = "FS" | "SS" | "FF" | "SF";

export interface TaskDependency {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
  type: DependencyType;
  lagDays: number;
  dependsOnTask?: {
    id: string;
    code: string;
    title: string;
    status: string;
    progressPercent: number;
  };
}

export interface ProjectTask extends BaseProjectTask {
  isMilestone?: boolean;
  isCriticalPath?: boolean;
  dependencies?: TaskDependency[];
  dependentTasks?: TaskDependency[];
}

// =========================================================
// 3. DỰ TOÁN CHI PHÍ & THỰC TẾ (CBS - PHASE 3)
// =========================================================
export type CostCategory =
  | "material"
  | "labor"
  | "machinery"
  | "subcontractor"
  | "overheads";

export interface ProjectBudgetItem {
  id: string;
  projectId: string;
  category: CostCategory;
  itemName: string;
  unit: string;
  estimatedQty: number;
  unitRate: number;
  totalEstimatedCost: number;
  notes?: string;
  actualSpent?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectActualExpense {
  id: string;
  projectId: string;
  budgetItemId?: string;
  expenseCode: string;
  category: CostCategory;
  amount: number;
  spentDate: string;
  payee: string;
  invoiceRef?: string;
  description: string;
  recordedBy: string;
  createdAt?: string;
}

// =========================================================
// 4. MUA SẮM & GIỮ HÀNG KHO (PHASE 5)
// =========================================================
export interface ProjectStockReservation {
  id: string;
  projectId: string;
  productId: string;
  sku: string;
  productName: string;
  reservedQty: number;
  status: "reserved" | "dispatched" | "cancelled";
  notes?: string;
  createdAt?: string;
}

// =========================================================
// 5. TIẾN ĐỘ THU TIỀN & BIÊN BẢN A-B (PHASE 6)
// =========================================================
export type MilestoneBillingStatus = "pending" | "invoiced" | "paid" | "overdue";

export interface ProjectBillingMilestone {
  id: string;
  projectId: string;
  milestoneCode: string;
  milestoneName: string;
  percentage: number;
  plannedAmount: number;
  actualInvoicedAmount: number;
  paidAmount: number;
  dueDate?: string;
  status: MilestoneBillingStatus;
  isRetention?: boolean;
  retentionReleaseDate?: string;
  notes?: string;
  createdAt?: string;
}

export interface ProjectHandoverCertificate {
  id: string;
  projectId: string;
  certificateCode: string;
  title: string;
  handoverDate: string;
  partyARepresentative: string;
  partyAPosition?: string;
  partyBRepresentative: string;
  partyBPosition?: string;
  content: string;
  acceptedValue: number;
  status: "draft" | "signed" | "approved";
  signatureA?: string;
  signatureB?: string;
  notes?: string;
  createdAt?: string;
}

// =========================================================
// 6. NHẬT KÝ CÔNG TRƯỜNG & HẠNG MỤC PHÁT SINH VO (PHASE 7)
// =========================================================
export interface ProjectDailySiteDiary {
  id: string;
  projectId: string;
  diaryDate: string;
  weather: string;
  temperature?: string;
  workforceCount: number;
  machineryOnSite?: string;
  tasksExecuted: string;
  issuesFaced?: string;
  safetyHseStatus: string;
  photos?: string[];
  recordedBy: string;
  createdAt?: string;
}

export interface ProjectVariationOrder {
  id: string;
  projectId: string;
  voCode: string;
  title: string;
  reason: string;
  requestedBy: string;
  costAdjustment: number;
  timeAdjustmentDays: number;
  status: "draft" | "submitted" | "approved" | "rejected";
  approvedDate?: string;
  approvedBy?: string;
  createdAt?: string;
}

// =========================================================
// 7. DỰ ÁN MỞ RỘNG (PROJECT 360° & EVM)
// =========================================================
export interface ProjectEvmMetrics {
  pv: number; // Planned Value
  ev: number; // Earned Value
  ac: number; // Actual Cost
  cv: number; // Cost Variance = EV - AC
  sv: number; // Schedule Variance = EV - PV
  cpi: number; // Cost Performance Index = EV / AC
  spi: number; // Schedule Performance Index = EV / PV
  eac: number; // Estimate at Completion
  status: "good" | "warning" | "critical";
}

export interface EnterpriseProject extends BaseEnterpriseProject {
  tasks?: ProjectTask[];
  materialTickets?: ProjectMaterialTicket[];
  budgetItems?: ProjectBudgetItem[];
  actualExpenses?: ProjectActualExpense[];
  billingMilestones?: ProjectBillingMilestone[];
  handoverCertificates?: ProjectHandoverCertificate[];
  dailySiteDiaries?: ProjectDailySiteDiary[];
  variationOrders?: ProjectVariationOrder[];
  stockReservations?: ProjectStockReservation[];
  totalTasks?: number;
  completedTasks?: number;
  overallProgress?: number;
  totalBudgetCost?: number;
  totalActualCost?: number;
  grossMargin?: number;
  evm?: ProjectEvmMetrics;
}
