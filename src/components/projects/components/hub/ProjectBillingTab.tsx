import React, { useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Printer,
  FileCheck,
  Plus,
  ShieldCheck,
  Building,
  AlertCircle,
} from "lucide-react";
import {
  EnterpriseProject,
  ProjectBillingMilestone,
  ProjectHandoverCertificate,
  Persona,
} from "../../types/projects.types";
import { projectsApi } from "../../../../features/projects/api/projectsApi";

interface ProjectBillingTabProps {
  project: EnterpriseProject;
  currentPersona: Persona;
  onRefresh: () => void;
  showNotify: (msg: string, type?: "success" | "error") => void;
}

export const ProjectBillingTab: React.FC<ProjectBillingTabProps> = ({
  project,
  currentPersona,
  onRefresh,
  showNotify,
}) => {
  const [selectedCert, setSelectedCert] = useState<ProjectHandoverCertificate | null>(null);

  const billingMilestones = project.billingMilestones || [];
  const handoverCertificates = project.handoverCertificates || [];

  const totalPlanned = billingMilestones.reduce(
    (sum, m) => sum + Number(m.plannedAmount || 0),
    0
  );
  const totalPaid = billingMilestones.reduce(
    (sum, m) => sum + Number(m.paidAmount || 0),
    0
  );
  const totalInvoiced = billingMilestones.reduce(
    (sum, m) => sum + Number(m.actualInvoicedAmount || 0),
    0
  );

  const formatVnd = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val || 0);

  const handleMarkPaid = async (milestone: ProjectBillingMilestone) => {
    try {
      await projectsApi.updateBillingMilestone(project.id, milestone.id, {
        actualInvoicedAmount: milestone.plannedAmount,
        paidAmount: milestone.plannedAmount,
        status: "paid",
      });
      showNotify(`Đã ghi nhận thanh toán thành công cho [${milestone.milestoneName}]!`);
      onRefresh();
    } catch (err: any) {
      showNotify(err.message || "Lỗi cập nhật thanh toán", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold mb-1">
            Tổng Giá Trị Hợp Đồng
          </div>
          <div className="text-xl font-black text-slate-900">
            {formatVnd(totalPlanned || Number(project.budget))}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {billingMilestones.length} đợt thanh toán theo điều khoản
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold mb-1">
            Đã Thu Tiền Thực Tế
          </div>
          <div className="text-xl font-black text-emerald-600">
            {formatVnd(totalPaid)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {totalPlanned > 0
              ? `${Math.round((totalPaid / totalPlanned) * 100)}% tổng hợp đồng`
              : "0%"}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold mb-1">
            Tiền Giữ Lại Bảo Hành (Retention 5%)
          </div>
          <div className="text-xl font-black text-indigo-600">
            {formatVnd(
              billingMilestones
                .filter((m) => m.isRetention)
                .reduce((sum, m) => sum + Number(m.plannedAmount || 0), 0)
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Giải tỏa sau 12 tháng bàn giao
          </p>
        </div>
      </div>

      {/* Billing Schedule Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-900">
              Kế Hoạch & Tiến Độ Thu Tiền Theo Mốc Hợp Đồng (Billing Milestones)
            </h4>
            <p className="text-xs text-slate-500">
              Tạm ứng ➔ Nghiệm thu giai đoạn ➔ Bàn giao tổng thể ➔ Giữ lại bảo hành
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Mã Đợt</th>
                <th className="py-3 px-4">Điều Khoản Thanh Toán</th>
                <th className="py-3 px-4 text-center">Tỷ Lệ %</th>
                <th className="py-3 px-4 text-right">Số Tiền Kế Hoạch</th>
                <th className="py-3 px-4 text-right">Đã Thu</th>
                <th className="py-3 px-4 text-center">Hạn Chót</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                {currentPersona.level >= 3 && (
                  <th className="py-3 px-4 text-center">Thao Tác</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {billingMilestones.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-blue-600">
                    {m.milestoneCode}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    <div>{m.milestoneName}</div>
                    {m.notes && (
                      <div className="text-[11px] text-slate-400 font-normal">
                        {m.notes}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center font-bold">
                    {m.percentage}%
                  </td>
                  <td className="py-3 px-4 text-right font-semibold">
                    {formatVnd(Number(m.plannedAmount))}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-emerald-600">
                    {formatVnd(Number(m.paidAmount))}
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500">
                    {m.dueDate ? new Date(m.dueDate).toLocaleDateString("vi-VN") : "--"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {m.status === "paid" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ✅ Đã thanh toán
                      </span>
                    ) : m.status === "invoiced" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        📄 Đã xuất HĐĐT
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        ⏳ Chờ đến hạn
                      </span>
                    )}
                  </td>
                  {currentPersona.level >= 3 && (
                    <td className="py-3 px-4 text-center">
                      {m.status !== "paid" && (
                        <button
                          onClick={() => handleMarkPaid(m)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          Xác nhận đã thu
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Handover Certificates (Biên bản nghiệm thu A-B) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h4 className="font-bold text-sm text-slate-900 mb-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>Biên Bản Nghiệm Thu Khối Lượng Hoàn Thành Bàn Giao (Biên Bản A-B)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
              {handoverCertificates.length} biên bản
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-normal">
            Giá trị pháp lý ký giữa Khách hàng (Bên A) và Nhà thầu GP-ERP (Bên B)
          </span>
        </h4>

        {handoverCertificates.length === 0 ? (
          <p className="text-xs text-slate-400">
            Chưa có biên bản nghiệm thu A-B nào được lập.
          </p>
        ) : (
          <div className="space-y-3">
            {handoverCertificates.map((cert) => (
              <div
                key={cert.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                      {cert.certificateCode}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      {cert.title}
                    </span>
                  </div>
                  <div className="text-slate-600 mt-1">
                    {cert.content}
                  </div>
                  <div className="flex items-center space-x-4 text-[11px] text-slate-400 mt-2">
                    <span>Bên A: <b>{cert.partyARepresentative}</b></span>
                    <span>•</span>
                    <span>Bên B: <b>{cert.partyBRepresentative}</b></span>
                    <span>•</span>
                    <span>Giá trị nghiệm thu: <b>{formatVnd(Number(cert.acceptedValue))}</b></span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedCert(cert)}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-600" />
                    <span>Xem & In Khổ A4</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Printable Modal (Biên bản A-B Khổ A4 Chuyên Nghiệp) */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-slate-300 text-slate-900">
            {/* National Header */}
            <div className="text-center border-b pb-4 mb-6">
              <div className="font-black text-xs uppercase tracking-widest text-slate-700">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </div>
              <div className="text-[11px] font-bold text-slate-600">
                Độc lập - Tự do - Hạnh phúc
              </div>
              <div className="text-slate-400 text-xs">---o0o---</div>
              <h2 className="text-base font-black uppercase text-slate-900 mt-3">
                {selectedCert.title}
              </h2>
              <div className="text-xs text-slate-500 italic mt-0.5">
                Số: {selectedCert.certificateCode} • Ngày: {new Date(selectedCert.handoverDate).toLocaleDateString("vi-VN")}
              </div>
            </div>

            {/* Parties */}
            <div className="space-y-3 text-xs mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <b>ĐẠI DIỆN CHỦ ĐẦU TƯ (BÊN A):</b>
                <div>Ông/Bà: <b>{selectedCert.partyARepresentative}</b> - Chức vụ: {selectedCert.partyAPosition || "Đại diện"}</div>
                <div>Đơn vị: {project.customerName}</div>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <b>ĐẠI DIỆN ĐƠN VỊ THI CÔNG (BÊN B):</b>
                <div>Ông/Bà: <b>{selectedCert.partyBRepresentative}</b> - Chức vụ: {selectedCert.partyBPosition || "Chỉ Huy Trưởng"}</div>
                <div>Đơn vị: GIA PHÚC Computer - Hệ Thống GP-ERP Enterprise</div>
              </div>
            </div>

            {/* Content & Value */}
            <div className="space-y-2 text-xs mb-6">
              <p><b>Nội dung đánh giá & nghiệm thu:</b> {selectedCert.content}</p>
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex justify-between font-bold">
                <span>Tổng giá trị nghiệm thu đạt chuẩn:</span>
                <span className="text-blue-700 font-black text-sm">{formatVnd(Number(selectedCert.acceptedValue))}</span>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 text-center text-xs pt-4 mb-6">
              <div>
                <div className="font-bold text-slate-700 uppercase">ĐẠI DIỆN BÊN A</div>
                <div className="text-[10px] text-slate-400 italic mb-12">(Ký, ghi rõ họ tên và đóng dấu)</div>
                <div className="font-black text-slate-900">{selectedCert.signatureA || selectedCert.partyARepresentative}</div>
              </div>
              <div>
                <div className="font-bold text-slate-700 uppercase">ĐẠI DIỆN BÊN B</div>
                <div className="text-[10px] text-slate-400 italic mb-12">(Ký, ghi rõ họ tên và đóng dấu)</div>
                <div className="font-black text-indigo-700">{selectedCert.signatureB || selectedCert.partyBRepresentative}</div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-200">
              <button
                onClick={() => setSelectedCert(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>In Biên Bản A4</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
