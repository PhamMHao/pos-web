import React, { useState } from "react";
import {
  Truck,
  Plus,
  Package,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ShoppingBag,
} from "lucide-react";
import {
  EnterpriseProject,
  ProjectStockReservation,
  Persona,
} from "../../types/projects.types";
import { projectsApi } from "../../../../features/projects/api/projectsApi";

interface ProjectProcurementTabProps {
  project: EnterpriseProject;
  currentPersona: Persona;
  onRefresh: () => void;
  showNotify: (msg: string, type?: "success" | "error") => void;
}

export const ProjectProcurementTab: React.FC<ProjectProcurementTabProps> = ({
  project,
  currentPersona,
  onRefresh,
  showNotify,
}) => {
  const [showPoModal, setShowPoModal] = useState(false);
  const [supplierName, setSupplierName] = useState("Công Ty Cổ Phần Phân Phối Synnex FPT");
  const [supplierTaxCode, setSupplierTaxCode] = useState("0101778899");
  const [deliveryDate, setDeliveryDate] = useState(
    new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10)
  );

  // Items to order in PO
  const [poItems, setPoItems] = useState([
    {
      productId: "prod-gp-ssd-500",
      productName: "Ổ Cứng SSD Kingston NV2 500GB PCIe 4.0 NVMe",
      sku: "SSD-KINGSTON-500G",
      unit: "Cái",
      quantity: 10,
      costPrice: 850000,
    },
    {
      productId: "prod-gp-ram-16g",
      productName: "RAM Kingston Fury Beast 16GB DDR5 5600MHz",
      sku: "RAM-KINGSTON-16G",
      unit: "Thanh",
      quantity: 20,
      costPrice: 1250000,
    },
  ]);

  const stockReservations = project.stockReservations || [];

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await projectsApi.createPoFromDemands(project.id, {
        supplierName,
        supplierTaxCode,
        expectedDeliveryDate: deliveryDate,
        items: poItems,
      });
      showNotify(`Đã tạo Đơn đặt hàng mua ${result.code} gắn mã dự án thành công!`);
      setShowPoModal(false);
      onRefresh();
    } catch (err: any) {
      showNotify(err.message || "Lỗi tạo đơn đặt hàng mua", "error");
    }
  };

  const formatVnd = (val: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val || 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & PO Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <span>Chuỗi Cung Ứng & Mua Sắm Vật Tư Dự Án (Project Procurement)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
              Giữ Kho Đích Danh
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Theo dõi định mức BOM, hàng dự phòng trong kho và tạo Đơn đặt hàng mua (PO) chỉ định riêng cho dự án này
          </p>
        </div>

        {currentPersona.level >= 2 && (
          <button
            onClick={() => setShowPoModal(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-2 shadow-xs cursor-pointer transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>1-Click Tạo Đơn Hàng Mua (PO)</span>
          </button>
        )}
      </div>

      {/* Reserved Stock List */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h4 className="font-bold text-sm text-slate-900 mb-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>Danh Sách Vật Tư Đã Khóa Tồn Kho Cho Dự Án (Project Stock Reservation)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
              {stockReservations.length} mặt hàng
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-normal">
            Tránh tình trạng bị bán lẻ xuất nhầm cho đơn hàng khác
          </span>
        </h4>

        {stockReservations.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Chưa có vật tư nào được giữ chỗ đích danh. Bấm "1-Click Tạo Đơn Hàng Mua (PO)" để đặt hàng giữ kho.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {stockReservations.map((res) => (
              <div
                key={res.id}
                className="py-3 flex items-center justify-between text-xs hover:bg-slate-50/60 px-2 rounded-xl transition-colors"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                      {res.sku}
                    </span>
                    <span className="font-bold text-slate-900">
                      {res.productName}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {res.notes || "Khóa giữ tồn kho phục vụ thi công"}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="font-black text-blue-600 text-sm">
                    {Number(res.reservedQty)} Cái
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Đã giữ chỗ an toàn
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Create PO from Project Demands */}
      {showPoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-black text-base text-slate-900 mb-1">
              Tạo Đơn Đặt Hàng Mua (Purchase Order - PO)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Đơn hàng mua sẽ tự động gắn mã dự án <b>[{project.code}]</b> và khi nhập kho sẽ được giữ chỗ đích danh.
            </p>

            <form onSubmit={handleCreatePO} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nhà cung ứng chỉ định *
                </label>
                <input
                  type="text"
                  required
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã số thuế NCC</label>
                  <input
                    type="text"
                    value={supplierTaxCode}
                    onChange={(e) => setSupplierTaxCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày giao dự kiến</label>
                  <input
                    type="date"
                    required
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                  />
                </div>
              </div>

              {/* Items Preview */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Danh sách mặt hàng đặt mua ({poItems.length} mặt hàng)
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 rounded-xl bg-slate-50 border border-slate-200">
                  {poItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-[11px] bg-white p-2 rounded-lg border border-slate-100"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{item.productName}</div>
                        <div className="text-slate-400">SKU: {item.sku}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-600">
                          {item.quantity} {item.unit} × {formatVnd(item.costPrice)}
                        </div>
                        <div className="font-black text-slate-900">
                          = {formatVnd(item.quantity * item.costPrice)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 text-blue-900 font-bold flex justify-between text-xs">
                <span>Tổng giá trị đơn hàng (đã gồm 10% VAT):</span>
                <span>
                  {formatVnd(
                    poItems.reduce((sum, it) => sum + it.quantity * it.costPrice, 0) * 1.1
                  )}
                </span>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPoModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-xs"
                >
                  Xác Nhận Đặt Hàng PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
