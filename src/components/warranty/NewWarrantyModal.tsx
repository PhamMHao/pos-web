import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Wrench,
  QrCode,
  Calendar,
  User,
  Phone,
  Package,
  Clock,
  Sparkles,
  AlertCircle,
  FileCheck,
  Check,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  WarrantyTicket,
  WarrantyTicketType,
  WarrantyPriority,
  Product,
  Customer,
  Order,
  WarrantyPartItem,
} from '../../types';
import { formatVND } from '../../utils/vietqr';
import { useMasterData } from '../../core/contexts/MasterDataContext';

interface NewWarrantyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newTicket: WarrantyTicket) => void;
  products?: Product[];
  customers?: Customer[];
  orders?: Order[];
}

export const NewWarrantyModal: React.FC<NewWarrantyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  products = [],
  customers = [],
  orders = [],
}) => {
  const { customers: masterCustomers } = useMasterData();
  const effectiveCustomers = React.useMemo(() => {
    const map = new Map<string, Customer>();
    (masterCustomers || []).forEach((c) => map.set(c.id, c));
    (customers || []).forEach((c) => {
      if (!map.has(c.id)) map.set(c.id, c);
    });
    return Array.from(map.values());
  }, [masterCustomers, customers]);

  if (!isOpen) return null;

  const [type, setType] = useState<WarrantyTicketType>('warranty');
  const [priority, setPriority] = useState<WarrantyPriority>('normal');
  const [productName, setProductName] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState(
    `SN-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [orderCode, setOrderCode] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [accessoriesIncluded, setAccessoriesIncluded] = useState('Thân máy + Dây nguồn + Cáp kết nối');
  const [cosmeticCondition, setCosmeticCondition] = useState('Thân máy nguyên vẹn tem bảo hành, trầy xước nhẹ');
  const [issueDescription, setIssueDescription] = useState('');
  const [technicianName, setTechnicianName] = useState('Trần Văn Hưng (Kỹ Thuật Trưởng)');
  const [expectedDays, setExpectedDays] = useState(3);
  const [laborCost, setLaborCost] = useState(0);
  const [parts, setParts] = useState<WarrantyPartItem[]>([]);

  // Add Part State
  const [newPartName, setNewPartName] = useState('');
  const [newPartPrice, setNewPartPrice] = useState(0);
  const [newPartQty, setNewPartQty] = useState(1);
  const [newPartUnderWarranty, setNewPartUnderWarranty] = useState(type === 'warranty');

  const handleSelectProduct = (prodId: string) => {
    const p = products.find((x) => x.id === prodId);
    if (p) {
      setProductName(p.name);
      setModel(p.sku);
    }
  };

  const handleSelectCustomer = (custId: string) => {
    const c = customers.find((x) => x.id === custId);
    if (c) {
      setCustomerName(c.name);
      setCustomerPhone(c.phone);
      setCustomerAddress(c.address || '');
    }
  };

  const handleSelectOrder = (oCode: string) => {
    setOrderCode(oCode);
    const order = orders.find((o) => o.code === oCode);
    if (order) {
      if (order.customer) {
        setCustomerName(order.customer.name);
        setCustomerPhone(order.customer.phone);
        if (order.customer.address) setCustomerAddress(order.customer.address);
      }
      if (order.items && order.items.length > 0) {
        setProductName(order.items[0].productName);
        setModel(order.items[0].sku);
      }
    }
  };

  const handleAddPart = () => {
    if (!newPartName.trim()) return;
    const partItem: WarrantyPartItem = {
      id: 'part-' + Date.now(),
      partName: newPartName.trim(),
      quantity: Number(newPartQty) || 1,
      unit: 'Cái',
      unitPrice: Number(newPartPrice) || 0,
      isUnderWarranty: newPartUnderWarranty,
      warrantyMonths: 6,
    };
    setParts([...parts, partItem]);
    setNewPartName('');
    setNewPartPrice(0);
    setNewPartQty(1);
  };

  const handleRemovePart = (id: string) => {
    setParts(parts.filter((p) => p.id !== id));
  };

  const partsTotal = parts.reduce(
    (sum, p) => sum + (p.isUnderWarranty ? 0 : p.quantity * p.unitPrice),
    0
  );
  const totalCost = (type === 'warranty' ? 0 : laborCost) + partsTotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !customerName.trim() || !customerPhone.trim()) {
      alert('Vui lòng nhập tên thiết bị, tên khách hàng và số điện thoại liên hệ');
      return;
    }

    const now = new Date();
    const expDate = new Date();
    expDate.setDate(now.getDate() + Number(expectedDays));

    const dateStr = now.toISOString().slice(0, 16).replace('T', ' ');
    const expDateStr = expDate.toISOString().slice(0, 16).replace('T', ' ');

    const prefix = type === 'warranty' ? 'BH' : type === 'maintenance' ? 'BT' : 'SC';
    const randomCode = `${prefix}-202602-${Math.floor(100 + Math.random() * 900)}`;

    const newTicket: WarrantyTicket = {
      id: 'ticket-' + Date.now(),
      code: randomCode,
      type,
      priority,
      status: 'received',
      orderCode: orderCode || undefined,
      productName: productName.trim(),
      model: model.trim() || undefined,
      serialNumber: serialNumber.trim() || `SN-${Date.now().toString().slice(-6)}`,
      qrCodeUrl: `https://vietqr.me/warranty?code=${randomCode}&sn=${serialNumber}`,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim() || undefined,
      accessoriesIncluded: accessoriesIncluded.trim(),
      cosmeticCondition: cosmeticCondition.trim(),
      issueDescription: issueDescription.trim() || 'Tiếp nhận kiểm tra bảo hành & xử lý kỹ thuật',
      technicianName,
      receivedDate: dateStr,
      expectedReturnDate: expDateStr,
      parts,
      laborCost: type === 'warranty' ? 0 : laborCost,
      partsCost: partsTotal,
      discountAmount: 0,
      totalFee: totalCost,
      paymentStatus: totalCost === 0 ? 'free' : 'unpaid',
      paidAmount: 0,
      timeline: [
        {
          id: 'tl-' + Date.now(),
          timestamp: dateStr,
          action: 'Tiếp nhận thiết bị & Lập phiếu bảo hành/bảo trì',
          actor: 'Nhân viên quầy tiếp nhận',
          notes: `Lập phiếu ${randomCode}, Serial: ${serialNumber}. Bàn giao KTV ${technicianName} chẩn đoán.`,
          status: 'received',
        },
      ],
    };

    onSave(newTicket);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center space-x-2">
                <span>Tiếp Nhận Hàng Bảo Hành / Bảo Trì Mới</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  New Ticket
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Ghi nhận số Serial / IMEI, mã QR tra cứu, lỗi phần cứng và phân công kỹ thuật viên
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Ticket Type & Priority Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Loại Hình Tiếp Nhận</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'warranty', label: 'Bảo Hành', sub: 'Chính Hãng / Miễn phí' },
                  { id: 'maintenance', label: 'Bảo Trì', sub: 'Định kỳ / Hợp đồng' },
                  { id: 'repair', label: 'Sửa Chữa', sub: 'Dịch vụ tính phí' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setType(t.id as WarrantyTicketType);
                      if (t.id === 'warranty') setLaborCost(0);
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      type === t.id
                        ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-md shadow-cyan-500/10'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{t.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{t.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Mức Độ Ưu Tiên</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'low', label: 'Thấp', color: 'text-slate-400' },
                  { id: 'normal', label: 'Thường', color: 'text-blue-400' },
                  { id: 'high', label: 'Cao', color: 'text-amber-400' },
                  { id: 'urgent', label: 'Khẩn Cấp', color: 'text-rose-400' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id as WarrantyPriority)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      priority === p.id
                        ? 'bg-slate-800 border-cyan-500 text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className={`text-xs ${p.color}`}>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Device & Serial Number Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>1. Thông Tin Thiết Bị & Số Serial / IMEI / Mã QR</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">
                  Tên Thiết Bị / Sản Phẩm <span className="text-rose-400">*</span>
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="VD: Cáp Điện Cadivi 2x1.5mm / Máy POS Sunmi D2s / Máy In XP-N160II"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  {products.length > 0 && (
                    <select
                      onChange={(e) => handleSelectProduct(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-[11px] text-slate-300 focus:outline-none"
                    >
                      <option value="">-- Hoặc chọn nhanh từ kho sản phẩm có sẵn --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Model / Mã Sản Phẩm</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="VD: CADIVI-2X1.5, XP-N160II"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Số Serial / IMEI <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="SN-XXXX-XXXXXX"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-cyan-300 font-mono font-bold placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setSerialNumber(
                        `SN-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(
                          100000 + Math.random() * 900000
                        )}`
                      )
                    }
                    className="absolute right-2 top-2 text-[10px] text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800"
                  >
                    Tạo lại
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Mã Đơn Hàng Gốc (Nếu có)</label>
                <div className="space-y-1">
                  <input
                    type="text"
                    value={orderCode}
                    onChange={(e) => setOrderCode(e.target.value)}
                    placeholder="VD: DH-10029"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  {orders.length > 0 && (
                    <select
                      onChange={(e) => handleSelectOrder(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-1 text-[10px] text-slate-300 focus:outline-none"
                    >
                      <option value="">-- Gắn với Đơn hàng đã bán --</option>
                      {orders.slice(0, 10).map((o) => (
                        <option key={o.id} value={o.code}>
                          {o.code} - {o.customer?.name || 'Khách lẻ'} ({o.total.toLocaleString()}đ)
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Mã QR Tra Cứu Tự Động</label>
                <div className="p-2 bg-slate-950 border border-slate-800 rounded-xl flex items-center space-x-2 text-slate-400 text-xs font-mono">
                  <QrCode className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="truncate text-[11px] text-slate-300">vietqr.me/warranty?...</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-4 pt-2 border-t border-slate-800/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>2. Thông Tin Khách Hàng</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Tên Khách Hàng <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                {effectiveCustomers.length > 0 && (
                  <select
                    onChange={(e) => handleSelectCustomer(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-1 text-[10px] text-slate-300 focus:outline-none mt-1"
                  >
                    <option value="">-- Chọn khách từ Master Data / CRM --</option>
                    {effectiveCustomers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} - {c.phone}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Số Điện Thoại <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0912 345 678"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Địa Chỉ Khách Hàng</label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Số nhà, đường, quận/huyện..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Condition, Accessories & Issue Description */}
          <div className="space-y-4 pt-2 border-t border-slate-800/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-2">
              <Wrench className="w-4 h-4" />
              <span>3. Tình Trạng Tiếp Nhận & Mô Tả Lỗi</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Phụ Kiện Kèm Theo</label>
                <input
                  type="text"
                  value={accessoriesIncluded}
                  onChange={(e) => setAccessoriesIncluded(e.target.value)}
                  placeholder="Thân máy, củ sạc, dây cáp..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Tình Trạng Ngoại Quan Khi Nhận</label>
                <input
                  type="text"
                  value={cosmeticCondition}
                  onChange={(e) => setCosmeticCondition(e.target.value)}
                  placeholder="Mới 95%, trầy xước nhẹ, tem niêm phong..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">
                  Mô Tả Hiện Tượng Lỗi / Yêu Cầu Bảo Dưỡng <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Mô tả cụ thể triệu chứng lỗi khách hàng gặp phải (VD: Không lên nguồn, đứt cáp tín hiệu, kẹt giấy in, bảo trì 6 tháng...)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Technician & Appointment */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Kỹ Thuật Viên Phụ Trách</label>
              <select
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Trần Văn Hưng (Kỹ Thuật Trưởng)">Trần Văn Hưng (Kỹ Thuật Trưởng)</option>
                <option value="Nguyễn Quốc Tuấn (Kỹ Thuật Viên)">Nguyễn Quốc Tuấn (Kỹ Thuật Viên)</option>
                <option value="Lê Hoàng Long (Kỹ Thuật Phần Cứng)">Lê Hoàng Long (Kỹ Thuật Phần Cứng)</option>
                <option value="Phạm Đức Minh (Kỹ Thuật Cơ Điện)">Phạm Đức Minh (Kỹ Thuật Cơ Điện)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Thời Gian Dự Kiến Xử Lý (Ngày)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={expectedDays}
                onChange={(e) => setExpectedDays(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Tiền Công Sửa Chữa (Nếu tính phí)</label>
              <input
                type="number"
                disabled={type === 'warranty'}
                value={type === 'warranty' ? 0 : laborCost}
                onChange={(e) => setLaborCost(Number(e.target.value))}
                placeholder="0 đ"
                className={`w-full border rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none ${
                  type === 'warranty'
                    ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-950 border-slate-800 text-emerald-400 focus:border-cyan-500'
                }`}
              />
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400">
            Tạm tính chi phí:{' '}
            <strong className="text-emerald-400 font-mono text-sm ml-1">
              {type === 'warranty' ? '0 đ (Miễn phí BH)' : formatVND(totalCost)}
            </strong>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-1.5 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Lập Phiếu Tiếp Nhận</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
