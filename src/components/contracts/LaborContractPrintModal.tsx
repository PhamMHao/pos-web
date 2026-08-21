import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Building2,
  User,
  PenTool,
  RotateCcw,
  Lock,
  Calendar,
  FileCheck,
  Sparkles,
  ExternalLink,
  Award,
} from 'lucide-react';
import { LaborContract } from '../../types';
import { numberToVietnameseWords } from '../../utils/numberToWords';
import { GiaPhucLogo } from '../common/GiaPhucLogo';

interface LaborContractPrintModalProps {
  contract: LaborContract;
  onClose: () => void;
  onSignContract?: (contractId: string, signatureDataUrl: string) => void;
}

export const LaborContractPrintModal: React.FC<LaborContractPrintModalProps> = ({
  contract,
  onClose,
  onSignContract,
}) => {
  const [showSignPad, setShowSignPad] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val) + ' đ';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '...';
    const d = new Date(dateStr);
    return `Ngày ${d.getDate().toString().padStart(2, '0')} tháng ${(d.getMonth() + 1).toString().padStart(2, '0')} năm ${d.getFullYear()}`;
  };

  const handlePrint = () => {
    window.print();
  };

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e3a8a'; // Dark blue ink
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleConfirmSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) {
      alert('Vui lòng vẽ chữ ký của bạn trước khi xác nhận!');
      return;
    }
    const signatureDataUrl = canvas.toDataURL('image/png');
    if (onSignContract) {
      onSignContract(contract.id, signatureDataUrl);
    }
    setShowSignPad(false);
    setNotification('Đã ký điện tử Hợp Đồng Lao Động thành công!');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSendEmailZalo = () => {
    setNotification(
      `Đã gửi bản sao Hợp đồng điện tử #${contract.contractNumber} đến email ${contract.employeeInfo.email} và Zalo nhân sự thành công!`
    );
    setTimeout(() => setNotification(null), 4000);
  };

  const totalAllowances =
    contract.terms.allowances.position +
    contract.terms.allowances.lunch +
    contract.terms.allowances.fuel +
    contract.terms.allowances.phone +
    contract.terms.allowances.other;

  const totalGuaranteedIncome = contract.terms.baseSalary + totalAllowances;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 overflow-y-auto backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto border border-slate-200">
        {/* Top Control Bar (Hidden on print) */}
        <div className="print:hidden flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Hợp Đồng Lao Động Điện Tử
                </h3>
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                    contract.status === 'active' || contract.status === 'signed'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {contract.status === 'active' || contract.status === 'signed'
                    ? '✓ Đã Ký 2 Bên (Hiệu Lực)'
                    : 'Chờ Ký Điện Tử'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Số HĐ: <span className="text-slate-200 font-mono font-medium">{contract.contractNumber}</span> | Nhân viên:{' '}
                <span className="text-amber-300 font-medium">{contract.employeeName}</span> ({contract.employeeRole})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!contract.signatures.employeeSigned && (
              <button
                onClick={() => setShowSignPad(true)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
              >
                <PenTool className="w-3.5 h-3.5" />
                Ký Tên Điện Tử Ngay
              </button>
            )}

            <button
              onClick={handleSendEmailZalo}
              title="Gửi Email / Zalo nhân viên"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Gửi Nhân Viên</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Printer className="w-3.5 h-3.5" />
              In Hợp Đồng (A4)
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className="print:hidden bg-emerald-50 text-emerald-800 border-b border-emerald-200 px-4 py-2 text-xs font-medium flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {notification}
            </span>
            <button onClick={() => setNotification(null)} className="text-emerald-600 font-bold hover:underline">
              Đóng
            </button>
          </div>
        )}

        {/* Legal A4 Printable Content */}
        <div className="p-6 sm:p-10 max-h-[calc(88vh-80px)] overflow-y-auto print:max-h-none print:p-0 print:overflow-visible text-slate-800 font-serif leading-relaxed text-xs sm:text-[13px]">
          <div className="border border-slate-300 rounded-xl p-6 sm:p-10 bg-white shadow-sm print:border-0 print:p-2 print:shadow-none space-y-4">
            {/* Header / National Title with Company Logo */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div className="hidden sm:block shrink-0">
                <GiaPhucLogo size="xs" isPrint={true} />
              </div>
              <div className="text-center flex-1">
                <h4 className="font-sans font-bold uppercase tracking-wider text-xs sm:text-sm text-slate-900">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </h4>
                <p className="font-sans font-semibold text-xs sm:text-sm text-slate-800">
                  Độc lập - Tự do - Hạnh phúc
                </p>
                <div className="w-32 h-0.5 bg-slate-800 mx-auto my-1.5"></div>
                <p className="text-[11px] italic font-sans text-slate-500 mt-2">
                  TP. Hồ Chí Minh, {formatDate(contract.signDate)}
                </p>
              </div>
              <div className="hidden sm:block w-24"></div>
            </div>

            {/* Document Title */}
            <div className="text-center py-2 border-b border-slate-200">
              <h1 className="font-sans text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                HỢP ĐỒNG LAO ĐỘNG
              </h1>
              <p className="text-xs font-sans text-slate-600 font-medium mt-0.5">
                (Số: <span className="font-mono font-bold text-slate-900">{contract.contractNumber}</span>)
              </p>
              <p className="text-[11px] font-sans text-slate-500 italic mt-0.5">
                (Căn cứ Bộ luật Lao động số 45/2019/QH14 và các văn bản hướng dẫn thi hành hiện hành)
              </p>
            </div>

            {/* Preamble */}
            <p className="italic text-[12px]">
              Hôm nay, ngày {new Date(contract.signDate).getDate()} tháng {new Date(contract.signDate).getMonth() + 1} năm{' '}
              {new Date(contract.signDate).getFullYear()}, tại Văn phòng {contract.employer.companyName}, chúng tôi gồm có:
            </p>

            {/* Party A (Employer) */}
            <div className="space-y-1">
              <p className="font-bold uppercase text-slate-900">
                BÊN A: NGƯỜI SỬ DỤNG LAO ĐỘNG (EMPLOYER)
              </p>
              <div className="pl-4 space-y-0.5 text-slate-700">
                <p>
                  - Tên đơn vị: <span className="font-bold text-slate-900">{contract.employer.companyName}</span>
                </p>
                <p>
                  - Đại diện bởi: <span className="font-bold text-slate-900">{contract.employer.representative}</span>{' '}
                  - Chức vụ: {contract.employer.position}
                </p>
                <p>- Quốc tịch: {contract.employer.nationality}</p>
                <p>- Địa chỉ trụ sở: {contract.employer.address}</p>
                <p>
                  - Mã số thuế: <span className="font-mono font-semibold">{contract.employer.taxCode}</span> | Điện thoại:{' '}
                  {contract.employer.phone}
                </p>
              </div>
            </div>

            {/* Party B (Employee) */}
            <div className="space-y-1 pt-1">
              <p className="font-bold uppercase text-slate-900">
                BÊN B: NGƯỜI LAO ĐỘNG (EMPLOYEE)
              </p>
              <div className="pl-4 space-y-0.5 text-slate-700">
                <p>
                  - Họ và tên: <span className="font-bold text-slate-900 uppercase">{contract.employeeInfo.name}</span>{' '}
                  - Giới tính: {contract.employeeInfo.gender}
                </p>
                <p>
                  - Sinh ngày:{' '}
                  {new Date(contract.employeeInfo.dob).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </p>
                <p>
                  - Số CCCD/Hộ chiếu:{' '}
                  <span className="font-mono font-bold text-slate-900">{contract.employeeInfo.idCardNumber}</span> |
                  Ngày cấp: {contract.employeeInfo.idCardDate} | Nơi cấp: {contract.employeeInfo.idCardPlace}
                </p>
                <p>- Địa chỉ thường trú: {contract.employeeInfo.registeredAddress}</p>
                <p>- Chỗ ở hiện nay: {contract.employeeInfo.currentAddress}</p>
                <p>
                  - Điện thoại: {contract.employeeInfo.phone} | Email: {contract.employeeInfo.email}
                </p>
              </div>
            </div>

            {/* Contract Clauses */}
            <p className="italic text-[12px] pt-1">
              Hai bên cùng thỏa thuận ký kết Hợp đồng lao động với các điều khoản và điều kiện sau đây:
            </p>

            {/* Article 1 */}
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900">
                Điều 1: Thời hạn hợp đồng, vị trí chuyên môn và địa điểm làm việc
              </h4>
              <div className="pl-4 space-y-1 text-slate-700">
                <p>
                  1.1. Loại hợp đồng lao động:{' '}
                  <span className="font-bold text-slate-900">{contract.contractType}</span>.
                </p>
                <p>
                  1.2. Thời hạn hiệu lực: Từ ngày{' '}
                  <span className="font-semibold">{formatDate(contract.startDate)}</span>{' '}
                  {contract.endDate ? (
                    <>
                      đến hết ngày <span className="font-semibold">{formatDate(contract.endDate)}</span>.
                    </>
                  ) : (
                    'cho đến khi hai bên có thỏa thuận chấm dứt theo quy định pháp luật.'
                  )}
                </p>
                <p>
                  1.3. Phòng ban / Bộ phận:{' '}
                  <span className="font-semibold text-slate-900">{contract.employeeInfo.department}</span>.
                </p>
                <p>
                  1.4. Chức danh công việc / Vị trí:{' '}
                  <span className="font-semibold text-slate-900">{contract.employeeInfo.position}</span>.
                </p>
                <p>
                  1.5. Mô tả nhiệm vụ chính: {contract.terms.jobDescription}
                </p>
                <p>
                  1.6. Địa điểm làm việc: {contract.terms.workLocation}
                </p>
              </div>
            </div>

            {/* Article 2 */}
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900">Điều 2: Chế độ làm việc và thời giờ nghỉ ngơi</h4>
              <div className="pl-4 space-y-1 text-slate-700">
                <p>2.1. Thời giờ làm việc: {contract.terms.workingHours}.</p>
                <p>2.2. Chế độ nghỉ ngơi: {contract.terms.restSchedule}.</p>
                <p>
                  2.3. Nghỉ phép năm: Được hưởng <span className="font-bold">{contract.terms.annualLeaveDays} ngày</span>{' '}
                  phép năm có hưởng nguyên lương theo quy định pháp luật.
                </p>
              </div>
            </div>

            {/* Article 3 */}
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900">
                Điều 3: Tiền lương, phụ cấp, thưởng và quyền lợi của người lao động
              </h4>
              <div className="pl-4 space-y-1 text-slate-700">
                <p>
                  3.1. Mức lương cơ bản (đóng BHXH):{' '}
                  <span className="font-mono font-bold text-slate-900">
                    {formatCurrency(contract.terms.baseSalary)}
                  </span>
                  /tháng (Bằng chữ: {numberToVietnameseWords(contract.terms.baseSalary)}).
                </p>
                <p>
                  3.2. Các khoản phụ cấp hàng tháng:
                </p>
                <div className="pl-4 grid grid-cols-2 gap-1 text-[12px] bg-slate-50 p-2 rounded border border-slate-200">
                  <p>• Phụ cấp chức vụ / trách nhiệm: {formatCurrency(contract.terms.allowances.position)}</p>
                  <p>• Phụ cấp cơm trưa: {formatCurrency(contract.terms.allowances.lunch)}</p>
                  <p>• Phụ cấp xăng xe / đi lại: {formatCurrency(contract.terms.allowances.fuel)}</p>
                  <p>• Phụ cấp điện thoại & khác: {formatCurrency(contract.terms.allowances.phone + contract.terms.allowances.other)}</p>
                </div>
                <p>
                  3.3. Tổng thu nhập đảm bảo:{' '}
                  <span className="font-mono font-bold text-blue-900">{formatCurrency(totalGuaranteedIncome)}</span>/tháng.
                </p>
                {contract.terms.commissionRate ? (
                  <p>
                    3.4. Hoa hồng doanh số bán hàng: Hưởng mức{' '}
                    <span className="font-bold text-emerald-700">{contract.terms.commissionRate}%</span> trên tổng doanh số POS thực thu.
                  </p>
                ) : null}
                {contract.terms.kpiBonusDesc && (
                  <p>3.5. Chế độ thưởng KPI: {contract.terms.kpiBonusDesc}.</p>
                )}
                <p>
                  3.6. Kỳ hạn trả lương: Tiền lương được thanh toán vào ngày{' '}
                  <span className="font-bold">{contract.terms.salaryPaymentDay}</span> hàng tháng thông qua tài khoản ngân hàng.
                </p>
                <p>
                  3.7. Chế độ Bảo hiểm: Bên A thực hiện trích nộp BHXH, BHYT, BHTN theo đúng tỷ lệ luật định trên mức lương đóng bảo hiểm.
                </p>
                <p>
                  3.8. Trang bị phương tiện làm việc: {contract.terms.uniformAndEquipment}.
                </p>
              </div>
            </div>

            {/* Article 4 & 5 */}
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900">
                Điều 4: Nghĩa vụ bảo mật thông tin và quyền sở hữu trí tuệ
              </h4>
              <div className="pl-4 space-y-1 text-slate-700">
                <p>
                  4.1. Bên B có nghĩa vụ bảo mật tuyệt đối toàn bộ bí mật kinh doanh, danh sách khách hàng, công nghệ phần mềm và dữ liệu tài chính của Bên A.
                </p>
                <p>
                  4.2. Mọi sáng kiến, quy trình, tài liệu được tạo ra trong quá trình làm việc thuộc toàn quyền sở hữu của Công ty CP GP-ERP Việt Nam.
                </p>
              </div>
            </div>

            {/* Article 6 */}
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900">Điều 5: Điều khoản thi hành & Giá trị pháp lý chữ ký điện tử</h4>
              <div className="pl-4 space-y-1 text-slate-700">
                <p>
                  5.1. Hợp đồng lao động điện tử này được khởi tạo trên nền tảng quản trị GP-ERP, tuân thủ Luật Giao dịch điện tử số 20/2023/QH15 và Bộ luật Lao động 2019.
                </p>
                <p>
                  5.2. Chữ ký điện tử, chữ ký số CA hoặc chữ ký cảm ứng xác thực của hai bên có giá trị pháp lý tương đương chữ ký tay và con dấu vật lý.
                </p>
                <p>
                  5.3. Mã băm chứng thực toàn vẹn (Audit Hash):{' '}
                  <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                    {contract.signatures.auditHash}
                  </span>
                </p>
              </div>
            </div>

            {/* Signatures Section */}
            <div className="mt-8 pt-6 border-t-2 border-slate-300 grid grid-cols-2 gap-8 text-center font-sans text-xs">
              {/* Employee Signature */}
              <div className="space-y-2">
                <p className="font-bold text-slate-900 uppercase">NGƯỜI LAO ĐỘNG (BÊN B)</p>
                <p className="text-[11px] text-slate-500 italic">(Ký, ghi rõ họ tên hoặc ký điện tử)</p>
                <div className="h-28 flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-lg p-2 bg-slate-50/50">
                  {contract.signatures.employeeSigned ? (
                    <div className="flex flex-col items-center">
                      {contract.signatures.employeeSignatureDataUrl ? (
                        <img
                          src={contract.signatures.employeeSignatureDataUrl}
                          alt="Chữ ký người lao động"
                          className="h-16 object-contain"
                        />
                      ) : (
                        <div className="text-blue-900 font-serif italic text-base font-bold">
                          {contract.employeeInfo.name}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium mt-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Đã ký điện tử ({contract.signatures.employeeSignedAt})</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className="text-amber-600 font-semibold block text-[11px]">Chưa ký điện tử</span>
                      <button
                        onClick={() => setShowSignPad(true)}
                        className="print:hidden px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold shadow"
                      >
                        Ký tại đây
                      </button>
                    </div>
                  )}
                </div>
                <p className="font-bold text-slate-900 uppercase text-xs">{contract.employeeInfo.name}</p>
              </div>

              {/* Employer Digital Signature */}
              <div className="space-y-2">
                <p className="font-bold text-slate-900 uppercase">NGƯỜI SỬ DỤNG LAO ĐỘNG (BÊN A)</p>
                <p className="text-[11px] text-slate-500 italic">(Ký số điện tử & đóng dấu số CA)</p>
                <div className="h-28 flex items-center justify-center border border-dashed border-slate-300 rounded-lg p-2 bg-slate-50/50">
                  {contract.signatures.employerSigned ? (
                    <div className="border-2 border-rose-600 bg-rose-50/70 p-2.5 rounded-lg text-left shadow-sm max-w-[260px]">
                      <div className="flex items-center gap-1 text-rose-800 font-bold text-[10px]">
                        <Award className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>CHỨNG THƯ SỐ DOANH NGHIỆP</span>
                      </div>
                      <p className="text-[10px] text-rose-950 font-bold mt-0.5 uppercase truncate">
                        {contract.employer.companyName}
                      </p>
                      <p className="text-[9px] text-slate-600">
                        Ký bởi: <span className="font-semibold">{contract.signatures.employerSignerName}</span>
                      </p>
                      <p className="text-[9px] text-slate-500">
                        Thời gian: <span className="font-mono">{contract.signatures.employerSignedAt}</span>
                      </p>
                    </div>
                  ) : (
                    <span className="text-slate-400">Chờ đại diện công ty ký</span>
                  )}
                </div>
                <p className="font-bold text-slate-900 uppercase text-xs">{contract.employer.representative}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="print:hidden px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-medium">Hợp đồng điện tử hợp pháp theo Bộ Luật Lao Động 2019</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded-lg border border-slate-300 transition"
            >
              Đóng lại
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" />
              In Hợp Đồng Ngay
            </button>
          </div>
        </div>
      </div>

      {/* Signature Canvas Pad Modal */}
      {showSignPad && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-bold">Ký Tên Điện Tử (Người Lao Động)</h4>
              </div>
              <button onClick={() => setShowSignPad(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-600">
                Vui lòng dùng chuột, bút cảm ứng hoặc ngón tay để ký tên vào khung bên dưới:
              </p>

              <div className="border-2 border-indigo-200 rounded-xl bg-slate-50 overflow-hidden relative shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={180}
                  className="w-full h-44 cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs italic">
                    Ký tên tại đây...
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  onClick={clearCanvas}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg flex items-center gap-1 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Xóa vẽ lại
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSignPad(false)}
                    className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleConfirmSignature}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow flex items-center gap-1 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Xác Nhận Ký
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
