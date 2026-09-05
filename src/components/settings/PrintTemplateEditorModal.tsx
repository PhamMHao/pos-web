import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Printer,
  FileText,
  Settings2,
  Check,
  RotateCcw,
  Plus,
  Trash2,
  QrCode,
  Barcode,
  Eye,
  Building2,
  Layers,
  HelpCircle,
  Sparkles,
  AlignLeft,
  MoveDown,
} from 'lucide-react';
import { StoreSettings, PrintDocType, PrintDocConfig, PaperSize } from '../../types';
import { DEFAULT_DOC_TEMPLATES } from '../../utils/printTemplates';

export { DEFAULT_DOC_TEMPLATES };

export interface PrintTemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  docType: PrintDocType;
  docMeta: {
    label: string;
    desc: string;
    defaultSize: 'A4' | 'A5' | 'K80';
    defaultOrientation: 'portrait' | 'landscape';
  };
  initialConfig?: PrintDocConfig;
  settings: StoreSettings;
  onSave: (docType: PrintDocType, updatedConfig: PrintDocConfig) => void;
  onOpenTestPrint?: (docType: PrintDocType) => void;
}

export const PrintTemplateEditorModal: React.FC<PrintTemplateEditorModalProps> = ({
  isOpen,
  onClose,
  docType,
  docMeta,
  initialConfig,
  settings,
  onSave,
  onOpenTestPrint,
}) => {
  const defaultTemplate = DEFAULT_DOC_TEMPLATES[docType] || DEFAULT_DOC_TEMPLATES.sales_invoice;

  // Form states
  const [customTitle, setCustomTitle] = useState<string>(
    initialConfig?.customTitle !== undefined ? initialConfig.customTitle : defaultTemplate.title
  );
  const [customSubtitle, setCustomSubtitle] = useState<string>(
    initialConfig?.customSubtitle !== undefined ? initialConfig.customSubtitle : defaultTemplate.subtitle || ''
  );
  const [paperSize, setPaperSize] = useState<PaperSize>(
    initialConfig?.paperSize || defaultTemplate.defaultSize
  );
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    initialConfig?.orientation || defaultTemplate.defaultOrientation
  );
  const [emptyRowsCount, setEmptyRowsCount] = useState<number>(
    initialConfig?.emptyRowsCount !== undefined
      ? initialConfig.emptyRowsCount
      : defaultTemplate.defaultEmptyRows
  );
  const [signatureStyle, setSignatureStyle] = useState<'two_blocks' | 'five_blocks'>(
    initialConfig?.signatureStyle || defaultTemplate.signatureStyle
  );
  const [signLeftLabel, setSignLeftLabel] = useState<string>(
    initialConfig?.signLeftLabel || defaultTemplate.signLeft
  );
  const [signRightLabel, setSignRightLabel] = useState<string>(
    initialConfig?.signRightLabel || defaultTemplate.signRight
  );
  const [showVietQR, setShowVietQR] = useState<boolean>(
    initialConfig?.showVietQR !== undefined ? initialConfig.showVietQR : defaultTemplate.showVietQR
  );
  const [showBarcode, setShowBarcode] = useState<boolean>(
    initialConfig?.showBarcode !== undefined ? initialConfig.showBarcode : defaultTemplate.showBarcode
  );
  const [showDocQr, setShowDocQr] = useState<boolean>(
    initialConfig?.showDocQr !== undefined ? initialConfig.showDocQr : defaultTemplate.showDocQr
  );
  const [showBankInfo, setShowBankInfo] = useState<boolean>(
    initialConfig?.showBankInfo !== undefined ? initialConfig.showBankInfo : defaultTemplate.showBankInfo
  );
  const [showLogo, setShowLogo] = useState<boolean>(
    initialConfig?.showLogo !== undefined ? initialConfig.showLogo : defaultTemplate.showLogo
  );
  const [codePlacement, setCodePlacement] = useState<'header' | 'footer' | 'both' | 'none'>(
    initialConfig?.codePlacement || defaultTemplate.codePlacement
  );
  const [defaultWarehouse, setDefaultWarehouse] = useState<string>(
    initialConfig?.defaultWarehouse || settings.defaultWarehouse || 'Gia Phúc'
  );
  const [defaultCreator, setDefaultCreator] = useState<string>(
    initialConfig?.defaultCreator || settings.defaultCreatorName || 'Mr. Thơm'
  );

  // Notes array state
  const [notesList, setNotesList] = useState<string[]>(
    initialConfig?.notes && initialConfig.notes.length > 0
      ? initialConfig.notes
      : defaultTemplate.notes
  );

  // Tab navigation in editor
  const [activeSubTab, setActiveSubTab] = useState<'content' | 'notes' | 'layout' | 'signatures'>(
    'content'
  );
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);

  // Sync state when modal opens or docType changes
  useEffect(() => {
    if (isOpen) {
      const def = DEFAULT_DOC_TEMPLATES[docType] || DEFAULT_DOC_TEMPLATES.sales_invoice;
      setCustomTitle(initialConfig?.customTitle !== undefined ? initialConfig.customTitle : def.title);
      setCustomSubtitle(
        initialConfig?.customSubtitle !== undefined ? initialConfig.customSubtitle : def.subtitle || ''
      );
      setPaperSize(initialConfig?.paperSize || def.defaultSize);
      setOrientation(initialConfig?.orientation || def.defaultOrientation);
      setEmptyRowsCount(
        initialConfig?.emptyRowsCount !== undefined ? initialConfig.emptyRowsCount : def.defaultEmptyRows
      );
      setSignatureStyle(initialConfig?.signatureStyle || def.signatureStyle);
      setSignLeftLabel(initialConfig?.signLeftLabel || def.signLeft);
      setSignRightLabel(initialConfig?.signRightLabel || def.signRight);
      setShowVietQR(initialConfig?.showVietQR !== undefined ? initialConfig.showVietQR : def.showVietQR);
      setShowBarcode(
        initialConfig?.showBarcode !== undefined ? initialConfig.showBarcode : def.showBarcode
      );
      setShowDocQr(initialConfig?.showDocQr !== undefined ? initialConfig.showDocQr : def.showDocQr);
      setShowBankInfo(
        initialConfig?.showBankInfo !== undefined ? initialConfig.showBankInfo : def.showBankInfo
      );
      setShowLogo(initialConfig?.showLogo !== undefined ? initialConfig.showLogo : def.showLogo);
      setCodePlacement(initialConfig?.codePlacement || def.codePlacement);
      setDefaultWarehouse(initialConfig?.defaultWarehouse || settings.defaultWarehouse || 'Gia Phúc');
      setDefaultCreator(initialConfig?.defaultCreator || settings.defaultCreatorName || 'Mr. Thơm');
      setNotesList(
        initialConfig?.notes && initialConfig.notes.length > 0 ? initialConfig.notes : def.notes
      );
    }
  }, [isOpen, docType, initialConfig, settings]);

  if (!isOpen) return null;

  // Notes operations
  const handleAddNote = () => {
    const nextIndex = notesList.length + 1;
    setNotesList([...notesList, `${nextIndex}. Nội dung ghi chú mới`]);
  };

  const handleUpdateNote = (index: number, text: string) => {
    const updated = [...notesList];
    updated[index] = text;
    setNotesList(updated);
  };

  const handleDeleteNote = (index: number) => {
    const updated = notesList.filter((_, i) => i !== index);
    setNotesList(updated);
  };

  const handleResetToStandard = () => {
    const def = DEFAULT_DOC_TEMPLATES[docType] || DEFAULT_DOC_TEMPLATES.sales_invoice;
    setCustomTitle(def.title);
    setCustomSubtitle(def.subtitle || '');
    setPaperSize(def.defaultSize);
    setOrientation(def.defaultOrientation);
    setEmptyRowsCount(def.defaultEmptyRows);
    setSignatureStyle(def.signatureStyle);
    setSignLeftLabel(def.signLeft);
    setSignRightLabel(def.signRight);
    setShowVietQR(def.showVietQR);
    setShowBarcode(def.showBarcode);
    setShowDocQr(def.showDocQr);
    setShowBankInfo(def.showBankInfo);
    setShowLogo(def.showLogo);
    setCodePlacement(def.codePlacement);
    setNotesList([...def.notes]);
  };

  const handleSaveConfig = () => {
    const updated: PrintDocConfig = {
      paperSize,
      orientation,
      emptyRowsCount,
      signatureStyle,
      showVietQR,
      customTitle: customTitle.trim(),
      customSubtitle: customSubtitle.trim(),
      notes: notesList.map((n) => n.trim()).filter((n) => n.length > 0),
      showLogo,
      showBarcode,
      showDocQr,
      showBankInfo,
      codePlacement,
      signLeftLabel: signLeftLabel.trim(),
      signRightLabel: signRightLabel.trim(),
      defaultWarehouse: defaultWarehouse.trim(),
      defaultCreator: defaultCreator.trim(),
    };

    onSave(docType, updated);
    setSaveSuccessToast(true);
    setTimeout(() => {
      setSaveSuccessToast(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">Chỉnh Sửa Mẫu In: {docMeta.label}</h2>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    paperSize === 'A5'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : paperSize === 'A4'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}
                >
                  Khổ {paperSize}
                </span>
              </div>
              <p className="text-xs text-slate-400">{docMeta.desc}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleResetToStandard}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
              title="Khôi phục các thông số và nội dung ghi chú chuẩn mặc định"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Khôi phục mặc định</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-tabs Navigation */}
        <div className="px-6 border-b border-slate-800 bg-slate-900 flex space-x-1 overflow-x-auto shrink-0 py-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('content')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shrink-0 ${
              activeSubTab === 'content'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>1. Tiêu Đề & Thông Tin Phiếu</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('notes')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shrink-0 ${
              activeSubTab === 'notes'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
            <span>2. Ghi Chú & Điều Khoản ({notesList.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('layout')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shrink-0 ${
              activeSubTab === 'layout'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3. Khổ Giấy, QR & Barcode</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('signatures')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shrink-0 ${
              activeSubTab === 'signatures'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>4. Khối Ký Tên & Phân Quyền</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB 1: TIÊU ĐỀ & THÔNG TIN CHỨNG TỪ */}
          {activeSubTab === 'content' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <h4 className="font-bold text-sm text-blue-400 flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Tiêu Đề Chứng Từ Hiển Thị Khi In</span>
                </h4>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Tên tiêu đề chính (In hoa đậm giữa trang):
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder={defaultTemplate.title}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-bold text-sm uppercase focus:border-blue-500 outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Ví dụ: <em>HÓA ĐƠN BÁN HÀNG KIÊM PHIẾU XUẤT KHO</em>, <em>BẢNG BÁO GIÁ THIẾT BỊ</em>...
                  </p>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Dòng tiêu đề phụ / Thông tư quy định (Tùy chọn):
                  </label>
                  <input
                    type="text"
                    value={customSubtitle}
                    onChange={(e) => setCustomSubtitle(e.target.value)}
                    placeholder="Mẫu số 02 - TT (Ban hành theo TT số 200/2014/TT-BTC) hoặc để trống..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white italic focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <h4 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>Thông Tin Mặc Định Khi Lập Phiếu Này</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Kho hàng mặc định:
                    </label>
                    <input
                      type="text"
                      value={defaultWarehouse}
                      onChange={(e) => setDefaultWarehouse(e.target.value)}
                      placeholder="Gia Phúc"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Người lập / Bán hàng mặc định:
                    </label>
                    <input
                      type="text"
                      value={defaultCreator}
                      onChange={(e) => setDefaultCreator(e.target.value)}
                      placeholder="Mr. Thơm"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GHI CHÚ & ĐIỀU KHOẢN */}
          {activeSubTab === 'notes' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <h4 className="font-bold text-sm text-amber-400 flex items-center space-x-2">
                      <AlignLeft className="w-4 h-4" />
                      <span>Danh Sách Các Dòng Ghi Chú & Điều Khoản Dưới Bảng</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Các dòng ghi chú này sẽ in tuần tự ngay dưới bảng mặt hàng theo mẫu phiếu (Mục 1, 2, 3, 4...).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddNote}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Dòng Ghi Chú</span>
                  </button>
                </div>

                {notesList.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                    <p>Chưa có dòng ghi chú nào. Mẫu in sẽ không hiển thị phần Ghi chú chân trang.</p>
                    <button
                      type="button"
                      onClick={() => setNotesList([...defaultTemplate.notes])}
                      className="mt-2 text-blue-400 hover:text-blue-300 font-semibold underline"
                    >
                      Nạp mẫu ghi chú chuẩn cho biểu mẫu này
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {notesList.map((noteItem, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800 group hover:border-slate-700 transition-colors"
                      >
                        <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-blue-400 text-xs shrink-0 mt-1">
                          {index + 1}
                        </span>
                        <textarea
                          rows={2}
                          value={noteItem}
                          onChange={(e) => handleUpdateNote(index, e.target.value)}
                          placeholder={`Nội dung mục ${index + 1}...`}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-blue-500 outline-none text-xs resize-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(index)}
                          className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors shrink-0 mt-1"
                          title="Xóa dòng ghi chú này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 flex justify-between items-center text-[11px] text-slate-500">
                  <span>
                    💡 Bạn có thể chèn số điện thoại hotline, điều kiện thanh toán hoặc cam kết bảo hành riêng cho từng form.
                  </span>
                  <button
                    type="button"
                    onClick={() => setNotesList([...defaultTemplate.notes])}
                    className="text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    Khôi phục ghi chú gốc
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KHỔ GIẤY, QR & BARCODE */}
          {activeSubTab === 'layout' && (
            <div className="space-y-4">
              {/* Paper Layout */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <h4 className="font-bold text-sm text-blue-400 flex items-center space-x-2">
                  <Layers className="w-4 h-4" />
                  <span>Cấu Hình Khổ Giấy & Bố Cục Trang</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Khổ giấy in:</label>
                    <select
                      value={paperSize}
                      onChange={(e) => setPaperSize(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:border-blue-500 outline-none"
                    >
                      <option value="A4">Khổ A4 (210 x 297 mm)</option>
                      <option value="A5">Khổ A5 (148 x 210 mm)</option>
                      <option value="K80">Khổ K80 (80 mm)</option>
                      <option value="K58">Khổ K58 (58 mm)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Hướng in:</label>
                    <select
                      value={orientation}
                      onChange={(e) => setOrientation(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:border-blue-500 outline-none"
                    >
                      <option value="portrait">Dọc (Portrait) - Tiêu chuẩn</option>
                      <option value="landscape">Ngang (Landscape) - Bảng rộng</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Vị trí in Mã vạch / QR:</label>
                    <select
                      value={codePlacement}
                      onChange={(e) => setCodePlacement(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:border-blue-500 outline-none"
                    >
                      <option value="header">Chỉ đầu trang (Header)</option>
                      <option value="footer">Chỉ chân trang (Footer)</option>
                      <option value="both">Cả đầu trang & chân trang</option>
                      <option value="none">Không in mã (Ẩn)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Số dòng trống kẻ sẵn:
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="15"
                      value={emptyRowsCount}
                      onChange={(e) => setEmptyRowsCount(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-center font-bold focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* QR & Barcode Toggles */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <h4 className="font-bold text-sm text-emerald-400 flex items-center space-x-2">
                  <QrCode className="w-4 h-4" />
                  <span>Cấu Hình Hiển Thị Mã Vạch, QR Code & Logo</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center space-x-3 p-2.5 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={showLogo}
                      onChange={(e) => setShowLogo(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-0"
                    />
                    <div>
                      <span className="font-bold text-white block">Hiển thị Logo Công Ty</span>
                      <span className="text-[11px] text-slate-400">In logo thương hiệu ở góc trên đầu phiếu</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-2.5 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={showBarcode}
                      onChange={(e) => setShowBarcode(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-0"
                    />
                    <div>
                      <span className="font-bold text-white block">Hiển thị Mã Vạch Số Phiếu (Barcode)</span>
                      <span className="text-[11px] text-slate-400">Barcode Code 128 giúp máy quét dễ dàng tra cứu</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-2.5 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={showDocQr}
                      onChange={(e) => setShowDocQr(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-0"
                    />
                    <div>
                      <span className="font-bold text-white block">Hiển thị Mã QR Tra Cứu ERP</span>
                      <span className="text-[11px] text-slate-400">Quét bằng camera điện thoại để kiểm tra chứng từ</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-2.5 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={showVietQR}
                      onChange={(e) => setShowVietQR(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-0"
                    />
                    <div>
                      <span className="font-bold text-white block">Hiển thị VietQR Thanh Toán Ngân Hàng</span>
                      <span className="text-[11px] text-slate-400">Tạo mã QR kèm đúng số tiền và nội dung chuyển khoản</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-2.5 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={showBankInfo}
                      onChange={(e) => setShowBankInfo(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-0"
                    />
                    <div>
                      <span className="font-bold text-white block">
                        Hiển thị Khối Số tiền bằng chữ & Tài khoản ngân hàng
                      </span>
                      <span className="text-[11px] text-slate-400">
                        In dòng Số tiền bằng chữ, Tên ngân hàng, Số tài khoản & Chủ tài khoản
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CHỮ KÝ */}
          {activeSubTab === 'signatures' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <h4 className="font-bold text-sm text-purple-400 flex items-center space-x-2">
                  <Building2 className="w-4 h-4" />
                  <span>Cấu Hình Khối Chữ Ký Dưới Cuối Trang</span>
                </h4>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kiểu chữ ký:</label>
                  <select
                    value={signatureStyle}
                    onChange={(e) => setSignatureStyle(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:border-blue-500 outline-none"
                  >
                    <option value="two_blocks">2 Khối (Bên nhận / Khách hàng & Bên lập / Đại diện bán hàng)</option>
                    <option value="five_blocks">
                      4 - 5 Khối đầy đủ (Người lập, Người giao, Thủ kho, Kế toán trưởng, Giám đốc)
                    </option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Tiêu đề khối ký bên trái:
                    </label>
                    <input
                      type="text"
                      value={signLeftLabel}
                      onChange={(e) => setSignLeftLabel(e.target.value)}
                      placeholder="Khách hàng / Người nhận"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Tiêu đề khối ký bên phải:
                    </label>
                    <input
                      type="text"
                      value={signRightLabel}
                      onChange={(e) => setSignRightLabel(e.target.value)}
                      placeholder="Người lập phiếu / Đại diện bán hàng"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2">
            {onOpenTestPrint && (
              <button
                type="button"
                onClick={() => onOpenTestPrint(docType)}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold border border-slate-700 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Xem Trước & In Thử</span>
              </button>
            )}
            {saveSuccessToast && (
              <span className="flex items-center space-x-1 text-emerald-400 text-xs font-bold animate-fade-in">
                <Check className="w-4 h-4" />
                <span>Đã lưu mẫu in thành công!</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSaveConfig}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Cấu Hình Mẫu Phiếu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
