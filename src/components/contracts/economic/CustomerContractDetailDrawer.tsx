import React, { useState } from 'react';
import {
  X,
  FileText,
  Building2,
  Calendar,
  DollarSign,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Clock,
  Layers,
  Award,
  CreditCard,
  UserCheck,
  AlertCircle,
  Hash,
  MapPin,
  Phone,
  Mail,
  Printer,
} from 'lucide-react';
import { CustomerContract } from '../contracts.types';
import { formatVND } from '../../../utils/currency';

export interface CustomerContractDetailDrawerProps {
  contract: CustomerContract | null;
  onClose: () => void;
  onPrint: (contract: CustomerContract) => void;
  onSign: (contract: CustomerContract) => void;
  onCreateHandover: (contract: CustomerContract) => void;
  onCreateLiquidation: (contract: CustomerContract) => void;
}

export const CustomerContractDetailDrawer: React.FC<CustomerContractDetailDrawerProps> = ({
  contract,
  onClose,
  onPrint,
  onSign,
  onCreateHandover,
  onCreateLiquidation,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'items' | 'milestones' | 'handovers' | 'liquidation' | 'signature'
  >('overview');

  if (!contract) return null;

  let signatureBObj: any = null;
  try {
    if (contract.signatureBDetails) {
      signatureBObj = JSON.parse(contract.signatureBDetails);
    }
  } catch (e) {
    signatureBObj = null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="w-full max-w-3xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                {contract.contractNumber}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-semibold">
                Cấp {contract.approvalLevel} ({contract.approvalStatus === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'})
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1 line-clamp-1">{contract.title}</h2>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
              <span>Đối tác: <strong className="text-slate-200">{contract.customerName}</strong></span>
              {contract.customerTaxCode && <span>• MST: {contract.customerTaxCode}</span>}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrint(contract)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-blue-400 transition-colors"
              title="In bản hợp đồng"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 gap-1 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3.5 font-semibold border-b-2 transition-colors shrink-0 ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Tổng Quan & Pháp Lý
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`py-3 px-3.5 font-semibold border-b-2 transition-colors shrink-0 ${
              activeTab === 'items'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Hàng Hóa & Thiết Bị ({contract.items?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('milestones')}
            className={`py-3 px-3.5 font-semibold border-b-2 transition-colors shrink-0 ${
              activeTab === 'milestones'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Tiến Độ Thanh Toán ({contract.milestones?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('handovers')}
            className={`py-3 px-3.5 font-semibold border-b-2 transition-colors shrink-0 ${
              activeTab === 'handovers'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Bàn Giao ({contract.handovers?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('liquidation')}
            className={`py-3 px-3.5 font-semibold border-b-2 transition-colors shrink-0 ${
              activeTab === 'liquidation'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Nghiệm Thu & Thanh Lý
          </button>
          <button
            onClick={() => setActiveTab('signature')}
            className={`py-3 px-3.5 font-semibold border-b-2 transition-colors shrink-0 ${
              activeTab === 'signature'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Chữ Ký Số CA
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-300">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Financial summary banner */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div>
                  <div className="text-[11px] text-slate-400">Tổng Trị Giá Hợp Đồng</div>
                  <div className="text-base font-black text-cyan-400 mt-0.5">
                    {formatVND(contract.finalTotal)}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Gốc: {formatVND(contract.totalAmount)} + VAT {contract.taxRate}%
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Đã Thanh Toán</div>
                  <div className="text-base font-black text-emerald-400 mt-0.5">
                    {formatVND(contract.paidAmount)}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Tạm ứng: {formatVND(contract.depositAmount)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Còn Lại Phải Thu</div>
                  <div className="text-base font-black text-amber-400 mt-0.5">
                    {formatVND(contract.remainingAmount)}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Bảo hành: {contract.warrantyMonths} tháng
                  </div>
                </div>
              </div>

              {/* Party A & Party B Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Party A: Customer */}
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
                    <Building2 className="w-4 h-4" />
                    <span>BÊN A (BÊN MUA / KHÁCH HÀNG)</span>
                  </div>
                  <div className="font-semibold text-white text-sm">{contract.customerName}</div>
                  {contract.customerTaxCode && (
                    <div>MST: <span className="font-mono text-slate-200">{contract.customerTaxCode}</span></div>
                  )}
                  {contract.customerRepresentative && (
                    <div>Đại diện: <strong className="text-white">{contract.customerRepresentative}</strong> ({contract.customerPosition || 'Đại diện'})</div>
                  )}
                  {contract.customerAddress && (
                    <div className="flex items-start gap-1.5 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-500 mt-0.5" />
                      <span>{contract.customerAddress}</span>
                    </div>
                  )}
                  {contract.customerPhone && (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Phone className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                      <span>{contract.customerPhone}</span>
                    </div>
                  )}
                  {contract.customerBankName && (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <CreditCard className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                      <span>{contract.customerBankName} - STK: {contract.customerBankAccount}</span>
                    </div>
                  )}
                </div>

                {/* Party B: Enterprise GP-ERP */}
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-wider text-[11px]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>BÊN B (BÊN BÁN / GP-ERP ENTERPRISE)</span>
                  </div>
                  <div className="font-semibold text-white text-sm">CÔNG TY CỔ PHẦN CÔNG NGHỆ GP-ERP VIỆT NAM</div>
                  <div>MST: <span className="font-mono text-slate-200">0318928172</span></div>
                  <div>
                    Đại diện: <strong className="text-white">{contract.companyRepresentative || 'Phạm Ngọc Thơm'}</strong> ({contract.companyPosition || 'Tổng Giám Đốc'})
                  </div>
                  <div className="flex items-start gap-1.5 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-500 mt-0.5" />
                    <span>Tòa nhà GP-Tower, 180 Nguyễn Thị Minh Khai, Q.3, TP. Hồ Chí Minh</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Phone className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                    <span>Hotline: 1900 888 999</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <CreditCard className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                    <span>Vietcombank - CN Tân Định - STK: 0071009998888</span>
                  </div>
                </div>
              </div>

              {/* Terms and conditions */}
              {contract.termsAndConditions && (
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Điều Khoản Bổ Sung & Cam Kết Kỹ Thuật
                  </div>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                    {contract.termsAndConditions}
                  </p>
                </div>
              )}

              {/* Dates & Reference */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-400">
                <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500">Ngày Ký</div>
                  <div className="font-semibold text-white mt-0.5">
                    {contract.signedDate ? new Date(contract.signedDate).toLocaleDateString('vi-VN') : 'Chưa ký'}
                  </div>
                </div>
                <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500">Hiệu Lực Từ</div>
                  <div className="font-semibold text-white mt-0.5">
                    {contract.effectiveDate ? new Date(contract.effectiveDate).toLocaleDateString('vi-VN') : 'Khi ký'}
                  </div>
                </div>
                <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500">Ngày Hết Hạn</div>
                  <div className="font-semibold text-white mt-0.5">
                    {contract.expiryDate ? new Date(contract.expiryDate).toLocaleDateString('vi-VN') : 'Theo nghiệm thu'}
                  </div>
                </div>
                <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500">Báo Giá Gốc</div>
                  <div className="font-semibold text-cyan-400 mt-0.5">
                    {contract.quoteCode || 'Nhập thủ công'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ITEMS */}
          {activeTab === 'items' && (
            <div className="space-y-3">
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-950/80 text-[11px] font-bold text-slate-400 border-b border-slate-800">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Tên Thiết Bị / Dịch Vụ</th>
                      <th className="py-2.5 px-3 text-center">ĐVT</th>
                      <th className="py-2.5 px-3 text-right">SL</th>
                      <th className="py-2.5 px-3 text-right">Đơn Giá</th>
                      <th className="py-2.5 px-3 text-right">Thuế</th>
                      <th className="py-2.5 px-3 text-right">Thành Tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {contract.items && contract.items.length > 0 ? (
                      contract.items.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-3 text-slate-500 font-mono">{idx + 1}</td>
                          <td className="py-2.5 px-3">
                            <div className="font-medium text-white">{item.productName}</div>
                            <div className="text-[10px] font-mono text-slate-500">{item.productCode}</div>
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-400">{item.unit || 'Bộ'}</td>
                          <td className="py-2.5 px-3 text-right font-semibold text-white">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-right text-slate-300">{formatVND(item.unitPrice)}</td>
                          <td className="py-2.5 px-3 text-right text-slate-400">{item.taxRate}%</td>
                          <td className="py-2.5 px-3 text-right font-bold text-cyan-400">
                            {formatVND(item.totalAmount)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-500">
                          Không có sản phẩm chi tiết nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: MILESTONES */}
          {activeTab === 'milestones' && (
            <div className="space-y-3">
              {contract.milestones && contract.milestones.length > 0 ? (
                <div className="space-y-2.5">
                  {contract.milestones.map((m, idx) => (
                    <div
                      key={m.id || idx}
                      className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          m.isPaid ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{m.milestoneName}</h4>
                          <p className="text-[11px] text-slate-400">
                            Tỷ lệ: <strong className="text-cyan-400">{m.percentage}%</strong>
                            {m.dueDate && ` • Hạn thanh toán: ${new Date(m.dueDate).toLocaleDateString('vi-VN')}`}
                          </p>
                          {m.conditions && <p className="text-[10px] text-slate-500 mt-0.5">{m.conditions}</p>}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-cyan-400 text-sm">{formatVND(m.amount)}</div>
                        <div className="mt-1">
                          {m.isPaid ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                              ✓ Đã thanh toán
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30">
                              Chưa thanh toán
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500">Chưa thiết lập tiến độ thanh toán</div>
              )}
            </div>
          )}

          {/* TAB 4: HANDOVERS */}
          {activeTab === 'handovers' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-400">Lịch sử biên bản bàn giao</span>
                <button
                  onClick={() => onCreateHandover(contract)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Lập Phiếu Bàn Giao Mới</span>
                </button>
              </div>

              {contract.handovers && contract.handovers.length > 0 ? (
                <div className="space-y-2.5">
                  {contract.handovers.map((h) => (
                    <div key={h.id} className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-cyan-400 font-mono">{h.handoverCode}</span>
                        <span className="text-slate-400 text-[11px]">
                          {new Date(h.handoverDate).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>Người giao: <strong className="text-white">{h.delivererName}</strong> ({h.delivererPhone || 'N/A'})</div>
                        <div>Người nhận: <strong className="text-white">{h.receiverName}</strong> ({h.receiverPhone || 'N/A'})</div>
                      </div>
                      {h.deliveryLocation && (
                        <div className="text-[11px] text-slate-400">Địa điểm: {h.deliveryLocation}</div>
                      )}
                      {h.technicalCondition && (
                        <div className="text-[11px] text-emerald-400">Hiện trạng: {h.technicalCondition}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500">Chưa có phiếu bàn giao nào</div>
              )}
            </div>
          )}

          {/* TAB 5: LIQUIDATION */}
          {activeTab === 'liquidation' && (
            <div className="space-y-4">
              {contract.liquidation ? (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs">
                      {contract.liquidation.liquidationCode}
                    </span>
                    <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Đã Nghiệm Thu & Thanh Lý
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>Giá trị quyết toán: <strong className="text-cyan-400 font-bold">{formatVND(contract.liquidation.actualAmount)}</strong></div>
                    <div>Thanh toán đợt cuối: <strong className="text-emerald-400 font-bold">{formatVND(contract.liquidation.finalPaymentAmount)}</strong></div>
                  </div>

                  {contract.einvoiceCode && (
                    <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
                      <span className="text-indigo-300 font-semibold">Hóa Đơn Điện Tử VAT TT78:</span>
                      <span className="font-mono text-cyan-400 font-bold text-sm">{contract.einvoiceCode}</span>
                    </div>
                  )}

                  {contract.liquidation.conclusion && (
                    <p className="text-slate-400 text-xs italic">{contract.liquidation.conclusion}</p>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center bg-slate-950/40 rounded-xl border border-slate-800 space-y-3">
                  <p className="text-slate-400">Hợp đồng chưa được lập Biên bản Nghiệm thu & Thanh lý.</p>
                  <button
                    onClick={() => onCreateLiquidation(contract)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs inline-flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Lập Biên Bản Thanh Lý & Xuất Hóa Đơn VAT</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: SIGNATURE */}
          {activeTab === 'signature' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    Chữ Ký Số Doanh Nghiệp (Bên B - GP-ERP)
                  </h4>
                  <button
                    onClick={() => onSign(contract)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                  >
                    Ký Số Ngay
                  </button>
                </div>

                {contract.digitalSignatureB ? (
                  <div className="space-y-2 text-xs">
                    <div className="text-emerald-400 font-semibold">
                      ✓ Đã ký bởi: <strong className="text-white">{contract.digitalSignatureB}</strong>
                    </div>
                    {signatureBObj && (
                      <div className="p-3 bg-slate-900 rounded-lg space-y-1 font-mono text-[11px] text-slate-400">
                        <div>Nhà cung cấp: <span className="text-cyan-400">{signatureBObj.provider}</span></div>
                        <div>Chứng thư số: {signatureBObj.serial}</div>
                        <div>Dấu thời gian: {signatureBObj.tsa}</div>
                        <div>Phương thức: {signatureBObj.method}</div>
                        <div className="text-[10px] text-slate-500 break-all">SHA256: {signatureBObj.sha256}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-amber-400 text-xs">Chưa có chữ ký số điện tử của đại diện GP-ERP</p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-400" />
                  Chữ Ký Đại Diện Bên A (Khách Hàng)
                </h4>
                {contract.digitalSignatureA ? (
                  <div className="text-emerald-400 font-semibold text-xs">
                    ✓ Đã xác nhận ký: <strong className="text-white">{contract.digitalSignatureA}</strong>
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs">Khách hàng chưa hoàn tất ký kết</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={() => onPrint(contract)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Xem Mẫu In Pháp Lý</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSign(contract)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Ký Số Điện Tử</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
