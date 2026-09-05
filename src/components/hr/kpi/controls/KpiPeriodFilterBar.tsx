import React from 'react';
import { Search, Filter, Calendar, CheckCheck, Plus, Printer, RotateCcw } from 'lucide-react';
import { AVAILABLE_PERIODS, DEPARTMENTS } from '../kpi.types';

export interface KpiPeriodFilterBarProps {
  selectedPeriod: string;
  onPeriodChange: (p: string) => void;
  selectedDepartment: string;
  onDepartmentChange: (d: string) => void;
  selectedRank: string;
  onRankChange: (r: string) => void;
  searchTerm: string;
  onSearchChange: (s: string) => void;
  onBatchApprove: () => void;
  onOpenReportModal: () => void;
  onResetFilters: () => void;
  isBatchApproving?: boolean;
}

export const KpiPeriodFilterBar: React.FC<KpiPeriodFilterBarProps> = ({
  selectedPeriod,
  onPeriodChange,
  selectedDepartment,
  onDepartmentChange,
  selectedRank,
  onRankChange,
  searchTerm,
  onSearchChange,
  onBatchApprove,
  onOpenReportModal,
  onResetFilters,
  isBatchApproving,
}) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Bộ lọc kỳ đánh giá */}
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-semibold text-slate-800 shadow-2xs">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Kỳ:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => onPeriodChange(e.target.value)}
              className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
            >
              {AVAILABLE_PERIODS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Phòng ban */}
          <select
            value={selectedDepartment}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
          >
            <option value="all">🏢 Tất cả phòng ban</option>
            {DEPARTMENTS.filter((d) => d !== 'Tất cả phòng ban').map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Xếp loại */}
          <select
            value={selectedRank}
            onChange={(e) => onRankChange(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
          >
            <option value="all">🏆 Tất cả xếp loại</option>
            <option value="A+">A+ (Xuất sắc ≥ 95đ)</option>
            <option value="A">A (Tốt 85 - 94.9đ)</option>
            <option value="B">B (Khá 70 - 84.9đ)</option>
            <option value="C">C/D (Cần cải thiện &lt; 70đ)</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Phê duyệt toàn bộ */}
          <button
            onClick={onBatchApprove}
            disabled={isBatchApproving}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
            title="Tổng Giám Đốc ký duyệt chi toàn bộ kết quả kỳ này"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>{isBatchApproving ? 'Đang duyệt...' : 'Duyệt Chi Toàn Bộ'}</span>
          </button>

          {/* Mở biểu mẫu */}
          <button
            onClick={onOpenReportModal}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-200 shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Biểu Mẫu Pháp Quy</span>
          </button>
        </div>
      </div>

      {/* Tìm kiếm & Reset Filter */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên nhân viên, mã NV, chức danh..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium"
          />
        </div>

        {(selectedDepartment !== 'all' || selectedRank !== 'all' || searchTerm.trim()) && (
          <button
            onClick={onResetFilters}
            className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 flex items-center gap-1 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Xóa lọc</span>
          </button>
        )}
      </div>
    </div>
  );
};
