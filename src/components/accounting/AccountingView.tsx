import React, { useState } from 'react';
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  Landmark,
  FileSpreadsheet,
  Receipt,
} from 'lucide-react';
import { AccountingRecord, Order, Customer, EInvoice, StoreSettings, PaymentMethod, Employee } from '../../types';
import { EInvoiceManagerView } from '../invoices/EInvoiceManagerView';
import { NewAccountingRecordModal } from './NewAccountingRecordModal';
import { CollectDebtModal } from './CollectDebtModal';
import { formatVND } from '../../utils/currency';

interface AccountingViewProps {
  records?: AccountingRecord[];
  orders?: Order[];
  customers?: Customer[];
  employees?: Employee[];
  eInvoices?: EInvoice[];
  setEInvoices?: (invoices: EInvoice[] | ((prev: EInvoice[]) => EInvoice[])) => void;
  settings?: Partial<StoreSettings>;
  onSaveRecord?: (record: AccountingRecord) => void;
  onCollectDebt?: (customerId: string, amount: number, paymentMethod: PaymentMethod, note: string) => void;
}

export const AccountingView: React.FC<AccountingViewProps> = ({
  records = [],
  orders = [],
  customers = [],
  employees = [],
  eInvoices = [],
  setEInvoices = () => {},
  settings = {},
  onSaveRecord,
  onCollectDebt,
}) => {
  const safeRecords = Array.isArray(records) ? records : [];
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeCustomers = Array.isArray(customers) ? customers : [];
  const safeInvoices = Array.isArray(eInvoices) ? eInvoices : [];

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [activeSubTab, setActiveSubTab] = useState<'cashflow' | 'debt' | 'einvoices'>('cashflow');
  const [showNewRecordModal, setShowNewRecordModal] = useState(false);
  const [selectedCustomerForDebt, setSelectedCustomerForDebt] = useState<Customer | null>(null);

  const totalIncome = safeRecords
    .filter((r) => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalExpense = safeRecords
    .filter((r) => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);

  const netCashflow = totalIncome - totalExpense;

  const totalCustomerDebt = safeCustomers.reduce((sum, c) => sum + (c.debt || 0), 0);

  const filteredRecords = safeRecords.filter((r) => {
    const matchSearch =
      r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.party.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || r.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 bg-slate-900/90 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-white flex items-center space-x-2">
                <span>Kế Toán, Công Nợ & Hóa Đơn Điện Tử</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  TT78 / NĐ123
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Sổ quỹ thu chi, dòng tiền thực, công nợ B2B và phát hành Hóa đơn GTGT có mã CQT
              </p>
            </div>
          </div>
        </div>

        {/* Subtab navigation */}
        <div className="flex items-center space-x-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setActiveSubTab('cashflow')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'cashflow'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dòng Tiền & Thu Chi
          </button>
          <button
            onClick={() => setActiveSubTab('debt')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'debt'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Công Nợ Khách Hàng ({safeCustomers.filter((c) => (c.debt || 0) > 0).length})
          </button>
          <button
            onClick={() => setActiveSubTab('einvoices')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
              activeSubTab === 'einvoices'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Hóa Đơn Điện Tử ({safeInvoices.length})</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'einvoices' ? (
        <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-slate-900/30">
          <EInvoiceManagerView
            eInvoices={safeInvoices}
            setEInvoices={setEInvoices}
            orders={safeOrders}
            customers={safeCustomers}
            settings={settings as StoreSettings}
          />
        </div>
      ) : (
        <>
          {/* Overview Stat Cards */}
          <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 bg-slate-900/40 border-b border-slate-800/60">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
                <span>Tổng Thu Tháng 02</span>
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
              </div>
              <div className="text-lg md:text-xl font-black text-emerald-400 font-mono">
                {formatVND(totalIncome)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Bao gồm POS + Thu nợ B2B</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
                <span>Tổng Chi Tháng 02</span>
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div className="text-lg md:text-xl font-black text-rose-400 font-mono">
                {formatVND(totalExpense)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Nhập hàng, điện nước & mặt bằng</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
                <span>Dòng Tiền Thuần (Net Cash)</span>
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-lg md:text-xl font-black text-blue-400 font-mono">
                {formatVND(netCashflow)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Lợi nhuận dòng tiền dương</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
                <span>Tổng Công Nợ Phải Thu</span>
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-lg md:text-xl font-black text-amber-400 font-mono">
                {formatVND(totalCustomerDebt)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Nợ tồn từ khách hàng B2B</p>
            </div>
          </div>

          {/* Subtab Content: Cashflow & Debt */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
            {activeSubTab === 'cashflow' && (
              <>
                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Tìm phiếu thu, chi, đối tác..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
                      <button
                        onClick={() => setFilterType('all')}
                        className={`px-3 py-1 rounded-lg font-medium transition ${
                          filterType === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400'
                        }`}
                      >
                        Tất cả
                      </button>
                      <button
                        onClick={() => setFilterType('income')}
                        className={`px-3 py-1 rounded-lg font-medium transition ${
                          filterType === 'income' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                        }`}
                      >
                        Thu
                      </button>
                      <button
                        onClick={() => setFilterType('expense')}
                        className={`px-3 py-1 rounded-lg font-medium transition ${
                          filterType === 'expense' ? 'bg-rose-600 text-white' : 'text-slate-400'
                        }`}
                      >
                        Chi
                      </button>
                    </div>

                    <button
                      onClick={() => setShowNewRecordModal(true)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Lập Phiếu Thu / Chi</span>
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                        <tr>
                          <th className="p-3.5">Mã Chứng Từ</th>
                          <th className="p-3.5">Ngày Ghi Sổ</th>
                          <th className="p-3.5">Hạng Mục</th>
                          <th className="p-3.5">Đối Tác / Người Nộp</th>
                          <th className="p-3.5 text-right">Số Tiền</th>
                          <th className="p-3.5 text-center">Phương Thức</th>
                          <th className="p-3.5 text-center">Trạng Thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {filteredRecords.map((r) => (
                          <tr key={r.id} className="hover:bg-slate-800/40 transition">
                            <td className="p-3.5 font-mono font-bold text-white flex items-center space-x-2">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  r.type === 'income' ? 'bg-emerald-400' : 'bg-rose-400'
                                }`}
                              ></span>
                              <span>{r.code}</span>
                            </td>
                            <td className="p-3.5 text-slate-400">
                              {new Date(r.date).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="p-3.5 text-slate-200 font-medium">{r.category}</td>
                            <td className="p-3.5 text-slate-300">{r.party}</td>
                            <td
                              className={`p-3.5 text-right font-mono font-bold text-sm ${
                                r.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {r.type === 'income' ? '+' : '-'}
                              {formatVND(r.amount)}
                            </td>
                            <td className="p-3.5 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                                {r.paymentMethod || 'cash'}
                              </span>
                            </td>
                            <td className="p-3.5 text-center">
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Đã duyệt</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {activeSubTab === 'debt' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {safeCustomers
                  .filter((c) => (c.debt || 0) > 0)
                  .map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-bold text-white">{c.name}</h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Công Nợ Quá Hạn
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mb-3">
                          <div>SĐT: {c.phone}</div>
                          <div className="line-clamp-1">Đ/c: {c.address || 'Chưa cập nhật'}</div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold">Nợ Hiện Tại</div>
                          <div className="text-base font-black text-rose-400 font-mono">
                            {formatVND(c.debt)}
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedCustomerForDebt(c)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors shadow"
                        >
                          Thu Nợ
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modals */}
      {showNewRecordModal && (
        <NewAccountingRecordModal
          customers={safeCustomers}
          employees={employees}
          onClose={() => setShowNewRecordModal(false)}
          onSave={(record) => {
            if (onSaveRecord) onSaveRecord(record);
          }}
        />
      )}

      {selectedCustomerForDebt && (
        <CollectDebtModal
          customer={selectedCustomerForDebt}
          onClose={() => setSelectedCustomerForDebt(null)}
          onConfirm={(customerId, amount, paymentMethod, note) => {
            if (onCollectDebt) onCollectDebt(customerId, amount, paymentMethod, note);
          }}
        />
      )}
    </div>
  );
};
