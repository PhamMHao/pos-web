import React from 'react';
import { Search, Filter, X, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import { ContractStatus, ContractType } from '../contracts.types';

export interface CustomerContractFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  approvalLevelFilter: string;
  onApprovalLevelFilterChange: (level: string) => void;
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
  onResetFilters: () => void;
  totalFilteredCount: number;
}

export const CustomerContractFilterBar: React.FC<CustomerContractFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  approvalLevelFilter,
  onApprovalLevelFilterChange,
  typeFilter,
  onTypeFilterChange,
  onResetFilters,
  totalFilteredCount,
}) => {
  const hasActiveFilters =
    searchTerm !== '' ||
    statusFilter !== 'all' ||
    approvalLevelFilter !== 'all' ||
    typeFilter !== 'all';

  return (
    <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md space-y-3">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo Số hợp đồng, Tên khách hàng, Mã số thuế, Dự án..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="w-full md:w-52">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 rounded-xl text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="draft">Bản nháp (Draft)</option>
            <option value="internal_review">Thẩm định nội bộ</option>
            <option value="sent_to_customer">Đã gửi khách hàng</option>
            <option value="customer_confirmed">Khách hàng xác nhận</option>
            <option value="purchasing">Đang nhập mua hàng</option>
            <option value="in_progress">Đang thực hiện hợp đồng</option>
            <option value="handover_completed">Đã bàn giao nghiệm thu</option>
            <option value="liquidated">Đã lập biên bản thanh lý</option>
            <option value="completed">Hoàn tất (Đã xuất VAT)</option>
            <option value="cancelled">Đã hủy bỏ</option>
          </select>
        </div>

        {/* Approval Level Dropdown */}
        <div className="w-full md:w-48">
          <select
            value={approvalLevelFilter}
            onChange={(e) => onApprovalLevelFilterChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 rounded-xl text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">Tất cả cấp duyệt</option>
            <option value="1">Cấp 1 (&lt; 50 triệu - Trưởng phòng/PM)</option>
            <option value="2">Cấp 2 (50 - 200 tr - GĐ Kỹ thuật & Kế toán)</option>
            <option value="3">Cấp 3 (&gt; 200 triệu - Tổng Giám Đốc)</option>
          </select>
        </div>

        {/* Contract Type Dropdown */}
        <div className="w-full md:w-48">
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 rounded-xl text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">Tất cả loại hợp đồng</option>
            <option value="commercial_goods">Mua bán thiết bị / Hàng hóa</option>
            <option value="turnkey_project">Dự án trọn gói / Thi công</option>
            <option value="maintenance_service">Bảo trì / Dịch vụ kỹ thuật</option>
            <option value="software_solution">Giải pháp phần mềm</option>
            <option value="other">Khác</option>
          </select>
        </div>

        {/* Reset Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            <span>Đặt lại</span>
          </button>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Tìm thấy <strong className="text-cyan-400">{totalFilteredCount}</strong> hợp đồng kinh tế
        </span>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span>Dữ liệu Microsoft SQL Server</span>
        </div>
      </div>
    </div>
  );
};
