import React, { useState } from 'react';
import {
  X,
  Sparkles,
  UserCheck,
  Building2,
  Package,
  Layers,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { PriceQuote, Customer, Product, StoreSettings } from '../../types';
import { formatVND } from '../../utils/vietqr';
import { sounds } from '../../utils/soundEffects';

interface EquivalentQuoteRecommenderProps {
  isOpen: boolean;
  onClose: () => void;
  quotes: PriceQuote[];
  customers: Customer[];
  products: Product[];
  settings?: StoreSettings;
  onSelectTemplateForNewQuote?: (templateData: {
    customerName: string;
    customerPhone: string;
    customerCompany: string;
    discountPercent: number;
    notes: string;
    items: Array<{
      productId?: string;
      productName: string;
      sku: string;
      unit: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
  }) => void;
}

export const EquivalentQuoteRecommenderModal: React.FC<EquivalentQuoteRecommenderProps> = ({
  isOpen,
  onClose,
  quotes = [],
  customers = [],
  products = [],
  settings,
  onSelectTemplateForNewQuote,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');

  if (!isOpen) return null;

  const activeCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  const getTierDiscount = (tier: string) => {
    switch (tier) {
      case 'Kim Cương':
        return 10;
      case 'Vàng':
        return 7;
      case 'Bạc':
        return 4;
      default:
        return 2;
    }
  };

  const recommendedDiscount = getTierDiscount(activeCustomer?.tier || 'Đồng');

  const RECOMMENDED_BUNDLES = [
    {
      id: 'bundle-camera-4k',
      title: 'Gói Dự Án Camera Giám Sát Hikvision 4MP Ban Đêm Có Màu (4 Kênh)',
      industry: 'Camera Giám Sát An Ninh',
      suitableFor: 'Văn phòng, nhà xưởng, chuỗi cửa hàng',
      discountSuggest: recommendedDiscount,
      items: [
        { productName: 'Camera IP Thân Trụ 4MP DS-2CD1T41G2-LIU Ban Đêm Có Màu', sku: 'CAM-DS1T41', unit: 'Bộ', quantity: 4, unitPrice: 1250000, total: 5000000 },
        { productName: 'Đầu Ghi Hình NVR 4 Kênh Hikvision Chuẩn H.265+ 4K', sku: 'NVR-DS7104', unit: 'Cái', quantity: 1, unitPrice: 1650000, total: 1650000 },
        { productName: 'Ổ Cứng Chuyên Dụng Camera WD Purple 2TB SATA 3', sku: 'HDD-2TB-WD', unit: 'Cái', quantity: 1, unitPrice: 1450000, total: 1450000 },
        { productName: 'Switch PoE 4 Cổng 10/100Mbps + 2 Cổng Uplink 65W', sku: 'SW-POE-4P', unit: 'Cái', quantity: 1, unitPrice: 650000, total: 650000 },
        { productName: 'Dây Cáp Mạng Cat6 UTP Đồng Nguyên Chất 305m', sku: 'VT-CAP-CAT6', unit: 'Cuộn', quantity: 1, unitPrice: 1850000, total: 1850000 },
      ],
    },
    {
      id: 'bundle-pos-retail',
      title: 'Gói Thiết Bị Bán Hàng POS Thu Ngân Siêu Thị & Bán Lẻ Trọn Bộ',
      industry: 'Giải Pháp Thu Ngân POS',
      suitableFor: 'Siêu thị mini, cửa hàng tiện lợi, nhà thuốc',
      discountSuggest: recommendedDiscount + 1,
      items: [
        { productName: 'Máy Bán Hàng Cảm Ứng POS 15 inch Intel Core i5 / 8GB RAM', sku: 'POS-T15-I5', unit: 'Bộ', quantity: 1, unitPrice: 8500000, total: 8500000 },
        { productName: 'Máy In Hóa Đơn Nhiệt Bill K80 Cắt Giấy Tự Động (Auto-Cut)', sku: 'PTR-K80-AUTO', unit: 'Cái', quantity: 1, unitPrice: 1650000, total: 1650000 },
        { productName: 'Máy Quét Mã Vạch Đa Tia 2D Quét Tự Động Để Bàn', sku: 'SCN-2D-DESK', unit: 'Cái', quantity: 1, unitPrice: 1850000, total: 1850000 },
        { productName: 'Ngăn Kéo Đựng Tiền Thu Ngân 4 Ngăn Tiền Giấy Tự Động Bật', sku: 'DRW-MK410', unit: 'Cái', quantity: 1, unitPrice: 750000, total: 750000 },
      ],
    },
    {
      id: 'bundle-network-office',
      title: 'Hệ Thống Mạng Doanh Nghiệp & WiFi Chịu Tải 50-80 User DrayTek',
      industry: 'Mạng & Hạ Tầng CNTT',
      suitableFor: 'Công ty công nghệ, coworking space, văn phòng đại diện',
      discountSuggest: recommendedDiscount,
      items: [
        { productName: 'Router Cân Bằng Tải DrayTek Vigor 2927 Dual WAN Gigabit', sku: 'RT-V2927', unit: 'Cái', quantity: 1, unitPrice: 4250000, total: 4250000 },
        { productName: 'Bộ Phát WiFi 6 Chuyên Dụng Hỗ Trợ Roaming 100 User', sku: 'WF6-AP100', unit: 'Bộ', quantity: 2, unitPrice: 2150000, total: 4300000 },
        { productName: 'Switch Gigabit 24 Cổng Quản Lý Layer 2+ VLAN', sku: 'SW-GB24-L2', unit: 'Cái', quantity: 1, unitPrice: 3850000, total: 3850000 },
      ],
    },
  ];

  const handleApplyTemplate = (bundle: typeof RECOMMENDED_BUNDLES[0]) => {
    if (onSelectTemplateForNewQuote) {
      onSelectTemplateForNewQuote({
        customerName: activeCustomer?.name || 'Khách Hàng Dự Án',
        customerPhone: activeCustomer?.phone || '',
        customerCompany: activeCustomer?.address || '',
        discountPercent: bundle.discountSuggest,
        notes: 'Báo giá theo gói giải pháp: ' + bundle.title + '. Đã áp dụng chính sách ưu đãi thành viên hạng ' + (activeCustomer?.tier || 'Đồng') + '.',
        items: bundle.items,
      });
    }
    sounds.playSuccessChime();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 md:p-4 overflow-hidden animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-5xl w-full max-h-[92vh] shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                <span>Kiến Nghị Báo Giá Tương Đương Cho Đơn Hàng Tiếp Theo</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                  AI Recommender
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Tự động gợi ý gói báo giá tối ưu dựa trên phân tích hạng thành viên và các dự án tương tự
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer Select Bar */}
        <div className="p-4 px-6 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center space-x-3">
            <UserCheck className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-slate-300">Chọn Khách Hàng Mục Tiêu:</span>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none font-semibold"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.tier || 'Thường'}) - {c.phone}
                </option>
              ))}
            </select>
          </div>
          {activeCustomer && (
            <div className="flex items-center space-x-3 text-xs bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800">
              <span>Hạng Thành Viên: <strong className="text-amber-400">{activeCustomer.tier || 'Đồng'}</strong></span>
              <span>•</span>
              <span>Chiết Khấu Đề Xuất: <strong className="text-emerald-400 font-mono">{recommendedDiscount}%</strong></span>
            </div>
          )}
        </div>

        {/* Recommended Bundles Cards */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-900/60">
          {RECOMMENDED_BUNDLES.map((bundle) => {
            const subtotal = bundle.items.reduce((acc, it) => acc + it.total, 0);
            const discountAmt = Math.round(subtotal * (bundle.discountSuggest / 100));
            const finalTotal = subtotal - discountAmt;
            return (
              <div
                key={bundle.id}
                className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition-all shadow-lg space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-extrabold text-white">{bundle.title}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                        {bundle.industry}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Phù hợp: {bundle.suitableFor}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate(bundle)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <span>Áp Dụng Cho Báo Giá Mới</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-slate-400 border-b border-slate-800 text-[11px]">
                      <tr>
                        <th className="py-1">Mã SP</th>
                        <th>Tên Thiết Bị / Vật Tư</th>
                        <th className="text-center">ĐVT</th>
                        <th className="text-right">SL</th>
                        <th className="text-right">Đơn Giá</th>
                        <th className="text-right">Thành Tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {bundle.items.map((it, i) => (
                        <tr key={i} className="hover:bg-slate-900/40">
                          <td className="py-2 font-mono text-slate-400">{it.sku}</td>
                          <td className="font-semibold text-slate-200">{it.productName}</td>
                          <td className="text-center text-slate-400">{it.unit}</td>
                          <td className="text-right font-mono font-bold text-white">{it.quantity}</td>
                          <td className="text-right font-mono text-slate-300">{formatVND(it.unitPrice)}</td>
                          <td className="text-right font-mono font-bold text-slate-100">{formatVND(it.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs">
                  <div className="text-slate-400">
                    Chiết khấu ưu đãi: <strong className="text-emerald-400">-{formatVND(discountAmt)} ({bundle.discountSuggest}%)</strong>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">Tổng thanh toán dự kiến:</span>
                    <strong className="text-sm font-mono font-black text-amber-400">{formatVND(finalTotal)}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
