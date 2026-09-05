import React, { useState } from "react";
import { X, Check, RefreshCw } from "lucide-react";
import { ProjectMaterialTicket } from "../types/projects.types";
import { projectsApi } from "../../../features/projects/api/projectsApi";

export interface MaterialReturnModalProps {
  ticket: ProjectMaterialTicket;
  onClose: () => void;
  onSuccess: () => void;
}

export const MaterialReturnModal: React.FC<MaterialReturnModalProps> = ({
  ticket,
  onClose,
  onSuccess,
}) => {
  const [returneeName, setReturneeName] = useState(ticket.requesterName);
  const [returnItems, setReturnItems] = useState(
    ticket.items.map((it) => ({
      id: it.id,
      productId: it.productId,
      name: it.name,
      unit: it.unit,
      dispatchedQty: Number(it.dispatchedQty),
      returnedQty: 0,
    }))
  );
  const [notes, setNotes] = useState("Nhập hoàn kho vật tư thi công thừa");
  const [isSaving, setIsSaving] = useState(false);

  const handleQtyChange = (idx: number, qty: number) => {
    const updated = [...returnItems];
    updated[idx].returnedQty = Math.max(0, Math.min(qty, updated[idx].dispatchedQty));
    setReturnItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await projectsApi.returnMaterials(ticket.id, {
        returneeName,
        notes,
        items: returnItems,
      });
      onSuccess();
    } catch (err: any) {
      alert(err.message || "Lỗi khi hoàn trả vật tư");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Hoàn Trả Vật Tư Thừa Về Kho</h3>
            <p className="text-[11px] text-amber-700 mt-0.5 font-semibold">Phiếu xuất mượn: {ticket.code}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Người Bàn Giao Vật Tư Trả</label>
            <input
              type="text"
              required
              value={returneeName}
              onChange={(e) => setReturneeName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Số Lượng Vật Tư Thực Tế Trả Lại Kho</label>
            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {returnItems.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-200 last:border-0">
                  <div>
                    <div className="font-bold text-slate-900">{it.name}</div>
                    <div className="text-[10px] text-slate-500">Đã mượn: {it.dispatchedQty} {it.unit}</div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-slate-600">Số lượng trả:</span>
                    <input
                      type="number"
                      min="0"
                      max={it.dispatchedQty}
                      value={it.returnedQty}
                      onChange={(e) => handleQtyChange(idx, Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded-lg bg-white border border-slate-300 text-slate-900 text-center font-bold"
                    />
                    <span className="text-slate-500">{it.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Ghi Chú Kiểm Nhận Của Thủ Kho</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:outline-none"
            />
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
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center space-x-2 cursor-pointer shadow-sm"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Xác Nhận Nhập Kho Lại</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
