import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { KpiEvaluation, Employee, StoreSettings } from '../../../types';
import { KpiSummaryKpiCards } from './controls/KpiSummaryKpiCards';
import { KpiPeriodFilterBar } from './controls/KpiPeriodFilterBar';
import { KpiEvaluationTable } from './controls/KpiEvaluationTable';
import { KpiEvaluationReportModal } from './modals/KpiEvaluationReportModal';
import { KpiScoringModal } from './modals/KpiScoringModal';
import { KpiPipModal } from './modals/KpiPipModal';
import { generateInitialKpiEvaluations } from '../../../utils/kpiDefaults';

export interface KpiManagementViewProps {
  employees: Employee[];
  settings?: StoreSettings;
}

export const KpiManagementView: React.FC<KpiManagementViewProps> = ({
  employees = [],
  settings,
}) => {
  const [evaluations, setEvaluations] = useState<KpiEvaluation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Tháng 02/2026');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedRank, setSelectedRank] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isBatchApproving, setIsBatchApproving] = useState<boolean>(false);

  // Modal States
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportModalEvalId, setReportModalEvalId] = useState<string>('');
  const [scoringEval, setScoringEval] = useState<KpiEvaluation | null>(null);
  const [pipEval, setPipEval] = useState<KpiEvaluation | null>(null);

  // Fetch from DB
  const fetchEvaluations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/kpi-evaluations?period=${encodeURIComponent(selectedPeriod)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setEvaluations(data.data);
      } else {
        // Fallback to generated if DB is being initialized
        setEvaluations(generateInitialKpiEvaluations(employees));
      }
    } catch (e) {
      console.error('Failed to load KPI evaluations from API:', e);
      setEvaluations(generateInitialKpiEvaluations(employees));
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, employees]);

  useEffect(() => {
    fetchEvaluations();
  }, [fetchEvaluations]);

  // Filter logic
  const filteredEvaluations = useMemo(() => {
    return evaluations.filter((ev) => {
      if (selectedDepartment !== 'all' && ev.department !== selectedDepartment) {
        return false;
      }
      if (selectedRank !== 'all' && ev.rank !== selectedRank) {
        return false;
      }
      if (searchTerm.trim()) {
        const kw = searchTerm.toLowerCase();
        const nameMatch = (ev.employeeName || '').toLowerCase().includes(kw);
        const codeMatch = (ev.employeeCode || '').toLowerCase().includes(kw);
        const roleMatch = (ev.role || '').toLowerCase().includes(kw);
        if (!nameMatch && !codeMatch && !roleMatch) return false;
      }
      return true;
    });
  }, [evaluations, selectedDepartment, selectedRank, searchTerm]);

  // Batch approve
  const handleBatchApprove = async () => {
    try {
      setIsBatchApproving(true);
      await fetch('/api/kpi-evaluations/batch-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period: selectedPeriod, approvedBy: 'Tổng Giám Đốc' }),
      });
      await fetchEvaluations();
    } catch (e) {
      console.error('Failed to batch approve:', e);
    } finally {
      setIsBatchApproving(false);
    }
  };

  const handleSavedEvaluation = (updated: KpiEvaluation) => {
    setEvaluations((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setScoringEval(null);
  };

  const handleResetFilters = () => {
    setSelectedDepartment('all');
    setSelectedRank('all');
    setSearchTerm('');
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-900">
      {/* 1. 4 Thẻ KPI Quản Trị */}
      <KpiSummaryKpiCards
        evaluations={filteredEvaluations}
        onOpenReportModal={() => {
          setReportModalEvalId(filteredEvaluations[0]?.id || evaluations[0]?.id || '');
          setShowReportModal(true);
        }}
      />

      {/* 2. Thanh Điều Hướng & Lọc Kỳ Đánh Giá */}
      <KpiPeriodFilterBar
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={setSelectedDepartment}
        selectedRank={selectedRank}
        onRankChange={setSelectedRank}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onBatchApprove={handleBatchApprove}
        onOpenReportModal={() => {
          setReportModalEvalId(filteredEvaluations[0]?.id || evaluations[0]?.id || '');
          setShowReportModal(true);
        }}
        onResetFilters={handleResetFilters}
        isBatchApproving={isBatchApproving}
      />

      {/* 3. Bảng Danh Sách Đánh Giá KPI */}
      <KpiEvaluationTable
        evaluations={filteredEvaluations}
        onOpenScoringModal={(ev) => setScoringEval(ev)}
        onOpenReportModal={(evalId) => {
          setReportModalEvalId(evalId);
          setShowReportModal(true);
        }}
        onOpenPipModal={(ev) => setPipEval(ev)}
      />

      {/* 4. Modal Biểu Mẫu Pháp Quy (Mẫu 01, 02, 03, 04) */}
      {showReportModal && (
        <KpiEvaluationReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          evaluations={evaluations}
          employees={employees}
          settings={settings}
          initialEvaluationId={reportModalEvalId}
          onApproveEvaluation={async (evalId, sig) => {
            try {
              await fetch(`/api/kpi-evaluations/${evalId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approvedBy: 'Tổng Giám Đốc', digitalSignature: sig }),
              });
              await fetchEvaluations();
            } catch (e) {
              console.error(e);
            }
          }}
        />
      )}

      {/* 5. Modal Chấm Điểm Tương Tác 3 Cấp */}
      {scoringEval && (
        <KpiScoringModal
          evaluation={scoringEval}
          onSave={handleSavedEvaluation}
          onClose={() => setScoringEval(null)}
          onOpenReport={(id) => {
            setScoringEval(null);
            setReportModalEvalId(id);
            setShowReportModal(true);
          }}
        />
      )}

      {/* 6. Modal Lập Kế Hoạch Cải Thiện Hiệu Suất PIP */}
      {pipEval && (
        <KpiPipModal
          isOpen={!!pipEval}
          onClose={() => setPipEval(null)}
          evaluation={pipEval}
          settings={settings}
        />
      )}
    </div>
  );
};

export default KpiManagementView;
