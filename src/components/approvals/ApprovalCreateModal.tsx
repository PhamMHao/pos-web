import React, { useState } from 'react';
import { X, PlusCircle, ShieldCheck, AlertTriangle } from 'lucide-react';
import { ApprovalModuleType, ApprovalWorkflowTemplate } from './approvals.types';

interface ApprovalCreateModalProps {
  initialTemplate?: ApprovalWorkflowTemplate | null;
  currentUser: any;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export const ApprovalCreateModal: React.FC<ApprovalCreateModalProps> = ({
  initialTemplate,
  currentUser,
  onClose,
  onSubmit,
}) => {
  const [moduleType, setModuleType] = useState<ApprovalModuleType>(
    initialTemplate?.moduleType || 'purchase_order'
  );
  const [referenceDocCode, setReferenceDocCode] = useState(
    initialTemplate?.moduleType === 'purchase_request'
      ? `PR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      : initialTemplate?.moduleType === 'purchase_order'
      ? `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      : `CT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [title, setTitle] = useState(
    initialTemplate ? `Tờ trình phê duyệt ${initialTemplate.name}` : ''
  );
  const [departmentName, setDepartmentName] = useState(
    currentUser?.department || 'Phòng Kỹ Thuật & Vận Hành'
  );
  const [requesterName, setRequesterName] = useState(
    currentUser?.fullName || currentUser?.username || 'Chuyên viên đề xuất'
  );
  const [totalAmount, setTotalAmount] = useState<number>(25000000);
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [summaryNotes, setSummaryNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tiêu đề tờ trình.');
      return;
    }
    if (!referenceDocCode.trim()) {
      setErrorMsg('Vui lòng nhập mã chứng từ tham chiếu.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await onSubmit({
        moduleType,
        templateCode: initialTemplate?.code,
        title: title.trim(),
        referenceDocCode: referenceDocCode.trim(),
        departmentName: departmentName.trim(),
        requesterName: requesterName.trim(),
        totalAmount: Number(totalAmount) || 0,
        priority,
        summaryNotes: summaryNotes.trim(),
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Lỗi khi tạo tờ trình.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Khởi Tạo Phiếu Trình Ký Mới</h3>
              <p className="text-[11px] text-slate-500">
                Tự động áp dụng khóa duyệt tuần tự liên phòng ban
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 block mb-1">Khâu Chuỗi Cung Ứng (*):</label>
            <select
              value={moduleType}
              onChange={(e) => setModuleType(e.target.value as ApprovalModuleType)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="purchase_request">1. Đề xuất mua sắm (PR)</option>
              <option value="purchase_order">2. Đơn mua hàng (PO)</option>
              <option value="goods_receipt">3. Nhập kho & KCS (GRN)</option>
              <option value="goods_issue">4. Xuất kho vật tư (PXK)</option>
              <option value="work_order">5. Lệnh sản xuất (WO)</option>
              <option value="delivery">6. Giao hàng & POD</option>
              <option value="accounting_audit">7. Kế toán đối soát</option>
              <option value="cash_settlement">8. Thu / Chi Quỹ</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Mã Chứng Từ Tham Chiếu (*):</label>
              <input
                type="text"
                value={referenceDocCode}
                onChange={(e) => setReferenceDocCode(e.target.value)}
                placeholder="VD: PO-2026-0099"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Tổng Tiền Dự Toán (VNĐ):</label>
              <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Tiêu Đề Tờ Trình (*):</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Tờ trình phê duyệt mua sắm linh kiện máy chủ..."
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Người Đề Xuất:</label>
              <input
                type="text"
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Phòng Ban:</label>
              <input
                type="text"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Độ Ưu Tiên:</label>
            <select
              value={priority}
              onChange={(e: any) => setPriority(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="normal">Bình thường</option>
              <option value="high">Ưu tiên cao</option>
              <option value="urgent">Khẩn cấp (SLA rút ngắn)</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Nội Dung Thuyết Minh &amp; Sự Cần Thiết:</label>
            <textarea
              value={summaryNotes}
              onChange={(e) => setSummaryNotes(e.target.value)}
              placeholder="Nêu rõ mục đích, số lượng, căn cứ theo hợp đồng hoặc dự án..."
              rows={3}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang Tạo...' : 'Tạo Tờ Trình Ngay'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
