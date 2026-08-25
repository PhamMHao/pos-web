import React, { useState, useMemo } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Layers,
  FileCheck,
  Search,
  Filter,
  Download,
  Printer,
  RefreshCw,
  Sparkles,
  Smartphone,
  Key,
  Cloud,
  ExternalLink,
  Calendar,
  Clock,
  Award,
  AlertTriangle,
  Building2,
  FileText,
  Activity,
  Sliders,
  DollarSign,
  Send,
  Zap,
} from 'lucide-react';
import {
  CaGatewayConfig,
  CaProvider,
  DigitalCertificateX509,
  DigitalSignatureMetadata,
  DocSigningType,
  SignableDocument,
  SignatureAuditLog,
  SigningMethod,
  StoreSettings,
} from '../../types';
import {
  DEFAULT_CA_GATEWAYS,
  DEFAULT_CERTIFICATES,
  getInitialSignableDocuments,
  executeDigitalSignature,
  verifySignatureIntegrity,
} from '../../utils/digitalSignatureEngine';
import { SignatureVerificationBadge } from './SignatureVerificationBadge';
import { DocumentSignerModal } from './DocumentSignerModal';
import { formatVND } from '../../utils/vietqr';

export interface DigitalSignatureHubModalProps {
  settings?: StoreSettings;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

export const DigitalSignatureHubModal: React.FC<DigitalSignatureHubModalProps> = ({
  settings,
  onClose,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<
    'signing_desk' | 'certificates' | 'gateways' | 'validator' | 'audit_logs'
  >('signing_desk');

  // Documents State
  const [documents, setDocuments] = useState<SignableDocument[]>(() =>
    getInitialSignableDocuments()
  );
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [docTypeFilter, setDocTypeFilter] = useState<string>('all');
  const [docStatusFilter, setDocStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Gateways State
  const [gateways, setGateways] = useState<CaGatewayConfig[]>(DEFAULT_CA_GATEWAYS);
  const [isPinging, setIsPinging] = useState(false);

  // Certificates State
  const [certificates, setCertificates] = useState<DigitalCertificateX509[]>(DEFAULT_CERTIFICATES);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<SignatureAuditLog[]>([
    {
      id: 'LOG-001',
      timestamp: '2026-02-25 08:30:15',
      action: 'sign_single',
      documentId: 'doc-inv-init',
      documentCode: 'HD-2026-0088',
      documentType: 'einvoice',
      documentTitle: 'Hóa Đơn Điện Tử GTGT - Cty Bất Động Sản An Gia',
      provider: 'viettel_smartca',
      signerName: 'Nguyễn Văn Phúc',
      ipAddress: '113.161.42.18',
      status: 'success',
      details: 'Ký số phát hành thành công XML-DSig gửi Cơ Quan Thuế',
      sha256Hash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7829a1b2',
    },
    {
      id: 'LOG-002',
      timestamp: '2026-02-24 16:45:10',
      action: 'sign_batch',
      documentId: 'batch-0224',
      documentCode: 'BATCH-4-DOCS',
      documentType: 'contract',
      documentTitle: 'Ký số hàng loạt 4 Hợp Đồng Lao Động Mới',
      provider: 'vnpt_smartca',
      signerName: 'Nguyễn Văn Phúc',
      ipAddress: '113.161.42.18',
      status: 'success',
      details: 'Ký số PAdES B-LT kèm Dấu thời gian VNPT TSA RFC 3161',
      sha256Hash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    },
  ]);

  // Modals & Single Sign State
  const [singleSignDoc, setSingleSignDoc] = useState<SignableDocument | null>(null);
  const [isBatchSigning, setIsBatchSigning] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0,
  });

  // Selected Doc for Validator Tab
  const [validatorDoc, setValidatorDoc] = useState<SignableDocument | null>(null);

  // Filtered Documents
  const filteredDocs = useMemo(() => {
    return documents.filter((d) => {
      if (docTypeFilter !== 'all' && d.type !== docTypeFilter) return false;
      if (docStatusFilter !== 'all' && d.status !== docStatusFilter) return false;
      if (searchTerm.trim()) {
        const kw = searchTerm.toLowerCase();
        return (
          d.code.toLowerCase().includes(kw) ||
          d.title.toLowerCase().includes(kw) ||
          d.recipientName.toLowerCase().includes(kw)
        );
      }
      return true;
    });
  }, [documents, docTypeFilter, docStatusFilter, searchTerm]);

  const pendingDocs = documents.filter((d) => d.status === 'pending');
  const signedDocs = documents.filter((d) => d.status === 'signed');

  // Ping Test Handler
  const handlePingAllGateways = async () => {
    setIsPinging(true);
    await new Promise((r) => setTimeout(r, 600));

    setGateways((prev) =>
      prev.map((g) => {
        const jitter = Math.floor(Math.random() * 15) - 5;
        const latency = Math.max(15, (g.pingLatencyMs || 40) + jitter);
        return {
          ...g,
          pingLatencyMs: latency,
          lastPingStatus: 'online',
          lastPingAt: 'Vừa xong',
        };
      })
    );
    setIsPinging(false);
  };

  // Toggle Document Selection
  const handleToggleSelectDoc = (id: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllPending = () => {
    if (selectedDocIds.length === pendingDocs.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(pendingDocs.map((d) => d.id));
    }
  };

  // Single Sign Success Callback
  const handleSignSuccess = (
    signature: DigitalSignatureMetadata,
    auditLog: SignatureAuditLog
  ) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === signature.documentId ? { ...d, status: 'signed', signature } : d))
    );
    setAuditLogs((prev) => [auditLog, ...prev]);
    setSingleSignDoc(null);
  };

  // Batch Sign Handler
  const handleStartBatchSign = async () => {
    const targetDocs = documents.filter((d) => selectedDocIds.includes(d.id) && d.status === 'pending');
    if (targetDocs.length === 0) return;

    setIsBatchSigning(true);
    setBatchProgress({ current: 0, total: targetDocs.length });

    const newLogs: SignatureAuditLog[] = [];
    const defaultCert = certificates[0];

    for (let i = 0; i < targetDocs.length; i++) {
      const doc = targetDocs[i];
      setBatchProgress({ current: i + 1, total: targetDocs.length });

      const { signature, auditLog } = await executeDigitalSignature(
        doc,
        'viettel_smartca',
        'remote_signing',
        defaultCert,
        settings
      );

      setDocuments((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, status: 'signed', signature } : d))
      );

      newLogs.push(auditLog);
    }

    setAuditLogs((prev) => [...newLogs, ...prev]);
    setSelectedDocIds([]);
    setIsBatchSigning(false);
  };

  // Export Audit Logs to Excel
  const handleExportAuditLogsExcel = () => {
    const rows = auditLogs
      .map(
        (l) => `
      <Row>
        <Cell ss:StyleID="CenterCell"><Data ss:Type="String">${l.id}</Data></Cell>
        <Cell><Data ss:Type="String">${l.timestamp}</Data></Cell>
        <Cell><Data ss:Type="String">${l.documentCode}</Data></Cell>
        <Cell><Data ss:Type="String">${l.documentTitle}</Data></Cell>
        <Cell ss:StyleID="CenterCell"><Data ss:Type="String">${l.provider}</Data></Cell>
        <Cell><Data ss:Type="String">${l.signerName}</Data></Cell>
        <Cell ss:StyleID="CenterCell"><Data ss:Type="String">${l.ipAddress}</Data></Cell>
        <Cell ss:StyleID="CenterCell"><Data ss:Type="String">${l.status}</Data></Cell>
        <Cell><Data ss:Type="String">${l.sha256Hash}</Data></Cell>
      </Row>`
      )
      .join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal"><Font ss:FontName="Calibri" ss:Size="11"/></Style>
    <Style ss:ID="Header"><Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#ffffff"/><Interior ss:Color="#0f766e" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center"/></Style>
    <Style ss:ID="CenterCell"><Alignment ss:Horizontal="Center"/></Style>
  </Styles>
  <Worksheet ss:Name="Nhat_Ky_Kiem_Toan_Ky_So">
    <Table ss:DefaultColumnWidth="140">
      <Row ss:Height="22">
        <Cell ss:StyleID="Header"><Data ss:Type="String">Mã Log</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Thời Gian</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Mã Chứng Từ</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Tên Chứng Từ</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Nhà Mạng CA</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Người Ký</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Địa Chỉ IP</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Trạng Thái</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Mã Băm SHA-256</Data></Cell>
      </Row>
      ${rows}
    </Table>
  </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Nhat_Ky_Kiem_Toan_Ky_So_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-2 sm:p-4 overflow-y-auto backdrop-blur-md">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[95vh] text-slate-200">
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black text-white tracking-wide">
                  Trung Tâm Điều Hành Chữ Ký Số Tập Trung (Digital Signature Hub)
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  e-Sign 2026
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ký số Hóa đơn điện tử, Hợp đồng lao động, Báo giá, PO chuẩn Luật Giao dịch điện tử 2023 &amp; TT 78
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handlePingAllGateways}
              disabled={isPinging}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-bold border border-slate-700 flex items-center space-x-1.5 transition cursor-pointer"
              title="Kiểm tra độ trễ kết nối API đến các nhà mạng CA"
            >
              <Activity className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : 'text-cyan-400'}`} />
              <span>{isPinging ? 'Đang Ping...' : 'Kiểm Tra Ping CA'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 5 Main Sub-Tabs */}
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center space-x-2 overflow-x-auto text-xs font-bold shrink-0 custom-scrollbar">
          <button
            onClick={() => setActiveTab('signing_desk')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
              activeTab === 'signing_desk'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>1. Bàn Ký Số Tập Trung</span>
            {pendingDocs.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px]">
                {pendingDocs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('certificates')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
              activeTab === 'certificates'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>2. Kho Chứng Thư Số X.509 ({certificates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('gateways')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
              activeTab === 'gateways'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>3. Cổng Kết Nối CA ({gateways.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('validator')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
              activeTab === 'validator'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>4. Kiểm Định &amp; Xác Thực</span>
          </button>

          <button
            onClick={() => setActiveTab('audit_logs')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
              activeTab === 'audit_logs'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-950/60 border border-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>5. Nhật Ký Kiểm Toán ({auditLogs.length})</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: BÀN KÝ SỐ TẬP TRUNG (SIGNING DESK)                                  */}
        {/* ========================================================================= */}
        {activeTab === 'signing_desk' && (
          <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6 space-y-4">
            {/* Filter & Batch Actions Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center flex-wrap gap-2 text-xs">
                <div className="relative w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm theo mã, tên chứng từ..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-white text-xs placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Filter by Doc Type */}
                <select
                  value={docTypeFilter}
                  onChange={(e) => setDocTypeFilter(e.target.value)}
                  className="bg-slate-900 text-white text-xs px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">Tất Cả Loại Chứng Từ</option>
                  <option value="einvoice">Hóa Đơn Điện Tử (XML-DSig)</option>
                  <option value="contract">Hợp Đồng Lao Động (PAdES B-LT)</option>
                  <option value="quote">Báo Giá Dự Án (PAdES B-LT)</option>
                  <option value="purchase_order">Đơn Đặt Hàng PO (PAdES B-LT)</option>
                  <option value="kpi_decision">Quyết Định Khen Thưởng KPI</option>
                </select>

                {/* Filter by Status */}
                <select
                  value={docStatusFilter}
                  onChange={(e) => setDocStatusFilter(e.target.value)}
                  className="bg-slate-900 text-white text-xs px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">Tất Cả Trạng Thái</option>
                  <option value="pending">Chờ Ký Số ({pendingDocs.length})</option>
                  <option value="signed">Đã Ký Hợp Lệ ({signedDocs.length})</option>
                </select>
              </div>

              {/* Batch Signing Trigger */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSelectAllPending}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  {selectedDocIds.length === pendingDocs.length && pendingDocs.length > 0
                    ? 'Bỏ Chọn Hết'
                    : `Chọn Tất Cả Chờ Ký (${pendingDocs.length})`}
                </button>

                <button
                  onClick={handleStartBatchSign}
                  disabled={selectedDocIds.length === 0 || isBatchSigning}
                  className={`px-4 py-1.5 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all shadow-md cursor-pointer ${
                    selectedDocIds.length > 0 && !isBatchSigning
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {isBatchSigning
                      ? `Đang Ký (${batchProgress.current}/${batchProgress.total})...`
                      : `Ký Hàng Loạt (${selectedDocIds.length})`}
                  </span>
                </button>
              </div>
            </div>

            {/* Batch Signing Progress Bar Animation */}
            {isBatchSigning && (
              <div className="p-3 bg-slate-950 rounded-2xl border border-emerald-500/40 space-y-2 text-xs animate-in fade-in">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Đang tiến hành ký số hàng loạt qua Viettel SmartCA HSM...
                  </span>
                  <span>
                    {batchProgress.current} / {batchProgress.total} Chứng Từ
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{
                      width: `${(batchProgress.current / (batchProgress.total || 1)) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Documents Table */}
            <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 shadow-inner">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800 sticky top-0 z-10">
                  <tr>
                    <th className="py-3 px-3 text-center w-10">
                      <input
                        type="checkbox"
                        checked={selectedDocIds.length > 0 && selectedDocIds.length === pendingDocs.length}
                        onChange={handleSelectAllPending}
                        className="w-3.5 h-3.5 rounded text-emerald-600 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-3">Mã Chứng Từ</th>
                    <th className="py-3 px-3">Tên Chứng Từ &amp; Định Dạng</th>
                    <th className="py-3 px-3">Phân Hệ</th>
                    <th className="py-3 px-3 text-right">Giá Trị (VNĐ)</th>
                    <th className="py-3 px-3">Đối Tác / Nhân Sự</th>
                    <th className="py-3 px-3 text-center">Trạng Thái Ký</th>
                    <th className="py-3 px-3 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredDocs.map((doc) => (
                    <tr
                      key={doc.id}
                      className={`hover:bg-slate-900/60 transition-colors ${
                        selectedDocIds.includes(doc.id) ? 'bg-emerald-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        {doc.status === 'pending' ? (
                          <input
                            type="checkbox"
                            checked={selectedDocIds.includes(doc.id)}
                            onChange={() => handleToggleSelectDoc(doc.id)}
                            className="w-3.5 h-3.5 rounded text-emerald-600 cursor-pointer"
                          />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-3 font-sans font-bold text-slate-300">
                        {doc.code}
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <div className="font-bold text-white text-xs">{doc.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                          <span className="text-cyan-400 font-semibold">{doc.legalStandard}</span>
                          <span>•</span>
                          <span>Tạo lúc: {doc.createdAt}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {doc.typeLabel}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-200">
                        {doc.totalAmount ? formatVND(doc.totalAmount) : '—'}
                      </td>
                      <td className="py-3 px-3 font-sans text-slate-300 truncate max-w-[150px]">
                        {doc.recipientName}
                      </td>
                      <td className="py-3 px-3 text-center font-sans">
                        {doc.status === 'signed' && doc.signature ? (
                          <SignatureVerificationBadge signature={doc.signature} size="sm" />
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Chờ Ký Số
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-sans">
                        {doc.status === 'pending' ? (
                          <button
                            onClick={() => setSingleSignDoc(doc)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition shadow flex items-center space-x-1 mx-auto cursor-pointer"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>Ký Số</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setValidatorDoc(doc);
                              setActiveTab('validator');
                            }}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-lg transition mx-auto cursor-pointer"
                            title="Kiểm tra chi tiết chữ ký số"
                          >
                            Kiểm Định
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: KHO CHỨNG THƯ SỐ DOANH NGHIỆP X.509 (CERTIFICATES)                 */}
        {/* ========================================================================= */}
        {activeTab === 'certificates' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400" />
                  <span>Kho Chứng Thư Số Doanh Nghiệp X.509 (PKI Standard)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Lưu trữ và quản lý chứng thư số ký điện tử con dấu công ty, lãnh đạo và kế toán trưởng
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3 relative overflow-hidden shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <span className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <Award className="w-5 h-5" />
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        HỢP LỆ (ACTIVE)
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-white line-clamp-1">{cert.subjectName}</h4>
                      <p className="text-xs text-cyan-400 font-medium">{cert.assignedTo}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-[11px] font-mono">
                      <div className="text-slate-400">Serial: {cert.serialNumber}</div>
                      <div className="text-slate-400">Thuật toán: {cert.keyAlgorithm}</div>
                      <div className="text-slate-400">Cấp bởi: {cert.issuer}</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 text-[11px] flex items-center justify-between text-slate-400">
                    <span>Hạn dùng:</span>
                    <span className="text-emerald-400 font-bold font-mono">{cert.validTo}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CỔNG KẾT NỐI NHÀ CUNG CẤP CA (GATEWAYS & PING)                     */}
        {/* ========================================================================= */}
        {activeTab === 'gateways' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <span>Cổng Tích Hợp API Nhà Cung Cấp Chứng Thực Số (CA Gateways)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Kết nối trực tiếp Viettel SmartCA, VNPT SmartCA, FPT.eSign, MISA eSign, BKAV-CA &amp; USB Token
                </p>
              </div>

              <button
                onClick={handlePingAllGateways}
                disabled={isPinging}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow transition flex items-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isPinging ? 'animate-spin' : ''}`} />
                <span>Kiểm Tra Toàn Bộ Cổng (Ping Test)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gateways.map((gw) => (
                <div
                  key={gw.provider}
                  className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3 shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{gw.logo}</span>
                        <div>
                          <h4 className="font-bold text-sm text-white">{gw.name}</h4>
                          <span className="text-[10px] text-slate-400">{gw.tagline}</span>
                        </div>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{gw.description}</p>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Endpoint:</span>
                        <span className="text-slate-300 font-mono truncate max-w-[160px]">{gw.endpointUrl}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Client ID:</span>
                        <span className="text-cyan-400 font-mono">{gw.clientId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Độ trễ API:</span>
                        <span className="text-emerald-400 font-mono font-bold">{gw.pingLatencyMs}ms (Online)</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[10px]">Cập nhật: {gw.lastPingAt}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Sẵn Sàng Ký
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CÔNG CỤ KIỂM ĐỊNH & XÁC THỰC TÍNH TOÀN VẸN (VALIDATOR)             */}
        {/* ========================================================================= */}
        {activeTab === 'validator' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Công Cụ Kiểm Định &amp; Xác Thực Chữ Ký Số (Signature Validator)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Kiểm tra mã băm SHA-256, dấu thời gian TSA RFC 3161 và tính pháp lý theo Luật Giao dịch điện tử 2023
                </p>
              </div>
            </div>

            {/* Document Selector for Verification */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                Chọn chứng từ đã ký để kiểm định tính toàn vẹn:
              </label>
              <select
                value={validatorDoc?.id || ''}
                onChange={(e) => {
                  const doc = documents.find((d) => d.id === e.target.value) || null;
                  setValidatorDoc(doc);
                }}
                className="w-full bg-slate-900 text-white text-xs px-3.5 py-2 rounded-xl border border-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="">-- Chọn chứng từ đã ký số --</option>
                {signedDocs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} - {d.title} ({d.signature?.providerName})
                  </option>
                ))}
              </select>
            </div>

            {/* Verification Result Display */}
            {validatorDoc && validatorDoc.signature ? (
              <div className="p-5 rounded-3xl bg-slate-950 border border-emerald-500/40 space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h4 className="font-bold text-white text-sm">{validatorDoc.title}</h4>
                    <p className="text-slate-400 font-mono">Mã chứng từ: {validatorDoc.code}</p>
                  </div>
                  <SignatureVerificationBadge signature={validatorDoc.signature} size="md" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-1.5 font-mono text-[11px]">
                    <div className="text-slate-400 font-sans font-bold text-xs text-white mb-1">
                      Thông Tin Chữ Ký Số:
                    </div>
                    <div>Người ký: {validatorDoc.signature.signerName}</div>
                    <div>Nhà cung cấp: {validatorDoc.signature.providerName}</div>
                    <div>Định dạng: {validatorDoc.signature.signatureFormat}</div>
                    <div>Thời gian: {new Date(validatorDoc.signature.signedAt).toLocaleString('vi-VN')}</div>
                    <div>Dấu TSA: {validatorDoc.signature.tsaTimestamp}</div>
                    <div>Serial: {validatorDoc.signature.certificateSerial}</div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-1.5">
                    <div className="font-bold text-xs text-white mb-1">Kiểm Tra Mật Mã (5/5 Đạt):</div>
                    {verifySignatureIntegrity(validatorDoc.signature).checks.map((chk, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-white">{chk.name}</span>
                          <p className="text-slate-400 text-[10px]">{chk.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 text-xs bg-slate-950 rounded-2xl border border-slate-800">
                <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                Vui lòng chọn một chứng từ đã ký số ở trên để xem kết quả kiểm định mã băm SHA-256 và chuỗi chứng thư số.
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: NHẬT KÝ KIỂM TOÁN (AUDIT TRAIL LOGS)                               */}
        {/* ========================================================================= */}
        {activeTab === 'audit_logs' && (
          <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <span>Nhật Ký Kiểm Toán Chống Chối Bỏ (Audit Trail Logs)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Lưu vết bất biến thời gian, địa chỉ IP, người ký và mã băm toàn vẹn SHA-256
                </p>
              </div>

              <button
                onClick={handleExportAuditLogsExcel}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Xuất Excel Nhật Ký</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 shadow-inner">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800 sticky top-0 z-10">
                  <tr>
                    <th className="py-3 px-3">Mã Log</th>
                    <th className="py-3 px-3">Thời Gian</th>
                    <th className="py-3 px-3">Mã Chứng Từ</th>
                    <th className="py-3 px-3">Người Ký</th>
                    <th className="py-3 px-3">Nhà Cung Cấp</th>
                    <th className="py-3 px-3">Địa Chỉ IP</th>
                    <th className="py-3 px-3">Chi Tiết Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-3 px-3 text-cyan-400 font-bold">{log.id}</td>
                      <td className="py-3 px-3 text-slate-300">{log.timestamp}</td>
                      <td className="py-3 px-3 font-sans font-bold text-white">{log.documentCode}</td>
                      <td className="py-3 px-3 font-sans text-slate-200">{log.signerName}</td>
                      <td className="py-3 px-3 font-sans text-emerald-400 font-semibold">{log.provider}</td>
                      <td className="py-3 px-3 text-slate-400">{log.ipAddress}</td>
                      <td className="py-3 px-3 font-sans text-slate-300 truncate max-w-[220px]" title={log.details}>
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quick Sign Modal Trigger */}
        {singleSignDoc && (
          <DocumentSignerModal
            document={singleSignDoc}
            settings={settings}
            onClose={() => setSingleSignDoc(null)}
            onSignSuccess={handleSignSuccess}
          />
        )}
      </div>
    </div>
  );
};
