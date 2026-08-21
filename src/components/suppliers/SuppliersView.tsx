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
} from 'lucide-react';
import { Supplier, PurchaseOrder, Product, StoreSettings } from '../../types';
import { formatVND } from '../../utils/vietqr';
import { NewSupplierModal } from './NewSupplierModal';
import { NewPurchaseOrderModal } from './NewPurchaseOrderModal';
import { PurchaseOrderPrintModal } from './PurchaseOrderPrintModal';
import { SupplierComparisonModal } from '../quotes/SupplierComparisonModal';

interface SuppliersViewProps {
  suppliers?: Supplier[];
  purchaseOrders?: PurchaseOrder[];
  products?: Product[];
  settings?: StoreSettings;
  onSaveSupplier?: (supplier: Supplier) => void;
  onSavePurchaseOrder?: (po: PurchaseOrder) => void;
}

const DEFAULT_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-synnex',
    code: 'NCC-FPT-01',
    name: 'Nhà Phân Phối Synnex FPT',
    taxCode: '0101248141',
    tier: 'Tier 1 Chính Hãng',
    category: 'Camera & An Ninh',
    contactPerson: 'Nguyễn Tiến Dũng (Giám đốc Kênh Đại Lý)',
    phone: '0903.112.233',
    email: 'dungnt@synnexfpt.com.vn',
    address: 'Tòa nhà FPT, Phố Duy Tân, Quận Cầu Giấy, TP. Hà Nội',
    bankName: 'Ngân Hàng TMCP Quân Đội (MB Bank)',
    bankAccount: '090311223399',
    bankCode: 'MB',
    creditLimit: 300000000,
    creditDays: 30,
    currentDebt: 48500000,
    ratingQuality: 9.9,
    ratingPrice: 9.2,
    ratingOnTime: 9.8,
    ratingWarranty: 9.9,
    notes: 'Nhà phân phối chính hãng Hikvision, Cisco, HP, Dell tại Việt Nam. Hỗ trợ 1 đổi 1 trong 24h.',
    priceList: [
      { sku: 'CAM-DS1T41', productName: 'Camera IP Thân Trụ 4MP Hikvision Ban Đêm Có Màu', costPrice: 880000, warrantyMonths: 24, moq: 5 },
      { sku: 'NVR-DS7104', productName: 'Đầu Ghi Hình NVR 4 Kênh Hikvision 4K H.265+', costPrice: 1250000, warrantyMonths: 24, moq: 2 },
      { sku: 'HDD-2TB-WD', productName: 'Ổ Cứng Chuyên Dụng Camera WD Purple 2TB', costPrice: 1120000, warrantyMonths: 36, moq: 5 },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sup-psd',
    code: 'NCC-PSD-02',
    name: 'Công Ty Dầu Khí PSD (Petrosetco)',
    taxCode: '0304991288',
    tier: 'Tier 1 Chính Hãng',
    category: 'Máy Tính & Linh Kiện',
    contactPerson: 'Trần Minh Tuấn (Phụ Trách B2B)',
    phone: '0918.445.566',
    email: 'tuan.tm@psd.com.vn',
    address: 'Số 1-5 Lê Duẩn, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    bankName: 'Vietcombank Chi Nhánh Tân Định',
    bankAccount: '0071001234567',
    bankCode: 'VCB',
    creditLimit: 200000000,
    creditDays: 21,
    currentDebt: 32000000,
    ratingQuality: 9.6,
    ratingPrice: 9.5,
    ratingOnTime: 9.7,
    ratingWarranty: 9.5,
    notes: 'Tổng đại lý phân phối máy POS, laptop, linh kiện chính hãng Samsung, ASUS, Kingston.',
    priceList: [
      { sku: 'POS-T15-I5', productName: 'Máy Bán Hàng POS Cảm Ứng 15 inch Intel Core i5', costPrice: 6200000, warrantyMonths: 12, moq: 1 },
      { sku: 'PTR-K80-AUTO', productName: 'Máy In Hóa Đơn Nhiệt Bill K80 Cắt Giấy Tự Động', costPrice: 1150000, warrantyMonths: 12, moq: 3 },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sup-lehoang',
    code: 'NCC-LH-03',
    name: 'Viễn Thông Lê Hoàng / An Phát',
    taxCode: '0303889122',
    tier: 'Tổng Đại Lý',
    category: 'Hạ Tầng Mạng & WiFi',
    contactPerson: 'Lê Hoàng Long',
    phone: '0908.778.899',
    email: 'kinhdoanh@lehoangcctv.com',
    address: '872 Tạ Quang Bửu, Phường 5, Quận 8, TP. Hồ Chí Minh',
    bankName: 'Ngân Hàng Techcombank',
    bankAccount: '19033445566778',
    bankCode: 'TCB',
    creditLimit: 150000000,
    creditDays: 15,
    currentDebt: 18000000,
    ratingQuality: 9.4,
    ratingPrice: 9.4,
    ratingOnTime: 9.5,
    ratingWarranty: 9.4,
    notes: 'Master Dealer Hikvision, Dahua, DrayTek, TOTOLINK, Switch PoE chuyên dụng.',
    priceList: [
      { sku: 'RT-V2927', productName: 'Router Cân Bằng Tải DrayTek Vigor 2927 Dual WAN', costPrice: 3350000, warrantyMonths: 24, moq: 1 },
      { sku: 'WF6-AP100', productName: 'Bộ Phát WiFi 6 Chuyên Dụng Roaming 100 User', costPrice: 1650000, warrantyMonths: 24, moq: 2 },
    ],
    createdAt: new Date().toISOString(),
  },
];

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  suppliers = DEFAULT_SUPPLIERS,
  purchaseOrders = [],
  products = [],
  settings,
  onSaveSupplier,
  onSavePurchaseOrder,
}) => {
  const safeSuppliers = suppliers && suppliers.length > 0 ? suppliers : DEFAULT_SUPPLIERS;
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(safeSuppliers[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'pricelist' | 'orders'>('profile');
  const [showNewSupplierModal, setShowNewSupplierModal] = useState(false);
  const [showNewPOModal, setShowNewPOModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showPrintPOModal, setShowPrintPOModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  const activeSupplier = safeSuppliers.find((s) => s.id === selectedSupplierId) || safeSuppliers[0];

  const filteredSuppliers = safeSuppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm)
  );

  // Summary metrics
  const totalSuppliersCount = safeSuppliers.length;
  const totalDebt = safeSuppliers.reduce((acc, s) => acc + (s.currentDebt || 0), 0);
  const totalPOsCount = purchaseOrders.length;
  const totalPOValue = purchaseOrders.reduce((acc, po) => acc + (po.totalAmount || 0), 0);

  const supplierPOs = purchaseOrders.filter((po) => po.supplierId === activeSupplier?.id);

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

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Header */}
      <div className="p-4 md:p-6 bg-slate-900/90 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center space-x-2">
              <span>Hệ Thống Quản Lý Nhà Cung Ứng & Đơn Mua Hàng (PO)</span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                MCDA 360°
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Quản lý danh bạ NCC, thẻ chấm điểm năng lực (Scorecard), hạn mức công nợ và lập đơn đặt hàng mua chuẩn A4
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowComparisonModal(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl border border-amber-500/40 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Ma Trận So Sánh Giá</span>
          </button>

          <button
            type="button"
            onClick={() => setShowNewPOModal(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/20 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>+ Lập Đơn Mua (PO)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowNewSupplierModal(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-lg shadow-blue-500/20 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Thêm NCC</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4 px-6 bg-slate-900/40 border-b border-slate-800 shrink-0 text-xs">
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-slate-400">Tổng Nhà Cung Ứng:</span>
            <p className="text-base font-bold text-white mt-0.5">{totalSuppliersCount} Đối tác</p>
          </div>
          <Building2 className="w-5 h-5 text-blue-400" />
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-rose-500/30 bg-rose-950/10 flex items-center justify-between">
          <div>
            <span className="text-rose-400">Tổng Nợ Phải Trả NCC:</span>
            <p className="text-base font-mono font-black text-rose-400 mt-0.5">{formatVND(totalDebt)}</p>
          </div>
          <CreditCard className="w-5 h-5 text-rose-400" />
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-slate-400">Đơn Mua Hàng (PO):</span>
            <p className="text-base font-bold text-emerald-400 mt-0.5">{totalPOsCount} đơn ({formatVND(totalPOValue)})</p>
          </div>
          <Truck className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-slate-400">Giao Hàng Đúng Hẹn:</span>
            <p className="text-base font-bold text-amber-400 mt-0.5">97.8% (Chuẩn SLA)</p>
          </div>
          <Award className="w-5 h-5 text-amber-400" />
        </div>
      </div>

      {/* Main split view */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar: Suppliers List */}
        <div className="w-full lg:w-96 border-r border-slate-800 flex flex-col bg-slate-900/40 shrink-0">
          <div className="p-3 border-b border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm tên NCC, mã đối tác, SĐT..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {filteredSuppliers.map((s) => {
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
            })}
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
                    Mã đối tác: <strong className="font-mono text-slate-200">{activeSupplier.code}</strong> • MST: <strong className="font-mono text-slate-200">{activeSupplier.taxCode}</strong>
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowNewPOModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <Truck className="w-4 h-4" />
                    <span>+ Lập Đơn Đặt Hàng (PO)</span>
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

                  {/* Contact & Credit Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 text-xs">
                      <h4 className="font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-blue-400" />
                        <span>Thông Tin Liên Hệ & Trụ Sở</span>
                      </h4>
                      <div className="space-y-2 text-slate-300">
                        <p>👤 Đại diện bán hàng: <strong>{activeSupplier.contactPerson}</strong></p>
                        <p>☎️ Hotline / Zalo: <strong className="text-emerald-400 font-mono">{activeSupplier.phone}</strong></p>
                        <p>✉️ Email: <strong className="text-blue-400">{activeSupplier.email}</strong></p>
                        <p>📍 Địa chỉ kho & văn phòng: {activeSupplier.address}</p>
                      </div>
                    </div>

                    <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 text-xs">
                      <h4 className="font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-emerald-400" />
                        <span>Hạn Mức Tín Dụng & Công Nợ</span>
                      </h4>
                      <div className="space-y-2 text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Hạn mức công nợ tối đa:</span>
                          <strong className="text-white font-mono">{formatVND(activeSupplier.creditLimit)}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Dư nợ hiện tại:</span>
                          <strong className="text-rose-400 font-mono font-black">{formatVND(activeSupplier.currentDebt || 0)}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Thời hạn cho phép nợ:</span>
                          <strong className="text-amber-400">{activeSupplier.creditDays} Ngày gối đầu</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Tài khoản ngân hàng:</span>
                          <span className="font-mono font-bold text-slate-200">{activeSupplier.bankAccount} ({activeSupplier.bankName})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SKU Price List */}
              {activeTab === 'pricelist' && (
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden space-y-3 p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Bảng Giá Bán Buôn Chi Tiết Theo Từng SKU Của {activeSupplier.name}
                    </h4>
                  </div>
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
                      {activeSupplier.priceList?.map((item, idx) => (
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
                              {new Date(po.orderDate).toLocaleDateString('vi-VN')} ➔ {new Date(po.expectedDeliveryDate).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="p-3 text-slate-300">{po.warehouseName}</td>
                            <td className="p-3 text-right font-mono font-bold text-emerald-400">{formatVND(po.totalAmount)}</td>
                            <td className="p-3 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                {po.status === 'completed' ? 'Đã Nhập Kho' : 'Đã Gửi PO'}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedPO(po);
                                  setShowPrintPOModal(true);
                                }}
                                className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg text-xs font-bold flex items-center space-x-1 mx-auto transition-colors cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>In PO (A4)</span>
                              </button>
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
            <div className="h-full flex items-center justify-center text-slate-500">
              Chọn nhà cung cấp để xem hồ sơ chi tiết
            </div>
          )}
        </div>
      </div>

      {/* New Supplier Modal */}
      {showNewSupplierModal && (
        <NewSupplierModal
          isOpen={showNewSupplierModal}
          onClose={() => setShowNewSupplierModal(false)}
          onSave={(newSup) => {
            if (onSaveSupplier) onSaveSupplier(newSup);
            setSelectedSupplierId(newSup.id);
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
    </div>
  );
};
