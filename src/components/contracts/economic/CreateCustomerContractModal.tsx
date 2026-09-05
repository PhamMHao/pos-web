import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  FileText,
  Building2,
  DollarSign,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { CreateContractPayload, ContractType } from '../contracts.types';
import { quotesApi } from '../../../features/quotes/api/quotesApi';
import { PriceQuote } from '../../../types';
import { formatVND } from '../../../utils/currency';

export interface CreateCustomerContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateContractPayload) => Promise<void>;
  onSubmitFromQuote: (quoteId: string, notes?: string) => Promise<void>;
  initialQuoteId?: string | null;
}

export const CreateCustomerContractModal: React.FC<CreateCustomerContractModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onSubmitFromQuote,
  initialQuoteId,
}) => {
  const [creationMode, setCreationMode] = useState<'quote' | 'manual'>('quote');
  const [approvedQuotes, setApprovedQuotes] = useState<PriceQuote[]>([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>('');
  const [quoteNotes, setQuoteNotes] = useState<string>('');
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Manual Form State
  const [title, setTitle] = useState('');
  const [contractType, setContractType] = useState<ContractType>('commercial_goods');
  const [customerName, setCustomerName] = useState('');
  const [customerTaxCode, setCustomerTaxCode] = useState('');
  const [customerRepresentative, setCustomerRepresentative] = useState('');
  const [customerPosition, setCustomerPosition] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerBankName, setCustomerBankName] = useState('');
  const [customerBankAccount, setCustomerBankAccount] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [warrantyMonths, setWarrantyMonths] = useState(12);
  const [taxRate, setTaxRate] = useState(10);
  const [depositAmount, setDepositAmount] = useState(0);
  const [termsAndConditions, setTermsAndConditions] = useState(
    '1. Hàng mới 100%, bảo hành chính hãng theo tiêu chuẩn của nhà sản xuất.\n2. Thanh toán theo tiến độ thỏa thuận bằng chuyển khoản ngân hàng.\n3. Thời gian giao hàng trong vòng 07 ngày làm việc kể từ ngày nhận tiền tạm ứng.'
  );

  const [items, setItems] = useState<
    Array<{
      productCode: string;
      productName: string;
      unit: string;
      quantity: number;
      unitPrice: number;
      discountPercent: number;
      taxRate: number;
    }>
  >([
    {
      productCode: 'TB-01',
      productName: 'Máy chủ Server AI GPU H100 Enterprise',
      unit: 'Bộ',
      quantity: 1,
      unitPrice: 180000000,
      discountPercent: 0,
      taxRate: 10,
    },
  ]);

  const [milestones, setMilestones] = useState<
    Array<{
      milestoneName: string;
      percentage: number;
      amount: number;
      dueDate?: string;
      conditions?: string;
    }>
  >([
    { milestoneName: 'Đợt 1: Tạm ứng khi ký hợp đồng', percentage: 30, amount: 59400000, conditions: 'Trong vòng 03 ngày làm việc sau khi ký HĐ' },
    { milestoneName: 'Đợt 2: Thanh toán khi giao hàng & cài đặt', percentage: 50, amount: 99000000, conditions: 'Kèm biên bản giao nhận hàng hóa' },
    { milestoneName: 'Đợt 3: Thanh lý & quyết toán', percentage: 20, amount: 39600000, conditions: 'Sau khi nghiệm thu và nhận hóa đơn VAT' },
  ]);

  // Load approved quotes
  useEffect(() => {
    if (isOpen) {
      loadQuotes();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialQuoteId) {
      setSelectedQuoteId(initialQuoteId);
      setCreationMode('quote');
    }
  }, [initialQuoteId]);

  const loadQuotes = async () => {
    try {
      setLoadingQuotes(true);
      const res = await quotesApi.getQuotes({ limit: 100 });
      if (res && res.data) {
        setApprovedQuotes(res.data);
      }
    } catch (e) {
      console.error('Error fetching quotes:', e);
    } finally {
      setLoadingQuotes(false);
    }
  };

  // Calculations
  const rawSubtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100),
    0
  );
  const calculatedTaxAmount = (rawSubtotal * taxRate) / 100;
  const calculatedFinalTotal = rawSubtotal + calculatedTaxAmount;

  // Auto calculate approval level
  let approvalLevel = 1;
  let approvalLevelTitle = 'Cấp 1 (< 50 Triệu) - Trưởng Phòng KD / PM';
  if (calculatedFinalTotal > 200000000) {
    approvalLevel = 3;
    approvalLevelTitle = 'Cấp 3 (> 200 Triệu) - Tổng Giám Đốc Phê Duyệt';
  } else if (calculatedFinalTotal >= 50000000) {
    approvalLevel = 2;
    approvalLevelTitle = 'Cấp 2 (50M - 200M) - GĐ Kỹ Thuật & Kế Toán Trưởng';
  }

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        productCode: `SP-${items.length + 1}`,
        productName: '',
        unit: 'Bộ',
        quantity: 1,
        unitPrice: 0,
        discountPercent: 0,
        taxRate: 10,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (creationMode === 'quote') {
        if (!selectedQuoteId) {
          alert('Vui lòng chọn một Bảng Báo Giá để khởi tạo hợp đồng!');
          return;
        }
        await onSubmitFromQuote(selectedQuoteId, quoteNotes);
      } else {
        if (!customerName || !title) {
          alert('Vui lòng nhập đầy đủ Tiêu đề hợp đồng và Tên khách hàng!');
          return;
        }
        await onSubmit({
          title,
          contractType,
          customerName,
          customerTaxCode,
          customerRepresentative,
          customerPosition,
          customerAddress,
          customerPhone,
          customerEmail,
          customerBankName,
          customerBankAccount,
          projectCode,
          totalAmount: rawSubtotal,
          taxRate,
          depositAmount,
          warrantyMonths,
          termsAndConditions,
          items: items.map((it) => ({
            ...it,
            totalAmount: it.quantity * it.unitPrice * (1 - (it.discountPercent || 0) / 100),
          })),
          milestones,
        });
      }
      onClose();
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message || 'Lỗi khi tạo hợp đồng!');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Khởi Tạo Hợp Đồng Kinh Tế Mới</h2>
              <p className="text-xs text-slate-400">
                Tích hợp phân cấp ký duyệt theo giá trị và lưu trữ cơ sở dữ liệu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-5 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setCreationMode('quote')}
            className={`py-2 px-4 text-xs font-bold rounded-t-lg transition-all ${
              creationMode === 'quote'
                ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Khởi Tạo Từ Báo Giá (Khuyên Dùng)
          </button>
          <button
            type="button"
            onClick={() => setCreationMode('manual')}
            className={`py-2 px-4 text-xs font-bold rounded-t-lg transition-all ${
              creationMode === 'manual'
                ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tạo Hợp Đồng Thủ Công
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-slate-300">
          {/* OPTION 1: CONVERT FROM APPROVED QUOTE */}
          {creationMode === 'quote' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 flex items-start gap-3">
                <Sparkles className="w-5 h-5 shrink-0 text-blue-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Chuyển Đổi Tự Động Từ Báo Giá Đã Chốt</p>
                  <p className="text-[11px] text-blue-200 mt-0.5">
                    Hệ thống sẽ tự động sao chép toàn bộ danh mục hàng hóa, đơn giá, chiết khấu, thông tin khách hàng và tự động phân hạng Cấp Duyệt (1, 2, 3) tương ứng.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Chọn Bảng Báo Giá Khách Hàng <span className="text-rose-400">*</span>
                </label>
                <select
                  value={selectedQuoteId}
                  onChange={(e) => setSelectedQuoteId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  required
                >
                  <option value="">-- Chọn báo giá đã duyệt --</option>
                  {approvedQuotes.map((q) => (
                    <option key={q.id} value={q.id}>
                      [{q.code}] {q.customerName} - {formatVND(q.finalTotal || q.totalAmount)} ({q.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Ghi Chú Triển Khai Hợp Đồng</label>
                <textarea
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  rows={3}
                  placeholder="Ghi chú thêm về thời hạn, cam kết kỹ thuật hoặc mã dự án..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          ) : (
            /* OPTION 2: MANUAL ENTRY */
            <div className="space-y-4">
              {/* Basic contract info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">
                    Tiêu Đề Hợp Đồng Kinh Tế <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Hợp đồng cung cấp và lắp đặt thiết bị mạng trung tâm dữ liệu"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Loại Hợp Đồng</label>
                  <select
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value as ContractType)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="commercial_goods">Mua bán hàng hóa / Thiết bị</option>
                    <option value="turnkey_project">Dự án trọn gói / Chìa khóa trao tay</option>
                    <option value="maintenance_service">Dịch vụ bảo trì & Hỗ trợ kỹ thuật</option>
                    <option value="software_solution">Giải pháp phần mềm & AI</option>
                    <option value="other">Hợp đồng kinh tế khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mã Dự Án (Nếu có)</label>
                  <input
                    type="text"
                    value={projectCode}
                    onChange={(e) => setProjectCode(e.target.value)}
                    placeholder="VD: DA-2026-FPT"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              {/* Customer Information */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="font-bold text-cyan-400 uppercase text-[11px] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Thông Tin Khách Hàng (Bên A)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Tên Công Ty / Đơn Vị <span className="text-rose-400">*</span></label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="VD: Tập Đoàn Công Nghệ ABC"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Mã Số Thuế</label>
                    <input
                      type="text"
                      value={customerTaxCode}
                      onChange={(e) => setCustomerTaxCode(e.target.value)}
                      placeholder="VD: 0312987654"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Người Đại Diện</label>
                    <input
                      type="text"
                      value={customerRepresentative}
                      onChange={(e) => setCustomerRepresentative(e.target.value)}
                      placeholder="VD: Ông Nguyễn Văn A"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Chức Vụ</label>
                    <input
                      type="text"
                      value={customerPosition}
                      onChange={(e) => setCustomerPosition(e.target.value)}
                      placeholder="VD: Giám Đốc Điều Hành"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-400 mb-1">Địa Chỉ Đăng Ký Kinh Doanh</label>
                    <input
                      type="text"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="VD: 123 Lê Duẩn, Quận 1, TP. Hồ Chí Minh"
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Danh Mục Thiết Bị & Dịch Vụ</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Hàng Hóa</span>
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-950 text-[10px] text-slate-400 uppercase">
                        <th className="py-2 px-2.5">Mã</th>
                        <th className="py-2 px-2.5">Tên Hàng Hóa</th>
                        <th className="py-2 px-2 text-center">ĐVT</th>
                        <th className="py-2 px-2 text-right">SL</th>
                        <th className="py-2 px-2.5 text-right">Đơn Giá</th>
                        <th className="py-2 px-2 text-right">VAT%</th>
                        <th className="py-2 px-2 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={item.productCode}
                              onChange={(e) => handleItemChange(idx, 'productCode', e.target.value)}
                              className="w-16 px-1.5 py-1 bg-slate-950 border border-slate-700 rounded text-[11px] font-mono text-white"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={item.productName}
                              onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                              placeholder="Tên thiết bị..."
                              className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-[11px] text-white"
                              required
                            />
                          </td>
                          <td className="py-2 px-2 text-center">
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                              className="w-12 px-1 py-1 bg-slate-950 border border-slate-700 rounded text-[11px] text-center text-white"
                            />
                          </td>
                          <td className="py-2 px-2 text-right">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                              className="w-14 px-1 py-1 bg-slate-950 border border-slate-700 rounded text-[11px] text-right text-white"
                            />
                          </td>
                          <td className="py-2 px-2 text-right">
                            <input
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                              className="w-24 px-1 py-1 bg-slate-950 border border-slate-700 rounded text-[11px] text-right text-white"
                            />
                          </td>
                          <td className="py-2 px-2 text-right">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.taxRate}
                              onChange={(e) => handleItemChange(idx, 'taxRate', Number(e.target.value))}
                              className="w-12 px-1 py-1 bg-slate-950 border border-slate-700 rounded text-[11px] text-right text-white"
                            />
                          </td>
                          <td className="py-2 px-2 text-center">
                            {items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="p-1 text-slate-500 hover:text-rose-400"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Approval matrix indicator banner */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/30 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-indigo-300 font-bold uppercase tracking-wider">
                    Phân Cấp Thẩm Định Tự Động:
                  </div>
                  <div className="text-sm font-black text-white mt-0.5">{approvalLevelTitle}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">Tổng Giá Trị Hợp Đồng (Gồm VAT)</div>
                  <div className="text-base font-black text-cyan-400 font-mono">
                    {formatVND(calculatedFinalTotal)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold shadow-lg shadow-blue-500/25 flex items-center gap-2"
            >
              {submitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>Tạo Hợp Đồng Kinh Tế</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
