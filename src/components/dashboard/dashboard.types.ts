import {
  Order,
  Product,
  Customer,
  Supplier,
  StoreSettings,
  Employee,
  LaborContract,
  CashShift,
  PurchaseOrder,
  EnterpriseAsset,
} from '../../types';

export type DashboardTabType = 'overview' | 'hr_kpi' | 'partners_supply' | 'assets_lifecycle';
export type TimeRangeType = 'today' | '7days' | '14days' | '30days' | 'month' | 'quarter' | 'all' | 'custom';
export type DailyChartType = 'area' | 'bar' | 'table';
export type BestSellerMetric = 'revenue' | 'quantity';

export interface DashboardViewProps {
  orders?: Order[];
  products?: Product[];
  customers?: Customer[];
  suppliers?: Supplier[];
  employees?: Employee[];
  laborContracts?: LaborContract[];
  shifts?: CashShift[];
  purchaseOrders?: PurchaseOrder[];
  assets?: EnterpriseAsset[];
  settings?: StoreSettings;
  onNavigate?: (tab: string) => void;
  onOpenPO?: (product?: Product) => void;
}

// 1. Business & Inventory Types
export interface InventoryMetrics {
  totalStockCapital: number;
  totalStockUnits: number;
  totalSku: number;
  safeStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  safePercent: number;
  lowStockPercent: number;
  outOfStockPercent: number;
}

export interface DailyTimelineItem {
  fullDate: string;
  date: string;
  DoanhThu: number;
  GiaVon: number;
  LoiNhuan: number;
  OrderCount: number;
  margin: string;
}

export interface TopProductItem {
  productId: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  revenue: number;
  profit: number;
  currentStock: number;
  minStock: number;
  displayName?: string;
}

export interface CategoryInventoryItem {
  name: string;
  capital: number;
  stock: number;
  skuCount: number;
  percentage: string;
}

export interface ChannelDataItem {
  name: string;
  value: number;
  count: number;
}

export interface PaymentMethodDataItem {
  key: string;
  name: string;
  value: number;
  count: number;
  color: string;
  percentage: string;
}

export interface RestockUrgentItem {
  id: string;
  product: Product;
  name: string;
  sku: string;
  category: string;
  stock: number;
  minStock: number;
  costPrice: number;
  soldCount: number;
  suggestedReorder: number;
}

export interface TopVipCustomerItem {
  id: string;
  name: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
  tier: string;
  debt?: number;
  loyaltyPoints?: number;
  aov?: number;
}

// 2. HR Performance Types
export interface HrPerformanceItem {
  id: string;
  code: string;
  name: string;
  role: string;
  shiftSchedule: string;
  baseSalary: number;
  salesKpiTarget: number;
  currentSales: number;
  commissionRate: number;
  commission: number;
  totalIncome: number;
  kpiCompletion: number;
  workHours: number;
  attendanceRate: number;
  contractStatus: string;
  contractCode: string;
}

export interface HrKpiSummary {
  totalHrSales: number;
  totalHrKpiTarget: number;
  avgKpiCompletion: number;
  totalSalaryFund: number;
  employeeCount: number;
}

// 3. Partners & Supply Types
export interface SupplierPerformanceItem {
  id: string;
  code: string;
  name: string;
  tier: string;
  category: string;
  contactPerson: string;
  phone: string;
  currentDebt: number;
  creditLimit: number;
  totalPOValue: number;
  poCount: number;
  overallScore: number;
  onTimeRate: number;
}

export interface MaterialMarginItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  grossMargin: number;
  marginRate: string;
  stock: number;
  minStock: number;
  isSafe: boolean;
}

export interface PartnersKpiSummary {
  vipTotalSpent: number;
  customerTotalDebt: number;
  totalPOValue: number;
  supplierTotalDebt: number;
}

// 4. Asset Lifecycle Types
export interface AssetLifecycleItem extends EnterpriseAsset {
  depreciationValue: number;
  monthsUsed: number;
  depreciationProgress: number;
}

export interface AssetSummary {
  assetsList: AssetLifecycleItem[];
  totalOriginal: number;
  totalDepreciation: number;
  totalRemaining: number;
  wearRate: string;
  statusCount: {
    good: number;
    maintenance_required: number;
    broken: number;
    liquidated: number;
  };
  statusPieData: { name: string; value: number; color: string }[];
}

// Constants
export const PALETTE = {
  blue: '#3b82f6',
  emerald: '#10b981',
  cyan: '#06b6d4',
  amber: '#f59e0b',
  rose: '#ef4444',
  purple: '#8b5cf6',
  indigo: '#6366f1',
  slate: '#64748b',
};

export const PIE_COLORS = [
  '#3b82f6',
  '#10b981',
  '#06b6d4',
  '#8b5cf6',
  '#f59e0b',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#6366f1',
  '#84cc16',
];

export const PAYMENT_METHOD_MAP: Record<string, { label: string; color: string }> = {
  transfer: { label: 'Chuyển khoản (VietQR)', color: '#06b6d4' },
  cash: { label: 'Tiền mặt', color: '#10b981' },
  card: { label: 'Quẹt thẻ POS', color: '#8b5cf6' },
  momo: { label: 'Ví điện tử MoMo', color: '#ec4899' },
  debt: { label: 'Ghi nợ / Thu sau', color: '#f59e0b' },
};
