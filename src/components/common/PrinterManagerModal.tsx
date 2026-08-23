import React, { useState, useEffect } from 'react';
import {
  Printer,
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  CheckCircle2,
  FileText,
  Receipt,
  Barcode,
  Download,
  Wifi,
  Usb,
  Bluetooth,
  Monitor,
  Zap,
  Sliders,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  PrinterProfile,
  getSavedPrinters,
  savePrinters,
  getActivePrinterId,
  setActivePrinterId,
  DEFAULT_PRINTER_PROFILES,
} from '../../utils/printerStorage';
import { sounds } from '../../utils/soundEffects';

interface PrinterManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrinter?: (printer: PrinterProfile) => void;
}

export const PrinterManagerModal: React.FC<PrinterManagerModalProps> = ({
  isOpen,
  onClose,
  onSelectPrinter,
}) => {
  const [printers, setPrinters] = useState<PrinterProfile[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [editingPrinter, setEditingPrinter] = useState<PrinterProfile | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [testPrintSuccess, setTestPrintSuccess] = useState<string>('');

  // Form State
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<PrinterProfile['type']>('thermal_receipt');
  const [formConnection, setFormConnection] = useState<PrinterProfile['connection']>('USB');
  const [formIpAddress, setFormIpAddress] = useState('');
  const [formPort, setFormPort] = useState<number>(9100);
  const [formPaperSize, setFormPaperSize] = useState<PrinterProfile['defaultPaperSize']>('K80');
  const [formOrientation, setFormOrientation] = useState<PrinterProfile['defaultOrientation']>('portrait');
  const [formDescription, setFormDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      const list = getSavedPrinters();
      setPrinters(list);
      setActiveId(getActivePrinterId());
      setIsAddingNew(false);
      setEditingPrinter(null);
      setTestPrintSuccess('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOpenAdd = () => {
    setIsAddingNew(true);
    setEditingPrinter(null);
    setFormName('Máy In Mới ' + (printers.length + 1));
    setFormType('thermal_receipt');
    setFormConnection('USB');
    setFormIpAddress('');
    setFormPort(9100);
    setFormPaperSize('K80');
    setFormOrientation('portrait');
    setFormDescription('Máy in nhiệt kết nối cổng USB');
  };

  const handleOpenEdit = (p: PrinterProfile) => {
    setEditingPrinter(p);
    setIsAddingNew(false);
    setFormName(p.name);
    setFormType(p.type);
    setFormConnection(p.connection);
    setFormIpAddress(p.ipAddress || '');
    setFormPort(p.port || 9100);
    setFormPaperSize(p.defaultPaperSize);
    setFormOrientation(p.defaultOrientation);
    setFormDescription(p.description || '');
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (isAddingNew) {
      const newPrinter: PrinterProfile = {
        id: 'ptr-' + Date.now(),
        name: formName.trim(),
        type: formType,
        connection: formConnection,
        ipAddress: formConnection === 'LAN/IP' ? formIpAddress : undefined,
        port: formConnection === 'LAN/IP' ? formPort : undefined,
        defaultPaperSize: formPaperSize,
        defaultOrientation: formOrientation,
        isDefault: printers.length === 0,
        status: 'online',
        description: formDescription.trim(),
      };
      const updated = [...printers, newPrinter];
      setPrinters(updated);
      savePrinters(updated);
      setIsAddingNew(false);
    } else if (editingPrinter) {
      const updated = printers.map((p) =>
        p.id === editingPrinter.id
          ? {
              ...p,
              name: formName.trim(),
              type: formType,
              connection: formConnection,
              ipAddress: formConnection === 'LAN/IP' ? formIpAddress : undefined,
              port: formConnection === 'LAN/IP' ? formPort : undefined,
              defaultPaperSize: formPaperSize,
              defaultOrientation: formOrientation,
              description: formDescription.trim(),
            }
          : p
      );
      setPrinters(updated);
      savePrinters(updated);
      setEditingPrinter(null);
    }
    sounds.playSuccessChime();
  };

  const handleDelete = (id: string) => {
    if (printers.length <= 1) {
      alert('Hệ thống cần giữ lại ít nhất 1 máy in mặc định!');
      return;
    }
    if (confirm('Bạn có chắc chắn muốn xóa máy in này khỏi danh sách?')) {
      const updated = printers.filter((p) => p.id !== id);
      setPrinters(updated);
      savePrinters(updated);
      if (activeId === id) {
        const nextId = updated[0].id;
        setActiveId(nextId);
        setActivePrinterId(nextId);
      }
    }
  };

  const handleSetDefault = (id: string) => {
    const updated = printers.map((p) => ({
      ...p,
      isDefault: p.id === id,
    }));
    setPrinters(updated);
    savePrinters(updated);
    setActiveId(id);
    setActivePrinterId(id);
    const selected = updated.find((p) => p.id === id);
    if (selected && onSelectPrinter) {
      onSelectPrinter(selected);
    }
    sounds.playBarcodeBeep();
  };

  const handleTestPrint = (p: PrinterProfile) => {
    sounds.playPrintFeedSound();
    setTestPrintSuccess('Đã gửi lệnh in thử nghiệm thành công tới "' + p.name + '" (' + p.connection + ')!');
    setTimeout(() => setTestPrintSuccess(''), 3500);
  };

  const handleResetDefaults = () => {
    if (confirm('Khôi phục danh sách máy in về cấu hình mặc định ban đầu?')) {
      setPrinters(DEFAULT_PRINTER_PROFILES);
      savePrinters(DEFAULT_PRINTER_PROFILES);
      setActiveId('ptr-k80-usb');
      setActivePrinterId('ptr-k80-usb');
      sounds.playSuccessChime();
    }
  };

  const getPrinterIcon = (type: PrinterProfile['type']) => {
    switch (type) {
      case 'thermal_receipt':
        return <Receipt className="w-5 h-5 text-amber-400" />;
      case 'office_laser':
        return <FileText className="w-5 h-5 text-blue-400" />;
      case 'barcode_label':
        return <Barcode className="w-5 h-5 text-purple-400" />;
      case 'virtual_pdf':
        return <Download className="w-5 h-5 text-cyan-400" />;
      default:
        return <Printer className="w-5 h-5 text-slate-400" />;
    }
  };

  const getConnectionIcon = (conn: PrinterProfile['connection']) => {
    switch (conn) {
      case 'USB':
        return <Usb className="w-3.5 h-3.5 text-slate-400" />;
      case 'LAN/IP':
        return <Wifi className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Bluetooth':
        return <Bluetooth className="w-3.5 h-3.5 text-blue-400" />;
      case 'Virtual':
        return <Monitor className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 md:p-4 animate-in fade-in overflow-hidden">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                <span>Quản Lý Danh Sách & Thiết Lập Máy In</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-bold">
                  {printers.length} máy in
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Tùy chỉnh máy in hóa đơn K80, máy in laser A4/A5, tem decal và máy in ảo PDF
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

        {/* Status Toast */}
        {testPrintSuccess && (
          <div className="p-3 bg-emerald-950/90 border-b border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center space-x-2 px-6 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{testPrintSuccess}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-slate-900/60">
          {/* Top Actions: Add New & Reset Defaults */}
          {!isAddingNew && !editingPrinter && (
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleOpenAdd}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/25 flex items-center space-x-2 cursor-pointer transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Máy In Mới</span>
              </button>

              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 flex items-center space-x-1.5 cursor-pointer transition-colors"
                title="Khôi phục danh sách mặc định"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Khôi Phục Mặc Định</span>
              </button>
            </div>
          )}

          {/* Form Add / Edit */}
          {(isAddingNew || editingPrinter) && (
            <form onSubmit={handleSaveForm} className="bg-slate-950 p-5 rounded-2xl border border-blue-500/40 shadow-xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-sm font-extrabold text-white flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  <span>{isAddingNew ? 'Thêm Máy In Mới Vào Hệ Thống' : 'Chỉnh Sửa Thông Số Máy In'}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingPrinter(null);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Hủy bỏ
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Tên Máy In *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    placeholder="VD: Xprinter XP-Q800 (Quầy Thu Ngân)"
                    className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Loại Máy In</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="thermal_receipt">Máy in hóa đơn nhiệt (Bill K80 / K58)</option>
                    <option value="office_laser">Máy in văn phòng (Laser A4 / A5)</option>
                    <option value="barcode_label">Máy in tem nhãn mã vạch (Decal)</option>
                    <option value="virtual_pdf">Máy in ảo xuất file PDF</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Cổng Kết Nối</label>
                  <select
                    value={formConnection}
                    onChange={(e) => setFormConnection(e.target.value as any)}
                    className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="USB">Cổng USB (Trực tiếp)</option>
                    <option value="LAN/IP">Mạng LAN / IP / WiFi</option>
                    <option value="Bluetooth">Bluetooth Không Dây</option>
                    <option value="Virtual">Máy in Ảo / Trình duyệt</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Khổ Giấy Mặc Định</label>
                  <select
                    value={formPaperSize}
                    onChange={(e) => setFormPaperSize(e.target.value as any)}
                    className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="K80">Khổ Bill Nhiệt K80 (80mm)</option>
                    <option value="K58">Khổ Bill Nhiệt K58 (58mm)</option>
                    <option value="A4">Khổ A4 (210×297mm)</option>
                    <option value="A5">Khổ A5 (148×210mm)</option>
                    <option value="custom">Tùy Chỉnh Tem Nhãn</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Hướng Giấy</label>
                  <select
                    value={formOrientation}
                    onChange={(e) => setFormOrientation(e.target.value as any)}
                    className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="portrait">Dọc (Portrait)</option>
                    <option value="landscape">Ngang (Landscape)</option>
                  </select>
                </div>
              </div>

              {formConnection === 'LAN/IP' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Địa Chỉ IP Máy In</label>
                    <input
                      type="text"
                      value={formIpAddress}
                      onChange={(e) => setFormIpAddress(e.target.value)}
                      placeholder="192.168.1.200"
                      className="w-full h-9 px-3 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-emerald-400 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Cổng Port (Mặc định 9100)</label>
                    <input
                      type="number"
                      value={formPort}
                      onChange={(e) => setFormPort(Number(e.target.value))}
                      className="w-full h-9 px-3 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Ghi Chú / Mô Tả</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="VD: Máy in đặt tại quầy thu ngân số 1"
                  className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingPrinter(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Lưu Máy In
                </button>
              </div>
            </form>
          )}

          {/* Printer Cards List */}
          <div className="grid grid-cols-1 gap-3">
            {printers.map((p) => {
              const isSelected = activeId === p.id;
              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-blue-950/40 border-blue-500/60 shadow-lg shadow-blue-950/50 ring-1 ring-blue-500/40'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                      {getPrinterIcon(p.type)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h4 className="text-sm font-extrabold text-white">{p.name}</h4>
                        {p.isDefault && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                            Mặc Định
                          </span>
                        )}
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                            Đang Chọn In
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center space-x-1">
                          {getConnectionIcon(p.connection)}
                          <span>{p.connection} {p.ipAddress ? `(${p.ipAddress}:${p.port || 9100})` : ''}</span>
                        </span>
                        <span>•</span>
                        <span>Khổ giấy: <strong className="text-slate-200">{p.defaultPaperSize}</strong> ({p.defaultOrientation === 'landscape' ? 'Ngang' : 'Dọc'})</span>
                      </div>

                      {p.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5 italic">{p.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleTestPrint(p)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
                      title="In thử nghiệm tín hiệu máy in"
                    >
                      🧪 In Thử
                    </button>

                    {!isSelected && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(p.id)}
                        className="px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-bold rounded-xl border border-blue-500/40 transition-colors cursor-pointer"
                      >
                        Chọn Máy Này
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(p)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                      title="Sửa cấu hình máy in"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                      title="Xóa máy in"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
