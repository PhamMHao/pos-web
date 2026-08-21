import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  FileText,
  Building2,
  Truck,
  Calendar,
  CreditCard,
  DollarSign,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { Supplier, PurchaseOrder, Product, StoreSettings } from '../../types';
import { formatVND } from '../../utils/vietqr';
import { sounds } from '../../utils/soundEffects';

interface NewPurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: Supplier[];
  products: Product[];
  settings?: StoreSettings;
  onSave: (po: PurchaseOrder) => void;
  preselectedSupplierId?: string;
}

export const NewPurchaseOrderModal: React.FC<NewPurchaseOrderModalProps> = ({
  isOpen,
  onClose,
  suppliers = [],
  products = [],
  settings,
  onSave,
  preselectedSupplierId,
}) => {
  const [supplierId, setSupplierId] = useState<string>(preselectedSupplierId || suppliers[0]?.id || '');
  const [code, setCode] = useState<string>('PO-' + new Date().getFullYear() + '-' + Date.now().toString().slice(-4));
  const [warehouseName, setWarehouseName] = useState<string>('Kho Tổng Gia Phúc TP.HCM');
  const [orderDate, setOrderDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>(
    new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().slice(0, 10)
  );
  const [paymentMethod, setPaymentMethod] = useState<PurchaseOrder['paymentMethod']>('debt_30d');
  const [vatRate, setVatRate] = useState<number>(10);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('Đơn đặt hàng linh kiện & thiết bị dự án. Giao hàng tại kho theo thỏa thuận.');

  const activeSupplier = suppliers.find((s) => s.id === supplierId) || suppliers[0];

  const [items, setItems] = useState<Array<{
    productId?: string;
    sku: string;
    productName: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>>([
    {
      sku: 'CAM-DS1T41',
      productName: 'Camera IP Thân Trụ 4MP DS-2CD1T41G2-LIU Hikvision',
      unit: 'Bộ',
      quantity: 10,
      unitPrice: 880000,
      total: 8800000,
    },
  ]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        sku: '',
        productName: '',
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

  const handleSelectProduct = (index: number, prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              productId: prod.id,
              sku: prod.sku,
              productName: prod.name,
              unit: prod.unit || 'Cái',
              quantity: item.quantity || 1,
              unitPrice: prod.costPrice || prod.sellingPrice * 0.7,
              total: (item.quantity || 1) * (prod.costPrice || prod.sellingPrice * 0.7),
            }
          : item
      )
    );
  };

  const handleItemChange = (index: number, field: string, val: any) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: val };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = (Number(updated.quantity) || 0) * (Number(updated.unitPrice) || 0);
        }
        return updated;
      })
    );
  };

  const subtotal = items.reduce((acc, it) => acc + (Number(it.total) || 0), 0);
  const vatAmount = Math.round((subtotal * vatRate) / 100);
  const grandTotal = Math.max(0, subtotal + vatAmount + Number(shippingFee) - Number(discountAmount));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSupplier) {
      alert('Vui lòng chọn nhà cung cấp!');
      return;
    }

    const newPO: PurchaseOrder = {
      id: 'po-' + Date.now(),
      code: code.trim(),
      supplierId: activeSupplier.id,
      supplierName: activeSupplier.name,
      supplierPhone: activeSupplier.phone,
      supplierAddress: activeSupplier.address,
      supplierTaxCode: activeSupplier.taxCode,
      warehouseId: 'wh-main',
      warehouseName,
      orderDate,
      expectedDeliveryDate,
      status: 'confirmed',
      items,
      subtotal,
      vatRate,
      vatAmount,
      shippingFee: Number(shippingFee) || 0,
      discountAmount: Number(discountAmount) || 0,
      totalAmount: grandTotal,
      paidAmount: paymentMethod === 'debt_30d' ? 0 : grandTotal,
      paymentStatus: paymentMethod === 'debt_30d' ? 'unpaid' : 'paid',
      paymentMethod,
      notes,
      createdAt: new Date().toISOString(),
    };

    onSave(newPO);
    sounds.playSuccessChime();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 md:p-4 overflow-hidden animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-4xl w-full max-h-[94vh] shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                <span>Lập Đơn Đặt Hàng Mua (Purchase Order - PO)</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                  {code}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Lập chứng từ mua hàng gửi NCC, cam kết thời gian giao và tự động đồng bộ công nợ
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-900/60 text-xs">
          {/* Top Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Chọn Nhà Cung Ứng *</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.tier})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Kho Nhận Hàng</label>
              <select
                value={warehouseName}
                onChange={(e) => setWarehouseName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
              >
                <option value="Kho Tổng Gia Phúc TP.HCM">Kho Tổng Gia Phúc TP.HCM</option>
                <option value="Kho Chi Nhánh Hà Nội">Kho Chi Nhánh Hà Nội</option>
                <option value="Kho Miền Trung Đà Nẵng">Kho Miền Trung Đà Nẵng</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Ngày Đặt Hàng</label>
                <input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-white text-center font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Ngày Giao Dự Kiến</label>
                <input
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-emerald-400 text-center font-mono focus:outline-none font-bold"
                />
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Danh Mục Thiết Bị & Vật Tư Đặt Mua</span>
              </h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/40 text-xs font-bold rounded-lg flex items-center space-x-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Thêm Dòng</span>
              </button>
            </div>

            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3 w-1/3">Chọn Từ Kho SP / Nhập Tên</th>
                    <th className="p-3 w-28">Mã SKU</th>
                    <th className="p-3 w-20 text-center">ĐVT</th>
                    <th className="p-3 w-24 text-right">Số Lượng</th>
                    <th className="p-3 w-32 text-right">Đơn Giá Nhập</th>
                    <th className="p-3 w-32 text-right">Thành Tiền</th>
                    <th className="p-3 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/50">
                      <td className="p-2.5">
                        <div className="space-y-1">
                          <select
                            onChange={(e) => handleSelectProduct(idx, e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-300 focus:outline-none mb-1"
                          >
                            <option value="">-- Chọn từ danh mục kho --</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.sku})
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={item.productName}
                            onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                            placeholder="Hoặc nhập tên vật tư mới..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white font-semibold focus:outline-none"
                          />
                        </div>
                      </td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={item.sku}
                          onChange={(e) => handleItemChange(idx, 'sku', e.target.value)}
                          placeholder="SKU..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-300 font-mono focus:outline-none"
                        />
                      </td>
                      <td className="p-2.5 text-center">
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-center text-slate-300 focus:outline-none"
                        />
                      </td>
                      <td className="p-2.5 text-right">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-right font-mono font-bold text-white focus:outline-none"
                        />
                      </td>
                      <td className="p-2.5 text-right">
                        <input
                          type="number"
                          step="1000"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-right font-mono font-bold text-amber-400 focus:outline-none"
                        />
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-emerald-400">
                        {formatVND(item.total)}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Calculation & Payment Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Điều Khoản & Phương Thức Thanh Toán</span>
              </h4>
              <div>
                <label className="block text-slate-400 mb-1">Phương Thức Thanh Toán:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none"
                >
                  <option value="debt_30d">⏳ Công Nợ Gối Đầu 30 Ngày</option>
                  <option value="transfer">🏦 Chuyển Khoản Ngân Hàng (VietQR)</option>
                  <option value="cash">💵 Tiền Mặt Khi Nhận Hàng (COD)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Ghi Chú Đơn Đặt Hàng:</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Tiền Hàng (Chưa VAT):</span>
                <span className="font-bold text-white">{formatVND(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Thuế VAT (%):</span>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    value={vatRate}
                    onChange={(e) => setVatRate(Number(e.target.value))}
                    className="w-14 bg-slate-900 border border-slate-700 rounded-lg p-1 text-center text-white"
                  />
                  <span className="text-slate-300 font-bold">+{formatVND(vatAmount)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Phí Vận Chuyển:</span>
                <input
                  type="number"
                  step="50000"
                  value={shippingFee}
                  onChange={(e) => setShippingFee(Number(e.target.value))}
                  className="w-32 bg-slate-900 border border-slate-700 rounded-lg p-1 text-right text-white"
                />
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Chiết Khấu NCC:</span>
                <input
                  type="number"
                  step="50000"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  className="w-32 bg-slate-900 border border-slate-700 rounded-lg p-1 text-right text-rose-400"
                />
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-black text-white">
                <span>TỔNG GIÁ TRỊ ĐƠN PO:</span>
                <span className="text-amber-400 text-base">{formatVND(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/30 flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu & Kích Hoạt Đơn Đặt Hàng PO</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
