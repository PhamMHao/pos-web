import React, { useState, useMemo, useEffect } from "react";
import {
  ArrowRightLeft,
  Package,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Printer,
  ShieldCheck,
  Ban,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Eye,
  Info,
} from "lucide-react";
import { ProductExchange, ReturnOrder, Product, Order, ReturnPolicyConfig, StoreSettings } from "../../types";
import { exchangesApi } from "../../features/exchanges/api/exchangesApi";
import { returnsApi } from "../../features/returns/api/returnsApi";
import { formatVND } from "../../utils/currency";
import { CreateStockExchangeModal } from "./CreateStockExchangeModal";
import { CreateStockReturnModal } from "./CreateStockReturnModal";
import { ReturnExchangePrintModal } from "./ReturnExchangePrintModal";
import { ReturnExchangePolicyModal } from "./ReturnExchangePolicyModal";

interface Props {
  products: Product[];
  orders: Order[];
  settings?: StoreSettings | null;
}

export const ReturnsAndExchangesTab: React.FC<Props> = ({ products, orders, settings }) => {
  const [activeSubTab, setActiveSubTab] = useState<"exchanges" | "returns">("exchanges");

  // Data Lists
  const [exchanges, setExchanges] = useState<ProductExchange[]>([]);
  const [returnOrders, setReturnOrders] = useState<ReturnOrder[]>([]);
  const [policy, setPolicy] = useState<ReturnPolicyConfig | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  // Filters
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Modals
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState<boolean>(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState<boolean>(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState<boolean>(false);
  const [printModalData, setPrintModalData] = useState<{
    isOpen: boolean;
    exchange?: ProductExchange | null;
    returnOrder?: ReturnOrder | null;
    initialDocType?: "order" | "voucher" | "both";
  }>({ isOpen: false, initialDocType: "order" });

  // Cancel Modal State
  const [cancelModal, setCancelModal] = useState<{
    isOpen: boolean;
    type: "exchange" | "return";
    id: string;
    code: string;
    reason: string;
    submitting: boolean;
    error: string | null;
  }>({
    isOpen: false,
    type: "exchange",
    id: "",
    code: "",
    reason: "",
    submitting: false,
    error: null,
  });

  // Load Data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [exRes, retRes, polRes] = await Promise.all([
        exchangesApi.getExchanges({ limit: 200 }),
        returnsApi.getReturnOrders({ limit: 200 }),
        exchangesApi.getReturnPolicy().catch(() => undefined),
      ]);

      if (exRes && exRes.items) setExchanges(exRes.items);
      if (retRes && retRes.data) setReturnOrders(retRes.data);
      if (polRes) setPolicy(polRes);
    } catch (err) {
      console.error("Error loading exchanges and returns:", err);
    } finally {
      setLoading(false);
    }
  };

  // KPIs
  const kpis = useMemo(() => {
    const totalTransactions = exchanges.length + returnOrders.length;
    
    // Tổng tiền thu thêm từ đổi hàng
    const totalDiffCollected = exchanges
      .filter((e) => e.status === "completed" && e.differenceAmount > 0)
      .reduce((sum, e) => sum + e.differenceAmount, 0);

    // Tổng tiền hoàn trả cho khách (từ Trả hàng + Đổi hàng có diff < 0)
    const totalDiffRefunded = exchanges
      .filter((e) => e.status === "completed" && e.differenceAmount < 0)
      .reduce((sum, e) => sum + Math.abs(e.differenceAmount), 0);

    const totalReturnRefunded = returnOrders
      .filter((r) => r.status === "completed")
      .reduce((sum, r) => sum + Number(r.refundAmount || 0), 0);

    const grandRefunded = totalDiffRefunded + totalReturnRefunded;

    // Tổng giá trị giảm trừ doanh thu (V_nhap đổi hàng + Giá trị hàng trả)
    const exchangeContraRevenue = exchanges
      .filter((e) => e.status === "completed")
      .reduce((sum, e) => sum + Number(e.inboundTotalAmount || 0), 0);

    const returnContraRevenue = returnOrders
      .filter((r) => r.status === "completed")
      .reduce((sum, r) => sum + Number(r.refundAmount || 0), 0);

    const totalContraRevenue = exchangeContraRevenue + returnContraRevenue;

    return {
      totalTransactions,
      totalDiffCollected,
      grandRefunded,
      totalContraRevenue,
    };
  }, [exchanges, returnOrders]);

  // Filtered Lists
  const filteredExchanges = useMemo(() => {
    return exchanges.filter((e) => {
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (search.trim()) {
        const s = search.toLowerCase();
        const match =
          e.code.toLowerCase().includes(s) ||
          (e.customerName && e.customerName.toLowerCase().includes(s)) ||
          (e.customerPhone && e.customerPhone.includes(s)) ||
          (e.originalOrderCode && e.originalOrderCode.toLowerCase().includes(s)) ||
          (e.accountingCode && e.accountingCode.toLowerCase().includes(s));
        if (!match) return false;
      }
      return true;
    });
  }, [exchanges, statusFilter, search]);

  const filteredReturns = useMemo(() => {
    return returnOrders.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (search.trim()) {
        const s = search.toLowerCase();
        const match =
          r.code.toLowerCase().includes(s) ||
          (r.customerName && r.customerName.toLowerCase().includes(s)) ||
          (r.customerPhone && r.customerPhone.includes(s)) ||
          (r.originalOrderCode && r.originalOrderCode.toLowerCase().includes(s)) ||
          (r.accountingCode && r.accountingCode.toLowerCase().includes(s));
        if (!match) return false;
      }
      return true;
    });
  }, [returnOrders, statusFilter, search]);

  // Handle Cancel Action
  const handleConfirmCancel = async () => {
    if (!cancelModal.reason.trim()) {
      setCancelModal((prev) => ({ ...prev, error: "Vui lòng nhập lý do hủy phiếu" }));
      return;
    }

    try {
      setCancelModal((prev) => ({ ...prev, submitting: true, error: null }));
      if (cancelModal.type === "exchange") {
        await exchangesApi.cancelExchange(cancelModal.id, {
          cancelledBy: "usr-admin-01",
          cancelReason: cancelModal.reason.trim(),
        });
      } else {
        await returnsApi.cancelReturnOrder(cancelModal.id, {
          cancelledBy: "usr-admin-01",
          cancelReason: cancelModal.reason.trim(),
        });
      }
      setCancelModal({
        isOpen: false,
        type: "exchange",
        id: "",
        code: "",
        reason: "",
        submitting: false,
        error: null,
      });
      fetchData();
    } catch (err: any) {
      setCancelModal((prev) => ({
        ...prev,
        submitting: false,
        error: err.response?.data?.message || err.message || "Lỗi khi hủy phiếu",
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Tổng Lượt Đổi & Trả</span>
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{kpis.totalTransactions}</div>
          <div className="mt-1 text-xs text-slate-400">
            {exchanges.length} Đổi Hàng | {returnOrders.length} Trả Hàng
          </div>
        </div>

        <div className="bg-slate-800/60 p-4 rounded-2xl border border-cyan-500/30 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-300">Tiền Thu Bù Chênh Lệch</span>
            <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-cyan-400">{formatVND(kpis.totalDiffCollected)}</div>
          <div className="mt-1 text-xs text-slate-400">Đã nhập quỹ phiếu thu PT-DH</div>
        </div>

        <div className="bg-slate-800/60 p-4 rounded-2xl border border-amber-500/30 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300">Tổng Tiền Hoàn Trả</span>
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-400">{formatVND(kpis.grandRefunded)}</div>
          <div className="mt-1 text-xs text-slate-400">Đã chi hoàn tiền quỹ PC-TH / PC-DH</div>
        </div>

        <div className="bg-slate-800/60 p-4 rounded-2xl border border-rose-500/30 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-300">Giảm Trừ Doanh Thu</span>
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-400">{formatVND(kpis.totalContraRevenue)}</div>
          <div className="mt-1 text-xs text-slate-400">Ghi nợ TK 5212 - Hàng bán trả lại</div>
        </div>
      </div>

      {/* Main Actions & Tabs Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/40 p-3 rounded-2xl border border-slate-700/60">
        {/* Subtab Toggle */}
        <div className="flex items-center bg-slate-900 p-1.5 rounded-xl border border-slate-700/80">
          <button
            type="button"
            onClick={() => setActiveSubTab("exchanges")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all ${
              activeSubTab === "exchanges"
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Đổi Hàng (Exchanges)</span>
            <span className="px-1.5 py-0.5 rounded-full bg-black/30 text-[10px]">{exchanges.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("returns")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all ${
              activeSubTab === "returns"
                ? "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Trả Hàng & Hoàn Tiền (Returns)</span>
            <span className="px-1.5 py-0.5 rounded-full bg-black/30 text-[10px]">{returnOrders.length}</span>
          </button>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsPolicyModalOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Chính Sách Đổi Trả</span>
          </button>

          <button
            type="button"
            onClick={fetchData}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition-colors"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-400" : ""}`} />
          </button>

          {activeSubTab === "exchanges" ? (
            <button
              type="button"
              onClick={() => setIsExchangeModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Lập Phiếu Đổi Hàng Mới</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsReturnModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-500/25 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Lập Phiếu Trả Hàng Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-800/30 p-3 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã phiếu, tên khách, SĐT, đơn hàng gốc, mã quỹ..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="completed">Đã hoàn tất (Completed)</option>
          <option value="draft">Bản nháp (Draft)</option>
          <option value="cancelled">Đã hủy (Cancelled)</option>
        </select>
      </div>

      {/* Tables View */}
      {activeSubTab === "exchanges" ? (
        /* TABLE ĐỔI HÀNG */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-700 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Mã Phiếu / Ngày</th>
                  <th className="py-3 px-4">Hóa Đơn Gốc</th>
                  <th className="py-3 px-4">Khách Hàng</th>
                  <th className="py-3 px-4 text-right text-red-400">Hàng Nhận (V_nhap)</th>
                  <th className="py-3 px-4 text-right text-emerald-400">Hàng Xuất (V_xuat)</th>
                  <th className="py-3 px-4 text-right text-cyan-400">Chênh Lệch (Δ)</th>
                  <th className="py-3 px-4">Chứng Từ Quỹ</th>
                  <th className="py-3 px-4 text-center">Trạng Thái</th>
                  <th className="py-3 px-4 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredExchanges.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500 italic">
                      Không tìm thấy phiếu đổi hàng nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredExchanges.map((ex) => (
                    <tr key={ex.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white font-mono">{ex.code}</div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(ex.createdAt).toLocaleDateString("vi-VN")}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {ex.originalOrderCode ? (
                          <span className="font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                            {ex.originalOrderCode}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">Đổi tự do</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{ex.customerName}</div>
                        <div className="text-[11px] text-slate-400">{ex.customerPhone || "---"}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-red-400">
                        {formatVND(ex.inboundTotalAmount)}
                        <div className="text-[10px] text-slate-500">{ex.inItems.length} món</div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-emerald-400">
                        {formatVND(ex.outboundTotalAmount)}
                        <div className="text-[10px] text-slate-500">{ex.outItems.length} món</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div
                          className={`font-bold ${
                            ex.differenceAmount > 0
                              ? "text-cyan-400"
                              : ex.differenceAmount < 0
                              ? "text-amber-400"
                              : "text-slate-400"
                          }`}
                        >
                          {ex.differenceAmount > 0 && "+"}
                          {formatVND(ex.differenceAmount)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {ex.paymentAction === "collect_difference"
                            ? "Khách bù"
                            : ex.paymentAction === "refund_difference"
                            ? "Hoàn tiền"
                            : "Ngang giá"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {ex.accountingCode ? (
                          <button
                            type="button"
                            onClick={() =>
                              setPrintModalData({
                                isOpen: true,
                                exchange: ex,
                                initialDocType: "voucher",
                              })
                            }
                            className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Bấm để in Phiếu Thu / Chi Quỹ Kế Toán"
                          >
                            <DollarSign className="w-3 h-3 text-amber-400" />
                            <span>{ex.accountingCode}</span>
                          </button>
                        ) : (
                          <span className="text-slate-500 text-xs">---</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {ex.status === "completed" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Hoàn tất
                          </span>
                        ) : ex.status === "cancelled" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
                            <Ban className="w-3 h-3" /> Đã hủy
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Bản nháp
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* In Cả Bộ Chứng Từ / Phiếu Đổi */}
                          <button
                            type="button"
                            onClick={() =>
                              setPrintModalData({
                                isOpen: true,
                                exchange: ex,
                                initialDocType: "summary",
                              })
                            }
                            className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors border border-blue-500/20 cursor-pointer"
                            title="In Phiếu Đổi Hàng Tổng Hợp (A4 / K80)"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* In Phiếu Nhập Kho (PNK) */}
                          <button
                            type="button"
                            onClick={() =>
                              setPrintModalData({
                                isOpen: true,
                                exchange: ex,
                                initialDocType: "inbound",
                              })
                            }
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors border border-emerald-500/20 cursor-pointer"
                            title="In Phiếu Nhập Kho Đổi Hàng (PNK - Mẫu 01-VT)"
                          >
                            <ArrowDownLeft className="w-4 h-4" />
                          </button>

                          {/* In Phiếu Xuất Kho (PXK) */}
                          <button
                            type="button"
                            onClick={() =>
                              setPrintModalData({
                                isOpen: true,
                                exchange: ex,
                                initialDocType: "outbound",
                              })
                            }
                            className="p-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition-colors border border-cyan-500/20 cursor-pointer"
                            title="In Phiếu Xuất Kho Đổi Hàng (PXK - Mẫu 02-VT)"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>

                          {/* In Phiếu Thu / Chi Quỹ */}
                          {ex.accountingCode && (
                            <button
                              type="button"
                              onClick={() =>
                                setPrintModalData({
                                  isOpen: true,
                                  exchange: ex,
                                  initialDocType: "voucher",
                                })
                              }
                              className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-colors border border-amber-500/20 cursor-pointer"
                              title="In Phiếu Thu / Chi Tiền Quỹ (Mẫu 01/02-TT)"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>
                          )}

                          {/* In Biên Bản Đổi Hàng Pháp Lý */}
                          <button
                            type="button"
                            onClick={() =>
                              setPrintModalData({
                                isOpen: true,
                                exchange: ex,
                                initialDocType: "legal_exchange",
                              })
                            }
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors border border-rose-500/20 cursor-pointer"
                            title="In Biên Bản Đổi Hàng & Thay Đổi Hóa Đơn (Pháp Lý)"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>

                          {ex.status === "completed" && (
                            <button
                              type="button"
                              onClick={() =>
                                setCancelModal({
                                  isOpen: true,
                                  type: "exchange",
                                  id: ex.id,
                                  code: ex.code,
                                  reason: "",
                                  submitting: false,
                                  error: null,
                                })
                              }
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/20 cursor-pointer"
                              title="Hủy phiếu đổi hàng & Đảo kho"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* TABLE TRẢ HÀNG */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-700 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Mã Phiếu / Ngày</th>
                  <th className="py-3 px-4">Hóa Đơn Gốc</th>
                  <th className="py-3 px-4">Khách Hàng</th>
                  <th className="py-3 px-4 text-center">Số Lượng Trả</th>
                  <th className="py-3 px-4 text-right text-rose-400">Tổng Tiền Hoàn</th>
                  <th className="py-3 px-4">Hình Thức Hoàn</th>
                  <th className="py-3 px-4">Mã Phiếu Chi</th>
                  <th className="py-3 px-4 text-center">Trạng Thái</th>
                  <th className="py-3 px-4 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredReturns.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500 italic">
                      Không tìm thấy phiếu trả hàng nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredReturns.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white font-mono">{r.code}</div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {r.originalOrderCode ? (
                          <span className="font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                            {r.originalOrderCode}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">Trả tự do</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{r.customerName || "Khách lẻ"}</div>
                        <div className="text-[11px] text-slate-400">{r.customerPhone || "---"}</div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-white">
                        {r.totalReturnQuantity} món
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-rose-400 text-sm">
                        {formatVND(r.refundAmount)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-300">
                          {r.refundMethod === "cash"
                            ? "Tiền mặt (PC)"
                            : r.refundMethod === "transfer"
                            ? "Chuyển khoản"
                            : r.refundMethod === "debt_deduct"
                            ? "Cấn trừ công nợ"
                            : "Không hoàn tiền"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {r.accountingCode ? (
                          <button
                            type="button"
                            onClick={() =>
                              setPrintModalData({
                                isOpen: true,
                                returnOrder: r,
                                initialDocType: "voucher",
                              })
                            }
                            className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Bấm để in Phiếu Chi Hoàn Tiền (Mẫu 02-TT)"
                          >
                            <DollarSign className="w-3 h-3 text-amber-400" />
                            <span>{r.accountingCode}</span>
                          </button>
                        ) : (
                          <span className="text-slate-500 text-xs">---</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {r.status === "completed" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Hoàn tất
                          </span>
                        ) : r.status === "cancelled" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
                            <Ban className="w-3 h-3" /> Đã hủy
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Bản nháp
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* In Phiếu Trả Hàng Tổng Hợp */}
                          <button
                            type="button"
                            onClick={() =>
                              setPrintModalData({
                                isOpen: true,
                                returnOrder: r,
                                initialDocType: "summary",
                              })
                            }
                            className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors border border-blue-500/20 cursor-pointer"
                            title="In Phiếu Trả Hàng Tổng Hợp (A4 / K80)"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* In Phiếu Nhập Kho (PNK) */}
                          <button
                            type="button"
                            onClick={() =>
                              setPrintModalData({
                                isOpen: true,
                                returnOrder: r,
                                initialDocType: "inbound",
                              })
                            }
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors border border-emerald-500/20 cursor-pointer"
                            title="In Phiếu Nhập Kho Trả Hàng (PNK - Mẫu 01-VT)"
                          >
                            <ArrowDownLeft className="w-4 h-4" />
                          </button>

                          {/* In Phiếu Chi Hoàn Tiền */}
                          {r.accountingCode && (
                            <button
                              type="button"
                              onClick={() =>
                                setPrintModalData({
                                  isOpen: true,
                                  returnOrder: r,
                                  initialDocType: "voucher",
                                })
                              }
                              className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-colors border border-amber-500/20 cursor-pointer"
                              title="In Phiếu Chi Tiền Hoàn Trả (Mẫu 02-TT)"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>
                          )}

                          {/* In Biên Bản Trả Hàng Pháp Lý NĐ 123 */}
                          <button
                            type="button"
                            onClick={() =>
                              setPrintModalData({
                                isOpen: true,
                                returnOrder: r,
                                initialDocType: "legal_return",
                              })
                            }
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors border border-rose-500/20 cursor-pointer"
                            title="In Biên Bản Trả Hàng & Thu Hồi Hóa Đơn NĐ 123 (Pháp Lý)"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>

                          {r.status === "completed" && (
                            <button
                              type="button"
                              onClick={() =>
                                setCancelModal({
                                  isOpen: true,
                                  type: "return",
                                  id: r.id,
                                  code: r.code,
                                  reason: "",
                                  submitting: false,
                                  error: null,
                                })
                              }
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/20 cursor-pointer"
                              title="Hủy phiếu trả hàng & Trừ lại kho"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Lập Phiếu Đổi Hàng */}
      <CreateStockExchangeModal
        isOpen={isExchangeModalOpen}
        onClose={() => setIsExchangeModalOpen(false)}
        products={products}
        orders={orders}
        policy={policy}
        settings={settings}
        onSuccess={() => {
          fetchData();
        }}
      />

      {/* Modal: Lập Phiếu Trả Hàng */}
      <CreateStockReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        products={products}
        orders={orders}
        policy={policy}
        settings={settings}
        onSuccess={() => {
          fetchData();
        }}
      />

      {/* Modal: Cấu Hình Chính Sách */}
      <ReturnExchangePolicyModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        onSaved={(p) => setPolicy(p)}
      />

      {/* Modal: In Phiếu K80 / A4 / Phiếu Thu Chi */}
      <ReturnExchangePrintModal
        isOpen={printModalData.isOpen}
        onClose={() => setPrintModalData({ isOpen: false })}
        exchange={printModalData.exchange}
        returnOrder={printModalData.returnOrder}
        initialDocType={printModalData.initialDocType || "summary"}
        settings={settings}
      />

      {/* Modal: Xác Nhận Hủy Phiếu */}
      {cancelModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 bg-red-500/20 rounded-xl border border-red-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Xác Nhận Hủy Phiếu {cancelModal.code}</h3>
                <p className="text-xs text-slate-400">Hệ thống sẽ thực hiện đảo tồn kho và hủy phiếu quỹ kế toán</p>
              </div>
            </div>

            {cancelModal.error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{cancelModal.error}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Lý Do Hủy Phiếu <span className="text-red-400">*</span>
              </label>
              <textarea
                value={cancelModal.reason}
                onChange={(e) =>
                  setCancelModal((prev) => ({ ...prev, reason: e.target.value, error: null }))
                }
                placeholder="Nhập lý do chi tiết (ví dụ: Khách hàng yêu cầu hủy đổi, nhập sai thông tin...)"
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelModal.submitting}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-500/25 flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {cancelModal.submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                <span>Xác Nhận Hủy</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
