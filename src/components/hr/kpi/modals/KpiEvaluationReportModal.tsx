import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  FileCheck,
  Award,
  Stamp,
  User,
  ShieldCheck,
  Building2,
  FileText,
} from 'lucide-react';
import { KpiEvaluation, StoreSettings, DigitalSignatureMetadata, Employee } from '../../../../types';
import { KpiFormTabType } from '../kpi.types';
import { exportKpiExcelFile } from '../exportKpiExcel';
import { KpiPersonalEvaluationForm } from '../forms/KpiPersonalEvaluationForm';
import { KpiProposalStatementForm } from '../forms/KpiProposalStatementForm';
import { KpiAwardDecisionForm } from '../forms/KpiAwardDecisionForm';
import { KpiSummaryReportForm } from '../forms/KpiSummaryReportForm';
import { DocumentSignerModal } from '../../../signatures/DocumentSignerModal';

export interface KpiEvaluationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluations: KpiEvaluation[];
  employees?: Employee[];
  settings?: StoreSettings;
  initialEvaluationId?: string;
  onApproveEvaluation?: (evalId: string, signature?: DigitalSignatureMetadata) => void;
}

export const KpiEvaluationReportModal: React.FC<KpiEvaluationReportModalProps> = ({
  isOpen,
  onClose,
  evaluations = [],
  settings,
  initialEvaluationId,
  onApproveEvaluation,
}) => {
  const [activeFormTab, setActiveFormTab] = useState<KpiFormTabType>('form01');
  const [selectedEvalId, setSelectedEvalId] = useState<string>(
    initialEvaluationId || evaluations[0]?.id || ''
  );
  const [showRedSeal, setShowRedSeal] = useState<boolean>(true);
  const [showCaSignModal, setShowCaSignModal] = useState<boolean>(false);
  const [kpiDecisionSignature, setKpiDecisionSignature] = useState<DigitalSignatureMetadata | null>(null);

  if (!isOpen) return null;

  const currentEval = evaluations.find((e) => e.id === selectedEvalId) || evaluations[0];
  const companyName = settings?.companyLegalName || 'CÔNG TY TNHH MTV TM-DV SỬA CHỮA GIA PHÚC';
  const period = currentEval?.period || 'Tháng 02/2026';

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    exportKpiExcelFile({
      companyName,
      reportPeriod: period,
      activeFormTab,
      currentEval,
      evaluations,
    });
  };

  const handleCaSigned = (signature: DigitalSignatureMetadata) => {
    setKpiDecisionSignature(signature);
    setShowCaSignModal(false);
    if (onApproveEvaluation && currentEval) {
      onApproveEvaluation(currentEval.id, signature);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white animate-fadeIn">
      <div className="bg-slate-100 rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl flex flex-col max-h-[95vh] overflow-hidden print:border-none print:shadow-none print:max-h-none print:rounded-none">
        {/* Header Modal Bar */}
        <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 text-base md:text-lg tracking-tight">
                Biểu Mẫu &amp; Quyết Định Khen Thưởng KPI Chuẩn Nhà Nước
              </h2>
              <p className="text-xs text-slate-500">
                Tuân thủ Nghị định 30/2020/NĐ-CP và Điều 104 Bộ Luật Lao Động 2019
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Toggle Mộc Đỏ */}
            <button
              onClick={() => setShowRedSeal(!showRedSeal)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                showRedSeal
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              <Stamp className="w-3.5 h-3.5 text-rose-600" />
              <span>{showRedSeal ? 'Mộc Đỏ: Bật' : 'Mộc Đỏ: Tắt'}</span>
            </button>

            {/* In A4 */}
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>In A4</span>
            </button>

            {/* Xuất Excel */}
            <button
              onClick={handleExportExcel}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Excel</span>
            </button>

            {/* Đóng */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Selector Tabs Bar */}
        <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden text-xs">
          <div className="flex items-center space-x-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveFormTab('form01')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeFormTab === 'form01'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Mẫu 01: Phiếu Đánh Giá Cá Nhân</span>
            </button>

            <button
              onClick={() => setActiveFormTab('form02')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeFormTab === 'form02'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Mẫu 02: Tờ Trình Khen Thưởng</span>
            </button>

            <button
              onClick={() => setActiveFormTab('form03')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeFormTab === 'form03'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Mẫu 03: Quyết Định Khen Thưởng (BLLĐ)</span>
            </button>

            <button
              onClick={() => setActiveFormTab('form04')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeFormTab === 'form04'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Mẫu 04: Báo Cáo Tổng Hợp Quỹ Thưởng</span>
            </button>
          </div>

          {/* Chọn nhân viên khi ở Mẫu 01 */}
          {activeFormTab === 'form01' && evaluations.length > 0 && (
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">Xem nhân viên:</span>
              <select
                value={selectedEvalId}
                onChange={(e) => setSelectedEvalId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {evaluations.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.employeeCode} - {ev.employeeName} ({ev.rank})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Nội Dung Biểu Mẫu Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 print:p-0 print:overflow-visible">
          {activeFormTab === 'form01' && currentEval && (
            <KpiPersonalEvaluationForm
              evaluation={currentEval}
              settings={settings}
              showRedSeal={showRedSeal}
              signature={kpiDecisionSignature || currentEval.digitalSignature}
            />
          )}

          {activeFormTab === 'form02' && (
            <KpiProposalStatementForm
              evaluations={evaluations}
              settings={settings}
              period={period}
              showRedSeal={showRedSeal}
            />
          )}

          {activeFormTab === 'form03' && (
            <KpiAwardDecisionForm
              evaluations={evaluations}
              settings={settings}
              period={period}
              showRedSeal={showRedSeal}
              signature={kpiDecisionSignature}
              onOpenCaSignModal={() => setShowCaSignModal(true)}
            />
          )}

          {activeFormTab === 'form04' && (
            <KpiSummaryReportForm
              evaluations={evaluations}
              settings={settings}
              period={period}
              showRedSeal={showRedSeal}
            />
          )}
        </div>

        {/* Modal Ký Số Điện Tử CA */}
        {showCaSignModal && (
          <DocumentSignerModal
            isOpen={showCaSignModal}
            onClose={() => setShowCaSignModal(false)}
            docType="internal"
            docId={currentEval?.id || 'QĐ-KT-2026/02'}
            docCode={`QĐ-KT-${period.replace(/[^a-zA-Z0-9]/g, '')}`}
            onSignedSuccess={handleCaSigned}
          />
        )}
      </div>
    </div>
  );
};

export default KpiEvaluationReportModal;
