import React, { useState } from 'react';
import {
  ShieldCheck,
  Wrench,
  Search,
  Plus,
  QrCode,
  Printer,
  Calendar,
  Clock,
  User,
  Phone,
  Package,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Filter,
  Eye,
  ArrowRight,
  TrendingUp,
  CreditCard,
  RotateCcw,
  Sparkles,
  Barcode,
  Layers,
  Award,
  SlidersHorizontal,
} from 'lucide-react';
import {
  WarrantyTicket,
  WarrantyTicketType,
  WarrantyStatus,
  SerialDeviceRecord,
  Product,
  Customer,
  Order,
  StoreSettings,
} from '../../types';
import { NewWarrantyModal } from './NewWarrantyModal';
import { WarrantyDetailModal } from './WarrantyDetailModal';
import { WarrantyPrintModal } from './WarrantyPrintModal';
import { PrintInvoiceModal } from '../common/PrintInvoiceModal';
import { formatVND } from '../../utils/vietqr';

interface WarrantyViewProps {
  warranties: WarrantyTicket[];
  onSaveWarranty: (ticket: WarrantyTicket) => void;
  onUpdateWarranty: (ticket: WarrantyTicket) => void;
  serialRecords?: SerialDeviceRecord[];
  onSaveSerialRecords?: (records: SerialDeviceRecord[] | ((prev: SerialDeviceRecord[]) => SerialDeviceRecord[])) => void;
  products?: Product[];
  onSaveProduct?: (product: Product) => void;
  onAdjustStock?: (log: any) => void;
  customers?: Customer[];
  orders?: Order[];
  settings?: StoreSettings;
}

export const WarrantyView: React.FC<WarrantyViewProps> = ({
  warranties = [],
  onSaveWarranty,
  onUpdateWarranty,
  serialRecords = [],
  onSaveSerialRecords,
  products = [],
  onSaveProduct,
  onAdjustStock,
  customers = [],
  orders = [],
  settings,
}) => {
  const safeWarranties = Array.isArray(warranties) ? warranties : [];
  const safeSerials = Array.isArray(serialRecords) ? serialRecords : [];

  const [activeSubTab, setActiveSubTab] = useState<'tickets' | 'serial_lookup' | 'serials_registry' | 'technicians_kpi'>('tickets');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<WarrantyTicket | null>(null);
  const [printTicket, setPrintTicket] = useState<WarrantyTicket | null>(null);
  const [printA4Ticket, setPrintA4Ticket] = useState<{ ticket: WarrantyTicket; mode: 'warranty_intake' | 'warranty_return' } | null>(null);
  const [printMode, setPrintMode] = useState<'receipt' | 'handover'>('receipt');

  // Quick Serial Lookup state
  const [lookupSerialInput, setLookupSerialInput] = useState('');
  const [searchedSerialData, setSearchedSerialData] = useState<{
    serialRecord?: SerialDeviceRecord;
    tickets: WarrantyTicket[];
  } | null>(null);

  // Filter tickets
  const filteredTickets = safeWarranties.filter((t) => {
    const matchSearch =
      t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customerPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.orderCode && t.orderCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchType = selectedType === 'all' || t.type === selectedType;
    const matchStatus = selectedStatus === 'all' || t.status === selectedStatus;

    return matchSearch && matchType && matchStatus;
  });

  // KPI calculations
  const totalActive = safeWarranties.filter((t) => t.status !== 'returned' && t.status !== 'unrepairable').length;
  const inProgress = safeWarranties.filter((t) => ['diagnosing', 'repairing', 'waiting_parts', 'sent_vendor'].includes(t.status)).length;
  const readyToReturn = safeWarranties.filter((t) => t.status === 'ready_to_return').length;
  const completed = safeWarranties.filter((t) => t.status === 'returned' || t.status === 'replaced_new').length;
  const totalServiceRevenue = safeWarranties.reduce((sum, t) => sum + (t.paidAmount || (t.paymentStatus === 'paid' ? t.totalFee : 0)), 0);

  const handleOpenPrint = (ticket: WarrantyTicket, mode: 'receipt' | 'handover') => {
    setPrintTicket(ticket);
    setPrintMode(mode);
  };

  const handleLookupSerial = (sn: string) => {
    const query = sn.trim();
    if (!query) return;
    const rec = safeSerials.find((s) => s.serialNumber.toLowerCase() === query.toLowerCase());
    const matchedTickets = safeWarranties.filter((t) => t.serialNumber.toLowerCase() === query.toLowerCase());
    setSearchedSerialData({
      serialRecord: rec,
      tickets: matchedTickets,
    });
  };

  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return '---';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (st: WarrantyStatus) => {
    switch (st) {
      case 'received':
        return <span className="inline-flex items-center justify-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">Tiếp Nhận</span>;
      case 'diagnosing':
        return <span className="inline-flex items-center justify-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Chẩn Đoán</span>;
      case 'repairing':
        return <span className="inline-flex items-center justify-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">Đang Sửa</span>;
      case 'waiting_parts':
        return <span className="inline-flex items-center justify-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">Chờ Linh Kiện</span>;
      case 'sent_vendor':
        return <span className="inline-flex items-center justify-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Chuyển Hãng</span>;
      case 'ready_to_return':
        return <span className="inline-flex items-center justify-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Sẵn Sàng Trả</span>;
      case 'returned':
        return <span className="inline-flex items-center justify-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">Đã Trả Khách</span>;
      case 'replaced_new':
        return <span className="inline-flex items-center justify-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Đổi Mới 1-1</span>;
      default:
        return <span className="inline-flex items-center justify-center whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/20 text-slate-300">Không Thể Sửa</span>;
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Header */}
      <div className="p-4 md:p-6 bg-slate-900/90 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center space-x-2">
              <span>Quản Lý Bảo Hành, Bảo Trì & Sửa Chữa</span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                ERP Service
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Quản lý hàng bảo hành, bảo trì, nhận - trả hàng theo từng số Serial / IMEI, mã QR và lịch sử vòng đời thiết bị
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setActiveSubTab('serial_lookup');
              if (safeWarranties.length > 0) {
                setLookupSerialInput(safeWarranties[0].serialNumber);
                handleLookupSerial(safeWarranties[0].serialNumber);
              }
            }}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold rounded-xl flex items-center space-x-1.5 border border-slate-700 transition-colors"
          >
            <QrCode className="w-4 h-4" />
            <span>Quét QR / Serial</span>
          </button>

          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tiếp Nhận Mới</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="p-4 md:p-6 grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 shrink-0 bg-slate-900/40 border-b border-slate-800/60">
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="text-slate-400 text-xs font-medium mb-1">Đang Xử Lý</div>
          <div className="text-xl font-black text-blue-400 font-mono">{totalActive} <span className="text-xs text-slate-500 font-normal">phiếu</span></div>
          <p className="text-[11px] text-slate-400 mt-1">Cần theo dõi tiến độ</p>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="text-slate-400 text-xs font-medium mb-1">Đang Sửa & Thay LK</div>
          <div className="text-xl font-black text-purple-400 font-mono">{inProgress}</div>
          <p className="text-[11px] text-purple-300 mt-1">KTV đang thao tác</p>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="text-slate-400 text-xs font-medium mb-1">Sẵn Sàng Trả Khách</div>
          <div className="text-xl font-black text-emerald-400 font-mono">{readyToReturn}</div>
          <p className="text-[11px] text-emerald-400 mt-1">Đã test nghiệm thu</p>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="text-slate-400 text-xs font-medium mb-1">Đã Bàn Giao Hoàn Tất</div>
          <div className="text-xl font-black text-teal-400 font-mono">{completed}</div>
          <p className="text-[11px] text-teal-400 mt-1">Tỷ lệ đúng hẹn 98%</p>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm col-span-2 sm:col-span-1">
          <div className="text-slate-400 text-xs font-medium mb-1">Doanh Thu Dịch Vụ</div>
          <div className="text-xl font-black text-cyan-400 font-mono">{formatVND(totalServiceRevenue)}</div>
          <p className="text-[11px] text-slate-400 mt-1">Tiền công & linh kiện</p>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="px-4 md:px-6 pt-3 bg-slate-900/60 border-b border-slate-800 flex items-center space-x-2 shrink-0 overflow-x-auto">
        {[
          { id: 'tickets', label: 'Phiếu Tiếp Nhận & Trả Hàng', icon: FileText, count: safeWarranties.length },
          { id: 'serial_lookup', label: 'Tra Cứu Serial / IMEI & Quét QR', icon: QrCode },
          { id: 'serials_registry', label: 'Sổ Serial Thiết Bị Đã Bán', icon: Barcode, count: safeSerials.length },
          { id: 'technicians_kpi', label: 'Năng Suất Kỹ Thuật Viên', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center space-x-2 border-t border-l border-r transition-all ${
                activeSubTab === tab.id
                  ? 'bg-slate-950 text-cyan-400 border-slate-700 shadow-sm'
                  : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
        {/* SUB-TAB 1: TICKETS LIST */}
        {activeSubTab === 'tickets' && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm số Serial, mã QR, tên khách, SĐT, mã phiếu..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">Tất cả loại hình</option>
                  <option value="warranty">Bảo hành</option>
                  <option value="maintenance">Bảo trì định kỳ</option>
                  <option value="repair">Sửa chữa dịch vụ</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="received">Mới tiếp nhận</option>
                  <option value="diagnosing">Đang chẩn đoán</option>
                  <option value="repairing">Đang sửa chữa</option>
                  <option value="waiting_parts">Chờ linh kiện</option>
                  <option value="ready_to_return">Sẵn sàng trả</option>
                  <option value="returned">Đã bàn giao trả</option>
                  <option value="replaced_new">Đã đổi mới 1-1</option>
                </select>
              </div>
            </div>

            {/* Tickets Table */}
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3.5 min-w-[130px] whitespace-nowrap">Mã Phiếu / Loại</th>
                      <th className="p-3.5 min-w-[260px]">Thiết Bị & Số Serial / QR</th>
                      <th className="p-3.5 min-w-[170px] whitespace-nowrap">Khách Hàng & SĐT</th>
                      <th className="p-3.5 min-w-[150px] whitespace-nowrap">KTV Phụ Trách</th>
                      <th className="p-3.5 min-w-[190px] whitespace-nowrap">Ngày Tiếp Nhận & Hẹn Trả</th>
                      <th className="p-3.5 min-w-[120px] text-right whitespace-nowrap">Chi Phí</th>
                      <th className="p-3.5 min-w-[130px] text-center whitespace-nowrap">Trạng Thái</th>
                      <th className="p-3.5 min-w-[190px] text-center whitespace-nowrap">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredTickets.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-900/80 transition-colors">
                        {/* Ticket Code & Type */}
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="font-mono font-bold text-white text-xs whitespace-nowrap">{t.code}</div>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase mt-1 whitespace-nowrap ${
                              t.type === 'warranty'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : t.type === 'maintenance'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            }`}
                          >
                            {t.type === 'warranty' ? 'Bảo Hành' : t.type === 'maintenance' ? 'Bảo Trì' : 'Sửa Chữa'}
                          </span>
                        </td>

                        {/* Product & Serial / QR */}
                        <td className="p-3.5 min-w-[260px]">
                          <div className="font-bold text-white leading-tight">{t.productName}</div>
                          <div className="flex items-center space-x-2 mt-1 font-mono text-[11px] whitespace-nowrap">
                            <span className="px-1.5 py-0.5 bg-slate-950 rounded text-cyan-300 font-bold border border-slate-800">
                              SN: {t.serialNumber}
                            </span>
                            {t.orderCode && (
                              <span className="text-[10px] text-slate-400">Đơn: {t.orderCode}</span>
                            )}
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="font-semibold text-slate-200">{t.customerName}</div>
                          <div className="font-mono text-[11px] text-cyan-400 font-bold">{t.customerPhone}</div>
                        </td>

                        {/* Technician */}
                        <td className="p-3.5 whitespace-nowrap text-slate-300">
                          <div className="text-xs font-medium">{t.technicianName}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{t.timeline?.length || 1} bước xử lý</div>
                        </td>

                        {/* Dates */}
                        <td className="p-3.5 whitespace-nowrap text-xs">
                          <div className="text-slate-400 font-mono text-[11px]">
                            <span className="text-slate-500">Nhận:</span> {formatDateDisplay(t.receivedDate)}
                          </div>
                          <div className="text-cyan-300 font-mono text-[11px] font-semibold mt-0.5">
                            <span className="text-slate-500">Hẹn:</span> {formatDateDisplay(t.expectedReturnDate)}
                          </div>
                        </td>

                        {/* Fee */}
                        <td className="p-3.5 text-right font-mono font-bold text-xs whitespace-nowrap">
                          {t.totalFee === 0 ? (
                            <span className="text-emerald-400 whitespace-nowrap">0 đ (Miễn phí)</span>
                          ) : (
                            <span className="text-amber-400 whitespace-nowrap">{formatVND(t.totalFee)}</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="p-3.5 text-center whitespace-nowrap">
                          {getStatusBadge(t.status)}
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => setSelectedTicket(t)}
                              className="p-1.5 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-400 hover:text-white rounded-lg transition-colors"
                              title="Xem & Cập nhật tiến độ"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setPrintA4Ticket({ ticket: t, mode: 'warranty_intake' })}
                              className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg transition-colors font-bold text-[10px] flex items-center gap-1 whitespace-nowrap border border-blue-500/30"
                              title="In Phiếu Nhận Bảo Hành (Mẫu A4/A5 Gia Phúc)"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Nhận A4/A5</span>
                            </button>
                            <button
                              onClick={() => setPrintA4Ticket({ ticket: t, mode: 'warranty_return' })}
                              className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg transition-colors font-bold text-[10px] flex items-center gap-1 whitespace-nowrap border border-emerald-500/30"
                              title="In Phiếu Trả Bảo Hành (Mẫu A4/A5 Gia Phúc)"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Trả A4/A5</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredTickets.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500 text-xs">
                          Không tìm thấy phiếu bảo hành / bảo trì nào phù hợp điều kiện lọc.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 2: SERIAL / IMEI / QR LOOKUP */}
        {activeSubTab === 'serial_lookup' && (
          <div className="space-y-6">
            {/* Search Box */}
            <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 max-w-2xl mx-auto space-y-4">
              <div className="text-center space-y-1">
                <h3 className="font-bold text-base text-white flex items-center justify-center space-x-2">
                  <QrCode className="w-5 h-5 text-cyan-400" />
                  <span>Tra Cứu Vòng Đời & Lịch Sử Bảo Hành Thiết Bị</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Nhập số Serial / IMEI hoặc mã định danh QR để tra cứu toàn bộ hồ sơ thiết bị, ngày mua, hạn bảo hành và lịch sử sửa chữa
                </p>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Barcode className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={lookupSerialInput}
                    onChange={(e) => setLookupSerialInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleLookupSerial(lookupSerialInput);
                    }}
                    placeholder="Nhập số Serial (VD: SN-CDV-99827104, SN-SUNMI-8839219)..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-xs text-cyan-300 font-mono font-bold placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button
                  onClick={() => handleLookupSerial(lookupSerialInput)}
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-1.5"
                >
                  <Search className="w-4 h-4" />
                  <span>Tra Cứu</span>
                </button>
              </div>

              {/* Sample Serial Pills */}
              <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                <span className="text-[11px]">Gợi ý nhanh:</span>
                {safeSerials.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setLookupSerialInput(s.serialNumber);
                      handleLookupSerial(s.serialNumber);
                    }}
                    className="px-2 py-0.5 bg-slate-950 border border-slate-800 hover:border-cyan-500 rounded text-[10px] font-mono text-cyan-400 transition-colors"
                  >
                    {s.serialNumber}
                  </button>
                ))}
              </div>
            </div>

            {/* Lookup Result Box (Device Passport) */}
            {searchedSerialData && (
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-6">
                  {/* Passport Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-2xl border border-cyan-500/30">
                        <ShieldCheck className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-black text-lg text-white font-mono">
                            {lookupSerialInput}
                          </h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              searchedSerialData.serialRecord?.warrantyStatus === 'valid'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {searchedSerialData.serialRecord?.warrantyStatus === 'valid'
                              ? 'Còn Hạn Bảo Hành'
                              : 'Hết Hạn Bảo Hành Gốc'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {searchedSerialData.serialRecord?.productName || 'Thiết bị bảo hành'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-white rounded-lg">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(
                            `https://vietqr.me/warranty?sn=${lookupSerialInput}`
                          )}`}
                          alt="QR Serial"
                          className="w-12 h-12 object-contain"
                          crossOrigin="anonymous"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Passport Information Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-[11px]">Chủ sở hữu hiện tại:</span>
                      <p className="font-bold text-white">{searchedSerialData.serialRecord?.customerName || 'Khách hàng'}</p>
                      <p className="font-mono text-cyan-400">{searchedSerialData.serialRecord?.customerPhone || '-'}</p>
                    </div>

                    <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-[11px]">Hóa đơn mua & Hạn bảo hành:</span>
                      <p className="font-mono text-slate-200">
                        Đơn hàng: <strong className="text-cyan-400">{searchedSerialData.serialRecord?.soldOrderCode || '-'}</strong>
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Hạn BH: <strong className="text-emerald-400">{searchedSerialData.serialRecord?.warrantyExpiryDate || '-'}</strong>
                      </p>
                    </div>

                    <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-[11px]">Tổng số lần bảo dưỡng/sửa:</span>
                      <p className="font-black text-base text-cyan-400 font-mono">
                        {searchedSerialData.tickets.length} lần
                      </p>
                      <p className="text-[10px] text-slate-500">Lịch sử ghi nhận trên hệ thống</p>
                    </div>
                  </div>

                  {/* Warranty & Maintenance History for this Serial */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-cyan-400 flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Lịch Sử Các Lần Bảo Hành / Sửa Chữa Đã Thực Hiện</span>
                    </h4>

                    <div className="space-y-3">
                      {searchedSerialData.tickets.map((t) => (
                        <div
                          key={t.id}
                          className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold text-white">{t.code}</span>
                              {getStatusBadge(t.status)}
                              <span className="text-slate-400 font-mono text-[11px]">Ngày nhận: {t.receivedDate}</span>
                            </div>
                            <p className="text-rose-400 text-[11px]">Lỗi: {t.issueDescription}</p>
                            {t.resolution && <p className="text-emerald-400 text-[11px]">Xử lý: {t.resolution}</p>}
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <button
                              onClick={() => setSelectedTicket(t)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold rounded-lg transition-colors"
                            >
                              Xem Chi Tiết
                            </button>
                            <button
                              onClick={() => handleOpenPrint(t, 'handover')}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg transition-colors"
                              title="In biên bản nghiệm thu"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {searchedSerialData.tickets.length === 0 && (
                        <div className="p-6 text-center text-slate-500 text-xs bg-slate-950 rounded-xl border border-slate-800">
                          Thiết bị chưa có phiếu bảo hành/sửa chữa nào được lập trước đây.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUB-TAB 3: SERIAL REGISTRY */}
        {activeSubTab === 'serials_registry' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">Sổ Quản Lý Số Serial / IMEI Sản Phẩm Lưu Hành</h3>
                <p className="text-xs text-slate-400">
                  Danh sách mọi thiết bị điện máy, cáp mạng, máy POS bán ra kèm thời hạn bảo hành chính hãng
                </p>
              </div>
            </div>

            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3.5 min-w-[150px] whitespace-nowrap">Số Serial / IMEI</th>
                      <th className="p-3.5 min-w-[260px]">Tên Sản Phẩm & SKU</th>
                      <th className="p-3.5 min-w-[130px] whitespace-nowrap">Đơn Hàng Gốc</th>
                      <th className="p-3.5 min-w-[170px] whitespace-nowrap">Khách Hàng</th>
                      <th className="p-3.5 min-w-[170px] whitespace-nowrap">Hạn Bảo Hành Gốc</th>
                      <th className="p-3.5 min-w-[120px] text-center whitespace-nowrap">Tình Trạng Hạn</th>
                      <th className="p-3.5 min-w-[110px] text-center whitespace-nowrap">Số Lần Đã Sửa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {safeSerials.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-900/80 transition-colors">
                        <td className="p-3.5 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setActiveSubTab('serial_lookup');
                              setLookupSerialInput(s.serialNumber);
                              handleLookupSerial(s.serialNumber);
                            }}
                            className="font-mono font-black text-cyan-400 hover:underline"
                          >
                            {s.serialNumber}
                          </button>
                        </td>
                        <td className="p-3.5 min-w-[260px]">
                          <div className="font-bold text-white">{s.productName}</div>
                          <div className="font-mono text-slate-500 text-[10px]">{s.sku}</div>
                        </td>
                        <td className="p-3.5 font-mono text-cyan-300 font-bold whitespace-nowrap">
                          {s.soldOrderCode || '-'}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="text-slate-200 font-semibold">{s.customerName}</div>
                          <div className="font-mono text-slate-400 text-[11px]">{s.customerPhone}</div>
                        </td>
                        <td className="p-3.5 font-mono text-slate-300 whitespace-nowrap">
                          {formatDateDisplay(s.warrantyExpiryDate)} ({s.warrantyPeriodMonths} tháng)
                        </td>
                        <td className="p-3.5 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                              s.warrantyStatus === 'valid'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {s.warrantyStatus === 'valid' ? 'Còn Hạn' : 'Hết Hạn'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-slate-300 whitespace-nowrap">
                          {s.totalRepairsCount + s.totalMaintenancesCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 4: TECHNICIANS KPI */}
        {activeSubTab === 'technicians_kpi' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  name: 'Trần Văn Hưng',
                  role: 'Kỹ Thuật Trưởng',
                  assigned: 24,
                  completed: 23,
                  onTimeRate: '98.5%',
                  rating: '4.9 ★',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
                },
                {
                  name: 'Nguyễn Quốc Tuấn',
                  role: 'Kỹ Thuật Viên Phần Cứng',
                  assigned: 18,
                  completed: 17,
                  onTimeRate: '96.2%',
                  rating: '4.8 ★',
                  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
                },
                {
                  name: 'Lê Hoàng Long',
                  role: 'Kỹ Thuật Viên Cơ Điện & Mạng',
                  assigned: 15,
                  completed: 14,
                  onTimeRate: '95.0%',
                  rating: '4.7 ★',
                  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
                },
              ].map((ktv, idx) => (
                <div key={idx} className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center space-x-3">
                    <img src={ktv.avatar} alt={ktv.name} className="w-12 h-12 rounded-full object-cover border border-slate-700" />
                    <div>
                      <h4 className="font-bold text-sm text-white">{ktv.name}</h4>
                      <p className="text-xs text-cyan-400">{ktv.role}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
                    <div className="p-2 bg-slate-950 rounded-xl">
                      <span className="text-slate-500 text-[10px]">Đã xử lý:</span>
                      <p className="font-mono font-bold text-white">{ktv.completed} / {ktv.assigned} máy</p>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-xl">
                      <span className="text-slate-500 text-[10px]">Tỷ lệ đúng hẹn:</span>
                      <p className="font-mono font-bold text-emerald-400">{ktv.onTimeRate}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {showNewModal && (
        <NewWarrantyModal
          isOpen={showNewModal}
          onClose={() => setShowNewModal(false)}
          onSave={onSaveWarranty}
          products={products}
          customers={customers}
          orders={orders}
        />
      )}

      {selectedTicket && (
        <WarrantyDetailModal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          ticket={selectedTicket}
          onUpdateTicket={onUpdateWarranty}
          onOpenPrint={handleOpenPrint}
          serialRecords={safeSerials}
          onSaveSerialRecords={onSaveSerialRecords}
          products={products}
          onSaveProduct={onSaveProduct}
          onAdjustStock={onAdjustStock}
        />
      )}

      {printTicket && (
        <WarrantyPrintModal
          isOpen={!!printTicket}
          onClose={() => setPrintTicket(null)}
          ticket={printTicket}
          settings={settings}
          printMode={printMode}
        />
      )}

      {/* A4 / A5 Standard Warranty Intake & Return Print Modal */}
      {printA4Ticket && (
        <PrintInvoiceModal
          isOpen={!!printA4Ticket}
          initialDocType={printA4Ticket.mode}
          orderCode={printA4Ticket.ticket.code}
          orderDate={printA4Ticket.ticket.receivedDate}
          customer={{
            name: printA4Ticket.ticket.customerName,
            phone: printA4Ticket.ticket.customerPhone,
            address: printA4Ticket.ticket.customerAddress || 'ĐẮK LẮK',
          }}
          items={[
            {
              id: printA4Ticket.ticket.id,
              sku: printA4Ticket.ticket.serialNumber || 'SN-BH',
              productName: printA4Ticket.ticket.productName,
              unit: 'PCS',
              quantity: 1,
              actualQuantity: 1,
              unitPrice: printA4Ticket.ticket.totalFee || 0,
              total: printA4Ticket.ticket.totalFee || 0,
              serialNumber: printA4Ticket.ticket.serialNumber,
              note: printA4Ticket.ticket.issueDescription || printA4Ticket.ticket.resolution || 'Bảo hành chính hãng',
              warranty: 'BH Chính Hãng',
            },
          ]}
          taxRate={0}
          creatorName={printA4Ticket.ticket.technicianName || 'Mr. Thơm'}
          deliveryNote={`Tình trạng lỗi: ${printA4Ticket.ticket.issueDescription || 'Kiểm tra phần cứng'}`}
          settings={settings || ({} as any)}
          onClose={() => setPrintA4Ticket(null)}
        />
      )}
    </div>
  );
};
