import React from 'react';
import {
  Activity,
  Sliders,
  CheckCircle2,
  Lock,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  Key,
} from 'lucide-react';
import { CaGatewayConfig } from '../../../types';

export interface GatewaysTabProps {
  gateways: CaGatewayConfig[];
  isPinging: boolean;
  onPingAll: () => void;
  onOpenConfigModal: (gw: CaGatewayConfig) => void;
}

export const GatewaysTab: React.FC<GatewaysTabProps> = ({
  gateways,
  isPinging,
  onPingAll,
  onOpenConfigModal,
}) => {
  return (
    <div className="space-y-4">
      {/* Overview Banner */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Cổng Kết Nối Nhà Cung Cấp Dịch Vụ Chứng Thực Chữ Ký Số Công Cộng (CA Gateways)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Tích hợp chuẩn REST API, Cloud HSM và chuẩn thiết bị phần cứng PKCS#11 với các tập đoàn viễn thông &amp; an ninh mạng
          </p>
        </div>

        <button
          type="button"
          onClick={onPingAll}
          disabled={isPinging}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-bold border border-slate-700 flex items-center space-x-1.5 transition cursor-pointer shrink-0"
        >
          <Activity className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : 'text-cyan-400'}`} />
          <span>{isPinging ? 'Đang Kiểm Tra...' : 'Kiểm Tra Ping CA Toàn Bộ'}</span>
        </button>
      </div>

      {/* Gateway Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {gateways.map((gw) => (
          <div
            key={gw.provider}
            className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 flex flex-col justify-between transition-all"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{gw.logo}</span>
                  <div>
                    <h4 className="font-bold text-white text-xs">{gw.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{gw.provider}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    gw.lastPingStatus === 'online'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-red-500/20 text-red-300 border-red-500/30'
                  }`}
                >
                  {gw.lastPingStatus === 'online' ? `${gw.pingLatencyMs || 35}ms` : 'Offline'}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">
                {gw.description || gw.tagline}
              </p>

              {/* Specs Box */}
              <div className="space-y-1.5 text-[11px] bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 font-mono mb-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-sans">Môi trường:</span>
                  <span
                    className={`font-bold uppercase text-[10px] px-1.5 py-0.2 rounded ${
                      gw.environment === 'production'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    {gw.environment || 'production'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-sans">Client ID:</span>
                  <span className="text-cyan-300 truncate max-w-[140px]" title={gw.clientId}>
                    {gw.clientId}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-sans">Endpoint:</span>
                  <span className="text-slate-300 truncate max-w-[140px]" title={gw.endpointUrl}>
                    {gw.endpointUrl}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">
                Ping: {gw.lastPingAt || 'Vừa xong'}
              </span>

              <button
                type="button"
                onClick={() => onOpenConfigModal(gw)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium border border-slate-700 flex items-center space-x-1 transition cursor-pointer"
              >
                <Sliders className="w-3 h-3 text-cyan-400" />
                <span>Cấu Hình API</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
