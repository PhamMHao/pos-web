import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Star,
  Award,
  ShieldCheck,
  Truck,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  DollarSign,
  FileText,
  Printer,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Sliders,
  Layers,
  Clock,
  ChevronRight,
  Filter,
  Trash2,
  Edit,
  AlertTriangle,
  PackageCheck,
  ArrowDownCircle,
  X,
  Boxes,
} from 'lucide-react';
import { Supplier, PurchaseOrder, Product, StoreSettings, InventoryLog } from '../../types';
import { formatVND } from '../../utils/vietqr';
import { sounds } from '../../utils/soundEffects';
import { NewSupplierModal } from './NewSupplierModal';
import { NewPurchaseOrderModal } from './NewPurchaseOrderModal';
import { PurchaseOrderPrintModal } from './PurchaseOrderPrintModal';
import { SupplierComparisonModal } from '../quotes/SupplierComparisonModal';
import { PrintInvoiceModal, PrintItem } from '../common/PrintInvoiceModal';
import { useMasterData } from '../../core/contexts/MasterDataContext';

interface SuppliersViewProps {
  suppliers?: Supplier[];
  purchaseOrders?: PurchaseOrder[];
  products?: Product[];
  settings?: StoreSettings;
  onSaveSupplier?: (supplier: Supplier) => void;
  onDeleteSupplier?: (id: string) => void;
  onSavePurchaseOrder?: (po: PurchaseOrder) => void;
  onDeletePurchaseOrder?: (id: string) => void;
  onAdjustStock?: (log: Omit<InventoryLog, 'id' | 'timestamp'>) => void;
  onOpenDocOcrScanner?: (mode?: 'supplier_quote' | 'purchase_order') => void;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  suppliers = [],
  purchaseOrders = [],
  products = [],
  settings,
  onSaveSupplier,
  onDeleteSupplier,
  onSavePurchaseOrder,
  onDeletePurchaseOrder,
  onAdjustStock,
  onOpenDocOcrScanner,
}) => {
  const {
    suppliers: masterSuppliers,
    deleteSupplier: deleteMasterSupplier,
    addSupplier: addMasterSupplier,
    updateSupplier: updateMasterSupplier,
  } = useMasterData();

  const safeSuppliers = React.useMemo(() => {
    const map = new Map<string, Supplier>();
    (masterSuppliers || []).forEach((s) => map.set(s.id, s));
    (suppliers || []).forEach((s) => {
      if (!map.has(s.id)) map.set(s.id, s);
    });
    return Array.from(map.values());
  }, [masterSuppliers, suppliers]);

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(safeSuppliers[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'pricelist' | 'orders'>('profile');
  const [showNewSupplierModal, setShowNewSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [showNewPOModal, setShowNewPOModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showPrintPOModal, setShowPrintPOModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  // Receive PO Modal State
  const [receivingPO, setReceivingPO] = useState<PurchaseOrder | null>(null);
  const [receiveQuantities, setReceiveQuantities] = useState<Record<string, number>>({});
  const [receiveSerials, setReceiveSerials] = useState<Record<string, string>>({});
  const [receivingNote, setReceivingNote] = useState<string>('Kiểm đếm nhập đủ hàng theo đơn');
  const [showGoodsReceiptPrint, setShowGoodsReceiptPrint] = useState<{
    isOpen: boolean;
    po: PurchaseOrder;
    items: PrintItem[];
  } | null>(null);

  const activeSupplier = safeSuppliers.find((s) => s.id === selectedSupplierId) || safeSuppliers[0];

  const filteredSuppliers = safeSuppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.phone && s.phone.includes(searchTerm))
  );

  // Summary metrics
  const totalSuppliersCount = safeSuppliers.length;
  const totalDebt = safeSuppliers.reduce((acc, s) => acc + (s.currentDebt || 0), 0);
  const totalPOsCount = purchaseOrders.length;
  const totalPOValue = purchaseOrders.reduce((acc, po) => acc + (po.totalAmount || 0), 0);

  const supplierPOs = activeSupplier ? purchaseOrders.filter((po) => po.supplierId === activeSupplier.id) : [];

  // Composite MCDA Score
  const getSupplierCompositeScore = (s: Supplier) => {
    const score =
      (s.ratingPrice || 9) * 0.35 +
      (s.ratingQuality || 9.5) * 0.25 +
      (s.ratingWarranty || 9.2) * 0.2 +
      (s.ratingOnTime || 9.5) * 0.15 +
      0.5;
    return Number(Math.min(10, score).toFixed(1));
  };

  const handleDeleteSupplierConfirm = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhà cung cấp "${name}" khỏi cơ sở dữ liệu SQL Server?`)) {
      if (onDeleteSupplier) onDeleteSupplier(id);
      try {
        if (deleteMasterSupplier) deleteMasterSupplier(id);
      } catch (err) {
        console.warn('Master data supplier delete warning:', err);
      }
      if (selectedSupplierId === id) {
        const remaining = safeSuppliers.filter((s) => s.id !== id);
        setSelectedSupplierId(remaining[0]?.id || '');
      }
    }
  };

  const handleDeletePOConfirm = (id: string, code: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa đơn mua hàng "${code}" khỏi cơ sở dữ liệu?`)) {
      if (onDeletePurchaseOrder) onDeletePurchaseOrder(id);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 md:p-6 bg-slate-900/60 border-b border-slate-800">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-amber-400" />
            <span>Hệ Thống Quản Lý Nhà Cung Ứng & Đơn Mua Hàng (PO)</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">MCDA 360°</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Quản lý danh bạ NCC, thẻ chấm điểm năng lực (Scorecard), hạn mức công nợ và lập đơn đặt hàng mua chuẩn A4
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenDocOcrScanner && (
            <button
              type="button"
              onClick={() => onOpenDocOcrScanner('supplier_quote')}
              className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Quét Báo Giá (AI)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowComparisonModal(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl border border-amber-500/30 flex items-center space-x-1.5 cursor-pointer transition-colors"
          >
            <Sliders className="w-4 h-4" />
            <span>Ma Trận So Sánh Giá</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (safeSuppliers.length === 0) {
                alert('Vui lòng tạo ít nhất 1 nhà cung cấp trước khi lập đơn mua hàng PO.');
                return;
              }
              setShowNewPOModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95"
          >
            <Truck className="w-4 h-4" />
            <span>Lập Đơn Mua (PO)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingSupplier(null);
              setShowNewSupplierModal(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm NCC</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 md:px-6 bg-slate-900/40 border-b border-slate-800/80">
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Tổng Nhà Cung Ứng:</p>
            <h4 className="text-base md:text-lg font-black text-white mt-0.5">{totalSuppliersCount} Đối tác</h4>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Tổng Nợ Phải Trả NCC:</p>
            <h4 className="text-base md:text-lg font-black text-rose-400 mt-0.5 font-mono">{formatVND(totalDebt)}</h4>
          </div>
          <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Đơn Mua Hàng (PO):</p>
            <h4 className="text-base md:text-lg font-black text-emerald-400 mt-0.5">
              {totalPOsCount} đơn <span className="text-xs text-slate-400 font-mono">({formatVND(totalPOValue)})</span>
            </h4>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Giao Hàng Đúng Hẹn:</p>
            <h4 className="text-base md:text-lg font-black text-amber-400 mt-0.5">97.8% <span className="text-xs text-slate-500">(Chuẩn SLA)</span></h4>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left List of Suppliers */}
        <div className="w-full md:w-80 lg:w-96 border-r border-slate-800 bg-slate-900/30 flex flex-col">
          {/* Search bar */}
          <div className="p-3 border-b border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Tìm tên NCC, mã đối tác, SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Supplier Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((s) => {
                const isSelected = selectedSupplierId === s.id;
                const score = getSupplierCompositeScore(s);
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSupplierId(s.id)}
                    className={'p-4 cursor-pointer transition-colors ' +
                      (isSelected ? 'bg-amber-500/10 border-l-4 border-amber-500' : 'hover:bg-slate-800/50')}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-xs text-white flex items-center space-x-2">
                          <span>{s.name}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-1">
                          <span className="font-mono text-amber-400">{s.code}</span>
                          <span>•</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">{s.category}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {score}/10⭐
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/40 text-[11px]">
                      <span className="text-slate-400">Dư nợ: <strong className="text-rose-400 font-mono">{formatVND(s.currentDebt || 0)}</strong></span>
                      <span className="text-slate-500">Hạn {s.creditDays} ngày</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs flex flex-col items-center justify-center space-y-3">
                <Building2 className="w-10 h-10 text-slate-700" />
                <p>Chưa có nhà cung cấp nào</p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingSupplier(null);
                    setShowNewSupplierModal(true);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow"
                >
                  + Thêm NCC Mới
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Main Details */}
        <div className="flex-1 flex flex-col bg-slate-950 overflow-y-auto p-4 md:p-6">
          {activeSupplier ? (
            <div className="space-y-6 max-w-5xl">
              {/* Supplier Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="text-xl font-black text-white">{activeSupplier.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {activeSupplier.tier}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Mã đối tác: <strong className="font-mono text-slate-200">{activeSupplier.code}</strong> • MST: <strong className="font-mono text-slate-200">{activeSupplier.taxCode || 'Chưa cập nhật'}</strong>
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSupplier(activeSupplier);
                      setShowNewSupplierModal(true);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center space-x-1.5 cursor-pointer transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5 text-blue-400" />
                    <span>Sửa Hồ Sơ</span>
                  </button>

                  {onDeleteSupplier && (
                    <button
                      type="button"
                      onClick={() => handleDeleteSupplierConfirm(activeSupplier.id, activeSupplier.name)}
                      className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-xl border border-rose-500/30 flex items-center space-x-1.5 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa NCC</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowNewPOModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Lập Đơn Đặt Hàng (PO)</span>
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-800 space-x-4 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className={'pb-3 flex items-center space-x-2 transition-colors cursor-pointer ' +
                    (activeTab === 'profile' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-400 hover:text-slate-200')}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Hồ Sơ 360° & Scorecard Năng Lực</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('pricelist')}
                  className={'pb-3 flex items-center space-x-2 transition-colors cursor-pointer ' +
                    (activeTab === 'pricelist' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-400 hover:text-slate-200')}
                >
                  <FileText className="w-4 h-4" />
                  <span>Bảng Giá & Danh Mục SKU ({activeSupplier.priceList?.length || 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className={'pb-3 flex items-center space-x-2 transition-colors cursor-pointer ' +
                    (activeTab === 'orders' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-400 hover:text-slate-200')}
                >
                  <Truck className="w-4 h-4" />
                  <span>Lịch Sử Đơn Đặt Hàng PO ({supplierPOs.length})</span>
                </button>
              </div>

              {/* TAB 1: Profile & Scorecard */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  {/* Scorecard Matrix */}
                  <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Thẻ Chấm Điểm Năng Lực Đối Tác (Supplier Scorecard)</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Chất Lượng Linh Kiện</span>
                          <span className="font-bold text-blue-400">{activeSupplier.ratingQuality}/10⭐</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full" style={{ width: (activeSupplier.ratingQuality * 10) + '%' }}></div>
                        </div>
                        <p className="text-[10px] text-slate-500">Hàng chính hãng CO/CQ đầy đủ</p>
                      </div>

                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Độ Cạnh Tranh Về Giá</span>
                          <span className="font-bold text-emerald-400">{activeSupplier.ratingPrice}/10⭐</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: (activeSupplier.ratingPrice * 10) + '%' }}></div>
                        </div>
                        <p className="text-[10px] text-slate-500">Chiết khấu dự án tốt nhất</p>
                      </div>

                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Giao Hàng Đúng Hẹn</span>
                          <span className="font-bold text-amber-400">{activeSupplier.ratingOnTime}/10⭐</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: (activeSupplier.ratingOnTime * 10) + '%' }}></div>
                        </div>
                        <p className="text-[10px] text-slate-500">Tốc độ giao nhanh 1-2 ngày</p>
                      </div>

                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Chính Sách Hậu Mãi & SLA</span>
                          <span className="font-bold text-purple-400">{activeSupplier.ratingWarranty}/10⭐</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-purple-500 h-full rounded-full" style={{ width: (activeSupplier.ratingWarranty * 10) + '%' }}></div>
                        </div>
                        <p className="text-[10px] text-slate-500">1 đổi 1 tận nơi trong 24h</p>
                      </div>
                    </div>
                  </div>

                  {/* Two Columns: Info & Credit Limit */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact info */}
                    <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 text-xs">
                      <h4 className="font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-blue-400" />
                        <span>Thông Tin Liên Hệ & Trụ Sở</span>
                      </h4>

                      <div className="space-y-2.5 pt-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-500 w-32">Đại diện bán hàng:</span>
                          <strong className="text-white">{activeSupplier.contactPerson || 'Chưa cập nhật'}</strong>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-500 w-32">Hotline / Zalo:</span>
                          <strong className="text-emerald-400 font-mono">{activeSupplier.phone || 'Chưa cập nhật'}</strong>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-500 w-32">Email:</span>
                          <span className="text-blue-400">{activeSupplier.email || 'Chưa cập nhật'}</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-slate-500 w-32 shrink-0">Địa chỉ kho & VP:</span>
                          <span className="text-slate-300">{activeSupplier.address || 'Chưa cập nhật'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Credit Limit & Debt */}
                    <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 text-xs">
                      <h4 className="font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-emerald-400" />
                        <span>Hạn Mức Tín Dụng & Công Nợ</span>
                      </h4>

                      <div className="space-y-2.5 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Hạn mức công nợ tối đa:</span>
                          <strong className="text-white font-mono text-sm">{formatVND(activeSupplier.creditLimit || 0)}</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Dư nợ hiện tại:</span>
                          <strong className="text-rose-400 font-mono text-sm">{formatVND(activeSupplier.currentDebt || 0)}</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Thời hạn cho phép nợ:</span>
                          <strong className="text-amber-400">{activeSupplier.creditDays || 0} Ngày gối đầu</strong>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                          <span className="text-slate-500">Tài khoản ngân hàng:</span>
                          <span className="text-slate-300 font-mono text-right">
                            {activeSupplier.bankAccount} ({activeSupplier.bankName})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {activeSupplier.notes && (
                    <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
                      <strong className="text-slate-300">Ghi chú đối tác:</strong>
                      <p className="text-slate-400 mt-1">{activeSupplier.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SKU Price List */}
              {activeTab === 'pricelist' && (
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden space-y-3 p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Bảng Giá Chiết Khấu Đại Lý & Danh Mục Linh Kiện
                    </h4>
                    {onOpenDocOcrScanner && (
                      <button
                        type="button"
                        onClick={() => onOpenDocOcrScanner('supplier_quote')}
                        className="px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-400 rounded-xl text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Quét Cập Nhật Bảng Giá (AI)</span>
                      </button>
                    )}
                  </div>

                  {activeSupplier.priceList && activeSupplier.priceList.length > 0 ? (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[10px] uppercase font-bold">
                        <tr>
                          <th className="p-3">Mã SKU</th>
                          <th className="p-3">Tên Hàng Hóa / Quy Cách</th>
                          <th className="p-3 text-center">MOQ</th>
                          <th className="p-3 text-center">Bảo Hành</th>
                          <th className="p-3 text-right">Đơn Giá Vốn</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {activeSupplier.priceList.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            <td className="p-3 font-mono font-bold text-amber-400">{item.sku}</td>
                            <td className="p-3 font-semibold text-white">{item.productName}</td>
                            <td className="p-3 text-center text-slate-300 font-mono">{item.moq} Cái</td>
                            <td className="p-3 text-center text-slate-300">{item.warrantyMonths} Tháng</td>
                            <td className="p-3 text-right font-mono font-bold text-emerald-400">{formatVND(item.costPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      Chưa có danh mục bảng giá cho nhà cung cấp này
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Purchase Orders History */}
              {activeTab === 'orders' && (
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden space-y-3 p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Lịch Sử Các Đơn Đặt Hàng Mua Đã Gửi Cho {activeSupplier.name}
                    </h4>
                  </div>
                  {supplierPOs.length > 0 ? (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[10px] uppercase font-bold">
                        <tr>
                          <th className="p-3">Mã Đơn PO</th>
                          <th className="p-3">Ngày Đặt / Giao</th>
                          <th className="p-3">Kho Nhận</th>
                          <th className="p-3 text-right">Tổng Tiền</th>
                          <th className="p-3 text-center">Trạng Thái</th>
                          <th className="p-3 text-center">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {supplierPOs.map((po) => (
                          <tr key={po.id} className="hover:bg-slate-800/40">
                            <td className="p-3 font-mono font-bold text-amber-400">{po.code}</td>
                            <td className="p-3 text-slate-300">
                              {new Date(po.orderDate).toLocaleDateString('vi-VN')} ➔ {po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString('vi-VN') : '-'}
                            </td>
                            <td className="p-3 text-slate-300">{po.warehouseName}</td>
                            <td className="p-3 text-right font-mono font-bold text-emerald-400">{formatVND(po.totalAmount)}</td>
                            <td className="p-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  po.status === 'completed'
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                }`}
                              >
                                {po.status === 'completed' ? '✓ Đã Nhập Kho' : '⏳ Chờ Nhập Hàng'}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center space-x-1.5">
                                {po.status !== 'completed' ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const initQ: Record<string, number> = {};
                                      const initS: Record<string, string> = {};
                                      po.items.forEach((it, idx) => {
                                        initQ[it.productId || it.sku || `item-${idx}`] = it.quantity;
                                        initS[it.productId || it.sku || `item-${idx}`] = '';
                                      });
                                      setReceiveQuantities(initQ);
                                      setReceiveSerials(initS);
                                      setReceivingPO(po);
                                    }}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                                    title="Kiểm đếm và nhập kho thực tế"
                                  >
                                    <PackageCheck className="w-3.5 h-3.5" />
                                    <span>Nhập Kho</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShowGoodsReceiptPrint({
                                        isOpen: true,
                                        po,
                                        items: po.items.map((it, idx) => ({
                                          id: `gr-${idx}`,
                                          sku: it.sku,
                                          productName: it.productName,
                                          unit: it.unit,
                                          quantity: it.quantity,
                                          unitPrice: it.unitPrice,
                                          total: it.total,
                                        })),
                                      });
                                    }}
                                    className="px-2 py-1 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 border border-emerald-800/60 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                                    title="In Phiếu Nhập Kho Nhà Cung Cấp"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>Phiếu Nhập</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedPO(po);
                                    setShowPrintPOModal(true);
                                  }}
                                  className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                                  title="In Đơn Đặt Hàng PO"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                  <span>In PO</span>
                                </button>

                                {onDeletePurchaseOrder && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePOConfirm(po.id, po.code)}
                                    className="p-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors cursor-pointer"
                                    title="Xóa đơn mua hàng"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      Chưa có đơn đặt hàng mua nào cho nhà cung cấp này
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3">
              <Building2 className="w-12 h-12 text-slate-700" />
              <p className="text-sm font-semibold">Chưa chọn hoặc chưa có dữ liệu nhà cung cấp</p>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSupplier(null);
                    setShowNewSupplierModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  + Thêm Nhà Cung Cấp
                </button>
                {onOpenDocOcrScanner && (
                  <button
                    type="button"
                    onClick={() => onOpenDocOcrScanner('supplier_quote')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 cursor-pointer"
                  >
                    📷 Quét Báo Giá AI
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New / Edit Supplier Modal */}
      {showNewSupplierModal && (
        <NewSupplierModal
          isOpen={showNewSupplierModal}
          initialSupplier={editingSupplier}
          onClose={() => {
            setShowNewSupplierModal(false);
            setEditingSupplier(null);
          }}
          onSave={(newSup) => {
            if (onSaveSupplier) onSaveSupplier(newSup);
            try {
              if (editingSupplier && updateMasterSupplier) {
                updateMasterSupplier(newSup.id, newSup);
              } else if (addMasterSupplier) {
                addMasterSupplier(newSup);
              }
            } catch (err) {
              console.warn('Master data supplier save warning:', err);
            }
            setSelectedSupplierId(newSup.id);
            setEditingSupplier(null);
            setShowNewSupplierModal(false);
          }}
        />
      )}

      {/* New Purchase Order Modal */}
      {showNewPOModal && (
        <NewPurchaseOrderModal
          isOpen={showNewPOModal}
          onClose={() => setShowNewPOModal(false)}
          suppliers={safeSuppliers}
          products={products}
          settings={settings}
          preselectedSupplierId={activeSupplier?.id}
          onSave={(newPO) => {
            if (onSavePurchaseOrder) onSavePurchaseOrder(newPO);
            setSelectedPO(newPO);
            setShowPrintPOModal(true);
          }}
        />
      )}

      {/* Supplier Comparison Modal */}
      {showComparisonModal && (
        <SupplierComparisonModal
          isOpen={showComparisonModal}
          onClose={() => setShowComparisonModal(false)}
          products={products}
          settings={settings}
        />
      )}

      {/* Purchase Order Print Modal */}
      {showPrintPOModal && selectedPO && (
        <PurchaseOrderPrintModal
          isOpen={showPrintPOModal}
          onClose={() => setShowPrintPOModal(false)}
          order={selectedPO}
          settings={settings}
        />
      )}

      {/* Receive PO Modal (Kiểm đếm hàng về & Nhập kho trừ tăng tồn) */}
      {receivingPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 md:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-black text-white flex items-center space-x-2">
                    <span>Kiểm Đếm & Nhập Kho Thực Tế Theo Đơn Mua ({receivingPO.code})</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    NCC: <strong className="text-slate-200">{receivingPO.supplierName}</strong> | Kho tiếp nhận: <strong className="text-slate-200">{receivingPO.warehouseName}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReceivingPO(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 md:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-emerald-300 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Boxes className="w-4 h-4 text-emerald-400" />
                  <span>Xác nhận số lượng thực tế nhận và gán Serial để tự động cộng tăng tồn kho ERP.</span>
                </div>
                <span className="text-[11px] font-bold font-mono">
                  Ngày đặt: {new Date(receivingPO.orderDate).toLocaleDateString('vi-VN')}
                </span>
              </div>

              {/* Items Table */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="p-3 w-8">#</th>
                      <th className="p-3">Mã SKU / Tên Sản Phẩm</th>
                      <th className="p-3 text-center w-16">ĐVT</th>
                      <th className="p-3 text-center w-20">SL Đặt</th>
                      <th className="p-3 text-center w-28">SL Thực Nhận</th>
                      <th className="p-3 w-56">Số Serial / IMEI (Nếu có)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {receivingPO.items.map((it, idx) => {
                      const itemKey = it.productId || it.sku || `item-${idx}`;
                      const curQty = receiveQuantities[itemKey] ?? it.quantity;
                      const curSerial = receiveSerials[itemKey] ?? '';

                      return (
                        <tr key={idx} className="hover:bg-slate-900/50">
                          <td className="p-3 text-center font-bold text-slate-500">{idx + 1}</td>
                          <td className="p-3">
                            <div className="font-mono font-bold text-amber-400">{it.sku}</div>
                            <div className="font-semibold text-white">{it.productName}</div>
                          </td>
                          <td className="p-3 text-center text-slate-400">{it.unit || 'Cái'}</td>
                          <td className="p-3 text-center font-mono font-bold text-slate-300">{it.quantity}</td>
                          <td className="p-3 text-center">
                            <input
                              type="number"
                              min="0"
                              value={curQty}
                              onChange={(e) => {
                                const val = Math.max(0, parseInt(e.target.value) || 0);
                                setReceiveQuantities({ ...receiveQuantities, [itemKey]: val });
                              }}
                              className="w-20 px-2 py-1 bg-slate-900 border border-emerald-500/50 rounded-lg text-emerald-400 font-mono font-bold text-center focus:outline-none focus:ring-1 focus:ring-emerald-400"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              placeholder="VD: SN1001, SN1002,..."
                              value={curSerial}
                              onChange={(e) => {
                                setReceiveSerials({ ...receiveSerials, [itemKey]: e.target.value });
                              }}
                              className="w-full px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-600"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Note */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Ghi Chú Kiểm Nhập Kho:</label>
                <input
                  type="text"
                  value={receivingNote}
                  onChange={(e) => setReceivingNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-slate-700"
                  placeholder="Ghi chú tình trạng bao bì, niêm phong, kiểm đếm..."
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 md:p-6 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setReceivingPO(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer"
              >
                Hủy Bỏ
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const printItems: PrintItem[] = receivingPO.items.map((it, idx) => {
                      const itemKey = it.productId || it.sku || `item-${idx}`;
                      const rQty = receiveQuantities[itemKey] ?? it.quantity;
                      const rSerial = receiveSerials[itemKey] || '';
                      return {
                        id: `rcv-${idx}`,
                        sku: it.sku,
                        productName: it.productName,
                        unit: it.unit,
                        quantity: rQty,
                        unitPrice: it.unitPrice,
                        total: rQty * it.unitPrice,
                        serialNumber: rSerial,
                      };
                    });

                    setShowGoodsReceiptPrint({
                      isOpen: true,
                      po: receivingPO,
                      items: printItems,
                    });
                  }}
                  className="px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/40 rounded-xl font-bold flex items-center space-x-1.5 cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>🖨️ In Phiếu Nhập Kho</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // Update Stock for each received item
                    receivingPO.items.forEach((it, idx) => {
                      const itemKey = it.productId || it.sku || `item-${idx}`;
                      const rQty = receiveQuantities[itemKey] ?? it.quantity;
                      if (rQty > 0 && onAdjustStock) {
                        const existingProd = products.find((p) => p.id === it.productId || p.sku === it.sku);
                        const oldStk = existingProd?.stock || 0;
                        onAdjustStock({
                          productId: existingProd?.id || it.productId || `prod-${it.sku}`,
                          productName: it.productName,
                          sku: it.sku,
                          type: 'import',
                          quantityChange: rQty,
                          oldStock: oldStk,
                          newStock: oldStk + rQty,
                          unitPrice: it.unitPrice,
                          reason: `Nhập kho theo đơn mua hàng PO ${receivingPO.code} từ NCC ${receivingPO.supplierName}`,
                          performedBy: 'Thủ Kho Gia Phúc',
                        });
                      }
                    });

                    // Update PO Status to completed
                    const updatedPO: PurchaseOrder = {
                      ...receivingPO,
                      status: 'completed',
                      receivedAt: new Date().toISOString(),
                      receivedBy: 'Thủ Kho Gia Phúc',
                      receiptNote: receivingNote,
                    };

                    if (onSavePurchaseOrder) {
                      onSavePurchaseOrder(updatedPO);
                    }

                    sounds.playSuccessChime();
                    alert(`Đã kiểm đếm và hoàn tất nhập kho theo đơn PO ${receivingPO.code}! Tồn kho các sản phẩm đã được cộng tăng tự động.`);

                    // Open Goods Receipt print preview
                    setShowGoodsReceiptPrint({
                      isOpen: true,
                      po: updatedPO,
                      items: receivingPO.items.map((it, idx) => {
                        const itemKey = it.productId || it.sku || `item-${idx}`;
                        const rQty = receiveQuantities[itemKey] ?? it.quantity;
                        const rSerial = receiveSerials[itemKey] || '';
                        return {
                          id: `rcv-${idx}`,
                          sku: it.sku,
                          productName: it.productName,
                          unit: it.unit,
                          quantity: rQty,
                          unitPrice: it.unitPrice,
                          total: rQty * it.unitPrice,
                          serialNumber: rSerial,
                        };
                      }),
                    });

                    setReceivingPO(null);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>✓ Xác Nhận Nhập Kho & Tăng Tồn</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goods Receipt Print Modal */}
      {showGoodsReceiptPrint?.isOpen && (
        <PrintInvoiceModal
          isOpen={showGoodsReceiptPrint.isOpen}
          onClose={() => setShowGoodsReceiptPrint(null)}
          initialDocType="goods_receipt"
          items={showGoodsReceiptPrint.items}
          orderCode={showGoodsReceiptPrint.po.code}
          creatorName="Thủ Kho Gia Phúc"
          warehouseName={showGoodsReceiptPrint.po.warehouseName}
          deliveryNote={`Nhập kho theo đơn mua hàng PO ${showGoodsReceiptPrint.po.code}`}
          customer={{
            name: showGoodsReceiptPrint.po.supplierName,
            phone: showGoodsReceiptPrint.po.supplierPhone,
            address: showGoodsReceiptPrint.po.supplierAddress,
          }}
          subtotal={showGoodsReceiptPrint.po.subtotal}
          total={showGoodsReceiptPrint.po.totalAmount}
          settings={settings}
        />
      )}
    </div>
  );
};
