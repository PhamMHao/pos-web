import React, { useState } from 'react';
import { X, Sliders, ShieldCheck, CheckCircle2, Lock, Globe, Key } from 'lucide-react';
import { CaGatewayConfig } from '../../../types';

export interface CaGatewayConfigModalProps {
  gateway: CaGatewayConfig;
  onClose: () => void;
  onSave: (updated: CaGatewayConfig) => Promise<void>;
}

export const CaGatewayConfigModal: React.FC<CaGatewayConfigModalProps> = ({
  gateway,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    endpointUrl: gateway.endpointUrl,
    clientId: gateway.clientId || '',
    clientSecret: gateway.clientSecret || '',
    taxCode: gateway.taxCode || '3702918234',
    environment: gateway.environment || 'production',
    isActive: gateway.isActive,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        ...gateway,
        ...formData,
      });
      onClose();
    } catch (err: any) {
      alert('Lưu cấu hình thất bại: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 overflow-y-auto backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col text-slate-200">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl">{gateway.logo}</span>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>Cấu Hình Kết Nối API: {gateway.name}</span>
              </h3>
              <p className="text-xs text-slate-400">
                Chứng thực số &amp; Chữ ký số từ xa Cloud HSM
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Cổng API Ký Số (Endpoint URL):</label>
            <div className="relative">
              <Globe className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={formData.endpointUrl}
                onChange={(e) => setFormData({ ...formData, endpointUrl: e.target.value })}
                required
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Môi trường kết nối:</label>
              <select
                value={formData.environment}
                onChange={(e) => setFormData({ ...formData, environment: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="production">Production (Ký Thật)</option>
                <option value="sandbox">Sandbox (Thử nghiệm)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Mã Số Thuế Doanh Nghiệp:</label>
              <input
                type="text"
                value={formData.taxCode}
                onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Client ID / App ID:</label>
            <div className="relative">
              <Key className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                placeholder="VD: GP_ERP_VIETTEL_CA_PROD"
                required
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">
              Client Secret (Khóa Bí Mật CA):
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="password"
                value={formData.clientSecret}
                onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
                placeholder="Nhập khóa bí mật do nhà mạng CA cấp..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1 italic">
              Thông tin được mã hóa bảo mật và lưu trữ trực tiếp trong máy chủ cơ sở dữ liệu Microsoft SQL Server.
            </p>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="isActiveGateway"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="isActiveGateway" className="text-slate-300 font-bold cursor-pointer">
              Kích hoạt cổng ký số này trên hệ thống ERP
            </label>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? 'Đang Lưu...' : 'Lưu Cấu Hình'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
