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
  Plus,
  ArrowUpRight,
  Boxes,
  PackageCheck,
  Tag,
  QrCode,
  Barcode,
  Send,
  User,
  Phone,
  MapPin,
  DollarSign,
  CreditCard,
  Trash2,
  X,
  Sparkles,
  Sliders,
  FileText,
  AlertTriangle,
  RotateCcw,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';
import {
  Order,
  OrderStatus,
  OrderChannel,
  StoreSettings,
  Product,
  Customer,
  InventoryLog,
  PaymentMethod,
  ReturnOrder,
  SerialDeviceRecord,
  DigitalSignatureMetadata,
} from '../../types';
import { formatVND } from '../../utils/vietqr';
import { sounds } from '../../utils/soundEffects';
import { ReceiptModal } from '../pos/ReceiptModal';
import { PrintInvoiceModal, PrintItem } from '../common/PrintInvoiceModal';
import { CreateReturnModal } from './CreateReturnModal';
import { ReturnsHistoryModal } from './ReturnsHistoryModal';
import { DocumentSignerModal } from '../signatures/DocumentSignerModal';

interface OrdersViewProps {
  orders: Order[];
  products?: Product[];
  customers?: Customer[];
  returns?: ReturnOrder[];
  serialRecords?: SerialDeviceRecord[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onSaveOrder?: (order: Order) => void;
  onAdjustStock?: (log: Omit<InventoryLog, 'id' | 'timestamp'>) => void;
  onSaveReturn?: (returnOrder: ReturnOrder) => Promise<void>;
  onDeleteReturn?: (id: string) => Promise<void>;
  settings: StoreSettings;
  onSaveSettings?: (updated: StoreSettings) => void;
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
    label: 'Hoàn thành',
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

const CARRIERS = [
  'Gia Phúc Express (Hỏa tốc nội thành)',
  'Giao Hàng Nhanh (GHN)',
  'Viettel Post',
  'Giao Hàng Tiết Kiệm (GHTK)',
  'J&T Express',
  'Chành Xe / Nhà Xe Liên Tỉnh',
  'Khách Tự Đến Nhận Tại Showroom',
];

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders = [],
  products = [],
  customers = [],
  returns = [],
  serialRecords = [],
  onUpdateOrderStatus,
  onSaveOrder,
  onAdjustStock,
  onSaveReturn,
  onDeleteReturn,
  settings,
  onSaveSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'need_stock_issue' | 'delivery_dispatch' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [printA4Order, setPrintA4Order] = useState<Order | null>(null);

  // Return Orders RMA Modals
  const [showCreateReturnModal, setShowCreateReturnModal] = useState(false);
  const [showReturnsHistoryModal, setShowReturnsHistoryModal] = useState(false);
  const [returnPreSelectedOrder, setReturnPreSelectedOrder] = useState<Order | null>(null);

  const [stockIssueOrder, setStockIssueOrder] = useState<Order | null>(null);
  const [stockIssueSerials, setStockIssueSerials] = useState<Record<string, string>>({});

  const [dispatchOrder, setDispatchOrder] = useState<Order | null>(null);
  const [dispatchCarrier, setDispatchCarrier] = useState<string>('Gia Phúc Express (Hỏa tốc nội thành)');
  const [dispatchTrackingCode, setDispatchTrackingCode] = useState<string>('');
  const [dispatchCodAmount, setDispatchCodAmount] = useState<number>(0);
  const [dispatchShippingFee, setDispatchShippingFee] = useState<number>(0);
  const [dispatchRecipientName, setDispatchRecipientName] = useState<string>('');
  const [dispatchRecipientPhone, setDispatchRecipientPhone] = useState<string>('');
  const [dispatchRecipientAddress, setDispatchRecipientAddress] = useState<string>('');
  const [dispatchNotes, setDispatchNotes] = useState<string>('');
  const [dispatchStatus, setDispatchStatus] = useState<'pending_pickup' | 'in_transit' | 'delivered' | 'delivery_failed' | 'returned'>('pending_pickup');

  const [customPrintDoc, setCustomPrintDoc] = useState<{
    isOpen: boolean;
    order: Order;
    docType: 'delivery_dispatch' | 'shipping_label' | 'delivery_note' | 'sales_invoice' | 'goods_delivery_record' | 'sales_return';
  } | null>(null);

  const [signingOrder, setSigningOrder] = useState<Order | null>(null);

  const handleOrderSignSuccess = async (sig: DigitalSignatureMetadata) => {
    if (!signingOrder) return;
    const updatedOrder: Order = { ...signingOrder, digitalSignature: sig };
    if (onSaveOrder) {
      onSaveOrder(updatedOrder);
    }
    try {
      await fetch(`/api/pos/orders/${signingOrder.id}/sign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature: sig }),
      });
    } catch (err) {
      console.warn('Backend order sign sync error:', err);
    }
    setSigningOrder(null);
  };

  const [barcodeScanInput, setBarcodeScanInput] = useState('');

  // States for Sales Return Modal
  const [salesReturnOrder, setSalesReturnOrder] = useState<Order | null>(null);
  const [returnItems, setReturnItems] = useState<
    Array<{
      productId?: string;
      sku: string;
      productName: string;
      unit: string;
      maxQty: number;
      returnQty: number;
      unitPrice: number;
      serials: string[];
      selectedSerials: string[];
      reason: string;
    }>
  >([]);
  const [returnRefundMethod, setReturnRefundMethod] = useState<'cash' | 'transfer' | 'credit_note'>('cash');
  const [returnNotes, setReturnNotes] = useState<string>('');

  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [newOrderChannel, setNewOrderChannel] = useState<OrderChannel>('Website');
  const [newOrderCustomerName, setNewOrderCustomerName] = useState('');
  const [newOrderCustomerPhone, setNewOrderCustomerPhone] = useState('');
  const [newOrderCustomerAddress, setNewOrderCustomerAddress] = useState('');
  const [newOrderItems, setNewOrderItems] = useState<
    Array<{ product: Product; quantity: number; unitPrice: number }>
  >([]);
  const [newOrderPaymentMethod, setNewOrderPaymentMethod] = useState<PaymentMethod>('transfer');
  const [newOrderPaymentStatus, setNewOrderPaymentStatus] = useState<'paid' | 'unpaid'>('unpaid');
  const [newOrderShippingFee, setNewOrderShippingFee] = useState<number>(30000);
  const [newOrderNote, setNewOrderNote] = useState('');

  const safeOrders = Array.isArray(orders) ? orders : [];

  const filteredOrders = useMemo(() => {
    return safeOrders.filter((o) => {
      if (activeTab === 'need_stock_issue' && (o.stockIssued || o.status === 'cancelled')) return false;
      if (activeTab === 'delivery_dispatch' && !o.shippingPartner && o.channel === 'Tại quầy (POS)') return false;
      if (activeTab === 'completed' && o.status !== 'completed') return false;

      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchChannel = channelFilter === 'all' || o.channel === channelFilter;
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        o.code.toLowerCase().includes(q) ||
        (o.customer?.name && o.customer.name.toLowerCase().includes(q)) ||
        (o.recipientName && o.recipientName.toLowerCase().includes(q)) ||
        (o.customer?.phone && o.customer.phone.includes(q)) ||
        (o.recipientPhone && o.recipientPhone.includes(q)) ||
        (o.trackingCode && o.trackingCode.toLowerCase().includes(q));

      return matchStatus && matchChannel && matchSearch;
    });
  }, [safeOrders, activeTab, statusFilter, channelFilter, searchTerm]);

  const handleOpenStockIssue = (order: Order) => {
    setStockIssueOrder(order);
    setBarcodeScanInput('');
    // Gợi ý tự động Serial FIFO (ưu tiên tồn lâu nhất) & Vị trí kho
    const initialSerials: Record<string, string> = {};
    (order.items || []).forEach((item, idx) => {
      const itemKey = item.productId || `item-${idx}`;
      const prod = products.find((p) => p.id === item.productId || p.sku === item.sku);
      const pSerials = (prod as any)?.serials || (prod as any)?.serialNumbers;
      if (pSerials && pSerials.length > 0) {
        initialSerials[itemKey] = pSerials.slice(0, item.quantity).join(', ');
      } else {
        const generated = Array.from({ length: item.quantity })
          .map((_, i) => `${item.sku.slice(0, 4).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000 + i)}`)
          .join(', ');
        initialSerials[itemKey] = generated;
      }
    });
    setStockIssueSerials(initialSerials);
  };

  const handleOpenSalesReturn = (order: Order) => {
    setSalesReturnOrder(order);
    setReturnRefundMethod('cash');
    setReturnNotes(`Khách trả hàng theo đơn bán ${order.code}`);
    setReturnItems(
      (order.items || []).map((it) => {
        const itemKey = it.productId || it.sku;
        const currentSerialsStr = stockIssueSerials[itemKey] || '';
        const serialsList = currentSerialsStr ? currentSerialsStr.split(',').map((s) => s.trim()).filter(Boolean) : [];
        return {
          productId: it.productId,
          sku: it.sku,
          productName: it.productName,
          unit: it.unit || 'Cái',
          maxQty: it.quantity,
          returnQty: 0,
          unitPrice: it.unitPrice,
          serials: serialsList,
          selectedSerials: [],
          reason: 'Lỗi kỹ thuật / Khách đổi ý',
        };
      })
    );
  };

  const handleConfirmSalesReturn = () => {
    if (!salesReturnOrder) return;
    const activeReturns = returnItems.filter((it) => it.returnQty > 0);
    if (activeReturns.length === 0) {
      alert('Vui lòng chọn số lượng ít nhất 1 sản phẩm để thực hiện trả hàng!');
      return;
    }

    const totalRefund = activeReturns.reduce((acc, it) => acc + it.returnQty * it.unitPrice, 0);

    // Tăng lại tồn kho ERP cho từng sản phẩm trả lại
    if (onAdjustStock) {
      activeReturns.forEach((it) => {
        const prod = products.find((p) => p.id === it.productId || p.sku === it.sku);
        const oldStk = prod?.stock || 0;
        const newStk = oldStk + it.returnQty;

        onAdjustStock({
          productId: prod?.id || it.productId || `prod-${it.sku}`,
          productName: it.productName,
          sku: it.sku,
          type: 'import',
          quantityChange: it.returnQty,
          oldStock: oldStk,
          newStock: newStk,
          unitPrice: it.unitPrice,
          reason: `Khách trả hàng theo đơn ${salesReturnOrder.code} (${it.reason})`,
          performedBy: 'Thủ Kho Gia Phúc',
        });
      });
    }

    // Cập nhật thông tin ghi chú đơn hàng
    const returnSummary = activeReturns.map((it) => `${it.productName} x${it.returnQty}`).join(', ');
    const updatedOrder: Order = {
      ...salesReturnOrder,
      note: `${salesReturnOrder.note ? salesReturnOrder.note + ' | ' : ''}[Đã nhận trả hàng: ${returnSummary} - Hoàn: ${formatVND(totalRefund)}]`,
    };

    if (onSaveOrder) {
      onSaveOrder(updatedOrder);
    }

    sounds.playCashDrawerSound();
    alert(`Đã lập phiếu trả hàng và nhập lại kho thành công cho đơn ${salesReturnOrder.code}! Tồn kho ERP đã được cộng tăng lại.`);

    // Mở ngay cửa sổ in Phiếu Hàng Bán Trả Lại (Mẫu 02-TT)
    const returnDocOrder: Order = {
      ...salesReturnOrder,
      items: activeReturns.map((it) => ({
        productId: it.productId || `prod-${it.sku}`,
        productName: it.productName,
        sku: it.sku,
        unit: it.unit,
        quantity: it.returnQty,
        unitPrice: it.unitPrice,
        costPrice: 0,
        discountPercent: 0,
        total: it.returnQty * it.unitPrice,
      })),
      subtotal: totalRefund,
      total: totalRefund,
    };

    setCustomPrintDoc({
      isOpen: true,
      order: returnDocOrder,
      docType: 'sales_return',
    });

    setSalesReturnOrder(null);
  };

  const handleConfirmStockIssue = () => {
    if (!stockIssueOrder) return;

    if (onAdjustStock) {
      stockIssueOrder.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId || p.sku === item.sku);
        const oldStk = prod?.stock || 0;
        const deductQty = item.quantity;
        const newStk = Math.max(0, oldStk - deductQty);

        onAdjustStock({
          productId: prod?.id || item.productId,
          productName: item.productName,
          sku: item.sku,
          type: 'sale_deduct',
          quantityChange: -deductQty,
          oldStock: oldStk,
          newStock: newStk,
          unitPrice: item.unitPrice,
          reason: `Xuất kho trừ tồn đơn bán hàng ${stockIssueOrder.code}`,
          performedBy: 'Thủ Kho Gia Phúc',
        });
      });
    }

    const updatedOrder: Order = {
      ...stockIssueOrder,
      stockIssued: true,
      stockIssuedAt: new Date().toISOString(),
      stockIssuedBy: 'Thủ Kho Gia Phúc',
      status: stockIssueOrder.status === 'pending' ? 'processing' : stockIssueOrder.status,
    };

    if (onSaveOrder) {
      onSaveOrder(updatedOrder);
    } else {
      onUpdateOrderStatus(stockIssueOrder.id, updatedOrder.status);
    }

    sounds.playSuccessChime();
    alert(`Đã xuất kho trừ tồn thành công cho đơn hàng ${stockIssueOrder.code}! Tồn kho ERP đã được cập nhật chính xác.`);
    setStockIssueOrder(null);
  };

  const handleSaveDispatch = () => {
    if (!dispatchOrder) return;

    const updatedOrder: Order = {
      ...dispatchOrder,
      shippingPartner: dispatchCarrier,
      trackingCode: dispatchTrackingCode,
      codAmount: dispatchCodAmount,
      shippingFee: dispatchShippingFee,
      recipientName: dispatchRecipientName,
      recipientPhone: dispatchRecipientPhone,
      recipientAddress: dispatchRecipientAddress,
      deliveryNotes: dispatchNotes,
      deliveryStatus: dispatchStatus,
      status:
        dispatchStatus === 'delivered'
          ? 'completed'
          : dispatchStatus === 'in_transit'
          ? 'shipping'
          : dispatchOrder.status,
    };

    if (onSaveOrder) {
      onSaveOrder(updatedOrder);
    } else {
      onUpdateOrderStatus(dispatchOrder.id, updatedOrder.status);
    }

    sounds.playSuccessChime();
    alert(`Đã lưu thông tin điều phối vận chuyển cho đơn ${dispatchOrder.code}!`);
    setDispatchOrder(null);
  };

  const handleCreateNewOrder = () => {
    if (newOrderItems.length === 0) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm cho đơn hàng!');
      return;
    }

    const subtotal = newOrderItems.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0);
    const totalCost = newOrderItems.reduce((acc, it) => acc + it.quantity * it.product.costPrice, 0);
    const total = subtotal + newOrderShippingFee;
    const profit = total - totalCost;
    const orderCode = `DH-${Date.now().toString().slice(-6)}`;

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      code: orderCode,
      channel: newOrderChannel,
      status: 'confirmed',
      customer: {
        id: `cust-${Date.now()}`,
        name: newOrderCustomerName || 'Khách Đặt Online',
        phone: newOrderCustomerPhone || '0900000000',
        address: newOrderCustomerAddress,
      },
      recipientName: newOrderCustomerName,
      recipientPhone: newOrderCustomerPhone,
      recipientAddress: newOrderCustomerAddress,
      items: newOrderItems.map((it) => ({
        productId: it.product.id,
        productName: it.product.name,
        sku: it.product.sku,
        unit: it.product.unit || 'Cái',
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        costPrice: it.product.costPrice,
        discountPercent: 0,
        total: it.quantity * it.unitPrice,
      })),
      subtotal,
      discountAmount: 0,
      taxRate: 0,
      taxAmount: 0,
      shippingFee: newOrderShippingFee,
      shippingPartner: 'Gia Phúc Express',
      trackingCode: `GPX-${Math.floor(100000 + Math.random() * 900000)}`,
      codAmount: newOrderPaymentStatus === 'unpaid' ? total : 0,
      total,
      totalCost,
      profit,
      paymentMethod: newOrderPaymentMethod,
      paymentStatus: newOrderPaymentStatus,
      paidAmount: newOrderPaymentStatus === 'paid' ? total : 0,
      changeAmount: 0,
      note: newOrderNote,
      createdAt: new Date().toISOString(),
    };

    if (onSaveOrder) {
      onSaveOrder(newOrder);
    }

    sounds.playCashDrawerSound();
    alert(`Đã tạo thành công đơn hàng mới ${orderCode}!`);
    setShowNewOrderModal(false);
    setNewOrderItems([]);
    setNewOrderCustomerName('');
    setNewOrderCustomerPhone('');
    setNewOrderCustomerAddress('');
    setNewOrderNote('');
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-full text-slate-100">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Package className="w-6 h-6 text-emerald-400" />
            <span>Quản Lý Đơn Hàng, Xuất Kho & Vận Chuyển COD</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            Quy trình khép kín: Đặt hàng đa kênh ➔ Xuất kho trừ tồn ➔ Điều phối giao hàng ➔ In tem vận đơn & COD.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setReturnPreSelectedOrder(null);
              setShowCreateReturnModal(true);
            }}
            className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Trả Hàng / Hoàn Tiền (RMA)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowReturnsHistoryModal(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Lịch Sử Phiếu Trả ({returns.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setShowNewOrderModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center space-x-2 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Đơn Hàng Mới</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Tất Cả Đơn Hàng ({safeOrders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('need_stock_issue')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'need_stock_issue'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>
            Chờ Xuất Kho Trừ Tồn ({safeOrders.filter((o) => !o.stockIssued && o.status !== 'cancelled').length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('delivery_dispatch')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'delivery_dispatch'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>
            Điều Phối Giao Hàng & COD ({safeOrders.filter((o) => o.shippingPartner || o.channel !== 'Tại quầy (POS)').length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Đã Hoàn Tất ({safeOrders.filter((o) => o.status === 'completed').length})</span>
        </button>
      </div>

      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo Mã đơn (DH-...), Tên khách, SĐT, hoặc Mã vận đơn..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs text-slate-400 hidden sm:inline">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
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

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs text-slate-400 hidden sm:inline">Kênh bán:</span>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
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

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Mã Đơn / Ngày</th>
                <th className="py-3.5 px-4">Khách Hàng / Giao Đến</th>
                <th className="py-3.5 px-4">Kênh Bán</th>
                <th className="py-3.5 px-4">Sản Phẩm</th>
                <th className="py-3.5 px-4 text-right">Tổng Tiền</th>
                <th className="py-3.5 px-4 text-center">Xuất Kho ERP</th>
                <th className="py-3.5 px-4 text-center">Vận Chuyển / COD</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-slate-600 stroke-1" />
                    Không tìm thấy đơn hàng nào phù hợp với bộ lọc
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                  const channelInfo =
                    CHANNEL_BADGES[order.channel] || CHANNEL_BADGES['Tại quầy (POS)'];

                  return (
                    <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-white text-sm">{order.code}</div>
                        <div className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {order.customer ? (
                          <div>
                            <div className="font-semibold text-slate-200">
                              {order.recipientName || order.customer.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {order.recipientPhone || order.customer.phone}
                            </div>
                            {(order.recipientAddress || order.customer.address) && (
                              <div className="text-[10px] text-slate-500 line-clamp-1 max-w-[180px]">
                                {order.recipientAddress || order.customer.address}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Khách lẻ tại quầy</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${channelInfo.bg}`}>
                          {order.channel}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-[200px]">
                        <div className="text-slate-300 line-clamp-1 font-medium">
                          {order.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {order.items.reduce((s, i) => s + i.quantity, 0)} món hàng
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="font-mono font-bold text-white text-sm">
                          {formatVND(order.total)}
                        </div>
                        {order.paymentStatus === 'paid' ? (
                          <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60">
                            ĐÃ TT
                          </span>
                        ) : (
                          <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60">
                            CHƯA TT
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {order.stockIssued ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Đã Xuất Kho</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setCustomPrintDoc({
                                  isOpen: true,
                                  order,
                                  docType: 'goods_delivery_record',
                                });
                              }}
                              className="text-[10px] text-teal-400 hover:underline flex items-center justify-center space-x-1 mx-auto cursor-pointer"
                              title="In Biên Bản Giao Nhận Hàng Hóa (Ảnh 1)"
                            >
                              <FileCheck className="w-3 h-3" />
                              <span>BB Giao Nhận</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenStockIssue(order)}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[10px] font-bold flex items-center space-x-1 mx-auto shadow-md shadow-amber-600/20 cursor-pointer transition-all active:scale-95"
                            title="Kiểm tra tồn kho FIFO và xuất trừ kho"
                          >
                            <ArrowUpRight className="w-3 h-3" />
                            <span>Xuất Kho (FIFO)</span>
                          </button>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {order.trackingCode ? (
                          <div className="space-y-0.5">
                            <div className="font-mono text-[10px] font-bold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40 inline-block">
                              {order.trackingCode}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[120px] mx-auto">
                              {order.shippingPartner || 'Gia Phúc Express'}
                            </div>
                            {order.codAmount && order.codAmount > 0 ? (
                              <div className="text-[10px] text-rose-400 font-mono font-bold">
                                COD: {formatVND(order.codAmount)}
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setDispatchOrder(order);
                              setDispatchCarrier(order.shippingPartner || 'Gia Phúc Express (Hỏa tốc nội thành)');
                              setDispatchTrackingCode(
                                order.trackingCode || `GPX-${Math.floor(100000 + Math.random() * 900000)}`
                              );
                              setDispatchCodAmount(order.paymentStatus === 'unpaid' ? order.total : 0);
                              setDispatchShippingFee(order.shippingFee || 30000);
                              setDispatchRecipientName(order.recipientName || order.customer?.name || '');
                              setDispatchRecipientPhone(order.recipientPhone || order.customer?.phone || '');
                              setDispatchRecipientAddress(order.recipientAddress || order.customer?.address || '');
                              setDispatchNotes(order.deliveryNotes || 'Kiểm hàng trước khi thanh toán');
                              setDispatchStatus(order.deliveryStatus || 'pending_pickup');
                            }}
                            className="px-2 py-1 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/40 rounded-lg text-[10px] font-bold flex items-center space-x-1 mx-auto cursor-pointer transition-all"
                            title="Điều phối cho hãng vận chuyển"
                          >
                            <Truck className="w-3 h-3" />
                            <span>Điều Phối</span>
                          </button>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            onUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                          }
                          className={`px-2 py-1 rounded-lg text-[11px] font-semibold border focus:outline-none cursor-pointer ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
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

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Xem chi tiết đơn hàng"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenSalesReturn(order)}
                            className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
                            title="Tạo Phiếu Trả Hàng & Nhập Lại Kho (Mẫu 02-TT)"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCustomPrintDoc({
                                isOpen: true,
                                order,
                                docType: 'goods_delivery_record',
                              });
                            }}
                            className="p-1.5 text-teal-400 hover:text-teal-200 hover:bg-teal-950/60 rounded-lg transition-colors cursor-pointer"
                            title="In Biên Bản Giao Nhận Hàng Hóa (Ảnh 1)"
                          >
                            <FileCheck className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCustomPrintDoc({
                                isOpen: true,
                                order,
                                docType: 'shipping_label',
                              });
                            }}
                            className="p-1.5 text-cyan-400 hover:text-cyan-200 hover:bg-cyan-950/60 rounded-lg transition-colors cursor-pointer"
                            title="In Tem Vận Đơn Dán Kiện Hàng (K80/A5)"
                          >
                            <Tag className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPrintA4Order(order)}
                            className="px-2 py-1 text-[11px] font-bold text-blue-400 bg-blue-950/60 hover:bg-blue-900/80 border border-blue-800/60 rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                            title="In Hóa Đơn / Phiếu Giao Hàng A4/A5"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>In Phiếu</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setReceiptOrder(order)}
                            className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="In Bill Nhiệt K80"
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSigningOrder(order)}
                            className={`px-2 py-1 text-[11px] font-bold border rounded-lg transition-colors flex items-center space-x-1 cursor-pointer ${
                              order.digitalSignature
                                ? 'text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 border-emerald-700/60'
                                : 'text-amber-300 bg-amber-950/60 hover:bg-amber-900/80 border-amber-700/60'
                            }`}
                            title={order.digitalSignature ? 'Đã ký số CA hợp chuẩn (Bấm để ký lại hoặc thẩm tra)' : 'Ký số điện tử CA duyệt đơn hàng (Viettel/VNPT/USB Token)'}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{order.digitalSignature ? 'Đã Ký CA' : 'Ký Số CA'}</span>
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

      {stockIssueOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-xs">
            {/* Header */}
            <div className="p-4 md:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center space-x-2">
                    <span>Xuất Kho Trừ Tồn Thông Minh FIFO ({stockIssueOrder.code})</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Khách hàng: <strong className="text-slate-200">{stockIssueOrder.customer?.name || 'Khách lẻ'}</strong> | Kênh: <strong className="text-slate-200">{stockIssueOrder.channel}</strong> | Ngày: <span className="text-slate-300">{new Date(stockIssueOrder.createdAt).toLocaleDateString('vi-VN')}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStockIssueOrder(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 md:p-6 space-y-4 overflow-y-auto flex-1">
              {/* Barcode / QR Scanner Input Box */}
              <div className="p-3 bg-slate-950 border border-amber-500/30 rounded-xl space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-amber-300 flex items-center space-x-1.5">
                    <Barcode className="w-4 h-4 text-amber-400" />
                    <span>Quét Barcode / Mã Vạch / QR Code / Serial Tự Động Khớp:</span>
                  </span>
                  <span className="text-[10px] text-amber-400/80 bg-amber-950/40 px-2 py-0.5 rounded font-mono">
                    ⚡ Thuật toán FIFO: Tự động chọn Serial / Lô hàng tồn kho lâu nhất
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Quét mã vạch hoặc gõ Serial vào đây (VD: AYUD13043262, SSD-88231...)..."
                    value={barcodeScanInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBarcodeScanInput(val);
                      if (val.trim()) {
                        const matchedItem = stockIssueOrder.items.find(
                          (it) => it.sku.toLowerCase() === val.toLowerCase() || it.productName.toLowerCase().includes(val.toLowerCase())
                        );
                        if (matchedItem) {
                          const itemKey = matchedItem.productId || matchedItem.sku;
                          const cur = stockIssueSerials[itemKey] || '';
                          if (!cur.includes(val)) {
                            setStockIssueSerials({
                              ...stockIssueSerials,
                              [itemKey]: cur ? `${cur}, ${val.trim()}` : val.trim(),
                            });
                            sounds.playBarcodeBeep();
                          }
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && barcodeScanInput.trim()) {
                        sounds.playBarcodeBeep();
                        setBarcodeScanInput('');
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-amber-500/50 rounded-xl text-amber-300 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (barcodeScanInput.trim()) {
                        sounds.playBarcodeBeep();
                        setBarcodeScanInput('');
                      }
                    }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95"
                  >
                    Khớp Mã
                  </button>
                </div>
              </div>

              {/* Items Table */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="p-3 w-8">#</th>
                      <th className="p-3">Sản Phẩm & Vị Trí Lưu Kho</th>
                      <th className="p-3 text-center">Tồn Kho ERP</th>
                      <th className="p-3 text-center">SL Xuất</th>
                      <th className="p-3">Số Serial / IMEI Xuất Giao (FIFO)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {stockIssueOrder.items.map((item, idx) => {
                      const itemKey = item.productId || `item-${idx}`;
                      const prod = products.find((p) => p.id === item.productId || p.sku === item.sku);
                      const storageLoc = prod?.storageLocation || 'Kệ A1-01 (Khu Chính)';
                      const currentStock = prod?.stock || 0;
                      return (
                        <tr key={idx}>
                          <td className="p-3 text-center font-bold text-slate-500">{idx + 1}</td>
                          <td className="p-3">
                            <div className="font-mono font-bold text-cyan-400">{item.sku}</div>
                            <div className="font-semibold text-white">{item.productName}</div>
                            <div className="text-[10px] text-amber-400 flex items-center space-x-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-amber-400" />
                              <span>Vị trí: <strong>{storageLoc}</strong></span>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <span className="font-mono font-bold text-slate-300">
                              {currentStock} {item.unit || 'Cái'}
                            </span>
                            {currentStock < item.quantity && (
                              <div className="text-[9px] font-bold text-rose-400">Thiếu tồn</div>
                            )}
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-amber-400 text-sm">
                            {item.quantity}
                          </td>
                          <td className="p-3 space-y-1">
                            <input
                              type="text"
                              placeholder="Số Serial xuất giao (phân cách bằng dấu phẩy)..."
                              value={stockIssueSerials[itemKey] || ''}
                              onChange={(e) =>
                                setStockIssueSerials({
                                  ...stockIssueSerials,
                                  [itemKey]: e.target.value,
                                })
                              }
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs placeholder-slate-600 focus:outline-none focus:border-amber-500"
                            />
                            <div className="text-[9px] text-slate-500 flex items-center space-x-1">
                              <span>💡 Gợi ý FIFO: Đã gán {item.quantity} serial của lô nhập sớm nhất.</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 md:p-6 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStockIssueOrder(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const tempOrder: Order = {
                      ...stockIssueOrder,
                      items: stockIssueOrder.items.map((it, idx) => ({
                        ...it,
                        serialNumber: stockIssueSerials[it.productId || `item-${idx}`] || (it as any).serialNumber || '',
                      })),
                    };
                    setCustomPrintDoc({
                      isOpen: true,
                      order: tempOrder,
                      docType: 'goods_delivery_record',
                    });
                  }}
                  className="px-3.5 py-2.5 bg-teal-600/20 hover:bg-teal-600/40 text-teal-300 border border-teal-500/40 rounded-xl font-bold flex items-center space-x-1.5 cursor-pointer"
                  title="In Biên Bản Giao Nhận Hàng Hóa (Theo Ảnh 1)"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>📑 In BB Giao Nhận (Ảnh 1)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomPrintDoc({
                      isOpen: true,
                      order: stockIssueOrder,
                      docType: 'delivery_note',
                    });
                  }}
                  className="px-3.5 py-2.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/40 rounded-xl font-bold flex items-center space-x-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>🖨️ In Phiếu Xuất Kho</span>
                </button>
                <button
                  type="button"
                  onClick={handleConfirmStockIssue}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-bold shadow-lg shadow-amber-600/30 flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>✓ Xác Nhận Xuất Kho Trừ Tồn</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SALES RETURN MODAL (LẬP PHIẾU HÀNG BÁN TRẢ LẠI & NHẬP LẠI KHO - ẢNH 2)
          ========================================================================= */}
      {salesReturnOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-xs">
            {/* Header */}
            <div className="p-4 md:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center space-x-2">
                    <span>Lập Phiếu Hàng Bán Trả Lại & Nhập Lại Kho ({salesReturnOrder.code})</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Khách hàng: <strong className="text-slate-200">{salesReturnOrder.customer?.name || 'Khách lẻ'}</strong> | SĐT: <strong className="text-slate-200">{salesReturnOrder.customer?.phone || '---'}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSalesReturnOrder(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 md:p-6 space-y-4 overflow-y-auto flex-1">
              <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-xl text-rose-300 flex items-center justify-between">
                <span>Chọn các sản phẩm khách trả lại, nhập số lượng và Serial để nhập lại vào kho ERP.</span>
                <span className="font-mono font-bold">
                  Tổng tiền hoàn: {formatVND(returnItems.reduce((acc, it) => acc + it.returnQty * it.unitPrice, 0))}
                </span>
              </div>

              {/* Items Table */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="p-3 w-8">#</th>
                      <th className="p-3">Sản Phẩm Đã Bán</th>
                      <th className="p-3 text-center">ĐVT</th>
                      <th className="p-3 text-center">SL Đã Mua</th>
                      <th className="p-3 text-center w-24">SL Trả Lại</th>
                      <th className="p-3 text-right">Đơn Giá</th>
                      <th className="p-3 text-right">Tiền Hoàn</th>
                      <th className="p-3">Lý Do Trả Hàng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {returnItems.map((item, idx) => {
                      return (
                        <tr key={idx} className={item.returnQty > 0 ? 'bg-rose-950/20' : ''}>
                          <td className="p-3 text-center font-bold text-slate-500">{idx + 1}</td>
                          <td className="p-3">
                            <div className="font-mono font-bold text-cyan-400">{item.sku}</div>
                            <div className="font-semibold text-white">{item.productName}</div>
                          </td>
                          <td className="p-3 text-center text-slate-400">{item.unit}</td>
                          <td className="p-3 text-center font-mono font-bold text-slate-300">{item.maxQty}</td>
                          <td className="p-3 text-center">
                            <input
                              type="number"
                              min="0"
                              max={item.maxQty}
                              value={item.returnQty}
                              onChange={(e) => {
                                const val = Math.min(item.maxQty, Math.max(0, parseInt(e.target.value) || 0));
                                setReturnItems(
                                  returnItems.map((r, rIdx) => (rIdx === idx ? { ...r, returnQty: val } : r))
                                );
                              }}
                              className="w-16 px-2 py-1 bg-slate-900 border border-rose-500/50 rounded-lg text-rose-300 font-mono font-bold text-center focus:outline-none focus:ring-1 focus:ring-rose-400"
                            />
                          </td>
                          <td className="p-3 text-right font-mono text-slate-300">{formatVND(item.unitPrice)}</td>
                          <td className="p-3 text-right font-mono font-bold text-rose-400">
                            {formatVND(item.returnQty * item.unitPrice)}
                          </td>
                          <td className="p-3 space-y-1">
                            <select
                              value={item.reason}
                              onChange={(e) => {
                                setReturnItems(
                                  returnItems.map((r, rIdx) => (rIdx === idx ? { ...r, reason: e.target.value } : r))
                                );
                              }}
                              className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-[11px] focus:outline-none focus:border-rose-500 cursor-pointer"
                            >
                              <option value="Lỗi kỹ thuật / Hỏng hóc">Lỗi kỹ thuật / Hỏng hóc</option>
                              <option value="Khách đổi ý / Không ưng ý">Khách đổi ý / Không ưng ý</option>
                              <option value="Giao sai chủng loại / model">Giao sai chủng loại / model</option>
                              <option value="Đổi sang sản phẩm khác">Đổi sang sản phẩm khác</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Options: Refund Method & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Phương Án Xử Lý Hoàn Tiền:</label>
                  <select
                    value={returnRefundMethod}
                    onChange={(e) => setReturnRefundMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    <option value="cash">💵 Hoàn Tiền Mặt (Phiếu Chi)</option>
                    <option value="transfer">💳 Hoàn Tiền Chuyển Khoản</option>
                    <option value="credit_note">📑 Trừ Vào Công Nợ Khách Hàng (Credit Note)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Ghi Chú Phiếu Trả Hàng:</label>
                  <input
                    type="text"
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    placeholder="VD: Khách mang lại trả do không vừa chân cắm..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 md:p-6 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSalesReturnOrder(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const activeReturns = returnItems.filter((it) => it.returnQty > 0);
                    const tempOrder: Order = {
                      ...salesReturnOrder,
                      items:
                        activeReturns.length > 0
                          ? activeReturns.map((it) => ({
                              productId: it.productId || `prod-${it.sku}`,
                              productName: it.productName,
                              sku: it.sku,
                              unit: it.unit,
                              quantity: it.returnQty,
                              unitPrice: it.unitPrice,
                              costPrice: 0,
                              discountPercent: 0,
                              total: it.returnQty * it.unitPrice,
                            }))
                          : salesReturnOrder.items,
                      total: activeReturns.reduce((acc, it) => acc + it.returnQty * it.unitPrice, salesReturnOrder.total),
                    };
                    setCustomPrintDoc({
                      isOpen: true,
                      order: tempOrder,
                      docType: 'sales_return',
                    });
                  }}
                  className="px-4 py-2.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/40 rounded-xl font-bold flex items-center space-x-1.5 cursor-pointer"
                  title="In Phiếu Hàng Bán Trả Lại Mẫu 02-TT (Theo Ảnh 2)"
                >
                  <Printer className="w-4 h-4" />
                  <span>🖨️ In Mẫu 02-TT (Ảnh 2)</span>
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSalesReturn}
                  className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl font-bold shadow-lg shadow-rose-600/30 flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>✓ Xác Nhận Trả Hàng & Nhập Kho</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {dispatchOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-xs">
            <div className="p-4 md:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center space-x-2">
                    <span>Điều Phối Vận Chuyển & Thu COD ({dispatchOrder.code})</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Cập nhật hãng vận chuyển, mã vận đơn và in tem dán bưu kiện
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDispatchOrder(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 md:p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Đơn Vị Vận Chuyển / Hãng Giao Hàng:
                </label>
                <select
                  value={dispatchCarrier}
                  onChange={(e) => setDispatchCarrier(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  {CARRIERS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-400">
                    Mã Vận Đơn (Tracking Number):
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const prefix = dispatchCarrier.includes('Viettel')
                        ? 'VTP'
                        : dispatchCarrier.includes('GHN')
                        ? 'GHN'
                        : dispatchCarrier.includes('GHTK')
                        ? 'GHTK'
                        : 'GPX';
                      setDispatchTrackingCode(`${prefix}-${Math.floor(100000 + Math.random() * 900000)}`);
                    }}
                    className="text-[10px] text-purple-400 hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Tự Động Sinh Mã</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={dispatchTrackingCode}
                  onChange={(e) => setDispatchTrackingCode(e.target.value)}
                  placeholder="VD: GPX-882319, VTP-4928120..."
                  className="w-full px-3 py-2 bg-slate-950 border border-purple-500/50 rounded-xl text-purple-300 font-mono font-bold text-xs focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Tên Người Nhận:</label>
                  <input
                    type="text"
                    value={dispatchRecipientName}
                    onChange={(e) => setDispatchRecipientName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Số Điện Thoại:</label>
                  <input
                    type="text"
                    value={dispatchRecipientPhone}
                    onChange={(e) => setDispatchRecipientPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-slate-700"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Địa Chỉ Nhận Hàng:</label>
                <input
                  type="text"
                  value={dispatchRecipientAddress}
                  onChange={(e) => setDispatchRecipientAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-slate-700"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-rose-400 mb-1">
                    Tiền Thu Hộ COD (VNĐ):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={dispatchCodAmount}
                    onChange={(e) => setDispatchCodAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-slate-950 border border-rose-500/40 rounded-xl text-rose-300 font-mono font-bold text-xs focus:outline-none focus:ring-1 focus:ring-rose-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Phí Vận Chuyển (VNĐ):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={dispatchShippingFee}
                    onChange={(e) => setDispatchShippingFee(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono text-xs focus:outline-none focus:border-slate-700"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Trạng Thái Giao Hàng:
                  </label>
                  <select
                    value={dispatchStatus}
                    onChange={(e) => setDispatchStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-slate-700 cursor-pointer"
                  >
                    <option value="pending_pickup">⏳ Chờ Đơn Vị Đến Lấy Hàng</option>
                    <option value="in_transit">🚚 Đang Trên Đường Giao</option>
                    <option value="delivered">✓ Đã Giao Thành Công & Thu COD</option>
                    <option value="delivery_failed">✕ Giao Thất Bại / Chờ Chuyển Hoàn</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Ghi Chú Giao Hàng:</label>
                  <input
                    type="text"
                    value={dispatchNotes}
                    onChange={(e) => setDispatchNotes(e.target.value)}
                    placeholder="VD: Cho xem hàng không cho thử..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-slate-700"
                  />
                </div>
              </div>
            </div>
            <div className="p-4 md:p-6 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setDispatchOrder(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const tempOrder: Order = {
                      ...dispatchOrder,
                      shippingPartner: dispatchCarrier,
                      trackingCode: dispatchTrackingCode,
                      codAmount: dispatchCodAmount,
                      recipientName: dispatchRecipientName,
                      recipientPhone: dispatchRecipientPhone,
                      recipientAddress: dispatchRecipientAddress,
                      deliveryNotes: dispatchNotes,
                    };
                    setCustomPrintDoc({
                      isOpen: true,
                      order: tempOrder,
                      docType: 'shipping_label',
                    });
                  }}
                  className="px-3.5 py-2 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/40 rounded-xl font-bold flex items-center space-x-1.5 cursor-pointer"
                >
                  <Tag className="w-4 h-4" />
                  <span>🏷️ In Tem Vận Đơn (K80)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const tempOrder: Order = {
                      ...dispatchOrder,
                      shippingPartner: dispatchCarrier,
                      trackingCode: dispatchTrackingCode,
                      codAmount: dispatchCodAmount,
                      recipientName: dispatchRecipientName,
                      recipientPhone: dispatchRecipientPhone,
                      recipientAddress: dispatchRecipientAddress,
                      deliveryNotes: dispatchNotes,
                    };
                    setCustomPrintDoc({
                      isOpen: true,
                      order: tempOrder,
                      docType: 'delivery_dispatch',
                    });
                  }}
                  className="px-3.5 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/40 rounded-xl font-bold flex items-center space-x-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>🖨️ In Phiếu Điều Phối</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveDispatch}
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-purple-600/30 flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>✓ Lưu Điều Phối</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNewOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-xs">
            <div className="p-4 md:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Tạo Đơn Bán Hàng Mới</h3>
                  <p className="text-xs text-slate-400">
                    Lập đơn bán hàng online / điện thoại / Zalo kèm vận chuyển và thu hộ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewOrderModal(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 md:p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Kênh Bán:</label>
                  <select
                    value={newOrderChannel}
                    onChange={(e) => setNewOrderChannel(e.target.value as OrderChannel)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Website">Website</option>
                    <option value="Shopee">Shopee</option>
                    <option value="TikTok Shop">TikTok Shop</option>
                    <option value="Facebook/Zalo">Facebook/Zalo</option>
                    <option value="Tại quầy (POS)">Tại quầy (POS)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Khách Hàng Đã Có (Tùy Chọn):
                  </label>
                  <select
                    onChange={(e) => {
                      const cust = customers.find((c) => c.id === e.target.value);
                      if (cust) {
                        setNewOrderCustomerName(cust.name);
                        setNewOrderCustomerPhone(cust.phone);
                        setNewOrderCustomerAddress(cust.address || '');
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="">-- Chọn khách hàng từ danh bạ --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} - {c.phone}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Tên Người Nhận:</label>
                  <input
                    type="text"
                    value={newOrderCustomerName}
                    onChange={(e) => setNewOrderCustomerName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Số Điện Thoại:</label>
                  <input
                    type="text"
                    value={newOrderCustomerPhone}
                    onChange={(e) => setNewOrderCustomerPhone(e.target.value)}
                    placeholder="0988..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Địa Chỉ Nhận:</label>
                  <input
                    type="text"
                    value={newOrderCustomerAddress}
                    onChange={(e) => setNewOrderCustomerAddress(e.target.value)}
                    placeholder="Số nhà, đường, quận/huyện..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-400">Chọn Sản Phẩm Vào Đơn:</label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {newOrderItems.length} sản phẩm đã chọn
                  </span>
                </div>
                <select
                  onChange={(e) => {
                    const prod = products.find((p) => p.id === e.target.value);
                    if (prod) {
                      const existIdx = newOrderItems.findIndex((it) => it.product.id === prod.id);
                      if (existIdx >= 0) {
                        const updated = [...newOrderItems];
                        updated[existIdx].quantity += 1;
                        setNewOrderItems(updated);
                      } else {
                        setNewOrderItems([
                          ...newOrderItems,
                          { product: prod, quantity: 1, unitPrice: prod.sellingPrice },
                        ]);
                      }
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-emerald-500/50 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
                >
                  <option value="">+ Bấm để thêm sản phẩm từ kho ERP...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.sku}] {p.name} - Giá: {formatVND(p.sellingPrice)} (Tồn: {p.stock})
                    </option>
                  ))}
                </select>
              </div>
              {newOrderItems.length > 0 && (
                <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[10px] uppercase font-bold">
                      <tr>
                        <th className="p-2.5">Sản Phẩm</th>
                        <th className="p-2.5 text-center w-20">Số Lượng</th>
                        <th className="p-2.5 text-right w-28">Đơn Giá</th>
                        <th className="p-2.5 text-right w-28">Thành Tiền</th>
                        <th className="p-2.5 text-center w-10">Xóa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {newOrderItems.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5">
                            <div className="font-bold text-white">{item.product.name}</div>
                            <div className="font-mono text-[10px] text-slate-400">{item.product.sku}</div>
                          </td>
                          <td className="p-2.5 text-center">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = Math.max(1, parseInt(e.target.value) || 1);
                                const updated = [...newOrderItems];
                                updated[idx].quantity = val;
                                setNewOrderItems(updated);
                              }}
                              className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center text-white font-mono font-bold"
                            />
                          </td>
                          <td className="p-2.5 text-right">
                            <input
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => {
                                const val = Math.max(0, parseInt(e.target.value) || 0);
                                const updated = [...newOrderItems];
                                updated[idx].unitPrice = val;
                                setNewOrderItems(updated);
                              }}
                              className="w-24 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right text-emerald-400 font-mono font-bold"
                            />
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-emerald-400">
                            {formatVND(item.quantity * item.unitPrice)}
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setNewOrderItems(newOrderItems.filter((_, i) => i !== idx));
                              }}
                              className="text-rose-400 hover:text-rose-300 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Hình Thức Thanh Toán:
                  </label>
                  <select
                    value={newOrderPaymentMethod}
                    onChange={(e) => setNewOrderPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-slate-700 cursor-pointer"
                  >
                    <option value="transfer">Chuyển Khoản Ngân Hàng (VietQR)</option>
                    <option value="cash">Tiền Mặt / Thu Hộ COD</option>
                    <option value="card">Thẻ / POS</option>
                    <option value="debt">Ghi Nợ Công Nợ 30 Ngày</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Trạng Thái Thanh Toán:
                  </label>
                  <select
                    value={newOrderPaymentStatus}
                    onChange={(e) => setNewOrderPaymentStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-slate-700 cursor-pointer"
                  >
                    <option value="unpaid">Chưa Thanh Toán (Thu COD)</option>
                    <option value="paid">Đã Thanh Toán Trước</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Phí Vận Chuyển (VNĐ):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newOrderShippingFee}
                    onChange={(e) => setNewOrderShippingFee(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono text-xs focus:outline-none focus:border-slate-700"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Ghi Chú Đơn Hàng:</label>
                <input
                  type="text"
                  value={newOrderNote}
                  onChange={(e) => setNewOrderNote(e.target.value)}
                  placeholder="Ghi chú giao hàng, đóng gói, quà tặng..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-slate-700"
                />
              </div>
            </div>
            <div className="p-4 md:p-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400">Tổng thanh toán: </span>
                <strong className="text-emerald-400 font-mono text-base">
                  {formatVND(
                    newOrderItems.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0) +
                      newOrderShippingFee
                  )}
                </strong>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  onClick={handleCreateNewOrder}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tạo & Lưu Đơn Hàng</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1">
                  <span className="text-slate-400 font-semibold block text-[11px]">
                    Thông tin người nhận:
                  </span>
                  <p className="font-bold text-slate-100">
                    {selectedOrder.recipientName || selectedOrder.customer?.name || 'Khách lẻ vãng lai'}
                  </p>
                  <p className="text-slate-300 font-mono">
                    {selectedOrder.recipientPhone || selectedOrder.customer?.phone || 'Không có SĐT'}
                  </p>
                  {(selectedOrder.recipientAddress || selectedOrder.customer?.address) && (
                    <p className="text-slate-400 text-[11px]">
                      {selectedOrder.recipientAddress || selectedOrder.customer?.address}
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
                  {selectedOrder.codAmount ? (
                    <p className="text-rose-400 font-mono font-bold">
                      Thu hộ COD: {formatVND(selectedOrder.codAmount)}
                    </p>
                  ) : null}
                  <p className="text-slate-400 text-[11px]">
                    Phí vận chuyển: {formatVND(selectedOrder.shippingFee || 0)}
                  </p>
                </div>
              </div>
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
                        <td className="p-2.5 text-right text-slate-400 font-mono">
                          {formatVND(item.unitPrice)}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-emerald-400">
                          {formatVND(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
              </div>
              {selectedOrder.note && (
                <div className="p-2.5 rounded-lg bg-slate-800 text-slate-300 text-xs">
                  <strong>Ghi chú:</strong> {selectedOrder.note}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-800 flex justify-end space-x-2 bg-slate-900">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  setPrintA4Order(selectedOrder);
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center space-x-1.5 shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In Phiếu A4/A5 (Gia Phúc)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setReceiptOrder(selectedOrder);
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl flex items-center space-x-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>In Bill K80</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {printA4Order && (
        <PrintInvoiceModal
          isOpen={!!printA4Order}
          order={printA4Order}
          settings={settings}
          onClose={() => setPrintA4Order(null)}
          onSaveSettings={onSaveSettings}
        />
      )}

      {receiptOrder && (
        <ReceiptModal
          order={receiptOrder}
          settings={settings}
          onClose={() => setReceiptOrder(null)}
        />
      )}

      {customPrintDoc?.isOpen && (
        <PrintInvoiceModal
          isOpen={customPrintDoc.isOpen}
          onClose={() => setCustomPrintDoc(null)}
          initialDocType={customPrintDoc.docType}
          order={customPrintDoc.order}
          orderCode={customPrintDoc.order.code}
          items={customPrintDoc.order.items.map((it, idx) => ({
            id: `item-${idx}`,
            sku: it.sku,
            productName: it.productName,
            unit: it.unit,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            total: it.total,
            serialNumber: (it as any).serialNumber || stockIssueSerials[it.productId || `item-${idx}`] || '',
          }))}
          customer={{
            name: customPrintDoc.order.recipientName || customPrintDoc.order.customer?.name || 'Khách Nhận Hàng',
            phone: customPrintDoc.order.recipientPhone || customPrintDoc.order.customer?.phone || '',
            address: customPrintDoc.order.recipientAddress || customPrintDoc.order.customer?.address || '',
          }}
          subtotal={customPrintDoc.order.subtotal}
          total={customPrintDoc.order.total}
          deliveryNote={
            customPrintDoc.docType === 'sales_return'
              ? `Hàng bán trả lại theo chứng từ gốc: ${customPrintDoc.order.code}`
              : customPrintDoc.docType === 'goods_delivery_record'
              ? 'Hàng hóa được giao nhận mới 100%, đầy đủ phụ kiện kèm theo.'
              : `Đơn vị VC: ${customPrintDoc.order.shippingPartner || 'Gia Phúc Express'} | Mã VĐ: ${customPrintDoc.order.trackingCode || '---'} | COD: ${formatVND(customPrintDoc.order.codAmount || 0)}`
          }
          creatorName="Thủ Kho / Điều Phối Viên Gia Phúc"
          warehouseName="Kho Hàng Hóa Gia Phúc Computer"
          settings={settings}
          onSaveSettings={onSaveSettings}
        />
      )}

      {/* Modal Lập Phiếu Trả Hàng & Hoàn Tiền (RMA) */}
      {showCreateReturnModal && onSaveReturn && (
        <CreateReturnModal
          isOpen={showCreateReturnModal}
          onClose={() => {
            setShowCreateReturnModal(false);
            setReturnPreSelectedOrder(null);
          }}
          orders={orders}
          products={products}
          customers={customers}
          serialRecords={serialRecords}
          settings={settings}
          preSelectedOrder={returnPreSelectedOrder}
          onSaveReturn={async (ret) => {
            await onSaveReturn(ret);
            setShowCreateReturnModal(false);
            setReturnPreSelectedOrder(null);
            setShowReturnsHistoryModal(true);
          }}
        />
      )}

      {/* Modal Lịch Sử Phiếu Trả Hàng */}
      {showReturnsHistoryModal && (
        <ReturnsHistoryModal
          isOpen={showReturnsHistoryModal}
          onClose={() => setShowReturnsHistoryModal(false)}
          returns={returns}
          settings={settings}
          onDeleteReturn={onDeleteReturn}
          onOpenCreateReturn={() => {
            setShowReturnsHistoryModal(false);
            setReturnPreSelectedOrder(null);
            setShowCreateReturnModal(true);
          }}
        />
      )}

      {/* Modal Ký Số Điện Tử CA Cho Đơn Hàng (Viettel / VNPT / USB Token) */}
      {signingOrder && (
        <DocumentSignerModal
          document={{
            id: signingOrder.id,
            code: signingOrder.code,
            title: `Đơn Hàng Thương Mại ${signingOrder.code} - Kênh ${signingOrder.channel}`,
            type: 'order',
            typeLabel: 'Đơn Hàng Bán',
            createdAt: signingOrder.createdAt,
            totalAmount: signingOrder.total,
            creatorName: 'Thu ngân POS / Quản trị đơn',
            recipientName: signingOrder.customer?.name || signingOrder.customerName || 'Khách lẻ',
            status: signingOrder.digitalSignature ? 'signed' : 'pending',
            legalStandard: 'PAdES B-LT (Luật Giao dịch điện tử 2023)',
            signature: signingOrder.digitalSignature,
          }}
          settings={settings}
          onClose={() => setSigningOrder(null)}
          onSignSuccess={handleOrderSignSuccess}
        />
      )}
    </div>
  );
};
