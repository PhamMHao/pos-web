import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  QrCode,
  Barcode,
  Printer,
  X,
  FileText,
  Receipt,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Camera,
  Video,
  VideoOff,
  RefreshCw,
  Eye,
  Filter,
  ShoppingCart,
  Wrench,
  Package,
  Zap,
  ChevronRight,
  TrendingUp,
  Tag,
  AlertCircle,
} from 'lucide-react';
import {
  Order,
  StockGoodsReceipt,
  PriceQuote,
  WarrantyTicket,
  PurchaseOrder,
  EInvoice,
  InboundEInvoice,
  Product,
  Customer,
  StoreSettings,
  PaperSize,
} from '../../types';
import { formatVND } from '../../utils/vietqr';
import { GiaPhucLogo } from './GiaPhucLogo';
import { SlipBarcodeQR } from './SlipBarcodeQR';
import { PrintInvoiceModal } from './PrintInvoiceModal';
import { ReceiptModal } from '../pos/ReceiptModal';
import { WarrantyPrintModal } from '../warranty/WarrantyPrintModal';

export type DocFilterType =
  | 'all'
  | 'order'
  | 'quote'
  | 'stock_receipt'
  | 'warranty'
  | 'purchase_order'
  | 'e_invoice'
  | 'inbound_invoice';

export interface UnifiedDocItem {
  id: string;
  code: string;
  type: DocFilterType;
  typeLabel: string;
  typeColor: string;
  date: string;
  customerOrSupplierName: string;
  phone?: string;
  totalAmount: number;
  status: string;
  statusColor: string;
  itemsCount: number;
  itemsSummary: string;
  serialNumber?: string;
  sku?: string;
  creator?: string;
  rawDoc: any;
}

interface UniversalDocSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders?: Order[];
  stockReceipts?: StockGoodsReceipt[];
  quotes?: PriceQuote[];
  warranties?: WarrantyTicket[];
  purchaseOrders?: PurchaseOrder[];
  eInvoices?: EInvoice[];
  inboundInvoices?: InboundEInvoice[];
  products?: Product[];
  customers?: Customer[];
  settings: StoreSettings;
  onSelectDoc?: (doc: any, docType: string) => void;
}

export const UniversalDocSearchModal: React.FC<UniversalDocSearchModalProps> = ({
  isOpen,
  onClose,
  orders = [],
  stockReceipts = [],
  quotes = [],
  warranties = [],
  purchaseOrders = [],
  eInvoices = [],
  inboundInvoices = [],
  products = [],
  customers = [],
  settings,
  onSelectDoc,
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'camera' | 'lifecycle'>('search');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDocType, setSelectedDocType] = useState<DocFilterType>('all');
  const [selectedItem, setSelectedItem] = useState<UnifiedDocItem | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Print Modals State
  const [printDoc, setPrintDoc] = useState<{ doc: any; docType: string; initialPaper?: PaperSize } | null>(null);

  // Camera Scanner State
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Hardware Scanner buffer
  const scanBufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  // Focus search on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Hardware Barcode Scanner Listener & Global F7 / Esc shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Hardware Barcode Scanner buffer capture
      const currentTime = Date.now();
      if (currentTime - lastKeyTimeRef.current > 150) {
        scanBufferRef.current = '';
      }
      lastKeyTimeRef.current = currentTime;

      if (e.key === 'Enter') {
        if (scanBufferRef.current.length >= 3) {
          const scannedText = scanBufferRef.current.trim();
          handleScannedCode(scannedText);
          scanBufferRef.current = '';
        }
      } else if (e.key.length === 1) {
        scanBufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Parse Smart ERP QR or raw barcode
  const handleScannedCode = (code: string) => {
    if (code.startsWith('GP-ERP://doc?')) {
      // Smart ERP QR: extract query params
      try {
        const url = new URL(code);
        const docCode = url.searchParams.get('code');
        if (docCode) {
          setSearchTerm(docCode);
          setActiveTab('search');
        }
      } catch {
        setSearchTerm(code);
      }
    } else {
      setSearchTerm(code);
      setActiveTab('search');
    }
  };

  // Convert all raw modules into unified searchable documents list
  const allDocuments: UnifiedDocItem[] = useMemo(() => {
    const list: UnifiedDocItem[] = [];

    // 1. POS Orders
    orders.forEach((o) => {
      list.push({
        id: `order-${o.id}`,
        code: o.code,
        type: 'order',
        typeLabel: 'Đơn Bán Hàng POS',
        typeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        date: o.createdAt,
        customerOrSupplierName: o.customer?.name || 'Khách lẻ tại quầy',
        phone: o.customer?.phone,
        totalAmount: o.total,
        status: o.status === 'completed' ? 'Hoàn tất' : o.status === 'pending' ? 'Chờ duyệt' : o.status,
        statusColor: o.status === 'completed' ? 'text-emerald-400' : 'text-amber-400',
        itemsCount: o.items.length,
        itemsSummary: o.items.map((i) => `${i.productName} (x${i.quantity})`).join(', '),
        sku: o.items.map((i) => i.sku).join(', '),
        rawDoc: o,
      });
    });

    // 2. Stock Receipts / Issues
    stockReceipts.forEach((r) => {
      list.push({
        id: `stock-${r.id}`,
        code: r.code,
        type: 'stock_receipt',
        typeLabel: 'Phiếu Nhập Kho',
        typeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        date: r.date,
        customerOrSupplierName: r.supplierName,
        totalAmount: r.grandTotal,
        status: 'Đã nhập kho',
        statusColor: 'text-blue-400',
        itemsCount: r.items.length,
        itemsSummary: r.items.map((i) => `${i.productName} (x${i.quantity})`).join(', '),
        creator: r.creatorName,
        sku: r.items.map((i) => i.sku).join(', '),
        rawDoc: r,
      });
    });

    // 3. Price Quotes
    quotes.forEach((q) => {
      list.push({
        id: `quote-${q.id}`,
        code: q.code,
        type: 'quote',
        typeLabel: 'Báo Giá Dự Toán',
        typeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        date: q.createdAt,
        customerOrSupplierName: q.customerName,
        phone: q.customerPhone,
        totalAmount: q.finalTotal,
        status: q.status === 'approved' ? 'Đã duyệt' : q.status === 'converted_to_order' ? 'Đã chốt POS' : 'Dự thảo',
        statusColor: q.status === 'approved' || q.status === 'converted_to_order' ? 'text-purple-400' : 'text-slate-400',
        itemsCount: q.items.length,
        itemsSummary: q.items.map((i) => `${i.productName} (x${i.quantity})`).join(', '),
        sku: q.items.map((i) => i.sku).join(', '),
        rawDoc: q,
      });
    });

    // 4. Warranty Tickets
    warranties.forEach((w) => {
      list.push({
        id: `warranty-${w.id}`,
        code: w.code,
        type: 'warranty',
        typeLabel: 'Phiếu Bảo Hành / Sửa Chữa',
        typeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        date: w.receivedDate,
        customerOrSupplierName: w.customerName,
        phone: w.customerPhone,
        totalAmount: w.totalFee || 0,
        status: w.status === 'ready_to_return' ? 'Đã sửa xong' : w.status === 'returned' ? 'Đã trả khách' : 'Đang xử lý',
        statusColor: w.status === 'returned' ? 'text-cyan-400' : 'text-amber-400',
        itemsCount: 1,
        itemsSummary: `${w.productName} - Lỗi: ${w.issueDescription}`,
        serialNumber: w.serialNumber,
        creator: w.technicianName,
        rawDoc: w,
      });
    });

    // 5. Purchase Orders
    purchaseOrders.forEach((po) => {
      list.push({
        id: `po-${po.id}`,
        code: po.code,
        type: 'purchase_order',
        typeLabel: 'Đơn Mua Hàng PO',
        typeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        date: po.orderDate,
        customerOrSupplierName: po.supplierName,
        phone: po.supplierPhone,
        totalAmount: po.totalAmount,
        status: po.status === 'completed' ? 'Đã nhận hàng' : po.status === 'confirmed' || po.status === 'sent' ? 'Đã đặt NCC' : 'Dự thảo',
        statusColor: po.status === 'completed' ? 'text-emerald-400' : 'text-amber-400',
        itemsCount: po.items.length,
        itemsSummary: po.items.map((i) => `${i.productName} (x${i.quantity})`).join(', '),
        sku: po.items.map((i) => i.sku).join(', '),
        rawDoc: po,
      });
    });

    // 6. E-Invoices
    eInvoices.forEach((ei) => {
      list.push({
        id: `einv-${ei.id}`,
        code: ei.invoiceCode || `${ei.invoiceSymbol}-${ei.invoiceNumber}`,
        type: 'e_invoice',
        typeLabel: 'Hóa Đơn Điện Tử',
        typeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
        date: ei.issueDate,
        customerOrSupplierName: 'Khách hàng HĐĐT',
        totalAmount: ei.totalAmount || 0,
        status: ei.status === 'cqt_approved' ? 'CQT Đã cấp mã' : 'Đã ký số',
        statusColor: 'text-indigo-400',
        itemsCount: ei.items?.length || 0,
        itemsSummary: ei.items?.map((i) => `${i.productName} (x${i.quantity})`).join(', ') || 'Chi tiết HĐĐT',
        rawDoc: ei,
      });
    });

    // 7. Inbound Invoices
    inboundInvoices.forEach((ii) => {
      list.push({
        id: `inbound-${ii.id}`,
        code: ii.invoiceCode,
        type: 'inbound_invoice',
        typeLabel: 'HĐĐT Đầu Vào',
        typeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        date: ii.issueDate,
        customerOrSupplierName: ii.seller?.name || 'Nhà cung cấp',
        totalAmount: ii.totalAmount,
        status: ii.status === 'imported_to_stock' ? 'Đã nhập kho' : 'Chờ duyệt',
        statusColor: ii.status === 'imported_to_stock' ? 'text-emerald-400' : 'text-amber-400',
        itemsCount: ii.items?.length || 0,
        itemsSummary: ii.items?.map((i) => `${i.productName} (x${i.quantity})`).join(', ') || 'Chi tiết hóa đơn',
        rawDoc: ii,
      });
    });

    // Sort descending by date
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [orders, stockReceipts, quotes, warranties, purchaseOrders, eInvoices, inboundInvoices]);

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    let result = allDocuments;

    if (selectedDocType !== 'all') {
      result = result.filter((d) => d.type === selectedDocType);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter((d) => {
        return (
          d.code.toLowerCase().includes(q) ||
          d.customerOrSupplierName.toLowerCase().includes(q) ||
          (d.phone && d.phone.toLowerCase().includes(q)) ||
          (d.serialNumber && d.serialNumber.toLowerCase().includes(q)) ||
          (d.sku && d.sku.toLowerCase().includes(q)) ||
          d.itemsSummary.toLowerCase().includes(q) ||
          (d.creator && d.creator.toLowerCase().includes(q))
        );
      });
    }

    return result;
  }, [allDocuments, selectedDocType, searchTerm]);

  // Auto-select first result if current selected is not in filtered
  useEffect(() => {
    if (filteredDocuments.length > 0 && (!selectedItem || !filteredDocuments.find((d) => d.id === selectedItem.id))) {
      setSelectedItem(filteredDocuments[0]);
    } else if (filteredDocuments.length === 0) {
      setSelectedItem(null);
    }
  }, [filteredDocuments]);

  // Camera start/stop
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      setCameraError('Không thể truy cập Camera. Vui lòng cấp quyền trong trình duyệt hoặc dùng máy quét USB/Bàn phím.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeTab]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Convert selected doc to PrintInvoiceModal format
  const handleQuickPrint = (item: UnifiedDocItem, paper: PaperSize = 'A4') => {
    setPrintDoc({ doc: item.rawDoc, docType: item.type, initialPaper: paper });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-7xl w-full h-[94vh] shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black text-white tracking-tight">
                  Trung Tâm Tra Cứu & Quét Mã Chứng Từ Toàn Năng
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold">
                  Phím tắt F7
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Đồng bộ mã vạch 1D, QR 2D, nhận diện máy quét USB HID & Dòng đời sản phẩm (Product Lifecycle)
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('search')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'search'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Tra cứu đa chiều ({allDocuments.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('camera')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'camera'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera Quét Mã Barcode/QR</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('lifecycle')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'lifecycle'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Dòng Đời Sản Phẩm (5 Giai đoạn)</span>
            </button>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            title="Đóng (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab 1: Universal Search & Document Inspector */}
        {activeTab === 'search' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left Panel: Search Bar + Filter Chips + Results List */}
            <div className="w-full md:w-5/12 border-r border-slate-800 flex flex-col bg-slate-900/60">
              {/* Search input box */}
              <div className="p-3.5 border-b border-slate-800 bg-slate-950/40">
                <div className="relative">
                  <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Quét mã vạch, QR hoặc nhập Số phiếu, Tên KH, SĐT, SKU, Serial..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Categories Chips */}
                <div className="flex items-center space-x-1.5 overflow-x-auto pt-2.5 pb-0.5 text-[11px] no-scrollbar">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'order', label: 'Đơn POS' },
                    { id: 'quote', label: 'Báo giá' },
                    { id: 'stock_receipt', label: 'Nhập kho' },
                    { id: 'warranty', label: 'Bảo hành' },
                    { id: 'purchase_order', label: 'Đơn PO' },
                    { id: 'e_invoice', label: 'HĐĐT' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedDocType(tab.id as DocFilterType)}
                      className={`px-2.5 py-1 rounded-lg whitespace-nowrap font-semibold transition-all cursor-pointer ${
                        selectedDocType === tab.id
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-transparent'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Document Results Count */}
              <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Tìm thấy <strong className="text-white">{filteredDocuments.length}</strong> chứng từ</span>
                <span className="text-[10px] text-slate-500">Tự động bắt máy quét HID</span>
              </div>

              {/* Results List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
                {filteredDocuments.length === 0 ? (
                  <div className="text-center py-12 px-4 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                      <Search className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-300">Không tìm thấy chứng từ phù hợp</p>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Thử quét mã vạch trên phiếu in hoặc tìm theo số điện thoại, tên khách hàng, mã SKU.
                    </p>
                  </div>
                ) : (
                  filteredDocuments.map((doc) => {
                    const isSelected = selectedItem?.id === doc.id;
                    return (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedItem(doc)}
                        className={`p-3 rounded-xl cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-500/50 shadow-lg shadow-cyan-950/20'
                            : 'bg-slate-900/40 hover:bg-slate-800/60 border-slate-800/80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${doc.typeColor}`}>
                              {doc.code}
                            </span>
                            <span className="text-[11px] font-bold text-slate-300">{doc.typeLabel}</span>
                          </div>
                          <span className="text-[11px] font-mono font-bold text-emerald-400">
                            {formatVND(doc.totalAmount)}
                          </span>
                        </div>

                        <div className="mt-1.5 flex items-center justify-between text-xs">
                          <p className="font-semibold text-slate-200 truncate">{doc.customerOrSupplierName}</p>
                          <span className="text-[10px] text-slate-500">{new Date(doc.date).toLocaleDateString('vi-VN')}</span>
                        </div>

                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{doc.itemsSummary}</p>

                        {doc.serialNumber && (
                          <div className="mt-1 flex items-center space-x-1 text-[10px] text-cyan-400 font-mono">
                            <span>SN:</span>
                            <span className="font-bold">{doc.serialNumber}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Panel: Selected Document Detailed View & Actions */}
            <div className="w-full md:w-7/12 flex flex-col bg-slate-950 overflow-y-auto">
              {selectedItem ? (
                <div className="p-6 space-y-6">
                  {/* Document Header Box */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2.5">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold border ${selectedItem.typeColor}`}>
                          {selectedItem.code}
                        </span>
                        <h3 className="text-base font-extrabold text-white">{selectedItem.typeLabel}</h3>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center space-x-2">
                        <span>Ngày lập: <strong>{new Date(selectedItem.date).toLocaleString('vi-VN')}</strong></span>
                        {selectedItem.creator && <span>• Lập bởi: <strong>{selectedItem.creator}</strong></span>}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedItem.code)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
                      >
                        {copiedCode === selectedItem.code ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Sao chép mã</span>
                          </>
                        )}
                      </button>

                      {/* Quick Print Dropdown */}
                      <button
                        type="button"
                        onClick={() => handleQuickPrint(selectedItem, 'A4')}
                        className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-lg shadow-cyan-600/30 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>In Phiếu Ngay</span>
                      </button>
                    </div>
                  </div>

                  {/* Customer / Supplier & Totals */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Đối Tác / Khách Hàng
                      </p>
                      <p className="text-sm font-bold text-white">{selectedItem.customerOrSupplierName}</p>
                      {selectedItem.phone && (
                        <p className="text-xs text-slate-300">Điện thoại: <strong className="text-white font-mono">{selectedItem.phone}</strong></p>
                      )}
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Tổng Tiền & Trạng Thái
                      </p>
                      <p className="text-lg font-black text-emerald-400 font-mono">
                        {formatVND(selectedItem.totalAmount)}
                      </p>
                      <p className="text-xs text-slate-300">
                        Tình trạng: <span className={`font-bold ${selectedItem.statusColor}`}>{selectedItem.status}</span>
                      </p>
                    </div>
                  </div>

                  {/* Slip Barcode & Smart QR Live Preview */}
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                        <Barcode className="w-4 h-4 text-cyan-400" />
                        <span>Mã Vạch Code128 & Mã QR Định Danh ERP Trên Phiếu In</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Chuẩn vector in nhiệt K80/K58/A4/A5</span>
                    </div>

                    <div className="p-4 bg-white rounded-xl shadow-inner flex justify-center">
                      <SlipBarcodeQR
                        docCode={selectedItem.code}
                        docType={selectedItem.type as any}
                        date={selectedItem.date}
                        customerName={selectedItem.customerOrSupplierName}
                        totalAmount={selectedItem.totalAmount}
                        paperSize="A4"
                        showBarcode={true}
                        showQr={true}
                        align="between"
                      />
                    </div>
                  </div>

                  {/* Print Preset Shortcuts (A4, A5, K80, K58) */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                    <p className="text-xs font-bold text-slate-300">Tùy Chọn In Nhanh Theo Khổ Giấy:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickPrint(selectedItem, 'A4')}
                        className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-center font-bold text-xs text-slate-200 border border-slate-700 transition-all cursor-pointer"
                      >
                        Khổ A4 (210×297)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickPrint(selectedItem, 'A5')}
                        className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-center font-bold text-xs text-slate-200 border border-slate-700 transition-all cursor-pointer"
                      >
                        Khổ A5 (148×210)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickPrint(selectedItem, 'K80')}
                        className="p-2.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 text-center font-bold text-xs text-amber-300 border border-amber-800/60 transition-all cursor-pointer"
                      >
                        K80 (Bill 80mm)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickPrint(selectedItem, 'K58')}
                        className="p-2.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 text-center font-bold text-xs text-amber-300 border border-amber-800/60 transition-all cursor-pointer"
                      >
                        K58 (Bill 58mm)
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-2">
                  <FileText className="w-12 h-12 text-slate-700" />
                  <p className="text-sm font-semibold text-slate-400">Chọn một chứng từ bên trái để xem chi tiết</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Camera Scanner */}
        {activeTab === 'camera' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
            {cameraError ? (
              <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-800 text-center max-w-md space-y-3">
                <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
                <h4 className="font-bold text-white text-sm">Lỗi Kết Nối Camera</h4>
                <p className="text-xs text-rose-300">{cameraError}</p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
                >
                  Thử Lại
                </button>
              </div>
            ) : (
              <div className="relative w-full max-w-md aspect-video sm:aspect-square bg-black rounded-2xl overflow-hidden border-2 border-cyan-500/50 shadow-2xl shadow-cyan-950/50 flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Laser animation bar */}
                <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-44 border-2 border-dashed border-cyan-400/80 rounded-2xl flex flex-col justify-between p-2 pointer-events-none">
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse shadow-lg shadow-cyan-400" />
                  <div className="text-center text-[10px] font-bold text-cyan-300 bg-slate-950/80 px-2 py-0.5 rounded-full mx-auto">
                    Căn mã vạch hoặc mã QR vào khung
                  </div>
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
                </div>
              </div>
            )}

            <div className="mt-4 text-center space-y-1 text-xs text-slate-400">
              <p>Hỗ trợ quét tất cả các mã Code128, EAN-13, QR Code ERP và VietQR ngân hàng.</p>
              <p className="text-[11px] text-slate-500">Mã sau khi quét sẽ tự động mở chứng từ tương ứng.</p>
            </div>
          </div>
        )}

        {/* Tab 3: Product Lifecycle Timeline (5 Stages) */}
        {activeTab === 'lifecycle' && (
          <div className="flex-1 overflow-y-auto p-6 bg-slate-950 space-y-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Introduction Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-blue-950/40 to-slate-900 border border-cyan-800/40 flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-white text-sm sm:text-base flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    <span>Dòng Đời Sản Phẩm Toàn Năng (5 Giai Đoạn Vòng Khép Kín)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Truy vết nguồn gốc từ Nhà cung ứng ➔ Báo giá ➔ Bán lẻ POS ➔ HĐĐT Thuế ➔ Bảo hành & Sửa chữa
                  </p>
                </div>
              </div>

              {/* 5 Stages Timeline View */}
              <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-blue-500 before:to-cyan-500">
                {/* Stage 1: Inbound & PO */}
                <div className="relative space-y-2">
                  <div className="absolute -left-6 sm:-left-8 top-0 w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-300 font-bold text-xs">
                    1
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                        Giai đoạn 1: Nhập Hàng NCC & Đơn PO
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Khởi đầu chuỗi cung ứng</span>
                    </div>
                    <p className="text-sm font-bold text-white">Phiếu Nhập Kho: PNK-2026-0816-001</p>
                    <p className="text-xs text-slate-400">
                      Nhà cung cấp: <strong>Công Ty CP Dịch Vụ Công Nghệ FPT Synnex</strong> • Kho tiếp nhận: <strong>Kho Chính Gia Phúc</strong>
                    </p>
                  </div>
                </div>

                {/* Stage 2: Price Quote */}
                <div className="relative space-y-2">
                  <div className="absolute -left-6 sm:-left-8 top-0 w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center text-purple-300 font-bold text-xs">
                    2
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-400 uppercase tracking-wide">
                        Giai đoạn 2: Báo Giá & Dự Toán Khách Hàng
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Tư vấn & Chốt deal</span>
                    </div>
                    <p className="text-sm font-bold text-white">Báo Giá: BG-2026-001</p>
                    <p className="text-xs text-slate-400">
                      Khách hàng: <strong>Công Ty CP Công Nghệ Hoàng Long</strong> • Tình trạng: <strong className="text-purple-400">Đã chốt đơn</strong>
                    </p>
                  </div>
                </div>

                {/* Stage 3: POS Sale */}
                <div className="relative space-y-2">
                  <div className="absolute -left-6 sm:-left-8 top-0 w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center text-blue-300 font-bold text-xs">
                    3
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-wide">
                        Giai đoạn 3: Bán Hàng POS & Xuất Hàng
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Bán lẻ & In Bill K80/K58</span>
                    </div>
                    <p className="text-sm font-bold text-white">Đơn Bán: DH-10029</p>
                    <p className="text-xs text-slate-400">
                      Kênh bán: <strong>Tại quầy (POS)</strong> • Thu ngân: <strong>Mr. Thơm</strong> • Khổ in: <strong>K58 / K80 / A4 / A5</strong>
                    </p>
                  </div>
                </div>

                {/* Stage 4: E-Invoice */}
                <div className="relative space-y-2">
                  <div className="absolute -left-6 sm:-left-8 top-0 w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-indigo-500/20 border-2 border-indigo-500 flex items-center justify-center text-indigo-300 font-bold text-xs">
                    4
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">
                        Giai đoạn 4: Hóa Đơn Điện Tử (TT78 & NĐ123)
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">CQT cấp mã hợp lệ</span>
                    </div>
                    <p className="text-sm font-bold text-white">Ký hiệu: 1C26TGP-00000088</p>
                    <p className="text-xs text-slate-400">
                      Mã CQT: <strong className="font-mono">TCT-84920491823901</strong> • Mã tra cứu: <strong className="font-mono text-indigo-300">GP-INV-2026-X89F2</strong>
                    </p>
                  </div>
                </div>

                {/* Stage 5: Warranty & Repairs */}
                <div className="relative space-y-2">
                  <div className="absolute -left-6 sm:-left-8 top-0 w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-cyan-500/20 border-2 border-cyan-500 flex items-center justify-center text-cyan-300 font-bold text-xs">
                    5
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-wide">
                        Giai đoạn 5: Bảo Hành & Dịch Vụ Sau Bán Hàng
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Lịch sử Serial/IMEI</span>
                    </div>
                    <p className="text-sm font-bold text-white">Phiếu Bảo Hành: BH-2026-001</p>
                    <p className="text-xs text-slate-400">
                      Serial: <strong className="font-mono text-cyan-300">E32131315F</strong> • Kỹ thuật viên: <strong>Phạm Gia Phúc</strong> • Đã bàn giao
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Quick Status Bar */}
        <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Sẵn sàng kết nối máy quét mã vạch</span>
            </span>
            <span className="text-slate-600">|</span>
            <span>Tổng cộng: <strong className="text-white">{allDocuments.length}</strong> chứng từ</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Đóng (Esc)
            </button>
          </div>
        </div>
      </div>

      {/* Embedded PrintInvoiceModal for A4/A5/K80/K58 reprint */}
      {printDoc && (
        <PrintInvoiceModal
          isOpen={!!printDoc}
          initialDocType={printDoc.docType === 'stock_receipt' ? 'goods_receipt' : 'sales_order'}
          orderCode={printDoc.doc.code || printDoc.doc.invoiceCode}
          orderDate={printDoc.doc.date || printDoc.doc.createdAt || printDoc.doc.issueDate}
          customer={{
            name: printDoc.doc.customer?.name || printDoc.doc.customerName || printDoc.doc.supplierName || 'Khách hàng',
            phone: printDoc.doc.customer?.phone || printDoc.doc.customerPhone || printDoc.doc.supplierPhone || '',
            address: printDoc.doc.customer?.address || settings.address || '',
          }}
          items={(printDoc.doc.items || []).map((it: any, idx: number) => ({
            id: `p-${idx}`,
            sku: it.sku || `SP-${idx + 1}`,
            productName: it.productName,
            unit: it.unit || 'Cái',
            quantity: it.quantity,
            actualQuantity: it.quantity,
            unitPrice: it.unitPrice || it.unitCost || 0,
            total: it.total || it.totalAmount || (it.quantity * (it.unitPrice || it.unitCost || 0)),
          }))}
          taxRate={printDoc.doc.taxRate || 0}
          creatorName={printDoc.doc.creatorName || printDoc.doc.creator || 'Mr. Thơm'}
          settings={settings}
          onClose={() => setPrintDoc(null)}
        />
      )}
    </div>
  );
};
