export type ContractType =
  | 'commercial_goods'
  | 'turnkey_project'
  | 'maintenance_service'
  | 'software_solution'
  | 'other';

export type ContractStatus =
  | 'draft'
  | 'internal_review'
  | 'sent_to_customer'
  | 'customer_confirmed'
  | 'purchasing'
  | 'in_progress'
  | 'handover_completed'
  | 'liquidated'
  | 'completed'
  | 'cancelled';

export type ContractApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface CustomerContractItem {
  id: string;
  contractId: string;
  productId?: string | null;
  productCode: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxRate: number;
  totalAmount: number;
  notes?: string | null;
  createdAt: string;
}

export interface CustomerContractMilestone {
  id: string;
  contractId: string;
  milestoneName: string;
  percentage: number;
  amount: number;
  dueDate?: string | null;
  conditions?: string | null;
  isPaid: boolean;
  paidDate?: string | null;
  paidReference?: string | null;
  createdAt: string;
}

export interface ContractHandoverNote {
  id: string;
  handoverCode: string;
  contractId: string;
  handoverDate: string;
  delivererName: string;
  delivererPhone?: string | null;
  receiverName: string;
  receiverPhone?: string | null;
  deliveryLocation?: string | null;
  technicalCondition?: string | null;
  notes?: string | null;
  digitalSignatureReceiver?: string | null;
  digitalSignatureDeliverer?: string | null;
  createdAt: string;
}

export interface ContractLiquidation {
  id: string;
  liquidationCode: string;
  contractId: string;
  liquidationDate: string;
  originalAmount: number;
  actualAmount: number;
  paidAmount: number;
  penaltyOrAdjustment: number;
  finalPaymentAmount: number;
  warrantyCommitment?: string | null;
  conclusion?: string | null;
  status: string;
  signatureA?: string | null;
  signatureB?: string | null;
  createdAt: string;
}

export interface CustomerContract {
  id: string;
  contractNumber: string;
  title: string;
  contractType: ContractType;
  customerId?: string | null;
  customerName: string;
  customerTaxCode?: string | null;
  customerRepresentative?: string | null;
  customerPosition?: string | null;
  customerAddress?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  customerBankName?: string | null;
  customerBankAccount?: string | null;
  companyRepresentative?: string | null;
  companyPosition?: string | null;
  quoteId?: string | null;
  quoteCode?: string | null;
  projectId?: string | null;
  projectCode?: string | null;
  totalAmount: number;
  discountPercent: number;
  taxRate: number;
  taxAmount: number;
  finalTotal: number;
  depositAmount: number;
  paidAmount: number;
  remainingAmount: number;
  signedDate?: string | null;
  effectiveDate?: string | null;
  expiryDate?: string | null;
  warrantyMonths: number;
  termsAndConditions?: string | null;
  status: ContractStatus;
  approvalLevel: number;
  approvalStatus: ContractApprovalStatus;
  digitalSignatureA?: string | null;
  digitalSignatureB?: string | null;
  signatureBDetails?: string | null;
  handoverDate?: string | null;
  liquidationDate?: string | null;
  einvoiceCode?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: CustomerContractItem[];
  milestones?: CustomerContractMilestone[];
  handovers?: ContractHandoverNote[];
  liquidation?: ContractLiquidation | null;
}

export interface ContractQueryParams {
  search?: string;
  status?: string;
  approvalLevel?: number;
  approvalStatus?: string;
  contractType?: string;
  customerId?: string;
  projectId?: string;
  page?: number;
  limit?: number;
}

export interface CreateContractPayload {
  contractNumber?: string;
  title: string;
  contractType?: ContractType;
  customerId?: string;
  customerName: string;
  customerTaxCode?: string;
  customerRepresentative?: string;
  customerPosition?: string;
  customerAddress?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerBankName?: string;
  customerBankAccount?: string;
  companyRepresentative?: string;
  companyPosition?: string;
  quoteId?: string;
  quoteCode?: string;
  projectId?: string;
  projectCode?: string;
  totalAmount?: number;
  discountPercent?: number;
  taxRate?: number;
  depositAmount?: number;
  signedDate?: string;
  effectiveDate?: string;
  expiryDate?: string;
  warrantyMonths?: number;
  termsAndConditions?: string;
  status?: ContractStatus;
  notes?: string;
  items?: Array<{
    productId?: string;
    productCode: string;
    productName: string;
    unit?: string;
    quantity: number;
    unitPrice: number;
    discountPercent?: number;
    taxRate?: number;
    notes?: string;
  }>;
  milestones?: Array<{
    milestoneName: string;
    percentage: number;
    amount: number;
    dueDate?: string;
    conditions?: string;
  }>;
}

export interface SignContractPayload {
  signerType: 'party_a' | 'party_b';
  signerName: string;
  signerPosition?: string;
  signingMethod: string;
  caProvider?: string;
  serialNumber?: string;
  tsaTimestamp?: string;
  signatureHash?: string;
  notes?: string;
}

export interface CreateHandoverPayload {
  handoverCode?: string;
  handoverDate?: string;
  delivererName: string;
  delivererPhone?: string;
  receiverName: string;
  receiverPhone?: string;
  deliveryLocation?: string;
  technicalCondition?: string;
  notes?: string;
  digitalSignatureReceiver?: string;
  digitalSignatureDeliverer?: string;
}

export interface CreateLiquidationPayload {
  liquidationCode?: string;
  liquidationDate?: string;
  actualAmount?: number;
  paidAmount?: number;
  penaltyOrAdjustment?: number;
  finalPaymentAmount?: number;
  warrantyCommitment?: string;
  conclusion?: string;
  signatureA?: string;
  signatureB?: string;
  autoGenerateInvoice?: boolean;
}
