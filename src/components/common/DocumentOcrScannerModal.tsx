import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  QrCode,
  FileSpreadsheet,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Layers,
  Building2,
  Truck,
  FileText,
  ArrowRight,
  Plus,
  Trash2,
  ShieldCheck,
  Sliders,
  Image,
  DollarSign,
  Smartphone,
  Zap,
} from 'lucide-react';
import { Product, Supplier, StoreSettings } from '../../types';
import { formatVND, generateVietQRUrl } from '../../utils/vietqr';
import { sounds } from '../../utils/soundEffects';

export interface ParsedDocumentItem {
  sku: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  total: number;
  warrantyMonths: number;
  matchedProductId?: string;
}

export interface ParsedDocumentData {
  supplierName: string;
  supplierTaxCode?: string;
  supplierPhone?: string;
  supplierAddress?: string;
  documentCode: string;
  documentDate: string;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string;
  items: ParsedDocumentItem[];
}

interface DocumentOcrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  suppliers?: Supplier[];
  settings?: StoreSettings;
  initialMode?: 'stock_in' | 'supplier_quote' | 'purchase_order' | 'customer_quote';
  onApplyStockIn?: (data: { supplierName: string; documentCode: string; items: ParsedDocumentItem[] }) => void;
  onApplySupplierQuote?: (data: { supplierName: string; items: ParsedDocumentItem[] }) => void;
  onApplyPurchaseOrder?: (data: { supplierName: string; documentCode: string; items: ParsedDocumentItem[] }) => void;
  onApplyCustomerQuote?: (data: { items: ParsedDocumentItem[]; markupPercent: number }) => void;
}

export const DocumentOcrScannerModal: React.FC<DocumentOcrScannerModalProps> = ({
  isOpen,
  onClose,
  products = [],
  suppliers = [],
  settings,
  initialMode = 'stock_in',
  onApplyStockIn,
  onApplySupplierQuote,
  onApplyPurchaseOrder,
  onApplyCustomerQuote,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'mobile_sync' | 'upload'>('camera');
  const [actionTarget, setActionTarget] = useState<'stock_in' | 'supplier_quote' | 'purchase_order' | 'customer_quote'>(initialMode);
  const [markupRate, setMarkupRate] = useState<number>(25);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedDocumentData | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, activeTab, facingMode]);

  if (!isOpen) return null;

  const startCamera = async () => {
    setCameraError('');
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Không thể mở Camera thiết bị. Vui lòng cho phép quyền truy cập hoặc sử dụng chức năng tải file ảnh/Excel.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const matchItemsWithWarehouse = (items: ParsedDocumentItem[]): ParsedDocumentItem[] => {
    return items.map((it) => {
      const matched = products.find(
        (p) =>
          (it.sku && p.sku.toLowerCase() === it.sku.toLowerCase()) ||
          p.name.toLowerCase().includes(it.productName.toLowerCase()) ||
          it.productName.toLowerCase().includes(p.name.toLowerCase())
      );
      return {
        ...it,
        matchedProductId: matched?.id,
        sku: it.sku || matched?.sku || ('SP-' + Date.now().toString().slice(-4)),
        unit: it.unit || matched?.unit || 'Cái',
        warrantyMonths: it.warrantyMonths || 12,
        vatRate: it.vatRate !== undefined ? it.vatRate : 10,
      };
    });
  };

  const processWithAI = async (base64Img: string, textContent?: string) => {
    setIsProcessing(true);
    setStatusMessage('Đang phân tích hình ảnh và bóc tách dữ liệu bằng AI Vision...');
    try {
      const res = await fetch('/api/gemini/ocr-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Img,
          textContent,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const raw = json.data;
        const rawItems: ParsedDocumentItem[] = Array.isArray(raw.items) ? raw.items : [];

        const enrichedItems = matchItemsWithWarehouse(rawItems);
        const subtotal = enrichedItems.reduce((acc, it) => acc + (Number(it.total) || 0), 0);
        const vatAmount = Math.round((subtotal * (raw.vatRate || 10)) / 100);

        setParsedData({
          supplierName: raw.supplierName || (suppliers[0]?.name || 'Nhà Cung Cấp'),
          supplierTaxCode: raw.supplierTaxCode || suppliers[0]?.taxCode || '',
          supplierPhone: raw.supplierPhone || suppliers[0]?.phone || '',
          supplierAddress: raw.supplierAddress || suppliers[0]?.address || '',
          documentCode: raw.documentCode || ('HD-' + Date.now().toString().slice(-5)),
          documentDate: raw.documentDate || new Date().toISOString().slice(0, 10),
          subtotal,
          vatRate: raw.vatRate || 10,
          vatAmount,
          shippingFee: raw.shippingFee || 0,
          discountAmount: raw.discountAmount || 0,
          totalAmount: subtotal + vatAmount,
          notes: raw.notes || 'Bóc tách tự động từ chứng từ bằng AI Vision OCR.',
          items: enrichedItems,
        });
        sounds.playSuccessChime();
      } else {
        throw new Error(json.error || 'Không nhận diện được bảng dữ liệu trong tài liệu.');
      }
    } catch (err: any) {
      console.warn('AI OCR Error:', err);
      alert(err.message || 'Không thể bóc tách nội dung chứng từ từ ảnh. Vui lòng chụp rõ nét hơn hoặc nhập thủ công.');
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    sounds.playBarcodeBeep();
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setPreviewImage(dataUrl);
      stopCamera();
      processWithAI(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sounds.playBarcodeBeep();
    const reader = new FileReader();

    if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processWithAI('', text);
      };
      reader.readAsText(file);
    } else {
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setPreviewImage(base64);
        processWithAI(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyFinalAction = () => {
    if (!parsedData || parsedData.items.length === 0) {
      alert('Chưa có dữ liệu sản phẩm hợp lệ!');
      return;
    }

    sounds.playSuccessChime();

    if (actionTarget === 'stock_in' && onApplyStockIn) {
      onApplyStockIn({
        supplierName: parsedData.supplierName,
        documentCode: parsedData.documentCode,
        items: parsedData.items,
      });
    } else if (actionTarget === 'supplier_quote' && onApplySupplierQuote) {
      onApplySupplierQuote({
        supplierName: parsedData.supplierName,
        items: parsedData.items,
      });
    } else if (actionTarget === 'purchase_order' && onApplyPurchaseOrder) {
      onApplyPurchaseOrder({
        supplierName: parsedData.supplierName,
        documentCode: parsedData.documentCode,
        items: parsedData.items,
      });
    } else if (actionTarget === 'customer_quote' && onApplyCustomerQuote) {
      onApplyCustomerQuote({
        items: parsedData.items,
        markupPercent: markupRate,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 md:p-4 overflow-hidden animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-6xl w-full max-h-[94vh] shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-4 px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-400/40 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                <span>Quét Phiếu Bằng Camera / AI Vision & Import Excel, PDF</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                  Gemini 2.5 Flash OCR
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Tự động bóc tách hóa đơn, báo giá NCC, bảng kê Excel thành dữ liệu có cấu trúc và áp dụng 1-click
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Mode Bar */}
        <div className="p-3.5 px-6 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0 text-xs">
          {/* Input Source Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 space-x-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('camera');
                setPreviewImage(null);
              }}
              className={'px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all cursor-pointer ' +
                (activeTab === 'camera' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200')}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera / Webcam Trực Tiếp</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('mobile_sync');
                stopCamera();
              }}
              className={'px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all cursor-pointer ' +
                (activeTab === 'mobile_sync' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200')}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Quét Bằng Điện Thoại (QR)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('upload');
                stopCamera();
              }}
              className={'px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all cursor-pointer ' +
                (activeTab === 'upload' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200')}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Import Excel / PDF / Ảnh</span>
            </button>
          </div>

          {/* 4 Output Action Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-bold hidden sm:inline">Đích Đến Sau Bóc Tách:</span>
            <select
              value={actionTarget}
              onChange={(e) => setActionTarget(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-amber-400 font-bold focus:outline-none"
            >
              <option value="stock_in">📦 1. Nhập Kho Nhanh (Stock-In)</option>
              <option value="supplier_quote">🏢 2. Cập Nhật Báo Giá NCC</option>
              <option value="purchase_order">📝 3. Lập Đơn Đặt Hàng Mua (PO)</option>
              <option value="customer_quote">💼 4. Tạo Báo Giá Khách Hàng B2B</option>
            </select>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Panel: Input Viewer / Camera Frame */}
          <div className="w-full md:w-5/12 bg-slate-950 border-r border-slate-800 p-4 flex flex-col justify-between overflow-y-auto shrink-0">
            
            {/* 1. Camera View */}
            {activeTab === 'camera' && (
              <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                {cameraError ? (
                  <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-2xl text-rose-300 text-xs text-center space-y-2">
                    <p>{cameraError}</p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('upload')}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs cursor-pointer"
                    >
                      Chuyển Sang Tải File Ảnh / Excel
                    </button>
                  </div>
                ) : previewImage ? (
                  <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700">
                    <img src={previewImage} alt="Captured" className="w-full h-auto max-h-[300px] object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewImage(null);
                        startCamera();
                      }}
                      className="absolute top-2 right-2 px-3 py-1 bg-slate-900/80 text-white rounded-lg text-xs font-bold border border-slate-700 flex items-center space-x-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Chụp Lại</span>
                    </button>
                  </div>
                ) : (
                  <div className="relative w-full aspect-4/3 bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    {/* Scan Target Overlay */}
                    <div className="absolute inset-4 border-2 border-dashed border-blue-400/70 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                      <div className="flex justify-between text-[10px] text-blue-400 font-mono font-bold bg-black/60 px-2 py-0.5 rounded w-max">
                        <span>Căn Khung Hóa Đơn / Báo Giá</span>
                      </div>
                      <div className="text-center text-[10px] text-slate-300 bg-black/60 py-0.5 rounded">
                        Giữ phiếu thẳng đứng và đủ ánh sáng
                      </div>
                    </div>
                  </div>
                )}

                {!previewImage && !cameraError && (
                  <div className="flex items-center space-x-2 w-full">
                    <button
                      type="button"
                      onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
                      className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
                      title="Đổi camera trước / sau"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handleCaptureSnapshot}
                      disabled={isProcessing}
                      className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{isProcessing ? 'Đang Bóc Tách AI...' : 'Chụp & Bóc Tách Phiếu (AI)'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 2. Mobile QR Sync View */}
            {activeTab === 'mobile_sync' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-4">
                <div className="p-3 bg-white rounded-2xl shadow-xl border border-slate-200 inline-block">
                  <img
                    src={generateVietQRUrl({
                      bankCode: 'MB',
                      accountNo: '0901888999',
                      accountName: 'GIA PHUC AI VISION',
                      amount: 0,
                      description: 'SCAN-DOC',
                    })}
                    alt="Mobile Scan QR"
                    className="w-44 h-44 object-contain"
                  />
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white">Quét Mã Bằng Camera Điện Thoại</h4>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                    Mở camera trên điện thoại iPhone/Android quét mã QR này để chụp phiếu từ xa và truyền trực tiếp vào ERP.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => processWithAI('')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
                >
                  🚀 Mô Phỏng Điện Thoại Truyền Ảnh Xong
                </button>
              </div>
            )}

            {/* 3. Upload File / Excel View */}
            {activeTab === 'upload' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf,.csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-8 cursor-pointer transition-colors bg-slate-900/50 hover:bg-slate-900/80 flex flex-col items-center space-y-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Nhấp hoặc Kéo thả file chứng từ vào đây</p>
                    <p className="text-[11px] text-slate-400 mt-1">Hỗ trợ: Excel (.xlsx, .csv), PDF, Ảnh hóa đơn (.jpg, .png)</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => processWithAI('')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
                >
                  ⚡ Nạp Mẫu Phiếu Báo Giá Hikvision (Demo)
                </button>
              </div>
            )}
          </div>

          {/* Right Panel: Parsed Data Review & Action */}
          <div className="flex-1 bg-slate-900/80 p-5 overflow-y-auto flex flex-col justify-between space-y-4">
            {isProcessing ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 p-8">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <h4 className="text-sm font-bold text-white">{statusMessage || 'Đang xử lý dữ liệu...'}</h4>
                <p className="text-xs text-slate-400">Mô hình Gemini 2.5 Flash đang nhận diện các dòng sản phẩm, thuế và giá vốn.</p>
              </div>
            ) : parsedData ? (
              <div className="space-y-4">
                {/* Document Top Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Nhà Cung Cấp / Đơn Vị Phát Hành:</span>
                    <input
                      type="text"
                      value={parsedData.supplierName}
                      onChange={(e) => setParsedData({ ...parsedData, supplierName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white font-bold mt-1"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Số Hóa Đơn / Mã PO:</span>
                    <input
                      type="text"
                      value={parsedData.documentCode}
                      onChange={(e) => setParsedData({ ...parsedData, documentCode: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-amber-400 font-mono font-bold mt-1"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Ngày Lập Phiếu:</span>
                    <input
                      type="date"
                      value={parsedData.documentDate}
                      onChange={(e) => setParsedData({ ...parsedData, documentDate: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-200 text-center font-mono mt-1"
                    />
                  </div>
                </div>

                {/* Items Table */}
                <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                  <div className="p-2.5 px-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Danh Mục Sản Phẩm Đã Bóc Tách ({parsedData.items.length} mặt hàng)</span>
                    </h4>
                  </div>
                  <div className="overflow-x-auto max-h-64 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[10px] uppercase font-bold sticky top-0">
                        <tr>
                          <th className="p-2.5">Mã SKU</th>
                          <th className="p-2.5">Tên Hàng Hóa</th>
                          <th className="p-2.5 text-center">ĐVT</th>
                          <th className="p-2.5 text-right">SL</th>
                          <th className="p-2.5 text-right">Đơn Giá Vốn</th>
                          <th className="p-2.5 text-right">Thành Tiền</th>
                          <th className="p-2.5 text-center">Kho</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {parsedData.items.map((it, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/50">
                            <td className="p-2.5 font-mono font-bold text-amber-400">{it.sku}</td>
                            <td className="p-2.5 font-semibold text-white max-w-[200px] truncate">{it.productName}</td>
                            <td className="p-2.5 text-center text-slate-300">{it.unit}</td>
                            <td className="p-2.5 text-right font-mono font-bold text-white">{it.quantity}</td>
                            <td className="p-2.5 text-right font-mono text-slate-200">{formatVND(it.unitPrice)}</td>
                            <td className="p-2.5 text-right font-mono font-bold text-emerald-400">{formatVND(it.total)}</td>
                            <td className="p-2.5 text-center">
                              {it.matchedProductId ? (
                                <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[9px] font-bold border border-blue-500/30">
                                  Đã Có
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30">
                                  Mới
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Action Customizer & Total */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  {actionTarget === 'customer_quote' && (
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                      <span className="text-slate-300 font-bold flex items-center space-x-1.5">
                        <Sliders className="w-4 h-4 text-purple-400" />
                        <span>Mức Lãi Gộp Chào Giá Khách Hàng (% Markup):</span>
                      </span>
                      <div className="flex items-center space-x-1">
                        {[15, 25, 38].map((rate) => (
                          <button
                            key={rate}
                            type="button"
                            onClick={() => setMarkupRate(rate)}
                            className={'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ' +
                              (markupRate === rate ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400')}
                          >
                            +{rate}%
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="text-slate-400">
                      Tổng tiền hàng (VAT {parsedData.vatRate}%): <strong className="text-emerald-400 font-mono text-sm">{formatVND(parsedData.totalAmount)}</strong>
                    </div>

                    <button
                      type="button"
                      onClick={handleApplyFinalAction}
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/25 flex items-center space-x-2 cursor-pointer transition-all active:scale-95"
                    >
                      <span>
                        {actionTarget === 'stock_in'
                          ? '📦 Nhập Kho Ngay (Stock-In)'
                          : actionTarget === 'supplier_quote'
                          ? '🏢 Cập Nhật Bảng Giá NCC'
                          : actionTarget === 'purchase_order'
                          ? '📝 Xuất Sang Đơn Đặt Hàng PO'
                          : '💼 Tạo Báo Giá Khách Hàng (+Markup)'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs space-y-2 p-8">
                <Zap className="w-8 h-8 text-slate-600 animate-pulse" />
                <p>Chụp ảnh phiếu mua hàng hoặc tải file Excel / PDF để xem trước dữ liệu</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
