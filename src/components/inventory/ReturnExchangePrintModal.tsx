import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Printer,
  FileText,
  CheckCircle2,
  Receipt,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Award,
} from "lucide-react";
import { ProductExchange, ReturnOrder, StoreSettings } from "../../types";
import { formatVND } from "../../utils/currency";
import { numberToVietnameseWords } from "../../utils/numberToWords";
import { GIA_PHUC_LOGO_SVG_DATA_URI } from "../common/GiaPhucLogo";

export type ReturnExchangeDocType =
  | "summary"
  | "inbound"
  | "outbound"
  | "voucher"
  | "legal_return"
  | "legal_exchange"
  | "legal_handover"
  | "legal_completion"
  | "both";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  exchange?: ProductExchange | null;
  returnOrder?: ReturnOrder | null;
  settings?: StoreSettings | null;
  initialDocType?: ReturnExchangeDocType | "order" | string;
}

export const ReturnExchangePrintModal: React.FC<Props> = ({
  isOpen,
  onClose,
  exchange,
  returnOrder,
  settings,
  initialDocType = "summary",
}) => {
  const isExchange = !!exchange;
  const isVoucherIncome = isExchange ? (Number(exchange?.differenceAmount) || 0) > 0 : false;
  const voucherAmount = isExchange
    ? Math.abs(Number(exchange?.differenceAmount) || 0)
    : Number(returnOrder?.refundAmount || 0);

  const normalizeDocType = (doc?: string): ReturnExchangeDocType => {
    if (!doc || doc === "order" || doc === "both") return "summary";
    return doc as ReturnExchangeDocType;
  };

  const [printSize, setPrintSize] = useState<"A4" | "K80" | "K58">(
    settings?.defaultPrintPaperSize === 'K58'
      ? 'K58'
      : settings?.defaultPrintPaperSize === 'K80'
      ? 'K80'
      : 'A4'
  );
  const [activeDoc, setActiveDoc] = useState<ReturnExchangeDocType>(
    initialDocType === "both" ? "summary" : normalizeDocType(initialDocType)
  );

  // Multi-document bundle selection
  const defaultBundleDocs: ReturnExchangeDocType[] = isExchange
    ? ["inbound", "outbound", "voucher", "legal_exchange"]
    : ["inbound", "voucher", "legal_return"];

  const [selectedBundleDocs, setSelectedBundleDocs] = useState<ReturnExchangeDocType[]>(
    initialDocType === "both" ? defaultBundleDocs : [normalizeDocType(initialDocType)]
  );

  const [printMode, setPrintMode] = useState<"single" | "bundle">(
    initialDocType === "both" ? "bundle" : "single"
  );

  const [invoiceRecallNo] = useState<string>("0000018");
  const [invoiceRecallSymbol] = useState<string>("HN/18P");
  const [invoiceRecallDate] = useState<string>("20/10/2021");
  const [invoiceRecallReason] = useState<string>("Lỗi sọc màn hình");
  const [invoiceReplaceNo] = useState<string>("00000118");
  const [invoiceReplaceSymbol] = useState<string>("HN/118P");
  const [invoiceReplaceDate] = useState<string>("20/8/2026");
  const [depreciationPercent] = useState<number>(30);
  const [customerTaxCode] = useState<string>("378421561");
  const [customerRepresentative] = useState<string>("Ông / Bà Đại Diện");
  const [handoverNote] = useState<string>(
    "Bên A sửa chữa máy in và bàn giao máy trong tình trạng hoạt động tốt"
  );

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialDocType === "both") {
        setPrintMode("bundle");
        setActiveDoc("summary");
        setSelectedBundleDocs(
          isExchange
            ? ["inbound", "outbound", "voucher", "legal_exchange"]
            : ["inbound", "voucher", "legal_return"]
        );
      } else {
        const doc = normalizeDocType(initialDocType);
        setActiveDoc(doc);
        setPrintMode("single");
        setSelectedBundleDocs([doc]);
      }
    }
  }, [isOpen, initialDocType, isExchange]);

  const handlePrint = () => {
    requestAnimationFrame(() => {
      window.print();
    });
  };

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        handlePrint();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Guard clause after ALL hooks have been registered
  if (!isOpen || (!exchange && !returnOrder)) return null;

  const docCode = isExchange ? (exchange?.code || "DH-TEMP") : (returnOrder?.code || "TH-TEMP");
  const customerName = isExchange ? exchange?.customerName : returnOrder?.customerName;
  const customerPhone = isExchange ? exchange?.customerPhone : returnOrder?.customerPhone;
  const customerAddress = isExchange ? exchange?.customerAddress : (returnOrder as any)?.customerAddress;
  const originalOrderCode = isExchange ? exchange?.originalOrderCode : returnOrder?.originalOrderCode;
  const warehouseName = isExchange ? (exchange?.warehouseName || "Kho Tổng Gia Phúc") : (returnOrder?.warehouse || "Kho Tổng Gia Phúc");
  const createdAt = isExchange ? exchange?.createdAt : returnOrder?.createdAt;
  const notes = isExchange ? exchange?.notes : returnOrder?.notes;
  const accountingCode = isExchange ? exchange?.accountingCode : returnOrder?.accountingCode;
  const inboundReceiptCode = isExchange ? exchange?.inboundReceiptCode : returnOrder?.inboundReceiptCode;
  const outboundIssueCode = isExchange ? exchange?.outboundIssueCode : undefined;

  const voucherCode =
    accountingCode ||
    (isVoucherIncome
      ? `PT-DH-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`
      : `PC-${isExchange ? "DH" : "TH"}-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`);

  const storeName = settings?.companyLegalName || settings?.storeName || "CÔNG TY TNHH MTV TM & DV SỬA CHỮA GIA PHÚC";
  const storeAddress = settings?.address || "Số 54, Đường Phú An 087, tổ 11, KP. An Thuận, P. Phú An, TP. HCM";
  const storePhone = settings?.phone || "0985 862 609 - 0914 665 994";
  const storeTaxCode = settings?.taxCode || "3701877838";
  const storeRepresentative = settings?.representativeName || "Phạm Ngọc Thơm";

  const createdDateObj = useMemo(() => {
    if (!createdAt) return new Date();
    const d = new Date(createdAt);
    return isNaN(d.getTime()) ? new Date() : d;
  }, [createdAt]);

  const day = String(createdDateObj.getDate()).padStart(2, "0");
  const month = String(createdDateObj.getMonth() + 1).padStart(2, "0");
  const year = createdDateObj.getFullYear();

  const inItems = isExchange ? exchange?.inItems || [] : [];
  const outItems = isExchange ? exchange?.outItems || [] : [];
  const returnItems = !isExchange ? returnOrder?.items || [] : [];

  const inItemsExchangeTotal = inItems.reduce(
    (acc, it) => acc + (Number(it.quantity || 0) * Number(it.returnUnitPrice || (it as any).exchangeUnitPrice || (it as any).unitPrice || 0)),
    0
  );
  const outItemsTotal = outItems.reduce(
    (acc, it) => acc + (Number(it.quantity || 0) * Number(it.exchangeUnitPrice || (it as any).unitPrice || 0)),
    0
  );
  const returnItemsTotal = returnItems.reduce(
    (acc, it) => acc + (Number(it.quantity || 0) * Number(it.refundUnitPrice || (it as any).unitPrice || 0)),
    0
  );

  // Helper to toggle a document in bundle mode
  const toggleBundleDoc = (doc: ReturnExchangeDocType) => {
    setSelectedBundleDocs((prev) =>
      prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc]
    );
  };

  // Helper to apply preset bundles
  const applyPreset = (preset: "warehouse_funds" | "legal" | "all" | "single") => {
    if (preset === "warehouse_funds") {
      setPrintMode("bundle");
      setSelectedBundleDocs(isExchange ? ["inbound", "outbound", "voucher"] : ["inbound", "voucher"]);
    } else if (preset === "legal") {
      setPrintMode("bundle");
      setSelectedBundleDocs(isExchange ? ["legal_exchange", "legal_handover"] : ["legal_return"]);
    } else if (preset === "all") {
      setPrintMode("bundle");
      setSelectedBundleDocs(
        isExchange
          ? ["summary", "inbound", "outbound", "voucher", "legal_exchange", "legal_handover", "legal_completion"]
          : ["summary", "inbound", "voucher", "legal_return", "legal_completion"]
      );
    } else {
      setPrintMode("single");
    }
  };

  const isDocVisible = (type: ReturnExchangeDocType) => {
    const curActive = normalizeDocType(activeDoc);
    if (printMode === "single") {
      return curActive === type || activeDoc === "both";
    }
    const currentList = selectedBundleDocs.length > 0 ? selectedBundleDocs : [curActive];
    return currentList.includes(type);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 sm:p-4 md:p-6 animate-fade-in print:p-0 print:bg-white">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-6xl max-h-[96vh] overflow-hidden shadow-2xl flex flex-col print:border-none print:shadow-none print:max-w-none print:max-h-none print:w-full print:bg-white print:rounded-none">
        
        {/* Header Controls (Hidden during print) */}
        <div className="flex flex-col border-b border-slate-800 bg-slate-800/95 print:hidden">
          {/* Top Bar: Title & Primary Actions */}
          <div className="flex flex-wrap items-center justify-between px-6 py-3 border-b border-slate-800/80 gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                  <span>Trình In Chứng Từ: <span className="font-mono text-blue-400">{docCode}</span></span>
                  {accountingCode && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                      {accountingCode}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400">
                  {isExchange ? "Nghiệp vụ Đổi Hàng (Nhập kho + Xuất mới + Cân đối thu chi)" : "Nghiệp vụ Trả Hàng (Nhập kho hoàn trả + Phiếu chi tiền)"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Paper Size Dropdown */}
              <div className="flex items-center bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-xs">
                <span className="text-[10px] text-slate-400 font-bold mr-1.5 whitespace-nowrap">Khổ giấy:</span>
                <select
                  value={printSize}
                  onChange={(e) => setPrintSize(e.target.value as any)}
                  className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
                >
                  <option value="A4" className="bg-slate-900 text-white">Khổ A4 / A5</option>
                  <option value="K80" className="bg-slate-900 text-white">In Nhiệt K80 (80mm)</option>
                  <option value="K58" className="bg-slate-900 text-white">In Nhiệt K58 (58mm)</option>
                </select>
              </div>

              {/* Print Button */}
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-blue-500/25 cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>
                  {printMode === "bundle"
                    ? `In ${selectedBundleDocs.length} Chứng Từ Đã Chọn (Ctrl+P)`
                    : "In Phiếu Hiện Tại (Ctrl+P)"}
                </span>
              </button>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Preset Quick Chooser Bar */}
          <div className="px-6 py-2 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400 font-semibold mr-1">Bộ Chọn Nhanh:</span>
              <button
                type="button"
                onClick={() => applyPreset("warehouse_funds")}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-medium hover:bg-emerald-900/60 transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>📦 Bộ Kho & Quỹ</span>
                <span className="text-[10px] opacity-75 font-mono">({isExchange ? "PNK + PXK + Quỹ" : "PNK + PC"})</span>
              </button>

              <button
                type="button"
                onClick={() => applyPreset("legal")}
                className="px-2.5 py-1 rounded-lg bg-rose-950/70 border border-rose-500/40 text-rose-300 font-medium hover:bg-rose-900/60 transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>⚖️ Bộ Pháp Lý (NĐ 123)</span>
                <span className="text-[10px] opacity-75 font-mono">({isExchange ? "BB Đổi Hàng" : "BB Thu Hồi HĐ"})</span>
              </button>

              <button
                type="button"
                onClick={() => applyPreset("all")}
                className="px-2.5 py-1 rounded-lg bg-purple-950/70 border border-purple-500/40 text-purple-300 font-medium hover:bg-purple-900/60 transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>📑 Trọn Bộ Tất Cả</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Chế độ in:</span>
              <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setPrintMode("single")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    printMode === "single" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Từng Phiếu
                </button>
                <button
                  type="button"
                  onClick={() => setPrintMode("bundle")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    printMode === "bundle" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  In Gộp Nhiều Phiếu ({selectedBundleDocs.length})
                </button>
              </div>
            </div>
          </div>

          {/* Sub Bar: Detailed Document Selection Chips */}
          <div className="px-6 py-2.5 flex flex-wrap items-center gap-2 overflow-x-auto text-xs bg-slate-950/60">
            <span className="text-slate-400 font-semibold mr-1 shrink-0">Danh Sách Phiếu:</span>

            {/* 1. Phiếu Tổng Hợp */}
            <button
              type="button"
              onClick={() => {
                setActiveDoc("summary");
                if (printMode === "bundle") toggleBundleDoc("summary");
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${
                printMode === "bundle"
                  ? selectedBundleDocs.includes("summary")
                    ? "bg-blue-600 border-blue-400 text-white shadow"
                    : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                  : activeDoc === "summary"
                  ? "bg-blue-600 border-blue-400 text-white shadow"
                  : "bg-slate-800/80 border-transparent text-slate-300 hover:bg-slate-800"
              }`}
            >
              {printMode === "bundle" && (
                <input
                  type="checkbox"
                  checked={selectedBundleDocs.includes("summary")}
                  onChange={() => {}}
                  className="rounded pointer-events-none w-3.5 h-3.5 text-blue-600"
                />
              )}
              <FileText className="w-3.5 h-3.5 text-blue-300" />
              <span>{isExchange ? "1. Phiếu Đổi Hàng" : "1. Phiếu Trả Hàng"}</span>
            </button>

            {/* 2. Phiếu Nhập Kho (PNK) */}
            <button
              type="button"
              onClick={() => {
                setActiveDoc("inbound");
                if (printMode === "bundle") toggleBundleDoc("inbound");
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${
                printMode === "bundle"
                  ? selectedBundleDocs.includes("inbound")
                    ? "bg-emerald-600 border-emerald-400 text-white shadow"
                    : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                  : activeDoc === "inbound"
                  ? "bg-emerald-600 border-emerald-400 text-white shadow"
                  : "bg-slate-800/80 border-transparent text-emerald-400 hover:bg-slate-800"
              }`}
            >
              {printMode === "bundle" && (
                <input
                  type="checkbox"
                  checked={selectedBundleDocs.includes("inbound")}
                  onChange={() => {}}
                  className="rounded pointer-events-none w-3.5 h-3.5 text-emerald-600"
                />
              )}
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>2. Phiếu Nhập Kho (PNK)</span>
              {inboundReceiptCode && (
                <span className="text-[10px] px-1.5 py-0.2 bg-black/40 rounded font-mono">
                  {inboundReceiptCode}
                </span>
              )}
            </button>

            {/* 3. Phiếu Xuất Kho (PXK) - Exchange Only */}
            {isExchange && (
              <button
                type="button"
                onClick={() => {
                  setActiveDoc("outbound");
                  if (printMode === "bundle") toggleBundleDoc("outbound");
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${
                  printMode === "bundle"
                    ? selectedBundleDocs.includes("outbound")
                      ? "bg-cyan-600 border-cyan-400 text-white shadow"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                    : activeDoc === "outbound"
                    ? "bg-cyan-600 border-cyan-400 text-white shadow"
                    : "bg-slate-800/80 border-transparent text-cyan-400 hover:bg-slate-800"
                }`}
              >
                {printMode === "bundle" && (
                  <input
                    type="checkbox"
                    checked={selectedBundleDocs.includes("outbound")}
                    onChange={() => {}}
                    className="rounded pointer-events-none w-3.5 h-3.5 text-cyan-600"
                  />
                )}
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>3. Phiếu Xuất Kho (PXK)</span>
                {outboundIssueCode && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-black/40 rounded font-mono">
                    {outboundIssueCode}
                  </span>
                )}
              </button>
            )}

            {/* 4. Phiếu Thu / Chi Quỹ (Mẫu 01/02-TT) */}
            <button
              type="button"
              onClick={() => {
                setActiveDoc("voucher");
                if (printMode === "bundle") toggleBundleDoc("voucher");
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${
                printMode === "bundle"
                  ? selectedBundleDocs.includes("voucher")
                    ? "bg-amber-600 border-amber-400 text-white shadow"
                    : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                  : activeDoc === "voucher"
                  ? "bg-amber-600 border-amber-400 text-white shadow"
                  : "bg-slate-800/80 border-transparent text-amber-400 hover:bg-slate-800"
              }`}
            >
              {printMode === "bundle" && (
                <input
                  type="checkbox"
                  checked={selectedBundleDocs.includes("voucher")}
                  onChange={() => {}}
                  className="rounded pointer-events-none w-3.5 h-3.5 text-amber-600"
                />
              )}
              <DollarSign className="w-3.5 h-3.5" />
              <span>4. {isVoucherIncome ? "Phiếu Thu (PT)" : "Phiếu Chi (PC)"}</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-black/40 rounded font-mono font-bold">
                {isVoucherIncome ? `+${formatVND(voucherAmount)}` : `-${formatVND(voucherAmount)}`}
              </span>
            </button>

            {/* 5. Biên Bản Trả Hàng & Thu Hồi HĐ (Ảnh 2 - NĐ 123) */}
            {!isExchange && (
              <button
                type="button"
                onClick={() => {
                  setActiveDoc("legal_return");
                  if (printMode === "bundle") toggleBundleDoc("legal_return");
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${
                  printMode === "bundle"
                    ? selectedBundleDocs.includes("legal_return")
                      ? "bg-rose-600 border-rose-400 text-white shadow"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                    : activeDoc === "legal_return"
                    ? "bg-rose-600 border-rose-400 text-white shadow"
                    : "bg-slate-800/80 border-transparent text-rose-300 hover:bg-slate-800"
                }`}
              >
                {printMode === "bundle" && (
                  <input
                    type="checkbox"
                    checked={selectedBundleDocs.includes("legal_return")}
                    onChange={() => {}}
                    className="rounded pointer-events-none w-3.5 h-3.5 text-rose-600"
                  />
                )}
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>5. BB Trả Hàng & Thu Hồi HĐ (NĐ 123)</span>
              </button>
            )}

            {/* 6. Biên Bản Đổi Hàng & Thay Đổi HĐ (Ảnh 4 - Exchange) */}
            {isExchange && (
              <button
                type="button"
                onClick={() => {
                  setActiveDoc("legal_exchange");
                  if (printMode === "bundle") toggleBundleDoc("legal_exchange");
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${
                  printMode === "bundle"
                    ? selectedBundleDocs.includes("legal_exchange")
                      ? "bg-rose-600 border-rose-400 text-white shadow"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                    : activeDoc === "legal_exchange"
                    ? "bg-rose-600 border-rose-400 text-white shadow"
                    : "bg-slate-800/80 border-transparent text-rose-300 hover:bg-slate-800"
                }`}
              >
                {printMode === "bundle" && (
                  <input
                    type="checkbox"
                    checked={selectedBundleDocs.includes("legal_exchange")}
                    onChange={() => {}}
                    className="rounded pointer-events-none w-3.5 h-3.5 text-rose-600"
                  />
                )}
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>5. BB Đổi Hàng & Thay Đổi HĐ</span>
              </button>
            )}

            {/* 7. Biên Bản Thu Cũ Đổi Mới (Ảnh 1) */}
            {isExchange && (
              <button
                type="button"
                onClick={() => {
                  setActiveDoc("legal_handover");
                  if (printMode === "bundle") toggleBundleDoc("legal_handover");
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${
                  printMode === "bundle"
                    ? selectedBundleDocs.includes("legal_handover")
                      ? "bg-teal-600 border-teal-400 text-white shadow"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                    : activeDoc === "legal_handover"
                    ? "bg-teal-600 border-teal-400 text-white shadow"
                    : "bg-slate-800/80 border-transparent text-teal-300 hover:bg-slate-800"
                }`}
              >
                {printMode === "bundle" && (
                  <input
                    type="checkbox"
                    checked={selectedBundleDocs.includes("legal_handover")}
                    onChange={() => {}}
                    className="rounded pointer-events-none w-3.5 h-3.5 text-teal-600"
                  />
                )}
                <Award className="w-3.5 h-3.5" />
                <span>6. BB Thu Cũ Đổi Mới (Trade-In)</span>
              </button>
            )}

            {/* 8. Biên Bản Nghiệm Thu & Bàn Giao Kỹ Thuật (Ảnh 3) */}
            <button
              type="button"
              onClick={() => {
                setActiveDoc("legal_completion");
                if (printMode === "bundle") toggleBundleDoc("legal_completion");
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${
                printMode === "bundle"
                  ? selectedBundleDocs.includes("legal_completion")
                    ? "bg-indigo-600 border-indigo-400 text-white shadow"
                    : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                  : activeDoc === "legal_completion"
                  ? "bg-indigo-600 border-indigo-400 text-white shadow"
                  : "bg-slate-800/80 border-transparent text-indigo-300 hover:bg-slate-800"
              }`}
            >
              {printMode === "bundle" && (
                <input
                  type="checkbox"
                  checked={selectedBundleDocs.includes("legal_completion")}
                  onChange={() => {}}
                  className="rounded pointer-events-none w-3.5 h-3.5 text-indigo-600"
                />
              )}
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isExchange ? "7." : "6."} BB Nghiệm Thu Bàn Giao</span>
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6 overflow-y-auto flex-1 flex flex-col items-center bg-slate-950/90 print:bg-white print:p-0 print:overflow-visible gap-8 font-serif">
          {/* 1. DOCUMENT 1: PHIẾU TỔNG HỢP */}
          {isDocVisible("summary") && (
            <div className="w-full flex justify-center print:block print:w-full">
              {printSize === "A4" ? (
                <div className="bg-white text-slate-900 w-full max-w-[210mm] p-8 shadow-xl text-[13px] rounded-xl print:rounded-none print:m-0 print:p-6 print:shadow-none print:w-full print:page-break-after-always">
                  <div className="flex items-start justify-between border-b border-slate-300 pb-4">
                    <div className="flex items-center gap-3">
                      <img src={settings?.logoUrl || GIA_PHUC_LOGO_SVG_DATA_URI} alt="Logo" className="w-16 h-16 object-contain" />
                      <div>
                        <h1 className="text-sm font-bold uppercase">{storeName}</h1>
                        <p className="text-[11px] text-slate-600">{storeAddress}</p>
                        <p className="text-[11px] text-slate-600">Hotline: {storePhone} | MST: {storeTaxCode}</p>
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-slate-600">
                      <div className="font-bold text-slate-900">Mã Phiếu: {docCode}</div>
                      <div>Ngày lập: {createdDateObj.toLocaleDateString("vi-VN")} {createdDateObj.toLocaleTimeString("vi-VN")}</div>
                      {accountingCode && <div className="text-amber-700 font-bold font-mono">Phiếu Quỹ: {accountingCode}</div>}
                    </div>
                  </div>

                  <div className="text-center my-5">
                    <h2 className="text-xl font-bold uppercase tracking-wide">
                      {isExchange ? "PHIẾU ĐỔI HÀNG HOÁ & CÂN ĐỐI CHÊNH LỆCH" : "PHIẾU TRẢ HÀNG & HOÀN TIỀN"}
                    </h2>
                    <p className="text-xs italic text-slate-500">(Liên 1: Kế toán/Kho - Liên 2: Khách hàng)</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded border border-slate-200 text-xs mb-5">
                    <div>
                      <p><span className="font-semibold">Khách hàng:</span> {customerName || "Khách lẻ"}</p>
                      <p><span className="font-semibold">Điện thoại:</span> {customerPhone || "---"}</p>
                      <p><span className="font-semibold">Địa chỉ:</span> {customerAddress || "Tại cửa hàng"}</p>
                      <p><span className="font-semibold">Hóa đơn gốc:</span> {originalOrderCode || "---"}</p>
                    </div>
                    <div>
                      <p><span className="font-semibold">Kho thực hiện:</span> {warehouseName}</p>
                      <p><span className="font-semibold">Trạng thái:</span> Đã hoàn tất & Ghi sổ kho/quỹ</p>
                    </div>
                  </div>

                  {isExchange ? (
                    <>
                      <h3 className="text-xs font-bold uppercase text-red-700 mb-1.5">I. Hàng Nhận Lại Từ Khách (Nhập Kho)</h3>
                      <table className="w-full border-collapse border border-slate-300 text-xs mb-4">
                        <thead>
                          <tr className="bg-slate-100 font-bold text-slate-800">
                            <th className="border border-slate-300 p-2 w-8 text-center">STT</th>
                            <th className="border border-slate-300 p-2 text-left">Tên Hàng Hóa / SKU</th>
                            <th className="border border-slate-300 p-2 text-center w-14">ĐVT</th>
                            <th className="border border-slate-300 p-2 text-center w-12">SL</th>
                            <th className="border border-slate-300 p-2 text-right w-28">Đơn Giá Đổi</th>
                            <th className="border border-slate-300 p-2 text-right w-28">Thành Tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inItems.map((it, i) => {
                            const price = Number(it.returnUnitPrice || (it as any).exchangeUnitPrice || (it as any).unitPrice || 0);
                            const qty = Number(it.quantity || 0);
                            return (
                              <tr key={i}>
                                <td className="border border-slate-300 p-2 text-center">{i + 1}</td>
                                <td className="border border-slate-300 p-2 font-semibold">{it.productName}</td>
                                <td className="border border-slate-300 p-2 text-center">{it.unit || (it as any).uomName || "Cái"}</td>
                                <td className="border border-slate-300 p-2 text-center font-bold">{qty}</td>
                                <td className="border border-slate-300 p-2 text-right font-mono">{formatVND(price)}</td>
                                <td className="border border-slate-300 p-2 text-right font-mono font-bold">{formatVND(qty * price)}</td>
                              </tr>
                            );
                          })}
                          <tr className="bg-slate-50 font-bold">
                            <td colSpan={5} className="border border-slate-300 p-2 text-right">Tổng giá trị nhận lại:</td>
                            <td className="border border-slate-300 p-2 text-right font-mono text-red-600">{formatVND(inItemsExchangeTotal)}</td>
                          </tr>
                        </tbody>
                      </table>

                      <h3 className="text-xs font-bold uppercase text-blue-700 mb-1.5">II. Hàng Xuất Đổi Mới Cho Khách (Xuất Kho)</h3>
                      <table className="w-full border-collapse border border-slate-300 text-xs mb-4">
                        <thead>
                          <tr className="bg-slate-100 font-bold text-slate-800">
                            <th className="border border-slate-300 p-2 w-8 text-center">STT</th>
                            <th className="border border-slate-300 p-2 text-left">Tên Hàng Hóa / SKU</th>
                            <th className="border border-slate-300 p-2 text-center w-14">ĐVT</th>
                            <th className="border border-slate-300 p-2 text-center w-12">SL</th>
                            <th className="border border-slate-300 p-2 text-right w-28">Đơn Giá Xuất</th>
                            <th className="border border-slate-300 p-2 text-right w-28">Thành Tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {outItems.map((it, i) => {
                            const price = Number(it.exchangeUnitPrice || (it as any).unitPrice || 0);
                            const qty = Number(it.quantity || 0);
                            return (
                              <tr key={i}>
                                <td className="border border-slate-300 p-2 text-center">{i + 1}</td>
                                <td className="border border-slate-300 p-2 font-semibold">{it.productName}</td>
                                <td className="border border-slate-300 p-2 text-center">{it.unit || (it as any).uomName || "Cái"}</td>
                                <td className="border border-slate-300 p-2 text-center font-bold">{qty}</td>
                                <td className="border border-slate-300 p-2 text-right font-mono">{formatVND(price)}</td>
                                <td className="border border-slate-300 p-2 text-right font-mono font-bold">{formatVND(qty * price)}</td>
                              </tr>
                            );
                          })}
                          <tr className="bg-slate-50 font-bold">
                            <td colSpan={5} className="border border-slate-300 p-2 text-right">Tổng giá trị xuất mới:</td>
                            <td className="border border-slate-300 p-2 text-right font-mono text-blue-600">{formatVND(outItemsTotal)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </>
                  ) : (
                    <table className="w-full border-collapse border border-slate-300 text-xs mb-4">
                      <thead>
                        <tr className="bg-slate-100 font-bold text-slate-800">
                          <th className="border border-slate-300 p-2 w-8 text-center">STT</th>
                          <th className="border border-slate-300 p-2 text-left">Tên Hàng Hóa Trả Lại</th>
                          <th className="border border-slate-300 p-2 text-center w-14">ĐVT</th>
                          <th className="border border-slate-300 p-2 text-center w-12">SL</th>
                          <th className="border border-slate-300 p-2 text-right w-28">Đơn Giá Hoàn</th>
                          <th className="border border-slate-300 p-2 text-right w-28">Thành Tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {returnItems.map((it, i) => {
                          const price = Number(it.refundUnitPrice || (it as any).unitPrice || 0);
                          const qty = Number(it.quantity || 0);
                          return (
                            <tr key={i}>
                              <td className="border border-slate-300 p-2 text-center">{i + 1}</td>
                              <td className="border border-slate-300 p-2 font-semibold">{it.productName}</td>
                              <td className="border border-slate-300 p-2 text-center">{it.unit || (it as any).uomName || "Cái"}</td>
                              <td className="border border-slate-300 p-2 text-center font-bold">{qty}</td>
                              <td className="border border-slate-300 p-2 text-right font-mono">{formatVND(price)}</td>
                              <td className="border border-slate-300 p-2 text-right font-mono font-bold">{formatVND(qty * price)}</td>
                            </tr>
                          );
                        })}
                        <tr className="bg-slate-50 font-bold">
                          <td colSpan={5} className="border border-slate-300 p-2 text-right">Tổng tiền hoàn trả:</td>
                          <td className="border border-slate-300 p-2 text-right font-mono text-rose-600">{formatVND(returnItemsTotal)}</td>
                        </tr>
                      </tbody>
                    </table>
                  )}

                  <div className="bg-slate-50 p-3.5 rounded border border-slate-300 space-y-1 text-xs mb-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">{isExchange ? "Chênh lệch thanh toán (Δ):" : "Tổng tiền hoàn trả:"}</span>
                      <span className="text-base font-extrabold font-mono text-slate-900">{formatVND(voucherAmount)}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 italic">
                      <span className="font-semibold">Bằng chữ:</span> {numberToVietnameseWords(voucherAmount)}
                    </div>
                  </div>

                  {/* Terms & Notes Section */}
                  <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/80 text-[11px] space-y-1 mb-6">
                    <div className="font-bold uppercase text-slate-800 text-[10px]">
                      {isExchange ? "QUY ĐỊNH ĐỔI HÀNG & CAM KẾT BẢO HÀNH:" : "QUY ĐỊNH TRẢ HÀNG & THU HỒI:"}
                    </div>
                    <div className="text-slate-700 leading-relaxed whitespace-pre-line">
                      {isExchange
                        ? (settings?.defaultExchangeTermsText || (settings?.defaultExchangeTerms && settings.defaultExchangeTerms.length > 0 ? settings.defaultExchangeTerms.join('\n') : "1. Thiết bị đổi trả được thẩm định kỹ thuật, áp dụng chính sách 1 đổi 1 trong thời gian quy định.\n2. Thiết bị mới bàn giao được kích hoạt bảo hành chính hãng và cấp số Serial/IMEI mới.\n3. Quyết toán tiền chênh lệch ngay khi ký nhận bàn giao."))
                        : (settings?.defaultReturnTermsText || (settings?.defaultReturnTerms && settings.defaultReturnTerms.length > 0 ? settings.defaultReturnTerms.join('\n') : "1. Sản phẩm trả lại phải còn nguyên tem bảo hành, phụ kiện đầy đủ và không bị cấn móp, biến dạng.\n2. Áp dụng theo quy định trả hàng trong vòng 15 ngày kể từ ngày mua hàng.\n3. Số tiền hoàn trả được chi trả bằng tiền mặt (Phiếu chi 02-TT) hoặc chuyển khoản."))}
                    </div>
                    {(isExchange ? settings?.defaultExchangeFooterNote : settings?.defaultReturnFooterNote) && (
                      <div className="text-[10px] text-blue-900 font-semibold italic pt-1 border-t border-slate-200">
                        {isExchange ? settings?.defaultExchangeFooterNote : settings?.defaultReturnFooterNote}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs mt-6 pt-4 border-t border-slate-200">
                    <div><div className="font-bold">Người Lập Phiếu</div><div className="text-[11px] text-slate-500 italic mb-10">(Ký tên)</div><div>Mr. Thơm</div></div>
                    <div><div className="font-bold">Thủ Kho</div><div className="text-[11px] text-slate-500 italic mb-10">(Ký tên)</div><div>Thủ kho</div></div>
                    <div><div className="font-bold">Kế Toán</div><div className="text-[11px] text-slate-500 italic mb-10">(Ký tên)</div><div>Kế toán quỹ</div></div>
                    <div><div className="font-bold">Khách Hàng</div><div className="text-[11px] text-slate-500 italic mb-10">(Ký tên)</div><div>{customerName || "Khách hàng"}</div></div>
                  </div>
                </div>
              ) : (
                <div className={`bg-white text-slate-900 ${printSize === 'K58' ? 'w-[58mm] text-[9.5pt] print:w-[58mm]' : 'w-[80mm] text-[11px] print:w-[80mm]'} p-3 shadow-xl leading-tight font-mono rounded-lg print:rounded-none print:m-0 print:p-1`}>
                  <div className="text-center border-b border-dashed border-slate-400 pb-2 mb-2">
                    <h1 className="font-bold text-[12px] uppercase">{storeName}</h1>
                    <p className="text-[9px]">{storeAddress} - ĐT: {storePhone}</p>
                    <h2 className="text-[13px] font-extrabold uppercase mt-2">{isExchange ? "PHIẾU ĐỔI HÀNG" : "PHIẾU TRẢ HÀNG"}</h2>
                    <p className="text-[9px]">Mã: {docCode}</p>
                  </div>
                  <div className="border-t border-b border-dashed border-slate-400 py-1.5 my-2">
                    <div className="text-right text-[14px] font-extrabold">{formatVND(voucherAmount)}</div>
                    <div className="text-[9px] italic">({numberToVietnameseWords(voucherAmount)})</div>
                  </div>
                  <div className="grid grid-cols-2 text-center text-[10px] mt-4 pt-2">
                    <div><p className="font-bold">Khách Hàng</p><div className="h-8"></div><p>(Ký nhận)</p></div>
                    <div><p className="font-bold">Thu Ngân</p><div className="h-8"></div><p>Mr. Thơm</p></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. DOCUMENT 2: PHIẾU NHẬP KHO (PNK) */}
          {isDocVisible("inbound") && (
            <div className="w-full flex justify-center print:block print:w-full">
              <div className="bg-white text-slate-900 w-full max-w-[210mm] p-8 shadow-xl text-[13px] rounded-xl print:rounded-none print:m-0 print:p-6 print:w-full print:page-break-after-always">
                <div className="flex items-start justify-between border-b border-slate-300 pb-3">
                  <div>
                    <div className="font-bold uppercase text-[12px]">{storeName}</div>
                    <div className="text-[11px] text-slate-600">{storeAddress}</div>
                    <div className="text-[11px] text-slate-600">MST: {storeTaxCode} - ĐT: {storePhone}</div>
                  </div>
                  <div className="text-right text-[11px] border border-slate-400 p-2 bg-slate-50 rounded">
                    <div className="font-bold">Mẫu số: 01 - VT</div>
                    <div className="italic text-[10px] text-slate-600">(Theo TT 200/2014/TT-BTC)</div>
                    <div className="font-mono text-[10px] mt-1">
                      <div><strong>Nợ:</strong> TK 1561 &nbsp; <strong>Có:</strong> TK 6321 / 5212</div>
                    </div>
                  </div>
                </div>

                <div className="text-center my-4">
                  <h2 className="text-xl font-bold uppercase">PHIẾU NHẬP KHO {isExchange ? "(ĐỔI HÀNG)" : "(TRẢ HÀNG)"}</h2>
                  <div className="text-xs italic text-slate-600">Ngày {day} tháng {month} năm {year}</div>
                  <div className="text-xs font-mono font-bold text-emerald-700 mt-1">Số: {inboundReceiptCode || `PNK-${year}-${docCode.slice(-4)}`}</div>
                </div>

                <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <p><span className="font-semibold">Người giao hàng:</span> {customerName || "Khách lẻ"}</p>
                    <p><span className="font-semibold">Theo chứng từ:</span> {docCode}</p>
                  </div>
                  <div>
                    <p><span className="font-semibold">Nhập tại kho:</span> {warehouseName}</p>
                    <p><span className="font-semibold">Địa điểm:</span> {storeAddress}</p>
                  </div>
                </div>

                <table className="w-full border-collapse border border-slate-300 text-xs mb-4">
                  <thead>
                    <tr className="bg-slate-100 text-center font-bold">
                      <th className="border border-slate-300 p-2 w-8">STT</th>
                      <th className="border border-slate-300 p-2 text-left">Tên, nhãn hiệu vật tư</th>
                      <th className="border border-slate-300 p-2 w-20">Mã số</th>
                      <th className="border border-slate-300 p-2 w-12">ĐVT</th>
                      <th className="border border-slate-300 p-2 w-16">SL Nhập</th>
                      <th className="border border-slate-300 p-2 w-28 text-right">Đơn giá</th>
                      <th className="border border-slate-300 p-2 w-28 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(isExchange ? inItems : returnItems).map((it, i) => {
                      const price = Number((it as any).costPrice || (it as any).returnUnitPrice || (it as any).refundUnitPrice || (it as any).exchangeUnitPrice || 0);
                      const qty = Number(it.quantity || 0);
                      return (
                        <tr key={i}>
                          <td className="border border-slate-300 p-2 text-center">{i + 1}</td>
                          <td className="border border-slate-300 p-2 font-semibold">{it.productName}</td>
                          <td className="border border-slate-300 p-2 text-center font-mono">{it.sku}</td>
                          <td className="border border-slate-300 p-2 text-center">{it.unit || (it as any).uomName || "Cái"}</td>
                          <td className="border border-slate-300 p-2 text-center font-bold text-emerald-700">{qty}</td>
                          <td className="border border-slate-300 p-2 text-right font-mono">{formatVND(price)}</td>
                          <td className="border border-slate-300 p-2 text-right font-mono font-bold">
                            {formatVND(qty * price)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="grid grid-cols-5 gap-2 text-center text-xs mt-6 pt-4 border-t border-slate-200">
                  <div><div className="font-bold">Người Lập Phiếu</div><div className="text-[10px] text-slate-500 italic mb-10">(Ký tên)</div><div>Mr. Thơm</div></div>
                  <div><div className="font-bold">Người Giao Hàng</div><div className="text-[10px] text-slate-500 italic mb-10">(Ký tên)</div><div>{customerName || "Khách hàng"}</div></div>
                  <div><div className="font-bold">Thủ Kho</div><div className="text-[10px] text-slate-500 italic mb-10">(Ký tên)</div><div>Thủ kho</div></div>
                  <div><div className="font-bold">Kế Toán Trưởng</div><div className="text-[10px] text-slate-500 italic mb-10">(Ký tên)</div><div>Kế toán</div></div>
                  <div><div className="font-bold">Giám Đốc</div><div className="text-[10px] text-slate-500 italic mb-10">(Ký, đóng dấu)</div><div>{storeRepresentative}</div></div>
                </div>
              </div>
            </div>
          )}

          {/* 3. DOCUMENT 3: PHIẾU XUẤT KHO (PXK) - EXCHANGE ONLY */}
          {isExchange && isDocVisible("outbound") && (
            <div className="w-full flex justify-center print:block print:w-full">
              <div className="bg-white text-slate-900 w-full max-w-[210mm] p-8 shadow-xl text-[13px] rounded-xl print:rounded-none print:m-0 print:p-6 print:w-full print:page-break-after-always">
                <div className="flex items-start justify-between border-b border-slate-300 pb-3">
                  <div>
                    <div className="font-bold uppercase text-[12px]">{storeName}</div>
                    <div className="text-[11px] text-slate-600">{storeAddress}</div>
                    <div className="text-[11px] text-slate-600">MST: {storeTaxCode} - ĐT: {storePhone}</div>
                  </div>
                  <div className="text-right text-[11px] border border-slate-400 p-2 bg-slate-50 rounded">
                    <div className="font-bold">Mẫu số: 02 - VT</div>
                    <div className="italic text-[10px] text-slate-600">(Theo TT 200/2014/TT-BTC)</div>
                    <div className="font-mono text-[10px] mt-1">
                      <div><strong>Nợ:</strong> TK 6321 / 5111 &nbsp; <strong>Có:</strong> TK 1561</div>
                    </div>
                  </div>
                </div>

                <div className="text-center my-4">
                  <h2 className="text-xl font-bold uppercase">PHIẾU XUẤT KHO ĐỔI HÀNG</h2>
                  <div className="text-xs italic text-slate-600">Ngày {day} tháng {month} năm {year}</div>
                  <div className="text-xs font-mono font-bold text-cyan-700 mt-1">Số: {outboundIssueCode || `PXK-DH-${year}-${(docCode || "").slice(-4)}`}</div>
                </div>

                <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <p><span className="font-semibold">Người nhận hàng:</span> {customerName || "Khách lẻ"}</p>
                    <p><span className="font-semibold">Theo phiếu đổi:</span> {docCode}</p>
                  </div>
                  <div>
                    <p><span className="font-semibold">Xuất tại kho:</span> {warehouseName}</p>
                    <p><span className="font-semibold">Lý do:</span> Xuất thiết bị đổi mới cho khách hàng</p>
                  </div>
                </div>

                <table className="w-full border-collapse border border-slate-300 text-xs mb-4">
                  <thead>
                    <tr className="bg-slate-100 text-center font-bold">
                      <th className="border border-slate-300 p-2 w-8">STT</th>
                      <th className="border border-slate-300 p-2 text-left">Tên, nhãn hiệu vật tư</th>
                      <th className="border border-slate-300 p-2 w-20">Mã số</th>
                      <th className="border border-slate-300 p-2 w-12">ĐVT</th>
                      <th className="border border-slate-300 p-2 w-16">SL Xuất</th>
                      <th className="border border-slate-300 p-2 w-28 text-right">Đơn giá xuất</th>
                      <th className="border border-slate-300 p-2 w-28 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outItems.map((it, i) => {
                      const price = Number(it.exchangeUnitPrice || (it as any).unitPrice || 0);
                      const qty = Number(it.quantity || 0);
                      return (
                        <tr key={i}>
                          <td className="border border-slate-300 p-2 text-center">{i + 1}</td>
                          <td className="border border-slate-300 p-2 font-semibold">{it.productName}</td>
                          <td className="border border-slate-300 p-2 text-center font-mono">{it.sku}</td>
                          <td className="border border-slate-300 p-2 text-center">{it.unit || (it as any).uomName || "Cái"}</td>
                          <td className="border border-slate-300 p-2 text-center font-bold text-cyan-700">{qty}</td>
                          <td className="border border-slate-300 p-2 text-right font-mono">{formatVND(price)}</td>
                          <td className="border border-slate-300 p-2 text-right font-mono font-bold">{formatVND(qty * price)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="grid grid-cols-5 gap-2 text-center text-xs mt-6 pt-4 border-t border-slate-200">
                  <div><div className="font-bold">Người Lập Phiếu</div><div className="text-[10px] text-slate-500 italic mb-10">(Ký tên)</div><div>Mr. Thơm</div></div>
                  <div><div className="font-bold">Người Nhận Hàng</div><div className="text-[10px] text-slate-500 italic mb-10">(Ký tên)</div><div>{customerName || "Khách hàng"}</div></div>
                  <div><div className="font-bold">Thủ Kho</div><div className="text-[10px] text-slate-500 italic mb-10">(Ký tên)</div><div>Thủ kho</div></div>
                  <div><div className="font-bold">Kế Toán Trưởng</div><div className="text-[10px] text-slate-500 italic mb-10">(Ký tên)</div><div>Kế toán</div></div>
                  <div><div className="font-bold">Giám Đốc</div><div className="text-[10px] text-slate-500 italic mb-10">(Ký, đóng dấu)</div><div>{storeRepresentative}</div></div>
                </div>
              </div>
            </div>
          )}

          {/* 4. DOCUMENT 4: PHIẾU THU / CHI TIỀN MẶT (MẪU 01/02-TT) */}
          {isDocVisible("voucher") && (
            <div className="w-full flex justify-center print:block print:w-full">
              <div className="bg-white text-slate-900 w-full max-w-[210mm] p-8 shadow-xl text-[13px] rounded-xl print:rounded-none print:m-0 print:p-6 print:w-full print:page-break-after-always">
                <div className="flex items-start justify-between border-b border-slate-300 pb-3">
                  <div>
                    <div className="font-bold uppercase text-[12px]">{storeName}</div>
                    <div className="text-[11px] text-slate-600">{storeAddress}</div>
                    <div className="text-[11px] text-slate-600">MST: {storeTaxCode} - Hotline: {storePhone}</div>
                  </div>
                  <div className="text-right text-[11px] border border-slate-400 p-2 bg-slate-50 rounded">
                    <div className="font-bold">Mẫu số: {isVoucherIncome ? "01 - TT" : "02 - TT"}</div>
                    <div className="italic text-[10px] text-slate-600">(Theo TT 200/2014/TT-BTC & TT 133/2016/TT-BTC)</div>
                    <div className="font-mono text-[10px] mt-1">
                      {isVoucherIncome ? (
                        <div><strong>Nợ:</strong> TK 1111 &nbsp; <strong>Có:</strong> TK 5111, 5212</div>
                      ) : (
                        <div><strong>Nợ:</strong> TK 5212, 33311 &nbsp; <strong>Có:</strong> TK 1111</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-center my-4">
                  <h2 className="text-xl font-bold uppercase">{isVoucherIncome ? "PHIẾU THU TIỀN MẶT" : "PHIẾU CHI TIỀN MẶT"}</h2>
                  <div className="text-xs italic text-slate-600">Ngày {day} tháng {month} năm {year}</div>
                  <div className="text-xs font-mono font-bold text-amber-700 mt-1">Số: {voucherCode}</div>
                </div>

                <div className="space-y-2 text-xs bg-slate-50 p-4 rounded border border-slate-200 mb-6">
                  <div className="flex"><span className="w-40 font-semibold">{isVoucherIncome ? "Người nộp tiền:" : "Người nhận tiền:"}</span><span className="font-bold">{customerName || "Khách lẻ"}</span></div>
                  <div className="flex"><span className="w-40 font-semibold">Địa chỉ / Điện thoại:</span><span>{customerAddress || "Tại cửa hàng"} - {customerPhone || "---"}</span></div>
                  <div className="flex"><span className="w-40 font-semibold">Lý do thu / chi:</span><span>{isExchange ? (isVoucherIncome ? `Thu tiền chênh lệch đổi hàng ${docCode}` : `Chi hoàn tiền chênh lệch đổi hàng ${docCode}`) : `Chi hoàn tiền trả hàng ${docCode}`}</span></div>
                  <div className="flex items-center"><span className="w-40 font-semibold">Số tiền:</span><span className="text-base font-extrabold font-mono text-slate-900">{formatVND(voucherAmount)}</span></div>
                  <div className="flex"><span className="w-40 font-semibold">Viết bằng chữ:</span><span className="italic font-bold">{numberToVietnameseWords(voucherAmount)}</span></div>
                </div>

                <div className="grid grid-cols-5 gap-2 text-center text-xs mt-8 pt-4 border-t border-slate-200">
                  <div><div className="font-bold">Giám Đốc</div><div className="text-[10px] text-slate-500 italic mb-10">(Ký, đóng dấu)</div><div>{storeRepresentative}</div></div>
                  <div><div className="font-bold">Kế Toán Trưởng</div><div className="text-[10px] text-slate-500 italic mb-10">(Ký tên)</div><div>Kế toán</div></div>
                  <div><div className="font-bold">{isVoucherIncome ? "Người Nộp Tiền" : "Người Nhận Tiền"}</div><div className="text-[10px] text-slate-500 italic mb-10">(Ký tên)</div><div>{customerName || "Khách hàng"}</div></div>
                  <div><div className="font-bold">Người Lập Phiếu</div><div className="text-[10px] text-slate-500 italic mb-10">(Ký tên)</div><div>Mr. Thơm</div></div>
                  <div><div className="font-bold">Thủ Quỹ</div><div className="text-[10px] text-slate-500 italic mb-10">(Ký tên)</div><div>Thủ quỹ</div></div>
                </div>
              </div>
            </div>
          )}

          {/* 5. DOCUMENT 5: BIÊN BẢN TRẢ HÀNG & THU HỒI HOÁ ĐƠN (ẢNH 2 - NĐ 123) */}
          {!isExchange && isDocVisible("legal_return") && (
            <div className="w-full flex justify-center print:block print:w-full">
              <div className="bg-white text-slate-900 w-full max-w-[210mm] p-8 shadow-xl text-[13px] rounded-xl print:rounded-none print:m-0 print:p-6 print:w-full print:page-break-after-always">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-1/2">
                    <div className="font-bold uppercase text-[11px]">{storeName}</div>
                    <div className="text-[11px] font-semibold">Số: GP-HM{year}{month}{day}-001</div>
                  </div>
                  <div className="w-1/2 text-center">
                    <div className="font-bold uppercase text-[11px]">Cộng hòa xã hội chủ nghĩa Việt Nam</div>
                    <div className="font-bold text-[11px] underline">Độc lập - Tự do - Hạnh phúc</div>
                  </div>
                </div>

                <div className="text-center my-5"><h2 className="text-lg font-bold uppercase">BIÊN BẢN TRẢ HÀNG VÀ THU HỒI HOÁ ĐƠN</h2></div>
                <p className="italic text-xs mb-3">Biên bản này được lập ngày {day} tháng {month} năm {year}, Giữa các bên bao gồm:</p>

                <div className="space-y-1 text-xs mb-3">
                  <div className="font-bold uppercase">BÊN BÁN HÀNG: {storeName}</div>
                  <div className="pl-3 space-y-0.5">
                    <div>- Mã số thuế: <span className="font-semibold">{storeTaxCode}</span></div>
                    <div>- Địa chỉ: {storeAddress}</div>
                    <div>- Đại diện: <span className="font-semibold">{storeRepresentative}</span></div>
                  </div>
                </div>

                <div className="space-y-1 text-xs mb-4">
                  <div className="font-bold uppercase">BÊN MUA HÀNG: {customerName || "CÔNG TY TNHH HOÀN MAI"}</div>
                  <div className="pl-3 space-y-0.5">
                    <div>- MST/CCCD: <span className="font-semibold">{customerTaxCode}</span> &nbsp;&nbsp; Điện thoại: <span className="font-semibold">{customerPhone || "0975 824 156"}</span></div>
                    <div>- Địa chỉ: {customerAddress || "Số 9 ngách 25/77 Vũ Ngọc Phan, P. Láng Hạ, Q. Đống Đa, Hà Nội"}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="font-bold text-xs mb-1">1. Bên mua trả lại hàng đã mua của bên bán, chi tiết ở bảng kê sau:</div>
                  <table className="w-full border-collapse border border-black text-xs">
                    <thead>
                      <tr className="bg-slate-50 font-bold text-center">
                        <th className="border border-black p-1.5 w-10">STT</th>
                        <th className="border border-black p-1.5 text-left">Tên hàng hoá, dịch vụ</th>
                        <th className="border border-black p-1.5 w-14">ĐVT</th>
                        <th className="border border-black p-1.5 w-12">SL</th>
                        <th className="border border-black p-1.5 w-24 text-right">Đơn giá</th>
                        <th className="border border-black p-1.5 w-24 text-right">Cộng tiền</th>
                        <th className="border border-black p-1.5 w-20 text-center">Thuế VAT 10%</th>
                        <th className="border border-black p-1.5 w-28 text-right">Tổng thanh toán</th>
                      </tr>
                    </thead>
                    <tbody>
                      {returnItems.map((it, idx) => {
                        const preTaxPrice = Math.round(it.refundUnitPrice / 1.1);
                        const subTotal = preTaxPrice * it.quantity;
                        const vat = Math.round(subTotal * 0.1);
                        const grand = subTotal + vat;
                        return (
                          <tr key={idx}>
                            <td className="border border-black p-1.5 text-center font-mono">{String(idx + 1).padStart(2, "0")}</td>
                            <td className="border border-black p-1.5 font-bold">{it.productName}</td>
                            <td className="border border-black p-1.5 text-center">{it.uomName || "Cái"}</td>
                            <td className="border border-black p-1.5 text-center font-bold">{it.quantity}</td>
                            <td className="border border-black p-1.5 text-right font-mono">{formatVND(preTaxPrice).replace(" ₫", "")}</td>
                            <td className="border border-black p-1.5 text-right font-mono">{formatVND(subTotal).replace(" ₫", "")}</td>
                            <td className="border border-black p-1.5 text-right font-mono">{formatVND(vat).replace(" ₫", "")}</td>
                            <td className="border border-black p-1.5 text-right font-mono font-bold">{formatVND(grand).replace(" ₫", "")}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="text-xs italic mt-1">Bằng chữ: <span className="font-semibold">{numberToVietnameseWords(returnItemsTotal)}./.</span></div>
                </div>

                <div className="mb-5">
                  <div className="font-bold text-xs mb-1">2. Bên mua trả lại hoá đơn mua hàng cho bên bán, chi tiết như sau:</div>
                  <table className="w-full border-collapse border border-black text-xs">
                    <thead>
                      <tr className="bg-slate-50 font-bold text-center">
                        <th className="border border-black p-1.5">Số hoá đơn</th>
                        <th className="border border-black p-1.5">Ký hiệu</th>
                        <th className="border border-black p-1.5">Ngày phát hành</th>
                        <th className="border border-black p-1.5 text-right">Số tiền</th>
                        <th className="border border-black p-1.5 text-left">Lý do thu hồi</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-black p-1.5 text-center font-mono font-bold">{invoiceRecallNo}</td>
                        <td className="border border-black p-1.5 text-center font-mono">{invoiceRecallSymbol}</td>
                        <td className="border border-black p-1.5 text-center font-mono">{invoiceRecallDate}</td>
                        <td className="border border-black p-1.5 text-right font-mono font-bold">{formatVND(returnItemsTotal).replace(" ₫", "")}</td>
                        <td className="border border-black p-1.5">{invoiceRecallReason}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-xs leading-relaxed mb-8">
                  Hai bên cam kết chịu trách nhiệm kê khai đúng theo quy định pháp luật về quản lý và phát hành hoá đơn. Biên bản này được lập thành 02 bản có giá trị như nhau.
                </p>

                <div className="grid grid-cols-2 gap-8 text-center text-xs mt-6">
                  <div>
                    <div className="font-bold uppercase">ĐẠI DIỆN BÊN BÁN</div>
                    <div className="italic text-[11px] text-slate-500 mb-12">(Ký tên, đóng dấu)</div>
                    <div className="font-bold">{storeRepresentative}</div>
                  </div>
                  <div>
                    <div className="font-bold uppercase">ĐẠI DIỆN BÊN MUA</div>
                    <div className="italic text-[11px] text-slate-500 mb-12">(Ký tên, đóng dấu)</div>
                    <div className="font-bold">{customerName || "Khách Hàng"}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6. DOCUMENT 6: BIÊN BẢN ĐỔI HÀNG VÀ THAY ĐỔI HOÁ ĐƠN (ẢNH 4 - EXCHANGE) */}
          {isExchange && isDocVisible("legal_exchange") && (
            <div className="w-full flex justify-center print:block print:w-full">
              <div className="bg-white text-slate-900 w-full max-w-[210mm] p-8 shadow-xl text-[13px] rounded-xl print:rounded-none print:m-0 print:p-6 print:w-full print:page-break-after-always">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-1/2">
                    <div className="font-bold uppercase text-[11px]">{storeName}</div>
                    <div className="text-[11px] font-semibold">Số: GP-HM{year}{month}{day}-001</div>
                  </div>
                  <div className="w-1/2 text-center">
                    <div className="font-bold uppercase text-[11px]">Cộng hoà xã hội chủ nghĩa Việt Nam</div>
                    <div className="font-bold text-[11px] underline">Độc lập - Tự do - Hạnh phúc</div>
                  </div>
                </div>

                <div className="text-center my-5"><h2 className="text-lg font-bold uppercase">BIÊN BẢN ĐỔI HÀNG VÀ THAY ĐỔI HOÁ ĐƠN</h2></div>

                <div className="space-y-1 text-xs mb-3">
                  <div className="font-bold uppercase">BÊN BÁN HÀNG: {storeName}</div>
                  <div className="pl-3 space-y-0.5">
                    <div>- Mã số thuế: <span className="font-semibold">{storeTaxCode}</span> &nbsp;|&nbsp; Đại diện: <span className="font-semibold">{storeRepresentative}</span></div>
                    <div>- Địa chỉ: {storeAddress}</div>
                  </div>
                </div>

                <div className="space-y-1 text-xs mb-4">
                  <div className="font-bold uppercase">BÊN MUA HÀNG: {customerName || "CÔNG TY TNHH HOÀN MAI"}</div>
                  <div className="pl-3 space-y-0.5">
                    <div>- MST/CCCD: <span className="font-semibold">{customerTaxCode}</span> &nbsp;|&nbsp; Điện thoại: <span className="font-semibold">{customerPhone || "0975 824 156"}</span></div>
                    <div>- Địa chỉ: {customerAddress || "Số 9 ngách 25/77 Vũ Ngọc Phan, P. Láng Hạ, Q. Đống Đa, Hà Nội"}</div>
                  </div>
                </div>

                <div className="mb-4 space-y-2">
                  <div className="font-bold text-xs">1. Bên mua đổi hàng đã mua của bên bán, Số Phiếu: {originalOrderCode || docCode}</div>
                  <table className="w-full border-collapse border border-black text-xs">
                    <thead>
                      <tr className="bg-slate-50 font-bold text-center">
                        <th className="border border-black p-1.5 w-10">STT</th>
                        <th className="border border-black p-1.5 text-left">Tên hàng cũ cần đổi</th>
                        <th className="border border-black p-1.5 w-12">SL</th>
                        <th className="border border-black p-1.5 w-24 text-right">Đơn giá</th>
                        <th className="border border-black p-1.5 w-28 text-right">Tổng thanh toán</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inItems.map((it, idx) => {
                        const price = Number(it.returnUnitPrice || (it as any).exchangeUnitPrice || (it as any).unitPrice || 0);
                        const qty = Number(it.quantity || 0);
                        return (
                          <tr key={idx}>
                            <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                            <td className="border border-black p-1.5 font-bold">{it.productName}</td>
                            <td className="border border-black p-1.5 text-center font-bold">{qty}</td>
                            <td className="border border-black p-1.5 text-right font-mono">{formatVND(price).replace(" VNĐ", "").replace(" ₫", "")}</td>
                            <td className="border border-black p-1.5 text-right font-mono font-bold">{formatVND(qty * price).replace(" VNĐ", "").replace(" ₫", "")}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <div className="font-bold text-xs pt-1">Hàng hóa được đổi mới:</div>
                  <table className="w-full border-collapse border border-black text-xs">
                    <thead>
                      <tr className="bg-slate-50 font-bold text-center">
                        <th className="border border-black p-1.5 w-10">STT</th>
                        <th className="border border-black p-1.5 text-left">Tên hàng mới giao đổi</th>
                        <th className="border border-black p-1.5 w-12">SL</th>
                        <th className="border border-black p-1.5 w-24 text-right">Đơn giá</th>
                        <th className="border border-black p-1.5 w-28 text-right">Tổng thanh toán</th>
                      </tr>
                    </thead>
                    <tbody>
                      {outItems.map((it, idx) => {
                        const price = Number(it.exchangeUnitPrice || (it as any).unitPrice || 0);
                        const qty = Number(it.quantity || 0);
                        return (
                          <tr key={idx}>
                            <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                            <td className="border border-black p-1.5 font-bold">{it.productName}</td>
                            <td className="border border-black p-1.5 text-center font-bold">{qty}</td>
                            <td className="border border-black p-1.5 text-right font-mono">{formatVND(price).replace(" VNĐ", "").replace(" ₫", "")}</td>
                            <td className="border border-black p-1.5 text-right font-mono font-bold">{formatVND(qty * price).replace(" VNĐ", "").replace(" ₫", "")}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mb-5 space-y-2">
                  <div className="font-bold text-xs">2. Bên mua đổi lại hoá đơn mua hàng cho bên bán:</div>
                  <table className="w-full border-collapse border border-black text-xs">
                    <thead>
                      <tr className="bg-slate-50 font-bold text-center">
                        <th className="border border-black p-1.5">Loại HĐ</th>
                        <th className="border border-black p-1.5">Số HĐ</th>
                        <th className="border border-black p-1.5">Ký hiệu</th>
                        <th className="border border-black p-1.5">Ngày phát hành</th>
                        <th className="border border-black p-1.5 text-right">Số tiền</th>
                        <th className="border border-black p-1.5 text-center">Trạng thái / Lý do</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-black p-1.5 font-bold text-red-700">HĐ Cũ Thu Hồi</td>
                        <td className="border border-black p-1.5 text-center font-mono">{invoiceRecallNo}</td>
                        <td className="border border-black p-1.5 text-center font-mono">{invoiceRecallSymbol}</td>
                        <td className="border border-black p-1.5 text-center font-mono">{invoiceRecallDate}</td>
                        <td className="border border-black p-1.5 text-right font-mono">{formatVND(inItemsExchangeTotal).replace(" VNĐ", "").replace(" ₫", "")}</td>
                        <td className="border border-black p-1.5 text-center text-red-600">{invoiceRecallReason}</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-1.5 font-bold text-emerald-700">HĐ Mới Thay Thế</td>
                        <td className="border border-black p-1.5 text-center font-mono">{invoiceReplaceNo}</td>
                        <td className="border border-black p-1.5 text-center font-mono">{invoiceReplaceSymbol}</td>
                        <td className="border border-black p-1.5 text-center font-mono">{invoiceReplaceDate}</td>
                        <td className="border border-black p-1.5 text-right font-mono">{formatVND(outItemsTotal).replace(" VNĐ", "").replace(" ₫", "")}</td>
                        <td className="border border-black p-1.5 text-center text-emerald-700 font-bold">Mới 100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-2 gap-8 text-center text-xs mt-6">
                  <div>
                    <div className="font-bold uppercase">ĐẠI DIỆN BÊN BÁN</div>
                    <div className="italic text-[11px] text-slate-500 mb-12">(Ký tên, đóng dấu)</div>
                    <div className="font-bold">{storeRepresentative}</div>
                  </div>
                  <div>
                    <div className="font-bold uppercase">ĐẠI DIỆN BÊN MUA</div>
                    <div className="italic text-[11px] text-slate-500 mb-12">(Ký tên, đóng dấu)</div>
                    <div className="font-bold">{customerName || "Khách Hàng"}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 7. DOCUMENT 7: BIÊN BẢN BÀN GIAO - TRAO ĐỔI THU CŨ ĐỔI MỚI (ẢNH 1) */}
          {isExchange && isDocVisible("legal_handover") && (
            <div className="w-full flex justify-center print:block print:w-full">
              <div className="bg-white text-slate-900 w-full max-w-[210mm] p-8 shadow-xl text-[13px] rounded-xl print:rounded-none print:m-0 print:p-6 print:w-full print:page-break-after-always">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-1/2">
                    <div className="font-bold uppercase text-[11px]">{storeName}</div>
                    <div className="text-[11px] font-semibold">Số: GP-FQ{year}{month}{day}-06</div>
                  </div>
                  <div className="w-1/2 text-center">
                    <div className="font-bold uppercase text-[11px]">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                    <div className="font-bold text-[11px] underline">Độc lập – Tự do – Hạnh phúc</div>
                    <div className="text-[11px] italic mt-0.5">HCM, ngày {day} tháng {month} năm {year}</div>
                  </div>
                </div>

                <div className="text-center my-5"><h2 className="text-lg font-bold uppercase">BIÊN BẢN BÀN GIAO - TRAO ĐỔI HÀNG HÓA</h2></div>

                <div className="italic text-xs mb-3 space-y-0.5">
                  <div>Căn cứ Hợp đồng mua bán và Đơn đặt hàng của {customerName || "CÔNG TY TNHH CÔNG NGHỆ DỆT FENGQIANG VIỆT NAM"}</div>
                  <div>Hôm nay, ngày {day}/{month}/{year}, chúng tôi gồm:</div>
                </div>

                <div className="space-y-1 text-xs mb-3">
                  <div className="font-bold uppercase">BÊN A (Bên nhận hàng): {customerName || "CÔNG TY TNHH CÔNG NGHỆ DỆT FENGQIANG VIỆT NAM"}</div>
                  <div className="pl-3 space-y-0.5">
                    <div>- Địa chỉ: {customerAddress || "Lô số B8, B9, B10 KCN TMTC thuộc KKTCK Mộc Bài, ấp Thuận Đông, Bến Cầu, Tây Ninh"}</div>
                    <div>- Đại diện: {customerRepresentative}</div>
                  </div>
                </div>

                <div className="space-y-1 text-xs mb-4">
                  <div className="font-bold uppercase">BÊN B (Bên giao hàng): {storeName}</div>
                  <div className="pl-3 space-y-0.5">
                    <div>- Địa chỉ: {storeAddress} &nbsp;|&nbsp; ĐT: {storePhone}</div>
                    <div>- Đại diện: <span className="font-semibold">{storeRepresentative}</span> (Giám đốc)</div>
                  </div>
                </div>

                <div className="space-y-3 mb-4 text-xs">
                  <div>
                    <div className="font-bold mb-1">A. Giao máy mới / Thiết bị thay thế</div>
                    <table className="w-full border-collapse border border-black">
                      <thead><tr className="bg-slate-50 font-bold text-center"><th className="border border-black p-1">STT</th><th className="border border-black p-1 text-left">Tên hàng</th><th className="border border-black p-1 w-12">SL</th><th className="border border-black p-1 w-24 text-right">Đơn giá</th><th className="border border-black p-1 w-28 text-right">Thành tiền</th></tr></thead>
                      <tbody>
                        {outItems.map((it, i) => {
                          const price = Number(it.exchangeUnitPrice || (it as any).unitPrice || 0);
                          const qty = Number(it.quantity || 0);
                          return (
                            <tr key={i}><td className="border border-black p-1 text-center">{i + 1}</td><td className="border border-black p-1">{it.productName}</td><td className="border border-black p-1 text-center font-bold">{qty}</td><td className="border border-black p-1 text-right font-mono">{formatVND(price).replace(" VNĐ", "").replace(" ₫", "")}</td><td className="border border-black p-1 text-right font-mono font-bold">{formatVND(qty * price).replace(" VNĐ", "").replace(" ₫", "")}</td></tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div>
                    <div className="font-bold mb-1">B. Thu hồi máy cũ / Thiết bị cũ</div>
                    <table className="w-full border-collapse border border-black">
                      <thead><tr className="bg-slate-50 font-bold text-center"><th className="border border-black p-1">STT</th><th className="border border-black p-1 text-left">Tên hàng cũ</th><th className="border border-black p-1 w-12">SL</th><th className="border border-black p-1 w-24 text-right">Đơn giá</th><th className="border border-black p-1 w-28 text-right">Thành tiền</th></tr></thead>
                      <tbody>
                        {inItems.map((it, i) => {
                          const price = Number(it.returnUnitPrice || (it as any).exchangeUnitPrice || (it as any).unitPrice || 0);
                          const qty = Number(it.quantity || 0);
                          return (
                            <tr key={i}><td className="border border-black p-1 text-center">{i + 1}</td><td className="border border-black p-1">{it.productName}</td><td className="border border-black p-1 text-center font-bold">{qty}</td><td className="border border-black p-1 text-right font-mono">{formatVND(price).replace(" VNĐ", "").replace(" ₫", "")}</td><td className="border border-black p-1 text-right font-mono font-bold">{formatVND(qty * price).replace(" VNĐ", "").replace(" ₫", "")}</td></tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div>
                    <div className="font-bold mb-1">C. Chi phí hỗ trợ khấu hao thu hồi {depreciationPercent}%</div>
                    <table className="w-full border-collapse border border-black">
                      <thead><tr className="bg-slate-50 font-bold text-center"><th className="border border-black p-1">STT</th><th className="border border-black p-1 text-left">Nội dung khấu hao</th><th className="border border-black p-1 w-12">SL</th><th className="border border-black p-1 w-28 text-right">Thành tiền</th></tr></thead>
                      <tbody>
                        {inItems.map((it, i) => {
                          const price = Number(it.returnUnitPrice || (it as any).exchangeUnitPrice || (it as any).unitPrice || 0);
                          const qty = Number(it.quantity || 0);
                          return (
                            <tr key={i}><td className="border border-black p-1 text-center">{i + 1}</td><td className="border border-black p-1">Khấu hao {depreciationPercent}% {it.productName}</td><td className="border border-black p-1 text-center">{qty}</td><td className="border border-black p-1 text-right font-mono">{formatVND(Math.round(qty * price * (depreciationPercent / 100))).replace(" VNĐ", "").replace(" ₫", "")}</td></tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="text-xs mb-6 font-semibold space-y-1">
                  <div>Tổng tiền sau thay đổi: <span className="font-bold text-red-700">{formatVND(voucherAmount)}</span></div>
                  <div className="text-slate-700">Lưu ý: xuất HĐ linh kiện thay thế cho đủ tiền chênh lệch.</div>
                </div>

                <div className="grid grid-cols-2 gap-8 text-center text-xs mt-6">
                  <div><div className="font-bold uppercase">ĐẠI DIỆN BÊN A</div><div className="h-12"></div><div className="font-bold">{customerRepresentative}</div></div>
                  <div><div className="font-bold uppercase">ĐẠI DIỆN BÊN B</div><div className="h-12"></div><div className="font-bold">{storeRepresentative}</div></div>
                </div>
              </div>
            </div>
          )}

          {/* 8. DOCUMENT 8: BIÊN BẢN HOÀN THÀNH CÔNG VIỆC & NGHIỆM THU (ẢNH 3) */}
          {isDocVisible("legal_completion") && (
            <div className="w-full flex justify-center print:block print:w-full">
              <div className="bg-white text-slate-900 w-full max-w-[210mm] p-8 shadow-xl text-[13px] rounded-xl print:rounded-none print:m-0 print:p-6 print:w-full print:page-break-after-always">
                <div className="text-center mb-5">
                  <div className="font-bold uppercase text-[12px]">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                  <div className="font-bold text-[12px] underline">Độc lập – Tự do – Hạnh phúc</div>
                  <div className="text-xs italic text-right mt-1">Phú An, ngày {day}/{month}/{year}</div>
                </div>

                <div className="text-center my-5"><h2 className="text-lg font-bold uppercase">BIÊN BẢN XÁC NHẬN HOÀN THÀNH CÔNG VIỆC</h2></div>

                <div className="space-y-1 text-xs mb-3">
                  <div className="font-bold"><span className="underline">Bên A</span>: {storeName}</div>
                  <div className="pl-3 space-y-0.5">
                    <div>Địa chỉ: {storeAddress}</div>
                    <div>Đại diện: <span className="font-semibold">{storeRepresentative}</span></div>
                  </div>
                </div>

                <div className="space-y-1 text-xs mb-4">
                  <div className="font-bold"><span className="underline">Bên B</span>: {customerName || "Công ty TNHH Chrysanthemum Việt Nam"}</div>
                  <div className="pl-3 space-y-0.5">
                    <div>Địa chỉ: {customerAddress || "KCN Quốc tế Protrade, Tây Nam, TP. HCM"}</div>
                    <div>Đại diện: {customerRepresentative}</div>
                  </div>
                </div>

                <table className="w-full border-collapse border border-black text-xs mb-4">
                  <thead>
                    <tr className="bg-slate-50 font-bold text-center">
                      <th className="border border-black p-1.5 w-10">STT</th>
                      <th className="border border-black p-1.5 text-left">Nội dung mô tả</th>
                      <th className="border border-black p-1.5 w-14">ĐVT</th>
                      <th className="border border-black p-1.5 w-12">SL</th>
                      <th className="border border-black p-1.5 w-28 text-right">Đơn giá</th>
                      <th className="border border-black p-1.5 w-28 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(isExchange ? outItems : returnItems).map((it, idx) => {
                      const price = Number((it as any).exchangeUnitPrice || (it as any).refundUnitPrice || (it as any).unitPrice || 0);
                      const qty = Number(it.quantity || 0);
                      return (
                        <tr key={idx}>
                          <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                          <td className="border border-black p-1.5 font-bold">{it.productName}</td>
                          <td className="border border-black p-1.5 text-center">{it.unit || (it as any).uomName || "Cái"}</td>
                          <td className="border border-black p-1.5 text-center font-bold">{qty}</td>
                          <td className="border border-black p-1.5 text-right font-mono">{formatVND(price).replace(" VNĐ", "").replace(" ₫", "")}</td>
                          <td className="border border-black p-1.5 text-right font-mono font-bold">{formatVND(qty * price).replace(" VNĐ", "").replace(" ₫", "")}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="text-xs space-y-1 mb-8">
                  <div>Bên A bàn giao cho bên B như sau:</div>
                  <div className="pl-3 font-semibold">{handoverNote}</div>
                </div>

                <div className="grid grid-cols-2 gap-8 text-center text-xs mt-8">
                  <div><div className="font-bold">Đại diện bên A</div><div className="h-12"></div><div className="font-bold">{storeRepresentative}</div></div>
                  <div><div className="font-bold">Đại diện bên B</div><div className="h-12"></div><div className="font-bold">{customerName || "Đại diện bên B"}</div></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

