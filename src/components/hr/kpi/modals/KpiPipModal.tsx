import React, { useState } from 'react';
import { X, Printer, AlertTriangle, CheckCircle2, Calendar, Target, UserCheck } from 'lucide-react';
import { KpiEvaluation, StoreSettings } from '../../../../types';

export interface KpiPipModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: KpiEvaluation;
  settings?: StoreSettings;
}

export const KpiPipModal: React.FC<KpiPipModalProps> = ({
  isOpen,
  onClose,
  evaluation,
  settings,
}) => {
  const [pipDuration, setPipDuration] = useState<'30' | '60'>('30');
  const [mentorName, setMentorName] = useState<string>('Trưởng Bộ Phận Chuyên Môn');
  const [actionItem1, setActionItem1] = useState<string>('Nâng tỷ lệ hoàn thành chỉ tiêu doanh số/nghiệp vụ tối thiểu đạt 85%.');
  const [actionItem2, setActionItem2] = useState<string>('Khắc phục triệt để các sai sót ca trực và tuân thủ 100% quy trình SOP.');
  const [actionItem3, setActionItem3] = useState<string>('Tham gia đầy đủ các buổi đào tạo nghiệp vụ và kiểm tra định kỳ hàng tuần.');

  if (!isOpen) return null;

  const companyName = settings?.companyLegalName || 'CÔNG TY TNHH MTV TM-DV SỬA CHỮA GIA PHÚC';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900 text-sm print:border-none print:shadow-none print:max-h-none">
        {/* Header Modal Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-3 bg-rose-50/50 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Kế Hoạch Cải Thiện Hiệu Suất (PIP - Performance Improvement Plan)
              </h3>
              <p className="text-xs text-rose-700 font-medium">
                Áp dụng theo quy chế nhân sự &amp; Điều 36 Bộ Luật Lao Động 2019
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In A4</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 print:p-0">
          {/* Căn cứ pháp lý */}
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Căn cứ pháp lý &amp; Mục đích thiết lập PIP:
            </div>
            <p className="leading-relaxed">
              Căn cứ kết quả đánh giá KPI kỳ <b>{evaluation.period}</b>, nhân sự <b>{evaluation.employeeName}</b> đạt <b>{evaluation.finalScore} điểm (Xếp loại {evaluation.rank})</b>. Kế hoạch này được ban hành nhằm tạo điều kiện đào tạo, hỗ trợ người lao động cải thiện hiệu suất trước khi xem xét đánh giá theo Điều 36 BLLĐ 2019.
            </p>
          </div>

          {/* Thông tin nhân viên */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400">Nhân sự:</span>
              <div className="font-bold text-slate-900 text-sm">{evaluation.employeeName}</div>
            </div>
            <div>
              <span className="text-slate-400">Mã nhân viên:</span>
              <div className="font-mono font-bold text-slate-900">{evaluation.employeeCode}</div>
            </div>
            <div>
              <span className="text-slate-400">Chức vụ:</span>
              <div className="font-semibold text-slate-900">{evaluation.role}</div>
            </div>
            <div>
              <span className="text-slate-400">Thời gian PIP:</span>
              <div className="font-bold text-rose-700">{pipDuration} Ngày thử thách</div>
            </div>
          </div>

          {/* Form chỉnh sửa PIP (ẩn khi in) */}
          <div className="space-y-3 text-xs print:hidden">
            <div className="font-bold uppercase text-slate-700">Thiết Lập Mục Tiêu Cải Thiện &amp; Người Hướng Dẫn:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-600 font-medium">Thời hạn thực hiện PIP:</label>
                <select
                  value={pipDuration}
                  onChange={(e) => setPipDuration(e.target.value as any)}
                  className="w-full mt-1 p-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="30">30 Ngày (Kiểm tra định kỳ mỗi 7 ngày)</option>
                  <option value="60">60 Ngày (Kiểm tra định kỳ mỗi 14 ngày)</option>
                </select>
              </div>
              <div>
                <label className="text-slate-600 font-medium">Người hướng dẫn &amp; Kèm cặp (Mentor):</label>
                <input
                  type="text"
                  value={mentorName}
                  onChange={(e) => setMentorName(e.target.value)}
                  className="w-full mt-1 p-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Danh mục hành động cam kết */}
          <div className="space-y-2 text-xs">
            <div className="font-bold uppercase text-slate-700">Các Chỉ Tiêu &amp; Hành Động Cải Thiện Cụ Thể:</div>
            <div className="space-y-2">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-2">
                <span className="font-bold text-blue-600">1.</span>
                <p className="text-slate-800">{actionItem1}</p>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-2">
                <span className="font-bold text-blue-600">2.</span>
                <p className="text-slate-800">{actionItem2}</p>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-2">
                <span className="font-bold text-blue-600">3.</span>
                <p className="text-slate-800">{actionItem3}</p>
              </div>
            </div>
          </div>

          {/* Cam kết 3 bên */}
          <div className="pt-4 grid grid-cols-3 gap-4 text-center text-xs border-t border-slate-200">
            <div className="space-y-1">
              <div className="font-bold text-slate-900 uppercase">NGƯỜI LAO ĐỘNG</div>
              <div className="text-[10px] text-slate-500 italic">(Ký và cam kết thực hiện)</div>
              <div className="h-12 flex items-center justify-center font-serif italic text-slate-700">
                {evaluation.employeeName}
              </div>
              <div className="font-semibold">{evaluation.employeeName}</div>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-slate-900 uppercase">NGƯỜI HƯỚNG DẪN</div>
              <div className="text-[10px] text-slate-500 italic">(Ký xác nhận kèm cặp)</div>
              <div className="h-12 flex items-center justify-center font-serif italic text-slate-700">
                {mentorName}
              </div>
              <div className="font-semibold">{mentorName}</div>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-slate-900 uppercase">TRƯỞNG PHÒNG NHÂN SỰ</div>
              <div className="text-[10px] text-slate-500 italic">(Ký duyệt ban hành PIP)</div>
              <div className="h-12 flex items-center justify-center font-serif italic text-slate-700">
                Phan Thị Ngọc Hà
              </div>
              <div className="font-semibold">Ban Nhân Sự</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KpiPipModal;
