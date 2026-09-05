import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Store,
  CreditCard,
  QrCode,
  Save,
  CheckCircle2,
  Download,
  RotateCcw,
  Percent,
  FileSpreadsheet,
  AlertTriangle,
  Sun,
  Moon,
  Palette,
  Sparkles,
  Printer,
  FileText,
  Building2,
  FileCheck2,
  Upload,
  Image as ImageIcon,
  ShieldCheck,
  UserCheck,
  Briefcase,
  HelpCircle,
  Barcode,
  Scan,
  Volume2,
  Tv,
  Cpu,
  Usb,
  Wifi,
  HardDrive,
  Check,
  Layers,
  Database,
  Lock,
  Trash2,
  RefreshCw,
  FileJson,
  FolderArchive,
  X,
  Edit3,
  Search,
  Sliders,
  FileEdit,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { StoreSettings, PrintDocType, PrintDocConfig } from '../../types';
import { generateVietQRUrl, POPULAR_VIETNAMESE_BANKS } from '../../utils/vietqr';
import { GiaPhucLogo, GIA_PHUC_LOGO_SVG_DATA_URI } from '../common/GiaPhucLogo';
import { PrintInvoiceModal } from '../common/PrintInvoiceModal';
import { PrintTemplateEditorModal } from './PrintTemplateEditorModal';
import { sounds } from '../../utils/soundEffects';
import { settingsApi } from '../../features/settings/api/settingsApi';
import { LabelPrintSettingsTab } from './LabelPrintSettingsTab';
import { useMasterData } from '../../core/contexts/MasterDataContext';

interface SettingsViewProps {
  settings: StoreSettings;
  onSaveSettings: (settings: StoreSettings) => void;
  onResetData: () => void;
  onExportAllData: () => void;
  onRefreshData?: () => void;
}

const DOC_CATEGORIES: Record<
  string,
  { label: string; types: PrintDocType[] }
> = {
  all: {
    label: 'Tất Cả Biểu Mẫu (23)',
    types: [
      'sales_invoice',
      'sales_order',
      'goods_receipt',
      'delivery_note',
      'quote',
      'payment_receipt',
      'warranty_receipt',
      'einvoice_vat',
      'exchange_return',
      'warranty_intake',
      'warranty_return',
      'delivery_dispatch',
      'shipping_label',
      'goods_delivery_record',
      'sales_return',
      'goods_handover_exchange',
      'goods_return_invoice_recall',
      'work_completion_handover',
      'goods_exchange_invoice_replace',
      'asset_handover',
      'asset_transfer',
      'stock_disposal',
      'liquidation_receipt',
    ],
  },
  legal: {
    label: 'Biên Bản & Nghiệm Thu Pháp Lý (4)',
    types: [
      'goods_handover_exchange',
      'goods_return_invoice_recall',
      'work_completion_handover',
      'goods_exchange_invoice_replace',
    ],
  },
  sales: {
    label: 'Bán Hàng & Đơn Hàng',
    types: ['sales_invoice', 'sales_order', 'delivery_note', 'quote', 'payment_receipt', 'warranty_receipt', 'einvoice_vat'],
  },
  inventory: {
    label: 'Kho Hàng & Đổi Trả',
    types: [
      'goods_receipt',
      'exchange_return',
      'goods_handover_exchange',
      'goods_return_invoice_recall',
      'goods_exchange_invoice_replace',
      'delivery_dispatch',
      'shipping_label',
      'goods_delivery_record',
      'sales_return',
    ],
  },
  warranty: {
    label: 'Bảo Hành & Kỹ Thuật',
    types: ['warranty_intake', 'warranty_return', 'work_completion_handover'],
  },
  assets: {
    label: 'Tài Sản & Tiêu Hủy',
    types: ['asset_handover', 'asset_transfer', 'stock_disposal', 'liquidation_receipt'],
  },
};

const DOC_TYPE_LABELS: Record<PrintDocType, { label: string; desc: string; defaultSize: 'A4' | 'A5' | 'K80'; defaultOrientation: 'portrait' | 'landscape' }> = {
  sales_order: {
    label: '1. Đơn Đặt Hàng',
    desc: 'Mẫu đặt hàng linh kiện, máy tính từ khách & đại lý (Ảnh 1)',
    defaultSize: 'A4',
    defaultOrientation: 'portrait',
  },
  goods_receipt: {
    label: '2. Phiếu Nhập Kho',
    desc: 'Mẫu nhập kho nhà cung cấp & kiểm đếm vật tư (Ảnh 2)',
    defaultSize: 'A4',
    defaultOrientation: 'portrait',
  },
  sales_invoice: {
    label: '3. Hóa Đơn Bán Hàng',
    desc: 'Hóa đơn bán lẻ & xuất kho giao khách Gia Phúc Computer (Ảnh 3)',
    defaultSize: 'A5',
    defaultOrientation: 'portrait',
  },
  exchange_return: {
    label: '4. Phiếu Đổi Hàng & Xuất Nhập Kho (Mẫu 01/02-VT / Mẫu 01/02-TT)',
    desc: 'Mẫu đổi hàng kiêm nhập xuất kho vật tư, bàn giao thiết bị & quyết toán thu/chi tiền chênh lệch',
    defaultSize: 'A4',
    defaultOrientation: 'portrait',
  },
  warranty_intake: {
    label: '5. Phiếu Nhận Hàng Bảo Hành',
    desc: 'Biên nhận tiếp nhận thiết bị lỗi, ghi chú tình trạng và hẹn trả (Ảnh 5)',
    defaultSize: 'A5',
    defaultOrientation: 'portrait',
  },
  warranty_return: {
    label: '6. Phiếu Trả Hàng Bảo Hành',
    desc: 'Biên bản bàn giao trả thiết bị đã sửa chữa / đổi mới (Ảnh 6)',
    defaultSize: 'A5',
    defaultOrientation: 'portrait',
  },
  delivery_note: {
    label: '7. Phiếu Xuất Kho Giao Khách',
    desc: 'Phiếu xuất kho kiêm giao hàng chuyển phát & gửi nhà xe',
    defaultSize: 'A5',
    defaultOrientation: 'portrait',
  },
  warranty_receipt: {
    label: '8. Phiếu Bán Hàng & Bảo Hành',
    desc: 'Phiếu bán hàng kiêm cam kết thời hạn bảo hành từng linh kiện',
    defaultSize: 'A4',
    defaultOrientation: 'portrait',
  },
  payment_receipt: {
    label: '9. Phiếu Thu Tiền / Biên Nhận',
    desc: 'Phiếu thu tiền cọc, thanh toán công nợ và biên lai kế toán',
    defaultSize: 'A5',
    defaultOrientation: 'portrait',
  },
  einvoice_vat: {
    label: '10. Hóa Đơn Giá Trị Gia Tăng (TT78)',
    desc: 'Hóa đơn điện tử có mã CQT theo Thông tư 78 / NĐ 123',
    defaultSize: 'A4',
    defaultOrientation: 'portrait',
  },
  quote: {
    label: '11. Bảng Báo Giá B2B',
    desc: 'Mẫu báo giá sản phẩm & dịch vụ cho khách hàng',
    defaultSize: 'A4',
    defaultOrientation: 'portrait',
  },
  asset_handover: {
    label: '12. Phiếu Bàn Giao & Cung Cấp Tài Sản',
    desc: 'Biên bản bàn giao thiết bị sử dụng cho nhân viên / phòng ban',
    defaultSize: 'A4',
    defaultOrientation: 'portrait',
  },
  asset_transfer: {
    label: '13. Phiếu Điều Chuyển Tài Sản / Kho',
    desc: 'Điều chuyển vật tư thiết bị giữa các kho chi nhánh',
    defaultSize: 'A4',
    defaultOrientation: 'portrait',
  },
  stock_disposal: {
    label: '14. Biên Bản Tiêu Hủy Vật Tư & Tài Sản Hư Hỏng',
    desc: 'Kiểm kê và tiêu hủy linh kiện hỏng, hết hạn',
    defaultSize: 'A4',
    defaultOrientation: 'portrait',
  },
  liquidation_receipt: {
    label: '15. Phiếu Thu Tiền Thanh Lý (Thu Hồi Vốn)',
    desc: 'Thu tiền bán thanh lý thiết bị cũ thu hồi vốn',
    defaultSize: 'A4',
    defaultOrientation: 'portrait',
  },
  delivery_dispatch: {
    label: '16. Phiếu Điều Phối Giao Hàng & Thu COD',
    desc: 'Phiếu giao hàng cho đơn vị vận chuyển / xe ôm công nghệ / chành xe kèm thu tiền COD',
    defaultSize: 'A5',
    defaultOrientation: 'portrait',
  },
  shipping_label: {
    label: '17. Tem Vận Đơn Dán Kiện Hàng (K80 / A5)',
    desc: 'Nhãn dán bưu kiện vận chuyển có mã vạch vận đơn và mã QR tra cứu hành trình',
    defaultSize: 'K80',
    defaultOrientation: 'portrait',
  },
  goods_delivery_record: {
    label: '18. Biên Bản Giao Nhận Hàng Hóa (Ảnh 1)',
    desc: 'Biên bản giao nhận hàng hóa chuẩn pháp lý Bên A & Bên B kèm Serial No và cam kết mới 100%',
    defaultSize: 'A4',
    defaultOrientation: 'portrait',
  },
  sales_return: {
    label: '19. Phiếu Trả Hàng & Nhập Kho Thu Hồi (NĐ 123 / Mẫu 02-VT / Mẫu 02-TT)',
    desc: 'Mẫu trả lại hàng, nhập kho thu hồi linh kiện, hoàn tiền & định khoản kế toán theo NĐ 123 / TT 200',
    defaultSize: 'A4',
    defaultOrientation: 'portrait',
  },
  goods_handover_exchange: {
    label: '20. Biên Bản Bàn Giao - Trao Đổi Hàng (Thu Cũ Đổi Mới)',
    desc: 'Mẫu bàn giao & trao đổi trade-in máy cũ đổi máy mới kèm tính khấu hao vật tư 30% (Theo Ảnh 1)',
    defaultSize: 'A4',
    defaultOrientation: 'portrait',
  },
  goods_return_invoice_recall: {
    label: '21. Biên Bản Trả Hàng Và Thu Hồi Hoá Đơn (NĐ 123)',
    desc: 'Mẫu trả lại hàng kèm thu hồi hủy hóa đơn điện tử theo NĐ 123/2020 & TT 78/2021 (Theo Ảnh 2)',
    defaultSize: 'A4',
    defaultOrientation: 'portrait',
  },
  work_completion_handover: {
    label: '22. Biên Bản Xác Nhận Hoàn Thành Công Việc & Nghiệm Thu',
    desc: 'Nghiệm thu dịch vụ kỹ thuật, sửa chữa linh kiện máy in/PC & bàn giao hoạt động tốt (Theo Ảnh 3)',
    defaultSize: 'A4',
    defaultOrientation: 'portrait',
  },
  goods_exchange_invoice_replace: {
    label: '23. Biên Bản Đổi Hàng Và Thay Đổi Hoá Đơn',
    desc: 'Bảng kép hàng cũ cần đổi vs hàng mới đổi, thu hồi hóa đơn cũ & xuất hóa đơn thay thế 100% (Theo Ảnh 4)',
    defaultSize: 'A4',
    defaultOrientation: 'portrait',
  },
};

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetData,
  onExportAllData,
  onRefreshData,
}) => {
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const { refreshMasterDataFromDb } = useMasterData();
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'company' | 'print' | 'label_print' | 'hardware' | 'einvoice' | 'contract' | 'bank' | 'theme' | 'sqlserver'
  >('company');

  // Test Print Modal State
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testDocType, setTestDocType] = useState<PrintDocType>('sales_invoice');

  // Print Template Editor Modal State
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [editingDocType, setEditingDocType] = useState<PrintDocType>('sales_invoice');
  const [docFilterCategory, setDocFilterCategory] = useState<string>('all');
  const [docSearchTerm, setDocSearchTerm] = useState<string>('');

  // Test Barcode Scanner State
  const [testBarcodeScanInput, setTestBarcodeScanInput] = useState('');
  const [testScanHistory, setTestScanHistory] = useState<
    Array<{ code: string; length: number; time: string; intervalMs: number }>
  >([]);
  const lastKeyStrokeTimeRef = useRef<number>(0);
  const strokeCountRef = useRef<number>(0);
  const scanStartTimeRef = useRef<number>(0);

  // SQL Server Config State
  const [dbServerName, setDbServerName] = useState('.');
  const [dbAuthType, setDbAuthType] = useState<'windows' | 'sql'>('windows');
  const [dbUsername, setDbUsername] = useState('sa');
  const [dbPassword, setDbPassword] = useState('');
  const [dbName, setDbName] = useState('POS_WEB');
  const [dbCustomName, setDbCustomName] = useState('');
  const [isCustomDb, setIsCustomDb] = useState(false);
  const [availableDatabases, setAvailableDatabases] = useState<string[]>([]);
  const [dbServerVersion, setDbServerVersion] = useState<string | null>(null);
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSavingDb, setIsSavingDb] = useState(false);
  const [dbSaveResult, setDbSaveResult] = useState<{ success: boolean; message: string } | null>(null);

  // Data Management State (Backup, Restore, Wipe Data)
  const [isExportingBackup, setIsExportingBackup] = useState(false);
  const [backupDownloadMsg, setBackupDownloadMsg] = useState<{ success: boolean; message: string } | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoreFileStats, setRestoreFileStats] = useState<{ name: string; size: string; createdAt?: string; totalRecords?: number } | null>(null);
  const [restoreResult, setRestoreResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [wipeConfirmInput, setWipeConfirmInput] = useState('');
  const [isWiping, setIsWiping] = useState(false);
  const [wipeResult, setWipeResult] = useState<{ success: boolean; message: string } | null>(null);
  const restoreFileInputRef = useRef<HTMLInputElement | null>(null);

  // Load actual active DB config from server on mount
  useEffect(() => {
    fetch('/api/setup/db-status')
      .then((res) => res.json())
      .then((data) => {
        if (data.currentDb) {
          setDbName(data.currentDb);
        }
        if (data.currentServer) {
          setDbServerName(data.currentServer);
        }
        if (data.currentAuthType) {
          setDbAuthType(data.currentAuthType);
        }
        if (data.currentUsername) {
          setDbUsername(data.currentUsername);
        }
        if (data.databases && data.databases.length > 0) {
          setAvailableDatabases(data.databases);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setFormData({ ...settings });
  }, [settings]);

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    const updated = { ...formData, theme: newTheme };
    setFormData(updated);
    onSaveSettings(updated);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newLogo = event.target.result as string;
          const updated = { ...formData, logoUrl: newLogo };
          setFormData(updated);
          onSaveSettings(updated);
          setSavedSuccess(true);
          setTimeout(() => setSavedSuccess(false), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Helper for per-doc-type configuration update
  const handleUpdateDocConfig = (
    type: PrintDocType,
    field: 'paperSize' | 'orientation' | 'emptyRowsCount' | 'signatureStyle' | 'showVietQR',
    value: any
  ) => {
    const currentDocConfig = formData.printDocConfigs?.[type] || {
      paperSize: DOC_TYPE_LABELS[type].defaultSize,
      orientation: DOC_TYPE_LABELS[type].defaultOrientation,
      emptyRowsCount: DOC_TYPE_LABELS[type].defaultSize === 'A5' ? 2 : 4,
      signatureStyle: 'two_blocks' as const,
      showVietQR: true,
    };

    const updatedConfigs = {
      ...(formData.printDocConfigs || {}),
      [type]: {
        ...currentDocConfig,
        [field]: value,
      },
    };

    setFormData({
      ...formData,
      printDocConfigs: updatedConfigs,
    });
  };

  // Open the detailed Print Template Editor Modal for a specific form
  const handleOpenEditor = (type: PrintDocType) => {
    setEditingDocType(type);
    setEditorModalOpen(true);
  };

  // Save the full configuration from Print Template Editor Modal
  const handleSaveDocConfigFromEditor = (type: PrintDocType, updatedConfig: PrintDocConfig) => {
    const updatedConfigs = {
      ...(formData.printDocConfigs || {}),
      [type]: updatedConfig,
    };
    const newFormData = {
      ...formData,
      printDocConfigs: updatedConfigs,
    };
    setFormData(newFormData);
    onSaveSettings(newFormData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Handle hardware barcode test typing / laser scan
  const handleTestBarcodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTestBarcodeScanInput(val);

    const now = Date.now();
    if (strokeCountRef.current === 0) {
      scanStartTimeRef.current = now;
    }
    strokeCountRef.current++;
    lastKeyStrokeTimeRef.current = now;
  };

  const handleTestBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const code = testBarcodeScanInput.trim();
      if (code) {
        const totalDuration = Date.now() - scanStartTimeRef.current;
        if (formData.scannerBeepSound !== false) {
          sounds.playBarcodeBeep();
        }
        setTestScanHistory((prev) => [
          {
            code,
            length: code.length,
            time: new Date().toLocaleTimeString(),
            intervalMs: Math.max(1, totalDuration),
          },
          ...prev.slice(0, 7),
        ]);
        setTestBarcodeScanInput('');
        strokeCountRef.current = 0;
      }
    }
  };

  const currentTheme = formData.theme || 'light';

  const handleTestSqlDb = async () => {
    if (!dbServerName.trim()) {
      setDbTestResult({ success: false, message: 'Vui lòng nhập Tên máy chủ (Server Name)!' });
      return;
    }
    if (dbAuthType === 'sql' && !dbUsername.trim()) {
      setDbTestResult({ success: false, message: 'Vui lòng nhập Tên đăng nhập khi chọn SQL Server Authentication!' });
      return;
    }
    setIsTestingDb(true);
    setDbTestResult(null);
    setDbSaveResult(null);
    try {
      const res = await fetch('/api/setup/test-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          server: dbServerName.trim(),
          authType: dbAuthType,
          username: dbAuthType === 'windows' ? undefined : dbUsername.trim(),
          password: dbAuthType === 'windows' ? undefined : dbPassword,
          database: isCustomDb ? dbCustomName.trim() : dbName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDbTestResult({ success: true, message: data.message || 'Kết nối máy chủ SQL Server thành công!' });
        setDbServerVersion(data.version || null);
        if (data.databases && data.databases.length > 0) {
          setAvailableDatabases(data.databases);
          // Only switch dbName if current dbName is empty or not in databases list and not custom
          if (!isCustomDb && !data.databases.includes(dbName)) {
            if (data.currentSelected && data.databases.includes(data.currentSelected)) {
              setDbName(data.currentSelected);
            } else {
              setDbName(data.databases[0]);
            }
          }
        }
      } else {
        setDbTestResult({ success: false, message: data.message || 'Không thể kết nối SQL Server!' });
      }
    } catch (e: any) {
      setDbTestResult({ success: false, message: `Lỗi: ${e.message}` });
    } finally {
      setIsTestingDb(false);
    }
  };

  const handleSaveSqlDb = async () => {
    const finalDb = isCustomDb ? dbCustomName.trim() : dbName;
    if (!dbServerName.trim() || !finalDb) {
      setDbSaveResult({ success: false, message: 'Vui lòng điền đầy đủ Tên máy chủ và Database!' });
      return;
    }
    if (dbAuthType === 'sql' && !dbUsername.trim()) {
      setDbSaveResult({ success: false, message: 'Vui lòng nhập Tên đăng nhập khi chọn SQL Server Authentication!' });
      return;
    }
    setIsSavingDb(true);
    setDbSaveResult(null);
    try {
      const res = await fetch('/api/setup/save-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          server: dbServerName.trim(),
          authType: dbAuthType,
          username: dbAuthType === 'windows' ? undefined : dbUsername.trim(),
          password: dbAuthType === 'windows' ? undefined : dbPassword,
          database: finalDb,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDbSaveResult({ success: true, message: data.message });
        setDbName(finalDb);
        setIsCustomDb(false);
        setDbCustomName('');
        if (!availableDatabases.includes(finalDb)) {
          setAvailableDatabases((prev) => [...prev, finalDb].sort());
        }
      } else {
        setDbSaveResult({ success: false, message: data.message || 'Lỗi lưu cấu hình!' });
      }
    } catch (e: any) {
      setDbSaveResult({ success: false, message: `Lỗi: ${e.message}` });
    } finally {
      setIsSavingDb(false);
    }
  };

  const handleResetSqlDb = () => {
    setDbServerName('.');
    setDbAuthType('windows');
    setDbUsername('sa');
    setDbPassword('');
    setDbName('GPERP_Enterprise');
    setDbCustomName('');
    setIsCustomDb(false);
    setDbTestResult(null);
    setDbSaveResult(null);
    setDbServerVersion(null);
  };

  // Backup Full DB to JSON
  const handleBackupDownload = async () => {
    setIsExportingBackup(true);
    setBackupDownloadMsg(null);
    try {
      const backupData = await settingsApi.backupDatabase();
      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const now = new Date();
      const dateTag = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
      a.download = `GP_ERP_Backup_${dateTag}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setBackupDownloadMsg({ success: true, message: 'Đã xuất và tải file sao lưu CSDL thành công!' });
      setTimeout(() => setBackupDownloadMsg(null), 5000);
    } catch (err: any) {
      setBackupDownloadMsg({ success: false, message: `Lỗi sao lưu: ${err.message}` });
    } finally {
      setIsExportingBackup(false);
    }
  };

  // Restore file selection
  const handleRestoreFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRestoreFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const total = parsed.totalRecords || Object.values(parsed.tables || {}).reduce((acc: number, arr: any) => acc + (Array.isArray(arr) ? arr.length : 0), 0);
        setRestoreFileStats({
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          createdAt: parsed.createdAt ? new Date(parsed.createdAt).toLocaleString('vi-VN') : 'Không rõ',
          totalRecords: total,
        });
        setRestoreResult(null);
      } catch {
        setRestoreResult({ success: false, message: 'File không đúng định dạng JSON sao lưu của GP-ERP.' });
      }
    };
    reader.readAsText(file);
  };

  // Execute restore
  const handleExecuteRestore = async () => {
    if (!restoreFile) return;
    setIsRestoring(true);
    setRestoreResult(null);
    try {
      const text = await restoreFile.text();
      const parsed = JSON.parse(text);
      const res = await settingsApi.restoreDatabase(parsed);
      setRestoreResult({ success: true, message: res.message || 'Khôi phục CSDL thành công!' });
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setRestoreResult({ success: false, message: `Lỗi khôi phục: ${err.message}` });
    } finally {
      setIsRestoring(false);
    }
  };

  // Execute wipe all data
  const handleExecuteWipeData = async () => {
    if (wipeConfirmInput.trim() !== 'XOA_DU_LIEU') return;
    setIsWiping(true);
    setWipeResult(null);
    try {
      const res = await settingsApi.wipeAllData('XOA_DU_LIEU');
      setWipeResult({ success: true, message: res.message || 'Đã xóa toàn bộ dữ liệu nghiệp vụ và dữ liệu cơ bản thành công! CSDL đã về trạng thái trống.' });
      onResetData();
      if (onRefreshData) onRefreshData();
      if (refreshMasterDataFromDb) refreshMasterDataFromDb();
      setShowWipeModal(false);
      setWipeConfirmInput('');
    } catch (err: any) {
      setWipeResult({ success: false, message: `Lỗi khi xóa dữ liệu: ${err.message}` });
    } finally {
      setIsWiping(false);
    }
  };

  const previewQrUrl = generateVietQRUrl({
    bankCode: formData.bankCode || 'TCB',
    accountNo: formData.bankAccount || '1903688899901',
    accountName: formData.bankAccountName || formData.brandName || 'GIA PHUC COMPUTER',
    amount: 50000,
    description: 'TEST QR THANH TOAN',
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto overflow-y-auto h-full text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Settings className="w-6 h-6 text-emerald-400" />
            <span>Cài Đặt Hệ Thống, Mẫu In A4/A5 & Phần Cứng</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            Cấu hình mẫu in A4/A5/K80 cho từng loại phiếu, kết nối máy quét mã vạch, máy in hóa đơn và thông tin doanh nghiệp.
          </p>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Đã lưu thành công!</span>
          </div>
        )}
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('company')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'company'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>1. Doanh Nghiệp & Logo</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('print')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'print'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>2. Mẫu In A4 / A5 / K80</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('label_print')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'label_print'
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-600/30'
              : 'bg-slate-900 text-amber-300 hover:text-amber-200 hover:bg-slate-800 border border-amber-900/50'
          }`}
        >
          <Barcode className="w-4 h-4 text-amber-400" />
          <span>3. Mẫu In Tem Mã Vạch & QR</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hardware')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'hardware'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Scan className="w-4 h-4" />
          <span>4. Máy Quét Mã Vạch & Máy In</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('einvoice')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'einvoice'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>5. Xuất Hóa Đơn Điện Tử</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contract')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'contract'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>6. Hợp Đồng Lao Động</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bank')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'bank'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>7. Ngân Hàng & VietQR</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('theme')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'theme'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>8. Giao Diện & Theme</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sqlserver')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'sqlserver'
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-600/30'
              : 'bg-slate-900 text-sky-400 hover:text-sky-200 hover:bg-slate-800 border border-sky-900/60'
          }`}
        >
          <Database className="w-4 h-4 text-sky-400" />
          <span>9. CSDL & Quản Trị Dữ Liệu</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* =========================================================================
            TAB 1: THÔNG TIN DOANH NGHIỆP & LOGO
            ========================================================================= */}
        {activeTab === 'company' && (
          <div className="bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>Thông Tin Pháp Lý Công Ty & Logo Thương Hiệu</span>
              </h3>
              <span className="text-xs text-slate-400">
                Hiển thị trên tất cả Hóa đơn bán hàng, Phiếu giao hàng, Báo giá và HĐLĐ.
              </span>
            </div>

            {/* Logo Customization Card */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-24 h-20 bg-white rounded-xl p-2 border-2 border-blue-500/40 flex items-center justify-center shadow-lg shrink-0">
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt="Logo Cửa Hàng"
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <GiaPhucLogo isPrint={false} size="md" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Logo Thương Hiệu Trên Bản In</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ảnh logo vector hoặc PNG trong suốt để in phiếu sắc nét và chuyên nghiệp.
                  </p>
                  <div className="flex items-center space-x-3 mt-2">
                    <label className="cursor-pointer px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Tải Ảnh Logo Lên</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>

                    {formData.logoUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...formData, logoUrl: '' };
                          setFormData(updated);
                          onSaveSettings(updated);
                          setSavedSuccess(true);
                          setTimeout(() => setSavedSuccess(false), 3000);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Dùng Logo Gốc Gia Phúc
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Company Legal Profile Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  Tên pháp lý công ty (In hoa dòng đầu phiếu):
                </label>
                <input
                  type="text"
                  value={formData.companyLegalName || formData.storeName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      companyLegalName: e.target.value,
                      storeName: e.target.value,
                    })
                  }
                  placeholder="CÔNG TY TNHH MTV TM-DV SỬA CHỮA GIA PHÚC"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tên thương hiệu / Cửa hàng viết tắt:
                </label>
                <input
                  type="text"
                  value={formData.brandName || ''}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  placeholder="GIA PHÚC Computer"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Mã số thuế doanh nghiệp (MST):
                </label>
                <input
                  type="text"
                  value={formData.taxCode || ''}
                  onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                  placeholder="0318999888"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  Địa chỉ trụ sở kinh doanh:
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Đường PA 087, Khu phố An Thuận, Phường Phú An, TP. HCM"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Số điện thoại Hotline / Zalo (Nhiều số cách nhau bằng gạch nối):
                </label>
                <input
                  type="text"
                  value={formData.zaloPhone || formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      zaloPhone: e.target.value,
                      phone: e.target.value,
                    })
                  }
                  placeholder="0985 862 609 - 0914 665 994"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Số Tel / Fax:
                </label>
                <input
                  type="text"
                  value={formData.faxPhone || ''}
                  onChange={(e) => setFormData({ ...formData, faxPhone: e.target.value })}
                  placeholder="(0274) 3579 789"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Địa chỉ Website:
                </label>
                <input
                  type="text"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="www.vitinhgiaphuc.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Email liên hệ chính:
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="hrmgpsoft@gmail.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: CẤU HÌNH MẪU IN PHIẾU A4 / A5 / K80 CHO TỪNG LOẠI PHIẾU
            ========================================================================= */}
        {activeTab === 'print' && (
          <div className="space-y-6">
            {/* Global Print Defaults */}
            <div className="bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-800 space-y-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Printer className="w-4 h-4 text-emerald-400" />
                    <span>Cấu Hình In Chung Toàn Hệ Thống</span>
                  </h3>
                  <span className="text-xs text-slate-400">
                    Áp dụng mặc định cho tất cả biểu mẫu & các máy trạm khác nếu chưa cấu hình riêng.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onSaveSettings(formData);
                    setSavedSuccess(true);
                    setTimeout(() => setSavedSuccess(false), 3000);
                  }}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer shrink-0"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Cấu Hình In Mặc Định</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Khổ giấy in mặc định:
                  </label>
                  <select
                    value={formData.defaultPrintPaperSize || 'A4'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        defaultPrintPaperSize: e.target.value as any,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="A4">Khổ A4 (210 x 297 mm) - Báo cáo & Hóa đơn chuẩn</option>
                    <option value="A5">Khổ A5 (148 x 210 mm) - Phiếu giao hàng vừa tay</option>
                    <option value="K80">Khổ K80 (80 mm) - Giấy in nhiệt cuộn POS</option>
                    <option value="K58">Khổ K58 (58 mm) - Giấy in nhiệt cuộn mini POS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Hướng in mặc định:
                  </label>
                  <select
                    value={formData.defaultPrintOrientation || 'portrait'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        defaultPrintOrientation: e.target.value as any,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="portrait">Dọc (Portrait) - Phổ biến</option>
                    <option value="landscape">Ngang (Landscape) - Bảng nhiều cột</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Vị trí mã mặc định (Barcode / QR):
                  </label>
                  <select
                    value={formData.defaultPrintCodePlacement || 'header'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        defaultPrintCodePlacement: e.target.value as any,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="header">Chỉ đầu trang (Header - Cân đối phiếu)</option>
                    <option value="footer">Chỉ chân trang (Footer - Cuối phiếu)</option>
                    <option value="both">Cả đầu trang & chân trang (Cả 2)</option>
                    <option value="none">Không in mã (Ẩn Barcode & QR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Số dòng trống kẻ sẵn trên bảng:
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    value={formData.defaultEmptyRowsCount !== undefined ? formData.defaultEmptyRowsCount : 4}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        defaultEmptyRowsCount: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Tên kho xuất hàng mặc định:
                  </label>
                  <input
                    type="text"
                    value={formData.defaultWarehouse || 'Gia Phúc'}
                    onChange={(e) => setFormData({ ...formData, defaultWarehouse: e.target.value })}
                    placeholder="Gia Phúc"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Người lập phiếu / Bán hàng mặc định:
                  </label>
                  <input
                    type="text"
                    value={formData.defaultCreatorName || 'Mr. Thơm'}
                    onChange={(e) => setFormData({ ...formData, defaultCreatorName: e.target.value })}
                    placeholder="Mr. Thơm"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Tự động mở bản in khi thanh toán xong:
                  </label>
                  <select
                    value={formData.autoPrintReceipt ? 'true' : 'false'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        autoPrintReceipt: e.target.value === 'true',
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="true">Bật - Tự động hiển thị modal in</option>
                    <option value="false">Tắt - In thủ công khi nhấn nút</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-slate-300 font-semibold mb-1">
                    Ghi chú chân trang & Cam kết bảo hành (In dưới bảng phiếu):
                  </label>
                  <textarea
                    rows={2}
                    value={formData.receiptFooterNote}
                    onChange={(e) =>
                      setFormData({ ...formData, receiptFooterNote: e.target.value })
                    }
                    placeholder="Cảm ơn Quý khách đã tin tưởng Gia Phúc Computer! Hàng hóa được bảo hành chính hãng theo tem dán."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Matrix of Individual Document Settings */}
            <div className="bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    <span>Cấu Hình & Chỉnh Sửa Chi Tiết Từng Loại Biểu Mẫu In (23 Loại Biểu Mẫu Doanh Nghiệp)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tùy biến Tiêu đề phiếu, Diễn giải, Ghi chú điều khoản từng dòng, Khổ giấy, Barcode/QR, Chữ ký và lưu trực tiếp vào cơ sở dữ liệu.
                  </p>
                </div>

                {/* Quick Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={docSearchTerm}
                    onChange={(e) => setDocSearchTerm(e.target.value)}
                    placeholder="Tìm tên hoặc loại phiếu..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                  />
                  {docSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setDocSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
                {Object.entries(DOC_CATEGORIES).map(([catKey, catMeta]) => {
                  const isActive = docFilterCategory === catKey;
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setDocFilterCategory(catKey)}
                      className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      {catMeta.label}
                    </button>
                  );
                })}
              </div>

              {/* List of Document Templates */}
              <div className="grid grid-cols-1 gap-3 pt-1">
                {(Object.keys(DOC_TYPE_LABELS) as PrintDocType[])
                  .filter((type) => {
                    // Category filter
                    if (
                      docFilterCategory !== 'all' &&
                      !DOC_CATEGORIES[docFilterCategory]?.types.includes(type)
                    ) {
                      return false;
                    }
                    // Search filter
                    if (docSearchTerm.trim()) {
                      const term = docSearchTerm.toLowerCase();
                      const meta = DOC_TYPE_LABELS[type];
                      const cfg = formData.printDocConfigs?.[type];
                      const title = cfg?.customTitle?.toLowerCase() || '';
                      return (
                        meta.label.toLowerCase().includes(term) ||
                        meta.desc.toLowerCase().includes(term) ||
                        type.toLowerCase().includes(term) ||
                        title.includes(term)
                      );
                    }
                    return true;
                  })
                  .map((type) => {
                    const meta = DOC_TYPE_LABELS[type];
                    const cfg = formData.printDocConfigs?.[type] || {
                      paperSize: meta.defaultSize,
                      orientation: meta.defaultOrientation,
                      emptyRowsCount: meta.defaultSize === 'A5' ? 2 : 4,
                      signatureStyle: 'two_blocks' as const,
                      showVietQR: true,
                    };
                    const isCustomized =
                      Boolean(cfg.customTitle) ||
                      Boolean(cfg.customSubtitle) ||
                      Boolean(cfg.notes && cfg.notes.length > 0) ||
                      Boolean(cfg.signLeftLabel) ||
                      Boolean(cfg.signRightLabel);

                    return (
                      <div
                        key={type}
                        className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-xs hover:border-slate-700 transition-colors"
                      >
                        <div className="lg:w-5/12 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-white text-sm">
                              {cfg.customTitle ? `${meta.label} (${cfg.customTitle})` : meta.label}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                cfg.paperSize === 'A5'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : cfg.paperSize === 'A4'
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              }`}
                            >
                              Khổ {cfg.paperSize}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                              {cfg.orientation === 'portrait' ? 'Dọc' : 'Ngang'}
                            </span>
                            {isCustomized && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                                <Sparkles className="w-3 h-3" />
                                <span>Đã tùy chỉnh nội dung</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">{meta.desc}</p>
                          {cfg.notes && cfg.notes.length > 0 && (
                            <p className="text-[10px] text-slate-500 italic">
                              • Đã cấu hình {cfg.notes.length} dòng ghi chú riêng
                            </p>
                          )}
                        </div>

                        {/* Controls and Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                          {/* Paper Size selector */}
                          <div>
                            <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">
                              Khổ giấy:
                            </label>
                            <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700">
                              {(['A4', 'A5', 'K80'] as const).map((sz) => (
                                <button
                                  key={sz}
                                  type="button"
                                  onClick={() => handleUpdateDocConfig(type, 'paperSize', sz)}
                                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                                    cfg.paperSize === sz
                                      ? 'bg-blue-600 text-white shadow'
                                      : 'text-slate-400 hover:text-slate-200'
                                  }`}
                                >
                                  {sz}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Orientation selector */}
                          <div>
                            <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">
                              Hướng in:
                            </label>
                            <select
                              value={cfg.orientation}
                              onChange={(e) => handleUpdateDocConfig(type, 'orientation', e.target.value)}
                              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200 focus:border-blue-500 outline-none"
                            >
                              <option value="portrait">Dọc</option>
                              <option value="landscape">Ngang</option>
                            </select>
                          </div>

                          {/* Empty rows count */}
                          <div>
                            <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">
                              Dòng kẻ:
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="12"
                              value={cfg.emptyRowsCount}
                              onChange={(e) =>
                                handleUpdateDocConfig(type, 'emptyRowsCount', Number(e.target.value))
                              }
                              className="w-14 bg-slate-900 border border-slate-700 rounded-lg px-1.5 py-1 text-slate-200 text-center font-mono outline-none"
                            />
                          </div>

                          {/* Action Buttons: Edit Template & Test Print */}
                          <div className="flex items-center space-x-2 pt-3">
                            <button
                              type="button"
                              onClick={() => handleOpenEditor(type)}
                              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/20 transition-all shrink-0 cursor-pointer"
                              title="Mở bảng chỉnh sửa Tiêu đề, Ghi chú, QR/Barcode và Chữ ký cho mẫu này"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Chỉnh Sửa Mẫu In</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setTestDocType(type);
                                setTestModalOpen(true);
                              }}
                              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-semibold transition-colors shrink-0 cursor-pointer"
                              title="Mở bản in xem trước và in thử nghiệm mẫu phiếu này"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>In Thử Mẫu</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: CẤU HÌNH MẪU IN TEM NHÃN MÃ VẠCH & QR CODE
            ========================================================================= */}
        {activeTab === 'label_print' && (
          <LabelPrintSettingsTab
            formData={formData}
            setFormData={setFormData}
            onSave={() => onSaveSettings(formData)}
            savedSuccess={savedSuccess}
          />
        )}

        {/* =========================================================================
            TAB 4: KẾT NỐI PHẦN CỨNG (MÁY QUÉT MÃ VẠCH & MÁY IN HÓA ĐƠN)
            ========================================================================= */}
        {activeTab === 'hardware' && (
          <div className="space-y-6">
            {/* 1. Barcode Scanner Hardware Setup */}
            <div className="bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-800 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Scan className="w-4 h-4 text-cyan-400" />
                  <span>Cấu Hình Máy Quét Mã Vạch 1D/2D (Barcode Scanner Gun)</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Đang Lắng Nghe Quét Toàn Hệ Thống</span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Giao thức kết nối máy quét:
                  </label>
                  <select
                    value={formData.scannerMode || 'hid_keyboard'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scannerMode: e.target.value as any,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-cyan-500"
                  >
                    <option value="hid_keyboard">
                      USB / Bluetooth HID Keyboard (Khuyên dùng - Tự động nhận diện)
                    </option>
                    <option value="webusb">WebUSB Direct Scan (Cổng USB Trực Tiếp)</option>
                    <option value="serial">Cổng COM / Serial RS232</option>
                    <option value="camera">Camera Quét Mã Vạch 2D / QR</option>
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tương thích 100% các dòng máy quét: Honeywell, Datalogic, Zebra, Syble, Shangchen, Sunmi...
                  </p>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Âm thanh bíp xác nhận khi quét mã:
                  </label>
                  <div className="flex items-center space-x-2">
                    <select
                      value={formData.scannerBeepSound !== false ? 'true' : 'false'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          scannerBeepSound: e.target.value === 'true',
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="true">Bật - Phát tiếng Bíp chuẩn bán lẻ (1760 Hz)</option>
                      <option value="false">Tắt - Quét êm không tiếng</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => sounds.playBarcodeBeep()}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl flex items-center space-x-1 shrink-0"
                      title="Bấm để nghe thử âm bíp quét mã"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Thử Bíp</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Phím kết thúc sau khi quét mã:
                  </label>
                  <select
                    value={formData.scannerAutoEnter !== false ? 'true' : 'false'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scannerAutoEnter: e.target.value === 'true',
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="true">Phím Enter (Tự động thêm vào giỏ hàng POS / Tìm kiếm)</option>
                    <option value="false">Không phím kết thúc</option>
                  </select>
                </div>
              </div>

              {/* Live Scanner Testing Box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Barcode className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white text-xs">
                      Khung Kiểm Tra Quét Mã Vạch Trực Tiếp (Test Barcode Gun):
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Cầm máy quét, hướng tia laser vào ô dưới và bấm cò.
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={testBarcodeScanInput}
                    onChange={handleTestBarcodeInput}
                    onKeyDown={handleTestBarcodeKeyDown}
                    placeholder="Bắn tia laser vào đây hoặc gõ mã vạch & nhấn Enter..."
                    className="flex-1 bg-slate-900 border-2 border-cyan-500/50 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm tracking-wider focus:outline-none shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const sample = '8938505988019';
                      setTestBarcodeScanInput(sample);
                      if (formData.scannerBeepSound !== false) sounds.playBarcodeBeep();
                      setTestScanHistory((prev) => [
                        {
                          code: sample,
                          length: sample.length,
                          time: new Date().toLocaleTimeString(),
                          intervalMs: 18,
                        },
                        ...prev,
                      ]);
                      setTestBarcodeScanInput('');
                    }}
                    className="px-3.5 py-2.5 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold transition-all shrink-0"
                  >
                    Mã Test Mẫu
                  </button>
                </div>

                {/* Scan History Log */}
                {testScanHistory.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Lịch sử quét vừa nhận diện ({testScanHistory.length}):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                      {testScanHistory.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-900/90 border border-slate-800 p-2 rounded-lg flex flex-col justify-between text-xs animate-in fade-in"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-cyan-300 truncate">
                              {item.code}
                            </span>
                            <span className="text-[10px] text-slate-400">{item.time}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                            <span>Độ dài: {item.length} ký tự</span>
                            <span className="text-emerald-400 font-mono font-bold">
                              {item.intervalMs} ms
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Thermal & Office Printer Hardware Setup */}
            <div className="bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-800 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Printer className="w-4 h-4 text-indigo-400" />
                  <span>Cấu Hình Máy In Hóa Đơn & Máy In Văn Phòng A4 / A5</span>
                </h3>
                <span className="text-xs text-slate-400">
                  Tương thích máy in Canon, HP, Brother, Epson, Xprinter, Bixolon, Epson POS.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Cổng kết nối máy in:
                  </label>
                  <select
                    value={formData.printerConnectionType || 'browser'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        printerConnectionType: e.target.value as any,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="browser">
                      Driver Trình Duyệt / Windows (Khuyên dùng cho A4 / A5 & PDF)
                    </option>
                    <option value="usb_escpos">Cổng USB ESC/POS Trực Tiếp (In bill nhiệt K80)</option>
                    <option value="network_escpos">Mạng LAN / IP Ethernet (9100)</option>
                    <option value="bluetooth">Bluetooth Không Dây</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Địa chỉ IP máy in mạng (Nếu dùng LAN):
                  </label>
                  <input
                    type="text"
                    value={formData.printerIpAddress || '192.168.1.200'}
                    onChange={(e) => setFormData({ ...formData, printerIpAddress: e.target.value })}
                    placeholder="192.168.1.200"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Cổng Port kết nối:
                  </label>
                  <input
                    type="number"
                    value={formData.printerPort || 9100}
                    onChange={(e) => setFormData({ ...formData, printerPort: Number(e.target.value) })}
                    placeholder="9100"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="chk-auto-cut"
                    checked={formData.autoCutPaper !== false}
                    onChange={(e) => setFormData({ ...formData, autoCutPaper: e.target.checked })}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <label htmlFor="chk-auto-cut" className="text-slate-300 font-semibold cursor-pointer">
                    Tự động gửi lệnh cắt giấy (Auto-Cutter)
                  </label>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="chk-open-drawer"
                    checked={formData.openDrawerOnPayment !== false}
                    onChange={(e) =>
                      setFormData({ ...formData, openDrawerOnPayment: e.target.checked })
                    }
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <label
                    htmlFor="chk-open-drawer"
                    className="text-slate-300 font-semibold cursor-pointer"
                  >
                    Kích xung mở két tiền khi thanh toán (RJ11)
                  </label>
                </div>

                <div className="pt-2 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTestDocType('sales_invoice');
                      setTestModalOpen(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center space-x-1.5 transition-all shadow-md active:scale-95"
                  >
                    <Printer className="w-4 h-4" />
                    <span>In Thử Nghiệm Khổ A4 / A5</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: XUẤT HÓA ĐƠN ĐIỆN TỬ TT78 & CHỮ KÝ SỐ
            ========================================================================= */}
        {activeTab === 'einvoice' && (
          <div className="bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <FileCheck2 className="w-4 h-4 text-indigo-400" />
                <span>Cấu Hình Xuất Hóa Đơn Điện Tử (Thông Tư 78/2021/TT-BTC)</span>
              </h3>
              <span className="text-xs text-slate-400">
                Tuân thủ Nghị định 123/2020/NĐ-CP & Kết nối Cơ quan Thuế.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Ký hiệu hóa đơn (Invoice Symbol):
                </label>
                <input
                  type="text"
                  value={formData.eInvoiceSymbol || '1C26TGP'}
                  onChange={(e) => setFormData({ ...formData, eInvoiceSymbol: e.target.value })}
                  placeholder="1C26TGP (1: VAT, C: Có mã CQT, 26: Năm 2026, T: Điện tử, GP: Gia Phúc)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Định dạng: 1 ký tự loại HĐ + C/K + 2 số năm + 1 chữ cái + 2 chữ cái viết tắt doanh nghiệp.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Mẫu số hóa đơn (Template Code):
                </label>
                <input
                  type="text"
                  value={formData.eInvoiceTemplate || '1/001'}
                  onChange={(e) => setFormData({ ...formData, eInvoiceTemplate: e.target.value })}
                  placeholder="1/001"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nhà cung cấp chứng thư chữ ký số (CA Provider):
                </label>
                <input
                  type="text"
                  value={formData.certProvider || 'VIETTEL-CA (Bộ TT&TT cấp phép)'}
                  onChange={(e) => setFormData({ ...formData, certProvider: e.target.value })}
                  placeholder="VIETTEL-CA / VNPT-CA / MISA eSign"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Cổng tra cứu Hóa Đơn Điện Tử Tổng Cục Thuế:
                </label>
                <input
                  type="text"
                  value={formData.eInvoiceLookupUrl || 'https://hoadondientu.gdt.gov.vn'}
                  onChange={(e) => setFormData({ ...formData, eInvoiceLookupUrl: e.target.value })}
                  placeholder="https://hoadondientu.gdt.gov.vn"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: HỢP ĐỒNG LAO ĐỘNG
            ========================================================================= */}
        {activeTab === 'contract' && (
          <div className="bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>Cấu Hình Người Đại Diện Ký Hợp Đồng Lao Động</span>
              </h3>
              <span className="text-xs text-slate-400">
                Tự động điền phần Bên A (Người sử dụng lao động) khi in HĐLĐ.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Họ và tên người đại diện pháp luật:
                </label>
                <input
                  type="text"
                  value={formData.companyRepresentative || 'Phạm Gia Phúc'}
                  onChange={(e) =>
                    setFormData({ ...formData, companyRepresentative: e.target.value })
                  }
                  placeholder="Phạm Gia Phúc"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Chức vụ người đại diện:
                </label>
                <input
                  type="text"
                  value={formData.companyRepresentativeRole || 'Giám Đốc'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      companyRepresentativeRole: e.target.value,
                    })
                  }
                  placeholder="Giám Đốc"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Số CCCD / CMND người đại diện:
                </label>
                <input
                  type="text"
                  value={formData.companyIdCard || '079085001234'}
                  onChange={(e) => setFormData({ ...formData, companyIdCard: e.target.value })}
                  placeholder="079085001234"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nơi cấp & Ngày cấp CCCD:
                </label>
                <input
                  type="text"
                  value={
                    formData.companyIdCardPlace ||
                    'Cục Cảnh sát QLHC về TTXH (Cấp ngày 10/05/2021)'
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, companyIdCardPlace: e.target.value })
                  }
                  placeholder="Cục Cảnh sát QLHC về TTXH"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 6: TÀI KHOẢN NGÂN HÀNG & VIETQR
            ========================================================================= */}
        {activeTab === 'bank' && (
          <div className="bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>Tài Khoản Ngân Hàng & Mã QR Chuyển Khoản VietQR</span>
              </h3>
              <span className="text-xs text-slate-400">
                In trực tiếp trên Hóa đơn bán hàng & Hiển thị trên màn hình POS.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Ngân hàng thụ hưởng:
                  </label>
                  <select
                    value={formData.bankCode || 'TCB'}
                    onChange={(e) => {
                      const selectedBank = POPULAR_VIETNAMESE_BANKS.find(
                        (b) => b.code === e.target.value
                      );
                      setFormData({
                        ...formData,
                        bankCode: e.target.value,
                        bankName: selectedBank?.name || formData.bankName,
                      });
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
                  >
                    {POPULAR_VIETNAMESE_BANKS.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.code} - {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Số tài khoản ngân hàng:
                  </label>
                  <input
                    type="text"
                    value={formData.bankAccount || ''}
                    onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                    placeholder="1903688899901"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Tên chủ tài khoản thụ hưởng (In hoa không dấu):
                  </label>
                  <input
                    type="text"
                    value={formData.bankAccountName || ''}
                    onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
                    placeholder="CONG TY TNHH MTV TM DV GIA PHUC"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* VietQR Live Preview Card */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-2">
                <span className="text-xs font-bold text-white">Xem Trước Mã VietQR In Phiếu</span>
                <div className="bg-white p-2.5 rounded-xl border-2 border-emerald-500/50 shadow-lg">
                  <img
                    src={previewQrUrl}
                    alt="VietQR Preview"
                    referrerPolicy="no-referrer"
                    className="w-36 h-36 object-contain"
                  />
                </div>
                <div className="text-[11px] text-slate-300 font-mono">
                  {formData.bankCode} • {formData.bankAccount || 'Chưa nhập STK'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 7: GIAO DIỆN & SAO LƯU HỆ THỐNG
            ========================================================================= */}
        {activeTab === 'theme' && (
          <div className="space-y-6">
            {/* Theme Selector */}
            <div className="bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Palette className="w-4 h-4 text-sky-400" />
                <span>Tùy Chỉnh Giao Diện Màu Sắc</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Light Theme Option */}
                <div
                  onClick={() => handleThemeChange('light')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-3 relative ${
                    currentTheme === 'light'
                      ? 'border-sky-500 bg-sky-950/20 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/30'
                      : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                        <Sun className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center space-x-2">
                          <span>Pure White & Sky Blue (Sáng Sạch)</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                            Khuyên dùng
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Nền trắng pha xanh da trời lợt thanh nhã, sắc nét và tươi sáng.
                        </p>
                      </div>
                    </div>
                    {currentTheme === 'light' && (
                      <CheckCircle2 className="w-5 h-5 text-sky-500 shrink-0" />
                    )}
                  </div>
                </div>

                {/* Dark Theme Option */}
                <div
                  onClick={() => handleThemeChange('dark')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-3 relative ${
                    currentTheme === 'dark'
                      ? 'border-blue-500 bg-slate-950/80 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30'
                      : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
                        <Moon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center space-x-2">
                          <span>Slate-950 Dark</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Giao diện tối chuyên nghiệp, bảo vệ mắt khi làm việc ban đêm.
                        </p>
                      </div>
                    </div>
                    {currentTheme === 'dark' && (
                      <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 8: QUẢN TRỊ CƠ SỞ DỮ LIỆU, SAO LƯU, KHÔI PHỤC & XÓA DỮ LIỆU
            ========================================================================= */}
        {activeTab === 'sqlserver' && (
          <div className="space-y-6">
            {/* Header banner */}
            <div className="bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2.5">
                  <Database className="w-5 h-5 text-sky-400" />
                  <span>Trung Tâm Quản Trị CSDL & Sao Lưu / Khôi Phục</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Sao lưu toàn diện 22 bảng CSDL, khôi phục từ tệp JSON, xóa sạch dữ liệu để nhập mới hoặc cấu hình kết nối SQL Server.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-3 py-1.5 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-xl text-xs font-semibold flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
                  <span>Database Hiện Tại: <strong className="font-mono text-white">{dbName}</strong></span>
                </span>
              </div>
            </div>

            {/* Grid 3 Actions: Backup, Restore, Wipe Data */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: Backup Full DB */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Download className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white">1. Sao Lưu CSDL (Backup)</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Tải về tệp JSON chứa toàn bộ dữ liệu 22 bảng: Sản phẩm, Đơn hàng, Khách hàng, Bảo hành, Sổ quỹ, Nhân sự...
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={handleBackupDownload}
                    disabled={isExportingBackup}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
                  >
                    {isExportingBackup ? (
                      <>
                        <RotateCcw className="w-4 h-4 animate-spin" />
                        <span>Đang xuất dữ liệu...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Tải File Sao Lưu (.json)</span>
                      </>
                    )}
                  </button>

                  {backupDownloadMsg && (
                    <p className={`text-[11px] font-semibold text-center ${backupDownloadMsg.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {backupDownloadMsg.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Card 2: Restore from Backup */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Upload className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white">2. Khôi Phục CSDL (Restore)</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Nạp lại toàn bộ dữ liệu từ tệp sao lưu JSON đã tải về trước đó vào SQL Server.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <input
                    type="file"
                    ref={restoreFileInputRef}
                    accept=".json"
                    onChange={handleRestoreFileSelect}
                    className="hidden"
                  />

                  {restoreFileStats ? (
                    <div className="p-2.5 bg-slate-800/80 border border-slate-700 rounded-xl space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between text-slate-200 font-bold truncate">
                        <span className="truncate">{restoreFileStats.name}</span>
                        <span className="text-sky-400 shrink-0 ml-1">{restoreFileStats.size}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <span>Ngày tạo: {restoreFileStats.createdAt}</span>
                        <span>{restoreFileStats.totalRecords} bản ghi</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleExecuteRestore}
                        disabled={isRestoring}
                        className="w-full mt-2 py-2 px-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all shadow-md flex items-center justify-center space-x-1.5 disabled:opacity-60 cursor-pointer"
                      >
                        {isRestoring ? (
                          <>
                            <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                            <span>Đang nạp dữ liệu...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Xác Nhận Khôi Phục</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => restoreFileInputRef.current?.click()}
                      className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <FileJson className="w-4 h-4 text-sky-400" />
                      <span>Chọn File Backup (.json)</span>
                    </button>
                  )}

                  {restoreResult && (
                    <p className={`text-[11px] font-semibold text-center ${restoreResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {restoreResult.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Card 3: Wipe All Data - Danger Zone */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-rose-900/40 shadow-lg flex flex-col justify-between space-y-4 hover:border-rose-700/60 transition-all">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-rose-300">3. Xóa Dữ Liệu (Wipe Data)</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Xóa sạch toàn bộ dữ liệu đơn hàng, sản phẩm, khách hàng, sổ quỹ... để đưa hệ thống về CSDL trống chuẩn bị nhập mới.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setWipeConfirmInput('');
                      setWipeResult(null);
                      setShowWipeModal(true);
                    }}
                    className="w-full py-2.5 px-4 bg-rose-950/60 hover:bg-rose-900 active:bg-rose-800 text-rose-300 hover:text-rose-100 font-bold text-xs rounded-xl border border-rose-800 transition-all shadow-md shadow-rose-950/30 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>Xóa Sạch Toàn Bộ Dữ Liệu</span>
                  </button>

                  {wipeResult && (
                    <p className={`text-[11px] font-semibold text-center ${wipeResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {wipeResult.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* SQL Server Connection Settings Box */}
            <div className="bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-800 space-y-5 shadow-xl text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-white">
                <h4 className="text-sm font-bold flex items-center space-x-2">
                  <HardDrive className="w-4 h-4 text-sky-400" />
                  <span>4. Cấu Hình Kết Nối Microsoft SQL Server</span>
                </h4>
                <span className="text-xs text-slate-400">
                  Tạo CSDL & 22 bảng Schema sạch sẽ
                </span>
              </div>

              {/* Exact card layout matching user mockup */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-5 max-w-xl mx-auto shadow-sm">
                {/* Server Name */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-800">
                    Tên máy chủ (Server Name):
                  </label>
                  <input
                    type="text"
                    value={dbServerName}
                    onChange={(e) => setDbServerName(e.target.value)}
                    placeholder="VD: . hoặc localhost hoặc .\SQLEXPRESS hoặc 103.56.12.89"
                    className="w-full p-2.5 px-3 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-500">
                    Dùng dấu <code className="px-1 bg-slate-100 rounded text-sky-700 font-mono">.</code> hoặc <code className="px-1 bg-slate-100 rounded text-sky-700 font-mono">localhost</code> cho máy cục bộ, hoặc IP/Domain cho máy chủ Hosting.
                  </p>
                </div>

                {/* Authentication Mode Selector (SSMS style) */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-800">
                    Phương thức xác thực (Authentication):
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDbAuthType('windows')}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                        dbAuthType === 'windows'
                          ? 'bg-sky-50 border-sky-500 text-sky-700 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Windows Authentication</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDbAuthType('sql')}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                        dbAuthType === 'sql'
                          ? 'bg-sky-50 border-sky-500 text-sky-700 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Lock className="w-4 h-4" />
                      <span>SQL Server Authentication</span>
                    </button>
                  </div>
                </div>

                {/* Authentication Fields depending on mode */}
                {dbAuthType === 'windows' ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-2 text-xs text-slate-600">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>Windows Authentication:</strong> Tự động xác thực tài khoản Windows hiện tại (không cần nhập tên đăng nhập và mật khẩu).
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1.5 animate-in fade-in">
                    <label className="block text-sm font-bold text-slate-800">
                      Thông tin đăng nhập:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="block text-xs text-slate-600 mb-1 font-medium">Tên đăng nhập:</span>
                        <input
                          type="text"
                          value={dbUsername}
                          onChange={(e) => setDbUsername(e.target.value)}
                          placeholder="VD: sa"
                          className="w-full p-2 px-3 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        />
                      </div>
                      <div>
                        <span className="block text-xs text-slate-600 mb-1 font-medium">Mật khẩu:</span>
                        <input
                          type="password"
                          value={dbPassword}
                          onChange={(e) => setDbPassword(e.target.value)}
                          placeholder="Mật khẩu tài khoản sa"
                          className="w-full p-2 px-3 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Test Button */}
                <div>
                  <button
                    type="button"
                    onClick={handleTestSqlDb}
                    disabled={isTestingDb}
                    className="w-full py-2.5 px-4 bg-[#0088cc] hover:bg-[#0077b3] active:bg-[#006699] text-white font-semibold text-sm rounded-md transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
                  >
                    {isTestingDb ? (
                      <>
                        <RotateCcw className="w-4 h-4 animate-spin" />
                        <span>Đang kiểm tra kết nối tới SQL Server...</span>
                      </>
                    ) : (
                      <span>Kiểm tra kết nối</span>
                    )}
                  </button>
                </div>

                {/* Test Result Alert */}
                {dbTestResult && (
                  <div
                    className={`p-3 rounded-lg border text-xs flex items-start space-x-2.5 animate-in fade-in ${
                      dbTestResult.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    {dbTestResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">{dbTestResult.message}</p>
                      {dbServerVersion && (
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                          {dbServerVersion}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Database Select */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-bold text-slate-800">
                      Cơ sở dữ liệu (Database):
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomDb(!isCustomDb)}
                      className="text-xs text-sky-600 hover:text-sky-800 font-medium hover:underline cursor-pointer"
                    >
                      {isCustomDb ? '← Chọn từ danh sách' : '+ Nhập tên CSDL mới'}
                    </button>
                  </div>

                  {isCustomDb ? (
                    <input
                      type="text"
                      value={dbCustomName}
                      onChange={(e) => setDbCustomName(e.target.value)}
                      placeholder="Nhập tên CSDL mới (VD: GPERP_Enterprise hoặc pos_basic_db)"
                      className="w-full p-2.5 px-3 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-mono"
                    />
                  ) : (
                    <select
                      value={dbName}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setIsCustomDb(true);
                          setDbCustomName('');
                        } else {
                          setDbName(e.target.value);
                        }
                      }}
                      className="w-full p-2.5 px-3 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 cursor-pointer"
                    >
                      {availableDatabases.length > 0 ? (
                        <>
                          {!availableDatabases.includes(dbName) && dbName && (
                            <option value={dbName}>{dbName} (Hiện tại)</option>
                          )}
                          {availableDatabases.map((db) => (
                            <option key={db} value={db}>
                              {db} {db === dbName ? '(Đang chọn)' : ''}
                            </option>
                          ))}
                        </>
                      ) : (
                        <>
                          <option value={dbName}>{dbName} (Hiện tại)</option>
                          <option value="POS_WEB">POS_WEB</option>
                          <option value="GPERP_Enterprise">GPERP_Enterprise</option>
                        </>
                      )}
                      <option value="__custom__">+ Nhập tên CSDL mới...</option>
                    </select>
                  )}
                </div>

                {/* Save Result Alert */}
                {dbSaveResult && (
                  <div
                    className={`p-3 rounded-lg border text-xs flex items-start space-x-2.5 animate-in fade-in ${
                      dbSaveResult.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    {dbSaveResult.success ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <p className="font-semibold flex-1">{dbSaveResult.message}</p>
                  </div>
                )}

                {/* Buttons */}
                <div className="border-t border-slate-200 pt-4 flex items-center justify-center space-x-4">
                  <button
                    type="button"
                    onClick={handleSaveSqlDb}
                    disabled={isSavingDb}
                    className="px-6 py-2.5 bg-[#0088cc] hover:bg-[#0077b3] active:bg-[#006699] text-white font-bold text-sm rounded-md transition-all shadow-sm flex items-center space-x-2 disabled:opacity-70 cursor-pointer min-w-[140px] justify-center"
                  >
                    {isSavingDb ? (
                      <>
                        <RotateCcw className="w-4 h-4 animate-spin" />
                        <span>Đang lưu & tạo 22 bảng sạch...</span>
                      </>
                    ) : (
                      <span>Lưu Cấu Hình CSDL</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleResetSqlDb}
                    disabled={isSavingDb}
                    className="px-6 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-sm rounded-md transition-all shadow-sm cursor-pointer min-w-[120px]"
                  >
                    Làm Lại
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Save Button */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center space-x-2 active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Toàn Bộ Cấu Hình</span>
          </button>
        </div>
      </form>

      {/* Modal Popup Xác Nhận Xóa Sạch Dữ Liệu */}
      {showWipeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-rose-800/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-slate-100 relative">
            <button
              type="button"
              onClick={() => setShowWipeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 text-rose-400">
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Xác Nhận Xóa Sạch Dữ Liệu</h3>
                <p className="text-xs text-rose-400 font-semibold">Cảnh báo: Hành động không thể hoàn tác!</p>
              </div>
            </div>

            <div className="p-3 bg-rose-950/30 border border-rose-900/50 rounded-xl text-xs text-slate-300 space-y-2">
              <p>
                Toàn bộ dữ liệu của các phân hệ: <strong>Sản phẩm, Đơn hàng, Khách hàng, Bảo hành, Sổ quỹ kế toán, Nhân sự, Hóa đơn điện tử, Báo giá, Định mức BOM, Nhật ký kho...</strong> sẽ bị xóa sạch hoàn toàn.
              </p>
              <p className="text-amber-300 font-medium">
                💡 Hệ thống sẽ giữ lại tài khoản Quản trị viên (Admin) và thông tin cấu hình cửa hàng.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Để xác nhận, vui lòng nhập chính xác từ khóa <span className="text-rose-400 font-mono bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800">XOA_DU_LIEU</span> vào ô bên dưới:
              </label>
              <input
                type="text"
                value={wipeConfirmInput}
                onChange={(e) => setWipeConfirmInput(e.target.value)}
                placeholder="Nhập XOA_DU_LIEU"
                className="w-full p-2.5 px-3 bg-slate-950 border border-rose-700/60 rounded-xl text-sm font-mono text-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500 uppercase"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowWipeModal(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleExecuteWipeData}
                disabled={wipeConfirmInput.trim() !== 'XOA_DU_LIEU' || isWiping}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 flex items-center space-x-2 cursor-pointer"
              >
                {isWiping ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Đang xóa sạch dữ liệu...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Xác Nhận Xóa Vĩnh Viễn</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Template Editor Modal */}
      {editorModalOpen && (
        <PrintTemplateEditorModal
          isOpen={editorModalOpen}
          onClose={() => setEditorModalOpen(false)}
          docType={editingDocType}
          docMeta={DOC_TYPE_LABELS[editingDocType]}
          initialConfig={formData.printDocConfigs?.[editingDocType]}
          settings={formData}
          onSave={handleSaveDocConfigFromEditor}
          onOpenTestPrint={(type) => {
            setTestDocType(type);
            setTestModalOpen(true);
          }}
        />
      )}

      {/* Test Print Modal */}
      {testModalOpen && (
        <PrintInvoiceModal
          isOpen={testModalOpen}
          onClose={() => setTestModalOpen(false)}
          initialDocType={testDocType}
          settings={formData}
          onSaveSettings={(upd) => {
            setFormData(upd);
            onSaveSettings(upd);
          }}
        />
      )}
    </div>
  );
};
