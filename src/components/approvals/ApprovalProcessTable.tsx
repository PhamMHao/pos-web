import React from 'react';
import {
  Lock,
  Check,
  Clock,
  RotateCcw,
  Eye,
  Printer,
  Bell,
  PenTool,
  AlertCircle,
  FileText,
  ChevronRight,
} from 'lucide-react';
import {
  SequentialApprovalProcess,
  SequentialApprovalStep,
  APPROVAL_MODULE_CONFIG,
} from './approvals.types';
import { formatVND } from '../../utils/currency';

interface ApprovalProcessTableProps {
  processes: SequentialApprovalProcess[];
  currentUserRole?: string;
  currentUserName?: string;
  onViewDetail: (p: SequentialApprovalProcess) => void;
  onSignAction: (p: SequentialApprovalProcess, step: SequentialApprovalStep) => void;
  onPrintA4: (p: SequentialApprovalProcess) => void;
  onRemind: (p: SequentialApprovalProcess) => void;
}

export const ApprovalProcessTable: React.FC<ApprovalProcessTableProps> = ({
  processes,
  currentUserRole,
  currentUserName,
  onViewDetail,
  onSignAction,
  onPrintA4,
  onRemind,
}) => {
  if (processes.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">Không tìm thấy phiếu trình ký nào</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Không có hồ sơ nào khớp với điều kiện lọc hiện tại. Thử xóa bộ lọc hoặc bấm "Tạo Tờ Trình Mới".
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden select-none">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4 w-32">Mã Tờ Trình</th>
              <th className="py-3 px-3 w-48">Khâu & Chứng Từ</th>
              <th className="py-3 px-4 min-w-[240px]">Nội Dung Tờ Trình</th>
              <th className="py-3 px-3 w-36 text-right">Số Tiền (VNĐ)</th>
              <th className="py-3 px-4 min-w-[200px] text-center">Tiến Độ Duyệt Tuần Tự</th>
              <th className="py-3 px-3 w-36 text-center">Trạng Thái</th>
              <th className="py-3 px-4 w-44 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
            {processes.map((p) => {
              const modConfig =
                APPROVAL_MODULE_CONFIG[p.moduleType] || {
                  label: p.moduleType,
                  badge: 'bg-slate-100 text-slate-700 border-slate-300',
                  color: 'slate',
                  text: 'DOC',
                };

              // Tìm bước đang chờ duyệt
              const activeWaitingStep = p.steps.find((s) => s.status === 'waiting');

              // Kiểm tra xem user hiện tại có quyền ký bước đang waiting này không
              const canSignNow =
                p.status === 'in_progress' &&
                activeWaitingStep &&
                (currentUserRole === 'admin' ||
                  activeWaitingStep.requiredRole === currentUserRole ||
                  (currentUserName &&
                    activeWaitingStep.assignedUserName.includes(currentUserName)));

              return (
                <tr
                  key={p.id}
                  className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                  onClick={() => onViewDetail(p)}
                >
                  {/* Cột 1: Mã phiếu & Priority */}
                  <td className="py-3 px-4 align-top">
                    <div className="flex flex-col space-y-1">
                      <span className="font-black text-slate-900 tracking-tight font-mono">
                        {p.processCode}
                      </span>
                      <div className="flex items-center space-x-1">
                        {p.priority === 'urgent' && (
                          <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-black bg-red-100 text-red-700 border border-red-300 uppercase">
                            Khẩn cấp
                          </span>
                        )}
                        {p.priority === 'high' && (
                          <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300 uppercase">
                            Ưu tiên cao
                          </span>
                        )}
                        {p.priority === 'normal' && (
                          <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-100 text-slate-600">
                            Bình thường
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </td>

                  {/* Cột 2: Khâu & Mã chứng từ gốc */}
                  <td className="py-3 px-3 align-top">
                    <div className="space-y-1">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${modConfig.badge}`}
                      >
                        {modConfig.label}
                      </span>
                      <div className="flex items-center space-x-1 font-mono text-[11px] font-semibold text-slate-600">
                        <span className="text-slate-400">Số:</span>
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {p.referenceDocCode}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Cột 3: Tiêu đề & Người lập */}
                  <td className="py-3 px-4 align-top">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                        {p.title}
                      </h4>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                        <span className="font-medium text-slate-700">{p.requesterName}</span>
                        <span>•</span>
                        <span className="truncate">{p.departmentName}</span>
                      </div>
                    </div>
                  </td>

                  {/* Cột 4: Số tiền */}
                  <td className="py-3 px-3 align-top text-right">
                    <span className="font-black text-slate-900 tracking-tight text-xs block">
                      {p.totalAmount > 0 ? formatVND(p.totalAmount) : '—'}
                    </span>
                    {p.totalAmount > 0 && (
                      <span className="text-[10px] text-slate-400 font-normal">
                        Giá trị trình duyệt
                      </span>
                    )}
                  </td>

                  {/* Cột 5: Thanh tiến trình duyệt tuần tự (Sequential Stepper) */}
                  <td className="py-3 px-4 align-top">
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <div className="flex items-center space-x-1">
                        {p.steps.map((step, idx) => {
                          const isLast = idx === p.steps.length - 1;

                          let circleClass = 'bg-slate-100 text-slate-400 border-slate-300';
                          let icon = <Lock className="w-2.5 h-2.5" />;

                          if (step.status === 'approved') {
                            circleClass =
                              'bg-emerald-500 text-white border-emerald-600 shadow-xs shadow-emerald-500/30';
                            icon = <Check className="w-3 h-3 stroke-[3]" />;
                          } else if (step.status === 'waiting') {
                            circleClass =
                              'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-400/40 animate-pulse';
                            icon = <span className="font-black text-[10px]">{step.stepOrder}</span>;
                          } else if (step.status === 'rework') {
                            circleClass = 'bg-rose-500 text-white border-rose-600';
                            icon = <RotateCcw className="w-2.5 h-2.5" />;
                          } else if (step.status === 'rejected') {
                            circleClass = 'bg-slate-700 text-white border-slate-800';
                            icon = <span className="text-[10px] font-black">X</span>;
                          } else if (step.status === 'locked') {
                            circleClass = 'bg-slate-100 text-slate-400 border-slate-200';
                            icon = <Lock className="w-2.5 h-2.5 text-slate-400" />;
                          }

                          return (
                            <React.Fragment key={step.id}>
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center border font-bold text-[10px] transition-all relative ${circleClass}`}
                                title={`${step.stepName} (${step.assignedUserName}) - Trạng thái: ${step.status}`}
                              >
                                {icon}
                              </div>
                              {!isLast && (
                                <div
                                  className={`w-3 h-0.5 rounded-full ${
                                    step.status === 'approved' ? 'bg-emerald-500' : 'bg-slate-200'
                                  }`}
                                />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>

                      {/* Thông tin bước hiện tại */}
                      {activeWaitingStep ? (
                        <div className="text-[10px] text-center text-blue-700 font-semibold truncate max-w-[210px]">
                          Chờ:{' '}
                          <span className="font-bold">
                            {activeWaitingStep.assignedUserName.split('(')[0].trim()}
                          </span>
                        </div>
                      ) : p.status === 'approved' ? (
                        <span className="text-[10px] text-emerald-600 font-bold">
                          Đã hoàn tất ({p.totalSteps} bước)
                        </span>
                      ) : null}
                    </div>
                  </td>

                  {/* Cột 6: Trạng thái quy trình */}
                  <td className="py-3 px-3 align-top text-center">
                    {p.status === 'approved' && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <Check className="w-3 h-3" />
                        <span>ĐÃ DUYỆT</span>
                      </span>
                    )}

                    {p.status === 'in_progress' && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        <Clock className="w-3 h-3 animate-spin" />
                        <span>ĐANG DUYỆT</span>
                      </span>
                    )}

                    {p.status === 'rework' && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                        <RotateCcw className="w-3 h-3" />
                        <span>YÊU CẦU SỬA</span>
                      </span>
                    )}

                    {p.status === 'rejected' && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800 border border-slate-400">
                        <span>TỪ CHỐI</span>
                      </span>
                    )}

                    {p.isOverdue && (
                      <span className="block mt-1 text-[9px] font-bold text-red-600 bg-red-50 px-1 py-0.5 rounded border border-red-200 animate-pulse">
                        Quá hạn SLA
                      </span>
                    )}
                  </td>

                  {/* Cột 7: Thao tác */}
                  <td className="py-3 px-4 align-top text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end space-x-1.5">
                      {/* Nút ký duyệt nhanh nếu đã đến lượt */}
                      {canSignNow && activeWaitingStep && (
                        <button
                          onClick={() => onSignAction(p, activeWaitingStep)}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xs shadow-blue-500/30 cursor-pointer"
                          title="Ký duyệt bước hiện tại"
                        >
                          <PenTool className="w-3 h-3" />
                          <span>Ký Ngay</span>
                        </button>
                      )}

                      {/* Nút in A4 */}
                      <button
                        onClick={() => onPrintA4(p)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
                        title="In Phiếu Trình Ký Chuẩn A4"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      {/* Nút nhắc duyệt */}
                      {p.status === 'in_progress' && (
                        <button
                          onClick={() => onRemind(p)}
                          className="p-1.5 rounded-lg text-amber-600 hover:text-amber-800 hover:bg-amber-50 border border-amber-200 transition-all cursor-pointer"
                          title="Gửi cảnh báo nhắc người duyệt"
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Nút xem chi tiết */}
                      <button
                        onClick={() => onViewDetail(p)}
                        className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-200 transition-all cursor-pointer"
                        title="Xem chi tiết toàn bộ luồng duyệt"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
