import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Boxes,
  Barcode,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Warehouse,
  User,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Truck,
  Sparkles,
  Printer,
  ShieldCheck,
  PackageMinus,
  Check,
} from 'lucide-react';
import {
  Order,
  Product,
  SerialDeviceRecord,
  StoreSettings,
  StockGoodsIssue,
  StockGoodsIssueItem,
} from '../../types';
import { formatVND } from '../../utils/vietqr';
import { sounds } from '../../utils/soundEffects';

interface NewStockGoodsIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  products: Product[];
  serialRecords?: SerialDeviceRecord[];
  settings?: StoreSettings;
  preselectedOrder?: Order | null;
  onSaveIssue: (issue: Partial<StockGoodsIssue>, options?: { printAfterSave?: boolean }) => Promise<void>;
  currentUserName?: string;
}

export const NewStockGoodsIssueModal: React.FC<NewStockGoodsIssueModalProps> = ({
  isOpen,
  onClose,
  orders = [],
  products = [],
  serialRecords = [],
  settings,
  preselectedOrder = null,
  onSaveIssue,
  currentUserName = 'Nguyễn Văn Minh (Thủ Kho)',
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [issueCode, setIssueCode] = useState<string>('');
  const [dispatchedAt, setDispatchedAt] = useState<string>(new Date().toISOString().slice(0, 10));
  const [warehouseName, setWarehouseName] = useState<string>('Kho Chính Gia Phúc Computer');
  const [dispatchedBy, setDispatchedBy] = useState<string>(currentUserName);
  const [issueNotes, setIssueNotes] = useState<string>('');
  const [printAfterSave, setPrintAfterSave] = useState<boolean>(true);
  const [filterPendingOnly, setFilterPendingOnly] = useState<boolean>(true);

  // Customer info
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [orderCode, setOrderCode] = useState<string>('');

  // Items in the issue
  const [items, setItems] = useState<StockGoodsIssueItem[]>([]);

  // Barcode scanner input
  const [scannerInput, setScannerInput] = useState<string>('');
  const [scanMessage, setScanMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const scannerInputRef = useRef<HTMLInputElement>(null);

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Available orders for selection
  const availableOrders = useMemo(() => {
    if (!filterPendingOnly) return orders;
    return orders.filter(
      (o) => o.outboundStatus !== 'dispatched' && o.status !== 'cancelled' && o.status !== 'refunded'
    );
  }, [orders, filterPendingOnly]);

  // Available serials in stock (status === 'in_stock')
  const inStockSerials = useMemo(() => {
    return serialRecords.filter((s) => s.status === 'in_stock' || !s.status);
  }, [serialRecords]);

  // Initialize
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const codeDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
      const randomSuffix = String(Math.floor(100 + Math.random() * 900));
      setIssueCode(`XK-${codeDate}-${randomSuffix}`);
      setDispatchedAt(now.toISOString().slice(0, 10));
      setWarehouseName(settings?.defaultWarehouse || 'Kho Chính Gia Phúc Computer');
      setDispatchedBy(currentUserName);
      setIssueNotes('');
      setScanMessage(null);
      setScannerInput('');

      if (preselectedOrder) {
        handleSelectOrder(preselectedOrder.id);
      } else if (availableOrders.length > 0) {
        handleSelectOrder(availableOrders[0].id);
      } else {
        setItems([]);
        setSelectedOrderId('');
        setCustomerName('');
        setCustomerPhone('');
        setCustomerAddress('');
        setOrderCode('');
      }
    }
  }, [isOpen, preselectedOrder, availableOrders, settings, currentUserName]);

  // Handle selecting an order
  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    if (!orderId) return;

    const ord = orders.find((o) => o.id === orderId);
    if (!ord) return;

    setOrderCode(ord.code);
    setCustomerName(ord.customer?.name || ord.recipientName || 'Khách Mua Hàng');
    setCustomerPhone(ord.customer?.phone || ord.recipientPhone || '');
    setCustomerAddress(ord.customer?.address || ord.recipientAddress || '');
    setIssueNotes(`Xuất kho giao hàng theo đơn ${ord.code}`);

    const mappedItems: StockGoodsIssueItem[] = ord.items.map((it) => {
      const matchedProd = products.find((p) => p.id === it.productId || p.sku === it.sku);
      return {
        productId: it.productId,
        productName: it.productName,
        sku: it.sku,
        unit: it.unit || 'Cái',
        quantity: it.quantity,
        serials: it.serials ? [...it.serials] : [],
        warrantyMonths: it.warrantyPeriodMonths || matchedProd?.warrantyMonths || 24,
        notes: '',
      };
    });

    setItems(mappedItems);
    sounds.notification();
  };

  // Process barcode scanner input
  const handleProcessScan = () => {
    const raw = scannerInput.trim().toUpperCase();
    if (!raw) return;

    // 1. Check if the scanned serial exists in database
    const matchedSerialRecord = serialRecords.find(
      (s) => s.serialNumber.trim().toUpperCase() === raw
    );

    // 2. Check if serial is already in stock or sold
    if (matchedSerialRecord && matchedSerialRecord.status === 'sold') {
      setScanMessage({
        type: 'error',
        text: `Mã Serial "${raw}" đã được xuất bán trước đó cho đơn ${matchedSerialRecord.soldOrderCode || 'cũ'}!`,
      });
      sounds.error();
      setScannerInput('');
      return;
    }

    if (matchedSerialRecord && matchedSerialRecord.status === 'defective') {
      setScanMessage({
        type: 'error',
        text: `Mã Serial "${raw}" đang ở trạng thái LỖI / BẢO HÀNH, không thể xuất kho!`,
      });
      sounds.error();
      setScannerInput('');
      return;
    }

    // 3. Find which item in the current order matches this serial
    let targetItemIndex = -1;

    if (matchedSerialRecord) {
      targetItemIndex = items.findIndex(
        (it) => it.productId === matchedSerialRecord.productId || it.sku === matchedSerialRecord.sku
      );
    }

    // If not matched by exact serial record, check if serial is scanned directly for the first item still needing serials
    if (targetItemIndex === -1) {
      targetItemIndex = items.findIndex((it) => (it.serials?.length || 0) < it.quantity);
    }

    if (targetItemIndex === -1) {
      setScanMessage({
        type: 'error',
        text: `Tất cả mặt hàng trong đơn ${orderCode} đã quét đủ số lượng Serial!`,
      });
      sounds.error();
      setScannerInput('');
      return;
    }

    const targetItem = items[targetItemIndex];
    const currentSerials = targetItem.serials || [];

    // Check duplicate in same order
    if (currentSerials.includes(raw) || items.some((it) => it.serials?.includes(raw))) {
      setScanMessage({
        type: 'error',
        text: `Mã Serial "${raw}" đã được quét trong đơn hàng này!`,
      });
      sounds.error();
      setScannerInput('');
      return;
    }

    // Append serial
    const updated = [...items];
    updated[targetItemIndex] = {
      ...targetItem,
      serials: [...currentSerials, raw],
    };

    setItems(updated);
    setScanMessage({
      type: 'success',
      text: `Đã quét thành công Serial "${raw}" cho mặt hàng "${targetItem.productName}" (${updated[targetItemIndex].serials?.length}/${targetItem.quantity})`,
    });
    setScannerInput('');
    sounds.beep();
  };

  // Remove serial from item
  const handleRemoveSerialFromItem = (itemIndex: number, serialIndex: number) => {
    const updated = [...items];
    const target = updated[itemIndex];
    const filteredSerials = (target.serials || []).filter((_, i) => i !== serialIndex);
    updated[itemIndex] = { ...target, serials: filteredSerials };
    setItems(updated);
  };

  // Quick pick serial from in-stock list for an item
  const handlePickSerialFromStock = (itemIndex: number, serial: string) => {
    const target = items[itemIndex];
    const currentSerials = target.serials || [];
    if (currentSerials.includes(serial)) return;
    if (currentSerials.length >= target.quantity) {
      alert(`Mặt hàng "${target.productName}" đã quét đủ ${target.quantity} Serial!`);
      return;
    }

    const updated = [...items];
    updated[itemIndex] = {
      ...target,
      serials: [...currentSerials, serial],
    };
    setItems(updated);
    sounds.beep();
  };

  // Total calculations
  const totalItemsCount = items.length;
  const totalQuantity = items.reduce((sum, it) => sum + it.quantity, 0);
  const totalScannedSerials = items.reduce((sum, it) => sum + (it.serials?.length || 0), 0);
  const allSerialsComplete = items.every((it) => (it.serials?.length || 0) >= it.quantity);

  // Submit Goods Issue
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCode) {
      alert('Vui lòng chọn Hóa Đơn Bán Hàng cần xuất kho!');
      return;
    }

    if (items.length === 0) {
      alert('Đơn hàng không có mặt hàng nào để xuất kho!');
      return;
    }

    if (!allSerialsComplete) {
      const confirmContinue = window.confirm(
        `Chưa quét đủ 100% số Serial (${totalScannedSerials}/${totalQuantity} Serial). Bạn có chắc chắn muốn xuất kho đơn này?`
      );
      if (!confirmContinue) return;
    }

    const payload: Partial<StockGoodsIssue> = {
      code: issueCode,
      orderId: selectedOrderId || undefined,
      orderCode: orderCode,
      customerName: customerName,
      customerPhone: customerPhone || undefined,
      customerAddress: customerAddress || undefined,
      warehouseName: warehouseName,
      dispatchedBy: dispatchedBy,
      dispatchedAt: dispatchedAt,
      totalQuantity: totalQuantity,
      totalItemsCount: totalItemsCount,
      status: 'completed',
      notes: issueNotes.trim() || undefined,
      items: items,
    };

    try {
      setIsSubmitting(true);
      await onSaveIssue(payload, { printAfterSave });
      sounds.success();
      onClose();
    } catch (err: any) {
      alert(`Lỗi khi xuất kho: ${err.message || 'Không xác định'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col max-h-[96vh] text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER BAR */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10">
              <PackageMinus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white tracking-wide">
                  Lập Phiếu Xuất Kho Bán Hàng (Outbound Stock Dispatch)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-blue-950 text-blue-400 border border-blue-700/50 shadow-inner">
                  {issueCode}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Load thông tin từ Hóa Đơn Bán Hàng • Quét súng Barcode kiểm tra Serial trong kho & Tự động kích hoạt bảo hành
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

        {/* BODY CONTAINER */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TOP 2 CARDS: 1. CHỌN HÓA ĐƠN | 2. THÔNG TIN KHÁCH & KHO */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* 1. CHỌN HÓA ĐƠN BÁN HÀNG (6 COLUMNS) */}
            <div className="lg:col-span-6 bg-slate-800/60 border border-slate-700/70 rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-sky-400">
                  <FileText className="w-4 h-4" />
                  <span>1. HÓA ĐƠN BÁN HÀNG THAM CHIẾU</span>
                </div>
                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterPendingOnly}
                    onChange={(e) => setFilterPendingOnly(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-blue-500 focus:ring-0"
                  />
                  <span>Chỉ đơn chờ xuất</span>
                </label>
              </div>

              <div>
                <select
                  value={selectedOrderId}
                  onChange={(e) => handleSelectOrder(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="">-- Chọn đơn hàng / hóa đơn cần xuất kho --</option>
                  {availableOrders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.code} - {o.customer?.name || o.recipientName || 'Khách lẻ'} ({o.items.length} món - {formatVND(o.total)})
                    </option>
                  ))}
                </select>
              </div>

              {selectedOrderId && (
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mã đơn hàng:</span>
                    <span className="text-blue-400 font-mono font-bold">{orderCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Khách hàng:</span>
                    <span className="text-white font-semibold">{customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Số điện thoại:</span>
                    <span className="text-slate-300 font-mono">{customerPhone || 'N/A'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. KHO XUẤT & NGƯỜI THỰC HIỆN (6 COLUMNS) */}
            <div className="lg:col-span-6 bg-slate-800/60 border border-slate-700/70 rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                <Warehouse className="w-4 h-4" />
                <span>2. KHO XUẤT & THỦ KHO BÀN GIAO</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-0.5">Ngày xuất kho:</label>
                  <input
                    type="date"
                    value={dispatchedAt}
                    onChange={(e) => setDispatchedAt(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-0.5">Kho xuất hàng:</label>
                  <select
                    value={warehouseName}
                    onChange={(e) => setWarehouseName(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    {(settings?.warehouseList || [
                      'Kho Chính Gia Phúc Computer',
                      'Kho Kỹ Thuật & Showroom',
                      'Kho Chi Nhánh TP.HCM',
                      'Kho Chi Nhánh Bình Dương',
                      'Kho Bảo Hành & Linh Kiện',
                    ]).map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-0.5">Thủ kho xuất hàng:</label>
                  <input
                    type="text"
                    value={dispatchedBy}
                    onChange={(e) => setDispatchedBy(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-0.5">Địa chỉ giao hàng:</label>
                  <input
                    type="text"
                    placeholder="Địa chỉ khách hàng"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* SECTION 2: BARCODE GUN SCANNER INPUT */}
          <div className="bg-slate-950/80 border-2 border-blue-500/50 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Barcode className="w-5 h-5 text-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white">
                  Súng Quét Mã Vạch Serial Thiết Bị Xuất Kho
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Tiến độ: <span className="text-emerald-400 font-bold">{totalScannedSerials}</span> /{' '}
                <span className="text-white font-bold">{totalQuantity}</span> serial
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  ref={scannerInputRef}
                  type="text"
                  placeholder="🔫 Cầm súng bắn mã vạch vào tem Serial trên vỏ hộp / thiết bị rồi nhấn Enter..."
                  value={scannerInput}
                  onChange={(e) => setScannerInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleProcessScan();
                    }
                  }}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                />
              </div>
              <button
                type="button"
                onClick={handleProcessScan}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20"
              >
                + Quét Mã
              </button>
            </div>

            {scanMessage && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  scanMessage.type === 'success'
                    ? 'bg-emerald-950/60 border border-emerald-700 text-emerald-300'
                    : 'bg-rose-950/60 border border-rose-700 text-rose-300'
                }`}
              >
                {scanMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                )}
                <span>{scanMessage.text}</span>
              </div>
            )}
          </div>

          {/* SECTION 3: ITEMS LIST & SERIAL ATTACHMENT */}
          <div className="bg-slate-800/40 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Boxes className="w-4 h-4 text-emerald-400" />
              <span>Danh Sách Mặt Hàng Xuất Kho ({items.length} món)</span>
            </h3>

            <div className="space-y-3">
              {items.length === 0 ? (
                <div className="py-8 text-center text-slate-500 italic">
                  Chưa chọn đơn hàng nào để xuất kho.
                </div>
              ) : (
                items.map((item, idx) => {
                  const scannedCount = item.serials?.length || 0;
                  const isComplete = scannedCount >= item.quantity;
                  
                  // In-stock serials matching this product
                  const matchingStockSerials = inStockSerials.filter(
                    (s) => s.productId === item.productId || s.sku === item.sku
                  );

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition-all ${
                        isComplete
                          ? 'bg-emerald-950/20 border-emerald-700/50'
                          : 'bg-slate-900/70 border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-slate-400">#{idx + 1}</span>
                            <span className="font-bold text-white text-sm">{item.productName}</span>
                            <span className="text-xs font-mono text-slate-400">({item.sku})</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Bảo hành: <span className="text-emerald-400 font-semibold">{item.warrantyMonths || 24} tháng</span> • ĐVT: {item.unit}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                              isComplete
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {isComplete ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                            <span>
                              {scannedCount} / {item.quantity} Serial
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Chips of Scanned Serials */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {(item.serials || []).map((sn, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-blue-950 text-blue-200 border border-blue-800/60 flex items-center gap-1.5 shadow-sm"
                            >
                              <span className="text-blue-400">#{sIdx + 1}</span>
                              <span>{sn}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSerialFromItem(idx, sIdx)}
                                className="hover:text-rose-400 text-slate-400"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>

                        {/* Quick Pick dropdown from in-stock serials */}
                        {matchingStockSerials.length > 0 && !isComplete && (
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[11px] text-slate-400">Chọn nhanh từ kho ({matchingStockSerials.length} mã sẵn):</span>
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  handlePickSerialFromStock(idx, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                              className="px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200"
                            >
                              <option value="">-- Chọn số Serial có sẵn --</option>
                              {matchingStockSerials
                                .filter((s) => !item.serials?.includes(s.serialNumber))
                                .map((s) => (
                                  <option key={s.id} value={s.serialNumber}>
                                    {s.serialNumber} {s.storageLocation ? `(Kệ: ${s.storageLocation})` : ''}
                                  </option>
                                ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* FOOTER BAR: SUMMARY & SUBMIT */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            
            <div className="flex-1 space-y-2">
              <input
                type="text"
                placeholder="Ghi chú phiếu xuất kho..."
                value={issueNotes}
                onChange={(e) => setIssueNotes(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={printAfterSave}
                  onChange={(e) => setPrintAfterSave(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-blue-500 focus:ring-0"
                />
                <Printer className="w-3.5 h-3.5 text-blue-400" />
                <span>In Phiếu Xuất Kho & Biên Bản Bàn Giao Thiết Bị sau khi lưu</span>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Đang xuất kho...' : '💾 Xác Nhận Xuất Kho & Kích Hoạt BH'}</span>
              </button>
            </div>

          </div>

        </form>

      </div>
    </div>
  );
};
