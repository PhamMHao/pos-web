import React from 'react';
import { GitMerge, Clock, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { ApprovalWorkflowTemplate, APPROVAL_MODULE_CONFIG } from './approvals.types';
import { formatVND } from '../../utils/currency';

interface ApprovalTemplatesTabProps {
  templates: ApprovalWorkflowTemplate[];
  onCreateFromTemplate: (tpl: ApprovalWorkflowTemplate) => void;
}

export const ApprovalTemplatesTab: React.FC<ApprovalTemplatesTabProps> = ({
  templates,
  onCreateFromTemplate,
}) => {
  return (
    <div className="space-y-4 select-none">
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <GitMerge className="w-4 h-4 text-blue-600" />
            <span>8 Mẫu Quy Trình Phê Duyệt Chuẩn Doanh Nghiệp (Standard ERP Workflows)</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Cấu hình thứ tự duyệt tuần tự, phân quyền chức danh, hạn mức và thời gian cam kết SLA từng bước
          </p>
        </div>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          8/8 Khâu Đã Kích Hoạt
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((tpl) => {
          const modConfig =
            APPROVAL_MODULE_CONFIG[tpl.moduleType] || {
              label: tpl.moduleType,
              badge: 'bg-slate-100 text-slate-700 border-slate-300',
              color: 'slate',
            };

          return (
            <div
              key={tpl.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${modConfig.badge}`}>
                    {modConfig.label}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    {tpl.code}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-xs mb-1 group-hover:text-blue-600 transition-colors">
                  {tpl.name}
                </h4>

                <p className="text-[11px] text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                  {tpl.description || 'Quy trình kiểm soát theo tiêu chuẩn quản trị nội bộ doanh nghiệp.'}
                </p>

                {/* Các bước trong mẫu */}
                <div className="space-y-2 mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Chuỗi Phê Duyệt Tuần Tự ({tpl.steps.length} Bước):
                  </span>
                  {tpl.steps.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px]"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                          {s.stepOrder}
                        </span>
                        <div>
                          <span className="font-bold text-slate-800 block text-[11px] leading-tight">
                            {s.stepName}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Vai trò: <strong className="uppercase text-blue-700">{s.requiredRole}</strong> • SLA: {s.slaHours}h
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200 font-mono">
                        {s.signMethod.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nút Tạo Phiếu từ Mẫu */}
              <button
                onClick={() => onCreateFromTemplate(tpl)}
                className="w-full mt-2 py-2 px-3 rounded-xl text-xs font-bold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-200 hover:border-blue-600 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>Khởi Tạo Tờ Trình Theo Mẫu Này</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
