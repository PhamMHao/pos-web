import React, { useState, useMemo, useEffect } from 'react';
import {
  Printer,
  X,
  FileText,
  Truck,
  RotateCcw,
  Check,
  Plus,
  Trash2,
  Sliders,
  Sparkles,
  Download,
  Copy,
  Package,
  Wrench,
  Layers,
  Building,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { Order, StoreSettings, PrintDocType, PaperSize } from '../../types';
import { formatVND, generateVietQRUrl } from '../../utils/vietqr';
import { numberToVietnameseWords } from '../../utils/numberToWords';
import { GiaPhucLogo } from './GiaPhucLogo';
import { PrinterSelectDropdown } from './PrinterSelectDropdown';
import { PrinterProfile } from '../../utils/printerStorage';
import { SlipBarcodeQR } from './SlipBarcodeQR';

export interface PrintItem {
  id?: string;
  sku?: string;
  productName: string;
  unit?: string;
  quantity: number;
  actualQuantity?: number; // Thực nhập / Thực xuất
  unitPrice: number;
  total: number;
  discountPercent?: number;
  serialNumber?: string;
  note?: string;
  warranty?: string;
  // Cho phiếu đổi trả (hàng mới đổi)
  newSku?: string;
  newProductName?: string;
  newUnit?: string;
  newQuantity?: number;
  newUnitPrice?: number;
  newTotal?: number;
  actionType?: 'TRẢ HÀNG' | 'ĐỔI HÀNG';
}

export interface PrintInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order | null;
  items?: PrintItem[];
  customer?: {
    name?: string;
    phone?: string;
    address?: string;
    taxCode?: string;
    companyName?: string;
  };
  initialDocType?: PrintDocType;
  settings: StoreSettings;
  orderCode?: string;
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  discountAmount?: number;
  total?: number;
  paymentMethod?: string;
  creatorName?: string;
  warehouseName?: string;
  deliveryNote?: string;
  orderDate?: string;
  onSaveSettings?: (updated: StoreSettings) => void;
}

export const PrintInvoiceModal: React.FC<PrintInvoiceModalProps> = ({
  isOpen,
  onClose,
  order,
  items: propItems,
  customer: propCustomer,
  initialDocType = 'sales_invoice',
  settings,
  orderCode: propOrderCode,
  subtotal: propSubtotal,
  taxRate: propTaxRate,
  taxAmount: propTaxAmount,
  discountAmount: propDiscountAmount,
  total: propTotal,
  paymentMethod: propPaymentMethod,
  creatorName: propCreatorName,
  warehouseName: propWarehouseName,
  deliveryNote: propDeliveryNote,
  orderDate: propOrderDate,
  onSaveSettings,
}) => {
  // Document Configuration State
  const [docType, setDocType] = useState<PrintDocType>(initialDocType);
  const [paperSize, setPaperSize] = useState<PaperSize>(
    settings.printDocConfigs?.[initialDocType]?.paperSize || settings.defaultPrintPaperSize || 'A4'
  );
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    settings.printDocConfigs?.[initialDocType]?.orientation || settings.defaultPrintOrientation || 'portrait'
  );
  const [emptyRowsCount, setEmptyRowsCount] = useState<number>(
    settings.printDocConfigs?.[initialDocType]?.emptyRowsCount !== undefined
      ? settings.printDocConfigs[initialDocType]!.emptyRowsCount
      : settings.defaultEmptyRowsCount !== undefined
      ? settings.defaultEmptyRowsCount
      : paperSize === 'A5'
      ? 2
      : 4
  );

  // Customization Drawer State
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [showBarcode, setShowBarcode] = useState<boolean>(true);
  const [showDocQr, setShowDocQr] = useState<boolean>(true);
  const [codePlacement, setCodePlacement] = useState<'footer' | 'header' | 'split' | 'both'>('split');
  const [showVietQR, setShowVietQR] = useState<boolean>(
    settings.printDocConfigs?.[initialDocType]?.showVietQR !== undefined
      ? settings.printDocConfigs[initialDocType]!.showVietQR
      : true
  );
  const [signatureStyle, setSignatureStyle] = useState<'two_blocks' | 'five_blocks'>(
    settings.printDocConfigs?.[initialDocType]?.signatureStyle || settings.defaultSignatureStyle || 'two_blocks'
  );
  const [showLogo, setShowLogo] = useState<boolean>(settings.defaultShowLogo !== false);
  const [customLogoUrl, setCustomLogoUrl] = useState<string>(settings.logoUrl || '');
  const [savedDefaultToast, setSavedDefaultToast] = useState<boolean>(false);

  // Dynamically load per-form default configuration when docType changes
  useEffect(() => {
    setCustomLogoUrl(settings.logoUrl || '');
    const config = settings.printDocConfigs?.[docType];
    if (config) {
      if (config.paperSize) setPaperSize(config.paperSize);
      if (config.orientation) setOrientation(config.orientation);
      if (config.emptyRowsCount !== undefined) setEmptyRowsCount(config.emptyRowsCount);
      if (config.signatureStyle) setSignatureStyle(config.signatureStyle);
      if (config.showVietQR !== undefined) setShowVietQR(config.showVietQR);
    } else {
      if (settings.defaultPrintPaperSize) setPaperSize(settings.defaultPrintPaperSize);
      if (settings.defaultPrintOrientation) setOrientation(settings.defaultPrintOrientation);
      if (settings.defaultEmptyRowsCount !== undefined) {
        setEmptyRowsCount(settings.defaultEmptyRowsCount);
      } else {
        setEmptyRowsCount(settings.defaultPrintPaperSize === 'A5' ? 2 : 4);
      }
    }
  }, [docType, settings]);

  // Save current settings as default for this docType
  const handleSaveAsDefault = () => {
    if (!onSaveSettings) return;
    const updated: StoreSettings = {
      ...settings,
      printDocConfigs: {
        ...(settings.printDocConfigs || {}),
        [docType]: {
          paperSize,
          orientation,
          emptyRowsCount,
          signatureStyle,
          showVietQR,
        },
      },
    };
    onSaveSettings(updated);
    setSavedDefaultToast(true);
    setTimeout(() => setSavedDefaultToast(false), 2500);
  };

  // Editable Company Information
  const [companyName, setCompanyName] = useState(
    settings.companyLegalName || settings.storeName || 'CÔNG TY TNHH MTV TM-DV SỬA CHỮA GIA PHÚC'
  );
  const [brandTitle, setBrandTitle] = useState(settings.brandName || 'GIA PHÚC Computer');
  const [companyAddress, setCompanyAddress] = useState(
    settings.address || 'Đường NA 067, Khu phố An Thuận, Phường Phú An, TP. HCM'
  );
  const [companyPhone, setCompanyPhone] = useState(settings.zaloPhone || settings.phone || '0985 862 609 - 0914 665 994');
  const [companyFax, setCompanyFax] = useState(settings.faxPhone || '(0274) 3579 789');
  const [companyWeb, setCompanyWeb] = useState(settings.website || 'www.vitinhgiaphuc.com');
  const [companyEmail, setCompanyEmail] = useState(settings.email || 'hrmgpsoft@gmail.com');
  const [companyTaxCode, setCompanyTaxCode] = useState(settings.taxCode || '0318999888');

  // Customer & Administrative Information
  const [docNumber, setDocNumber] = useState(
    order?.code ||
      propOrderCode ||
      `GP-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-138`
  );

  const formattedDate = useMemo(() => {
    const d = propOrderDate ? new Date(propOrderDate) : order?.createdAt ? new Date(order.createdAt) : new Date();
    return {
      day: String(d.getDate()).padStart(2, '0'),
      month: String(d.getMonth() + 1).padStart(2, '0'),
      year: d.getFullYear(),
      fullStr: `Ngày ${String(d.getDate()).padStart(2, '0')} Tháng ${String(d.getMonth() + 1).padStart(2, '0')} Năm ${d.getFullYear()}`,
    };
  }, [order, propOrderDate]);

  const [docDateStr, setDocDateStr] = useState(formattedDate.fullStr);
  const [customerName, setCustomerName] = useState(order?.customer?.name || propCustomer?.name || 'MR. TÚ');
  const [customerPhone, setCustomerPhone] = useState(order?.customer?.phone || propCustomer?.phone || '0944474733');
  const [customerAddress, setCustomerAddress] = useState(order?.customer?.address || propCustomer?.address || 'ĐẮK LẮK');
  const [recipientName, setRecipientName] = useState(order?.customer?.name || propCustomer?.name || '');
  const [explanationNote, setExplanationNote] = useState(
    order?.note || propDeliveryNote || 'Gửi nhà xe Tiến Oanh ( Chợ đầu mối Tân Hòa, Tp. Buôn Mê Thuộc )'
  );
  const [warehouse, setWarehouse] = useState(propWarehouseName || settings.defaultWarehouse || 'Gia Phúc');
  const [creator, setCreator] = useState(propCreatorName || settings.defaultCreatorName || 'Mr. Thơm');

  // Sync settings when modified
  useEffect(() => {
    if (settings) {
      if (settings.companyLegalName || settings.storeName) {
        setCompanyName(settings.companyLegalName || settings.storeName);
      }
      if (settings.brandName) setBrandTitle(settings.brandName);
      if (settings.address) setCompanyAddress(settings.address);
      if (settings.phone || settings.zaloPhone) setCompanyPhone(settings.zaloPhone || settings.phone);
      if (settings.faxPhone) setCompanyFax(settings.faxPhone);
      if (settings.website) setCompanyWeb(settings.website);
      if (settings.email) setCompanyEmail(settings.email);
      if (settings.taxCode) setCompanyTaxCode(settings.taxCode);
      if (settings.logoUrl) setCustomLogoUrl(settings.logoUrl);
      if (settings.defaultWarehouse) setWarehouse(settings.defaultWarehouse);
      if (settings.defaultCreatorName) setCreator(settings.defaultCreatorName);
    }
  }, [settings]);

  // Adjust default empty rows based on paper size
  useEffect(() => {
    if (paperSize === 'A5') {
      setEmptyRowsCount(2);
    } else if (paperSize === 'A4') {
      setEmptyRowsCount(4);
    }
  }, [paperSize]);

  // Items State (Default matching actual sample images)
  const initialItems: PrintItem[] = useMemo(() => {
    if (propItems && propItems.length > 0) return propItems;
    if (order && order.items && order.items.length > 0) {
      return order.items.map((it, idx) => ({
        id: `item-${idx}`,
        sku: it.sku || `VT-${idx + 1}`,
        productName: it.productName,
        unit: (it as any).unit || 'PCS',
        quantity: it.quantity,
        actualQuantity: it.quantity,
        unitPrice: it.unitPrice,
        total: it.total,
        discountPercent: it.discountPercent || 0,
        serialNumber: 'E32131315F',
        warranty: '12-24 Tháng',
      }));
    }
    // Default samples from real Excel photos
    return [
      {
        id: '1',
        sku: 'DVR7616-K1',
        productName: 'Đầu ghi hình IP DS-7616NXI-K1',
        unit: 'PCS',
        quantity: 1,
        actualQuantity: 1,
        unitPrice: 2797000,
        total: 2797000,
        serialNumber: 'E32131315F',
        warranty: '24 Tháng',
        newSku: 'DVR7616-K1',
        newProductName: 'Đầu ghi hình IP DS-7616NXI-K1',
        newUnit: 'PCS',
        newQuantity: 1,
        newUnitPrice: 2797000,
        newTotal: 2797000,
        actionType: 'TRẢ HÀNG',
      },
      {
        id: '2',
        sku: 'CA41G2',
        productName: 'Camera IP DS-2CD1T41G2-LIU',
        unit: 'PCS',
        quantity: 12,
        actualQuantity: 12,
        unitPrice: 1214000,
        total: 14568000,
        serialNumber: 'E32131315G, E32131315G, E32131315...',
        warranty: '24 Tháng',
        newSku: '',
        newProductName: '',
        newUnit: '',
        newQuantity: 0,
        newUnitPrice: 0,
        newTotal: 0,
        actionType: 'ĐỔI HÀNG',
      },
      {
        id: '3',
        sku: 'HDD4TB',
        productName: 'Hdd Seagate Skyhawk 4TB',
        unit: 'PCS',
        quantity: 1,
        actualQuantity: 1,
        unitPrice: 4280000,
        total: 4280000,
        serialNumber: 'E32131315F',
        warranty: '36 Tháng',
        newSku: 'HDD2TB',
        newProductName: 'Hdd Seagate Skyhawk 2TB',
        newUnit: 'PCS',
        newQuantity: 1,
        newUnitPrice: 1850000,
        newTotal: 1850000,
        actionType: 'ĐỔI HÀNG',
      },
      {
        id: '4',
        sku: 'SW8P',
        productName: 'Switch PoE 8P',
        unit: 'PCS',
        quantity: 2,
        actualQuantity: 2,
        unitPrice: 1280000,
        total: 2560000,
        serialNumber: 'E32131315G',
        warranty: '12 Tháng',
        newSku: '',
        newProductName: '',
        newUnit: '',
        newQuantity: 0,
        newUnitPrice: 0,
        newTotal: 0,
        actionType: 'ĐỔI HÀNG',
      },
    ];
  }, [order, propItems]);

  const [itemsList, setItemsList] = useState<PrintItem[]>(initialItems);
  const [taxRate, setTaxRate] = useState<number>(
    propTaxRate !== undefined ? propTaxRate : order?.taxRate !== undefined ? order.taxRate : settings.vatDefault || 8
  );
  const [discountVal, setDiscountVal] = useState<number>(propDiscountAmount || order?.discountAmount || 0);

  // Calculations
  const calculatedSubtotal = useMemo(() => {
    return itemsList.reduce((sum, it) => sum + (it.total || it.quantity * it.unitPrice), 0);
  }, [itemsList]);

  const calculatedTaxAmount = useMemo(() => {
    return Math.round((calculatedSubtotal - discountVal) * (taxRate / 100));
  }, [calculatedSubtotal, discountVal, taxRate]);

  const calculatedGrandTotal = useMemo(() => {
    return Math.max(0, calculatedSubtotal - discountVal + calculatedTaxAmount);
  }, [calculatedSubtotal, discountVal, calculatedTaxAmount]);

  const amountInWords = useMemo(() => {
    return numberToVietnameseWords(calculatedGrandTotal);
  }, [calculatedGrandTotal]);

  // VietQR generation
  const qrUrl = useMemo(() => {
    if (!settings.bankAccount || !settings.bankCode) return null;
    return generateVietQRUrl({
      bankCode: settings.bankCode,
      accountNo: settings.bankAccount,
      accountName: settings.bankAccountName || brandTitle,
      amount: calculatedGrandTotal,
      description: `TT ${docNumber}`,
    });
  }, [settings, calculatedGrandTotal, docNumber, brandTitle]);

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlePrint();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const getDocTitle = () => {
    switch (docType) {
      case 'sales_order':
        return 'ĐƠN ĐẶT HÀNG';
      case 'goods_receipt':
        return 'PHIẾU NHẬP KHO';
      case 'sales_invoice':
        return 'HÓA ĐƠN BÁN HÀNG';
      case 'exchange_return':
        return 'PHIẾU ĐỔI TRẢ HÀNG HÓA KIÊM PHIẾU NHẬP XUẤT';
      case 'warranty_intake':
        return 'PHIẾU NHẬN HÀNG BẢO HÀNH';
      case 'warranty_return':
        return 'PHIẾU TRẢ HÀNG BẢO HÀNH';
      case 'delivery_note':
        return 'PHIẾU XUẤT KHO KIÊM GIAO HÀNG';
      case 'warranty_receipt':
        return 'PHIẾU BÁN HÀNG & BẢO HÀNH THIẾT BỊ';
      case 'payment_receipt':
        return 'PHIẾU THU TIỀN';
      case 'einvoice_vat':
        return 'HÓA ĐƠN GIÁ TRỊ GIA TĂNG';
      case 'asset_handover':
        return 'BIÊN BẢN BÀN GIAO & CUNG CẤP TÀI SẢN';
      case 'asset_transfer':
        return 'PHIẾU ĐIỀU CHUYỂN TÀI SẢN & KHO NỘI BỘ';
      case 'stock_disposal':
        return 'BIÊN BẢN KIỂM KÊ & TIÊU HỦY VẬT TƯ, TÀI SẢN';
      case 'liquidation_receipt':
        return 'PHIẾU THU TIỀN THANH LÝ VẬT TƯ / TÀI SẢN';
      case 'delivery_dispatch':
        return 'PHIẾU ĐIỀU PHỐI GIAO HÀNG & THU TIỀN COD';
      case 'shipping_label':
        return 'TEM VẬN ĐƠN DÁN KIỆN HÀNG';
      case 'goods_delivery_record':
        return 'BIÊN BẢN GIAO NHẬN HÀNG HÓA';
      case 'sales_return':
        return 'HÀNG BÁN TRẢ LẠI';
      default:
        return 'HÓA ĐƠN BÁN HÀNG';
    }
  };

  const handleAddItem = () => {
    setItemsList([
      ...itemsList,
      {
        id: `item-${Date.now()}`,
        sku: 'VT-MOI',
        productName: 'Thiết bị / Linh kiện mới',
        unit: 'PCS',
        quantity: 1,
        actualQuantity: 1,
        unitPrice: 500000,
        total: 500000,
        serialNumber: 'SN-2026-XXXX',
        warranty: '12 Tháng',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItemsList(itemsList.filter((_, idx) => idx !== index));
  };

  const handleUpdateItem = (index: number, field: keyof PrintItem, value: any) => {
    const updated = [...itemsList];
    const target = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      const q = field === 'quantity' ? Number(value) : target.quantity;
      const p = field === 'unitPrice' ? Number(value) : target.unitPrice;
      target.total = q * p;
    }
    if (field === 'newQuantity' || field === 'newUnitPrice') {
      const nq = field === 'newQuantity' ? Number(value) : target.newQuantity || 0;
      const np = field === 'newUnitPrice' ? Number(value) : target.newUnitPrice || 0;
      target.newTotal = nq * np;
    }
    updated[index] = target;
    setItemsList(updated);
  };

  // Determine dynamic @page style for print
  const dynamicPageStyle = `
    @page {
      size: ${paperSize === 'K58' ? '58mm auto' : paperSize === 'K80' ? '80mm auto' : `${paperSize} ${orientation}`};
      margin: 0;
    }
  `;

  return (
    <div
      id="print-invoice-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm overflow-hidden p-1 sm:p-3"
    >
      {/* Inject dynamic @page print CSS */}
      <style dangerouslySetInnerHTML={{ __html: dynamicPageStyle }} />

      <div
        id="print-invoice-modal-container"
        className="bg-slate-900 border border-slate-700 w-full max-w-7xl h-[96vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden text-slate-100"
      >
        {/* Top Header Controls Bar (Hidden during window.print) */}
        <div className="no-print bg-slate-950 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Left: Document Title & Badge */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  In Phiếu Chuẩn A4 / A5 / K80 / K58
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Khổ {paperSize} {paperSize !== 'K80' && paperSize !== 'K58' ? `• ${orientation === 'portrait' ? 'Dọc' : 'Ngang'}` : '• In Nhiệt'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Form mẫu chuẩn Excel Gia Phúc & Máy in Bill nhiệt • Tích hợp Barcode 1D & QR Code Tra cứu F7.
              </p>
            </div>
          </div>

          {/* Middle: Document Template & Format Pickers */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Template Selector */}
            <select
              id="print-doc-type-select"
              value={docType}
              onChange={(e) => setDocType(e.target.value as PrintDocType)}
              className="bg-slate-800 border border-slate-700 text-white text-xs font-semibold rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <optgroup label="📋 Mẫu Phiếu Theo Hình Ảnh Thực Tế">
                <option value="sales_order">1. Đơn Đặt Hàng (Ảnh 1)</option>
                <option value="goods_receipt">2. Phiếu Nhập Kho (Ảnh 2)</option>
                <option value="sales_invoice">3. Hóa Đơn Bán Hàng (Ảnh 3)</option>
                <option value="exchange_return">4. Phiếu Đổi Trả Kiêm Nhập Xuất (Ảnh 4)</option>
                <option value="warranty_intake">5. Phiếu Nhận Hàng Bảo Hành (Ảnh 5)</option>
                <option value="warranty_return">6. Phiếu Trả Hàng Bảo Hành (Ảnh 6)</option>
              </optgroup>
              <optgroup label="📄 Mẫu Bổ Sung">
                <option value="delivery_note">7. Phiếu Xuất Kho Giao Khách</option>
                <option value="warranty_receipt">8. Phiếu Bán Hàng & Bảo Hành</option>
                <option value="payment_receipt">9. Phiếu Thu Tiền / Biên Nhận</option>
                <option value="einvoice_vat">10. Hóa Đơn Điện Tử VAT TT78</option>
              </optgroup>
              <optgroup label="🏢 Quản Lý Tài Sản & Dòng Đời Thiết Bị">
                <option value="asset_handover">11. Phiếu Bàn Giao & Cung Cấp Tài Sản</option>
                <option value="asset_transfer">12. Phiếu Điều Chuyển Tài Sản / Kho</option>
                <option value="stock_disposal">13. Biên Bản Tiêu Hủy Vật Tư / Tài Sản Hư Hỏng</option>
                <option value="liquidation_receipt">14. Phiếu Thu Tiền Thanh Lý (Thu Hồi Vốn)</option>
              </optgroup>
              <optgroup label="🚚 Điều Phối Vận Chuyển & Giao Hàng">
                <option value="delivery_dispatch">15. Phiếu Điều Phối Giao Hàng & Thu COD</option>
                <option value="shipping_label">16. Tem Vận Đơn Dán Kiện Hàng (K80 / A5)</option>
              </optgroup>
              <optgroup label="📋 Biên Bản Giao Nhận & Hàng Bán Trả Lại">
                <option value="goods_delivery_record">17. Biên Bản Giao Nhận Hàng Hóa (Ảnh 1)</option>
                <option value="sales_return">18. Phiếu Hàng Bán Trả Lại (Mẫu 02-TT) (Ảnh 2)</option>
              </optgroup>
            </select>

            {/* Paper Size Picker (A4, A5, K80, K58) */}
            <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700 text-xs">
              {(['A4', 'A5', 'K80', 'K58'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  id={`btn-paper-size-${sz}`}
                  onClick={() => setPaperSize(sz)}
                  className={`px-3 py-1.5 rounded-lg font-black transition-all ${
                    paperSize === sz
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>

            {/* Orientation (Portrait / Landscape) */}
            {paperSize !== 'K80' && paperSize !== 'K58' && (
              <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700 text-xs">
                <button
                  type="button"
                  id="btn-orientation-portrait"
                  onClick={() => setOrientation('portrait')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                    orientation === 'portrait' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Dọc
                </button>
                <button
                  type="button"
                  id="btn-orientation-landscape"
                  onClick={() => setOrientation('landscape')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                    orientation === 'landscape' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Ngang
                </button>
              </div>
            )}

            {/* Quick Code Placement Selector in Top Toolbar */}
            <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700 text-xs">
              <span className="text-[10px] text-slate-400 font-bold px-2">Vị trí mã:</span>
              <button
                type="button"
                onClick={() => setCodePlacement('split')}
                title="Mã vạch trên đầu (cân phiếu), Mã QR ở chân trang"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  codePlacement === 'split' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Đầu trang (Cân phiếu)
              </button>
              <button
                type="button"
                onClick={() => setCodePlacement('footer')}
                title="Toàn bộ mã ở chân trang"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  codePlacement === 'footer' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Cuối trang (Đẹp)
              </button>
              <button
                type="button"
                onClick={() => setCodePlacement('both')}
                title="Hiển thị cả ở đầu trang và chân trang"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  codePlacement === 'both' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Cả 2
              </button>
            </div>

            {/* Toggle Editor Drawer */}
            <button
              type="button"
              id="btn-toggle-print-editor"
              onClick={() => setShowEditor(!showEditor)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                showEditor
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Chỉnh Sửa Thông Tin</span>
            </button>

            {/* Save as default for this form */}
            {onSaveSettings && (
              <button
                type="button"
                id="btn-save-print-config-default"
                onClick={handleSaveAsDefault}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/40 transition-all active:scale-95"
                title="Lưu khổ giấy, chiều in và bố cục này làm mặc định cho loại phiếu này"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Lưu Mặc Định Mẫu ({paperSize})</span>
              </button>
            )}
          </div>

          {/* Right: Print Action & Close */}
          <div className="flex items-center space-x-2">
            {savedDefaultToast && (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded-lg animate-pulse">
                ✓ Đã lưu mặc định!
              </span>
            )}
            {/* Printer Selection Dropdown */}
            <PrinterSelectDropdown
              onSelectPrinter={(p) => {
                if (p.defaultPaperSize && p.defaultPaperSize !== 'custom') {
                  setPaperSize(p.defaultPaperSize as any);
                }
                if (p.defaultOrientation) {
                  setOrientation(p.defaultOrientation);
                }
              }}
            />

            <button
              type="button"
              id="btn-execute-print"
              onClick={handlePrint}
              className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In Phiếu Ngay (Ctrl+P)</span>
            </button>
            <button
              type="button"
              id="btn-close-print-modal"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body: Preview & Live Editor */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-950/70">
          {/* Side Drawer: Live Customization Editor (no-print) */}
          {showEditor && (
            <div className="no-print w-full md:w-84 lg:w-96 bg-slate-900 border-r border-slate-800 overflow-y-auto p-4 space-y-4 text-xs shrink-0">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white flex items-center space-x-1.5 text-sm">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>Tùy Chỉnh Bản In Trực Tiếp</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowEditor(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Company Header Settings */}
              <div className="space-y-2">
                <h4 className="font-bold text-blue-400 uppercase text-[10px] tracking-wider">Thông Tin Doanh Nghiệp</h4>
                <div>
                  <label className="block text-slate-400 mb-1">Tên Công Ty:</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Tên Thương Hiệu:</label>
                  <input
                    type="text"
                    value={brandTitle}
                    onChange={(e) => setBrandTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Địa chỉ:</label>
                  <input
                    type="text"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Tell/Zalo:</label>
                    <input
                      type="text"
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Tell/Fax:</label>
                    <input
                      type="text"
                      value={companyFax}
                      onChange={(e) => setCompanyFax(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Website:</label>
                    <input
                      type="text"
                      value={companyWeb}
                      onChange={(e) => setCompanyWeb(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Email:</label>
                    <input
                      type="text"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Customer & Voucher Details */}
              <div className="space-y-2 border-t border-slate-800 pt-3">
                <h4 className="font-bold text-emerald-400 uppercase text-[10px] tracking-wider">Thông Tin Phiếu & Khách Hàng</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Số phiếu:</label>
                    <input
                      type="text"
                      value={docNumber}
                      onChange={(e) => setDocNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-blue-500 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Ngày lập phiếu:</label>
                    <input
                      type="text"
                      value={docDateStr}
                      onChange={(e) => setDocDateStr(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Khách hàng / Đối tác:</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-blue-500 outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Số điện thoại:</label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Địa chỉ giao / Khách hàng:</label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Diễn giải (Gửi nhà xe / Vận chuyển):</label>
                  <textarea
                    rows={2}
                    value={explanationNote}
                    onChange={(e) => setExplanationNote(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-blue-500 outline-none resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Kho xuất/nhập:</label>
                    <input
                      type="text"
                      value={warehouse}
                      onChange={(e) => setWarehouse(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Người lập phiếu:</label>
                    <input
                      type="text"
                      value={creator}
                      onChange={(e) => setCreator(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Tax & Grid Empty Rows Configuration */}
              <div className="space-y-2 border-t border-slate-800 pt-3">
                <h4 className="font-bold text-amber-400 uppercase text-[10px] tracking-wider">Thuế & Dòng Trống Kẻ Bảng</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Thuế VAT (%):</label>
                    <select
                      value={taxRate}
                      onChange={(e) => setTaxRate(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none"
                    >
                      <option value={0}>0% (Không tính thuế)</option>
                      <option value={5}>5%</option>
                      <option value={8}>8% (Nghị định 44)</option>
                      <option value={10}>10%</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Dòng trống kẻ bảng:</label>
                    <input
                      type="number"
                      min={0}
                      max={12}
                      value={emptyRowsCount}
                      onChange={(e) => setEmptyRowsCount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={showLogo}
                      onChange={(e) => setShowLogo(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-blue-600"
                    />
                    <span>Hiện Logo Gia Phúc Computer</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={showBarcode}
                      onChange={(e) => setShowBarcode(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-blue-600"
                    />
                    <span>Hiện Mã Vạch 1D (Code128 Barcode)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={showDocQr}
                      onChange={(e) => setShowDocQr(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-blue-600"
                    />
                    <span>Hiện Mã QR Tra Cứu ERP (Phím F7)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={showVietQR}
                      onChange={(e) => setShowVietQR(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-blue-600"
                    />
                    <span>Hiện Mã QR Thanh Toán Ngân Hàng (VietQR)</span>
                  </label>

                  {/* Code Placement Options */}
                  <div className="pt-1">
                    <label className="block text-slate-400 mb-1 font-bold">Vị trí in Mã vạch & QR:</label>
                    <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-700">
                      <button
                        type="button"
                        onClick={() => setCodePlacement('split')}
                        className={`px-2 py-1.5 rounded-lg text-[10px] font-bold text-center transition-all ${
                          codePlacement === 'split'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Cân đối (Mã trên / QR dưới)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCodePlacement('footer')}
                        className={`px-2 py-1.5 rounded-lg text-[10px] font-bold text-center transition-all ${
                          codePlacement === 'footer'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Chân trang (Dưới cùng)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCodePlacement('header')}
                        className={`px-2 py-1.5 rounded-lg text-[10px] font-bold text-center transition-all ${
                          codePlacement === 'header'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Đầu phiếu (Trên cùng)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCodePlacement('both')}
                        className={`px-2 py-1.5 rounded-lg text-[10px] font-bold text-center transition-all ${
                          codePlacement === 'both'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Cả hai vị trí
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Khối chữ ký:</label>
                    <select
                      value={signatureStyle}
                      onChange={(e) => setSignatureStyle(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none"
                    >
                      <option value="two_blocks">2 Khối chuẩn Excel (Khách hàng & Người lập)</option>
                      <option value="five_blocks">5 Khối đầy đủ (Người nhận, Giao, Kho, Lập, GĐ)</option>
                    </select>
                  </div>
                </div>

                {/* Save defaults button in drawer */}
                {onSaveSettings && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSaveAsDefault}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center justify-center space-x-2 transition-all active:scale-98"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>{savedDefaultToast ? 'Đã lưu cấu hình thành công!' : `Lưu mặc định cho mẫu (${paperSize} - ${orientation === 'portrait' ? 'Dọc' : 'Ngang'})`}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Items List Editor */}
              <div className="space-y-2 border-t border-slate-800 pt-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-indigo-400 uppercase text-[10px] tracking-wider">
                    Danh Sách Hàng Hóa ({itemsList.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center space-x-1 px-2 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/30 rounded-lg text-[11px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Hàng</span>
                  </button>
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {itemsList.map((item, idx) => (
                    <div key={idx} className="bg-slate-950 p-2 rounded-lg border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-300">#{idx + 1} - {item.sku || 'Mã VT'}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-rose-400 hover:text-rose-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={item.productName}
                        onChange={(e) => handleUpdateItem(idx, 'productName', e.target.value)}
                        placeholder="Tên sản phẩm"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-[11px]"
                      />
                      <div className="grid grid-cols-4 gap-1">
                        <input
                          type="text"
                          value={item.sku || ''}
                          onChange={(e) => handleUpdateItem(idx, 'sku', e.target.value)}
                          placeholder="Mã VT"
                          className="bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-slate-200 text-[11px]"
                        />
                        <input
                          type="text"
                          value={item.unit || 'PCS'}
                          onChange={(e) => handleUpdateItem(idx, 'unit', e.target.value)}
                          placeholder="ĐVT"
                          className="bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-slate-200 text-[11px]"
                        />
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(idx, 'quantity', Number(e.target.value))}
                          placeholder="SL"
                          className="bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-slate-200 text-[11px]"
                        />
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(idx, 'unitPrice', Number(e.target.value))}
                          placeholder="Đơn giá"
                          className="bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-slate-200 text-[11px]"
                        />
                      </div>
                      <input
                        type="text"
                        value={item.serialNumber || ''}
                        onChange={(e) => handleUpdateItem(idx, 'serialNumber', e.target.value)}
                        placeholder="Số Serial / Ghi chú bảo hành"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300 text-[10px]"
                      />
                      {docType === 'exchange_return' && (
                        <div className="pt-1 border-t border-slate-800 space-y-1 bg-slate-900/50 p-1 rounded">
                          <span className="text-[10px] font-bold text-amber-400">Hàng mới đổi:</span>
                          <div className="grid grid-cols-3 gap-1">
                            <input
                              type="text"
                              value={item.newSku || ''}
                              onChange={(e) => handleUpdateItem(idx, 'newSku', e.target.value)}
                              placeholder="Mã mới"
                              className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-[10px]"
                            />
                            <input
                              type="text"
                              value={item.newProductName || ''}
                              onChange={(e) => handleUpdateItem(idx, 'newProductName', e.target.value)}
                              placeholder="Tên hàng mới"
                              className="col-span-2 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-[10px]"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Canvas: Paper Document Preview Screen */}
          <div className="flex-1 overflow-auto p-2 sm:p-6 flex justify-center items-start bg-slate-900/80">
            <div
              id="printable-area"
              className={`printable-document shadow-2xl transition-all duration-150 font-sans text-black bg-white ${
                paperSize === 'K58'
                  ? 'paper-size-K58'
                  : paperSize === 'K80'
                  ? 'paper-size-K80'
                  : paperSize === 'A5'
                  ? orientation === 'landscape'
                    ? 'paper-size-A5-landscape'
                    : 'paper-size-A5-portrait'
                  : orientation === 'landscape'
                  ? 'paper-size-A4-landscape'
                  : 'paper-size-A4-portrait'
              }`}
              style={{
                fontFamily: 'Arial, "Times New Roman", -apple-system, sans-serif',
                lineHeight: paperSize === 'K58' ? '1.2' : paperSize === 'A5' ? '1.25' : '1.35',
              }}
            >
              {/* =========================================================================
                  A4 / A5 Form Layout (Exact Pixel-Perfect Match to 6 Real Images)
                  ========================================================================= */}
              {paperSize !== 'K80' && paperSize !== 'K58' ? (
                <div className="w-full text-black flex flex-col justify-between h-full">
                  {/* -------------------------------------------------------------
                      DOCUMENT HEADER & METADATA SELECTOR
                      ------------------------------------------------------------- */}
                  {docType === 'goods_delivery_record' ? (
                    /* CASE: BIÊN BẢN GIAO NHẬN HÀNG HÓA (Theo Ảnh 1) */
                    <div className="border-b-2 border-black pb-2 mb-2">
                      <div className="flex items-start justify-between gap-3">
                        {/* Left: Store Brand & Info */}
                        <div className="flex items-center space-x-2 flex-1">
                          {showLogo && (
                            <div className="flex-shrink-0 flex items-center justify-center">
                              {customLogoUrl ? (
                                <img
                                  src={customLogoUrl}
                                  alt="Logo"
                                  referrerPolicy="no-referrer"
                                  className="h-12 w-auto max-w-[120px] object-contain"
                                />
                              ) : (
                                <GiaPhucLogo logoUrl={customLogoUrl || settings.logoUrl} isPrint={true} size="xs" />
                              )}
                            </div>
                          )}
                          <div className="text-left">
                            <div className="font-black text-[10pt] uppercase text-blue-950 leading-tight">
                              {companyName}
                            </div>
                            <div className="text-[7.5pt] text-gray-800 leading-tight mt-0.5">
                              {companyAddress}
                            </div>
                            <div className="text-[7.5pt] text-gray-700 leading-tight">
                              MST: {settings?.taxCode || '0309214381'} &nbsp;|&nbsp; ĐT: {companyPhone}
                            </div>
                          </div>
                        </div>

                        {/* Center: Quốc Hiệu Tiêu Ngữ */}
                        <div className="text-center flex-1">
                          <div className="font-bold text-[9pt] uppercase tracking-wider text-black">
                            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                          </div>
                          <div className="font-bold text-[8.5pt] italic text-black">
                            Độc Lập – Tự Do – Hạnh Phúc
                          </div>
                          <div className="text-[8pt] text-gray-600 font-serif">oOo</div>
                        </div>

                        {/* Right: Mã Vạch / QR Code */}
                        {showBarcode && (codePlacement === 'split' || codePlacement === 'header' || codePlacement === 'both') && (
                          <div className="flex-shrink-0 flex flex-col items-end">
                            <SlipBarcodeQR
                              docCode={docNumber}
                              docType={docType}
                              date={docDateStr}
                              customerName={customerName}
                              totalAmount={calculatedGrandTotal}
                              paperSize={paperSize}
                              showBarcode={true}
                              showQr={codePlacement === 'header' || codePlacement === 'both'}
                              renderMode={codePlacement === 'split' ? 'barcode_only' : 'both'}
                              align="right"
                              layout="column"
                              className="my-0"
                            />
                          </div>
                        )}
                      </div>

                      {/* Tiêu đề & Căn cứ pháp lý */}
                      <div className="text-center mt-2">
                        <h2 className="text-[14pt] font-black uppercase tracking-wider text-black">
                          BIÊN BẢN GIAO NHẬN HÀNG HÓA
                        </h2>
                        <div className="text-[8pt] text-gray-700 italic">
                          TP. Hồ Chí Minh, {docDateStr}
                        </div>
                        <div className="text-[8pt] text-gray-900 italic mt-0.5 font-medium">
                          Căn cứ vào thỏa thuận mua bán giữa hai bên gồm có:
                        </div>
                      </div>

                      {/* Thông tin BÊN A & BÊN B */}
                      <div className="mt-2 space-y-1.5 text-[8pt] text-gray-900 border border-black p-2 rounded bg-gray-50/50">
                        <div>
                          <div className="font-bold uppercase text-black text-[8.5pt]">
                            BÊN A (BÊN BÁN): <span className="font-black">{companyName}</span>
                          </div>
                          <div className="grid grid-cols-12 gap-x-2 pl-3 pt-0.5 leading-snug">
                            <div className="col-span-12"><strong>Địa chỉ:</strong> {companyAddress}</div>
                            <div className="col-span-6"><strong>Người bán:</strong> {creator} &nbsp;|&nbsp; <strong>ĐT:</strong> {companyPhone}</div>
                            <div className="col-span-6"><strong>Mã số thuế:</strong> {settings?.taxCode || '0309214381'} &nbsp;|&nbsp; <strong>Website:</strong> {companyWeb || 'giaphuc.vn'}</div>
                            <div className="col-span-12">
                              <strong>Thông tin chuyển khoản:</strong> {settings?.bankAccount ? `${settings.bankAccount} - Ngân hàng ${settings.bankName} - CN TP.HCM` : '63217849 - Ngân hàng ACB - CN Bắc Sài Gòn - TP.HCM'} (Chủ TK: {companyName})
                            </div>
                          </div>
                        </div>

                        <div className="pt-1 border-t border-dotted border-gray-400">
                          <div className="font-bold uppercase text-black text-[8.5pt]">
                            BÊN B (BÊN MUA): <span className="font-black">{customerName}</span>
                          </div>
                          <div className="grid grid-cols-12 gap-x-2 pl-3 pt-0.5 leading-snug">
                            <div className="col-span-8"><strong>Địa chỉ:</strong> {customerAddress || 'Tại cửa hàng'}</div>
                            <div className="col-span-4"><strong>Mã số thuế:</strong> {(propCustomer as any)?.taxCode || (order?.customer as any)?.taxCode || '---'}</div>
                            <div className="col-span-6"><strong>Người đặt / nhận hàng:</strong> {recipientName || customerName}</div>
                            <div className="col-span-6"><strong>ĐT / ĐC giao hàng:</strong> {customerPhone || '---'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : docType === 'sales_return' ? (
                    /* CASE: PHIẾU HÀNG BÁN TRẢ LẠI MẪU 02-TT (Theo Ảnh 2) */
                    <div className="border-b-2 border-black pb-2 mb-2">
                      <div className="flex items-start justify-between gap-4">
                        {/* Left: Doanh nghiệp */}
                        <div className="flex-1">
                          <div className="font-black text-[10pt] uppercase text-black">{companyName}</div>
                          <div className="text-[7.5pt] text-gray-800 leading-tight">{companyAddress}</div>
                          <div className="text-[7.5pt] text-gray-700">Điện thoại: {companyPhone}</div>
                        </div>

                        {/* Right: Mẫu số 02-TT TT200 & Định khoản kế toán */}
                        <div className="text-right text-[7.5pt] text-gray-900 border border-black p-1.5 bg-gray-50 rounded">
                          <div className="font-bold text-[8pt] text-black">Mẫu số: 02-TT</div>
                          <div className="italic text-[6.5pt] text-gray-600">(Ban hành theo Thông tư số: 200/2014/TT-BTC Ngày 22/12/2014 của BTC)</div>
                          <div className="grid grid-cols-2 gap-x-3 text-left pt-1 border-t border-gray-400 mt-1 font-mono text-[7pt]">
                            <div>
                              <div><strong>Nợ:</strong> 1561 &nbsp;&nbsp;&nbsp; 0</div>
                              <div>&nbsp;&nbsp;&nbsp;&nbsp; 5212 &nbsp;&nbsp;&nbsp; {formatVND(calculatedGrandTotal).replace(' ₫', '')}</div>
                            </div>
                            <div>
                              <div><strong>Có:</strong> 6321 &nbsp;&nbsp;&nbsp; 0</div>
                              <div>&nbsp;&nbsp;&nbsp;&nbsp; 1311 &nbsp;&nbsp;&nbsp; {formatVND(calculatedGrandTotal).replace(' ₫', '')}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tiêu đề & Ngày tháng */}
                      <div className="text-center mt-2">
                        <h2 className="text-[15pt] font-black uppercase tracking-wider text-black">
                          HÀNG BÁN TRẢ LẠI
                        </h2>
                        <div className="text-[8pt] text-gray-700 italic">
                          {docDateStr} &nbsp;&nbsp;&nbsp;&nbsp; <strong>Số:</strong> {docNumber}
                        </div>
                      </div>

                      {/* Khối thông tin chứng từ gốc */}
                      <div className="mt-2 space-y-1 text-[8pt] text-gray-900 border border-black p-2 rounded bg-gray-50/50">
                        <div className="flex items-baseline">
                          <span className="font-semibold w-48">- Họ tên người giao hàng:</span>
                          <span className="flex-1 font-bold text-black border-b border-dotted border-gray-600 pb-0.5">{customerName}</span>
                        </div>
                        <div className="flex items-baseline">
                          <span className="font-semibold w-48">- Theo số:</span>
                          <span className="font-bold text-black border-b border-dotted border-gray-600 pb-0.5 px-2 font-mono">{docNumber}</span>
                          <span className="font-semibold ml-2 mr-2">ngày:</span>
                          <span className="flex-1 text-black border-b border-dotted border-gray-600 pb-0.5">{docDateStr}</span>
                        </div>
                        <div className="flex items-baseline">
                          <span className="font-semibold w-48">- Nhập tại kho:</span>
                          <span className="flex-1 font-bold text-black border-b border-dotted border-gray-600 pb-0.5">{warehouse || 'Kho hàng hóa Gia Phúc'}</span>
                        </div>
                        <div className="flex items-baseline">
                          <span className="font-semibold w-48">- Lý do trả hàng / Diễn giải:</span>
                          <span className="flex-1 text-gray-900 border-b border-dotted border-gray-600 pb-0.5">{explanationNote || 'Khách hàng trả hàng theo đơn bán hàng'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* CASE: TEMPLATE CHUẨN CÁC LOẠI PHIẾU KHÁC */
                    <>
                      <div className="border-b border-black pb-1.5 mb-1.5">
                        <div className="flex items-start justify-between gap-2 sm:gap-4">
                          {/* Left: Logo Gia Phúc */}
                          {showLogo && (
                            <div className="flex-shrink-0 flex items-center justify-center pt-0.5">
                              {customLogoUrl ? (
                                <img
                                  src={customLogoUrl}
                                  alt="Logo"
                                  referrerPolicy="no-referrer"
                                  className={`${paperSize === 'A5' ? 'h-10' : 'h-14'} w-auto max-w-[130px] object-contain`}
                                />
                              ) : (
                                <GiaPhucLogo logoUrl={customLogoUrl || settings.logoUrl} isPrint={true} size={paperSize === 'A5' ? 'xs' : 'sm'} />
                              )}
                            </div>
                          )}

                          {/* Right: Company Legal Information Header */}
                          <div className="flex-1 text-center sm:text-left pl-1">
                            <h1
                              className={`${
                                paperSize === 'A5' ? 'text-[10pt]' : 'text-[12pt]'
                              } font-black uppercase text-blue-950 tracking-tight leading-tight`}
                            >
                              {companyName}
                            </h1>
                            <div
                              className={`${
                                paperSize === 'A5' ? 'text-[7.5pt]' : 'text-[8.5pt]'
                              } text-gray-800 mt-0.5 leading-snug`}
                            >
                              <span>{companyAddress}</span>
                            </div>
                            <div
                              className={`${
                                paperSize === 'A5' ? 'text-[7.5pt]' : 'text-[8.5pt]'
                              } text-gray-800 flex flex-wrap items-center gap-x-3 gap-y-0.5 leading-snug`}
                            >
                              <span>
                                <strong>Tell/Zalo:</strong> {companyPhone}
                              </span>
                              <span>
                                <strong>Tell/Fax:</strong> {companyFax}
                              </span>
                            </div>
                            <div
                              className={`${
                                paperSize === 'A5' ? 'text-[7pt]' : 'text-[8pt]'
                              } text-gray-700 flex flex-wrap items-center gap-x-3 gap-y-0.5 leading-snug`}
                            >
                              <span>
                                <strong>Website:</strong> {companyWeb}
                              </span>
                              <span>
                                <strong>Email:</strong> {companyEmail}
                              </span>
                            </div>
                          </div>

                          {/* Right: Top-Right Barcode & QR Box (Cân đối đầu trang - Đúng vị trí khoanh đỏ Ảnh 1) */}
                          {showBarcode && (codePlacement === 'split' || codePlacement === 'header' || codePlacement === 'both') && (
                            <div className="flex-shrink-0 flex flex-col items-end justify-start pl-2 pt-0.5">
                              <SlipBarcodeQR
                                docCode={docNumber}
                                docType={docType}
                                date={docDateStr}
                                customerName={customerName}
                                totalAmount={calculatedGrandTotal}
                                paperSize={paperSize}
                                showBarcode={true}
                                showQr={codePlacement === 'header' || codePlacement === 'both'}
                                renderMode={codePlacement === 'split' ? 'barcode_only' : 'both'}
                                align="right"
                                layout="column"
                                className="my-0"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Document Title & Date */}
                      <div className="text-center my-1">
                        <h2
                          className={`${
                            paperSize === 'A5' ? 'text-[12pt]' : 'text-[15pt]'
                          } font-black uppercase tracking-wider text-black`}
                        >
                          {getDocTitle()}
                        </h2>
                        <div
                          className={`${
                            paperSize === 'A5' ? 'text-[8pt]' : 'text-[9pt]'
                          } text-gray-700 italic mt-0.5`}
                        >
                          {docDateStr}
                        </div>
                      </div>

                      {/* Metadata Header Box (Right-aligned Voucher No., Creator, Warehouse) */}
                      <div
                        className={`grid grid-cols-12 gap-1 ${
                          paperSize === 'A5' ? 'text-[8pt]' : 'text-[9pt]'
                        } text-gray-900 mb-1.5`}
                      >
                        {/* Left Column: Customer Details */}
                        <div className="col-span-8 space-y-1">
                          <div className="flex items-baseline">
                            <span className="font-bold whitespace-nowrap w-24">
                              {docType === 'goods_receipt' ? 'Nhà cung cấp:' : 'Khách hàng:'}
                            </span>
                            <span className="flex-1 font-bold text-black border-b border-dotted border-gray-600 pb-0.5">
                              {customerName}
                            </span>
                          </div>
                          <div className="flex items-baseline">
                            <span className="font-bold whitespace-nowrap w-24">Địa chỉ:</span>
                            <span className="flex-1 text-gray-900 border-b border-dotted border-gray-600 pb-0.5">
                              {customerAddress}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <div className="flex-1 flex items-baseline">
                              <span className="font-bold whitespace-nowrap w-24">Người nhận:</span>
                              <span className="flex-1 text-gray-900 border-b border-dotted border-gray-600 pb-0.5">
                                {recipientName || customerName}
                              </span>
                            </div>
                            <div className="w-44 flex items-baseline">
                              <span className="font-bold whitespace-nowrap mr-1">Số điện thoại:</span>
                              <span className="flex-1 font-bold text-black border-b border-dotted border-gray-600 pb-0.5">
                                {customerPhone}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-baseline">
                            <span className="font-bold whitespace-nowrap w-24">Diễn giải:</span>
                            <span className="flex-1 text-gray-900 font-semibold border-b border-dotted border-gray-600 pb-0.5">
                              {explanationNote}
                            </span>
                          </div>
                        </div>

                        {/* Right Column: Voucher Meta (Số phiếu, Người lập, Kho) */}
                        <div className="col-span-4 pl-2 space-y-1 border-l border-gray-300">
                          <div className="flex items-baseline">
                            <span className="font-bold whitespace-nowrap w-20">Số phiếu:</span>
                            <span className="flex-1 font-mono font-bold text-black border-b border-dotted border-gray-600 pb-0.5 text-right">
                              {docNumber}
                            </span>
                          </div>
                          <div className="flex items-baseline">
                            <span className="font-bold whitespace-nowrap w-20">Người lập:</span>
                            <span className="flex-1 font-bold text-black border-b border-dotted border-gray-600 pb-0.5 text-right">
                              {creator}
                            </span>
                          </div>
                          <div className="flex items-baseline">
                            <span className="font-bold whitespace-nowrap w-20">Kho:</span>
                            <span className="flex-1 font-bold text-black border-b border-dotted border-gray-600 pb-0.5 text-right">
                              {warehouse}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* =========================================================================
                      Table Section: Render Exact Table Columns Based on Selected Doc Type
                      ========================================================================= */}
                  <div className="overflow-x-auto my-1">
                    <table
                      className={`excel-grid-table w-full border-collapse border border-black ${
                        paperSize === 'A5' ? 'text-[7.5pt]' : 'text-[8.5pt]'
                      }`}
                    >
                      {/* -------------------------------------------------------------
                          CASE 1: ĐƠN ĐẶT HÀNG (Ảnh 1)
                          ------------------------------------------------------------- */}
                      {docType === 'sales_order' && (
                        <>
                          <thead>
                            <tr className="excel-header-blue text-black font-bold text-center border-b border-black">
                              <th className="border border-black px-1 py-1 w-8">STT</th>
                              <th className="border border-black px-2 py-1 text-left">TÊN HÀNG HÓA</th>
                              <th className="border border-black px-1.5 py-1 w-12">ĐVT</th>
                              <th className="border border-black px-1.5 py-1 w-14">SỐ LƯỢNG</th>
                              <th className="border border-black px-2 py-1 text-right w-24">ĐƠN GIÁ</th>
                              <th className="border border-black px-2 py-1 text-right w-28">THÀNH TIỀN</th>
                              <th className="border border-black px-1.5 py-1 text-center w-20">GHI CHÚ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {itemsList.map((it, idx) => (
                              <tr key={idx} className="border-b border-black">
                                <td className="border border-black px-1 py-1 text-center font-bold">{idx + 1}</td>
                                <td className="border border-black px-2 py-1 font-bold text-black">{it.productName}</td>
                                <td className="border border-black px-1 py-1 text-center">{it.unit || 'PCS'}</td>
                                <td className="border border-black px-1 py-1 text-center font-bold">{it.quantity}</td>
                                <td className="border border-black px-2 py-1 text-right font-mono">
                                  {formatVND(it.unitPrice).replace(' ₫', '')}
                                </td>
                                <td className="border border-black px-2 py-1 text-right font-mono font-bold">
                                  {formatVND(it.total || it.quantity * it.unitPrice).replace(' ₫', '')}
                                </td>
                                <td className="border border-black px-1 py-1 text-center text-[7pt] text-gray-700">
                                  {it.note || it.warranty || ''}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </>
                      )}

                      {/* -------------------------------------------------------------
                          CASE 2: PHIẾU NHẬP KHO (Ảnh 2)
                          ------------------------------------------------------------- */}
                      {docType === 'goods_receipt' && (
                        <>
                          <thead>
                            <tr className="excel-header-blue text-black font-bold text-center border-b border-black">
                              <th className="border border-black px-1 py-1 w-8">STT</th>
                              <th className="border border-black px-2 py-1 w-20">MÃ VẬT TƯ</th>
                              <th className="border border-black px-2 py-1 text-left">TÊN HÀNG HÓA</th>
                              <th className="border border-black px-1.5 py-1 w-12">ĐVT</th>
                              <th className="border border-black px-1 py-1 w-14">SL NHẬP</th>
                              <th className="border border-black px-1 py-1 w-14">THỰC NHẬP</th>
                              <th className="border border-black px-2 py-1 w-32">SERIA</th>
                              <th className="border border-black px-1.5 py-1 w-16">GHI CHÚ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {itemsList.map((it, idx) => (
                              <tr key={idx} className="border-b border-black">
                                <td className="border border-black px-1 py-1 text-center font-bold">{idx + 1}</td>
                                <td className="border border-black px-2 py-1 font-mono font-bold">{it.sku || `VT-${idx + 1}`}</td>
                                <td className="border border-black px-2 py-1 font-bold text-black">{it.productName}</td>
                                <td className="border border-black px-1 py-1 text-center">{it.unit || 'PCS'}</td>
                                <td className="border border-black px-1 py-1 text-center font-bold">{it.quantity}</td>
                                <td className="border border-black px-1 py-1 text-center font-bold text-blue-900">
                                  {it.actualQuantity !== undefined ? it.actualQuantity : it.quantity}
                                </td>
                                <td className="border border-black px-1.5 py-1 font-mono text-[7.5pt] text-gray-800">
                                  {it.serialNumber || 'E32131315F'}
                                </td>
                                <td className="border border-black px-1 py-1 text-center text-[7pt] text-gray-700">
                                  {it.note || ''}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </>
                      )}

                      {/* -------------------------------------------------------------
                          CASE 3: HÓA ĐƠN BÁN HÀNG (Ảnh 3)
                          ------------------------------------------------------------- */}
                      {(docType === 'sales_invoice' || docType === 'delivery_note' || docType === 'warranty_receipt' || docType === 'payment_receipt' || docType === 'einvoice_vat') && (
                        <>
                          <thead>
                            <tr className="excel-header-blue text-black font-bold text-center border-b border-black">
                              <th className="border border-black px-1 py-1 w-8">STT</th>
                              <th className="border border-black px-2 py-1 w-20">MÃ VẬT TƯ</th>
                              <th className="border border-black px-2 py-1 text-left">TÊN HÀNG HÓA</th>
                              <th className="border border-black px-1.5 py-1 w-12">ĐVT</th>
                              <th className="border border-black px-1.5 py-1 w-12">SL</th>
                              <th className="border border-black px-2 py-1 text-right w-24">ĐƠN GIÁ</th>
                              <th className="border border-black px-2 py-1 text-right w-28">THÀNH TIỀN</th>
                              <th className="border border-black px-1.5 py-1 text-center w-20">GHI CHÚ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {itemsList.map((it, idx) => (
                              <tr key={idx} className="border-b border-black">
                                <td className="border border-black px-1 py-1 text-center font-bold">{idx + 1}</td>
                                <td className="border border-black px-2 py-1 font-mono font-bold text-gray-900">
                                  {it.sku || `VT-${idx + 1}`}
                                </td>
                                <td className="border border-black px-2 py-1 font-bold text-black">{it.productName}</td>
                                <td className="border border-black px-1 py-1 text-center">{it.unit || 'PCS'}</td>
                                <td className="border border-black px-1 py-1 text-center font-bold">{it.quantity}</td>
                                <td className="border border-black px-2 py-1 text-right font-mono">
                                  {formatVND(it.unitPrice).replace(' ₫', '')}
                                </td>
                                <td className="border border-black px-2 py-1 text-right font-mono font-bold">
                                  {formatVND(it.total || it.quantity * it.unitPrice).replace(' ₫', '')}
                                </td>
                                <td className="border border-black px-1 py-1 text-center text-[7pt] text-gray-700">
                                  {it.warranty || it.note || ''}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </>
                      )}

                      {/* -------------------------------------------------------------
                          CASE 4: PHIẾU ĐỔI TRẢ HÀNG HÓA KIÊM PHIẾU NHẬP XUẤT (Ảnh 4)
                          ------------------------------------------------------------- */}
                      {docType === 'exchange_return' && (
                        <>
                          <thead>
                            <tr className="excel-header-blue text-black font-bold text-center border-b border-black">
                              <th className="border border-black px-1 py-1 w-7" rowSpan={2}>STT</th>
                              <th className="border border-black px-1.5 py-1 text-center bg-blue-200/80" colSpan={6}>
                                THÔNG TIN HÀNG TRẢ LẠI
                              </th>
                              <th className="border border-black px-1.5 py-1 text-center bg-emerald-200/80" colSpan={6}>
                                THÔNG TIN HÀNG MỚI ĐỔI
                              </th>
                              <th className="border border-black px-1 py-1 w-16" rowSpan={2}>GHI CHÚ</th>
                            </tr>
                            <tr className="excel-header-blue text-black font-bold text-center border-b border-black text-[7pt]">
                              <th className="border border-black px-1 py-0.5 w-14">Mã VT</th>
                              <th className="border border-black px-1 py-0.5 text-left">Tên Hàng Hóa</th>
                              <th className="border border-black px-1 py-0.5 w-10">ĐVT</th>
                              <th className="border border-black px-1 py-0.5 w-8">SL</th>
                              <th className="border border-black px-1 py-0.5 text-right w-16">Đơn Giá</th>
                              <th className="border border-black px-1 py-0.5 text-right w-20">Thành Tiền</th>
                              <th className="border border-black px-1 py-0.5 w-14">Mã Mới</th>
                              <th className="border border-black px-1 py-0.5 text-left">Tên Hàng Mới</th>
                              <th className="border border-black px-1 py-0.5 w-10">ĐVT</th>
                              <th className="border border-black px-1 py-0.5 w-8">SL</th>
                              <th className="border border-black px-1 py-0.5 text-right w-16">Đơn Giá</th>
                              <th className="border border-black px-1 py-0.5 text-right w-20">Thành Tiền</th>
                            </tr>
                          </thead>
                          <tbody>
                            {itemsList.map((it, idx) => (
                              <tr key={idx} className="border-b border-black">
                                <td className="border border-black px-1 py-0.5 text-center font-bold">{idx + 1}</td>
                                <td className="border border-black px-1 py-0.5 font-mono font-semibold">{it.sku || ''}</td>
                                <td className="border border-black px-1 py-0.5 font-medium">{it.productName}</td>
                                <td className="border border-black px-1 py-0.5 text-center">{it.unit || 'PCS'}</td>
                                <td className="border border-black px-1 py-0.5 text-center font-bold">{it.quantity}</td>
                                <td className="border border-black px-1 py-0.5 text-right font-mono">
                                  {it.unitPrice > 0 ? formatVND(it.unitPrice).replace(' ₫', '') : ''}
                                </td>
                                <td className="border border-black px-1 py-0.5 text-right font-mono font-bold">
                                  {it.total > 0 ? formatVND(it.total).replace(' ₫', '') : ''}
                                </td>
                                <td className="border border-black px-1 py-0.5 font-mono text-emerald-900 font-semibold">{it.newSku || ''}</td>
                                <td className="border border-black px-1 py-0.5 font-medium text-emerald-950">{it.newProductName || ''}</td>
                                <td className="border border-black px-1 py-0.5 text-center">{it.newUnit || (it.newProductName ? 'PCS' : '')}</td>
                                <td className="border border-black px-1 py-0.5 text-center font-bold">{it.newQuantity || ''}</td>
                                <td className="border border-black px-1 py-0.5 text-right font-mono">
                                  {it.newUnitPrice ? formatVND(it.newUnitPrice).replace(' ₫', '') : ''}
                                </td>
                                <td className="border border-black px-1 py-0.5 text-right font-mono font-bold text-emerald-900">
                                  {it.newTotal ? formatVND(it.newTotal).replace(' ₫', '') : ''}
                                </td>
                                <td className="border border-black px-1 py-0.5 text-center font-bold text-[7pt]">
                                  {it.actionType || (it.newProductName ? 'ĐỔI HÀNG' : 'TRẢ HÀNG')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </>
                      )}

                      {/* -------------------------------------------------------------
                          CASE 5 & 6: PHIẾU NHẬN / TRẢ BẢO HÀNH (Ảnh 5 & 6)
                          ------------------------------------------------------------- */}
                      {(docType === 'warranty_intake' || docType === 'warranty_return') && (
                        <>
                          <thead>
                            <tr className="excel-header-blue text-black font-bold text-center border-b border-black">
                              <th className="border border-black px-1 py-1 w-8">STT</th>
                              <th className="border border-black px-2 py-1 text-left">TÊN HÀNG HÓA</th>
                              <th className="border border-black px-1.5 py-1 w-16">ĐƠN VỊ TÍNH</th>
                              <th className="border border-black px-1.5 py-1 w-16">SỐ LƯỢNG</th>
                              <th className="border border-black px-1.5 py-1 w-20">
                                {docType === 'warranty_intake' ? 'THỰC NHẬN' : 'THỰC XUẤT'}
                              </th>
                              <th className="border border-black px-2 py-1 w-36">SERIA</th>
                              <th className="border border-black px-2 py-1 text-center w-24">GHI CHÚ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {itemsList.map((it, idx) => (
                              <tr key={idx} className="border-b border-black">
                                <td className="border border-black px-1 py-1 text-center font-bold">{idx + 1}</td>
                                <td className="border border-black px-2 py-1 font-bold text-black">{it.productName}</td>
                                <td className="border border-black px-1 py-1 text-center">{it.unit || 'PCS'}</td>
                                <td className="border border-black px-1 py-1 text-center font-bold">{it.quantity}</td>
                                <td className="border border-black px-1 py-1 text-center font-bold text-blue-900">
                                  {it.actualQuantity !== undefined ? it.actualQuantity : it.quantity}
                                </td>
                                <td className="border border-black px-2 py-1 font-mono text-[7.5pt] text-gray-800">
                                  {it.serialNumber || 'E32131315F'}
                                </td>
                                <td className="border border-black px-1 py-1 text-center text-[7pt] text-gray-700">
                                  {it.note || 'Bảo hành chính hãng'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </>
                      )}

                      {/* -------------------------------------------------------------
                          CASE 7: PHIẾU BÀN GIAO & CUNG CẤP TÀI SẢN (asset_handover)
                          ------------------------------------------------------------- */}
                      {docType === 'asset_handover' && (
                        <>
                          <thead>
                            <tr className="excel-header-blue text-black font-bold text-center border-b border-black">
                              <th className="border border-black px-1 py-1 w-8">STT</th>
                              <th className="border border-black px-2 py-1 w-24">MÃ TÀI SẢN</th>
                              <th className="border border-black px-2 py-1 text-left">TÊN THIẾT BỊ / TÀI SẢN</th>
                              <th className="border border-black px-2 py-1 w-32">SỐ SERIAL / IMEI</th>
                              <th className="border border-black px-1.5 py-1 w-12">ĐVT</th>
                              <th className="border border-black px-1.5 py-1 w-12">SL</th>
                              <th className="border border-black px-2 py-1 w-28">TÌNH TRẠNG</th>
                              <th className="border border-black px-2 py-1 text-center w-24">BẢO HÀNH</th>
                            </tr>
                          </thead>
                          <tbody>
                            {itemsList.map((it, idx) => (
                              <tr key={idx} className="border-b border-black">
                                <td className="border border-black px-1 py-1 text-center font-bold">{idx + 1}</td>
                                <td className="border border-black px-2 py-1 font-mono font-bold text-blue-900">{it.sku || `TS-${idx + 101}`}</td>
                                <td className="border border-black px-2 py-1 font-bold text-black">{it.productName}</td>
                                <td className="border border-black px-2 py-1 font-mono text-[7.5pt] text-gray-800">{it.serialNumber || 'SN-2026-XXXX'}</td>
                                <td className="border border-black px-1 py-1 text-center">{it.unit || 'Cái'}</td>
                                <td className="border border-black px-1 py-1 text-center font-bold">{it.quantity}</td>
                                <td className="border border-black px-1.5 py-1 text-center text-emerald-800 font-semibold text-[7.5pt]">{it.note || 'Hoạt động tốt 100%'}</td>
                                <td className="border border-black px-1 py-1 text-center text-[7pt] text-gray-700">{it.warranty || '12 Tháng'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </>
                      )}

                      {/* -------------------------------------------------------------
                          CASE 8: PHIẾU ĐIỀU CHUYỂN TÀI SẢN / KHO (asset_transfer)
                          ------------------------------------------------------------- */}
                      {docType === 'asset_transfer' && (
                        <>
                          <thead>
                            <tr className="excel-header-blue text-black font-bold text-center border-b border-black">
                              <th className="border border-black px-1 py-1 w-8">STT</th>
                              <th className="border border-black px-2 py-1 w-24">MÃ VT/TS</th>
                              <th className="border border-black px-2 py-1 text-left">TÊN THIẾT BỊ ĐIỀU CHUYỂN</th>
                              <th className="border border-black px-2 py-1 w-32">SỐ SERIAL</th>
                              <th className="border border-black px-1.5 py-1 w-12">ĐVT</th>
                              <th className="border border-black px-1.5 py-1 w-14">SL XUẤT</th>
                              <th className="border border-black px-1.5 py-1 w-14">THỰC NHẬN</th>
                              <th className="border border-black px-2 py-1 text-center w-24">TÌNH TRẠNG</th>
                            </tr>
                          </thead>
                          <tbody>
                            {itemsList.map((it, idx) => (
                              <tr key={idx} className="border-b border-black">
                                <td className="border border-black px-1 py-1 text-center font-bold">{idx + 1}</td>
                                <td className="border border-black px-2 py-1 font-mono font-bold text-blue-900">{it.sku || `VT-${idx + 1}`}</td>
                                <td className="border border-black px-2 py-1 font-bold text-black">{it.productName}</td>
                                <td className="border border-black px-2 py-1 font-mono text-[7.5pt] text-gray-800">{it.serialNumber || 'SN-XXXX'}</td>
                                <td className="border border-black px-1 py-1 text-center">{it.unit || 'Cái'}</td>
                                <td className="border border-black px-1 py-1 text-center font-bold">{it.quantity}</td>
                                <td className="border border-black px-1 py-1 text-center font-bold text-blue-900">{it.actualQuantity !== undefined ? it.actualQuantity : it.quantity}</td>
                                <td className="border border-black px-1.5 py-1 text-center text-[7.5pt] text-gray-700">{it.note || 'Nguyên tem niêm phong'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </>
                      )}

                      {/* -------------------------------------------------------------
                          CASE 9: BIÊN BẢN TIÊU HỦY VẬT TƯ / TÀI SẢN (stock_disposal)
                          ------------------------------------------------------------- */}
                      {docType === 'stock_disposal' && (
                        <>
                          <thead>
                            <tr className="excel-header-blue text-black font-bold text-center border-b border-black">
                              <th className="border border-black px-1 py-1 w-8">STT</th>
                              <th className="border border-black px-2 py-1 w-24">MÃ VT/TS</th>
                              <th className="border border-black px-2 py-1 text-left">TÊN VẬT TƯ / TÀI SẢN HƯ HỎNG</th>
                              <th className="border border-black px-2 py-1 w-32">SỐ SERIAL</th>
                              <th className="border border-black px-1.5 py-1 w-12">ĐVT</th>
                              <th className="border border-black px-1.5 py-1 w-12">SL HỦY</th>
                              <th className="border border-black px-2 py-1 text-right w-24">GIÁ VỐN</th>
                              <th className="border border-black px-2 py-1 text-center w-28">LÝ DO TIÊU HỦY</th>
                            </tr>
                          </thead>
                          <tbody>
                            {itemsList.map((it, idx) => (
                              <tr key={idx} className="border-b border-black">
                                <td className="border border-black px-1 py-1 text-center font-bold">{idx + 1}</td>
                                <td className="border border-black px-2 py-1 font-mono font-bold text-rose-900">{it.sku || `VT-${idx + 1}`}</td>
                                <td className="border border-black px-2 py-1 font-bold text-black">{it.productName}</td>
                                <td className="border border-black px-2 py-1 font-mono text-[7.5pt] text-gray-800">{it.serialNumber || 'SN-XXXX'}</td>
                                <td className="border border-black px-1 py-1 text-center">{it.unit || 'Cái'}</td>
                                <td className="border border-black px-1 py-1 text-center font-bold text-rose-700">{it.quantity}</td>
                                <td className="border border-black px-2 py-1 text-right font-mono">{formatVND(it.unitPrice).replace(' ₫', '')}</td>
                                <td className="border border-black px-1.5 py-1 text-center text-rose-800 text-[7.5pt] font-semibold">{it.note || 'Lỗi bo mạch / Không sửa được'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </>
                      )}

                      {/* -------------------------------------------------------------
                          CASE 10: PHIẾU THU TIỀN THANH LÝ (liquidation_receipt)
                          ------------------------------------------------------------- */}
                      {docType === 'liquidation_receipt' && (
                        <>
                          <thead>
                            <tr className="excel-header-blue text-black font-bold text-center border-b border-black">
                              <th className="border border-black px-1 py-1 w-8">STT</th>
                              <th className="border border-black px-2 py-1 w-24">MÃ VT/TS</th>
                              <th className="border border-black px-2 py-1 text-left">TÊN VẬT TƯ / THIẾT BỊ THANH LÝ</th>
                              <th className="border border-black px-2 py-1 w-32">SỐ SERIAL</th>
                              <th className="border border-black px-1.5 py-1 w-12">ĐVT</th>
                              <th className="border border-black px-1.5 py-1 w-12">SL</th>
                              <th className="border border-black px-2 py-1 text-right w-24">GIÁ THANH LÝ</th>
                              <th className="border border-black px-2 py-1 text-right w-28">THÀNH TIỀN</th>
                            </tr>
                          </thead>
                          <tbody>
                            {itemsList.map((it, idx) => (
                              <tr key={idx} className="border-b border-black">
                                <td className="border border-black px-1 py-1 text-center font-bold">{idx + 1}</td>
                                <td className="border border-black px-2 py-1 font-mono font-bold text-blue-900">{it.sku || `TL-${idx + 1}`}</td>
                                <td className="border border-black px-2 py-1 font-bold text-black">{it.productName}</td>
                                <td className="border border-black px-2 py-1 font-mono text-[7.5pt] text-gray-800">{it.serialNumber || 'SN-XXXX'}</td>
                                <td className="border border-black px-1 py-1 text-center">{it.unit || 'Cái'}</td>
                                <td className="border border-black px-1 py-1 text-center font-bold">{it.quantity}</td>
                                <td className="border border-black px-2 py-1 text-right font-mono">{formatVND(it.unitPrice).replace(' ₫', '')}</td>
                                <td className="border border-black px-2 py-1 text-right font-mono font-bold text-blue-900">{formatVND(it.total || it.quantity * it.unitPrice).replace(' ₫', '')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </>
                      )}

                      {/* -------------------------------------------------------------
                          CASE 11: PHIẾU ĐIỀU PHỐI GIAO HÀNG & THU COD (delivery_dispatch)
                          ------------------------------------------------------------- */}
                      {docType === 'delivery_dispatch' && (
                        <>
                          <thead>
                            <tr className="excel-header-blue text-black font-bold text-center border-b border-black">
                              <th className="border border-black px-1 py-1 w-8">STT</th>
                              <th className="border border-black px-2 py-1 w-24">MÃ SẢN PHẨM</th>
                              <th className="border border-black px-2 py-1 text-left">TÊN SẢN PHẨM / KIỆN HÀNG</th>
                              <th className="border border-black px-2 py-1 w-32">SERIAL / IMEI</th>
                              <th className="border border-black px-1.5 py-1 w-12">ĐVT</th>
                              <th className="border border-black px-1.5 py-1 w-12">SL</th>
                              <th className="border border-black px-2 py-1 text-right w-28">TIỀN THU COD</th>
                              <th className="border border-black px-2 py-1 text-center w-24">GHI CHÚ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {itemsList.map((it, idx) => (
                              <tr key={idx} className="border-b border-black">
                                <td className="border border-black px-1 py-1 text-center font-bold">{idx + 1}</td>
                                <td className="border border-black px-2 py-1 font-mono font-bold text-blue-900">{it.sku || `SP-${idx + 1}`}</td>
                                <td className="border border-black px-2 py-1 font-bold text-black">{it.productName}</td>
                                <td className="border border-black px-2 py-1 font-mono text-[7.5pt] text-gray-800">{it.serialNumber || '---'}</td>
                                <td className="border border-black px-1 py-1 text-center">{it.unit || 'Cái'}</td>
                                <td className="border border-black px-1 py-1 text-center font-bold">{it.quantity}</td>
                                <td className="border border-black px-2 py-1 text-right font-mono font-bold text-rose-900">{formatVND(it.total || it.quantity * it.unitPrice).replace(' ₫', '')}</td>
                                <td className="border border-black px-1.5 py-1 text-center text-[7pt] text-gray-700">{it.note || 'Cho xem hàng'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </>
                      )}

                      {/* -------------------------------------------------------------
                          CASE 12: TEM VẬN ĐƠN DÁN KIỆN HÀNG (shipping_label)
                          ------------------------------------------------------------- */}
                      {docType === 'shipping_label' && (
                        <>
                          <thead>
                            <tr className="excel-header-blue text-black font-bold text-center border-b border-black">
                              <th className="border border-black px-1 py-1 w-8">STT</th>
                              <th className="border border-black px-2 py-1 text-left">NỘI DUNG HÀNG HÓA TRONG KIỆN</th>
                              <th className="border border-black px-1.5 py-1 w-14">SỐ LƯỢNG</th>
                              <th className="border border-black px-2 py-1 text-center w-28">SERIAL MÁY</th>
                            </tr>
                          </thead>
                          <tbody>
                            {itemsList.map((it, idx) => (
                              <tr key={idx} className="border-b border-black">
                                <td className="border border-black px-1 py-1 text-center font-bold">{idx + 1}</td>
                                <td className="border border-black px-2 py-1 font-bold text-black">{it.productName}</td>
                                <td className="border border-black px-1 py-1 text-center font-bold">{it.quantity} {it.unit || 'Cái'}</td>
                                <td className="border border-black px-2 py-1 font-mono text-[7.5pt] text-center text-gray-800">{it.serialNumber || '---'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </>
                      )}

                      {/* -------------------------------------------------------------
                          CASE 13: BIÊN BẢN GIAO NHẬN HÀNG HÓA (goods_delivery_record - Theo Ảnh 1)
                          ------------------------------------------------------------- */}
                      {docType === 'goods_delivery_record' && (
                        <>
                          <thead>
                            <tr className="excel-header-blue text-black font-bold text-center border-b border-black">
                              <th className="border border-black px-1 py-1 w-8">STT</th>
                              <th className="border border-black px-2 py-1 text-left">TÊN HÀNG</th>
                              <th className="border border-black px-1.5 py-1 w-12 text-center">ĐVT</th>
                              <th className="border border-black px-1.5 py-1 w-12 text-center">SL</th>
                              <th className="border border-black px-2 py-1 text-right w-24">ĐƠN GIÁ</th>
                              <th className="border border-black px-1.5 py-1 text-right w-20">GIẢM GIÁ</th>
                              <th className="border border-black px-2 py-1 text-right w-28">THÀNH TIỀN</th>
                            </tr>
                          </thead>
                          <tbody>
                            {itemsList.map((it, idx) => (
                              <tr key={idx} className="border-b border-black">
                                <td className="border border-black px-1 py-1 text-center font-bold">{idx + 1}</td>
                                <td className="border border-black px-2 py-1">
                                  <div className="font-bold text-black">{it.productName}</div>
                                  {it.serialNumber && (
                                    <div className="text-[7pt] text-gray-700 font-mono italic">
                                      (Serial No/Ghi chú: {it.serialNumber})
                                    </div>
                                  )}
                                </td>
                                <td className="border border-black px-1 py-1 text-center">{it.unit || 'Cái'}</td>
                                <td className="border border-black px-1 py-1 text-center font-bold">{it.quantity}</td>
                                <td className="border border-black px-2 py-1 text-right font-mono">{formatVND(it.unitPrice).replace(' ₫', '')}</td>
                                <td className="border border-black px-1.5 py-1 text-right font-mono text-gray-600">{(it as any).discount ? formatVND((it as any).discount).replace(' ₫', '') : '0'}</td>
                                <td className="border border-black px-2 py-1 text-right font-mono font-bold text-black">{formatVND(it.total || it.quantity * it.unitPrice).replace(' ₫', '')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </>
                      )}

                      {/* -------------------------------------------------------------
                          CASE 14: PHIẾU HÀNG BÁN TRẢ LẠI MẪU 02-TT (sales_return - Theo Ảnh 2)
                          ------------------------------------------------------------- */}
                      {docType === 'sales_return' && (
                        <>
                          <thead>
                            <tr className="excel-header-blue text-black font-bold text-center border-b border-black text-[7.5pt]">
                              <th className="border border-black px-1 py-1 w-8" rowSpan={2}>STT</th>
                              <th className="border border-black px-2 py-1 text-left" rowSpan={2}>Mặt hàng</th>
                              <th className="border border-black px-2 py-1 w-20 text-center" rowSpan={2}>Mã số</th>
                              <th className="border border-black px-1 py-1 w-10 text-center" rowSpan={2}>Đvt</th>
                              <th className="border border-black px-1 py-0.5 text-center" colSpan={2}>Số lượng</th>
                              <th className="border border-black px-2 py-1 text-right w-24" rowSpan={2}>Đơn giá</th>
                              <th className="border border-black px-2 py-1 text-right w-28" rowSpan={2}>Thành tiền</th>
                            </tr>
                            <tr className="excel-header-blue text-black font-bold text-center border-b border-black text-[7pt]">
                              <th className="border border-black px-1 py-0.5 w-14">Theo C.Từ</th>
                              <th className="border border-black px-1 py-0.5 w-14">Thực nhập</th>
                            </tr>
                          </thead>
                          <tbody>
                            {itemsList.map((it, idx) => (
                              <tr key={idx} className="border-b border-black">
                                <td className="border border-black px-1 py-1 text-center font-bold">{idx + 1}</td>
                                <td className="border border-black px-2 py-1">
                                  <div className="font-bold text-black">{it.productName}</div>
                                  {it.serialNumber && (
                                    <div className="text-[7pt] text-gray-700 font-mono italic">
                                      Serial thu hồi: {it.serialNumber}
                                    </div>
                                  )}
                                </td>
                                <td className="border border-black px-2 py-1 font-mono text-[7.5pt] text-center font-bold text-gray-800">{it.sku}</td>
                                <td className="border border-black px-1 py-1 text-center">{it.unit || 'Cái'}</td>
                                <td className="border border-black px-1 py-1 text-center font-bold">{it.quantity}</td>
                                <td className="border border-black px-1 py-1 text-center font-bold text-blue-900">{it.actualQuantity || it.quantity}</td>
                                <td className="border border-black px-2 py-1 text-right font-mono">{formatVND(it.unitPrice).replace(' ₫', '')}</td>
                                <td className="border border-black px-2 py-1 text-right font-mono font-bold text-black">{formatVND(it.total || it.quantity * it.unitPrice).replace(' ₫', '')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </>
                      )}

                      {/* Blank Grid Rows (Standard Vietnamese Ledger Padding) */}
                      {Array.from({ length: Math.max(0, emptyRowsCount) }).map((_, emptyIdx) => {
                        const totalCols =
                          docType === 'exchange_return'
                            ? 14
                            : docType === 'sales_return'
                            ? 8
                            : docType === 'goods_delivery_record'
                            ? 7
                            : docType === 'warranty_intake' || docType === 'warranty_return' || docType === 'sales_order'
                            ? 7
                            : 8;

                        return (
                          <tr key={`empty-${emptyIdx}`} className="border-b border-black h-5">
                            <td className="border border-black px-1 py-0.5 text-center text-gray-400 text-[7pt]">
                              {itemsList.length + emptyIdx + 1}
                            </td>
                            {Array.from({ length: totalCols - 1 }).map((_, cIdx) => (
                              <td key={cIdx} className="border border-black px-1 py-0.5">
                                &nbsp;
                              </td>
                            ))}
                          </tr>
                        );
                      })}

                      {/* Subtotal, Tax and Grand Total Rows */}
                      <tfoot>
                        {/* TỔNG TIỀN */}
                        <tr className="border-t border-black font-bold">
                          <td
                            colSpan={docType === 'exchange_return' ? 12 : docType === 'warranty_intake' || docType === 'warranty_return' || docType === 'sales_order' ? 5 : 6}
                            className="border border-black px-3 py-0.5 text-right uppercase"
                          >
                            TỔNG:
                          </td>
                          <td className="border border-black px-2 py-0.5 text-right font-mono font-bold">
                            {formatVND(calculatedSubtotal).replace(' ₫', '')}
                          </td>
                          <td className="border border-black px-1 py-0.5 text-center text-[7pt] text-gray-600">
                            {docType === 'exchange_return' ? '' : 'VND'}
                          </td>
                        </tr>

                        {/* VAT 8% */}
                        {taxRate > 0 && (
                          <tr className="border-t border-black font-semibold">
                            <td
                              colSpan={docType === 'exchange_return' ? 12 : docType === 'warranty_intake' || docType === 'warranty_return' || docType === 'sales_order' ? 5 : 6}
                              className="border border-black px-3 py-0.5 text-right"
                            >
                              VAT {taxRate}%:
                            </td>
                            <td className="border border-black px-2 py-0.5 text-right font-mono font-bold">
                              {formatVND(calculatedTaxAmount).replace(' ₫', '')}
                            </td>
                            <td className="border border-black px-1 py-0.5 text-center text-[7pt] text-gray-600">
                              {docType === 'exchange_return' ? '' : 'VND'}
                            </td>
                          </tr>
                        )}

                        {/* TỔNG CỘNG */}
                        <tr className="border-t-2 border-black bg-gray-100 font-black">
                          <td
                            colSpan={docType === 'exchange_return' ? 12 : docType === 'warranty_intake' || docType === 'warranty_return' || docType === 'sales_order' ? 5 : 6}
                            className="border border-black px-3 py-1 text-right uppercase text-black"
                          >
                            TỔNG CỘNG:
                          </td>
                          <td className="border border-black px-2 py-1 text-right font-mono text-[9pt] sm:text-[10pt] font-black text-black">
                            {formatVND(calculatedGrandTotal).replace(' ₫', '')}
                          </td>
                          <td className="border border-black px-1 py-1 text-center text-[7pt] font-bold text-black">
                            {docType === 'exchange_return' ? '' : 'VND'}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* -------------------------------------------------------------
                      FOOTNOTES & REMARKS SECTION
                      ------------------------------------------------------------- */}
                  {docType === 'goods_delivery_record' ? (
                    /* Ghi chú chuẩn Biên Bản Giao Nhận (Ảnh 1) */
                    <div className="mt-2 text-[8pt] text-gray-900 leading-snug border-t border-gray-300 pt-1.5 space-y-1">
                      <div className="font-bold underline">Ghi chú:</div>
                      <div className="pl-2 space-y-0.5">
                        <div>- Hàng hóa được giao nhận mới 100%, đầy đủ phụ kiện (adapter) kèm theo.</div>
                        <div>- Hình thức thanh toán: Tiền Mặt / Chuyển Khoản / Thanh toán cho người giao hàng.</div>
                        <div>- Bên Mua (bên B) kiểm tra hàng hóa trước khi nhận. Mọi sự thiếu sót về sau không được giải quyết.</div>
                      </div>
                    </div>
                  ) : docType === 'sales_return' ? (
                    /* Ghi chú & Đọc tiền bằng chữ chuẩn Mẫu 02-TT (Ảnh 2) */
                    <div className="mt-2 text-[8pt] text-gray-900 leading-snug border-t border-gray-300 pt-1.5 space-y-1">
                      <div>
                        - <strong>Tổng số tiền (Viết bằng chữ):</strong>{' '}
                        <span className="italic font-bold text-black">{numberToVietnameseWords(calculatedGrandTotal)}</span>
                      </div>
                      <div className="flex items-baseline">
                        <span className="w-56">- Số chứng từ gốc kèm theo:</span>
                        <span className="flex-1 border-b border-dotted border-gray-500 pb-0.5 text-gray-700">
                          {docNumber} ({docDateStr})
                        </span>
                      </div>
                      <div className="text-right italic text-[7.5pt] text-gray-700 pt-1">
                        Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
                      </div>
                    </div>
                  ) : (
                    /* 4 Standard Footnotes */
                    <div className={`mt-2 ${paperSize === 'A5' ? 'text-[7pt]' : 'text-[8pt]'} text-gray-900 leading-snug`}>
                      <div className="font-bold underline mb-0.5">Ghi chú:</div>
                      <ol className="list-none space-y-0.5 pl-0">
                        <li>
                          1. Giá trên bao gồm VAT {taxRate}%. Chưa bao gồm phí vận chuyển và cấu hình lắp đặt ( Liên hệ:{' '}
                          <strong>0914 665 994 Mr. Thơm</strong>)
                        </li>
                        <li>2. Bảo hành 1 năm theo tiêu chuẩn nhà sản xuất tại Công Ty Gia Phúc</li>
                        <li>
                          3. Hình thức thanh toán:{' '}
                          {docType === 'sales_order'
                            ? 'Thanh toán 50% Tiền mặt/ chuyển khoản sau khi đặt hàng'
                            : 'Tiền mặt/ chuyển khoản'}
                        </li>
                        <li>4. Vui lòng kiểm tra hàng trước khi rời khỏi công ty</li>
                      </ol>
                    </div>
                  )}

                  {/* Bottom Footer Section: Barcode/QR & Signatures */}
                  <div className="mt-auto pt-1 space-y-1">
                    {/* Delivery & Warranty Notes */}
                    {docType !== 'goods_delivery_record' && docType !== 'sales_return' && (
                      <div className={`${paperSize === 'A5' ? 'text-[7pt]' : 'text-[7.5pt]'} text-gray-700 italic space-y-0.5 border-t border-dotted border-gray-400 pt-1`}>
                        {explanationNote && <div>• <strong>Ghi chú:</strong> {explanationNote}</div>}
                        {settings?.receiptFooterNote && <div>• {settings.receiptFooterNote}</div>}
                      </div>
                    )}

                    {/* Barcode 1D & QR Code Tra Cứu Footer */}
                    {(showBarcode || showDocQr) && (codePlacement === 'footer' || codePlacement === 'split' || codePlacement === 'both') && (
                      <div className="py-1 border-t border-dotted border-gray-300">
                        <SlipBarcodeQR
                          docCode={docNumber}
                          docType={docType}
                          date={docDateStr}
                          customerName={customerName}
                          totalAmount={calculatedGrandTotal}
                          showBarcode={codePlacement === 'footer' || codePlacement === 'both'}
                          showQr={showDocQr}
                          renderMode={codePlacement === 'split' ? 'qr_only' : 'both'}
                          paperSize={paperSize}
                          vietQrUrl={qrUrl}
                          qrPayloadMode={showVietQR ? 'vietqr' : 'erp_smart'}
                          align={codePlacement === 'split' ? 'center' : 'between'}
                        />
                      </div>
                    )}

                    {/* Signatures Area */}
                    {docType === 'goods_delivery_record' ? (
                      /* 2 Khối Chữ Ký Biên Bản Giao Nhận (Ảnh 1) */
                      <div className="border-t border-gray-400 pt-2">
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div className="flex flex-col items-center justify-between min-h-[75px]">
                            <div>
                              <div className="font-black text-[9pt] uppercase text-black">ĐẠI DIỆN BÊN BÁN (BÊN A)</div>
                              <div className="text-[7.5pt] text-gray-600 italic">(Ký và ghi rõ họ tên)</div>
                            </div>
                            <div className="font-bold text-black text-[8.5pt] pt-8">{creator}</div>
                          </div>
                          <div className="flex flex-col items-center justify-between min-h-[75px]">
                            <div>
                              <div className="font-black text-[9pt] uppercase text-black">ĐẠI DIỆN BÊN MUA (BÊN B)</div>
                              <div className="text-[7.5pt] text-gray-600 italic">(Ký và ghi rõ họ tên)</div>
                            </div>
                            <div className="font-bold text-black text-[8.5pt] pt-8">{recipientName || customerName}</div>
                          </div>
                        </div>
                        {/* Hotline CSKH cuối trang */}
                        <div className="text-center text-[7.5pt] text-gray-700 italic border-t border-dotted border-gray-300 mt-2 pt-1">
                          Nếu Quý khách chưa hài lòng về thái độ phục vụ của Nhân Viên Giao Hàng - Nhân Viên Kỹ Thuật
                          <br />
                          Xin Quý khách vui lòng liên hệ theo SĐT: <strong>{companyPhone}</strong>
                        </div>
                      </div>
                    ) : docType === 'sales_return' ? (
                      /* 4 Khối Chữ Ký Hàng Bán Trả Lại Mẫu 02-TT (Ảnh 2) */
                      <div className="grid grid-cols-4 gap-2 text-center border-t border-gray-400 pt-2">
                        <div className="flex flex-col items-center justify-between min-h-[70px]">
                          <div>
                            <div className="font-bold text-[8pt] text-black">Người lập phiếu</div>
                            <div className="text-[6.5pt] italic text-gray-600">(Ký, họ tên)</div>
                          </div>
                          <div className="font-bold text-black text-[7.5pt] pt-8">{creator}</div>
                        </div>
                        <div className="flex flex-col items-center justify-between min-h-[70px]">
                          <div>
                            <div className="font-bold text-[8pt] text-black">Người giao hàng</div>
                            <div className="text-[6.5pt] italic text-gray-600">(Ký, họ tên)</div>
                          </div>
                          <div className="font-bold text-black text-[7.5pt] pt-8">{customerName}</div>
                        </div>
                        <div className="flex flex-col items-center justify-between min-h-[70px]">
                          <div>
                            <div className="font-bold text-[8pt] text-black">Thủ kho</div>
                            <div className="text-[6.5pt] italic text-gray-600">(Ký, họ tên)</div>
                          </div>
                          <div className="text-gray-400 text-[7pt] pt-8">....................</div>
                        </div>
                        <div className="flex flex-col items-center justify-between min-h-[70px]">
                          <div>
                            <div className="font-bold text-[8pt] text-black">Kế toán trưởng</div>
                            <div className="text-[6.5pt] italic text-gray-600">(Ký, họ tên)</div>
                          </div>
                          <div className="text-gray-400 text-[7pt] pt-8">....................</div>
                        </div>
                      </div>
                    ) : signatureStyle === 'two_blocks' ? (
                      /* 2 Blocks Signature Mode (Default) */
                      <div
                        className={`grid grid-cols-2 gap-4 text-center border-t border-gray-400 pt-1 ${
                          paperSize === 'A5' ? 'text-[7.5pt]' : 'text-[8.5pt]'
                        }`}
                      >
                        {/* 1. Khách hàng / Người nhận */}
                        <div className="flex flex-col items-center justify-between min-h-[70px]">
                          <div>
                            <div className="font-bold text-black">
                              {docType === 'goods_receipt'
                                ? 'Người giao hàng'
                                : docType === 'asset_handover'
                                ? 'Người nhận bàn giao (Cán bộ sử dụng)'
                                : docType === 'asset_transfer'
                                ? 'Thủ kho tiếp nhận (Kho nhận)'
                                : docType === 'stock_disposal'
                                ? 'Trưởng ban / Hội đồng tiêu hủy'
                                : docType === 'liquidation_receipt'
                                ? 'Khách mua thanh lý'
                                : 'Khách hàng / Người nhận'}
                            </div>
                            <div className="text-[7pt] text-gray-600 italic">(Ký và ghi rõ họ tên)</div>
                          </div>
                          <div className="font-bold text-black text-[8pt] pt-8">
                            {recipientName || customerName}
                          </div>
                        </div>

                        {/* 2. Người lập phiếu / Thủ kho */}
                        <div className="flex flex-col items-center justify-between min-h-[70px]">
                          <div>
                            <div className="font-bold text-black">
                              {docType === 'asset_handover'
                                ? 'Đại diện bên giao / Quản lý tài sản'
                                : docType === 'asset_transfer'
                                ? 'Thủ kho xuất / Người vận chuyển'
                                : docType === 'stock_disposal'
                                ? 'Thủ kho bảo quản / Người lập biên bản'
                                : docType === 'liquidation_receipt'
                                ? 'Thủ quỹ / Kế toán thu tiền'
                                : 'Người lập phiếu'}
                            </div>
                            <div className="text-[7pt] text-gray-600 italic">(Ký và ghi rõ họ tên)</div>
                          </div>
                          <div className="font-bold text-black text-[8pt] pt-8">
                            {creator}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* 5 Blocks Signature Mode */
                      <div
                        className={`grid grid-cols-5 gap-1 text-center border-t border-gray-400 pt-1 ${
                          paperSize === 'A5' ? 'text-[6.5pt]' : 'text-[7.5pt]'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-between min-h-[65px]">
                          <div>
                            <div className="font-bold">Người nhận hàng</div>
                            <div className="text-[6pt] italic text-gray-600">(Ký, họ tên)</div>
                          </div>
                          <div className="text-gray-400 text-[6.5pt] pt-6">................</div>
                        </div>
                        <div className="flex flex-col items-center justify-between min-h-[65px]">
                          <div>
                            <div className="font-bold">Người giao hàng</div>
                            <div className="text-[6pt] italic text-gray-600">(Ký, họ tên)</div>
                          </div>
                          <div className="text-gray-400 text-[6.5pt] pt-6">................</div>
                        </div>
                        <div className="flex flex-col items-center justify-between min-h-[65px]">
                          <div>
                            <div className="font-bold">Thủ kho</div>
                            <div className="text-[6pt] italic text-gray-600">(Ký, họ tên)</div>
                          </div>
                          <div className="text-gray-400 text-[6.5pt] pt-6">................</div>
                        </div>
                        <div className="flex flex-col items-center justify-between min-h-[65px]">
                          <div>
                            <div className="font-bold">Người lập</div>
                            <div className="text-[6pt] italic text-gray-600">(Ký, họ tên)</div>
                          </div>
                          <div className="font-bold text-black text-[7pt] pt-6">{creator}</div>
                        </div>
                        <div className="flex flex-col items-center justify-between min-h-[65px]">
                          <div>
                            <div className="font-bold">Giám đốc</div>
                            <div className="text-[6pt] italic text-gray-600">(Ký, đóng dấu)</div>
                          </div>
                          <div className="font-bold text-blue-900 text-[7pt] pt-6">Phạm Gia Phúc</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* =========================================================================
                   Thermal Receipt Roll Layout (K80 80mm / K58 58mm)
                   ========================================================================= */
                <div className={`w-full text-black ${paperSize === 'K58' ? 'text-[7.5pt]' : 'text-[8.5pt]'} font-mono leading-tight space-y-2`}>
                  <div className="text-center pb-1.5 border-b border-dashed border-black">
                    <div className={`font-bold ${paperSize === 'K58' ? 'text-[9.5pt]' : 'text-[11pt]'} uppercase`}>{brandTitle}</div>
                    <div className={`${paperSize === 'K58' ? 'text-[6.5pt]' : 'text-[7.5pt]'} text-gray-700`}>{companyName}</div>
                    <div className={`${paperSize === 'K58' ? 'text-[6.5pt]' : 'text-[7.5pt]'} text-gray-700`}>{companyAddress}</div>
                    <div className={`${paperSize === 'K58' ? 'text-[7pt]' : 'text-[8pt]'} font-bold`}>Hotline: {companyPhone}</div>
                  </div>

                  <div className="text-center py-0.5">
                    <div className={`font-bold ${paperSize === 'K58' ? 'text-[9.5pt]' : 'text-[11pt]'} uppercase tracking-wider`}>{getDocTitle()}</div>
                    <div className={`${paperSize === 'K58' ? 'text-[6.5pt]' : 'text-[7.5pt]'} text-gray-600`}>{docDateStr}</div>
                    <div className={`${paperSize === 'K58' ? 'text-[7.5pt]' : 'text-[8pt]'} font-bold`}>Số: {docNumber}</div>
                  </div>

                  <div className={`border-b border-dashed border-black pb-1.5 space-y-0.5 ${paperSize === 'K58' ? 'text-[7pt]' : 'text-[8pt]'}`}>
                    <div>
                      <strong>Khách hàng:</strong> {customerName}
                    </div>
                    <div>
                      <strong>Điện thoại:</strong> {customerPhone}
                    </div>
                    <div>
                      <strong>Địa chỉ:</strong> {customerAddress}
                    </div>
                    {explanationNote && (
                      <div>
                        <strong>Diễn giải:</strong> {explanationNote}
                      </div>
                    )}
                    <div>
                      <strong>Thu ngân / Người lập:</strong> {creator}
                    </div>
                  </div>

                  {/* Thermal Items: 2-Line Optimized Layout for K58 & Compact Table for K80 */}
                  {paperSize === 'K58' ? (
                    /* K58 2-Line Compressed Item Rows */
                    <div className="border-b border-dashed border-black pb-1.5 space-y-1.5">
                      <div className="text-[7pt] font-bold text-gray-500 uppercase border-b border-black pb-0.5 flex justify-between">
                        <span>Tên hàng & Đơn giá</span>
                        <span>Thành tiền</span>
                      </div>
                      {itemsList.map((it, idx) => (
                        <div key={idx} className="border-b border-dotted border-gray-300 pb-1 text-[7.5pt]">
                          <div className="font-bold text-black font-sans leading-tight">
                            {idx + 1}. {it.productName}
                          </div>
                          <div className="flex justify-between items-center text-[7pt] text-gray-700 mt-0.5">
                            <span>{it.quantity} {it.unit || 'Cái'} x {formatVND(it.unitPrice).replace(' ₫', '')}</span>
                            <span className="font-bold font-mono text-black">
                              {formatVND(it.total || it.quantity * it.unitPrice)}
                            </span>
                          </div>
                          {it.warranty && (
                            <div className="text-[6.5pt] text-gray-500 italic">BH: {it.warranty}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* K80 Standard 3-Column Table */
                    <div className="border-b border-dashed border-black pb-1.5">
                      <table className="w-full text-left text-[8pt]">
                        <thead>
                          <tr className="border-b border-black font-bold">
                            <th className="py-1">Mặt hàng</th>
                            <th className="py-1 text-center w-8">SL</th>
                            <th className="py-1 text-right w-16">T.Tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {itemsList.map((it, idx) => (
                            <tr key={idx} className="border-b border-gray-200">
                              <td className="py-1 pr-1 font-sans">
                                <div className="font-semibold text-black">{it.productName}</div>
                                <div className="text-[7pt] text-gray-600">
                                  {it.quantity} x {formatVND(it.unitPrice)}
                                </div>
                              </td>
                              <td className="py-1 text-center font-bold">{it.quantity}</td>
                              <td className="py-1 text-right font-bold font-mono">
                                {formatVND(it.total || it.quantity * it.unitPrice).replace(' ₫', '')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Thermal Totals */}
                  <div className={`space-y-1 ${paperSize === 'K58' ? 'text-[7.5pt]' : 'text-[8.5pt]'}`}>
                    <div className="flex justify-between">
                      <span>Cộng tiền hàng:</span>
                      <strong className="font-mono">{formatVND(calculatedSubtotal)}</strong>
                    </div>
                    {taxRate > 0 && (
                      <div className="flex justify-between">
                        <span>VAT ({taxRate}%):</span>
                        <strong className="font-mono">{formatVND(calculatedTaxAmount)}</strong>
                      </div>
                    )}
                    <div className={`flex justify-between ${paperSize === 'K58' ? 'text-[8.5pt]' : 'text-[10pt]'} font-black border-t border-black pt-1`}>
                      <span>TỔNG CỘNG:</span>
                      <span className="font-mono text-black">{formatVND(calculatedGrandTotal)}</span>
                    </div>
                    <div className={`${paperSize === 'K58' ? 'text-[6.5pt]' : 'text-[7.5pt]'} italic text-gray-700 pt-0.5`}>
                      Bằng chữ: {amountInWords}
                    </div>
                  </div>

                  {/* Barcode & QR Code Section */}
                  {(showBarcode || showDocQr || (showVietQR && qrUrl)) && (
                    <div className="pt-2 border-t border-dashed border-black">
                      <SlipBarcodeQR
                        docCode={docNumber}
                        docType={docType}
                        date={docDateStr}
                        customerName={customerName}
                        totalAmount={calculatedGrandTotal}
                        showBarcode={showBarcode}
                        showQr={showDocQr || showVietQR}
                        paperSize={paperSize}
                        vietQrUrl={qrUrl}
                        qrPayloadMode={showVietQR ? 'vietqr' : 'erp_smart'}
                      />
                    </div>
                  )}

                  <div className={`text-center pt-1.5 border-t border-dashed border-black ${paperSize === 'K58' ? 'text-[6.5pt]' : 'text-[7.5pt]'} text-gray-600 italic`}>
                    Cảm ơn Quý khách! Hẹn gặp lại!
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Quick Status Bar */}
        <div className="no-print bg-slate-950 border-t border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2 shrink-0">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
              <Check className="w-4 h-4" />
              <span>Sẵn sàng in chuẩn Khổ {paperSize} {orientation === 'portrait' ? 'Dọc' : 'Ngang'}</span>
            </span>
            <span className="text-slate-600">|</span>
            <span>Mẫu: <strong className="text-white">{getDocTitle()}</strong></span>
            <span>Dòng kẻ: <strong className="text-white">{itemsList.length} + {emptyRowsCount} trống</strong></span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handlePrint}
              className="font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Ngay (Ctrl+P)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
