import React, { useState } from 'react';
import {
  Building2,
  Wrench,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Search,
  Plus,
  Truck,
  Monitor,
  Printer,
  ShieldCheck,
  Edit2,
  Trash2,
  Clock,
} from 'lucide-react';
import { EnterpriseAsset, StoreSettings } from '../../types';
import { NewAssetModal } from './NewAssetModal';
import { AssetBarcodeLabelModal } from './AssetBarcodeLabelModal';
import { Barcode, QrCode } from 'lucide-react';

interface AssetsViewProps {
  assets?: EnterpriseAsset[];
  onSaveAsset?: (asset: EnterpriseAsset) => void;
  onDeleteAsset?: (assetId: string) => void;
  settings?: StoreSettings;
}

export const AssetsView: React.FC<AssetsViewProps> = ({
  assets = [],
  onSaveAsset,
  onDeleteAsset,
  settings,
}) => {
  const safeAssets = Array.isArray(assets) ? assets : [];
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<EnterpriseAsset | null>(null);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [selectedAssetForLabel, setSelectedAssetForLabel] = useState<EnterpriseAsset | null>(null);

  const formatVND = (amt: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amt);
  };

  const filteredAssets = safeAssets.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOriginalValue = safeAssets.reduce((sum, a) => sum + a.originalValue, 0);
  const totalRemainingValue = safeAssets.reduce((sum, a) => sum + a.remainingValue, 0);

  const getStatusBadge = (status: EnterpriseAsset['status']) => {
    switch (status) {
      case 'good':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Hoạt Động Tốt
          </span>
        );
      case 'maintenance_required':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Cần Bảo Dưỡng
          </span>
        );
      case 'broken':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Đang Hỏng / Sửa
          </span>
        );
      case 'liquidated':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-400 border border-slate-600">
            Đã Thanh Lý
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 bg-slate-900/90 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center space-x-2">
              <span>Quản Lý Tài Sản & Thiết Bị Doanh Nghiệp</span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                ERP Assets
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Theo dõi thiết bị POS, máy in, cân điện tử, xe tải vận chuyển, khấu hao TSCĐ và lịch bảo trì
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => {
              setSelectedAssetForLabel(null);
              setShowLabelModal(true);
            }}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-lg shadow-amber-600/20 transition-all cursor-pointer"
            title="In tem nhãn QR code và mã định danh cho tài sản doanh nghiệp"
          >
            <QrCode className="w-4 h-4" />
            <span>In Tem QR / Mã Tài Sản</span>
          </button>

          <button
            onClick={() => {
              setEditingAsset(null);
              setShowNewModal(true);
            }}
            className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-lg shadow-cyan-500/20 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Thiết Bị Mới</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0 bg-slate-900/40 border-b border-slate-800/60">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="text-slate-400 text-xs font-medium mb-1">Tổng Nguyên Giá Tài Sản</div>
          <div className="text-xl font-black text-white font-mono">{formatVND(totalOriginalValue)}</div>
          <p className="text-[11px] text-slate-400 mt-1">{safeAssets.length} thiết bị & phương tiện</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="text-slate-400 text-xs font-medium mb-1">Giá Trị Còn Lại (Sau Khấu Hao)</div>
          <div className="text-xl font-black text-cyan-400 font-mono">{formatVND(totalRemainingValue)}</div>
          <p className="text-[11px] text-emerald-400 mt-1">Khấu hao đúng tiến độ</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="text-slate-400 text-xs font-medium mb-1">Tình Trạng Vận Hành</div>
          <div className="text-xl font-black text-emerald-400 font-mono">
            {Math.round(
              (safeAssets.filter((a) => a.status === 'good').length / (safeAssets.length || 1)) * 100
            )}
            % Hoạt Động Tốt
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Đã bảo trì định kỳ tháng 01 & 02</p>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
        <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm tài sản, máy móc..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-700/60">
              <tr>
                <th className="px-4 py-3">Mã Tài Sản</th>
                <th className="px-4 py-3">Tên Thiết Bị / Phân Loại</th>
                <th className="px-4 py-3">Ngày Đưa Vào SD</th>
                <th className="px-4 py-3">Người / Bộ Phận Quản Lý</th>
                <th className="px-4 py-3 text-right">Nguyên Giá</th>
                <th className="px-4 py-3 text-right">Giá Trị Còn Lại</th>
                <th className="px-4 py-3 text-center">Trạng Thái</th>
                <th className="px-4 py-3 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredAssets.map((a) => (
                <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-cyan-400">{a.code}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-white">{a.name}</div>
                    <div className="text-[11px] text-slate-400">{a.category}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-400">{a.purchaseDate}</td>
                  <td className="px-4 py-3 text-slate-200">{a.assignedTo}</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-300">{formatVND(a.originalValue)}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">
                    {formatVND(a.remainingValue)}
                  </td>
                  <td className="px-4 py-3 text-center">{getStatusBadge(a.status)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      <button
                        onClick={() => {
                          setSelectedAssetForLabel(a);
                          setShowLabelModal(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition cursor-pointer"
                        title="In tem nhãn QR / Barcode cho thiết bị này"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingAsset(a);
                          setShowNewModal(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition cursor-pointer"
                        title="Chỉnh sửa tài sản"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc chắn muốn xóa tài sản "${a.name}" không?`)) {
                            if (onDeleteAsset) onDeleteAsset(a.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                        title="Xóa tài sản"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New / Edit Asset Modal */}
      {showNewModal && (
        <NewAssetModal
          assetToEdit={editingAsset}
          onClose={() => {
            setShowNewModal(false);
            setEditingAsset(null);
          }}
          onSave={(asset) => {
            if (onSaveAsset) onSaveAsset(asset);
          }}
        />
      )}

      {/* Asset Barcode & QR Label Modal */}
      {showLabelModal && (
        <AssetBarcodeLabelModal
          isOpen={showLabelModal}
          onClose={() => {
            setShowLabelModal(false);
            setSelectedAssetForLabel(null);
          }}
          assets={safeAssets}
          initialSelectedAsset={selectedAssetForLabel}
          settings={settings}
        />
      )}
    </div>
  );
};
