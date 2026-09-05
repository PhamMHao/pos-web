import React from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  Lock,
  RotateCcw,
  AlertTriangle,
  Printer,
  Bell,
  PenTool,
  ShieldCheck,
  FileText,
  User,
  Building,
  Calendar,
  DollarSign,
  Tag,
  Hash,
} from 'lucide-react';
import {
  SequentialApprovalProcess,
  SequentialApprovalStep,
  APPROVAL_MODULE_CONFIG,
} from './approvals.types';
import { formatVND } from '../../utils/currency';

interface ApprovalDetailModalProps {
  process: SequentialApprovalProcess | null;
  currentUserRole?: string;
  currentUserName?: string;
  onClose: () => void;
  onSignAction: (p: SequentialApprovalProcess, step: SequentialApprovalStep) => void;
  onPrintA4: (p: SequentialApprovalProcess) => void;
  onRemind: (p: SequentialApprovalProcess) => void;
}

export const ApprovalDetailModal: React.FC<ApprovalDetailModalProps> = ({
  process,
  currentUserRole,
  currentUserName,
  onClose,
  onSignAction,
  onPrintA4,
  onRemind,
}) => {
  if (!process) return null;

  const modConfig =
    APPROVAL_MODULE_CONFIG[process.moduleType] || {
      label: process.moduleType,
      badge: 'bg-slate-100 text-slate-700 border-slate-300',
      color: 'slate',
      text: 'DOC',
    };

  const activeWaitingStep = process.steps.find((s) => s.status === 'waiting');

  const canSignCurrent =
    process.status === 'in_progress' &&
    activeWaitingStep &&
    (currentUserRole === 'admin' ||
      activeWaitingStep.requiredRole === currentUserRole ||
      (currentUserName && activeWaitingStep.assignedUserName.includes(currentUserName)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-black text-slate-900 font-mono">
                  {process.processCode}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${modConfig.badge}`}>
                  {modConfig.label}
                </span>
                {process.status === 'approved' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                    ĐÃ DUYỆT HOÀN TẤT
                  </span>
                )}
                {process.status === 'in_progress' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    ĐANG DUYỆT TUẦN TỰ
                  </span>
                )}
                {process.status === 'rework' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                    YÊU CẦU LÀM LẠI
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Quy trình kiểm soát đa khâu liên phòng ban • Hệ thống GP-ERP Enterprise
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPrintA4(process)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Phiếu A4</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar text-xs">
          {/* Box 1: Thông tin tổng quan */}
          <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-2">{process.title}</h3>
            {process.summaryNotes && (
              <p className="text-slate-600 mb-3 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200/60">
                {process.summaryNotes}
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Mã Chứng Từ Gốc
                </span>
                <span className="font-mono font-bold text-slate-800 text-xs mt-0.5 block">
                  {process.referenceDocCode}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Người Đề Xuất
                </span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block">
                  {process.requesterName}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Phòng Ban Trình
                </span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block truncate">
                  {process.departmentName}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Tổng Giá Trị
                </span>
                <span className="font-black text-blue-700 text-xs mt-0.5 block">
                  {process.totalAmount > 0 ? formatVND(process.totalAmount) : 'Không áp dụng'}
                </span>
              </div>
            </div>
          </div>

          {/* Box 2: Sơ đồ luồng duyệt tuần tự (Sequential Pipeline Stepper) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>Tiến Trình Phê Duyệt Tuần Tự (Strict Sequential Pipeline)</span>
              </h4>
              <span className="text-[11px] font-semibold text-slate-500">
                Bước hiện tại: <strong className="text-blue-700">{process.currentStepNumber}</strong> / {process.totalSteps}
              </span>
            </div>

            <div className="space-y-3">
              {process.steps.map((step, idx) => {
                const isApproved = step.status === 'approved';
                const isWaiting = step.status === 'waiting';
                const isLocked = step.status === 'locked';
                const isRework = step.status === 'rework';

                const canActOnThisStep =
                  isWaiting &&
                  (currentUserRole === 'admin' ||
                    step.requiredRole === currentUserRole ||
                    (currentUserName && step.assignedUserName.includes(currentUserName)));

                return (
                  <div
                    key={step.id}
                    className={`rounded-2xl p-4 border transition-all ${
                      isApproved
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : isWaiting
                        ? 'bg-blue-50/60 border-blue-300 ring-2 ring-blue-400/20'
                        : isRework
                        ? 'bg-rose-50/60 border-rose-300'
                        : 'bg-slate-50/80 border-slate-200 opacity-80'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Trái: Icon & Tên bước */}
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-black shrink-0 ${
                            isApproved
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : isWaiting
                              ? 'bg-blue-600 text-white shadow-sm animate-pulse'
                              : isRework
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {isApproved ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : isLocked ? (
                            <Lock className="w-3.5 h-3.5" />
                          ) : isRework ? (
                            <RotateCcw className="w-3.5 h-3.5" />
                          ) : (
                            <span>{step.stepOrder}</span>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <h5 className="font-bold text-slate-900 text-xs">{step.stepName}</h5>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-white text-slate-600 border border-slate-200 uppercase">
                              Vai trò: {step.requiredRole}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Người chỉ định duyệt: <strong>{step.assignedUserName}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Phải: Trạng thái & Nút ký */}
                      <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                        {isApproved && (
                          <div className="text-right">
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>ĐÃ KÝ DUYỆT</span>
                            </span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              {step.actedBy} • {step.actedAt ? new Date(step.actedAt).toLocaleString('vi-VN') : ''}
                            </span>
                          </div>
                        )}

                        {isWaiting && (
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300 animate-pulse">
                              <Clock className="w-3 h-3" />
                              <span>ĐANG CHỜ DUYỆT</span>
                            </span>

                            {canActOnThisStep && (
                              <button
                                onClick={() => onSignAction(process, step)}
                                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/30 transition-all cursor-pointer"
                              >
                                <PenTool className="w-3 h-3" />
                                <span>Ký Phê Duyệt</span>
                              </button>
                            )}
                          </div>
                        )}

                        {isLocked && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-300">
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>Bị Khóa (Chờ Cấp Trước)</span>
                          </span>
                        )}

                        {isRework && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <RotateCcw className="w-3 h-3" />
                            <span>Yêu Cầu Làm Lại</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Chi tiết thẩm định / Ý kiến / Chữ ký */}
                    {(step.reviewNotes || step.reworkRequirements || step.signatureData) && (
                      <div className="mt-3 pt-3 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        {step.reviewNotes && (
                          <div>
                            <span className="text-slate-400 font-medium">Ý kiến phê duyệt:</span>
                            <p className="font-semibold text-slate-800 mt-0.5">{step.reviewNotes}</p>
                          </div>
                        )}

                        {step.reworkRequirements && (
                          <div className="col-span-2 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                            <span className="text-rose-700 font-bold flex items-center space-x-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Yêu cầu sửa đổi bổ sung:</span>
                            </span>
                            <p className="text-rose-900 mt-0.5">{step.reworkRequirements}</p>
                          </div>
                        )}

                        {step.caProvider && (
                          <div className="col-span-2 flex items-center space-x-2 text-[10px] text-emerald-800 bg-emerald-100/60 p-1.5 rounded-lg border border-emerald-300">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>
                              Ký số CA điện tử:{' '}
                              <strong>{step.caProvider.toUpperCase()}</strong> • Serial: {step.pkiCertificateSerial || 'X.509'} • Hash SHA-256 xác thực
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Box 3: Nhật ký kiểm toán vết (Audit Trail) */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Nhật Ký Kiểm Toán Vết (Audit Trail)
            </h4>

            <div className="space-y-2">
              {process.auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between py-1.5 border-b border-slate-200/60 last:border-none text-[11px]"
                >
                  <div>
                    <span className="font-bold text-slate-800">{log.actorName}</span>
                    <span className="text-slate-400 ml-1">({log.actorRole || 'user'})</span>
                    <p className="text-slate-600 mt-0.5">{log.note}</p>
                  </div>
                  <span className="text-slate-400 font-mono text-[10px] shrink-0 ml-2">
                    {new Date(log.timestamp).toLocaleString('vi-VN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Quy trình bảo mật chống duyệt vượt cấp</span>
          </div>

          <div className="flex items-center space-x-2">
            {process.status === 'in_progress' && (
              <button
                onClick={() => onRemind(process)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Gửi Nhắc Duyệt</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
