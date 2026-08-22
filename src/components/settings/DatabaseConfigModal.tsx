import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertCircle, RefreshCw, Server, ShieldCheck, X, ChevronDown, Check, Lock, UserCheck } from 'lucide-react';

interface DatabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DatabaseConfigModal: React.FC<DatabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [serverName, setServerName] = useState('.');
  const [authType, setAuthType] = useState<'windows' | 'sql'>('windows');
  const [username, setUsername] = useState('sa');
  const [password, setPassword] = useState('');
  const [database, setDatabase] = useState('GPERP_Enterprise');
  const [customDbName, setCustomDbName] = useState('');
  const [isCustomDb, setIsCustomDb] = useState(false);

  const [availableDatabases, setAvailableDatabases] = useState<string[]>([]);
  const [serverVersion, setServerVersion] = useState<string | null>(null);

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null);

  // Load current status on open
  useEffect(() => {
    if (isOpen) {
      fetch('/api/setup/db-status')
        .then((res) => res.json())
        .then((data) => {
          if (data.currentDb) {
            setDatabase(data.currentDb);
          }
          if (data.currentServer) {
            setServerName(data.currentServer);
          }
          if (data.currentAuthType) {
            setAuthType(data.currentAuthType);
          }
          if (data.currentUsername) {
            setUsername(data.currentUsername);
          }
          if (data.databases && data.databases.length > 0) {
            setAvailableDatabases(data.databases);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!serverName.trim()) {
      setTestResult({ success: false, message: 'Vui lòng nhập Tên máy chủ (Server Name)!' });
      return;
    }

    if (authType === 'sql' && !username.trim()) {
      setTestResult({ success: false, message: 'Vui lòng nhập Tên đăng nhập khi chọn SQL Server Authentication!' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    setSaveResult(null);

    try {
      const response = await fetch('/api/setup/test-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          server: serverName.trim(),
          authType,
          username: authType === 'windows' ? undefined : username.trim(),
          password: authType === 'windows' ? undefined : password,
          database: isCustomDb ? customDbName.trim() : database,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTestResult({ success: true, message: data.message || 'Kết nối máy chủ SQL Server thành công!' });
        setServerVersion(data.version || null);
        if (data.databases && data.databases.length > 0) {
          setAvailableDatabases(data.databases);
          if (!isCustomDb && !data.databases.includes(database)) {
            if (data.currentSelected && data.databases.includes(data.currentSelected)) {
              setDatabase(data.currentSelected);
            } else {
              setDatabase(data.databases[0]);
            }
          }
        }
      } else {
        setTestResult({ success: false, message: data.message || 'Không thể kết nối SQL Server!' });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: `Lỗi kết nối: ${err.message}` });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfig = async () => {
    const finalDb = isCustomDb ? customDbName.trim() : database;
    if (!serverName.trim() || !finalDb) {
      setSaveResult({ success: false, message: 'Vui lòng điền đầy đủ Tên máy chủ và Tên Database!' });
      return;
    }

    if (authType === 'sql' && !username.trim()) {
      setSaveResult({ success: false, message: 'Vui lòng nhập Tên đăng nhập khi chọn SQL Server Authentication!' });
      return;
    }

    setIsSaving(true);
    setSaveResult(null);

    try {
      const response = await fetch('/api/setup/save-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          server: serverName.trim(),
          authType,
          username: authType === 'windows' ? undefined : username.trim(),
          password: authType === 'windows' ? undefined : password,
          database: finalDb,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSaveResult({
          success: true,
          message: `${data.message} Đang làm mới dữ liệu từ CSDL [${finalDb}]...`,
        });
        setDatabase(finalDb);
        setIsCustomDb(false);
        setCustomDbName('');
        if (!availableDatabases.includes(finalDb)) {
          setAvailableDatabases((prev) => [...prev, finalDb].sort());
        }

        // Clear cached localStorage data from previous database
        const keysToClear = [
          'gperp_products_v2',
          'gperp_customers_v2',
          'gperp_orders_v2',
          'gperp_promotions_v2',
          'gperp_current_shift_v2',
          'gperp_shifts_history_v2',
          'gperp_settings_v2',
          'gperp_inv_logs_v2',
          'gperp_accounting_v2',
          'gperp_employees_v2',
          'gperp_quotes_v2',
          'gperp_costing_v2',
          'gperp_assets_v2',
          'gperp_fraud_alerts_v2',
          'gperp_warranties_v2',
          'gperp_serial_records_v2',
          'gperp_einvoices_v2',
          'gperp_labor_contracts_v2',
          'gperp_inbound_invoices_v2',
          'gperp_stock_receipts_v2',
          'gp_erp_suppliers_data',
          'gp_erp_purchase_orders_data',
          'gperp_returns_v2',
          'gperp_transfers_v2',
        ];
        keysToClear.forEach((k) => {
          try {
            localStorage.removeItem(k);
          } catch {}
        });

        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            window.location.reload();
          }
        }, 1200);
      } else {
        setSaveResult({ success: false, message: data.message || 'Lỗi khi lưu cấu hình CSDL!' });
      }
    } catch (err: any) {
      setSaveResult({ success: false, message: `Lỗi: ${err.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setServerName('.');
    setAuthType('windows');
    setUsername('sa');
    setPassword('');
    setDatabase('GPERP_Enterprise');
    setCustomDbName('');
    setIsCustomDb(false);
    setTestResult(null);
    setSaveResult(null);
    setServerVersion(null);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white text-slate-800 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Cấu Hình Kết Nối SQL Server
              </h3>
              <p className="text-[11px] text-slate-500">
                Hỗ trợ cả Windows Authentication và SQL Server Authentication
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-6 space-y-4">
          {/* Server Name */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-800">
              Tên máy chủ (Server Name):
            </label>
            <input
              type="text"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              placeholder="VD: . hoặc localhost hoặc .\SQLEXPRESS hoặc IP hosting"
              className="w-full p-2.5 px-3 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-mono"
            />
            <p className="text-[11px] text-slate-500">
              Dùng dấu <code className="px-1 bg-slate-100 rounded text-sky-700 font-mono">.</code> hoặc <code className="px-1 bg-slate-100 rounded text-sky-700 font-mono">localhost</code> cho máy cục bộ, hoặc IP/Domain cho máy chủ Hosting.
            </p>
          </div>

          {/* Authentication Mode Selector (SSMS style) */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-800">
              Phương thức xác thực (Authentication):
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAuthType('windows')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  authType === 'windows'
                    ? 'bg-sky-50 border-sky-500 text-sky-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Windows Authentication</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthType('sql')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  authType === 'sql'
                    ? 'bg-sky-50 border-sky-500 text-sky-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>SQL Server Authentication</span>
              </button>
            </div>
          </div>

          {/* Authentication Fields depending on mode */}
          {authType === 'windows' ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-2 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Windows Authentication:</strong> Tự động xác thực tài khoản Windows hiện tại (không cần nhập tên đăng nhập và mật khẩu).
              </span>
            </div>
          ) : (
            <div className="space-y-1.5 animate-in fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-xs text-slate-600 mb-1 font-medium">Tên đăng nhập:</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="VD: sa"
                    className="w-full p-2 px-3 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
                <div>
                  <span className="block text-xs text-slate-600 mb-1 font-medium">Mật khẩu:</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mật khẩu tài khoản sa"
                    className="w-full p-2 px-3 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Test Connection Button */}
          <div>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="w-full py-2.5 px-4 bg-[#0088cc] hover:bg-[#0077b3] active:bg-[#006699] text-white font-semibold text-sm rounded-md transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang kiểm tra kết nối tới SQL Server...</span>
                </>
              ) : (
                <span>Kiểm tra kết nối</span>
              )}
            </button>
          </div>

          {/* Test Result Alert */}
          {testResult && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-start space-x-2.5 animate-in fade-in ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-semibold">{testResult.message}</p>
                {serverVersion && (
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                    {serverVersion}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Database Selection */}
          <div className="space-y-1.5 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-slate-800">
                Cơ sở dữ liệu (Database):
              </label>
              <button
                type="button"
                onClick={() => setIsCustomDb(!isCustomDb)}
                className="text-xs text-sky-600 hover:text-sky-700 font-semibold cursor-pointer"
              >
                {isCustomDb ? '← Chọn CSDL có sẵn' : '+ Nhập tên CSDL mới'}
              </button>
            </div>

            {isCustomDb ? (
              <div>
                <input
                  type="text"
                  value={customDbName}
                  onChange={(e) => setCustomDbName(e.target.value)}
                  placeholder="Nhập tên CSDL muốn tạo mới, VD: GPERP_Enterprise"
                  className="w-full p-2.5 px-3 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Hệ thống sẽ tự động tạo CSDL mới này trên SQL Server nếu chưa có.
                </p>
              </div>
            ) : (
              <div className="relative">
                <select
                  value={database}
                  onChange={(e) => setDatabase(e.target.value)}
                  className="w-full p-2.5 px-3 bg-white border border-slate-300 rounded-md text-sm text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 cursor-pointer pr-10"
                >
                  {availableDatabases.length > 0 ? (
                    <>
                      {!availableDatabases.includes(database) && database && (
                        <option value={database}>{database} (Hiện tại)</option>
                      )}
                      {availableDatabases.map((db) => (
                        <option key={db} value={db}>
                          {db} {db === database ? '(Đang chọn)' : ''}
                        </option>
                      ))}
                    </>
                  ) : (
                    <>
                      <option value={database}>{database} (Hiện tại)</option>
                      <option value="POS_WEB">POS_WEB</option>
                      <option value="GPERP_Enterprise">GPERP_Enterprise</option>
                    </>
                  )}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Save Result Alert */}
          {saveResult && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-start space-x-2.5 animate-in fade-in ${
                saveResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {saveResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-semibold">{saveResult.message}</div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-center space-x-3">
            <button
              type="button"
              onClick={handleSaveConfig}
              disabled={isSaving || isTesting}
              className="py-2.5 px-8 bg-[#0088cc] hover:bg-[#0077b3] active:bg-[#006699] text-white font-bold text-sm rounded-md transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer min-w-[140px]"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang khởi tạo 22 bảng...</span>
                </>
              ) : (
                <span>Lưu Cấu Hình</span>
              )}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={isSaving || isTesting}
              className="py-2.5 px-6 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-sm rounded-md transition-all cursor-pointer"
            >
              Làm Lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
