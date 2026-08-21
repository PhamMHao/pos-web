export interface PrinterProfile {
  id: string;
  name: string;
  type: 'thermal_receipt' | 'office_laser' | 'barcode_label' | 'virtual_pdf';
  connection: 'USB' | 'LAN/IP' | 'Bluetooth' | 'Virtual';
  ipAddress?: string;
  port?: number;
  defaultPaperSize: 'A4' | 'A5' | 'K80' | 'K58' | 'custom';
  defaultOrientation: 'portrait' | 'landscape';
  isDefault: boolean;
  status: 'online' | 'offline';
  description?: string;
}

export const DEFAULT_PRINTER_PROFILES: PrinterProfile[] = [
  {
    id: 'ptr-k80-usb',
    name: 'Máy In Hóa Đơn Nhiệt Xprinter XP-Q800 (K80)',
    type: 'thermal_receipt',
    connection: 'USB',
    defaultPaperSize: 'K80',
    defaultOrientation: 'portrait',
    isDefault: true,
    status: 'online',
    description: 'Cắt giấy tự động, khổ bill 80mm, in mã VietQR sắc nét',
  },
  {
    id: 'ptr-canon-a4',
    name: 'Máy In Văn Phòng Canon LBP 2900 / 3300 (A4/A5)',
    type: 'office_laser',
    connection: 'USB',
    defaultPaperSize: 'A4',
    defaultOrientation: 'portrait',
    isDefault: false,
    status: 'online',
    description: 'In laser sắc nét, hóa đơn kẻ ô chuẩn Excel, báo giá, hợp đồng',
  },
  {
    id: 'ptr-lan-k80',
    name: 'Máy In Bill Mạng LAN / WiFi Quầy Thu Ngân (K80)',
    type: 'thermal_receipt',
    connection: 'LAN/IP',
    ipAddress: '192.168.1.200',
    port: 9100,
    defaultPaperSize: 'K80',
    defaultOrientation: 'portrait',
    isDefault: false,
    status: 'online',
    description: 'In hóa đơn từ xa qua mạng nội bộ hoặc điện thoại',
  },
  {
    id: 'ptr-pdf-virtual',
    name: 'Máy In Ảo Xuất File PDF (Save as PDF / Microsoft PDF)',
    type: 'virtual_pdf',
    connection: 'Virtual',
    defaultPaperSize: 'A4',
    defaultOrientation: 'portrait',
    isDefault: false,
    status: 'online',
    description: 'Xuất file PDF chất lượng cao gửi Zalo, Email cho khách hàng',
  },
  {
    id: 'ptr-barcode-label',
    name: 'Máy In Tem Mã Vạch Xprinter XP-350B / Godex (Decal)',
    type: 'barcode_label',
    connection: 'USB',
    defaultPaperSize: 'custom',
    defaultOrientation: 'portrait',
    isDefault: false,
    status: 'online',
    description: 'In tem decal nhiệt dán sản phẩm, kệ hàng 30x20mm, 50x30mm',
  },
];

const STORAGE_KEY = 'gp_erp_printer_list';
const ACTIVE_PRINTER_KEY = 'gp_erp_active_printer_id';

export function getSavedPrinters(): PrinterProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRINTER_PROFILES));
      return DEFAULT_PRINTER_PROFILES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PRINTER_PROFILES;
  } catch (e) {
    return DEFAULT_PRINTER_PROFILES;
  }
}

export function savePrinters(printers: PrinterProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(printers));
    window.dispatchEvent(new CustomEvent('printers-updated', { detail: printers }));
  } catch (e) {
    console.warn('Error saving printers to localStorage:', e);
  }
}

export function getActivePrinterId(): string {
  try {
    const active = localStorage.getItem(ACTIVE_PRINTER_KEY);
    if (active) return active;
    const list = getSavedPrinters();
    const defaultPtr = list.find((p) => p.isDefault) || list[0];
    return defaultPtr ? defaultPtr.id : 'ptr-k80-usb';
  } catch (e) {
    return 'ptr-k80-usb';
  }
}

export function setActivePrinterId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_PRINTER_KEY, id);
    window.dispatchEvent(new CustomEvent('active-printer-changed', { detail: { id } }));
  } catch (e) {
    console.warn('Error setting active printer id:', e);
  }
}

export function getActivePrinter(): PrinterProfile {
  const list = getSavedPrinters();
  const activeId = getActivePrinterId();
  return list.find((p) => p.id === activeId) || list.find((p) => p.isDefault) || list[0] || DEFAULT_PRINTER_PROFILES[0];
}
