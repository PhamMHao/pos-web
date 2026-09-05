import React, { useState, useEffect, useTransition } from 'react';
import { useAuth } from '../../core/contexts/AuthContext';
import { approvalsApi } from '../../features/approvals/api/approvalsApi';
import {
  SequentialApprovalProcess,
  SequentialApprovalStep,
  ApprovalWorkflowTemplate,
  ApprovalAnalyticsData,
  ApprovalActionPayload,
} from './approvals.types';
import { ApprovalKpiCards } from './ApprovalKpiCards';
import { ApprovalFilterBar } from './ApprovalFilterBar';
import { ApprovalProcessTable } from './ApprovalProcessTable';
import { ApprovalDetailModal } from './ApprovalDetailModal';
import { ApprovalSignActionModal } from './ApprovalSignActionModal';
import { ApprovalPrintA4Modal } from './ApprovalPrintA4Modal';
import { ApprovalTemplatesTab } from './ApprovalTemplatesTab';
import { ApprovalAnalyticsTab } from './ApprovalAnalyticsTab';
import { ApprovalCreateModal } from './ApprovalCreateModal';
import { exportApprovalsMultiSheetExcel } from './exportApprovalsExcel';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const ApprovalsView: React.FC = () => {
  const { user } = useAuth();

  const [processes, setProcesses] = useState<SequentialApprovalProcess[]>([]);
  const [templates, setTemplates] = useState<ApprovalWorkflowTemplate[]>([]);
  const [analytics, setAnalytics] = useState<ApprovalAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [activeViewTab, setActiveViewTab] = useState<'list' | 'templates' | 'analytics'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [onlyMyTurn, setOnlyMyTurn] = useState(false);

  // Modals state
  const [detailProcess, setDetailProcess] = useState<SequentialApprovalProcess | null>(null);
  const [signModalData, setSignModalData] = useState<{
    process: SequentialApprovalProcess;
    step: SequentialApprovalStep;
  } | null>(null);
  const [printProcess, setPrintProcess] = useState<SequentialApprovalProcess | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTemplateForCreate, setSelectedTemplateForCreate] = useState<ApprovalWorkflowTemplate | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load processes, templates, and analytics from database
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [procData, tplData, anaData] = await Promise.all([
        approvalsApi.getProcesses({
          moduleType: selectedModule !== 'all' ? selectedModule : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
          search: searchQuery || undefined,
        }),
        approvalsApi.getTemplates(),
        approvalsApi.getAnalytics(),
      ]);

      setProcesses(procData);
      setTemplates(tplData);
      setAnalytics(anaData);
    } catch (err: any) {
      showToast(err?.message || 'Lỗi kết nối cơ sở dữ liệu.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedModule, selectedStatus]);

  // Handle Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Tự động đồng bộ ngầm quy trình phê duyệt từ các máy khác mỗi 15 giây
  useEffect(() => {
    const pollInterval = setInterval(() => {
      if (!document.hidden) {
        Promise.all([
          approvalsApi.getProcesses({
            moduleType: selectedModule !== 'all' ? selectedModule : undefined,
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
            search: searchQuery || undefined,
          }),
          approvalsApi.getTemplates(),
          approvalsApi.getAnalytics(),
        ])
          .then(([procData, tplData, anaData]) => {
            setProcesses(procData);
            setTemplates(tplData);
            setAnalytics(anaData);
          })
          .catch(() => {});
      }
    }, 15000);
    return () => clearInterval(pollInterval);
  }, [selectedModule, selectedStatus, searchQuery]);

  // Filter by "onlyMyTurn" locally
  const displayedProcesses = processes.filter((p) => {
    if (!onlyMyTurn) return true;
    if (p.status !== 'in_progress') return false;
    const activeStep = p.steps.find((s) => s.status === 'waiting');
    if (!activeStep) return false;
    if (user?.role === 'admin') return true;
    return (
      activeStep.requiredRole === user?.role ||
      (user?.fullName && activeStep.assignedUserName.includes(user.fullName))
    );
  });

  // Handle Action (Approve, Rework, Reject)
  const handleExecuteAction = async (payload: ApprovalActionPayload) => {
    if (!signModalData) return;
    try {
      const updated = await approvalsApi.executeAction(signModalData.process.id, payload);
      showToast(
        payload.action === 'approve'
          ? 'Ký duyệt bước thành công!'
          : payload.action === 'rework'
          ? 'Đã gửi yêu cầu làm lại hồ sơ!'
          : 'Đã từ chối tờ trình!',
        'success'
      );
      setDetailProcess(updated);
      await loadData();
    } catch (err: any) {
      showToast(err?.response?.data?.message || err?.message || 'Thao tác thất bại', 'error');
      throw err;
    }
  };

  // Handle Send Reminder
  const handleRemind = async (p: SequentialApprovalProcess) => {
    try {
      const res = await approvalsApi.sendReminder(p.id, user?.fullName || 'Người Quản Trị');
      showToast(res.message || 'Đã gửi nhắc nhở duyệt thành công!', 'success');
      await loadData();
    } catch (err: any) {
      showToast(err?.message || 'Không thể gửi nhắc nhở.', 'error');
    }
  };

  // Handle Export Excel
  const handleExportExcel = () => {
    exportApprovalsMultiSheetExcel(displayedProcesses);
    showToast('Đã xuất thành công tệp Excel Báo Cáo Trình Ký Đa Sheet!');
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto select-none bg-slate-50 min-h-screen">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold animate-in fade-in slide-in-from-bottom-5 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/30'
              : 'bg-rose-600 text-white border-rose-500 shadow-rose-600/30'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-200" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Ký Phê Duyệt Tuần Tự Đa Khâu Liên Phòng Ban</span>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
              Enterprise Workflow
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Khóa duyệt tuần tự: Cấp trước duyệt xong (OK) mới mở khóa cấp sau • Tích hợp Chữ ký số CA &amp; Mã PIN
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-all self-end sm:self-center cursor-pointer"
          title="Tải lại dữ liệu từ cơ sở dữ liệu"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Làm Mới</span>
        </button>
      </div>

      {/* 5 Thẻ KPI */}
      <ApprovalKpiCards
        processes={processes}
        currentUserRole={user?.role}
        currentUserName={user?.fullName}
      />

      {/* Thanh Bộ Lọc & Điều Hướng Tabs */}
      <ApprovalFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedModule={selectedModule}
        setSelectedModule={setSelectedModule}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        onlyMyTurn={onlyMyTurn}
        setOnlyMyTurn={setOnlyMyTurn}
        activeViewTab={activeViewTab}
        setActiveViewTab={setActiveViewTab}
        onExportExcel={handleExportExcel}
        onCreateNew={() => {
          setSelectedTemplateForCreate(null);
          setCreateModalOpen(true);
        }}
      />

      {/* Nội dung theo Tab */}
      {activeViewTab === 'list' && (
        <ApprovalProcessTable
          processes={displayedProcesses}
          currentUserRole={user?.role}
          currentUserName={user?.fullName}
          onViewDetail={(p) => setDetailProcess(p)}
          onSignAction={(p, step) => setSignModalData({ process: p, step })}
          onPrintA4={(p) => setPrintProcess(p)}
          onRemind={handleRemind}
        />
      )}

      {activeViewTab === 'templates' && (
        <ApprovalTemplatesTab
          templates={templates}
          onCreateFromTemplate={(tpl) => {
            setSelectedTemplateForCreate(tpl);
            setCreateModalOpen(true);
          }}
        />
      )}

      {activeViewTab === 'analytics' && (
        <ApprovalAnalyticsTab analytics={analytics} />
      )}

      {/* Modals */}
      {detailProcess && (
        <ApprovalDetailModal
          process={detailProcess}
          currentUserRole={user?.role}
          currentUserName={user?.fullName}
          onClose={() => setDetailProcess(null)}
          onSignAction={(p, step) => {
            setSignModalData({ process: p, step });
          }}
          onPrintA4={(p) => setPrintProcess(p)}
          onRemind={handleRemind}
        />
      )}

      {signModalData && (
        <ApprovalSignActionModal
          process={signModalData.process}
          step={signModalData.step}
          currentUser={user}
          onClose={() => setSignModalData(null)}
          onSubmitAction={handleExecuteAction}
        />
      )}

      {printProcess && (
        <ApprovalPrintA4Modal
          process={printProcess}
          onClose={() => setPrintProcess(null)}
        />
      )}

      {createModalOpen && (
        <ApprovalCreateModal
          initialTemplate={selectedTemplateForCreate}
          currentUser={user}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={async (formData) => {
            const created = await approvalsApi.createProcess(formData);
            showToast(`Đã khởi tạo phiếu trình ký ${created.processCode} thành công!`);
            await loadData();
          }}
        />
      )}
    </div>
  );
};
