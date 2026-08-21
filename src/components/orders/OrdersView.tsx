import React, { useState, useMemo } from 'react';
import {
  Package,
  Search,
  Filter,
  Eye,
  Printer,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ChevronDown,
  ShoppingBag,
} from 'lucide-react';
import { Order, OrderStatus, OrderChannel, StoreSettings } from '../../types';
import { formatVND } from '../../utils/vietqr';
import { ReceiptModal } from '../pos/ReceiptModal';
import { PrintInvoiceModal } from '../common/PrintInvoiceModal';

interface OrdersViewProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  settings: StoreSettings;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  pending: {
    label: 'Chờ xác nhận',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
  },
  confirmed: {
    label: 'Đã xác nhận',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
  },
  processing: {
    label: 'Đang đóng gói',
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30',
  },
  shipping: {
    label: 'Đang giao hàng',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
  },
  completed: {
    label: 'Hoàn tất',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
  cancelled: {
    label: 'Đã hủy',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
  },
  refunded: {
    label: 'Hoàn trả',
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/30',
  },
};

const CHANNEL_BADGES: Record<OrderChannel, { bg: string; text: string }> = {
  'Tại quầy (POS)': { bg: 'bg-emerald-950 text-emerald-300 border-emerald-800', text: 'Tại quầy' },
  Shopee: { bg: 'bg-orange-950 text-orange-300 border-orange-800', text: 'Shopee' },
  'TikTok Shop': { bg: 'bg-slate-800 text-pink-300 border-pink-800', text: 'TikTok' },
  Website: { bg: 'bg-blue-950 text-blue-300 border-blue-800', text: 'Website' },
  Lazada: { bg: 'bg-indigo-950 text-indigo-300 border-indigo-800', text: 'Lazada' },
  'Facebook/Zalo': { bg: 'bg-cyan-950 text-cyan-300 border-cyan-800', text: 'Zalo/FB' },
};

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders = [],
  onUpdateOrderStatus,
  settings,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [printA4Order, setPrintA4Order] = useState<Order | null>(null);

  const safeOrders = Array.isArray(orders) ? orders : [];

  const filteredOrders = useMemo(() => {
    return safeOrders.filter((o) => {
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchChannel = channelFilter === 'all' || o.channel === channelFilter;
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        o.code.toLowerCase().includes(q) ||
        (o.customer?.name && o.customer.name.toLowerCase().includes(q)) ||
        (o.customer?.phone && o.customer.phone.includes(q)) ||
        (o.trackingCode && o.trackingCode.toLowerCase().includes(q));

      return matchStatus && matchChannel && matchSearch;
    });
  }, [orders, statusFilter, channelFilter, searchTerm]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-full text-slate-100">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Package className="w-6 h-6 text-emerald-400" />
            <span>Quản Lý Đơn Hàng & Vận Chuyển</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            Theo dõi, xử lý và đối soát đơn hàng từ POS tại quầy và các sàn TMĐT.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            Tổng cộng: <strong className="text-emerald-400 font-mono">{safeOrders.length}</strong> đơn
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-300">
            Chờ xử lý:{' '}
            <strong className="font-mono">
              {safeOrders.filter((o) => o?.status === 'pending').length}
            </strong>
          </span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo Mã đơn (HD-...), Tên khách, SĐT, hoặc Mã vận đơn..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs text-slate-400 hidden sm:inline">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="processing">Đang đóng gói</option>
              <option value="shipping">Đang giao hàng</option>
              <option value="completed">Hoàn tất</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          {/* Channel Filter */}
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs text-slate-400 hidden sm:inline">Kênh bán:</span>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Tất cả kênh bán</option>
              <option value="Tại quầy (POS)">Tại quầy (POS)</option>
              <option value="Shopee">Shopee</option>
              <option value="TikTok Shop">TikTok Shop</option>
              <option value="Website">Website</option>
              <option value="Facebook/Zalo">Facebook/Zalo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Mã Đơn / Ngày Tạo</th>
                <th className="py-3.5 px-4">Khách Hàng</th>
                <th className="py-3.5 px-4">Kênh Bán</th>
                <th className="py-3.5 px-4">Sản Phẩm</th>
                <th className="py-3.5 px-4 text-right">Tổng Tiền</th>
                <th className="py-3.5 px-4 text-center">Thanh Toán</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-slate-600 stroke-1" />
                    Không tìm thấy đơn hàng nào phù hợp với bộ lọc
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                  const channelInfo =
                    CHANNEL_BADGES[order.channel] || {
                      bg: 'bg-slate-800 text-slate-300 border-slate-700',
                      text: order.channel,
                    };

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-850/60 transition-colors"
                    >
                      {/* Code & Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-emerald-400">
                          {order.code}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(order.createdAt).toLocaleString('vi-VN')}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        {order.customer ? (
                          <div>
                            <div className="font-semibold text-slate-200">
                              {order.customer.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {order.customer.phone}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Khách lẻ tại quầy</span>
                        )}
                      </td>

                      {/* Channel */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${channelInfo.bg}`}
                        >
                          {order.channel}
                        </span>
                      </td>

                      {/* Items Summary */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <div className="text-slate-300 line-clamp-1 font-medium">
                          {order.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {order.items.reduce((s, i) => s + i.quantity, 0)} món hàng
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-mono font-bold text-white text-sm">
                          {formatVND(order.total)}
                        </div>
                        {order.discountAmount > 0 && (
                          <div className="text-[10px] text-rose-400">
                            - {formatVND(order.discountAmount)}
                          </div>
                        )}
                      </td>

                      {/* Payment Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            order.paymentStatus === 'paid'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {order.paymentStatus === 'paid' ? 'Đã TT' : 'Chưa TT'}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5 uppercase">
                          {order.paymentMethod}
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4 text-center">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            onUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                          }
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border focus:outline-none cursor-pointer ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                        >
                          <option value="pending" className="bg-slate-900 text-amber-400">
                            Chờ xác nhận
                          </option>
                          <option value="confirmed" className="bg-slate-900 text-blue-400">
                            Đã xác nhận
                          </option>
                          <option value="processing" className="bg-slate-900 text-indigo-400">
                            Đang đóng gói
                          </option>
                          <option value="shipping" className="bg-slate-900 text-purple-400">
                            Đang giao hàng
                          </option>
                          <option value="completed" className="bg-slate-900 text-emerald-400">
                            Hoàn tất
                          </option>
                          <option value="cancelled" className="bg-slate-900 text-rose-400">
                            Đã hủy
                          </option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="Xem chi tiết đơn hàng"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setPrintA4Order(order)}
                            className="px-2 py-1 text-[11px] font-bold text-blue-400 bg-blue-950/60 hover:bg-blue-900/80 border border-blue-800/60 rounded-lg transition-colors flex items-center space-x-1"
                            title="In Phiếu Giao Khách / Hóa Đơn A4/A5"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>In A4/A5</span>
                          </button>
                          <button
                            onClick={() => setReceiptOrder(order)}
                            className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 rounded-lg transition-colors"
                            title="In Bill Nhiệt K80"
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl max-w-xl w-full border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                  <span>Chi Tiết Đơn Hàng:</span>
                  <span className="text-emerald-400 font-mono">{selectedOrder.code}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Kênh: {selectedOrder.channel} • Ngày:{' '}
                  {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Customer & Shipping */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1">
                  <span className="text-slate-400 font-semibold block text-[11px]">
                    Thông tin người nhận:
                  </span>
                  <p className="font-bold text-slate-100">
                    {selectedOrder.customer?.name || 'Khách lẻ vãng lai'}
                  </p>
                  <p className="text-slate-300 font-mono">
                    {selectedOrder.customer?.phone || 'Không có SĐT'}
                  </p>
                  {selectedOrder.customer?.address && (
                    <p className="text-slate-400 text-[11px]">
                      {selectedOrder.customer.address}
                    </p>
                  )}
                </div>

                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1">
                  <span className="text-slate-400 font-semibold block text-[11px]">
                    Vận chuyển & Giao hàng:
                  </span>
                  <p className="font-semibold text-slate-200">
                    {selectedOrder.shippingPartner || 'Nhận tại quầy / Tự giao'}
                  </p>
                  {selectedOrder.trackingCode && (
                    <p className="text-cyan-400 font-mono font-bold">
                      Mã vận đơn: {selectedOrder.trackingCode}
                    </p>
                  )}
                  <p className="text-slate-400 text-[11px]">
                    Phí vận chuyển: {formatVND(selectedOrder.shippingFee)}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-950 text-slate-400 text-[11px]">
                    <tr>
                      <th className="p-2.5">Sản phẩm</th>
                      <th className="p-2.5 text-center">ĐVT</th>
                      <th className="p-2.5 text-center">SL</th>
                      <th className="p-2.5 text-right">Đơn giá</th>
                      <th className="p-2.5 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-medium text-slate-200">
                          {item.productName}
                          <span className="block text-[10px] text-slate-500 font-mono">
                            {item.sku}
                          </span>
                        </td>
                        <td className="p-2.5 text-center text-slate-300 font-medium">
                          {item.unit || 'Cái'}
                        </td>
                        <td className="p-2.5 text-center font-bold text-slate-300">
                          {item.quantity}
                        </td>
                        <td className="p-2.5 text-right text-slate-400">
                          {item.unitPrice.toLocaleString('vi-VN')}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-emerald-400">
                          {item.total.toLocaleString('vi-VN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Calculation */}
              <div className="bg-slate-800/40 p-3 rounded-xl space-y-1.5 border border-slate-800">
                <div className="flex justify-between text-slate-400">
                  <span>Tiền hàng:</span>
                  <span>{formatVND(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-rose-400">
                    <span>Chiết khấu ({selectedOrder.discountCode || 'Trực tiếp'}):</span>
                    <span>-{formatVND(selectedOrder.discountAmount)}</span>
                  </div>
                )}
                {selectedOrder.taxAmount > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Thuế VAT ({selectedOrder.taxRate}%):</span>
                    <span>+{formatVND(selectedOrder.taxAmount)}</span>
                  </div>
                )}
                {selectedOrder.shippingFee > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Phí ship:</span>
                    <span>+{formatVND(selectedOrder.shippingFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-700">
                  <span>Tổng thanh toán:</span>
                  <span className="text-emerald-400 font-mono">
                    {formatVND(selectedOrder.total)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                  <span>Lợi nhuận gộp ước tính:</span>
                  <span className="text-cyan-400 font-mono font-bold">
                    +{formatVND(selectedOrder.profit)}
                  </span>
                </div>
              </div>

              {selectedOrder.note && (
                <div className="p-2.5 rounded-lg bg-slate-800 text-slate-300 text-xs">
                  <strong>Ghi chú:</strong> {selectedOrder.note}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end space-x-2 bg-slate-900">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setPrintA4Order(selectedOrder);
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center space-x-1.5 shadow-lg shadow-blue-600/30"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In Phiếu A4/A5 (Gia Phúc)</span>
              </button>
              <button
                onClick={() => {
                  setReceiptOrder(selectedOrder);
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl flex items-center space-x-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>In Bill K80</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* A4 / A5 Document Print Modal */}
      {printA4Order && (
        <PrintInvoiceModal
          isOpen={!!printA4Order}
          order={printA4Order}
          settings={settings}
          onClose={() => setPrintA4Order(null)}
        />
      )}

      {/* POS Thermal Receipt Modal */}
      {receiptOrder && (
        <ReceiptModal
          order={receiptOrder}
          settings={settings}
          onClose={() => setReceiptOrder(null)}
        />
      )}
    </div>
  );
};
