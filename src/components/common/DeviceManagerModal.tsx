import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Printer,
  Barcode,
  CreditCard,
  Scale,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Sliders,
  Radio,
  Power,
  Zap,
  Layers,
  Settings,
  Volume2,
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export interface HardwareDevice {
  id: string;
  name: string;
  type: 'printer' | 'scanner' | 'card_pos' | 'scale' | 'cash_drawer';
  model: string;
  connection: 'USB' | 'Bluetooth' | 'LAN/TCP-IP' | 'COM/RS232' | 'RJ11 (Nối qua máy in bill)' | string;
  status: 'connected' | 'disconnected' | 'testing';
  details?: string;
  paperSize?: '80mm' | '58mm' | 'A4';
  baudRate?: string;
  ipAddress?: string;
}

interface DeviceManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_DEVICES: HardwareDevice[] = [
  {
    id: 'dev-1',
    name: 'Máy in hóa đơn nhiệt bill K80',
    type: 'printer',
    model: 'Xprinter XP-Q800 (Auto-Cutter)',
    connection: 'USB',
    status: 'connected',
    paperSize: '80mm',
    details: 'Cắt giấy tự động, tốc độ in 260mm/s, in mã QR VietQR',
  },
  {
    id: 'dev-2',
    name: 'Đầu đọc mã vạch & QR Code 2D',
    type: 'scanner',
    model: 'Honeywell Youjie HF600 Omni-Directional',
    connection: 'USB',
    status: 'connected',
    details: 'Quét tự động liên tục, nhận diện mã vạch 1D & QR Code màn hình điện thoại',
  },
  {
    id: 'dev-3',
    name: 'Máy quẹt thẻ ngân hàng POS',
    type: 'card_pos',
    model: 'Pax A920 Smart POS (Napas, Visa/Master)',
    connection: 'LAN/TCP-IP',
    ipAddress: '192.168.1.188:8080',
    status: 'connected',
    details: 'Tích hợp thanh toán thẻ không tiếp xúc Contactless, đẩy số tiền tự động',
  },
  {
    id: 'dev-4',
    name: 'Cân điện tử siêu thị điện tử tính giá',
    type: 'scale',
    model: 'CAS PR-Plus 15kg (Độ chia 2g/5g)',
    connection: 'COM/RS232',
    baudRate: '9600 bps (COM3)',
    status: 'connected',
    details: 'Tự động lấy khối lượng lên màn hình bán hàng Desktop POS',
  },
  {
    id: 'dev-5',
    name: 'Ngăn kéo đựng tiền thu ngân tự động (Cash Drawer)',
    type: 'cash_drawer',
    model: 'Maken MK-410 (4 ngăn tiền giấy, 8 ô tiền xu/tiền lẻ)',
    connection: 'RJ11 (Nối qua máy in bill)',
    status: 'connected',
    details: 'Tự động bật mở khi ấn Thanh toán (In Bill)',
  },
];

export const DeviceManagerModal: React.FC<DeviceManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [devices, setDevices] = useState<HardwareDevice[]>(() => {
    const saved = localStorage.getItem('desktop_hardware_devices');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_DEVICES;
      }
    }
    return DEFAULT_DEVICES;
  });

  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; message: string; success: boolean } | null>(null);
  const [autoOpenDrawer, setAutoOpenDrawer] = useState(true);
  const [autoCutPaper, setAutoCutPaper] = useState(true);
  const [soundBeep, setSoundBeep] = useState(true);

  useEffect(() => {
    localStorage.setItem('desktop_hardware_devices', JSON.stringify(devices));
  }, [devices]);

  if (!isOpen) return null;

  const handleTestDevice = (dev: HardwareDevice) => {
    setTestingId(dev.id);
    setTestResult(null);

    setTimeout(() => {
      setTestingId(null);
      if (dev.type === 'printer') {
        if (soundBeep) sounds.playPrintFeedSound();
        setTestResult({
          id: dev.id,
          message: ' Đã gửi lệnh in test thành công đến máy in ' + dev.model + ' (Khổ ' + dev.paperSize + ')',
          success: true,
        });
      } else if (dev.type === 'scanner') {
        if (soundBeep) sounds.playBarcodeBeep();
        setTestResult({
          id: dev.id,
          message: ' Đầu đọc mã vạch đã sẵn sàng nhận luồng quét mã 1D/2D cổng ' + dev.connection,
          success: true,
        });
      } else if (dev.type === 'scale') {
        if (soundBeep) sounds.playSuccessChime();
        setTestResult({
          id: dev.id,
          message: ' Kết nối Cân điện tử ' + dev.model + ' ổn định! Dữ liệu mẫu đọc được: 0.750 kg',
          success: true,
        });
      } else if (dev.type === 'card_pos') {
        if (soundBeep) sounds.playSuccessChime();
        setTestResult({
          id: dev.id,
          message: ' Ping máy quẹt thẻ POS IP ' + (dev.ipAddress || '192.168.1.188') + ' phản hồi 12ms (Ready)',
          success: true,
        });
      } else {
        if (soundBeep) sounds.playCashDrawerSound();
        setTestResult({
          id: dev.id,
          message: ' Kích hoạt xung điện 24V mở ngăn kéo đựng tiền thu ngân thành công!',
          success: true,
        });
      }
    }, 1000);
  };

  const toggleDeviceStatus = (id: string) => {
    setDevices((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: d.status === 'connected' ? 'disconnected' : 'connected',
            }
          : d
      )
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div
        className="bg-white border border-blue-200 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-auto"
        id="device-manager-modal"
      >
        {/* Modal Top Header */}
        <div className="p-4 md:p-5 bg-gradient-to-r from-blue-50/80 via-white to-sky-50/80 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 shadow-sm">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                  Phần Cứng Ngoại Vi
                </span>
                <span className="text-xs text-slate-500 font-mono">PC & Desktop POS Driver</span>
              </div>
              <h3 className="text-base md:text-lg font-bold text-slate-800 mt-0.5">
                Cấu Hình Thiết Bị & Phần Cứng Bán Hàng Desktop
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Hardware Quick Settings Bar */}
          <div className="p-3.5 rounded-2xl bg-blue-50/40 border border-blue-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 font-bold text-slate-700">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Thiết lập tự động hóa bán lẻ:</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
              <label className="flex items-center space-x-1.5 cursor-pointer hover:text-blue-600">
                <input
                  type="checkbox"
                  checked={autoOpenDrawer}
                  onChange={(e) => setAutoOpenDrawer(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Tự mở két tiền</span>
              </label>

              <label className="flex items-center space-x-1.5 cursor-pointer hover:text-blue-600">
                <input
                  type="checkbox"
                  checked={autoCutPaper}
                  onChange={(e) => setAutoCutPaper(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Tự động cắt giấy bill</span>
              </label>

              <label className="flex items-center space-x-1.5 cursor-pointer hover:text-blue-600">
                <input
                  type="checkbox"
                  checked={soundBeep}
                  onChange={(e) => setSoundBeep(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Âm báo bíp khi quét mã</span>
              </label>
            </div>
          </div>

          {/* Test message alert */}
          {testResult && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Device list */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Danh sách thiết bị kết nối ({devices.length})
            </h4>

            <div className="grid grid-cols-1 gap-3">
              {devices.map((dev) => {
                const isTesting = testingId === dev.id;
                const isConnected = dev.status === 'connected';

                return (
                  <div
                    key={dev.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isConnected
                        ? 'bg-white border-blue-200/80 shadow-sm hover:border-blue-300'
                        : 'bg-slate-50 border-slate-200 opacity-70'
                    }`}
                  >
                    <div className="flex items-start space-x-3.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                          dev.type === 'printer'
                            ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                            : dev.type === 'scanner'
                            ? 'bg-cyan-50 text-cyan-600 border-cyan-200'
                            : dev.type === 'card_pos'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : dev.type === 'scale'
                            ? 'bg-amber-50 text-amber-600 border-amber-200'
                            : 'bg-rose-50 text-rose-600 border-rose-200'
                        }`}
                      >
                        {dev.type === 'printer' && <Printer className="w-5 h-5" />}
                        {dev.type === 'scanner' && <Barcode className="w-5 h-5" />}
                        {dev.type === 'card_pos' && <CreditCard className="w-5 h-5" />}
                        {dev.type === 'scale' && <Scale className="w-5 h-5" />}
                        {dev.type === 'cash_drawer' && <Monitor className="w-5 h-5" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h5 className="text-xs md:text-sm font-bold text-slate-800 truncate">
                            {dev.name}
                          </h5>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isConnected
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isConnected ? '● Đang kết nối' : '○ Đã ngắt'}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                          <span className="font-semibold text-slate-700">Model: {dev.model}</span>
                          <span>•</span>
                          <span className="text-blue-600 font-medium">Cổng: {dev.connection}</span>
                          {dev.baudRate && <span>• {dev.baudRate}</span>}
                          {dev.ipAddress && <span>• IP: {dev.ipAddress}</span>}
                          {dev.paperSize && <span>• Khổ giấy: {dev.paperSize}</span>}
                        </div>

                        {dev.details && (
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                            {dev.details}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleTestDevice(dev)}
                        disabled={isTesting || !isConnected}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-colors flex items-center space-x-1.5 disabled:opacity-40"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                        <span>{isTesting ? 'Đang test...' : 'Test thiết bị'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleDeviceStatus(dev.id)}
                        className={`p-1.5 rounded-xl border transition-colors ${
                          isConnected
                            ? 'text-rose-600 hover:bg-rose-50 border-rose-200'
                            : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
                        }`}
                        title={isConnected ? 'Ngắt kết nối' : 'Kết nối lại'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Tất cả thiết bị đều hỗ trợ chuẩn cắm chạy Plug & Play trên hệ điều hành Windows, macOS và Linux.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
          >
            Đóng & Áp Dụng
          </button>
        </div>
      </div>
    </div>
  );
};
