import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Boxes,
  Barcode,
  Check,
  Printer,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  Truck,
  User,
  Phone,
  MapPin,
  Calendar,
  FileText,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  Order,
  Product,
  SerialDeviceRecord,
  StockOutboundNote,
} from '../../types';
import { formatVND } from '../../utils/vietqr';
import {
  checkSerialAvailability,
  executeSalesOutboundTransaction,
  OutboundTransactionResult,
  dispatchSalesOrderCompletedEvent,
} from '../../utils/serialTransactionManager';

interface OrderOutboundDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  products: Product[];
  serialRecords?: SerialDeviceRecord[];
  onConfirmOutbound: (result: OutboundTransactionResult) => void;
  onPrintDeliveryNote?: (order: Order) => void;
  currentUserName?: string;
}

export const OrderOutboundDispatchModal: React.FC<OrderOutboundDispatchModalProps> = ({
  isOpen,
  onClose,
  order,
  products,
  serialRecords = [],
  onConfirmOutbound,
  onPrintDeliveryNote,
  currentUserName = 'Thủ Kho Trưởng',
}) => {
  // Map of productId -> serials[]
  const [itemSerialsMap, setItemSerialsMap] = useState<Record<string, string[]>>({});
  const [currentInputs, setCurrentInputs] = useState<Record<string, string>>({});
  const [errorMessages, setErrorMessages] = useState<Record<string, string | null>>({});
  const [warehouseName, setWarehouseName] = useState('Kho Chính Gia Phúc Computer');
  const [dispatchNote, setDispatchNote] = useState('');
  const [dispatchedSuccessNote, setDispatchedSuccessNote] = useState<StockOutboundNote | null>(null);

  useEffect(() => {
    if (isOpen && order) {
      const initialMap: Record<string, string[]> = {};
      const initialInputs: Record<string, string> = {};
      const initialErrors: Record<string, string | null> = {};

      order.items.forEach((it) => {
        initialMap[it.productId] = it.serials ? [...it.serials] : [];
        initialInputs[it.productId] = '';
        initialErrors[it.productId] = null;
      });

      setItemSerialsMap(initialMap);
      setCurrentInputs(initialInputs);
      setErrorMessages(initialErrors);
      setDispatchNote(order.note || `Xuất kho giao hàng theo đơn ${order.code}`);
      setDispatchedSuccessNote(null);
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const handleAddSerial = (productId: string, requiredQty: number) => {
    const rawInput = currentInputs[productId] || '';
    const cleanSerial = rawInput.trim().toUpperCase();
    if (!cleanSerial) return;

    const currentList = itemSerialsMap[productId] || [];

    if (currentList.length >= requiredQty) {
      setErrorMessages((prev) => ({
        ...prev,
        [productId]: `Đã quét đủ ${requiredQty}/${requiredQty} số Serial cho mặt hàng này!`,
      }));
      return;
    }

    if (currentList.some((s) => s.toUpperCase() === cleanSerial)) {
      setErrorMessages((prev) => ({
        ...prev,
        [productId]: `Số Serial "${cleanSerial}" đã có trong danh sách!`,
      }));
      return;
    }

    const check = checkSerialAvailability(cleanSerial, serialRecords, order.code);
    if (!check.available) {
      setErrorMessages((prev) => ({
        ...prev,
        [productId]: check.reason || `Serial "${cleanSerial}" không khả dụng!`,
      }));
      return;
    }

    setItemSerialsMap((prev) => ({
      ...prev,
      [productId]: [...currentList, cleanSerial],
    }));

    setCurrentInputs((prev) => ({ ...prev, [productId]: '' }));
    setErrorMessages((prev) => ({ ...prev, [productId]: null }));
  };

  const handleRemoveSerial = (productId: string, indexToRemove: number) => {
    setItemSerialsMap((prev) => ({
      ...prev,
      [productId]: (prev[productId] || []).filter((_, idx) => idx !== indexToRemove),
    }));
    setErrorMessages((prev) => ({ ...prev, [productId]: null }));
  };

  const handleConfirm = () => {
    // Check if all items with serials have enough serials
    for (const it of order.items) {
      const currentList = itemSerialsMap[it.productId] || [];
      if (currentList.length > 0 && currentList.length < it.quantity) {
        if (!window.confirm(`Mặt hàng "${it.productName}" mới quét ${currentList.length}/${it.quantity} Serial. Bạn có chắc muốn tiếp tục xuất kho?`)) {
          return;
        }
      }
    }

    const enrichedOrder: Order = {
      ...order,
      items: order.items.map((it) => ({
        ...it,
        serials: itemSerialsMap[it.productId] && itemSerialsMap[it.productId].length > 0
          ? itemSerialsMap[it.productId]
          : it.serials,
      })),
    };

    const result = executeSalesOutboundTransaction({
      order: enrichedOrder,
      products,
      serialRecords,
      dispatchedBy: currentUserName,
      warehouseName,
      notes: dispatchNote,
    });

    if (!result.success) {
      alert(`Lỗi xuất kho: ${result.error}`);
      return;
    }

    setDispatchedSuccessNote(result.outboundNote || null);
    onConfirmOutbound(result);

    // Trigger non-blocking event
    if (result.updatedOrder) {
      dispatchSalesOrderCompletedEvent(result.updatedOrder);
    }
  };

  const isAlreadyDispatched = order.outboundStatus === 'dispatched';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">Xuất Kho & Quản Lý Serial Đơn Hàng</h3>
                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/15 px-2 py-0.5 rounded-full border border-indigo-500/30">
                  {order.code}
                </span>
                {isAlreadyDispatched && (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    ✓ Đã xuất kho
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Kiểm tra hàng hóa, quét số Serial/IMEI thực tế và xác nhận xuất kho
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Order Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-1">
              <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-bold">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>Khách hàng / Đối tác:</span>
              </div>
              <p className="text-xs font-bold text-white truncate">
                {order.customer?.name || 'Khách Lẻ Mua Tại Quầy'}
              </p>
              {order.customer?.phone && (
                <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                  <Phone className="w-3 h-3 text-slate-500" />
                  <span>{order.customer.phone}</span>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-1">
              <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-bold">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Địa chỉ giao hàng:</span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-2">
                {order.customer?.address || 'Nhận trực tiếp tại showroom'}
              </p>
            </div>

            <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-1">
              <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-bold">
                <Boxes className="w-3.5 h-3.5 text-purple-400" />
                <span>Kho xuất hàng & Thủ kho:</span>
              </div>
              <p className="text-xs font-bold text-slate-200 truncate">{warehouseName}</p>
              <p className="text-[11px] text-slate-400">Thủ kho: {currentUserName}</p>
            </div>
          </div>

          {/* Success Banner if completed */}
          {dispatchedSuccessNote && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>GIAO DỊCH XUẤT KHO THÀNH CÔNG (Mã Phiếu: {dispatchedSuccessNote.code})</span>
              </div>
              <p className="text-xs text-slate-300">
                Toàn bộ tồn kho đã được trừ chính xác, các số Serial đã được kích hoạt bảo hành điện tử và sẵn sàng bàn giao.
              </p>
            </div>
          )}

          {/* Order Items & Serial Scanners */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Danh Sách Sản Phẩm Cần Xuất ({order.items.length} món):
              </h4>
              <span className="text-[11px] text-slate-400">
                Tổng số lượng: <strong className="text-white">{order.items.reduce((s, i) => s + i.quantity, 0)}</strong>
              </span>
            </div>

            <div className="space-y-3">
              {order.items.map((item, idx) => {
                const serials = itemSerialsMap[item.productId] || [];
                const inputVal = currentInputs[item.productId] || '';
                const errorMsg = errorMessages[item.productId];
                const isItemComplete = serials.length >= item.quantity;

                // Serials available in stock for this product
                const inStockSerials = serialRecords.filter((s) => {
                  const isSame = s.productId === item.productId || s.sku === item.sku;
                  const isInStock = !s.status || s.status === 'in_stock';
                  const notSelected = !serials.some((sn) => sn.toUpperCase() === s.serialNumber.toUpperCase());
                  return isSame && isInStock && notSelected;
                });

                return (
                  <div
                    key={item.productId || idx}
                    className="p-4 bg-slate-800/40 border border-slate-700/70 rounded-2xl space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-slate-400">#{idx + 1}</span>
                          <h5 className="text-xs font-bold text-white">{item.productName}</h5>
                          <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                            {item.sku}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Đơn giá: {formatVND(item.unitPrice)} | ĐVT: {item.unit || 'Cái'}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold text-white">
                          SL yêu cầu: <span className="text-emerald-400 text-sm font-mono">{item.quantity}</span> {item.unit || 'Cái'}
                        </div>
                        <div className="mt-0.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isItemComplete
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            }`}
                          >
                            {serials.length}/{item.quantity} Serial
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Serial Input & Scanned chips */}
                    <div className="pt-2 border-t border-slate-700/50 space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="relative flex-1">
                          <Barcode className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={inputVal}
                            onChange={(e) =>
                              setCurrentInputs((prev) => ({
                                ...prev,
                                [item.productId]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddSerial(item.productId, item.quantity);
                              }
                            }}
                            placeholder="Quét mã vạch Serial hoặc nhập số Serial (Enter)..."
                            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-blue-500 uppercase"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddSerial(item.productId, item.quantity)}
                          disabled={!inputVal.trim() || serials.length >= item.quantity}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl flex items-center space-x-1 cursor-pointer transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Gán</span>
                        </button>
                      </div>

                      {errorMsg && (
                        <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-[11px] flex items-center space-x-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errorMsg}</span>
                        </div>
                      )}

                      {/* Scanned serial chips */}
                      {serials.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {serials.map((sn, snIdx) => (
                            <div
                              key={snIdx}
                              className="flex items-center space-x-1 px-2 py-0.5 bg-indigo-500/15 border border-indigo-500/30 rounded-lg text-xs font-mono font-bold text-indigo-300"
                            >
                              <span>{sn}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSerial(item.productId, snIdx)}
                                className="text-slate-400 hover:text-rose-400 ml-1 p-0.5 rounded cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* In-stock hints */}
                      {inStockSerials.length > 0 && serials.length < item.quantity && (
                        <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 overflow-x-auto py-1">
                          <span className="shrink-0 text-cyan-400 font-bold">Gợi ý từ kho:</span>
                          {inStockSerials.slice(0, 5).map((rec) => (
                            <button
                              key={rec.id}
                              type="button"
                              onClick={() => {
                                setCurrentInputs((prev) => ({
                                  ...prev,
                                  [item.productId]: rec.serialNumber,
                                }));
                                setTimeout(() => {
                                  handleAddSerial(item.productId, item.quantity);
                                }, 50);
                              }}
                              className="px-2 py-0.5 bg-slate-900 hover:bg-cyan-600/30 hover:text-cyan-300 text-slate-300 rounded border border-slate-700 font-mono text-[10px] cursor-pointer shrink-0 transition-colors"
                            >
                              {rec.serialNumber} {rec.warehouseLocation ? `(${rec.warehouseLocation})` : ''}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Outbound Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              Ghi chú xuất kho & Bàn giao:
            </label>
            <input
              type="text"
              value={dispatchNote}
              onChange={(e) => setDispatchNote(e.target.value)}
              placeholder="VD: Giao nhà xe Tiến Oanh, kèm 2 thùng cáp mạng..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl cursor-pointer transition-colors"
          >
            Đóng
          </button>

          <div className="flex items-center space-x-2">
            {onPrintDeliveryNote && (
              <button
                type="button"
                onClick={() => onPrintDeliveryNote(order)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-650 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>In Phiếu Xuất Kho Kiêm Bàn Giao</span>
              </button>
            )}

            {dispatchedSuccessNote ? (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 flex items-center space-x-1.5 cursor-pointer transition-all animate-pulse"
              >
                <Check className="w-4 h-4" />
                <span>✓ Hoàn Tất & Về Quản Lý Sản Phẩm</span>
              </button>
            ) : !isAlreadyDispatched ? (
              <button
                type="button"
                onClick={handleConfirm}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/25 flex items-center space-x-1.5 cursor-pointer transition-all"
              >
                <Check className="w-4 h-4" />
                <span>✓ Xác Nhận Xuất Kho & Cấp Bảo Hành</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-emerald-750 hover:bg-emerald-650 text-emerald-100 font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Đã Xuất Kho (Quay Về)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
