export type ApprovalModuleType =
  | 'purchase_request'
  | 'purchase_order'
  | 'goods_receipt'
  | 'goods_issue'
  | 'work_order'
  | 'delivery'
  | 'accounting_audit'
  | 'cash_settlement';

export type ApprovalProcessStatus =
  | 'in_progress'
  | 'approved'
  | 'rejected'
  | 'rework'
  | 'cancelled';

export type ApprovalStepStatus =
  | 'locked'
  | 'waiting'
  | 'approved'
  | 'rejected'
  | 'rework';

export interface SequentialApprovalStep {
  id: string;
  processId: string;
  stepOrder: number;
  stepName: string;
  requiredRole: string;
  assignedUserId?: string | null;
  assignedUserName: string;
  delegatedToId?: string | null;
  delegatedToName?: string | null;
  status: ApprovalStepStatus;
  slaHours: number;
  slaDeadline?: string | null;
  isOverdue?: boolean;
  actedAt?: string | null;
  actedBy?: string | null;
  decision?: 'approved' | 'rejected' | 'rework' | null;
  reviewNotes?: string | null;
  reworkRequirements?: string | null;
  signMethod?: 'pin' | 'pki_ca' | 'drawing';
  signatureData?: string | null;
  pkiCertificateSerial?: string | null;
  pkiSignatureHash?: string | null;
  caProvider?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalAuditLog {
  id: string;
  processId: string;
  action: string;
  stepOrder?: number | null;
  actorName: string;
  actorRole?: string | null;
  note?: string | null;
  ipAddress?: string | null;
  timestamp: string;
}

export interface SequentialApprovalProcess {
  id: string;
  processCode: string;
  templateId?: string | null;
  moduleType: ApprovalModuleType;
  title: string;
  referenceDocId?: string | null;
  referenceDocCode: string;
  departmentName: string;
  requesterId?: string | null;
  requesterName: string;
  totalAmount: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  currentStepNumber: number;
  totalSteps: number;
  status: ApprovalProcessStatus;
  urgencyReason?: string | null;
  summaryNotes?: string | null;
  attachedFiles?: string | null;
  slaDeadline?: string | null;
  isOverdue?: boolean;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  steps: SequentialApprovalStep[];
  auditLogs: ApprovalAuditLog[];
}

export interface ApprovalWorkflowTemplateStep {
  id: string;
  templateId: string;
  stepOrder: number;
  stepName: string;
  requiredRole: string;
  assignedUserName?: string | null;
  minAmount?: number | null;
  maxAmount?: number | null;
  slaHours: number;
  canDelegate: boolean;
  signMethod: string;
  description?: string | null;
}

export interface ApprovalWorkflowTemplate {
  id: string;
  code: string;
  name: string;
  moduleType: ApprovalModuleType;
  department?: string | null;
  description?: string | null;
  isActive: boolean;
  steps: ApprovalWorkflowTemplateStep[];
}

export interface ApprovalAnalyticsData {
  kpis: {
    total: number;
    approved: number;
    inProgress: number;
    rework: number;
    rejected: number;
    overdueCount: number;
    avgApprovalHours: number;
    complianceRate: number;
  };
  stageAnalytics: Array<{
    moduleType: string;
    name: string;
    total: number;
    approved: number;
    pending: number;
    complianceRate: number;
  }>;
}

export interface ApprovalActionPayload {
  stepId?: string;
  stepOrder?: number;
  action: 'approve' | 'reject' | 'rework';
  actedBy: string;
  userRole?: string;
  reviewNotes?: string;
  reworkRequirements?: string;
  signMethod?: 'pin' | 'pki_ca' | 'drawing';
  signatureData?: string;
  pkiCertificateSerial?: string;
  pkiSignatureHash?: string;
  caProvider?: string;
}

export const APPROVAL_MODULE_CONFIG: Record<
  ApprovalModuleType,
  { label: string; badge: string; color: string; iconBg: string; text: string }
> = {
  purchase_request: {
    label: '1. Đề Xuất Mua Hàng (PR)',
    badge: 'bg-sky-100 text-sky-800 border-sky-300',
    color: 'sky',
    iconBg: 'bg-sky-500 text-white',
    text: 'PR',
  },
  purchase_order: {
    label: '2. Đơn Mua Hàng (PO)',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    color: 'indigo',
    iconBg: 'bg-indigo-500 text-white',
    text: 'PO',
  },
  goods_receipt: {
    label: '3. Nhập Kho & KCS (GRN)',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    color: 'emerald',
    iconBg: 'bg-emerald-500 text-white',
    text: 'GRN',
  },
  goods_issue: {
    label: '4. Xuất Kho Vật Tư (PXK)',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
    color: 'amber',
    iconBg: 'bg-amber-500 text-white',
    text: 'PXK',
  },
  work_order: {
    label: '5. Lệnh Sản Xuất (WO)',
    badge: 'bg-purple-100 text-purple-800 border-purple-300',
    color: 'purple',
    iconBg: 'bg-purple-500 text-white',
    text: 'WO',
  },
  delivery: {
    label: '6. Giao Hàng & POD',
    badge: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    color: 'cyan',
    iconBg: 'bg-cyan-500 text-white',
    text: 'POD',
  },
  accounting_audit: {
    label: '7. Kế Toán Đối Soát',
    badge: 'bg-blue-100 text-blue-800 border-blue-300',
    color: 'blue',
    iconBg: 'bg-blue-500 text-white',
    text: 'ACC',
  },
  cash_settlement: {
    label: '8. Thu / Chi Quỹ',
    badge: 'bg-rose-100 text-rose-800 border-rose-300',
    color: 'rose',
    iconBg: 'bg-rose-500 text-white',
    text: 'CASH',
  },
};
