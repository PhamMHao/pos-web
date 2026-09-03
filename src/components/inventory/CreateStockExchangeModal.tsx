import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  RefreshCw,
  Plus,
  Trash2,
  AlertTriangle,
  ArrowRightLeft,
  ArrowDownLeft,
  ArrowUpRight,
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
  Printer,
  DollarSign,
  Package,
} from "lucide-react";
import { Product, Order, ReturnPolicyConfig, ProductExchange, StoreSettings } from "../../types";
import { exchangesApi } from "../../features/exchanges/api/exchangesApi";
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
  onSuccess: (exchange: ProductExchange) => void;
}

export const CreateStockExchangeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  products,
  orders,
  policy,
  settings,
  onSuccess,
}) => {
  // Post-Creation Print State
  const [createdExchange, setCreatedExchange] = useState<ProductExchange | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [printDocType, setPrintDocType] = useState<"order" | "voucher" | "both">("voucher");

  // Form Header State
  const [selectedOrderCode, setSelectedOrderCode] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [customerId, setCustomerId] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerAddress, setCustomerAddress] = useState<string>("");
  const [warehouseName, setWarehouseName] = useState<string>("Kho Chính Gia Phúc Computer");
  const [reason, setReason] = useState<string>("upgrade_model");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer" | "debt_adjust">("cash");
  const [notes, setNotes] = useState<string>("");

  // Inbound Items (Hàng nhận lại từ khách)
  const [inItems, setInItems] = useState<
    Array<{
      originalOrderItemId?: string;
      productId: string;
      productName: string;
      sku: string;
      unit: string;
      ratioToBase: number;
      quantity: number;
      costPrice: number;
      returnUnitPrice: number;
      taxRate: number;
      condition: "normal" | "damaged" | "unopened";
      destinationType: "restock" | "faulty_warehouse";
      warehouseName: string;
      serials: string[];
      notes?: string;
    }>
  >([]);

  // Outbound Items (Hàng xuất mới cho khách)
  const [outItems, setOutItems] = useState<
    Array<{
      productId: string;
      productName: string;
      sku: string;
      unit: string;
      ratioToBase: number;
      quantity: number;
      costPrice: number;
      exchangeUnitPrice: number;
      taxRate: number;
      warehouseName: string;
      warrantyMonths: number;
      serials: string[];
      notes?: string;
    }>
  >([]);

  // Phí khấu trừ & quà tặng
  const [restockingFeeType, setRestockingFeeType] = useState<"none" | "damaged_box" | "used" | "custom">("none");
  const [customRestockingFee, setCustomRestockingFee] = useState<number>(0);
  const [giftDeductionAmount, setGiftDeductionAmount] = useState<number>(0);

  // Status & Validation
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Serial input temp states
  const [inSerialInput, setInSerialInput] = useState<{ [index: number]: string }>({});
  const [outSerialInput, setOutSerialInput] = useState<{ [index: number]: string }>({});

  // Reset when open
  useEffect(() => {
    if (isOpen) {
      setCreatedExchange(null);
      setShowPrintModal(false);
      setSelectedOrderCode("");
      setSelectedOrder(null);
      setCustomerId("");
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setInItems([]);
      setOutItems([]);
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

      // Autofill inItems from Order
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
            returnUnitPrice: Number(it.unitPrice) || Number(prod?.sellingPrice) || 0,
            taxRate: 0,
            condition: "normal" as const,
            destinationType: "restock" as const,
            warehouseName: "Kho Chính Gia Phúc Computer",
            serials: Array.isArray(it.serials) ? it.serials : it.serialNumber ? [it.serialNumber] : [],
          };
        });
        setInItems(prefilled);
      } else {
        setInItems([]);
      }
    } else {
      setSelectedOrder(null);
      setCustomerId("");
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setInItems([]);
    }
  };

  // Add blank Inbound Item
  const handleAddInItem = () => {
    setInItems([
      ...inItems,
      {
        productId: "",
        productName: "",
        sku: "",
        unit: "Cái",
        ratioToBase: 1,
        quantity: 1,
        costPrice: 0,
        returnUnitPrice: 0,
        taxRate: 0,
        condition: "normal",
        destinationType: "restock",
        warehouseName: "Kho Chính Gia Phúc Computer",
        serials: [],
      },
    ]);
  };

  // Select product for Inbound Item
  const handleInProductSelect = (index: number, prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;
    const next = [...inItems];
    next[index] = {
      ...next[index],
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      unit: prod.unit || "Cái",
      costPrice: Number(prod.costPrice) || 0,
      returnUnitPrice: Number(prod.sellingPrice) || 0,
    };
    setInItems(next);
  };

  // Add blank Outbound Item
  const handleAddOutItem = () => {
    setOutItems([
      ...outItems,
      {
        productId: "",
        productName: "",
        sku: "",
        unit: "Cái",
        ratioToBase: 1,
        quantity: 1,
        costPrice: 0,
        exchangeUnitPrice: 0,
        taxRate: 0,
        warehouseName: "Kho Chính Gia Phúc Computer",
        warrantyMonths: 24,
        serials: [],
      },
    ]);
  };

  // Select product for Outbound Item
  const handleOutProductSelect = (index: number, prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;
    const next = [...outItems];
    next[index] = {
      ...next[index],
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      unit: prod.unit || "Cái",
      costPrice: Number(prod.costPrice) || 0,
      exchangeUnitPrice: Number(prod.sellingPrice) || 0,
    };
    setOutItems(next);
  };

  // Serial Management Helpers
  const handleAddInSerial = (index: number) => {
    const val = (inSerialInput[index] || "").trim();
    if (!val) return;
    const next = [...inItems];
    if (!next[index].serials.includes(val)) {
      next[index].serials.push(val);
      setInItems(next);
      setInSerialInput({ ...inSerialInput, [index]: "" });
      sounds.beep();
    }
  };

  const handleRemoveInSerial = (itemIdx: number, sIdx: number) => {
    const next = [...inItems];
    next[itemIdx].serials.splice(sIdx, 1);
    setInItems(next);
  };

  const handleAddOutSerial = (index: number) => {
    const val = (outSerialInput[index] || "").trim();
    if (!val) return;
    const next = [...outItems];
    if (!next[index].serials.includes(val)) {
      next[index].serials.push(val);
      setOutItems(next);
      setOutSerialInput({ ...outSerialInput, [index]: "" });
      sounds.beep();
    }
  };

  const handleRemoveOutSerial = (itemIdx: number, sIdx: number) => {
    const next = [...outItems];
    next[itemIdx].serials.splice(sIdx, 1);
    setOutItems(next);
  };

  // Math Calculations
  const inboundSubtotal = useMemo(() => {
    return inItems.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.returnUnitPrice) || 0), 0);
  }, [inItems]);

  const inboundTax = useMemo(() => {
    return inItems.reduce((sum, it) => {
      const lineSub = (Number(it.quantity) || 0) * (Number(it.returnUnitPrice) || 0);
      return sum + (lineSub * (Number(it.taxRate) || 0)) / 100;
    }, 0);
  }, [inItems]);

  const inboundTotal = inboundSubtotal + inboundTax;

  const outboundSubtotal = useMemo(() => {
    return outItems.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.exchangeUnitPrice) || 0), 0);
  }, [outItems]);

  const outboundTax = useMemo(() => {
    return outItems.reduce((sum, it) => {
      const lineSub = (Number(it.quantity) || 0) * (Number(it.exchangeUnitPrice) || 0);
      return sum + (lineSub * (Number(it.taxRate) || 0)) / 100;
    }, 0);
  }, [outItems]);

  const outboundTotal = outboundSubtotal + outboundTax;

  // Restocking fee calculation
  const calculatedRestockingFee = useMemo(() => {
    if (restockingFeeType === "damaged_box") {
      const pct = policy?.restockingFeeDamagedBox || 10;
      return (inboundTotal * pct) / 100;
    }
    if (restockingFeeType === "used") {
      const pct = policy?.restockingFeeUsed || 20;
      return (inboundTotal * pct) / 100;
    }
    if (restockingFeeType === "custom") {
      return customRestockingFee;
    }
    return 0;
  }, [restockingFeeType, inboundTotal, policy, customRestockingFee]);

  // Delta difference calculation: Delta = V_xuat - V_nhap + restockingFee + giftDeductionAmount
  const differenceAmount = useMemo(() => {
    return outboundTotal - inboundTotal + calculatedRestockingFee + giftDeductionAmount;
  }, [outboundTotal, inboundTotal, calculatedRestockingFee, giftDeductionAmount]);

  // Check policy days warning
  const isPastPolicyDays = useMemo(() => {
    if (!selectedOrder || !selectedOrder.createdAt) return false;
    const orderDate = new Date(selectedOrder.createdAt).getTime();
    const now = Date.now();
    const diffDays = (now - orderDate) / (1000 * 3600 * 24);
    const limitDays = policy?.exchangePeriodDays || 30;
    return diffDays > limitDays;
  }, [selectedOrder, policy]);

  // Submit Handler
  const handleSubmit = async (e?: React.FormEvent, printAfterSave: boolean = false) => {
    if (e) e.preventDefault();
    if (!customerName.trim()) {
      setErrorMsg("Vui lòng nhập họ tên khách hàng");
      return;
    }
    if (inItems.length === 0 && outItems.length === 0) {
      setErrorMsg("Vui lòng thêm ít nhất 1 sản phẩm nhận lại hoặc đổi mới");
      return;
    }

    // Validate valid selections
    for (const inIt of inItems) {
      if (!inIt.productId) {
        setErrorMsg("Có sản phẩm nhận lại chưa được chọn trong danh mục");
        return;
      }
    }
    for (const outIt of outItems) {
      if (!outIt.productId) {
        setErrorMsg("Có sản phẩm xuất mới chưa được chọn trong danh mục");
        return;
      }
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const idempotencyKey = `ex-idem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      const payload = {
        originalOrderId: selectedOrder?.id,
        originalOrderCode: selectedOrder?.code || selectedOrderCode || null,
        customerId: customerId || selectedOrder?.customer?.id || (selectedOrder as any)?.customerId || null,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || null,
        customerAddress: customerAddress.trim() || null,
        warehouseName,
        restockingFee: calculatedRestockingFee,
        giftDeductionAmount,
        paymentMethod,
        status: "completed",
        idempotencyKey,
        createdBy: "usr-admin-01",
        reason,
        notes: notes.trim() || null,
        inItems: inItems.map((it) => ({
          originalOrderItemId: it.originalOrderItemId,
          productId: it.productId,
          productName: it.productName,
          sku: it.sku,
          unit: it.unit,
          ratioToBase: it.ratioToBase,
          quantity: it.quantity,
          costPrice: it.costPrice,
          returnUnitPrice: it.returnUnitPrice,
          taxRate: it.taxRate,
          condition: it.condition,
          destinationType: it.destinationType,
          warehouseName: it.warehouseName,
          serials: it.serials,
        })),
        outItems: outItems.map((it) => ({
          productId: it.productId,
          productName: it.productName,
          sku: it.sku,
          unit: it.unit,
          ratioToBase: it.ratioToBase,
          quantity: it.quantity,
          costPrice: it.costPrice,
          exchangeUnitPrice: it.exchangeUnitPrice,
          taxRate: it.taxRate,
          warehouseName: it.warehouseName,
          warrantyMonths: it.warrantyMonths,
          serials: it.serials,
        })),
      };

      const result = await exchangesApi.createExchange(payload);
      sounds.success();
      setCreatedExchange(result);
      if (onSuccess) onSuccess(result);
      if (printAfterSave) {
        setPrintDocType("both");
        setShowPrintModal(true);
      }
    } catch (err: any) {
      sounds.error();
      setErrorMsg(err.response?.data?.message || err.message || "Lỗi khi tạo phiếu đổi hàng");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (createdExchange) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 relative">
          <button
            type="button"
            onClick={() => {
              setCreatedExchange(null);
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
            <h3 className="text-lg font-bold text-white">Lập Phiếu Đổi Hàng & Xuất Nhập Kho Thành Công!</h3>
            <p className="text-xs text-slate-400">Đã đồng bộ 2 luồng Kho Nhận & Kho Xuất, hạch toán Sổ Nhật Ký & Sổ Quỹ</p>
          </div>

          <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Mã phiếu đổi hàng:</span>
              <span className="font-mono font-bold text-cyan-400 text-sm">{createdExchange.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Khách hàng:</span>
              <span className="font-semibold text-white">{createdExchange.customerName || "Khách lẻ"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Chênh lệch thanh toán (Δ):</span>
              <span className="font-bold text-white font-mono">{formatVND(createdExchange.differenceAmount)}</span>
            </div>
            {createdExchange.accountingCode && (
              <div className="flex justify-between pt-2 border-t border-slate-700">
                <span className="text-slate-400">Phiếu thu/chi tiền quỹ:</span>
                <span className="font-mono font-bold text-amber-400">{createdExchange.accountingCode}</span>
              </div>
            )}
            {createdExchange.inboundReceiptCode && (
              <div className="flex justify-between">
                <span className="text-slate-400">Phiếu nhập kho thu hồi:</span>
                <span className="font-mono font-bold text-blue-400">{createdExchange.inboundReceiptCode}</span>
              </div>
            )}
            {createdExchange.outboundIssueCode && (
              <div className="flex justify-between">
                <span className="text-slate-400">Phiếu xuất kho đổi mới:</span>
                <span className="font-mono font-bold text-emerald-400">{createdExchange.outboundIssueCode}</span>
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
              <span>🖨️ In Trọn Bộ Chứng Từ Đổi Hàng (Kho, Quỹ & Pháp Lý)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPrintDocType("legal_exchange");
                setShowPrintModal(true);
              }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>⚖️ Biên Bản Đổi Hàng & Thay Đổi Hoá Đơn (NĐ 123 / TT 78)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPrintDocType("legal_handover");
                setShowPrintModal(true);
              }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/40 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-teal-400" />
              <span>🔄 Biên Bản Bàn Giao - Trao Đổi Hàng (Thu Cũ Đổi Mới)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPrintDocType("inbound");
                  setShowPrintModal(true);
                }}
                className="py-2 bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/40 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-[11px]"
              >
                <Package className="w-3.5 h-3.5 text-blue-400" />
                <span>📥 Phiếu Nhập Kho (01-VT)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPrintDocType("outbound");
                  setShowPrintModal(true);
                }}
                className="py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-[11px]"
              >
                <Package className="w-3.5 h-3.5 text-emerald-400" />
                <span>📤 Phiếu Xuất Kho (02-VT)</span>
              </button>
            </div>

            {createdExchange.accountingCode && (
              <button
                type="button"
                onClick={() => {
                  setPrintDocType("voucher");
                  setShowPrintModal(true);
                }}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <DollarSign className="w-4 h-4 text-amber-400" />
                <span>💵 Phiếu Thu / Chi Tiền Quỹ (Mẫu 01/02-TT)</span>
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
              <span>📋 Phiếu Đổi Hàng Tổng Hợp (Khổ A4 / Bill Nhiệt K80)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setCreatedExchange(null);
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
              setCreatedExchange(null);
              onClose();
            }}
            exchange={createdExchange}
            initialDocType={printDocType}
            settings={settings}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 md:p-6 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Lập Phiếu Đổi Hàng 2 Chiều (Product Exchange)
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Chuẩn ERP Doanh Nghiệp
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Tự động cân đối kho nhận lại & xuất mới, hạch toán bút toán kép & phiếu thu/chi quỹ chênh lệch
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
                <span className="font-semibold">Cảnh báo thời hạn chính sách:</span> Hóa đơn gốc được lập quá thời hạn đổi hàng quy định ({policy?.exchangePeriodDays || 30} ngày). Vui lòng xác nhận sự phê duyệt của Quản lý trước khi tiếp tục.
              </div>
            </div>
          )}

          {/* Section 1: Thông tin đơn gốc & Khách hàng */}
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <FileText className="w-4 h-4" /> 1. Thông Tin Đơn Hàng Gốc & Khách Hàng
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Chọn Hóa Đơn Gốc (Nếu có)
                </label>
                <select
                  value={selectedOrderCode}
                  onChange={(e) => handleSelectOrder(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">-- Đổi hàng không hóa đơn --</option>
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
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
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
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Lý Do Đổi Hàng
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="upgrade_model">Khách nâng cấp model cao hơn</option>
                  <option value="defective_exchange">Đổi do sản phẩm lỗi kỹ thuật (1 đổi 1)</option>
                  <option value="color_size_change">Đổi màu sắc / thông số phù hợp</option>
                  <option value="customer_mind_change">Khách đổi ý muốn dùng loại khác</option>
                  <option value="other">Lý do khác</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Giao diện 2 cột Đổi Hàng (Inbound vs Outbound) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cột Trái: Hàng Nhận Lại (Inbound) */}
            <div className="bg-slate-800/40 p-4 rounded-xl border border-red-500/20 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-red-500/20 text-red-400 rounded-lg">
                    <ArrowDownLeft className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Hàng Nhận Lại Từ Khách (Inbound)</h4>
                    <span className="text-xs text-slate-400">Nhập lại kho theo giá vốn & giảm trừ doanh thu</span>
                  </div>
                </div>
                {!selectedOrder && (
                  <button
                    type="button"
                    onClick={handleAddInItem}
                    className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm Món
                  </button>
                )}
              </div>

              {inItems.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs italic">
                  {selectedOrder
                    ? "Đơn hàng này không có sản phẩm khả dụng để hoàn trả."
                    : "Chưa có sản phẩm nhận lại. Hãy chọn Hóa đơn / Đơn hàng gốc phía trên để tải danh sách sản phẩm."}
                </div>
              ) : (
                <div className="space-y-3">
                  {inItems.map((it, idx) => (
                    <div key={idx} className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/80 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          {selectedOrder ? (
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-[11px] text-slate-400 font-medium">Sản phẩm từ hoá đơn {selectedOrder.code}:</label>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/20 font-mono">
                                  ĐVT: {it.unit || "Cái"}
                                </span>
                              </div>
                              <div className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-white">
                                [{it.sku}] {it.productName}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <label className="text-xs text-slate-400 block mb-1">Chọn sản phẩm nhận:</label>
                              <select
                                value={it.productId}
                                onChange={(e) => handleInProductSelect(idx, e.target.value)}
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                              >
                                <option value="">-- Chọn sản phẩm --</option>
                                {products.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    [{p.sku}] {p.name} - Giá bán: {formatVND(p.sellingPrice || (p as any).price || 0)}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const next = [...inItems];
                            next.splice(idx, 1);
                            setInItems(next);
                          }}
                          className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors mt-5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[11px] text-slate-400 block">Số lượng:</label>
                          <input
                            type="number"
                            min={1}
                            value={it.quantity}
                            onChange={(e) => {
                              const next = [...inItems];
                              next[idx].quantity = Number(e.target.value) || 1;
                              setInItems(next);
                            }}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[11px] text-slate-400 block">Định giá hoàn trả (VND):</label>
                          <input
                            type="text"
                            value={formatVND(it.returnUnitPrice).replace(" ₫", "")}
                            onChange={(e) => {
                              const next = [...inItems];
                              next[idx].returnUnitPrice = parseCurrencyInput(e.target.value);
                              setInItems(next);
                            }}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-red-300 font-semibold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] text-slate-400 block">Tình trạng hàng:</label>
                          <select
                            value={it.condition}
                            onChange={(e) => {
                              const next = [...inItems];
                              next[idx].condition = e.target.value as any;
                              setInItems(next);
                            }}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                          >
                            <option value="unopened">Nguyên hộp chưa mở</option>
                            <option value="normal">Đã mở hộp / Dùng lướt</option>
                            <option value="damaged">Trầy xước / Lỗi kỹ thuật</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-400 block">Kho nhập về:</label>
                          <select
                            value={it.destinationType}
                            onChange={(e) => {
                              const next = [...inItems];
                              next[idx].destinationType = e.target.value as any;
                              setInItems(next);
                            }}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                          >
                            <option value="restock">Nhập kho bán lại (Restock)</option>
                            <option value="faulty_warehouse">Kho cách ly / Bảo hành</option>
                          </select>
                        </div>
                      </div>

                      {/* Quản lý Serial hàng nhận lại */}
                      <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                            <Barcode className="w-3.5 h-3.5 text-red-400" /> Serial / IMEI nhận lại ({it.serials.length}/{it.quantity})
                          </label>
                        </div>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={inSerialInput[idx] || ""}
                            onChange={(e) =>
                              setInSerialInput({ ...inSerialInput, [idx]: e.target.value })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddInSerial(idx);
                              }
                            }}
                            placeholder="Quét mã Serial / IMEI..."
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-xs text-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddInSerial(idx)}
                            className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-xs font-semibold"
                          >
                            Thêm
                          </button>
                        </div>
                        {it.serials.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {it.serials.map((s, sIdx) => (
                              <span
                                key={sIdx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-mono"
                              >
                                {s}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveInSerial(idx, sIdx)}
                                  className="hover:text-red-100"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="text-right text-xs text-slate-400">
                        Thành tiền nhận: <span className="font-bold text-red-400">{formatVND(it.quantity * it.returnUnitPrice)}</span>
                      </div>
                    </div>
                  ))}

                  <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-300">Tổng Giá Trị Hàng Nhận (V_nhap):</span>
                    <span className="font-bold text-red-400 text-base">{formatVND(inboundTotal)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Cột Phải: Hàng Xuất Mới (Outbound) */}
            <div className="bg-slate-800/40 p-4 rounded-xl border border-emerald-500/20 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Hàng Xuất Đổi Mới (Outbound)</h4>
                    <span className="text-xs text-slate-400">Trừ tồn kho & ghi nhận doanh thu mới</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddOutItem}
                  className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm Món
                </button>
              </div>

              {outItems.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs italic">
                  Chưa có sản phẩm xuất đổi mới. Nhấn "+ Thêm Món" để chọn thiết bị giao cho khách.
                </div>
              ) : (
                <div className="space-y-3">
                  {outItems.map((it, idx) => (
                    <div key={idx} className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/80 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <label className="text-xs text-slate-400 block mb-1">Chọn sản phẩm xuất mới:</label>
                          <select
                            value={it.productId}
                            onChange={(e) => handleOutProductSelect(idx, e.target.value)}
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                          >
                            <option value="">-- Chọn sản phẩm --</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                [{p.sku}] {p.name} - Tồn: {p.stock} {p.unit} - Giá: {formatVND(p.sellingPrice || (p as any).price || 0)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const next = [...outItems];
                            next.splice(idx, 1);
                            setOutItems(next);
                          }}
                          className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors mt-5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[11px] text-slate-400 block">Số lượng:</label>
                          <input
                            type="number"
                            min={1}
                            value={it.quantity}
                            onChange={(e) => {
                              const next = [...outItems];
                              next[idx].quantity = Number(e.target.value) || 1;
                              setOutItems(next);
                            }}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[11px] text-slate-400 block">Đơn giá xuất bán (VND):</label>
                          <input
                            type="text"
                            value={formatVND(it.exchangeUnitPrice).replace(" ₫", "")}
                            onChange={(e) => {
                              const next = [...outItems];
                              next[idx].exchangeUnitPrice = parseCurrencyInput(e.target.value);
                              setOutItems(next);
                            }}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-emerald-300 font-semibold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] text-slate-400 block">Bảo hành mới (Tháng):</label>
                          <input
                            type="number"
                            min={0}
                            value={it.warrantyMonths}
                            onChange={(e) => {
                              const next = [...outItems];
                              next[idx].warrantyMonths = Number(e.target.value) || 12;
                              setOutItems(next);
                            }}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 block">Kho xuất:</label>
                          <input
                            type="text"
                            value={it.warehouseName}
                            disabled
                            className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-400"
                          />
                        </div>
                      </div>

                      {/* Quản lý Serial hàng xuất mới */}
                      <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                            <Barcode className="w-3.5 h-3.5 text-emerald-400" /> Serial / IMEI xuất mới ({it.serials.length}/{it.quantity})
                          </label>
                        </div>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={outSerialInput[idx] || ""}
                            onChange={(e) =>
                              setOutSerialInput({ ...outSerialInput, [idx]: e.target.value })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddOutSerial(idx);
                              }
                            }}
                            placeholder="Quét mã Serial / IMEI..."
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-xs text-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddOutSerial(idx)}
                            className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-xs font-semibold"
                          >
                            Thêm
                          </button>
                        </div>
                        {it.serials.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {it.serials.map((s, sIdx) => (
                              <span
                                key={sIdx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono"
                              >
                                {s}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOutSerial(idx, sIdx)}
                                  className="hover:text-emerald-100"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="text-right text-xs text-slate-400">
                        Thành tiền xuất: <span className="font-bold text-emerald-400">{formatVND(it.quantity * it.exchangeUnitPrice)}</span>
                      </div>
                    </div>
                  ))}

                  <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-300">Tổng Giá Trị Hàng Xuất (V_xuat):</span>
                    <span className="font-bold text-emerald-400 text-base">{formatVND(outboundTotal)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Cấu hình Khấu Trừ Phí & Tổng Kết Chênh Lệch */}
          <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Calculator className="w-4 h-4" /> 3. Phí Khấu Trừ, Quà Tặng & Thanh Toán Chênh Lệch (Δ)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Phí Khấu Trừ Hoàn Trả (Restocking Fee)
                </label>
                <select
                  value={restockingFeeType}
                  onChange={(e) => setRestockingFeeType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
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
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Phương Thức Thu / Chi Chênh Lệch
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="cash">Tiền mặt tại quầy (Phiếu Thu / Chi Quỹ)</option>
                  <option value="transfer">Chuyển khoản ngân hàng</option>
                  <option value="debt_adjust">Ghi nhận / Cấn trừ công nợ khách hàng</option>
                </select>
              </div>
            </div>

            {/* Bảng tính Real-time Delta */}
            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Tổng giá trị hàng xuất mới (V_xuat):</span>
                <span className="text-emerald-400 font-semibold">{formatVND(outboundTotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Trừ: Tổng giá trị hàng nhận lại (V_nhap):</span>
                <span className="text-red-400 font-semibold">-{formatVND(inboundTotal)}</span>
              </div>
              {calculatedRestockingFee > 0 && (
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Cộng: Phí khấu trừ lưu kho (Restocking Fee):</span>
                  <span className="text-amber-400 font-semibold">+{formatVND(calculatedRestockingFee)}</span>
                </div>
              )}
              {giftDeductionAmount > 0 && (
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Cộng: Khấu trừ quà tặng kèm theo:</span>
                  <span className="text-amber-400 font-semibold">+{formatVND(giftDeductionAmount)}</span>
                </div>
              )}
              <div className="border-t border-slate-800 pt-2 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-white">Chênh Lệch Thanh Toán (Δ):</span>
                  <span className="text-xs text-slate-400 block">
                    {differenceAmount > 0
                      ? "👉 Khách hàng bù thêm tiền (Lập Phiếu Thu PT-DH)"
                      : differenceAmount < 0
                      ? "👉 Cửa hàng hoàn tiền cho khách (Lập Phiếu Chi PC-DH)"
                      : "👉 Đổi ngang giá trị - Không phát sinh thu chi"}
                  </span>
                </div>
                <div
                  className={`text-xl font-extrabold ${
                    differenceAmount > 0
                      ? "text-cyan-400"
                      : differenceAmount < 0
                      ? "text-amber-400"
                      : "text-slate-300"
                  }`}
                >
                  {differenceAmount > 0 && "+"}
                  {formatVND(differenceAmount)}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Ghi Chú Nghiệp Vụ:</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi chú chi tiết về tình trạng thiết bị hoặc yêu cầu đặc biệt..."
                rows={2}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Hệ thống tự động đồng bộ kho, bút toán Sổ Nhật Ký Chung và công nợ</span>
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
                <span>Lưu & In Phiếu Đổi Hàng (A4 / Xuất Nhập Kho)</span>
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/25 flex items-center gap-2 text-sm transition-all disabled:opacity-50 cursor-pointer active:scale-95"
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
