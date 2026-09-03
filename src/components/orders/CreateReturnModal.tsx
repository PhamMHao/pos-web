import React, { useState, useMemo } from 'react';
import {
  X,
  RotateCcw,
  Search,
  CheckCircle2,
  DollarSign,
  Package,
  AlertTriangle,
  ArrowRight,
  User,
  Phone,
  FileText,
  Boxes,
  Printer,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Banknote,
  MinusCircle,
  Barcode,
  QrCode,
  Sparkles,
} from 'lucide-react';
import {
  Order,
  Product,
  Customer,
  ReturnOrder,
  ReturnOrderItem,
  ReturnReason,
  ReturnDestination,
  RefundMethod,
  StoreSettings,
  SerialDeviceRecord,
} from '../../types';
import { formatVND } from '../../utils/vietqr';

interface CreateReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  products: Product[];
  customers: Customer[];
  serialRecords?: SerialDeviceRecord[];
  settings: StoreSettings;
  preSelectedOrder?: Order | null;
  onSaveReturn: (returnOrder: ReturnOrder) => Promise<void>;
}

interface ReturnItemSelection {
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  ratioToBase: number;
  originalQuantity: number;
  returnQuantity: number;
  unitPrice: number;
  refundUnitPrice: number;
  serialNumber?: string;
  condition: 'normal' | 'damaged' | 'unopened';
  selected: boolean;
}

export const CreateReturnModal: React.FC<CreateReturnModalProps> = ({
  isOpen,
  onClose,
  orders,
  products,
  customers,
  serialRecords = [],
  settings,
  preSelectedOrder,
  onSaveReturn,
}) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(preSelectedOrder || null);
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [serialSearchQuery, setSerialSearchQuery] = useState('');
  const [detectedSerialRecord, setDetectedSerialRecord] = useState<SerialDeviceRecord | null>(null);
  const [reason, setReason] = useState<ReturnReason>('customer_mind_change');
  const [destinationType, setDestinationType] = useState<ReturnDestination>('restock');
  const [refundMethod, setRefundMethod] = useState<RefundMethod>('cash');
  const [warehouse, setWarehouse] = useState('Kho Tổng Gia Phúc TP.HCM');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Return items selection state
  const [itemSelections, setItemSelections] = useState<ReturnItemSelection[]>(() => {
    if (preSelectedOrder && preSelectedOrder.items) {
      return preSelectedOrder.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        unit: item.unit,
        ratioToBase: item.ratioToBase || 1,
        originalQuantity: item.quantity,
        returnQuantity: item.quantity,
        unitPrice: item.unitPrice,
        refundUnitPrice: item.unitPrice,
        condition: 'normal',
        selected: true,
      }));
    }
    return [];
  });

  // Filter orders for quick lookup
  const filteredOrders = useMemo(() => {
    if (!orderSearchTerm.trim()) return orders.slice(0, 10);
    const term = orderSearchTerm.toLowerCase();
    return orders
      .filter(
        (o) =>
          o.code.toLowerCase().includes(term) ||
          (o.customer?.name && o.customer.name.toLowerCase().includes(term)) ||
          (o.customer?.phone && o.customer.phone.includes(term))
      )
      .slice(0, 10);
  }, [orders, orderSearchTerm]);

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setItemSelections(
      (order.items || []).map((item) => ({
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        unit: item.unit,
        ratioToBase: item.ratioToBase || 1,
        originalQuantity: item.quantity,
        returnQuantity: item.quantity,
        unitPrice: item.unitPrice,
        refundUnitPrice: item.unitPrice,
        condition: 'normal',
        selected: true,
      }))
    );
  };

  const handleToggleItem = (idx: number) => {
    setItemSelections((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleQuantityChange = (idx: number, qty: number) => {
    setItemSelections((prev) =>
      prev.map((item, i) => {
        if (i === idx) {
          const safeQty = Math.max(1, Math.min(item.originalQuantity, qty));
          return { ...item, returnQuantity: safeQty };
        }
        return item;
      })
    );
  };

  const handleRefundPriceChange = (idx: number, price: number) => {
    setItemSelections((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, refundUnitPrice: Math.max(0, price) } : item))
    );
  };

  const handleConditionChange = (idx: number, cond: 'normal' | 'damaged' | 'unopened') => {
    setItemSelections((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, condition: cond } : item))
    );
  };

  const handleSerialChange = (idx: number, serial: string) => {
    setItemSelections((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, serialNumber: serial } : item))
    );
  };

  const handleSerialLookup = (serialToFind: string) => {
    const term = serialToFind.trim().toLowerCase();
    if (!term) return;

    const matchedRec = serialRecords.find(
      (s) =>
        s.serialNumber.toLowerCase() === term ||
        s.serialNumber.toLowerCase().includes(term)
    );

    if (matchedRec) {
      setDetectedSerialRecord(matchedRec);
      if (matchedRec.soldOrderCode) {
        const order = orders.find((o) => o.code === matchedRec.soldOrderCode);
        if (order) {
          setSelectedOrder(order);
          setItemSelections(
            (order.items || []).map((item) => {
              const isTarget =
                item.sku.toLowerCase() === matchedRec.sku.toLowerCase() ||
                item.productName.toLowerCase().includes(matchedRec.productName.toLowerCase()) ||
                (item as any).serialNumber === matchedRec.serialNumber;
              return {
                productId: item.productId,
                productName: item.productName,
                sku: item.sku,
                unit: item.unit,
                ratioToBase: item.ratioToBase || 1,
                originalQuantity: item.quantity,
                returnQuantity: 1,
                unitPrice: item.unitPrice,
                refundUnitPrice: item.unitPrice,
                serialNumber: isTarget ? matchedRec.serialNumber : undefined,
                condition: 'normal',
                selected: isTarget,
              };
            })
          );
          return;
        }
      }
      alert(`Đã tìm thấy Serial: ${matchedRec.serialNumber} (${matchedRec.productName}) nhưng không tìm thấy mã đơn hàng ${matchedRec.soldOrderCode || 'N/A'} trong danh sách đơn.`);
    } else {
      alert(`Không tìm thấy thiết bị nào có số Serial/IMEI: "${serialToFind}" trong hệ thống!`);
    }
  };

  // Calculations
  const selectedItems = useMemo(() => itemSelections.filter((it) => it.selected), [itemSelections]);

  const totalReturnQty = useMemo(
    () => selectedItems.reduce((sum, it) => sum + it.returnQuantity, 0),
    [selectedItems]
  );

  const totalRefundAmount = useMemo(
    () => selectedItems.reduce((sum, it) => sum + it.returnQuantity * it.refundUnitPrice, 0),
    [selectedItems]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm cần trả hàng!');
      return;
    }

    setIsSubmitting(true);
    try {
      const code = `TH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString().slice(-4)}`;
      const returnItems: ReturnOrderItem[] = selectedItems.map((it) => ({
        originalOrderItemId: (it as any).originalOrderItemId || null,
        productId: it.productId,
        productName: it.productName,
        sku: it.sku,
        unit: it.unit,
        ratioToBase: it.ratioToBase,
        quantity: it.returnQuantity,
        costPrice: (it as any).costPrice || it.unitPrice || 0,
        unitPrice: it.unitPrice,
        refundUnitPrice: it.refundUnitPrice,
        totalRefund: it.returnQuantity * it.refundUnitPrice,
        serialNumber: it.serialNumber,
        condition: it.condition,
      }));

      const newReturnOrder: ReturnOrder = {
        id: `ret-${Date.now()}`,
        code,
        type: 'customer_return',
        originalOrderCode: selectedOrder?.code || null,
        originalOrderId: selectedOrder?.id || null,
        customerId: selectedOrder?.customer?.id || null,
        customerName: selectedOrder?.customer?.name || 'Khách lẻ',
        customerPhone: selectedOrder?.customer?.phone || null,
        warehouse,
        refundMethod,
        refundAmount: totalRefundAmount,
        totalReturnQuantity: totalReturnQty,
        reason,
        destinationType,
        status: 'completed',
        performedBy: 'Thu ngân',
        notes,
        createdAt: new Date().toISOString(),
        items: returnItems,
      };

      await onSaveReturn(newReturnOrder);
      onClose();
    } catch (err: any) {
      alert(`Lỗi khi tạo phiếu trả hàng: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Tạo Phiếu Trả Hàng & Hoàn Tiền (RMA)
              </h2>
              <p className="text-xs text-slate-400">
                Cho phép khách trả từng phần/toàn bộ đơn, tự động hoàn kho & hạch toán tiền hoàn
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Step 1: Chọn Đơn Hàng Gốc */}
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                1. Chọn Hóa Đơn Bán Hàng Gốc
              </label>
              {selectedOrder && (
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="text-xs text-rose-400 hover:underline flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Chọn đơn khác
                </button>
              )}
            </div>

            {!selectedOrder ? (
              <div className="space-y-3">
                {/* Fast Serial / IMEI Scanner */}
                <div className="bg-slate-900/90 p-3 rounded-xl border border-amber-500/30 space-y-2">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Barcode className="w-4 h-4 text-amber-400" />
                    <span>Quét mã Serial / IMEI thiết bị để tự động nhận diện đơn bán:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <QrCode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={serialSearchQuery}
                        onChange={(e) => setSerialSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSerialLookup(serialSearchQuery);
                          }
                        }}
                        placeholder="Quét hoặc nhập số Serial (VD: SN-..., IMEI-...)..."
                        className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSerialLookup(serialSearchQuery)}
                      className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 shrink-0 transition-colors"
                    >
                      <Search className="w-3.5 h-3.5" /> Tra Cứu Serial
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearchTerm}
                    onChange={(e) => setOrderSearchTerm(e.target.value)}
                    placeholder="Hoặc tìm theo mã đơn hàng (HD-...), tên khách, SĐT..."
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {filteredOrders.map((o) => (
                    <div
                      key={o.id}
                      onClick={() => handleSelectOrder(o)}
                      className="p-3 bg-slate-900/80 hover:bg-cyan-950/40 border border-slate-700/50 hover:border-cyan-500/50 rounded-xl cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-sm text-cyan-300 font-mono">{o.code}</div>
                        <div className="text-xs text-slate-400">
                          {o.customer?.name || 'Khách lẻ'} • {o.customer?.phone || 'Không có SĐT'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-emerald-400">{formatVND(o.total)}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(o.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {detectedSerialRecord && (
                  <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between text-xs text-emerald-300">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>
                        Nhận diện Serial: <strong className="font-mono text-white">{detectedSerialRecord.serialNumber}</strong> ({detectedSerialRecord.productName}) • Hạn BH: {new Date(detectedSerialRecord.warrantyExpiryDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono font-bold text-sm">
                      {selectedOrder.code.slice(-4)}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        <span>Đơn hàng: {selectedOrder.code}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                          Đã thanh toán {formatVND(selectedOrder.total)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                        <span>Khách: {selectedOrder.customer?.name || 'Khách lẻ'}</span>
                        {selectedOrder.customer?.phone && (
                          <span>• SĐT: {selectedOrder.customer.phone}</span>
                        )}
                        <span>• Ngày mua: {new Date(selectedOrder.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Danh sách món cần trả */}
          {selectedOrder && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-amber-400" />
                  2. Chọn Mặt Hàng Khách Muốn Trả & Điều Chỉnh Số Lượng
                </label>
                <span className="text-xs text-slate-400">
                  Đã chọn {selectedItems.length}/{itemSelections.length} mặt hàng
                </span>
              </div>

              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60 divide-y divide-slate-800">
                {itemSelections.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-4 transition-colors ${
                      item.selected ? 'bg-slate-800/40' : 'opacity-60 bg-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => handleToggleItem(idx)}
                        className="w-5 h-5 mt-1 rounded text-cyan-500 bg-slate-900 border-slate-700 focus:ring-cyan-500 focus:ring-offset-slate-900 cursor-pointer"
                      />
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div>
                            <span className="font-semibold text-white text-sm">{item.productName}</span>
                            <div className="text-xs text-slate-400 font-mono">
                              SKU: {item.sku} • ĐVT: {item.unit} • Đã mua: {item.originalQuantity} {item.unit}
                              {item.serialNumber && (
                                <span className="ml-2 text-amber-400 font-bold">
                                  • Serial: {item.serialNumber}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-sm font-bold text-amber-400 font-mono">
                            Đơn giá mua: {formatVND(item.unitPrice)}
                          </div>
                        </div>

                        {item.selected && (
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
                            <div>
                              <label className="text-[11px] text-slate-400 block mb-1">
                                Số lượng trả (Max {item.originalQuantity})
                              </label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min={1}
                                  max={item.originalQuantity}
                                  value={item.returnQuantity}
                                  onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono focus:border-cyan-500"
                                />
                                <span className="text-xs text-slate-400 shrink-0">{item.unit}</span>
                              </div>
                            </div>

                            <div>
                              <label className="text-[11px] text-slate-400 block mb-1">
                                Đơn giá hoàn lại (VNĐ)
                              </label>
                              <input
                                type="number"
                                min={0}
                                value={item.refundUnitPrice}
                                onChange={(e) => handleRefundPriceChange(idx, Number(e.target.value))}
                                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono focus:border-cyan-500"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] text-slate-400 block mb-1">
                                Số Serial / IMEI (Nếu có)
                              </label>
                              <input
                                type="text"
                                value={item.serialNumber || ''}
                                onChange={(e) => handleSerialChange(idx, e.target.value)}
                                placeholder="Quét/Nhập số Serial..."
                                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono placeholder-slate-600 focus:border-amber-500"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] text-slate-400 block mb-1">
                                Tình trạng hàng trả
                              </label>
                              <select
                                value={item.condition}
                                onChange={(e) =>
                                  handleConditionChange(idx, e.target.value as any)
                                }
                                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:border-cyan-500"
                              >
                                <option value="unopened">Nguyên seal / Chưa mở hộp</option>
                                <option value="normal">Đã mở / Còn mới đẹp</option>
                                <option value="damaged">Hàng lỗi / Hỏng kỹ thuật</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Thiết Lập Nghiệp Vụ Hoàn Tiền & Điểm Đến Kho */}
          {selectedOrder && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Lý do & Điểm đến kho */}
              <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 space-y-3">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  3. Lý Do & Kho Nhận Hàng Trả
                </label>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Lý do trả hàng</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:border-cyan-500"
                  >
                    <option value="customer_mind_change">Khách đổi ý / Không còn nhu cầu</option>
                    <option value="defective">Hàng lỗi kỹ thuật / Không hoạt động</option>
                    <option value="wrong_item">Nhân viên tư vấn/giao nhầm mã</option>
                    <option value="warranty_exchange">Đổi mới theo chính sách bảo hành</option>
                    <option value="other">Lý do khác</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Xử lý tồn kho hàng trả</label>
                  <select
                    value={destinationType}
                    onChange={(e) => setDestinationType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:border-cyan-500"
                  >
                    <option value="restock">
                      🟢 Nhập hoàn kho bán lẻ (Hàng tốt, tự động tăng tồn kho)
                    </option>
                    <option value="faulty_warehouse">
                      🔴 Chuyển kho Hàng Lỗi / Bảo hành (Không tăng tồn bán)
                    </option>
                    <option value="supplier_rma">
                      🟡 Giữ chờ xuất trả lại Nhà cung ứng (Supplier RMA)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Kho thực hiện</label>
                  <input
                    type="text"
                    value={warehouse}
                    onChange={(e) => setWarehouse(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Hình thức hoàn tiền */}
              <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 space-y-3">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-amber-400" />
                  4. Phương Thức Hoàn Tiền
                </label>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Hình thức hoàn trả</label>
                  <select
                    value={refundMethod}
                    onChange={(e) => setRefundMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:border-cyan-500"
                  >
                    <option value="cash">💵 Tiền mặt (Tự động tạo Phiếu Chi Kế Toán)</option>
                    <option value="transfer">💳 Chuyển khoản (Tự động tạo Phiếu Chi Kế Toán)</option>
                    <option value="debt_deduct">
                      📉 Cấn trừ giảm công nợ khách hàng (Nếu có nợ)
                    </option>
                    <option value="no_refund">🔄 Không hoàn tiền (Đổi ngang sản phẩm khác)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Ghi chú phiếu trả hàng</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ghi chú chi tiết tình trạng máy, lý do trả hàng..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:border-cyan-500 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Summary Box */}
          {selectedOrder && (
            <div className="bg-gradient-to-r from-amber-500/10 via-slate-800 to-emerald-500/10 p-5 rounded-2xl border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-xs text-slate-400">Tổng số lượng món trả lại:</div>
                <div className="text-lg font-bold text-white flex items-center gap-1.5">
                  <Package className="w-5 h-5 text-amber-400" />
                  {totalReturnQty} sản phẩm
                </div>
              </div>

              <div className="sm:text-right">
                <div className="text-xs text-slate-400">Tổng tiền hoàn trả khách:</div>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  {formatVND(totalRefundAmount)}
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium text-sm transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedOrder || selectedItems.length === 0}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              {isSubmitting ? 'Đang xử lý...' : 'Xác Nhận Tạo Phiếu Trả Hàng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
