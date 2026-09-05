import React from 'react';
import { Product } from '../../../types';
import {
  TopVipCustomerItem,
  SupplierPerformanceItem,
  MaterialMarginItem,
  PartnersKpiSummary,
} from '../dashboard.types';
import { DashboardPartnersKpiCards } from './DashboardPartnersKpiCards';
import { DashboardVipCustomersTable } from './DashboardVipCustomersTable';
import { DashboardSuppliersTable } from './DashboardSuppliersTable';
import { DashboardMaterialMarginTable } from './DashboardMaterialMarginTable';

export interface DashboardPartnersSupplyTabProps {
  summary: PartnersKpiSummary;
  vipCustomers: TopVipCustomerItem[];
  suppliersData: SupplierPerformanceItem[];
  materialMargins: MaterialMarginItem[];
  products?: Product[];
  onNavigate?: (tab: string) => void;
  onOpenPO?: (product?: Product) => void;
}

export const DashboardPartnersSupplyTab: React.FC<DashboardPartnersSupplyTabProps> = ({
  summary,
  vipCustomers,
  suppliersData,
  materialMargins,
  products = [],
  onNavigate,
  onOpenPO,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. 4 Thẻ KPI Đối Tác & Cung Ứng */}
      <DashboardPartnersKpiCards summary={summary} />

      {/* 2. Top Khách Hàng VIP & Doanh Số Đối Tác */}
      <DashboardVipCustomersTable
        vipCustomers={vipCustomers}
        onNavigate={onNavigate}
      />

      {/* 3. Đánh Giá Nhà Cung Cấp & Tiến Độ Cung Ứng */}
      <DashboardSuppliersTable
        suppliers={suppliersData}
        onNavigate={onNavigate}
      />

      {/* 4. Biên Lợi Nhuận Gộp & An Toàn Tồn Kho Theo Vật Tư */}
      <DashboardMaterialMarginTable
        materialMargins={materialMargins}
        products={products}
        onOpenPO={onOpenPO}
      />
    </div>
  );
};
