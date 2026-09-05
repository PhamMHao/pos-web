import React, { useState } from "react";
import { X, ShoppingBag, RefreshCw } from "lucide-react";
import { ProjectMaterialTicket } from "../types/projects.types";
import { projectsApi } from "../../../features/projects/api/projectsApi";

export interface MaterialToOrderModalProps {
  ticket: ProjectMaterialTicket;
  onClose: () => void;
  onSuccess: (orderCode: string) => void;
}

export const MaterialToOrderModal: React.FC<MaterialToOrderModalProps> = ({
  ticket,
  onClose,
  onSuccess,
}) => {
  const [customerName, setCustomerName] = useState(ticket.project?.customerName || "Khách Hàng Dự Án");
  const [customerPhone, setCustomerPhone] = useState("0909123456");
  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [paymentStatus, setPaymentStatus] = useState("paid");
  const [isSaving, setIsSaving] = useState(false);

  // Installed items
  const installedItems = ticket.items.map((it) => {
    const qty = it.installedQty > 0 ? it.installedQty : it.dispatchedQty - it.returnedQty;
    return {
      ...it,
      calcQty: qty,
      lineTotal: qty * Number(it.salePrice),
    };
  });

  const totalAmount = installedItems.reduce((sum, it) => sum + it.lineTotal, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalAmount <= 0) {
      alert("Không có sản phẩm nào có số lượng lắp đặt hợp lệ!");
      return;
    }

    setIsSaving(true);
    try {
      const res = await projectsApi.convertInstalledMaterialsToOrder(ticket.id, {
        customerName,
        customerPhone,
        paymentMethod,
        paymentStatus,
      });
      onSuccess(res.order.code);
    } catch (err: any) {
      alert(err.message || "Lỗi khi quyết toán bán hàng");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-emerald-50">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">Quyết Toán Bán Hàng POS Từ Vật Tư Công Trình</h3>
              <p className="text-[11px] text-slate-500">Phiếu vật tư: {ticket.code}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
            💡 Tự động tạo Đơn hàng POS thực tế trong cơ sở dữ liệu, ghi nhận doanh thu và kích hoạt Serial bảo hành cho khách hàng.
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Tên Khách Hàng Xuất Hóa Đơn *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Số Điện Thoại Khách</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Hình Thức Thanh Toán</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none"
              >
                <option value="transfer">Chuyển khoản Ngân Hàng (QR)</option>
                <option value="cash">Tiền mặt</option>
                <option value="debt">Ghi nợ công trình</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Trạng Thái Thanh Toán</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none"
              >
                <option value="paid">Đã thanh toán đủ (100%)</option>
                <option value="partial">Tạm ứng / Một phần</option>
                <option value="unpaid">Chưa thanh toán</option>
              </select>
            </div>
          </div>

          {/* Installed items summary */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Danh Sách Thiết Bị Đã Lắp Đặt Bàn Giao</label>
            <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {installedItems.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-200 last:border-0">
                  <div>
                    <div className="font-bold text-slate-900">• {it.name}</div>
                    <div className="text-[10px] text-blue-700 font-semibold">
                      SL tính tiền: {it.calcQty} {it.unit} x {new Intl.NumberFormat("vi-VN").format(Number(it.salePrice))}đ
                    </div>
                  </div>
                  <div className="font-mono font-bold text-emerald-700">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(it.lineTotal)}
                  </div>
                </div>
              ))}

              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm">
                <span className="text-slate-700">Tổng Tiền Quyết Toán Đơn Hàng:</span>
                <span className="text-emerald-700 font-black">
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalAmount)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center space-x-2 shadow-sm cursor-pointer"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShoppingBag className="w-4 h-4" />}
              <span>Tạo Đơn Hàng POS</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
