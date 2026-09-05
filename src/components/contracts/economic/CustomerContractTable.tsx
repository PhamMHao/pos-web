import React from 'react';
import {
  FileText,
  Eye,
  Printer,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { CustomerContract, ContractStatus, ContractType } from '../contracts.types';
import { formatVND } from '../../../utils/currency';

export interface CustomerContractTableProps {
  contracts: CustomerContract[];
  loading: boolean;
  onViewDetail: (contract: CustomerContract) => void;
  onPrintContract: (contract: CustomerContract) => void;
  onSignContract: (contract: CustomerContract) => void;
  onCreateHandover: (contract: CustomerContract) => void;
  onCreateLiquidation: (contract: CustomerContract) => void;
  onDeleteContract: (contract: CustomerContract) => void;
}

export const CustomerContractTable: React.FC<CustomerContractTableProps> = ({
  contracts,
  loading,
  onViewDetail,
  onPrintContract,
  onSignContract,
  onCreateHandover,
  onCreateLiquidation,
  onDeleteContract,
}) => {
  const getStatusBadge = (status: ContractStatus) => {
    switch (status) {
      case 'draft':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            Bản nháp
          </span>
        );
      case 'internal_review':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
            Thẩm định nội bộ
          </span>
        );
      case 'sent_to_customer':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            Đã gửi khách
          </span>
        );
      case 'customer_confirmed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            Khách xác nhận
          </span>
        );
      case 'purchasing':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            Đang mua hàng
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            Đang thực hiện
          </span>
        );
      case 'handover_completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-teal-500/15 text-teal-300 border border-teal-500/30">
            Đã bàn giao
          </span>
        );
      case 'liquidated':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            Đã thanh lý
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-500/20 text-green-300 border border-green-500/40 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Hoàn tất (Có VAT)
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400">
            {status}
          </span>
        );
    }
  };

  const getApprovalBadge = (level: number, status: string) => {
    let label = 'Cấp 1 (< 50M)';
    let color = 'text-blue-300 bg-blue-500/10 border-blue-500/30';
    if (level === 2) {
      label = 'Cấp 2 (50M - 200M)';
      color = 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30';
    } else if (level === 3) {
      label = 'Cấp 3 (> 200M - TGĐ)';
      color = 'text-rose-300 bg-rose-500/15 border-rose-500/40 font-bold';
    }

    return (
      <div className="space-y-1">
        <span className={`inline-block px-2 py-0.5 rounded text-[10px] border ${color}`}>
          {label}
        </span>
        <div className="text-[10px]">
          {status === 'approved' ? (
            <span className="text-emerald-400 font-medium">✓ Đã phê duyệt</span>
          ) : status === 'rejected' ? (
            <span className="text-rose-400 font-medium">✕ Từ chối</span>
          ) : (
            <span className="text-amber-400 font-medium">⏳ Đang chờ duyệt</span>
          )}
        </div>
      </div>
    );
  };

  const getTypeLabel = (type: ContractType) => {
    switch (type) {
      case 'commercial_goods':
        return 'Mua bán thiết bị';
      case 'turnkey_project':
        return 'Dự án trọn gói';
      case 'maintenance_service':
        return 'Bảo trì kỹ thuật';
      case 'software_solution':
        return 'Giải pháp phần mềm';
      default:
        return 'Kinh tế thương mại';
    }
  };

  if (loading && contracts.length === 0) {
    return (
      <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800">
        <div className="inline-block w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm text-slate-400 font-medium">Đang tải danh sách hợp đồng từ SQL Server...</p>
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800">
        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white mb-1">Chưa có hợp đồng kinh tế nào</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Tạo hợp đồng mới thủ công hoặc chuyển đổi tự động từ Bảng Báo Giá đã được khách hàng phê duyệt.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4">Số HĐ & Tiêu Đề</th>
              <th className="py-3.5 px-4">Khách Hàng / Đối Tác</th>
              <th className="py-3.5 px-4 text-right">Trị Giá (VNĐ)</th>
              <th className="py-3.5 px-4">Phân Cấp Phê Duyệt</th>
              <th className="py-3.5 px-4">Chữ Ký Số CA</th>
              <th className="py-3.5 px-4">Trạng Thái</th>
              <th className="py-3.5 px-4 text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-xs">
            {contracts.map((c) => (
              <tr
                key={c.id}
                className="hover:bg-slate-800/40 transition-colors group"
              >
                {/* 1. Số HĐ & Tiêu Đề */}
                <td className="py-3.5 px-4 align-top">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cyan-400 font-mono">
                      {c.contractNumber}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                      {getTypeLabel(c.contractType)}
                    </span>
                  </div>
                  <div className="text-white font-medium line-clamp-1 mt-1" title={c.title}>
                    {c.title}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                    {c.quoteCode && (
                      <span className="text-blue-400">Báo giá: {c.quoteCode}</span>
                    )}
                    {c.projectCode && (
                      <span className="text-indigo-400">Dự án: {c.projectCode}</span>
                    )}
                    {c.einvoiceCode && (
                      <span className="text-emerald-400 font-medium">HĐĐT: {c.einvoiceCode}</span>
                    )}
                  </div>
                </td>

                {/* 2. Khách Hàng / Đối Tác */}
                <td className="py-3.5 px-4 align-top">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="line-clamp-1" title={c.customerName}>
                      {c.customerName}
                    </span>
                  </div>
                  {c.customerTaxCode && (
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      MST: {c.customerTaxCode}
                    </div>
                  )}
                  {c.customerRepresentative && (
                    <div className="text-[10px] text-slate-400 line-clamp-1">
                      ĐD: {c.customerRepresentative}
                    </div>
                  )}
                </td>

                {/* 3. Trị Giá (VNĐ) */}
                <td className="py-3.5 px-4 align-top text-right">
                  <div className="font-bold text-cyan-300 text-sm">
                    {formatVND(c.finalTotal)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Đã thanh toán: <span className="text-emerald-400 font-medium">{formatVND(c.paidAmount)}</span>
                  </div>
                  {c.remainingAmount > 0 && (
                    <div className="text-[10px] text-amber-400">
                      Còn lại: {formatVND(c.remainingAmount)}
                    </div>
                  )}
                </td>

                {/* 4. Phân Cấp Phê Duyệt */}
                <td className="py-3.5 px-4 align-top">
                  {getApprovalBadge(c.approvalLevel, c.approvalStatus)}
                </td>

                {/* 5. Chữ Ký Số CA */}
                <td className="py-3.5 px-4 align-top">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="text-slate-400">Bên A:</span>
                      {c.digitalSignatureA ? (
                        <span className="text-emerald-400 font-medium flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3" /> Đã ký
                        </span>
                      ) : (
                        <span className="text-slate-500">Chưa ký</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="text-slate-400">Bên B:</span>
                      {c.digitalSignatureB ? (
                        <span className="text-cyan-400 font-medium flex items-center gap-0.5" title={c.signatureBDetails || ''}>
                          <ShieldCheck className="w-3 h-3 text-cyan-400" /> SmartCA
                        </span>
                      ) : (
                        <span className="text-amber-400">Chờ ký</span>
                      )}
                    </div>
                  </div>
                </td>

                {/* 6. Trạng Thái */}
                <td className="py-3.5 px-4 align-top">
                  {getStatusBadge(c.status)}
                  {c.signedDate && (
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {new Date(c.signedDate).toLocaleDateString('vi-VN')}
                    </div>
                  )}
                </td>

                {/* 7. Thao Tác */}
                <td className="py-3.5 px-4 align-top text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    {/* View Detail Drawer */}
                    <button
                      onClick={() => onViewDetail(c)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
                      title="Xem chi tiết 360°"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {/* Print Contract */}
                    <button
                      onClick={() => onPrintContract(c)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-blue-400 transition-colors"
                      title="In hợp đồng chuẩn pháp lý"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>

                    {/* Digital Sign */}
                    <button
                      onClick={() => onSignContract(c)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        c.digitalSignatureB
                          ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white'
                      }`}
                      title="Ký số SmartCA / Token PKI"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </button>

                    {/* Handover Note */}
                    <button
                      onClick={() => onCreateHandover(c)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-950/50 text-cyan-300 hover:text-cyan-200 transition-colors"
                      title="Lập phiếu bàn giao hàng hóa"
                    >
                      <Truck className="w-3.5 h-3.5" />
                    </button>

                    {/* Liquidation & Invoice */}
                    <button
                      onClick={() => onCreateLiquidation(c)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-purple-950/50 text-purple-300 hover:text-purple-200 transition-colors"
                      title="Biên bản thanh lý & Xuất hóa đơn VAT"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Contract (if draft or cancelled) */}
                    {['draft', 'cancelled'].includes(c.status) && (
                      <button
                        onClick={() => onDeleteContract(c)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/50 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Xóa hợp đồng"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
