import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Wrench,
  QrCode,
  Calendar,
  User,
  Phone,
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  ArrowRight,
  Plus,
  Trash2,
  Send,
  Sparkles,
  CreditCard,
  Building2,
  Check,
} from 'lucide-react';
import {
  WarrantyTicket,
  WarrantyStatus,
  WarrantyPartItem,
  WarrantyTimelineEvent,
  SerialDeviceRecord,
  Product,
} from '../../types';
import { formatVND } from '../../utils/vietqr';
import { executeSwapSerialTransaction } from '../../utils/serialTransactionManager';

interface WarrantyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: WarrantyTicket | null;
  onUpdateTicket: (updated: WarrantyTicket) => void;
  onOpenPrint: (ticket: WarrantyTicket, mode: 'receipt' | 'handover') => void;
  serialRecords?: SerialDeviceRecord[];
  onSaveSerialRecords?: (records: SerialDeviceRecord[] | ((prev: SerialDeviceRecord[]) => SerialDeviceRecord[])) => void;
  products?: Product[];
  onSaveProduct?: (product: Product) => void;
  onAdjustStock?: (log: any) => void;
}

export const WarrantyDetailModal: React.FC<WarrantyDetailModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onUpdateTicket,
  onOpenPrint,
  serialRecords = [],
  onSaveSerialRecords,
  products = [],
  onSaveProduct,
  onAdjustStock,
}) => {
  if (!isOpen || !ticket) return null;

  const [status, setStatus] = useState<WarrantyStatus>(ticket.status);
  const [diagnosis, setDiagnosis] = useState(ticket.technicianDiagnosis || '');
  const [resolution, setResolution] = useState(ticket.resolution || '');
  const [technicianName, setTechnicianName] = useState(ticket.technicianName);
  const [laborCost, setLaborCost] = useState(ticket.laborCost || 0);
  const [discountAmount, setDiscountAmount] = useState(ticket.discountAmount || 0);
  const [paymentStatus, setPaymentStatus] = useState(ticket.paymentStatus || 'free');
  const [returnedToPerson, setReturnedToPerson] = useState(ticket.returnedToPerson || ticket.customerName);
  const [returnNote, setReturnNote] = useState(ticket.returnNote || '');
  const [warrantyExtensionMonths, setWarrantyExtensionMonths] = useState(ticket.warrantyExtensionMonths || 6);

  // Swap Serial State (Đổi mới 1-1)
  const [swapNewSerial, setSwapNewSerial] = useState('');
  const [swapError, setSwapError] = useState<string | null>(null);
  const [swapSuccessMessage, setSwapSuccessMessage] = useState<string | null>(null);

  // Parts List
  const [parts, setParts] = useState<WarrantyPartItem[]>(ticket.parts || []);
  const [newPartName, setNewPartName] = useState('');
  const [newPartPrice, setNewPartPrice] = useState(0);
  const [newPartQty, setNewPartQty] = useState(1);
  const [newPartUnderWarranty, setNewPartUnderWarranty] = useState(ticket.type === 'warranty');

  // Timeline Action note
  const [newTimelineNote, setNewTimelineNote] = useState('');

  const handleAddPart = () => {
    if (!newPartName.trim()) return;
    const item: WarrantyPartItem = {
      id: 'part-' + Date.now(),
      partName: newPartName.trim(),
      quantity: Number(newPartQty) || 1,
      unit: 'Cái',
      unitPrice: Number(newPartPrice) || 0,
      isUnderWarranty: newPartUnderWarranty,
      warrantyMonths: 6,
    };
    const updatedParts = [...parts, item];
    setParts(updatedParts);
    setNewPartName('');
    setNewPartPrice(0);
    setNewPartQty(1);
  };

  const handleRemovePart = (id: string) => {
    setParts(parts.filter((p) => p.id !== id));
  };

  const partsTotal = parts.reduce(
    (sum, p) => sum + (p.isUnderWarranty ? 0 : p.quantity * p.unitPrice),
    0
  );
  const totalCost = Math.max(0, (ticket.type === 'warranty' ? 0 : laborCost) + partsTotal - discountAmount);

  const handleStatusChange = (newStatus: WarrantyStatus) => {
    setStatus(newStatus);
    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');

    let actionLabel = `Cập nhật trạng thái: ${newStatus}`;
    if (newStatus === 'diagnosing') actionLabel = 'Chuyển sang bước: Kiểm tra & Chẩn đoán';
    if (newStatus === 'repairing') actionLabel = 'Chuyển sang bước: Đang sửa chữa / bảo dưỡng';
    if (newStatus === 'waiting_parts') actionLabel = 'Chờ linh kiện thay thế từ nhà máy';
    if (newStatus === 'sent_vendor') actionLabel = 'Chuyển gửi hãng bảo hành';
    if (newStatus === 'ready_to_return') actionLabel = 'Hoàn tất kỹ thuật - Sẵn sàng bàn giao cho khách';
    if (newStatus === 'returned') actionLabel = 'Bàn giao trả máy cho khách hàng & Ký biên bản';
    if (newStatus === 'replaced_new') actionLabel = 'Đổi mới sản phẩm 1 đổi 1 cho khách';

    const newEvent: WarrantyTimelineEvent = {
      id: 'tl-' + Date.now(),
      timestamp: nowStr,
      action: actionLabel,
      actor: technicianName,
      notes: newTimelineNote || undefined,
      status: newStatus,
    };

    const updatedTicket: WarrantyTicket = {
      ...ticket,
      status: newStatus,
      technicianDiagnosis: diagnosis,
      resolution,
      technicianName,
      parts,
      laborCost: ticket.type === 'warranty' ? 0 : laborCost,
      partsCost: partsTotal,
      discountAmount,
      totalFee: totalCost,
      paymentStatus: totalCost === 0 ? 'free' : paymentStatus,
      returnedToPerson: newStatus === 'returned' ? returnedToPerson : ticket.returnedToPerson,
      actualReturnDate: newStatus === 'returned' ? nowStr : ticket.actualReturnDate,
      returnNote: newStatus === 'returned' ? returnNote : ticket.returnNote,
      warrantyExtensionMonths,
      timeline: [newEvent, ...ticket.timeline],
    };

    onUpdateTicket(updatedTicket);
    setNewTimelineNote('');
  };

  const handleExecuteSwapSerial = () => {
    if (!swapNewSerial.trim()) {
      setSwapError('Vui lòng nhập hoặc quét số Serial mới để đổi cho khách hàng!');
      return;
    }

    const swapResult = executeSwapSerialTransaction({
      oldSerialNumber: ticket.serialNumber,
      newSerialNumber: swapNewSerial.trim(),
      technicianName,
      ticketCode: ticket.code,
      warrantyExtensionMonths,
      serialRecords,
      products,
    });

    if (!swapResult.success) {
      setSwapError(swapResult.error || 'Lỗi khi thực thi đổi mới Serial!');
      return;
    }

    if (swapResult.updatedSerialRecords && onSaveSerialRecords) {
      onSaveSerialRecords(swapResult.updatedSerialRecords);
    }
    if (swapResult.updatedProducts && onSaveProduct) {
      swapResult.updatedProducts.forEach((p) => onSaveProduct(p));
    }
    if (swapResult.replacementLog && onAdjustStock) {
      onAdjustStock(swapResult.replacementLog);
    }

    setSwapSuccessMessage(`Đã đổi mới thành công sang Serial "${swapNewSerial.trim().toUpperCase()}". Serial cũ đã chuyển sang hỏng (defective) và Serial mới đã kế thừa thời hạn bảo hành.`);
    setSwapError(null);

    // Update ticket status to replaced_new
    handleStatusChange('replaced_new');
  };

  const handleSaveFull = () => {
    const updatedTicket: WarrantyTicket = {
      ...ticket,
      status,
      technicianDiagnosis: diagnosis,
      resolution,
      technicianName,
      parts,
      laborCost: ticket.type === 'warranty' ? 0 : laborCost,
      partsCost: partsTotal,
      discountAmount,
      totalFee: totalCost,
      paymentStatus: totalCost === 0 ? 'free' : paymentStatus,
      returnedToPerson,
      returnNote,
      warrantyExtensionMonths,
      actualReturnDate: status === 'returned' && !ticket.actualReturnDate ? new Date().toISOString().slice(0, 16).replace('T', ' ') : ticket.actualReturnDate,
    };

    onUpdateTicket(updatedTicket);
    onClose();
  };

  const qrCodeData = `https://vietqr.me/warranty?code=${ticket.code}&sn=${ticket.serialNumber}`;
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
    qrCodeData
  )}`;

  const getStatusBadge = (st: WarrantyStatus) => {
    switch (st) {
      case 'received':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">Mới Tiếp Nhận</span>;
      case 'diagnosing':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Đang Kiểm Tra / Chẩn Đoán</span>;
      case 'repairing':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">Đang Sửa Chữa / Bảo Dưỡng</span>;
      case 'waiting_parts':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">Chờ Linh Kiện</span>;
      case 'sent_vendor':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Chuyển Hãng Bảo Hành</span>;
      case 'ready_to_return':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Sẵn Sàng Trả Khách</span>;
      case 'returned':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">Đã Bàn Giao Trả Khách</span>;
      case 'replaced_new':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Đã Đổi Mới (1-1)</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/20 text-slate-300">Không Thể Sửa</span>;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-white font-mono">{ticket.code}</h3>
                {getStatusBadge(status)}
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {ticket.type === 'warranty' ? 'Bảo Hành' : ticket.type === 'maintenance' ? 'Bảo Trì' : 'Sửa Chữa'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Serial / IMEI: <strong className="font-mono text-cyan-300">{ticket.serialNumber}</strong> | Khách hàng: {ticket.customerName} ({ticket.customerPhone})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => onOpenPrint(ticket, 'receipt')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors border border-slate-700"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span>In Phiếu Nhận</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenPrint(ticket, 'handover')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors border border-slate-700"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>In Biên Bản Trả Hàng</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Workflow Status Bar & Quick Actions */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Tiến Trình Xử Lý & Trạng Thái Phiếu
              </span>
              <span className="text-xs text-slate-400">
                Hẹn trả: <strong className="text-cyan-400 font-mono">{ticket.expectedReturnDate}</strong>
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { id: 'received', label: '1. Tiếp Nhận', color: 'hover:border-blue-500' },
                { id: 'diagnosing', label: '2. Chẩn Đoán', color: 'hover:border-amber-500' },
                { id: 'repairing', label: '3. Đang Sửa Chữa', color: 'hover:border-purple-500' },
                { id: 'waiting_parts', label: 'Chờ Linh Kiện', color: 'hover:border-rose-500' },
                { id: 'sent_vendor', label: 'Chuyển Hãng', color: 'hover:border-indigo-500' },
                { id: 'ready_to_return', label: '4. Sẵn Sàng Trả', color: 'hover:border-emerald-500' },
                { id: 'returned', label: '5. Đã Trả Hàng', color: 'hover:border-teal-500' },
                { id: 'replaced_new', label: 'Đổi Mới 1-1', color: 'hover:border-cyan-500' },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => handleStatusChange(st.id as WarrantyStatus)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    status === st.id
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20 scale-105'
                      : 'bg-slate-900 border-slate-800 text-slate-400 ' + st.color
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Swap Serial (Đổi Mới 1-1) Interactive Panel */}
            {status === 'replaced_new' && (
              <div className="p-4 bg-cyan-950/40 border border-cyan-500/40 rounded-2xl space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center space-x-2 text-cyan-300 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>QUY TRÌNH ĐỔI MỚI THIẾT BỊ 1-1 & KẾ THỪA BẢO HÀNH</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Serial cũ (<strong className="font-mono text-white">{ticket.serialNumber}</strong>) sẽ được chuyển sang trạng thái <em>Lỗi kỹ thuật (defective)</em>. Serial mới sẽ được xuất kho và kế thừa thời hạn bảo hành còn lại của khách hàng.
                </p>

                <div className="flex flex-col sm:flex-row gap-2 items-center">
                  <div className="relative flex-1 w-full">
                    <input
                      type="text"
                      value={swapNewSerial}
                      onChange={(e) => setSwapNewSerial(e.target.value.toUpperCase())}
                      placeholder="Nhập hoặc quét số Serial mới thay thế..."
                      className="w-full pl-3 pr-3 py-2 bg-slate-900 border border-cyan-500/50 rounded-xl text-white text-xs font-mono font-bold focus:outline-none focus:border-cyan-400 uppercase"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleExecuteSwapSerial}
                    className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-1.5 cursor-pointer transition-all shrink-0"
                  >
                    <Check className="w-4 h-4" />
                    <span>Xác Nhận Đổi Mới 1-1</span>
                  </button>
                </div>

                {swapError && (
                  <div className="p-2.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{swapError}</span>
                  </div>
                )}

                {swapSuccessMessage && (
                  <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{swapSuccessMessage}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Grid Information: Device, Customer & QR Code */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Device Info */}
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold uppercase text-cyan-400 flex items-center space-x-1.5">
                <Package className="w-4 h-4" />
                <span>Thiết Bị & Serial</span>
              </h4>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-white text-sm">{ticket.productName}</p>
                {ticket.model && <p className="text-slate-400 font-mono">Model: {ticket.model}</p>}
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 font-mono text-cyan-300 text-xs font-black">
                  SN: {ticket.serialNumber}
                </div>
                {ticket.orderCode && (
                  <p className="text-[11px] text-slate-400">
                    Hóa đơn mua: <span className="font-mono font-bold text-emerald-400">{ticket.orderCode}</span>
                  </p>
                )}
                <p className="text-[11px] text-slate-400">
                  Ngoại quan: <span className="text-slate-200">{ticket.cosmeticCondition}</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Phụ kiện: <span className="text-slate-200">{ticket.accessoriesIncluded || 'Không có'}</span>
                </p>
              </div>
            </div>

            {/* Customer & Technician */}
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold uppercase text-cyan-400 flex items-center space-x-1.5">
                <User className="w-4 h-4" />
                <span>Khách Hàng & KTV Phụ Trách</span>
              </h4>
              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px]">Khách hàng:</span>
                  <p className="font-bold text-white">{ticket.customerName}</p>
                  <p className="font-mono text-cyan-400">{ticket.customerPhone}</p>
                </div>
                {ticket.customerAddress && (
                  <p className="text-[11px] text-slate-400 truncate">{ticket.customerAddress}</p>
                )}
                <div className="pt-2 border-t border-slate-800">
                  <label className="block text-[11px] text-slate-400 mb-1">KTV Phụ Trách:</label>
                  <select
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Trần Văn Hưng (Kỹ Thuật Trưởng)">Trần Văn Hưng (Kỹ Thuật Trưởng)</option>
                    <option value="Nguyễn Quốc Tuấn (Kỹ Thuật Viên)">Nguyễn Quốc Tuấn (Kỹ Thuật Viên)</option>
                    <option value="Lê Hoàng Long (Kỹ Thuật Phần Cứng)">Lê Hoàng Long (Kỹ Thuật Phần Cứng)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* QR Code & Online Status */}
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center">
              <div className="p-2 bg-white rounded-xl shadow-md mb-2">
                <img
                  src={qrImageSrc}
                  alt="QR Code Tra Cứu"
                  className="w-24 h-24 object-contain"
                  crossOrigin="anonymous"
                />
              </div>
              <span className="text-[10px] text-cyan-300 font-mono">Quét QR tra cứu bảo hành</span>
              <p className="text-[9px] text-slate-500 mt-0.5">vietqr.me/warranty?code={ticket.code}</p>
            </div>
          </div>

          {/* Issue & Diagnosis & Resolution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3 p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-xs font-bold text-rose-400 mb-1">
                  Hiện Tượng Lỗi Khách Báo Khi Nhận
                </label>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300">
                  {ticket.issueDescription}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-400 mb-1">
                  Kết Quả Kiểm Tra & Chẩn Đoán Của Kỹ Thuật
                </label>
                <textarea
                  rows={2}
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Ghi nhận nguyên nhân hỏng hóc, linh kiện bị cháy/lỗi..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-3 p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-xs font-bold text-emerald-400 mb-1">
                  Phương Án & Kết Quả Xử Lý Kỹ Thuật
                </label>
                <textarea
                  rows={2}
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Mô tả các bước đã sửa chữa, thay thế, bảo dưỡng..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {status === 'returned' && (
                <div className="p-3 bg-teal-950/40 border border-teal-800/60 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-teal-300">Thông Tin Bàn Giao Trả Khách</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400">Người nhận máy:</span>
                      <input
                        type="text"
                        value={returnedToPerson}
                        onChange={(e) => setReturnedToPerson(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Gia hạn bảo hành (tháng):</span>
                      <input
                        type="number"
                        min="1"
                        max="36"
                        value={warrantyExtensionMonths}
                        onChange={(e) => setWarrantyExtensionMonths(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Replacement Parts & Billing */}
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-cyan-400 flex items-center space-x-1.5">
                <Wrench className="w-4 h-4" />
                <span>Linh Kiện Thay Thế & Chi Phí Dịch Vụ</span>
              </h4>
              <span className="text-xs text-slate-400">
                Tổng cộng:{' '}
                <strong className="text-emerald-400 font-mono text-sm">
                  {ticket.type === 'warranty' ? '0 đ (Bảo hành miễn phí)' : formatVND(totalCost)}
                </strong>
              </span>
            </div>

            {/* Parts Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-2.5">Tên Linh Kiện</th>
                    <th className="p-2.5 text-center">Số Lượng</th>
                    <th className="p-2.5 text-right">Đơn Giá</th>
                    <th className="p-2.5 text-center">Chế Độ</th>
                    <th className="p-2.5 text-right">Thành Tiền</th>
                    <th className="p-2.5 text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {parts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-900/50">
                      <td className="p-2.5 font-medium text-white">{p.partName}</td>
                      <td className="p-2.5 text-center font-mono">{p.quantity} {p.unit}</td>
                      <td className="p-2.5 text-right font-mono">{formatVND(p.unitPrice)}</td>
                      <td className="p-2.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.isUnderWarranty
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {p.isUnderWarranty ? 'Miễn Phí BH' : 'Tính Tiền'}
                        </span>
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-emerald-400">
                        {p.isUnderWarranty ? '0 đ' : formatVND(p.quantity * p.unitPrice)}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemovePart(p.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {parts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-3 text-center text-slate-500 text-xs">
                        Chưa có linh kiện thay thế nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Add Part Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800 items-center text-xs">
              <div className="sm:col-span-5">
                <input
                  type="text"
                  value={newPartName}
                  onChange={(e) => setNewPartName(e.target.value)}
                  placeholder="Tên linh kiện (VD: Cụm dao cắt, Đầu cos, Keo tản nhiệt...)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="number"
                  min="1"
                  value={newPartQty}
                  onChange={(e) => setNewPartQty(Number(e.target.value))}
                  placeholder="SL"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono text-center focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="number"
                  value={newPartPrice}
                  onChange={(e) => setNewPartPrice(Number(e.target.value))}
                  placeholder="Đơn giá"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono text-right focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2 flex items-center space-x-1">
                <label className="flex items-center space-x-1 text-[11px] text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPartUnderWarranty}
                    onChange={(e) => setNewPartUnderWarranty(e.target.checked)}
                    className="rounded bg-slate-950 text-cyan-500 focus:ring-0"
                  />
                  <span>Miễn phí</span>
                </label>
              </div>
              <div className="sm:col-span-1">
                <button
                  type="button"
                  onClick={handleAddPart}
                  className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Cost Summary & Payment */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2 border-t border-slate-800">
              <div className="flex items-center space-x-3 text-xs">
                <span className="text-slate-400">Trạng thái thanh toán:</span>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                >
                  <option value="free">Miễn Phí Bảo Hành (0 đ)</option>
                  <option value="paid">Đã Thanh Toán Đủ</option>
                  <option value="unpaid">Chưa Thanh Toán (Ghi Nợ)</option>
                  <option value="partial">Thanh Toán Một Phần</option>
                </select>
              </div>

              <div className="flex items-center space-x-4 text-xs font-mono">
                <div>
                  <span className="text-slate-400">Công dịch vụ:</span>
                  <input
                    type="number"
                    value={laborCost}
                    onChange={(e) => setLaborCost(Number(e.target.value))}
                    className="w-24 ml-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-white text-right font-mono"
                  />
                </div>
                <div>
                  <span className="text-slate-400">Giảm giá:</span>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="w-20 ml-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-rose-400 text-right font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Timeline History */}
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase text-cyan-400 flex items-center space-x-1.5">
              <Clock className="w-4 h-4" />
              <span>Nhật Ký Tiến Trình Bảo Hành (Timeline)</span>
            </h4>

            <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
              {ticket.timeline.map((ev) => (
                <div key={ev.id} className="relative flex items-start space-x-3 pl-8 text-xs">
                  <div className="absolute left-2 top-1 w-3 h-3 rounded-full bg-cyan-500 ring-4 ring-slate-950" />
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">{ev.action}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{ev.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Thực hiện: <strong className="text-slate-300">{ev.actor}</strong></p>
                    {ev.notes && <p className="text-slate-300 text-xs mt-0.5">{ev.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400">
            Tổng chi phí: <strong className="text-emerald-400 font-mono text-sm ml-1">{formatVND(totalCost)}</strong>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleSaveFull}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-1.5 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Lưu Cập Nhật</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
