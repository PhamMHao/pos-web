import React, { useState, useEffect } from 'react';
import { Employee, KpiEvaluation } from '../../../types';
import { HrPerformanceItem, HrKpiSummary } from '../dashboard.types';
import { DashboardHrKpiCards } from './DashboardHrKpiCards';
import { DashboardHrCharts } from './DashboardHrCharts';
import { DashboardHrScorecardTable } from './DashboardHrScorecardTable';
import { KpiEvaluationReportModal } from '../../hr/kpi/modals/KpiEvaluationReportModal';
import { generateInitialKpiEvaluations } from '../../../utils/kpiDefaults';

export interface DashboardHrTabProps {
  hrPerformanceData: HrPerformanceItem[];
  summary: HrKpiSummary;
  employees: Employee[];
  onNavigate?: (tab: string) => void;
}

export const DashboardHrTab: React.FC<DashboardHrTabProps> = ({
  hrPerformanceData,
  summary,
  employees,
  onNavigate,
}) => {
  const [showKpiReportModal, setShowKpiReportModal] = useState<boolean>(false);
  const [dbEvaluations, setDbEvaluations] = useState<KpiEvaluation[]>([]);

  useEffect(() => {
    fetch('/api/kpi-evaluations?period=Tháng 02/2026')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setDbEvaluations(data.data);
        } else {
          setDbEvaluations(generateInitialKpiEvaluations(employees));
        }
      })
      .catch(() => {
        setDbEvaluations(generateInitialKpiEvaluations(employees));
      });
  }, [employees]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. 4 Thẻ KPI Nhân Sự */}
      <DashboardHrKpiCards summary={summary} />

      {/* 2. Biểu đồ Recharts: Doanh số vs Target, Giờ công vs Chuyên cần */}
      <DashboardHrCharts hrPerformanceData={hrPerformanceData} />

      {/* 3. Bảng Scorecard đánh giá hiệu suất nhân sự */}
      <DashboardHrScorecardTable
        hrPerformanceData={hrPerformanceData}
        onOpenKpiReportModal={() => setShowKpiReportModal(true)}
        onNavigate={onNavigate}
      />

      {/* Modal Báo Cáo & Đánh Giá KPI Chuẩn BLLĐ 2019 */}
      {showKpiReportModal && (
        <KpiEvaluationReportModal
          isOpen={showKpiReportModal}
          onClose={() => setShowKpiReportModal(false)}
          evaluations={dbEvaluations.length > 0 ? dbEvaluations : generateInitialKpiEvaluations(employees)}
          employees={employees}
        />
      )}
    </div>
  );
};
