import React from 'react';
import {
  Search,
  Filter,
  FileSpreadsheet,
  PlusCircle,
  BarChart3,
  ListFilter,
  GitMerge,
  Layers,
  UserCheck,
} from 'lucide-react';
import { ApprovalModuleType, APPROVAL_MODULE_CONFIG } from './approvals.types';

interface ApprovalFilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedModule: string;
  setSelectedModule: (mod: string) => void;
  selectedStatus: string;
  setSelectedStatus: (st: string) => void;
  onlyMyTurn: boolean;
  setOnlyMyTurn: (val: boolean) => void;
  activeViewTab: 'list' | 'templates' | 'analytics';
  setActiveViewTab: (tab: 'list' | 'templates' | 'analytics') => void;
  onExportExcel: () => void;
  onCreateNew: () => void;
}

export const ApprovalFilterBar: React.FC<ApprovalFilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedModule,
  setSelectedModule,
  selectedStatus,
  setSelectedStatus,
  onlyMyTurn,
  setOnlyMyTurn,
  activeViewTab,
  setActiveViewTab,
  onExportExcel,
  onCreateNew,
}) => {
  const modulesList: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'Tất cả các khâu (8 khâu)' },
    { id: 'purchase_request', label: '1. Đề xuất mua sắm (PR)' },
    { id: 'purchase_order', label: '2. Đơn mua hàng (PO)' },
    { id: 'goods_receipt', label: '3. Nhập kho & KCS (GRN)' },
    { id: 'goods_issue', label: '4. Xuất kho vật tư (PXK)' },
    { id: 'work_order', label: '5. Lệnh sản xuất (WO)' },
    { id: 'delivery', label: '6. Giao hàng (POD)' },
    { id: 'accounting_audit', label: '7. Kế toán đối soát' },
    { id: 'cash_settlement', label: '8. Thu / Chi Quỹ' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3.5 mb-4 space-y-3">
      {/* Hàng 1: Tabs chuyển đổi giao diện chính & Nút tác vụ nhanh */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveViewTab('list')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeViewTab === 'list'
                ? 'bg-white text-blue-600 shadow-sm border border-slate-200/70 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Sổ Trình Ký Tuần Tự</span>
          </button>

          <button
            onClick={() => setActiveViewTab('templates')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeViewTab === 'templates'
                ? 'bg-white text-blue-600 shadow-sm border border-slate-200/70 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <GitMerge className="w-3.5 h-3.5" />
            <span>8 Mẫu Quy Trình Chuẩn</span>
          </button>

          <button
            onClick={() => setActiveViewTab('analytics')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeViewTab === 'analytics'
                ? 'bg-white text-blue-600 shadow-sm border border-slate-200/70 font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Phân Tích KPI & Điểm Nghẽn</span>
          </button>
        </div>

        {/* Nút hành động */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            onClick={onExportExcel}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all shadow-xs cursor-pointer"
            title="Xuất 3 Sheet Excel chuẩn"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Xuất Excel Đa Sheet</span>
          </button>

          <button
            onClick={onCreateNew}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Tạo Tờ Trình Mới</span>
          </button>
        </div>
      </div>

      {/* Hàng 2: Bộ lọc chi tiết (chỉ hiển thị khi ở tab list) */}
      {activeViewTab === 'list' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 pt-1">
          {/* Tìm kiếm */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo Mã phiếu (TK-..), Mã PO, Tiêu đề, Người lập..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Lọc Khâu Chuỗi Cung Ứng */}
          <div className="lg:col-span-3">
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              {modulesList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc Trạng Thái */}
          <div className="lg:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="all">Tất cả trạng thái quy trình</option>
              <option value="in_progress">🟡 Đang xử lý tuần tự</option>
              <option value="approved">🟢 Đã hoàn tất phê duyệt</option>
              <option value="rework">🔴 Yêu cầu làm lại / Sửa đổi</option>
              <option value="rejected">⛔ Bị từ chối</option>
            </select>
          </div>

          {/* Toggle: Chỉ phiếu đến lượt tôi */}
          <div className="lg:col-span-2 flex items-center justify-end">
            <button
              onClick={() => setOnlyMyTurn(!onlyMyTurn)}
              className={`w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                onlyMyTurn
                  ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <UserCheck className={`w-3.5 h-3.5 ${onlyMyTurn ? 'text-blue-600' : 'text-slate-400'}`} />
              <span className="truncate">Đến lượt tôi</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
