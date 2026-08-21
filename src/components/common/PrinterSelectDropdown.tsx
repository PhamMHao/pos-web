import React, { useState, useEffect, useRef } from 'react';
import {
  Printer,
  ChevronDown,
  Check,
  Receipt,
  FileText,
  Barcode,
  Download,
  Settings,
  Wifi,
  Usb,
  Bluetooth,
  Monitor,
} from 'lucide-react';
import {
  PrinterProfile,
  getSavedPrinters,
  getActivePrinter,
  setActivePrinterId,
} from '../../utils/printerStorage';
import { PrinterManagerModal } from './PrinterManagerModal';
import { sounds } from '../../utils/soundEffects';

export interface PrinterSelectDropdownProps {
  onSelectPrinter?: (printer: PrinterProfile) => void;
  className?: string;
}

export const PrinterSelectDropdown: React.FC<PrinterSelectDropdownProps> = ({
  onSelectPrinter,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [printers, setPrinters] = useState<PrinterProfile[]>([]);
  const [activePrinter, setActivePrinter] = useState<PrinterProfile>(getActivePrinter());
  const [showManagerModal, setShowManagerModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const loadPrinters = () => {
    const list = getSavedPrinters();
    setPrinters(list);
    const active = getActivePrinter();
    setActivePrinter(active);
  };

  useEffect(() => {
    loadPrinters();

    const handleUpdate = () => loadPrinters();
    window.addEventListener('printers-updated', handleUpdate);
    window.addEventListener('active-printer-changed', handleUpdate);

    return () => {
      window.removeEventListener('printers-updated', handleUpdate);
      window.removeEventListener('active-printer-changed', handleUpdate);
    };
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (printer: PrinterProfile) => {
    setActivePrinterId(printer.id);
    setActivePrinter(printer);
    setIsOpen(false);
    if (onSelectPrinter) {
      onSelectPrinter(printer);
    }
    sounds.playBarcodeBeep();
  };

  const getIcon = (type: PrinterProfile['type']) => {
    switch (type) {
      case 'thermal_receipt':
        return <Receipt className="w-4 h-4 text-amber-400" />;
      case 'office_laser':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'barcode_label':
        return <Barcode className="w-4 h-4 text-purple-400" />;
      case 'virtual_pdf':
        return <Download className="w-4 h-4 text-cyan-400" />;
      default:
        return <Printer className="w-4 h-4 text-slate-300" />;
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer hover:border-slate-600"
        title={`Máy in đang chọn: ${activePrinter.name}`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse"></span>
        <div className="flex items-center space-x-1.5 max-w-[150px] sm:max-w-[190px] truncate">
          {getIcon(activePrinter.type)}
          <span className="truncate">{activePrinter.name}</span>
        </div>
        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">
          {activePrinter.defaultPaperSize}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2.5 px-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span>Chọn Máy In Cho Phiếu Này</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {printers.length} thiết bị
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60 p-1">
            {printers.map((p) => {
              const isSelected = activePrinter.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelect(p)}
                  className={`w-full p-2.5 px-3 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-950/60 text-white border border-blue-500/40'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                    <div className="shrink-0 p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                      {getIcon(p.type)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate leading-tight">{p.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        {p.connection} • Khổ {p.defaultPaperSize} ({p.defaultOrientation === 'landscape' ? 'Ngang' : 'Dọc'})
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Action: Manage Printers */}
          <div className="p-2 bg-slate-950 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setShowManagerModal(true);
              }}
              className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer border border-slate-700/80"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>⚙️ Quản Lý & Thêm Máy In...</span>
            </button>
          </div>
        </div>
      )}

      {/* Printer Manager Modal */}
      {showManagerModal && (
        <PrinterManagerModal
          isOpen={showManagerModal}
          onClose={() => {
            setShowManagerModal(false);
            loadPrinters();
          }}
          onSelectPrinter={(p) => {
            handleSelect(p);
            setShowManagerModal(false);
          }}
        />
      )}
    </div>
  );
};
