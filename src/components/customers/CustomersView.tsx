import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Award,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  CreditCard,
  Upload,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Customer, CustomerTier, Order } from '../../types';
import { formatVND } from '../../utils/vietqr';
import { customersApi } from '../../features/customers/api/customersApi';

interface CustomersViewProps {
  customers: Customer[];
  orders: Order[];
  onSaveCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string) => void;
  onRefreshDb?: () => void;
}

const TIER_CONFIG: Record<CustomerTier, { bg: string; text: string; border: string }> = {
  Đồng: { bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-700/40' },
  Bạc: { bg: 'bg-slate-700/40', text: 'text-slate-200', border: 'border-slate-600/40' },
  Vàng: { bg: 'bg-yellow-950/40', text: 'text-yellow-300', border: 'border-yellow-600/40' },
  'Kim Cương': { bg: 'bg-cyan-950/40', text: 'text-cyan-300', border: 'border-cyan-500/40' },
};

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers = [],
  orders = [],
  onSaveCustomer,
  onDeleteCustomer,
  onRefreshDb,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [settlingCustomer, setSettlingCustomer] = useState<Customer | null>(null);
  const [settleAmount, setSettleAmount] = useState<number>(0);

  const safeCustomers = Array.isArray(customers) ? customers : [];
  const safeOrders = Array.isArray(orders) ? orders : [];

  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    email: '',
    address: '',
    tier: 'Đồng',
    points: 0,
    debt: 0,
    note: '',
  });

  const filteredCustomers = useMemo(() => {
    return safeCustomers.filter((c) => {
      if (!c) return false;
      const matchTier = tierFilter === 'all' || c.tier === tierFilter;
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q));

      return matchTier && matchSearch;
    });
  }, [safeCustomers, tierFilter, searchTerm]);

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      tier: 'Đồng',
      points: 0,
      debt: 0,
      note: '',
    });
    setShowModal(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({ ...c });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    const customerToSave: Customer = {
      id: editingCustomer ? editingCustomer.id : 'cust-' + Date.now(),
      name: formData.name,
      phone: formData.phone,
      email: formData.email || '',
      address: formData.address || '',
      tier: (formData.tier as CustomerTier) || 'Đồng',
      points: Number(formData.points) || 0,
      totalSpent: editingCustomer ? editingCustomer.totalSpent : 0,
      totalOrders: editingCustomer ? editingCustomer.totalOrders : 0,
      debt: Number(formData.debt) || 0,
      note: formData.note || '',
      createdAt: editingCustomer ? editingCustomer.createdAt : new Date().toISOString(),
    };

    onSaveCustomer(customerToSave);
    setShowModal(false);
  };

  const handleSettleDebtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlingCustomer) return;

    const currentDebt = settlingCustomer.debt;
    const remaining = Math.max(0, currentDebt - (Number(settleAmount) || 0));

    onSaveCustomer({
      ...settlingCustomer,
      debt: remaining,
    });

    setSettlingCustomer(null);
  };

  // Import CSV / Excel file into SQL Server
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isImportingCsv, setIsImportingCsv] = useState(false);

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImportingCsv(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          alert('Tệp CSV rỗng hoặc chỉ có dòng tiêu đề.');
          setIsImportingCsv(false);
          return;
        }

        const itemsToImport: any[] = [];
        // Skip header line
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
          if (cols.length >= 2) {
            const name = cols[0];
            const phone = cols[1];
            const email = cols[2] || '';
            const address = cols[3] || '';
            const tier = (cols[4] || 'Đồng') as CustomerTier;
            const points = Number(cols[5]) || 0;
            const debt = Number(cols[6]) || 0;
            const note = cols[7] || '';

            if (name && phone) {
              itemsToImport.push({
                name,
                phone,
                email,
                address,
                tier,
                points,
                debt,
                note,
              });
            }
          }
        }

        if (itemsToImport.length === 0) {
          alert('Không tìm thấy dòng khách hàng hợp lệ (cần ít nhất Tên và SĐT).');
          setIsImportingCsv(false);
          return;
        }

        const res = await customersApi.bulkImport(itemsToImport);
        alert(`🎉 Đã nạp thành công ${res.successCount}/${itemsToImport.length} khách hàng trực tiếp vào SQL Server!`);
        if (onRefreshDb) {
          onRefreshDb();
        } else {
          const fresh = await customersApi.getCustomers({ limit: 1000 });
          if (fresh?.data) {
            fresh.data.forEach((c) => onSaveCustomer(c));
          }
        }
      } catch (err: any) {
        alert(`Lỗi khi nhập tệp CSV: ${err.message}`);
      } finally {
        setIsImportingCsv(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Họ và Tên', 'Số Điện Thoại', 'Email', 'Địa Chỉ', 'Phân Hạng VIP', 'Điểm Tích Lũy', 'Công Nợ', 'Ghi Chú'];
    const rows = safeCustomers.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      `"${c.email || ''}"`,
      `"${c.address || ''}"`,
      `"${c.tier}"`,
      c.points,
      c.debt,
      `"${c.note || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `danh_sach_khach_hang_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalDebtSum = useMemo(() => {
    return safeCustomers.reduce((sum, c) => sum + (c.debt || 0), 0);
  }, [safeCustomers]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto h-full text-slate-100">
      {/* Hidden File Input for CSV Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportCSV}
        accept=".csv,.txt"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>Khách Hàng & CRM Thân Thiết</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            Quản lý hồ sơ, tích lũy điểm thưởng, phân hạng VIP và theo dõi công nợ trực tiếp SQL Server.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImportingCsv}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            title="Nhập danh sách khách hàng từ file CSV / Excel"
          >
            <Upload className={`w-4 h-4 text-sky-400 ${isImportingCsv ? 'animate-bounce' : ''}`} />
            <span className="hidden sm:inline">{isImportingCsv ? 'Đang nạp file...' : 'Nhập Excel/CSV'}</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Xuất CSV</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm Khách Hàng</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Tổng khách hàng:</span>
          <div className="text-xl font-bold font-mono text-white">
            {safeCustomers.length}
          </div>
        </div>

        <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Khách hàng VIP (Vàng/KC):</span>
          <div className="text-xl font-bold font-mono text-amber-400">
            {safeCustomers.filter((c) => c && (c.tier === 'Vàng' || c.tier === 'Kim Cương')).length}
          </div>
        </div>

        <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Tổng điểm thưởng tích lũy:</span>
          <div className="text-xl font-bold font-mono text-cyan-400">
            {safeCustomers.reduce((s, c) => s + (c?.points || 0), 0).toLocaleString('vi-VN')} pts
          </div>
        </div>

        <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Tổng nợ phải thu:</span>
          <div className="text-xl font-bold font-mono text-rose-400">
            {formatVND(totalDebtSum)}
          </div>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo Tên khách hàng, Số điện thoại, Email..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 shrink-0"
        >
          <option value="all">Tất cả hạng thành viên</option>
          <option value="Đồng">Hạng Đồng</option>
          <option value="Bạc">Hạng Bạc</option>
          <option value="Vàng">Hạng Vàng</option>
          <option value="Kim Cương">Hạng Kim Cương</option>
        </select>
      </div>

      {/* Customers List Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Khách Hàng</th>
                <th className="py-3.5 px-4">Hạng Hội Viên</th>
                <th className="py-3.5 px-4 text-center">Điểm Thưởng</th>
                <th className="py-3.5 px-4 text-right">Tổng Chi Tiêu</th>
                <th className="py-3.5 px-4 text-center">Đơn Mua</th>
                <th className="py-3.5 px-4 text-right">Công Nợ</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Không tìm thấy khách hàng phù hợp
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const tierInfo = TIER_CONFIG[cust.tier] || TIER_CONFIG.Đồng;

                  return (
                    <tr key={cust.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-100 text-sm">
                          {cust.name}
                        </div>
                        <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-0.5 font-mono">
                          <span>{cust.phone}</span>
                          {cust.email && <span>• {cust.email}</span>}
                        </div>
                        {cust.address && (
                          <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                            {cust.address}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${tierInfo.bg} ${tierInfo.text} ${tierInfo.border}`}
                        >
                          <Award className="w-3 h-3 mr-1" />
                          {cust.tier}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold text-cyan-400">
                        {cust.points} pts
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 text-sm">
                        {formatVND(cust.totalSpent)}
                      </td>

                      <td className="py-3.5 px-4 text-center text-slate-300 font-mono">
                        {cust.totalOrders} đơn
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {cust.debt > 0 ? (
                          <span className="font-mono font-bold text-rose-400">
                            {formatVND(cust.debt)}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-mono">0 đ</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {cust.debt > 0 && (
                            <button
                              onClick={() => {
                                setSettlingCustomer(cust);
                                setSettleAmount(cust.debt);
                              }}
                              className="px-2 py-1 text-[11px] font-semibold bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 rounded-lg transition-colors"
                              title="Thu nợ khách hàng"
                            >
                              Thu Nợ
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(cust)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="Sửa thông tin"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc muốn xóa khách hàng "${cust.name}"?`)) {
                                onDeleteCustomer(cust.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Xóa khách hàng"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl max-w-lg w-full border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">
                {editingCustomer ? 'Chỉnh Sửa Hồ Sơ Khách Hàng' : 'Thêm Khách Hàng Mới'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Họ và tên (*):
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="VD: Nguyễn Văn An"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Số điện thoại (*):
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                    placeholder="09..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Email:
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="email@gmail.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Địa chỉ giao hàng:
                </label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/TP"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Hạng hội viên:
                  </label>
                  <select
                    value={formData.tier || 'Đồng'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tier: e.target.value as CustomerTier,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Đồng">Đồng</option>
                    <option value="Bạc">Bạc</option>
                    <option value="Vàng">Vàng</option>
                    <option value="Kim Cương">Kim Cương</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Điểm tích lũy:
                  </label>
                  <input
                    type="number"
                    value={formData.points || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, points: Number(e.target.value) })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Công nợ (VNĐ):
                  </label>
                  <input
                    type="number"
                    value={formData.debt || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, debt: Number(e.target.value) })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-rose-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Ghi chú về khách hàng:
                </label>
                <textarea
                  value={formData.note || ''}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  placeholder="Ghi chú sở thích, thói quen mua hàng..."
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-all shadow"
                >
                  {editingCustomer ? 'Lưu Thay Đổi' : 'Thêm Khách Hàng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settle Debt Modal */}
      {settlingCustomer && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl max-w-md w-full border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Thu Tiền Công Nợ Khách Hàng</span>
              </h3>
              <button
                onClick={() => setSettlingCustomer(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSettleDebtSubmit} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1">
                <div className="font-semibold text-slate-200 text-sm">
                  {settlingCustomer.name}
                </div>
                <div className="text-slate-400 font-mono">
                  SĐT: {settlingCustomer.phone}
                </div>
                <div className="text-rose-400 font-mono font-bold text-sm pt-1">
                  Số nợ hiện tại: {formatVND(settlingCustomer.debt)}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Số tiền khách thanh toán đợt này:
                </label>
                <input
                  type="number"
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-base font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSettlingCustomer(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-all shadow"
                >
                  Xác Nhận Đã Thu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
