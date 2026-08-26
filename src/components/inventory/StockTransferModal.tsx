import React, { useState, useMemo } from 'react';
import {
  X,
  Truck,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Boxes,
  ArrowRight,
  Printer,
  Trash2,
  Building2,
  Calendar,
  AlertCircle,
  FileText,
  DollarSign,
  Package,
} from 'lucide-react';
import {
  StockTransfer,
  StockTransferItem,
  Product,
  StoreSettings,
} from '../../types';
import { formatVND } from '../../utils/vietqr';
import { useMasterData } from '../../core/contexts/MasterDataContext';

interface StockTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  transfers: StockTransfer[];
  products: Product[];
  settings: StoreSettings;
  onSaveTransfer: (transfer: StockTransfer) => Promise<void>;
  onUpdateTransferStatus: (
    id: string,
    payload: { status: string; receiverName?: string; notes?: string }
  ) => Promise<void>;
  onDeleteTransfer?: (id: string) => Promise<void>;
}

export const StockTransferModal: React.FC<StockTransferModalProps> = ({
  isOpen,
  onClose,
  transfers,
  products,
  settings,
  onSaveTransfer,
  onUpdateTransferStatus,
  onDeleteTransfer,
}) => {
  const { warehouseLocations: masterLocations } = useMasterData();
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const warehouseOptions = useMemo(() => {
    const fromMaster = (masterLocations || []).map((l) => l.warehouseName).filter(Boolean);
    const fromSettings = settings?.warehouseList || [];
    const combined = Array.from(new Set([...fromSettings, ...fromMaster]));
    return combined.length > 0 ? combined : ['Kho Tổng Gia Phúc TP.HCM'];
  }, [masterLocations, settings]);

  // Form Create State
  const [fromWarehouse, setFromWarehouse] = useState(warehouseOptions[0] || 'Kho Tổng Gia Phúc TP.HCM');
  const [toWarehouse, setToWarehouse] = useState(warehouseOptions[1] || warehouseOptions[0] || 'Kho Tổng Gia Phúc TP.HCM');
  const [senderName, setSenderName] = useState('Nguyễn Văn Minh (Thủ Kho)');
  const [transportMethod, setTransportMethod] = useState('Xe tải nội bộ');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Transfer Items
  const [transferItems, setTransferItems] = useState<
    Array<{
      productId: string;
      productName: string;
      sku: string;
      unit: string;
      currentStock: number;
      quantity: number;
      unitCost: number;
    }>
  >([]);

  const [productSearch, setProductSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered Transfers
  const filteredTransfers = useMemo(() => {
    return (transfers || []).filter((t) => {
      const matchSearch =
        !searchTerm.trim() ||
        t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.fromWarehouse.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.toWarehouse.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.receiverName && t.receiverName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [transfers, searchTerm, statusFilter]);

  // Filtered Products for picking
  const searchProductResults = useMemo(() => {
    if (!productSearch.trim()) return [];
    const term = productSearch.toLowerCase();
    return products
      .filter((p) => p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term))
      .slice(0, 6);
  }, [products, productSearch]);

  const handleAddProduct = (prod: Product) => {
    const exists = transferItems.find((it) => it.productId === prod.id);
    if (exists) {
      setTransferItems((prev) =>
        prev.map((it) =>
          it.productId === prod.id ? { ...it, quantity: it.quantity + 1 } : it
        )
      );
    } else {
      setTransferItems((prev) => [
        ...prev,
        {
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          unit: prod.unit,
          currentStock: prod.stock,
          quantity: 1,
          unitCost: prod.costPrice,
        },
      ]);
    }
    setProductSearch('');
  };

  const handleRemoveItem = (idx: number) => {
    setTransferItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleQuantityChange = (idx: number, qty: number) => {
    setTransferItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, quantity: Math.max(1, qty) } : it))
    );
  };

  const totalTransferQty = useMemo(
    () => transferItems.reduce((sum, it) => sum + it.quantity, 0),
    [transferItems]
  );

  const totalTransferValue = useMemo(
    () => transferItems.reduce((sum, it) => sum + it.quantity * it.unitCost, 0),
    [transferItems]
  );

  const handleCreateTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (transferItems.length === 0) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm cần chuyển kho!');
      return;
    }
    if (fromWarehouse === toWarehouse) {
      alert('Kho xuất và kho nhận không được trùng nhau!');
      return;
    }

    setIsSubmitting(true);
    try {
      const code = `CK-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
      const items: StockTransferItem[] = transferItems.map((it) => ({
        productId: it.productId,
        productName: it.productName,
        sku: it.sku,
        unit: it.unit,
        quantity: it.quantity,
        unitCost: it.unitCost,
        totalCost: it.quantity * it.unitCost,
      }));

      const newTransfer: StockTransfer = {
        id: `st-${Date.now()}`,
        code,
        fromWarehouse,
        toWarehouse,
        transferDate: new Date().toISOString(),
        status: 'in_transit',
        totalItems: transferItems.length,
        totalQuantity: totalTransferQty,
        senderName,
        transportMethod,
        trackingNumber: trackingNumber || undefined,
        notes: notes || undefined,
        createdAt: new Date().toISOString(),
        items,
      };

      await onSaveTransfer(newTransfer);
      setTransferItems([]);
      setNotes('');
      setActiveTab('list');
    } catch (err: any) {
      alert(`Lỗi khi tạo phiếu chuyển kho: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintTransferSlip = (transfer: StockTransfer) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Phiếu Xuất Chuyển Kho - ${transfer.code}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #0f172a; }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
          .store-name { font-size: 18px; font-weight: bold; text-transform: uppercase; }
          .title { font-size: 20px; font-weight: bold; margin-top: 10px; color: #0284c7; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
          th { background: #f1f5f9; }
          .total-box { text-align: right; font-size: 15px; font-weight: bold; margin-top: 10px; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; text-align: center; margin-top: 40px; }
          .sign-line { margin-top: 60px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="store-name">${settings.storeName || 'CỬA HÀNG GP-ERP ENTERPRISE'}</div>
          <div>${settings.address || ''} • Hotline: ${settings.phone || ''}</div>
          <div class="title">PHIẾU XUẤT CHUYỂN KHO NỘI BỘ</div>
          <div>Mã phiếu: <strong>${transfer.code}</strong> • Ngày lập: ${new Date(transfer.transferDate).toLocaleString('vi-VN')}</div>
        </div>

        <div class="meta-grid">
          <div><strong>Kho xuất:</strong> ${transfer.fromWarehouse}</div>
          <div><strong>Kho nhận:</strong> ${transfer.toWarehouse}</div>
          <div><strong>Người xuất:</strong> ${transfer.senderName}</div>
          <div><strong>Người nhận:</strong> ${transfer.receiverName || 'Chưa nhận'}</div>
          <div><strong>Vận chuyển:</strong> ${transfer.transportMethod || 'Nội bộ'}</div>
          <div><strong>Trạng thái:</strong> ${transfer.status === 'completed' ? 'Đã nhận hàng' : transfer.status === 'in_transit' ? 'Đang vận chuyển' : 'Nháp'}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên sản phẩm</th>
              <th>Mã SKU</th>
              <th>ĐVT</th>
              <th>Số lượng chuyển</th>
              <th>Đơn giá vốn</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${transfer.items
              .map(
                (it, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>${it.productName}</td>
                <td>${it.sku}</td>
                <td>${it.unit}</td>
                <td>${it.quantity}</td>
                <td>${it.unitCost.toLocaleString('vi-VN')} đ</td>
                <td>${it.totalCost.toLocaleString('vi-VN')} đ</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div class="total-box">
          <div>Tổng số lượng chuyển: ${transfer.totalQuantity} món</div>
          <div style="color: #0284c7; margin-top: 4px;">
            Tổng giá trị chuyển kho: ${transfer.items.reduce((s, i) => s + i.totalCost, 0).toLocaleString('vi-VN')} đ
          </div>
        </div>

        <div class="signatures">
          <div>
            <div>Người Xuất Hàng</div>
            <div style="font-size: 11px; color: #64748b;">(Ký, ghi rõ họ tên)</div>
            <div class="sign-line">${transfer.senderName}</div>
          </div>
          <div>
            <div>Người Vận Chuyển</div>
            <div style="font-size: 11px; color: #64748b;">(Ký, ghi rõ họ tên)</div>
            <div class="sign-line">${transfer.transportMethod || 'Tài xế'}</div>
          </div>
          <div>
            <div>Thủ Kho Nhận Hàng</div>
            <div style="font-size: 11px; color: #64748b;">(Ký, ghi rõ họ tên)</div>
            <div class="sign-line">${transfer.receiverName || 'Thủ kho nhận'}</div>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Quản Lý Chuyển Kho Nội Bộ (Inter-Branch Transfer)
              </h2>
              <p className="text-xs text-slate-400">
                Điều chuyển hàng hóa giữa Kho Tổng và các Cửa hàng chi nhánh
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setActiveTab('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'list' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Danh Sách Phiếu ({transfers.length})
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  activeTab === 'create' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5" /> Tạo Phiếu Chuyển
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Danh Sách Phiếu Chuyển Kho */}
        {activeTab === 'list' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Filter Bar */}
            <div className="p-6 pb-3 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative flex-1 w-full sm:w-auto">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm mã phiếu (CK-...), kho xuất, kho nhận, người xuất..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 w-full sm:w-auto"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="in_transit">Đang vận chuyển</option>
                <option value="completed">Đã nhận hàng (Hoàn tất)</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3">
              {filteredTransfers.length === 0 ? (
                <div className="py-16 text-center text-slate-500 space-y-2">
                  <Truck className="w-10 h-10 mx-auto text-slate-600 opacity-50" />
                  <p className="text-sm">Chưa có phiếu chuyển kho nào</p>
                </div>
              ) : (
                filteredTransfers.map((st) => (
                  <div
                    key={st.id}
                    className="p-4 bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/60 rounded-2xl transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-mono font-bold text-xs">
                          {st.code.slice(-4)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm font-mono">{st.code}</span>
                            {st.status === 'in_transit' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                                <Clock className="w-3 h-3" /> Đang vận chuyển
                              </span>
                            )}
                            {st.status === 'completed' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Đã nhập kho nhận
                              </span>
                            )}
                            {st.status === 'cancelled' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400">
                                Đã hủy
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-slate-300 flex items-center gap-2 mt-1 font-medium">
                            <span className="text-slate-400">{st.fromWarehouse}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="text-cyan-300 font-semibold">{st.toWarehouse}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <div className="text-right">
                          <div className="text-xs text-slate-400">{st.totalQuantity} món • {st.totalItems} mặt hàng</div>
                          <div className="text-xs text-slate-400">
                            Ngày: {new Date(st.transferDate).toLocaleDateString('vi-VN')}
                          </div>
                        </div>

                        {st.status === 'in_transit' && (
                          <button
                            onClick={async () => {
                              if (confirm(`Xác nhận đã nhận đủ hàng phiếu ${st.code} vào ${st.toWarehouse}?`)) {
                                await onUpdateTransferStatus(st.id, {
                                  status: 'completed',
                                  receiverName: 'Thủ kho chi nhánh',
                                });
                              }
                            }}
                            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Xác Nhận Nhận Hàng
                          </button>
                        )}

                        <button
                          onClick={() => handlePrintTransferSlip(st)}
                          title="In phiếu xuất chuyển kho"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {onDeleteTransfer && (
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc chắn muốn xóa phiếu chuyển kho ${st.code}?`)) {
                                onDeleteTransfer(st.id);
                              }
                            }}
                            title="Xóa phiếu"
                            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Items preview */}
                    <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80 text-xs flex flex-wrap gap-2">
                      {st.items.map((it, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/50 flex items-center gap-1.5"
                        >
                          <span className="font-semibold text-white">{it.productName}</span>
                          <span className="text-cyan-400 font-mono">x{it.quantity} {it.unit}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Tạo Phiếu Chuyển Kho Mới */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateTransferSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Warehouses Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  Kho Xuất Hàng (Nguồn)
                </label>
                <select
                  value={fromWarehouse}
                  onChange={(e) => setFromWarehouse(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:border-cyan-500"
                >
                  {warehouseOptions.map((wh) => (
                    <option key={wh} value={wh}>
                      {wh}
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-amber-400/80">
                  ⚠️ Tồn kho của các mặt hàng tại kho này sẽ bị trừ ngay khi tạo phiếu.
                </div>
              </div>

              <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  Kho Nhận Hàng (Đích)
                </label>
                <select
                  value={toWarehouse}
                  onChange={(e) => setToWarehouse(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:border-cyan-500"
                >
                  {warehouseOptions.map((wh) => (
                    <option key={wh} value={wh}>
                      {wh}
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-cyan-400/80">
                  ℹ️ Chi nhánh đích sẽ bấm nút xác nhận khi nhận đủ hàng để hoàn tất nhập kho.
                </div>
              </div>
            </div>

            {/* Product Picker */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Boxes className="w-4 h-4 text-cyan-400" />
                Chọn Sản Phẩm Cần Chuyển Kho
              </label>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Gõ tên hoặc mã SKU/Barcode để chọn sản phẩm thêm vào phiếu chuyển..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />

                {searchProductResults.length > 0 && (
                  <div className="absolute z-10 top-full mt-1.5 left-0 right-0 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl overflow-hidden divide-y divide-slate-700/60">
                    {searchProductResults.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleAddProduct(p)}
                        className="p-3 hover:bg-slate-700/60 cursor-pointer flex items-center justify-between text-sm transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-white">{p.name}</div>
                          <div className="text-xs text-slate-400 font-mono">
                            SKU: {p.sku} • ĐVT: {p.unit}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-emerald-400 font-mono">Tồn: {p.stock} {p.unit}</div>
                          <div className="text-xs text-slate-400 font-mono">Giá vốn: {formatVND(p.costPrice)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Items List Table */}
              {transferItems.length > 0 ? (
                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60 divide-y divide-slate-800">
                  <div className="grid grid-cols-12 gap-2 p-3 bg-slate-800/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <div className="col-span-5">Sản Phẩm</div>
                    <div className="col-span-2 text-center">Tồn Hiện Tại</div>
                    <div className="col-span-2 text-center">SL Chuyển</div>
                    <div className="col-span-2 text-right">Đơn Giá Vốn</div>
                    <div className="col-span-1 text-center">Xóa</div>
                  </div>

                  {transferItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 p-3 items-center text-xs">
                      <div className="col-span-5">
                        <div className="font-semibold text-white text-sm">{item.productName}</div>
                        <div className="text-slate-400 font-mono">SKU: {item.sku}</div>
                      </div>
                      <div className="col-span-2 text-center font-mono text-slate-300">
                        {item.currentStock} {item.unit}
                      </div>
                      <div className="col-span-2 flex items-center justify-center gap-1">
                        <input
                          type="number"
                          min={1}
                          max={item.currentStock}
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                          className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-center text-sm font-mono text-white focus:border-cyan-500"
                        />
                        <span className="text-slate-400">{item.unit}</span>
                      </div>
                      <div className="col-span-2 text-right font-mono text-cyan-400 font-medium">
                        {formatVND(item.unitCost)}
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 border border-dashed border-slate-800 rounded-2xl text-center text-slate-500 text-xs">
                  Chưa có sản phẩm nào được chọn. Gõ tên sản phẩm vào ô tìm kiếm ở trên để thêm vào phiếu.
                </div>
              )}
            </div>

            {/* Extra Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Người lập & xuất kho</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Phương thức vận chuyển</label>
                <select
                  value={transportMethod}
                  onChange={(e) => setTransportMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:border-cyan-500"
                >
                  <option value="Xe tải nội bộ">Xe tải nội bộ</option>
                  <option value="Grab Express">Grab Express</option>
                  <option value="Ahamove">Ahamove</option>
                  <option value="Viettel Post">Viettel Post</option>
                  <option value="Tự vận chuyển">Tự vận chuyển (Xe máy)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Mã vận đơn / Số xe</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Ví dụ: 59C-123.45 hoặc mã vận đơn"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Footer Summary */}
            <div className="bg-slate-800/70 p-4 rounded-2xl border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-xs text-slate-400">Tổng số mặt hàng:</div>
                  <div className="text-base font-bold text-white">{transferItems.length} SKU</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Tổng số lượng chuyển:</div>
                  <div className="text-base font-bold text-amber-400">{totalTransferQty} sản phẩm</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Tổng giá trị vốn:</div>
                  <div className="text-base font-bold text-cyan-400 font-mono">
                    {formatVND(totalTransferValue)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium transition-colors"
                >
                  Quay Lại
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || transferItems.length === 0}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center gap-2 transition-all"
                >
                  <Truck className="w-4 h-4" />
                  {isSubmitting ? 'Đang tạo phiếu...' : 'Xác Nhận Xuất Chuyển Kho'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
