import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Barcode,
  Check,
  Plus,
  Trash2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Boxes,
  Search,
  CheckCircle2,
  RefreshCw,
  QrCode,
  Lock,
} from 'lucide-react';
import { CartItem, SerialDeviceRecord } from '../../types';
import { checkSerialAvailability } from '../../utils/serialTransactionManager';

interface SerialInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItem: CartItem | null;
  serialRecords?: SerialDeviceRecord[];
  onSaveSerials: (serials: string[]) => void;
}

export const SerialInputModal: React.FC<SerialInputModalProps> = ({
  isOpen,
  onClose,
  cartItem,
  serialRecords = [],
  onSaveSerials,
}) => {
  const [serials, setSerials] = useState<string[]>([]);
  const [inputSerial, setInputSerial] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const requiredQuantity = cartItem?.quantity || 1;

  useEffect(() => {
    if (isOpen && cartItem) {
      setSerials(cartItem.serials ? [...cartItem.serials] : []);
      setInputSerial('');
      setErrorMessage(null);
      setStockSearchQuery('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, cartItem]);

  if (!isOpen || !cartItem) return null;

  // Lấy danh sách Serial đang có sẵn trong kho của sản phẩm này
  const inStockSerialsForProduct = serialRecords.filter((s) => {
    const isSameProduct =
      s.productId === cartItem.product.id ||
      s.sku.toLowerCase() === cartItem.product.sku.toLowerCase() ||
      s.productName.toLowerCase().includes(cartItem.product.name.toLowerCase());
    const isInStock = !s.status || s.status === 'in_stock';
    const notAlreadySelected = !serials.some(
      (sn) => sn.trim().toUpperCase() === s.serialNumber.trim().toUpperCase()
    );
    const matchQuery =
      !stockSearchQuery ||
      s.serialNumber.toLowerCase().includes(stockSearchQuery.toLowerCase()) ||
      (s.warehouseLocation && s.warehouseLocation.toLowerCase().includes(stockSearchQuery.toLowerCase()));

    return isSameProduct && isInStock && notAlreadySelected && matchQuery;
  });

  const handleAddSerial = (rawSerial: string) => {
    const cleanSerial = rawSerial.trim().toUpperCase();
    if (!cleanSerial) return;

    // Kiểm tra đã quét đủ số lượng chưa
    if (serials.length >= requiredQuantity) {
      setErrorMessage(`Đã quét đủ số lượng yêu cầu (${requiredQuantity}/${requiredQuantity}). Vui lòng xóa bớt nếu muốn đổi số Serial.`);
      return;
    }

    // Kiểm tra trùng lặp trong danh sách đang quét
    if (serials.some((s) => s.toUpperCase() === cleanSerial)) {
      setErrorMessage(`Số Serial "${cleanSerial}" đã có trong danh sách!`);
      return;
    }

    // Kiểm tra khả dụng từ hệ thống (Concurrency Lock & Trạng thái tồn kho)
    const check = checkSerialAvailability(cleanSerial, serialRecords);
    if (!check.available) {
      setErrorMessage(check.reason || `Serial "${cleanSerial}" không khả dụng để xuất bán!`);
      return;
    }

    setSerials([...serials, cleanSerial]);
    setInputSerial('');
    setErrorMessage(null);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSerial(inputSerial);
    }
  };

  const handleRemoveSerial = (indexToRemove: number) => {
    setSerials(serials.filter((_, idx) => idx !== indexToRemove));
    setErrorMessage(null);
    inputRef.current?.focus();
  };

  const handleSave = () => {
    if (serials.length < requiredQuantity) {
      if (!window.confirm(`Bạn mới gán ${serials.length}/${requiredQuantity} số Serial. Bạn có chắc muốn lưu danh sách này không?`)) {
        return;
      }
    }
    onSaveSerials(serials);
    onClose();
  };

  const isComplete = serials.length === requiredQuantity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">Quét & Gán Số Serial / IMEI</h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isComplete
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {serials.length}/{requiredQuantity} Serial
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-sm mt-0.5">
                {cartItem.product.name} ({cartItem.selectedUOM || cartItem.product.unit})
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

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Scanner Input Row */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">
              Quét mã vạch hoặc nhập số Serial (Enter để thêm):
            </label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Barcode className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={inputRef}
                  type="text"
                  value={inputSerial}
                  onChange={(e) => setInputSerial(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="VD: GP-2026-VGA01, SN-998822..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 uppercase"
                />
              </div>
              <button
                type="button"
                onClick={() => handleAddSerial(inputSerial)}
                disabled={!inputSerial.trim() || serials.length >= requiredQuantity}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm</span>
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center space-x-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Scanned Serials List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                Danh sách Serial đã gán ({serials.length}/{requiredQuantity}):
              </span>
              {serials.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSerials([])}
                  className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            {serials.length === 0 ? (
              <div className="p-4 bg-slate-800/40 border border-dashed border-slate-700 rounded-2xl text-center text-xs text-slate-500">
                Chưa có số Serial nào được gán. Hãy dùng máy quét mã vạch hoặc chọn từ danh sách kho bên dưới.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {serials.map((sn, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl group"
                  >
                    <div className="flex items-center space-x-1.5 overflow-hidden">
                      <span className="text-[10px] font-bold text-indigo-400 font-mono">#{idx + 1}</span>
                      <span className="font-mono font-bold text-xs text-white truncate" title={sn}>
                        {sn}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSerial(idx)}
                      className="text-slate-400 hover:text-rose-400 p-0.5 rounded cursor-pointer transition-colors"
                      title="Xóa Serial"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Select From In-Stock Serials */}
          {inStockSerialsForProduct.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-cyan-400">
                  <Boxes className="w-4 h-4" />
                  <span>Chọn nhanh từ kho sẵn có ({inStockSerialsForProduct.length}):</span>
                </div>
                <div className="w-36">
                  <input
                    type="text"
                    value={stockSearchQuery}
                    onChange={(e) => setStockSearchQuery(e.target.value)}
                    placeholder="Lọc Serial kho..."
                    className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white text-[11px] font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-800/40 rounded-xl border border-slate-700/60">
                {inStockSerialsForProduct.map((rec) => (
                  <button
                    key={rec.id}
                    type="button"
                    onClick={() => handleAddSerial(rec.serialNumber)}
                    disabled={serials.length >= requiredQuantity}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-cyan-600/30 hover:text-cyan-300 hover:border-cyan-500/50 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 rounded-lg text-[11px] font-mono text-slate-300 transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <span>{rec.serialNumber}</span>
                    {rec.warehouseLocation && (
                      <span className="text-[9px] text-slate-400 bg-slate-900 px-1 rounded">
                        {rec.warehouseLocation}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400">
            {isComplete ? (
              <span className="text-emerald-400 font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Đã gán đủ {requiredQuantity} Serial</span>
              </span>
            ) : (
              <span className="text-amber-400 font-semibold">
                Còn thiếu {requiredQuantity - serials.length} Serial
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/25 flex items-center space-x-1.5 cursor-pointer transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Xác Nhận Serial</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
