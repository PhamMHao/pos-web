import React, { useState, useEffect } from "react";
import { X, ShieldCheck, Save, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { ReturnPolicyConfig } from "../../types";
import { exchangesApi } from "../../features/exchanges/api/exchangesApi";
import { formatVND, parseCurrencyInput } from "../../utils/currency";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (policy: ReturnPolicyConfig) => void;
}

export const ReturnExchangePolicyModal: React.FC<Props> = ({ isOpen, onClose, onSaved }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [policy, setPolicy] = useState<ReturnPolicyConfig>({
    id: "default_policy",
    returnPeriodDays: 15,
    exchangePeriodDays: 30,
    approvalThresholdAmount: 10000000,
    restockingFeeDamagedBox: 10,
    restockingFeeUsed: 20,
    allowNoReceiptReturn: false,
  });
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPolicy();
    }
  }, [isOpen]);

  const loadPolicy = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await exchangesApi.getReturnPolicy();
      if (data) setPolicy(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Không thể tải cấu hình chính sách");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg(null);
      const updated = await exchangesApi.updateReturnPolicy(policy);
      setPolicy(updated);
      setSuccessMsg("Cập nhật chính sách đổi trả thành công!");
      if (onSaved) onSaved(updated);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "Không thể lưu chính sách");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Chính Sách & Quy Định Đổi Trả Doanh Nghiệp</h3>
              <p className="text-xs text-slate-400">Cấu hình thời hạn, phí khấu trừ và hạn mức phê duyệt tự động</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-7 h-7 animate-spin text-blue-400" />
              <p className="text-sm">Đang tải cấu hình chính sách từ hệ thống...</p>
            </div>
          ) : (
            <>
              {/* Thời hạn đổi trả */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-sm font-semibold text-slate-200">
                    Thời Hạn Cho Phép Trả Hàng (Ngày)
                  </label>
                  <p className="text-xs text-slate-400">
                    Khách hàng được quyền trả hàng hoàn tiền kể từ ngày mua hóa đơn gốc.
                  </p>
                  <div className="relative mt-1">
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={policy.returnPeriodDays}
                      onChange={(e) =>
                        setPolicy({ ...policy, returnPeriodDays: Number(e.target.value) || 1 })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-semibold focus:outline-none focus:border-blue-500"
                      required
                    />
                    <span className="absolute right-4 top-2.5 text-xs text-slate-400">Ngày</span>
                  </div>
                </div>

                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-sm font-semibold text-slate-200">
                    Thời Hạn Cho Phép Đổi Hàng (Ngày)
                  </label>
                  <p className="text-xs text-slate-400">
                    Khách hàng được quyền đổi sản phẩm khác hoặc nâng cấp model.
                  </p>
                  <div className="relative mt-1">
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={policy.exchangePeriodDays}
                      onChange={(e) =>
                        setPolicy({ ...policy, exchangePeriodDays: Number(e.target.value) || 1 })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-semibold focus:outline-none focus:border-blue-500"
                      required
                    />
                    <span className="absolute right-4 top-2.5 text-xs text-slate-400">Ngày</span>
                  </div>
                </div>
              </div>

              {/* Hạn mức duyệt */}
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-2">
                <label className="text-sm font-semibold text-slate-200">
                  Hạn Mức Giá Trị Phiếu Cần Quản Lý Duyệt (VND)
                </label>
                <p className="text-xs text-slate-400">
                  Các phiếu đổi / trả có tổng giá trị hoàn tiền vượt mức này sẽ yêu cầu duyệt trước khi ghi sổ kho và quỹ.
                </p>
                <div className="relative mt-1">
                  <input
                    type="text"
                    value={formatVND(policy.approvalThresholdAmount).replace(" ₫", "")}
                    onChange={(e) =>
                      setPolicy({
                        ...policy,
                        approvalThresholdAmount: parseCurrencyInput(e.target.value),
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-amber-400 font-bold text-base focus:outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-4 top-2.5 text-xs text-slate-400">VNĐ</span>
                </div>
              </div>

              {/* Tỷ lệ phí khấu trừ hoàn hàng */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-sm font-semibold text-slate-200">
                    Phí Khấu Trừ Hộp Móp / Rách (%)
                  </label>
                  <p className="text-xs text-slate-400">
                    Áp dụng khi sản phẩm trả lại bị móp méo hoặc rách bao bì gốc.
                  </p>
                  <div className="relative mt-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={policy.restockingFeeDamagedBox}
                      onChange={(e) =>
                        setPolicy({ ...policy, restockingFeeDamagedBox: Number(e.target.value) || 0 })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-semibold focus:outline-none focus:border-blue-500"
                    />
                    <span className="absolute right-4 top-2.5 text-xs text-slate-400">%</span>
                  </div>
                </div>

                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-sm font-semibold text-slate-200">
                    Phí Khấu Trừ Đã Qua Sử Dụng (%)
                  </label>
                  <p className="text-xs text-slate-400">
                    Áp dụng khi sản phẩm có vết trầy xước nhẹ hoặc thiếu phụ kiện kèm theo.
                  </p>
                  <div className="relative mt-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={policy.restockingFeeUsed}
                      onChange={(e) =>
                        setPolicy({ ...policy, restockingFeeUsed: Number(e.target.value) || 0 })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-semibold focus:outline-none focus:border-blue-500"
                    />
                    <span className="absolute right-4 top-2.5 text-xs text-slate-400">%</span>
                  </div>
                </div>
              </div>

              {/* Tùy chọn nâng cao */}
              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-200">
                    Cho Phép Đổi Trả Không Kèm Hóa Đơn Gốc
                  </div>
                  <div className="text-xs text-slate-400">
                    Cho phép nhân viên thu ngân tiếp nhận đổi trả thủ công khi khách làm mất phiếu mua hàng.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policy.allowNoReceiptReturn}
                    onChange={(e) =>
                      setPolicy({ ...policy, allowNoReceiptReturn: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors text-sm"
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={saving || loading}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 flex items-center gap-2 text-sm transition-all disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Lưu Cấu Hình Chính Sách</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
