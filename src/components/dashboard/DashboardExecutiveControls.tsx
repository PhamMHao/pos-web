import React from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Filter,
  Search,
  X,
  RotateCcw,
} from 'lucide-react';
import { Customer, Supplier, Product } from '../../types';
import { TimeRangeType } from './dashboard.types';

export interface DashboardExecutiveControlsProps {
  timeRange: TimeRangeType;
  setTimeRange: (t: TimeRangeType) => void;
  customStartDate: string;
  setCustomStartDate: (d: string) => void;
  customEndDate: string;
  setCustomEndDate: (d: string) => void;
  channelFilter: string;
  setChannelFilter: (c: string) => void;
  categoryFilter: string;
  setCategoryFilter: (cat: string) => void;
  customerFilter: string;
  setCustomerFilter: (cust: string) => void;
  supplierFilter?: string;
  setSupplierFilter?: (supp: string) => void;
  materialFilter?: string;
  setMaterialFilter?: (mat: string) => void;
  searchKeyword: string;
  setSearchKeyword: (kw: string) => void;
  availableChannels: string[];
  availableCategories: string[];
  safeCustomers: Customer[];
  availableSuppliers?: Supplier[];
  availableProducts?: Product[];
  completedOrdersCount: number;
  activeFiltersCount: number;
  onResetFilters: () => void;
  onExportExcel: () => void;
  onPrint: () => void;
}

export const DashboardExecutiveControls: React.FC<DashboardExecutiveControlsProps> = ({
  timeRange,
  setTimeRange,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  channelFilter,
  setChannelFilter,
  categoryFilter,
  setCategoryFilter,
  customerFilter,
  setCustomerFilter,
  supplierFilter = 'all',
  setSupplierFilter,
  materialFilter = 'all',
  setMaterialFilter,
  searchKeyword,
  setSearchKeyword,
  availableChannels,
  availableCategories,
  safeCustomers,
  availableSuppliers = [],
  availableProducts = [],
  completedOrdersCount,
  activeFiltersCount,
  onResetFilters,
  onExportExcel,
  onPrint,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs space-y-4 print:border-none print:shadow-none print:p-0">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                Trung Tâm Điều Hành Doanh Nghiệp (Executive BI Dashboard)
              </h1>
              <span className="text-[10px] uppercase font-black px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                Realtime BI
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Tổng hợp đa chiều: Tài chính bán hàng, KPI nhân sự, đối tác cung ứng &amp; vòng đời tài sản.
            </p>
          </div>
        </div>

        {/* Action Buttons: 5-Sheet Excel & Print Report */}
        <div className="flex items-center flex-wrap gap-2.5 print:hidden">
          <button
            onClick={onExportExcel}
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs shadow-emerald-600/20 transition-all cursor-pointer"
            title="Xuất bảng tính Excel đa chiều 5 sheet"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Excel (5 Sheets)</span>
          </button>
          <button
            onClick={onPrint}
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-white hover:bg-slate-100 active:scale-95 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-xs transition-all cursor-pointer"
            title="In báo cáo A4 quản trị"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>In Báo Cáo</span>
          </button>
        </div>
      </div>

      {/* Dynamic Filters Bar */}
      <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs print:hidden border-t border-slate-100">
        {/* Time Filter Presets */}
        <div className="flex items-center flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              timeRange === 'today'
                ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Hôm nay
          </button>
          <button
            onClick={() => setTimeRange('7days')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              timeRange === '7days'
                ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            7 ngày
          </button>
          <button
            onClick={() => setTimeRange('14days')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              timeRange === '14days'
                ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            14 ngày
          </button>
          <button
            onClick={() => setTimeRange('30days')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              timeRange === '30days'
                ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            30 ngày
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              timeRange === 'month'
                ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Tháng này
          </button>
          <button
            onClick={() => setTimeRange('quarter')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              timeRange === 'quarter'
                ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Quý này
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              timeRange === 'all'
                ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Toàn bộ
          </button>
          <button
            onClick={() => setTimeRange('custom')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1 ${
              timeRange === 'custom'
                ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Tùy chọn</span>
          </button>
        </div>

        {/* Advanced Dropdown Filters */}
        <div className="flex items-center flex-wrap gap-2 flex-1 justify-end">
          {timeRange === 'custom' && (
            <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 shadow-2xs">
              <span className="text-slate-400">Từ:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-transparent border-0 text-slate-800 focus:outline-none cursor-pointer font-medium"
              />
              <span className="text-slate-400">Đến:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-transparent border-0 text-slate-800 focus:outline-none cursor-pointer font-medium"
              />
            </div>
          )}

          {/* Kênh Bán Hàng */}
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="bg-white text-slate-800 text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs font-medium"
          >
            <option value="all">🛒 Kênh: Tất cả</option>
            {availableChannels.map((ch) => (
              <option key={ch} value={ch}>
                {ch}
              </option>
            ))}
          </select>

          {/* Ngành Hàng / Danh Mục */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white text-slate-800 text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs font-medium"
          >
            <option value="all">📁 Ngành: Tất cả</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Khách Hàng */}
          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="bg-white text-slate-800 text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs max-w-[140px] truncate font-medium"
          >
            <option value="all">👥 Khách: Tất cả</option>
            {safeCustomers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Nhà Cung Cấp */}
          {setSupplierFilter && availableSuppliers.length > 0 && (
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="bg-white text-slate-800 text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs max-w-[140px] truncate font-medium"
            >
              <option value="all">🏭 NCC: Tất cả</option>
              {availableSuppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}

          {/* Vật Tư / Sản Phẩm */}
          {setMaterialFilter && availableProducts.length > 0 && (
            <select
              value={materialFilter}
              onChange={(e) => setMaterialFilter(e.target.value)}
              className="bg-white text-slate-800 text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs max-w-[140px] truncate font-medium"
            >
              <option value="all">📦 Vật tư: Tất cả</option>
              {availableProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}

          {/* Ô Tìm Kiếm Nhanh */}
          <div className="relative min-w-[160px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
            />
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {activeFiltersCount > 0 && (
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500 font-medium mr-1 flex items-center space-x-1">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <span>
                Tìm thấy <b>{completedOrdersCount}</b> đơn hàng phù hợp:
              </span>
            </span>

            {timeRange !== '30days' && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <span>
                  Thời gian:{' '}
                  {timeRange === 'today'
                    ? 'Hôm nay'
                    : timeRange === '7days'
                    ? '7 ngày'
                    : timeRange === '14days'
                    ? '14 ngày'
                    : timeRange === 'month'
                    ? 'Tháng này'
                    : timeRange === 'quarter'
                    ? 'Quý này'
                    : timeRange === 'custom'
                    ? `${customStartDate} ➔ ${customEndDate}`
                    : 'Toàn bộ'}
                </span>
                <button onClick={() => setTimeRange('30days')} className="hover:text-blue-900 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {channelFilter !== 'all' && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <span>Kênh: {channelFilter}</span>
                <button onClick={() => setChannelFilter('all')} className="hover:text-indigo-900 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {categoryFilter !== 'all' && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                <span>Ngành hàng: {categoryFilter}</span>
                <button onClick={() => setCategoryFilter('all')} className="hover:text-purple-900 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {customerFilter !== 'all' && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                <span>
                  Khách: {safeCustomers.find((c) => c.id === customerFilter)?.name || customerFilter}
                </span>
                <button onClick={() => setCustomerFilter('all')} className="hover:text-cyan-900 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {supplierFilter !== 'all' && setSupplierFilter && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <span>
                  NCC: {availableSuppliers.find((s) => s.id === supplierFilter)?.name || supplierFilter}
                </span>
                <button onClick={() => setSupplierFilter('all')} className="hover:text-amber-900 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {materialFilter !== 'all' && setMaterialFilter && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span>
                  Vật tư: {availableProducts.find((p) => p.id === materialFilter)?.name || materialFilter}
                </span>
                <button onClick={() => setMaterialFilter('all')} className="hover:text-emerald-900 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchKeyword.trim() && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
                <span>Từ khóa: "{searchKeyword}"</span>
                <button onClick={() => setSearchKeyword('')} className="hover:text-slate-900 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <button
            onClick={onResetFilters}
            className="px-2.5 py-1 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-all flex items-center space-x-1 cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Xóa bộ lọc</span>
          </button>
        </div>
      )}
    </div>
  );
};
