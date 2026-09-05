import React, { useState } from 'react';
import { Users, Building2, ShieldCheck } from 'lucide-react';
import { CustomerContractsView } from './economic/CustomerContractsView';
import { LaborContractManagerView } from './LaborContractManagerView';
import { StoreSettings, LaborContract, Employee } from '../../types';

export interface ContractsManagementHubViewProps {
  laborContracts?: LaborContract[];
  setLaborContracts?: (contracts: LaborContract[] | ((prev: LaborContract[]) => LaborContract[])) => void;
  employees?: Employee[];
  settings?: StoreSettings;
  initialTab?: 'economic' | 'labor';
  initialQuoteId?: string | null;
}

export const ContractsManagementHubView: React.FC<ContractsManagementHubViewProps> = ({
  laborContracts = [],
  setLaborContracts = () => {},
  employees = [],
  settings = {} as StoreSettings,
  initialTab = 'economic',
  initialQuoteId,
}) => {
  const [activeTab, setActiveTab] = useState<'economic' | 'labor'>(initialTab);

  return (
    <div className="space-y-4">
      {/* Top Hub Navigation Switcher */}
      <div className="bg-slate-900/90 p-2 sm:p-2.5 rounded-2xl border border-slate-800 shadow-lg flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('economic')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'economic'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Hợp Đồng Kinh Tế Khách Hàng (B2B CLM)</span>
          </button>

          <button
            onClick={() => setActiveTab('labor')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'labor'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Hợp Đồng Lao Động & Nhân Sự (HR)</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400 px-3">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Ký số SmartCA / Token PKI & Phân cấp phê duyệt tự động</span>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'economic' ? (
        <CustomerContractsView initialQuoteId={initialQuoteId} />
      ) : (
        <LaborContractManagerView
          laborContracts={laborContracts}
          setLaborContracts={setLaborContracts}
          employees={employees}
          settings={settings}
        />
      )}
    </div>
  );
};
