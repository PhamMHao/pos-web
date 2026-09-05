import React from 'react';
import { AssetSummary } from '../dashboard.types';
import { DashboardAssetKpiCards } from './DashboardAssetKpiCards';
import { DashboardAssetStatusChart } from './DashboardAssetStatusChart';
import { DashboardAssetLifecycleTable } from './DashboardAssetLifecycleTable';

export interface DashboardAssetLifecycleTabProps {
  summary: AssetSummary;
  onNavigate?: (tab: string) => void;
}

export const DashboardAssetLifecycleTab: React.FC<DashboardAssetLifecycleTabProps> = ({
  summary,
  onNavigate,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. 4 Thẻ KPI Tài Sản Cố Định */}
      <DashboardAssetKpiCards summary={summary} />

      {/* 2. Biểu đồ Donut Trạng Thái & Bar Chart Danh Mục */}
      <DashboardAssetStatusChart summary={summary} />

      {/* 3. Bảng Theo Dõi Dòng Đời & Tiến Độ Khấu Hao */}
      <DashboardAssetLifecycleTable
        assetsList={summary.assetsList}
        onNavigate={onNavigate}
      />
    </div>
  );
};
