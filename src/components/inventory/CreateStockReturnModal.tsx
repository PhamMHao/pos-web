import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  RefreshCw,
  Plus,
  Trash2,
  AlertTriangle,
  ArrowDownLeft,
  Calculator,
  Search,
  CheckCircle2,
  CreditCard,
  Building2,
  FileText,
  Barcode,
  Layers,
  Sparkles,
  Tag,
  ShieldCheck,
  Package,
  Printer,
  DollarSign,
} from "lucide-react";
import { Product, Order, ReturnPolicyConfig, ReturnOrder, StoreSettings } from "../../types";
import { returnsApi } from "../../features/returns/api/returnsApi";
import { formatVND, parseCurrencyInput } from "../../utils/currency";
import { sounds } from "../../utils/soundEffects";
import { ReturnExchangePrintModal } from "./ReturnExchangePrintModal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orders: Order[];
  policy?: ReturnPolicyConfig;
  settings?: StoreSettings;
  onSuccess: (returnOrder: ReturnOrder) => void;
}

export const CreateStockReturnModal: React.FC<Props> = ({
  isOpen,
  onClose,
  products,
  orders,
  policy,
  settings,
  onSuccess,
}) => {
  // Post-Creation Print State
  const [createdReturn, setCreatedReturn] = useState<ReturnOrder | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [printDocType, setPrintDocType] = useState<"order" | "voucher" | "both">("voucher");

  // Form Header State
  const [selectedOrderCode, setSelectedOrderCode] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [customerId, setCustomerId] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerAddress, setCustomerAddress] = useState<string>("");
  const [warehouse, setWarehouse] = useState<string>("Kho Chính Gia Phúc Computer");
  const [reason, setReason] = useState<string>("customer_mind_change");
  const [refundMethod, setRefundMethod] = useState<"cash" | "transfer" | "debt_deduct" | "no_refund">("cash");
  const [notes, setNotes] = useState<string>("");

  // Items State
  const [items, setItems] = useState<
    Array<{
      originalOrderItemId?: string;
      productId: string;
      productName: string;
      sku: string;
      unit: string;
      ratioToBase: number;
      quantity: number;
      costPrice: number;
      unitPrice: number;
      refundUnitPrice: number;
      taxRate: number;
      condition: "normal" | "damaged" | "unopened";
      destinationType: "restock" | "faulty_warehouse";
      warehouseName: string;
      serials: string[];
      notes?: string;
    }>
  >([]);

  // Restocking fee & deductions
  const [restockingFeeType, setRestockingFeeType] = useState<"none" | "damaged_box" | "used" | "custom">("none");
  const [customRestockingFee, setCustomRestockingFee] = useState<number>(0);
  const [giftDeductionAmount, setGiftDeductionAmount] = useState<number>(0);

  // Serial input temp states
  const [serialInputs, setSerialInputs] = useState<{ [index: number]: string }>({});

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setCreatedReturn(null);
      setShowPrintModal(false);
      setSelectedOrderCode("");
      setSelectedOrder(null);
      setCustomerId("");
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setItems([]);
      setRestockingFeeType("none");
      setCustomRestockingFee(0);
      setGiftDeductionAmount(0);
      setErrorMsg(null);
      setNotes("");
    }
  }, [isOpen]);

  // Handle Order Selection
  const handleSelectOrder = (orderCode: string) => {
    setSelectedOrderCode(orderCode);
    const ord = orders.find((o) => o.code === orderCode);
    if (ord) {
      setSelectedOrder(ord);
      const cust = ord.customer || (ord as any);
      setCustomerId(cust.id || "");
      setCustomerName(cust.name || "");
      setCustomerPhone(cust.phone || "");
      setCustomerAddress(cust.address || "");

      if (ord.items && ord.items.length > 0) {
        const prefilled = ord.items.map((it: any) => {
          const prod = products.find((p) => p.id === it.productId || p.sku === it.sku);
          return {
            originalOrderItemId: it.id || undefined,
            productId: it.productId || prod?.id || "",
            productName: it.productName || prod?.name || "",
            sku: it.sku || prod?.sku || "",
            unit: it.unit || prod?.unit || "Cái",
            ratioToBase: 1,
            quantity: 1,
            costPrice: Number(it.costPrice) || Number(prod?.costPrice) || 0,
            unitPrice: Number(it.unitPrice) || Number(prod?.sellingPrice) || 0,
            refundUnitPrice: Number(it.unitPrice) || Number(prod?.sellingPrice) || 0,
            taxRate: 0,
            condition: "unopened" as const,
            destinationType: "restock" as const,
            warehouseName: "Kho Chính Gia Phúc Computer",
            serials: Array.isArray(it.serials) ? it.serials : it.serialNumber ? [it.serialNumber] : [],
          };
        });
        setItems(prefilled);
      } else {
        setItems([]);
      }
    } else {
      setSelectedOrder(null);
      setCustomerId("");
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setItems([]);
    }
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        productId: "",
        productName: "",
        sku: "",
        unit: "Cái",
        ratioToBase: 1,
        quantity: 1,
        costPrice: 0,
        unitPrice: 0,
        refundUnitPrice: 0,
        taxRate: 0,
        condition: "unopened",
        destinationType: "restock",
        warehouseName: "Kho Chính Gia Phúc Computer",
        serials: [],
      },
    ]);
  };

  const handleProductSelect = (index: number, prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;
    const next = [...items];
    next[index] = {
      ...next[index],
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      unit: prod.unit || "Cái",
      costPrice: Number(prod.costPrice) || 0,
      unitPrice: Number(prod.sellingPrice) || 0,
      refundUnitPrice: Number(prod.sellingPrice) || 0,
    };
    setItems(next);
  };

  const handleAddSerial = (index: number) => {
    const val = (serialInputs[index] || "").trim();
    if (!val) return;
    const next = [...items];
    if (!next[index].serials.includes(val)) {
      next[index].serials.push(val);
      setItems(next);
      setSerialInputs({ ...serialInputs, [index]: "" });
      sounds.beep();
    }
  };

  const handleRemoveSerial = (itemIdx: number, sIdx: number) => {
    const next = [...items];
    next[itemIdx].serials.splice(sIdx, 1);
    setItems(next);
  };

  // Math Calculations
  const grossSubtotal = useMemo(() => {
    return items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.refundUnitPrice) || 0), 0);
  }, [items]);

  const calculatedRestockingFee = useMemo(() => {
    if (restockingFeeType === "damaged_box") {
      const pct = policy?.restockingFeeDamagedBox || 10;
      return (grossSubtotal * pct) / 100;
    }
    if (restockingFeeType === "used") {
      const pct = policy?.restockingFeeUsed || 20;
      return (grossSubtotal * pct) / 100;
    }
    if (restockingFeeType === "custom") {
      return customRestockingFee;
    }
    return 0;
  }, [restockingFeeType, grossSubtotal, policy, customRestockingFee]);

  const netRefundAmount = useMemo(() => {
    return Math.max(0, grossSubtotal - calculatedRestockingFee - giftDeductionAmount);
  }, [grossSubtotal, calculatedRestockingFee, giftDeductionAmount]);

  const totalQuantity = useMemo(() => {
    return items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
  }, [items]);

  const isPastPolicyDays = useMemo(() => {
    if (!selectedOrder || !selectedOrder.createdAt) return false;
    const orderDate = new Date(selectedOrder.createdAt).getTime();
    const now = Date.now();
    const diffDays = (now - orderDate) / (1000 * 3600 * 24);
    const limitDays = policy?.returnPeriodDays || 15;
    return diffDays > limitDays;
  }, [selectedOrder, policy]);

  const handleSubmit = async (e?: React.FormEvent, printAfterSave: boolean = false) => {
    if (e) e.preventDefault();
    if (!customerName.trim()) {
      setErrorMsg("Vui lòng nhập họ tên khách hàng");
      return;
    }
    if (items.length === 0) {
      setErrorMsg("Vui lòng thêm ít nhất 1 sản phẩm trả lại");
      return;
    }

    for (const it of items) {
      if (!it.productId) {
        setErrorMsg("Có sản phẩm chưa được chọn trong danh mục");
        return;
      }
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const idempotencyKey = `ret-idem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      const payload = {
        type: "customer_return",
        originalOrderId: selectedOrder?.id,
        originalOrderCode: selectedOrder?.code || selectedOrderCode || null,
        customerId: customerId || selectedOrder?.customer?.id || (selectedOrder as any)?.customerId || null,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || null,
        customerAddress: customerAddress.trim() || null,
        warehouse,
        restockingFee: calculatedRestockingFee,
        giftDeductionAmount,
        refundMethod,
        reason,
        status: "completed",
        idempotencyKey,
        createdBy: "usr-admin-01",
        notes: notes.trim() || null,
        items: items.map((it) => ({
          originalOrderItemId: it.originalOrderItemId,
          productId: it.productId,
          productName: it.productName,
          sku: it.sku,
          unit: it.unit,
          ratioToBase: it.ratioToBase,
          quantity: it.quantity,
          costPrice: it.costPrice,
          unitPrice: it.unitPrice,
          refundUnitPrice: it.refundUnitPrice,
          taxRate: it.taxRate,
          condition: it.condition,
          destinationType: it.destinationType,
          warehouseName: it.warehouseName,
          serials: it.serials,
        })),
      };

      const result = await returnsApi.createReturnOrder(payload);
      sounds.success();
      setCreatedReturn(result);
      if (onSuccess) onSuccess(result);
      if (printAfterSave) {
        setPrintDocType("both");
        setShowPrintModal(true);
      }
    } catch (err: any) {
      sounds.error();
      setErrorMsg(err.response?.data?.message || err.message || "Lỗi khi tạo phiếu trả hàng");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (createdReturn) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 relative">
          <button
            type="button"
            onClick={() => {
              setCreatedReturn(null);
              setShowPrintModal(false);
              onClose();
            }}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Đóng & Quay lại trang danh sách"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Lập Phiếu Trả Hàng & Thu Hồi Thành Công!</h3>
            <p className="text-xs text-slate-400">Đã nhập kho giá vốn WAC, giảm trừ doanh thu (TK 5212) và hạch toán phiếu chi quỹ</p>
          </div>

          <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Mã phiếu trả hàng:</span>
              <span className="font-mono font-bold text-rose-400 text-sm">{createdReturn.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Khách hàng:</span>
              <span className="font-semibold text-white">{createdReturn.customerName || "Khách lẻ"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tổng tiền hoàn trả:</span>
              <span className="font-bold text-white font-mono">{formatVND(createdReturn.refundAmount)}</span>
            </div>
            {createdReturn.accountingCode && (
              <div className="flex justify-between pt-2 border-t border-slate-700">
                <span className="text-slate-400">Phiếu chi tiền quỹ (02-TT):</span>
                <span className="font-mono font-bold text-amber-400">{createdReturn.accountingCode}</span>
              </div>
            )}
            {createdReturn.inboundReceiptCode && (
              <div className="flex justify-between">
                <span className="text-slate-400">Phiếu nhập kho thu hồi (01-VT):</span>
                <span className="font-mono font-bold text-blue-400">{createdReturn.inboundReceiptCode}</span>
              </div>
            )}
          </div>

          {/* Document selection options */}
          <div className="space-y-2 pt-1 text-xs">
            <div className="text-[11px] font-bold uppercase text-slate-400">Chọn mẫu chứng từ cần in:</div>
            
            <button
              type="button"
              onClick={() => {
                setPrintDocType("both");
                setShowPrintModal(true);
              }}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>🖨️ In Trọn Bộ Chứng Từ (Kho, Quỹ & Pháp Lý NĐ 123)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPrintDocType("legal_return");
                setShowPrintModal(true);
              }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>⚖️ Biên Bản Trả Hàng & Thu Hồi Hoá Đơn (NĐ 123 / TT 78)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPrintDocType("inbound");
                setShowPrintModal(true);
              }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/40 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Package className="w-4 h-4 text-blue-400" />
              <span>📥 Phiếu Nhập Kho Thu Hồi Hàng Trả (Mẫu 01-VT / 02-VT)</span>
            </button>

            {createdReturn.accountingCode && (
              <button
                type="button"
                onClick={() => {
                  setPrintDocType("voucher");
                  setShowPrintModal(true);
                }}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/40 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <DollarSign className="w-4 h-4 text-rose-400" />
                <span>💸 Phiếu Chi Tiền Hoàn Trả Khách Hàng (Mẫu 02-TT)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setPrintDocType("summary");
                setShowPrintModal(true);
              }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <span>📋 Phiếu Trả Hàng Tổng Hợp (Khổ A4 / Bill Nhiệt K80)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setCreatedReturn(null);
              setShowPrintModal(false);
              onClose();
            }}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Hoàn Tất & Đóng
          </button>

          <ReturnExchangePrintModal
            isOpen={showPrintModal}
            onClose={() => {
              setShowPrintModal(false);
              setCreatedReturn(null);
              onClose();
            }}
            returnOrder={createdReturn}
            initialDocType={printDocType}
            settings={settings}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 md:p-6 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Lập Phiếu Trả Hàng & Hoàn Tiền (Customer Return)
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Chuẩn ERP Doanh Nghiệp
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Nhập kho theo giá vốn gốc, giảm trừ doanh thu (TK 5212) và lập phiếu chi hoàn tiền
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-sm flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isPastPolicyDays && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl text-sm flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
              <div>
                <span className="font-semibold">Cảnh báo thời hạn chính sách:</span> Hóa đơn gốc đã vượt quá thời hạn cho phép trả hàng hoàn tiền ({policy?.returnPeriodDays || 15} ngày). Vui lòng xác nhận sự phê duyệt của Quản lý.
              </div>
            </div>
          )}

          {/* Section 1: Hóa đơn & Khách hàng */}
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
              <FileText className="w-4 h-4" /> 1. Thông Tin Hóa Đơn Gốc & Khách Hàng
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Chọn Hóa Đơn Mua Hàng Gốc
                </label>
                <select
                  value={selectedOrderCode}
                  onChange={(e) => handleSelectOrder(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="">-- Trả hàng không hóa đơn --</option>
                  {orders.map((o) => {
                    const cName = o.customer?.name || (o as any).customerName || "Khách lẻ";
                    return (
                      <option key={o.id} value={o.code}>
                        {o.code} - {cName} ({formatVND(o.total)})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Họ Tên Khách Hàng <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nhập tên khách..."
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Số Điện Thoại
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0985..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Lý Do Trả Hàng
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="customer_mind_change">Khách đổi ý không còn nhu cầu</option>
                  <option value="defective">Sản phẩm bị lỗi kỹ thuật / Không sử dụng được</option>
                  <option value="wrong_item">Giao sai chủng loại / thông số</option>
                  <option value="other">Lý do khác</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Danh sách sản phẩm trả lại */}
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                <Layers className="w-4 h-4" /> 2. Danh Sách Sản Phẩm Khách Trả Lại
              </h4>
              {!selectedOrder && (
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm Sản Phẩm
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs italic">
                {selectedOrder
                  ? "Đơn hàng này không có sản phẩm khả dụng để hoàn trả."
                  : "Chưa có sản phẩm nào. Hãy chọn Hóa đơn / Đơn hàng gốc phía trên để tải danh sách sản phẩm."}
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((it, idx) => (
                  <div key={idx} className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/80 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        {selectedOrder ? (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] text-slate-400 font-medium">Sản phẩm hoàn trả từ đơn {selectedOrder.code}:</label>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-mono">
                                ĐVT: {it.unit || "Cái"}
                              </span>
                            </div>
                            <div className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-white">
                              [{it.sku}] {it.productName}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="text-xs text-slate-400 block mb-1">Chọn sản phẩm trả lại:</label>
                            <select
                              value={it.productId}
                              onChange={(e) => handleProductSelect(idx, e.target.value)}
                              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                            >
                              <option value="">-- Chọn sản phẩm --</option>
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  [{p.sku}] {p.name} - Giá gốc: {formatVND(p.sellingPrice || (p as any).price || 0)}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...items];
                          next.splice(idx, 1);
                          setItems(next);
                        }}
                        className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-slate-800 transition-colors mt-5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-400 block">Số lượng trả:</label>
                        <input
                          type="number"
                          min={1}
                          value={it.quantity}
                          onChange={(e) => {
                            const next = [...items];
                            next[idx].quantity = Number(e.target.value) || 1;
                            setItems(next);
                          }}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block">Đơn giá hoàn tiền (VND):</label>
                        <input
                          type="text"
                          value={formatVND(it.refundUnitPrice).replace(" ₫", "")}
                          onChange={(e) => {
                            const next = [...items];
                            next[idx].refundUnitPrice = parseCurrencyInput(e.target.value);
                            setItems(next);
                          }}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-rose-300 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block">Tình trạng bao bì:</label>
                        <select
                          value={it.condition}
                          onChange={(e) => {
                            const next = [...items];
                            next[idx].condition = e.target.value as any;
                            setItems(next);
                          }}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        >
                          <option value="unopened">Nguyên seal / Hộp mới 100%</option>
                          <option value="normal">Đã bóc hộp / Dùng lướt</option>
                          <option value="damaged">Hộp rách, móp / Lỗi kỹ thuật</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block">Kho nhập lại:</label>
                        <select
                          value={it.destinationType}
                          onChange={(e) => {
                            const next = [...items];
                            next[idx].destinationType = e.target.value as any;
                            setItems(next);
                          }}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        >
                          <option value="restock">Nhập kho chính (Bán lại)</option>
                          <option value="faulty_warehouse">Kho cách ly / Bảo hành</option>
                        </select>
                      </div>
                    </div>

                    {/* Serial Numbers */}
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                          <Barcode className="w-3.5 h-3.5 text-rose-400" /> Mã Serial / IMEI trả lại ({it.serials.length}/{it.quantity})
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={serialInputs[idx] || ""}
                          onChange={(e) =>
                            setSerialInputs({ ...serialInputs, [idx]: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddSerial(idx);
                            }
                          }}
                          placeholder="Quét hoặc nhập mã Serial..."
                          className="flex-1 bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1 text-xs text-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddSerial(idx)}
                          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-xs font-semibold"
                        >
                          Thêm Serial
                        </button>
                      </div>
                      {it.serials.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {it.serials.map((s, sIdx) => (
                            <span
                              key={sIdx}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono"
                            >
                              {s}
                              <button
                                type="button"
                                onClick={() => handleRemoveSerial(idx, sIdx)}
                                className="hover:text-rose-100"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-right text-xs text-slate-400">
                      Thành tiền: <span className="font-bold text-rose-400">{formatVND(it.quantity * it.refundUnitPrice)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Phí Khấu Trừ & Tổng Số Tiền Hoàn Trả */}
          <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
              <Calculator className="w-4 h-4" /> 3. Khấu Trừ Phí & Tổng Tiền Thực Hoàn Cho Khách
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Phí Khấu Trừ Lưu Kho (Restocking Fee)
                </label>
                <select
                  value={restockingFeeType}
                  onChange={(e) => setRestockingFeeType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="none">Không thu phí (0%)</option>
                  <option value="damaged_box">Hộp móp / Rách vỏ ({policy?.restockingFeeDamagedBox || 10}%)</option>
                  <option value="used">Đã qua sử dụng / Trầy xước ({policy?.restockingFeeUsed || 20}%)</option>
                  <option value="custom">Tùy chỉnh số tiền</option>
                </select>
                {restockingFeeType === "custom" && (
                  <input
                    type="text"
                    value={formatVND(customRestockingFee).replace(" ₫", "")}
                    onChange={(e) => setCustomRestockingFee(parseCurrencyInput(e.target.value))}
                    placeholder="Số tiền phí..."
                    className="w-full mt-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Khấu Trừ Quà Tặng / Khuyến Mãi Kèm Theo (VND)
                </label>
                <input
                  type="text"
                  value={formatVND(giftDeductionAmount).replace(" ₫", "")}
                  onChange={(e) => setGiftDeductionAmount(parseCurrencyInput(e.target.value))}
                  placeholder="0"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Hình Thức Hoàn Tiền
                </label>
                <select
                  value={refundMethod}
                  onChange={(e) => setRefundMethod(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="cash">Tiền mặt tại quầy (Phiếu Chi Quỹ PC-TH)</option>
                  <option value="transfer">Chuyển khoản ngân hàng</option>
                  <option value="debt_deduct">Cấn trừ công nợ khách hàng</option>
                  <option value="no_refund">Không hoàn tiền</option>
                </select>
              </div>
            </div>

            {/* Bảng tính tổng tiền */}
            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Tổng giá trị hàng trả ({totalQuantity} món):</span>
                <span className="text-white font-semibold">{formatVND(grossSubtotal)}</span>
              </div>
              {calculatedRestockingFee > 0 && (
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Trừ phí khấu trừ lưu kho (Restocking Fee):</span>
                  <span className="text-amber-400 font-semibold">-{formatVND(calculatedRestockingFee)}</span>
                </div>
              )}
              {giftDeductionAmount > 0 && (
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Trừ giá trị quà tặng kèm theo:</span>
                  <span className="text-amber-400 font-semibold">-{formatVND(giftDeductionAmount)}</span>
                </div>
              )}
              <div className="border-t border-slate-800 pt-2 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-white">Tổng Tiền Hoàn Trả Thực Tế:</span>
                  <span className="text-xs text-slate-400 block">
                    {refundMethod === "cash"
                      ? "👉 Tự động sinh Phiếu Chi Quỹ Tiền Mặt (PC-TH)"
                      : refundMethod === "debt_deduct"
                      ? "👉 Tự động giảm trừ công nợ khách hàng"
                      : "👉 Hoàn tiền chuyển khoản qua tài khoản ngân hàng"}
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-rose-400">
                  {formatVND(netRefundAmount)}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Ghi Chú Trả Hàng:</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi chú chi tiết về tình trạng sản phẩm hoặc biên bản bàn giao..."
                rows={2}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Hệ thống tự động cộng kho theo giá vốn gốc và hạch toán giảm trừ doanh thu</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium text-sm transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit(undefined, true)}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 flex items-center gap-2 text-sm transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                title="Lưu vào hệ thống và mở ngay bộ chọn in chứng từ (Kho, Quỹ, NĐ 123)"
              >
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4 text-blue-200" />}
                <span>Lưu & In Phiếu Trả Hàng (A4 / NĐ 123)</span>
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl font-bold shadow-lg shadow-rose-500/25 flex items-center gap-2 text-sm transition-all disabled:opacity-50 cursor-pointer active:scale-95"
              >
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Hoàn Tất & Ghi Sổ</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
