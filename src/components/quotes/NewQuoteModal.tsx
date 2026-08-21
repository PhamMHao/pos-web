import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  FileSpreadsheet,
  Building2,
  Phone,
  User,
  Calendar,
  Percent,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { PriceQuote, Product, Customer, StoreSettings } from '../../types';
import { formatVND } from '../../utils/vietqr';

export interface InitialQuotePrefill {
  customerName?: string;
  customerPhone?: string;
  customerCompany?: string;
  discountPercent?: number;
  notes?: string;
  items?: QuoteItemInput[];
}

interface NewQuoteModalProps {
  products: Product[];
  customers: Customer[];
  settings?: StoreSettings;
  initialQuoteData?: InitialQuotePrefill | null;
  onClose: () => void;
  onSave: (quote: PriceQuote) => void;
}

interface QuoteItemInput {
  productId?: string;
  productName: string;
  sku: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export const NewQuoteModal: React.FC<NewQuoteModalProps> = ({
  products = [],
  customers = [],
  settings,
  initialQuoteData,
  onClose,
  onSave,
}) => {
  const [customerName, setCustomerName] = useState(initialQuoteData?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(initialQuoteData?.customerPhone || '');
  const [customerCompany, setCustomerCompany] = useState(initialQuoteData?.customerCompany || '');
  const [discountPercent, setDiscountPercent] = useState<number>(initialQuoteData?.discountPercent || 0);
  const [validUntil, setValidUntil] = useState<string>(
    new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState(
    initialQuoteData?.notes || 'Báo giá linh kiện & thiết bị dự án. Giá đã bao gồm hỗ trợ giao hàng tận nơi.'
  );
  const [items, setItems] = useState<QuoteItemInput[]>(() => {
    if (initialQuoteData?.items && initialQuoteData.items.length > 0) {
      return initialQuoteData.items;
    }
    return [
      {
        productName: '',
        sku: '',
        unit: 'Cái',
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ];
  });

  const [selectedCustomerSearch, setSelectedCustomerSearch] = useState(initialQuoteData?.customerName || '');
  const [showCustDropdown, setShowCustDropdown] = useState(false);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(selectedCustomerSearch.toLowerCase()) ||
      c.phone.includes(selectedCustomerSearch)
  );

  const handleSelectCustomer = (c: Customer) => {
    setCustomerName(c.name);
    setCustomerPhone(c.phone);
    setCustomerCompany(c.address || '');
    setSelectedCustomerSearch(c.name);
    setShowCustDropdown(false);
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        productName: '',
        sku: '',
        unit: 'Cái',
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSelectProduct = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const qty = item.quantity || 1;
          const price = prod.sellingPrice || 0;
          return {
            ...item,
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku,
            unit: prod.unit || 'Cái',
            unitPrice: price,
            total: qty * price,
          };
        }
        return item;
      })
    );
  };

  const handleUpdateItem = (
    index: number,
    field: keyof QuoteItemInput,
    val: any
  ) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const updated = { ...item, [field]: val };
          if (field === 'quantity' || field === 'unitPrice') {
            const q = field === 'quantity' ? Number(val) : updated.quantity;
            const p = field === 'unitPrice' ? Number(val) : updated.unitPrice;
            updated.total = (q || 0) * (p || 0);
          }
          return updated;
        }
        return item;
      })
    );
  };

  const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
  const discountAmount = Math.round((subtotal * (discountPercent || 0)) / 100);
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Vui lòng nhập tên khách hàng hoặc công ty nhận báo giá!');
      return;
    }
    const validItems = items.filter((it) => it.productName.trim() && it.quantity > 0);
    if (validItems.length === 0) {
      alert('Vui lòng thêm ít nhất 1 sản phẩm hợp lệ vào bảng báo giá!');
      return;
    }

    const nextCode = `BG-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const newQuote: PriceQuote = {
      id: `quote-${Date.now()}`,
      code: nextCode,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || 'Chưa có SĐT',
      customerCompany: customerCompany.trim() || undefined,
      totalAmount: subtotal,
      discountPercent: discountPercent || 0,
      finalTotal,
      validUntil,
      status: 'sent',
      items: validItems.map((it) => ({
        productName: it.productName,
        sku: it.sku || 'SKU-' + Math.random().toString(36).slice(-4).toUpperCase(),
        unit: it.unit || 'Cái',
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        total: Number(it.total) || 0,
      })),
      createdAt: new Date().toISOString(),
      notes,
    };

    onSave(newQuote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Lập Bảng Báo Giá Dự Án / Khách Sỉ</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  B2B Quote
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Tạo bảng báo giá xuất khẩu PDF / In ấn và chuyển đổi trực tiếp sang Đơn Hàng POS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* Customer Info Section */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <User className="w-4 h-4 text-blue-400" />
              <span>Thông Tin Khách Hàng / Đối Tác Dự Án</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Quick Customer Search */}
              <div className="relative">
                <label className="block text-xs text-slate-400 mb-1">
                  Tên Khách Hàng / Đại Diện *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="VD: Anh Tuấn / Công ty Hoàng Nam"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      setSelectedCustomerSearch(e.target.value);
                      setShowCustDropdown(true);
                    }}
                    onFocus={() => setShowCustDropdown(true)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  {showCustDropdown && filteredCustomers.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto divide-y divide-slate-700/50">
                      {filteredCustomers.slice(0, 5).map((c) => (
                        <div
                          key={c.id}
                          onClick={() => handleSelectCustomer(c)}
                          className="p-2 hover:bg-slate-700/60 cursor-pointer text-xs flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-white">{c.name}</div>
                            <div className="text-[10px] text-slate-400">{c.phone}</div>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                            {c.tier}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Số Điện Thoại</label>
                <input
                  type="text"
                  placeholder="VD: 0988 123 456"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Công Ty / Địa Chỉ Dự Án</label>
                <input
                  type="text"
                  placeholder="VD: Tòa nhà Bitexco, Q.1"
                  value={customerCompany}
                  onChange={(e) => setCustomerCompany(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                <span>Danh Mục Sản Phẩm & Thiết Bị Báo Giá ({items.length})</span>
              </h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-white text-xs font-bold rounded-xl flex items-center space-x-1 border border-slate-700 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Thêm Sản Phẩm</span>
              </button>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3 w-10 text-center">#</th>
                    <th className="p-3 min-w-[200px]">Sản Phẩm (Kho Hàng)</th>
                    <th className="p-3 w-24">ĐVT</th>
                    <th className="p-3 w-24 text-right">Số Lượng</th>
                    <th className="p-3 w-32 text-right">Đơn Giá (VNĐ)</th>
                    <th className="p-3 w-36 text-right">Thành Tiền</th>
                    <th className="p-3 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="p-2.5 text-center text-slate-500 font-mono">{idx + 1}</td>
                      <td className="p-2.5 space-y-1">
                        <select
                          value={item.productId || ''}
                          onChange={(e) => handleSelectProduct(idx, e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="">-- Chọn nhanh từ kho hàng --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku}) - Kho: {p.stock} {p.unit}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          required
                          placeholder="Hoặc nhập tên sản phẩm tùy chỉnh..."
                          value={item.productName}
                          onChange={(e) => handleUpdateItem(idx, 'productName', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleUpdateItem(idx, 'unit', e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(idx, 'quantity', e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-right text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          min="0"
                          required
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(idx, 'unitPrice', e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-right text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-white text-xs">
                        {formatVND(item.total)}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          disabled={items.length <= 1}
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition disabled:opacity-30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing & Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Thời Hạn Hiệu Lực Báo Giá
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    required
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Ghi Chú & Điều Khoản</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Tổng tiền hàng (Tạm tính):</span>
                  <span className="font-mono text-slate-200 font-bold">{formatVND(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Chiết khấu dự án (%):</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value) || 0)}
                      className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-right text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-xs text-slate-400">%</span>
                  </div>
                </div>

                {discountPercent > 0 && (
                  <div className="flex items-center justify-between text-xs text-amber-400/80">
                    <span>Số tiền giảm:</span>
                    <span className="font-mono font-semibold">-{formatVND(discountAmount)}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Tổng Thanh Toán Báo Giá</div>
                  <div className="text-lg font-black text-blue-400 font-mono">
                    {formatVND(finalTotal)}
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Đã gồm VAT</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-blue-500/20 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Lưu & Phát Hành Báo Giá</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
