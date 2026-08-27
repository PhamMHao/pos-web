import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Layers,
  Plus,
  Trash2,
  ArrowRight,
  Sparkles,
  Info,
  Check,
  Scale,
  GitBranch,
  TrendingUp,
} from 'lucide-react';
import { UnitOfMeasure, UOMGroup, UOMTierNode } from '../../types';

interface UOMGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: UOMGroup | null;
  unitsOfMeasure: UnitOfMeasure[];
  onSave: (data: Omit<UOMGroup, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const UOMGroupModal: React.FC<UOMGroupModalProps> = ({
  isOpen,
  onClose,
  initialData,
  unitsOfMeasure,
  onSave,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  // Base unit selection
  const [baseUnitId, setBaseUnitId] = useState('');

  // Child conversion tiers (Dynamic array of tiers above base)
  const [childTiers, setChildTiers] = useState<
    Array<{
      id: string;
      unitName: string;
      unitSymbol: string;
      parentUnitName: string;
      stepFactor: number;
      equivalentNote: string;
    }>
  >([]);

  // Initialize or reset form state
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setCode(initialData.code || '');
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setStatus(initialData.status || 'active');

      const baseUom = unitsOfMeasure.find(
        (u) => u.id === initialData.baseUnitId || u.name === initialData.baseUnitName
      );
      setBaseUnitId(baseUom ? baseUom.id : unitsOfMeasure[0]?.id || '');

      // Load child tiers
      const convs = Array.isArray(initialData.conversions)
        ? initialData.conversions
        : [];
      const nonBaseTiers = convs
        .filter((c) => !c.isBase && c.unitName !== initialData.baseUnitName)
        .map((c, idx) => ({
          id: c.id || `tier-${idx + 2}`,
          unitName: c.unitName,
          unitSymbol: c.unitSymbol || c.unitName,
          parentUnitName: c.parentUnitName || initialData.baseUnitName,
          stepFactor: Number(c.stepFactor) || 1,
          equivalentNote: c.equivalentNote || '',
        }));

      setChildTiers(nonBaseTiers);
    } else {
      setCode('');
      setName('');
      setDescription('');
      setStatus('active');
      const defaultBase = unitsOfMeasure.find((u) => u.code.includes('CAI') || u.code.includes('MET')) || unitsOfMeasure[0];
      setBaseUnitId(defaultBase ? defaultBase.id : '');
      setChildTiers([]);
    }
  }, [initialData, unitsOfMeasure, isOpen]);

  // Selected base UOM object
  const selectedBaseUOM = useMemo(() => {
    return unitsOfMeasure.find((u) => u.id === baseUnitId) || unitsOfMeasure[0];
  }, [unitsOfMeasure, baseUnitId]);

  // Real-time Solver: Calculate full resolved hierarchy of tiers
  const resolvedTiers: UOMTierNode[] = useMemo(() => {
    if (!selectedBaseUOM) return [];

    const rootTier: UOMTierNode = {
      id: 'tier-root',
      tierLevel: 1,
      unitId: selectedBaseUOM.id,
      unitName: selectedBaseUOM.name,
      unitSymbol: selectedBaseUOM.symbol || selectedBaseUOM.name,
      isBase: true,
      parentUnitName: null,
      stepFactor: 1,
      ratioToBase: 1,
      equivalentNote: 'Đơn vị cơ sở gốc',
      formulaDisplay: `1 ${selectedBaseUOM.symbol || selectedBaseUOM.name} = 1 ${selectedBaseUOM.symbol || selectedBaseUOM.name}`,
    };

    const tiers: UOMTierNode[] = [rootTier];
    const ratioMap: Record<string, number> = {
      [rootTier.unitName]: 1,
    };

    childTiers.forEach((tier, index) => {
      const parentRatio = ratioMap[tier.parentUnitName] !== undefined ? ratioMap[tier.parentUnitName] : 1;
      const calculatedRatioToBase = (Number(tier.stepFactor) || 1) * parentRatio;
      ratioMap[tier.unitName] = calculatedRatioToBase;

      const formattedFormula =
        tier.parentUnitName === rootTier.unitName
          ? `1 ${tier.unitSymbol || tier.unitName} = ${tier.stepFactor} ${rootTier.unitSymbol || rootTier.unitName}`
          : `1 ${tier.unitSymbol || tier.unitName} = ${tier.stepFactor} ${tier.parentUnitName} = ${calculatedRatioToBase.toLocaleString('vi-VN')} ${rootTier.unitSymbol || rootTier.unitName}`;

      tiers.push({
        id: tier.id,
        tierLevel: index + 2,
        unitName: tier.unitName,
        unitSymbol: tier.unitSymbol || tier.unitName,
        isBase: false,
        parentUnitName: tier.parentUnitName,
        stepFactor: Number(tier.stepFactor) || 1,
        ratioToBase: calculatedRatioToBase,
        equivalentNote: tier.equivalentNote || undefined,
        formulaDisplay: formattedFormula,
      });
    });

    return tiers;
  }, [selectedBaseUOM, childTiers]);

  // List of available parent units to choose from when defining a new tier
  const availableParentUnitNames = useMemo(() => {
    if (!selectedBaseUOM) return [];
    const list = [selectedBaseUOM.name];
    childTiers.forEach((t) => {
      if (t.unitName && !list.includes(t.unitName)) {
        list.push(t.unitName);
      }
    });
    return list;
  }, [selectedBaseUOM, childTiers]);

  // Handle adding a new child tier
  const handleAddTier = () => {
    // Find an unused unit if possible
    const usedNames = [selectedBaseUOM?.name, ...childTiers.map((t) => t.unitName)];
    const availableUnit = unitsOfMeasure.find((u) => !usedNames.includes(u.name)) || unitsOfMeasure[0];
    const defaultParentName = childTiers.length > 0 ? childTiers[childTiers.length - 1].unitName : selectedBaseUOM?.name || '';

    setChildTiers((prev) => [
      ...prev,
      {
        id: `tier-${Date.now()}-${prev.length + 1}`,
        unitName: availableUnit?.name || 'Thùng',
        unitSymbol: availableUnit?.symbol || availableUnit?.name || 'Thùng',
        parentUnitName: defaultParentName,
        stepFactor: 10,
        equivalentNote: '',
      },
    ]);
  };

  // Handle updating a child tier
  const handleUpdateTier = (
    index: number,
    field: 'unitName' | 'parentUnitName' | 'stepFactor' | 'equivalentNote',
    value: any
  ) => {
    setChildTiers((prev) => {
      const updated = [...prev];
      const target = { ...updated[index] };

      if (field === 'unitName') {
        target.unitName = value;
        const uomObj = unitsOfMeasure.find((u) => u.name === value);
        target.unitSymbol = uomObj?.symbol || value;
      } else if (field === 'stepFactor') {
        target.stepFactor = Math.max(0.0001, parseFloat(value) || 1);
      } else if (field === 'parentUnitName') {
        target.parentUnitName = value;
      } else if (field === 'equivalentNote') {
        target.equivalentNote = value;
      }

      updated[index] = target;
      return updated;
    });
  };

  // Handle removing a child tier
  const handleRemoveTier = (index: number) => {
    setChildTiers((prev) => prev.filter((_, i) => i !== index));
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      code: code.trim().toUpperCase() || `GRP-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      baseUnitId: selectedBaseUOM?.id,
      baseUnitName: selectedBaseUOM?.name || 'Cái',
      baseUnitSymbol: selectedBaseUOM?.symbol || selectedBaseUOM?.name || 'Cái',
      tierCount: resolvedTiers.length,
      conversions: resolvedTiers,
      status,
      description: description.trim() || undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-md">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {initialData ? 'Chỉnh Sửa Bộ Cấu Hình Nhóm ĐVT' : 'Thiết Lập Nhóm Đơn Vị Tính Đa Tầng Mới'}
              </h3>
              <p className="text-xs text-slate-400">
                Tự do xây dựng chuỗi quy đổi đa cấp (Container ➔ Pallet ➔ Thùng ➔ Cuộn ➔ Mét / Kg)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-slate-200">
          {/* SECTION 1: THÔNG TIN CHUNG CỦA NHÓM */}
          <div className="bg-slate-850/70 p-4 rounded-2xl border border-slate-700/80 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
              <GitBranch className="w-4 h-4" />
              <span>1. Thông Tin Nhóm Quy Đổi</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Mã Nhóm *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="GRP-DAYCAP, GRP-BIA, GRP-LINHKIEN..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs uppercase font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">Tên Bộ Nhóm ĐVT *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Nhóm Dây Cáp Mạng Cat6 (Pallet ➔ Thùng ➔ Cuộn ➔ Mét)"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">Mô tả quy cách / Ghi chú</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="VD: Áp dụng cho các cuộn cáp mạng nhập khẩu và cáp điện thi công"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Trạng thái</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs cursor-pointer focus:border-purple-500 focus:outline-none"
                >
                  <option value="active">Đang áp dụng (Active)</option>
                  <option value="inactive">Tạm ngưng (Inactive)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: TẦNG 1 - ĐƠN VỊ CƠ SỞ GỐC (ROOT BASE UNIT) */}
          <div className="bg-emerald-950/20 p-4 rounded-2xl border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Scale className="w-4 h-4" />
                <span>2. Tầng 1: Đơn Vị Tính Cơ Sở Gốc (Nhỏ Nhất)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                Hệ số = 1.0 (Gốc)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Chọn ĐVT Cơ Sở (Từ danh mục ĐVT đã tạo) *
                </label>
                <select
                  value={baseUnitId}
                  onChange={(e) => setBaseUnitId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-emerald-500/40 rounded-xl text-white text-xs font-semibold cursor-pointer focus:border-emerald-500 focus:outline-none"
                >
                  {unitsOfMeasure.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.symbol || u.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/20 rounded-xl text-emerald-300/90 text-xs w-full flex items-center space-x-2">
                  <Info className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                  <span>
                    Mọi tầng quy đổi phía trên đều sẽ được tự động quy về{' '}
                    <strong>{selectedBaseUOM?.name || 'ĐVT này'}</strong> để tính tồn kho cơ sở.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: BẢNG CẤU HÌNH CÁC TẦNG QUY ĐỔI ĐA CẤP */}
          <div className="bg-slate-850/70 rounded-2xl border border-slate-700/80 overflow-hidden space-y-0">
            <div className="p-3.5 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4" />
                <span>3. Bảng Cấu Hình Các Tầng Quy Đổi (Tầng 2, 3, 4, 5...)</span>
              </div>

              <button
                type="button"
                onClick={handleAddTier}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-md shadow-indigo-600/20 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Thêm Tầng Quy Đổi</span>
              </button>
            </div>

            {childTiers.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-xs">
                Chưa có tầng quy đổi nào. Bấm nút <strong>"+ Thêm Tầng Quy Đổi"</strong> ở góc phải trên để thêm (VD: Cuộn, Thùng, Pallet...).
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3 w-16 text-center">Tầng</th>
                      <th className="py-2.5 px-3 w-40">Đơn Vị Tính</th>
                      <th className="py-2.5 px-3 w-28">Hệ Số Bước</th>
                      <th className="py-2.5 px-3 w-40">Quy Đổi Theo</th>
                      <th className="py-2.5 px-3">Ghi Chú Tương Đương</th>
                      <th className="py-2.5 px-3 w-12 text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {childTiers.map((tier, idx) => (
                      <tr key={tier.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 text-center">
                          <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-xs inline-flex items-center justify-center border border-indigo-500/30">
                            T{idx + 2}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <select
                            value={tier.unitName}
                            onChange={(e) => handleUpdateTier(idx, 'unitName', e.target.value)}
                            className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-semibold focus:border-indigo-500 focus:outline-none"
                          >
                            {unitsOfMeasure
                              .filter((u) => u.name !== selectedBaseUOM?.name)
                              .map((u) => (
                                <option key={u.id} value={u.name}>
                                  {u.name} ({u.symbol || u.name})
                                </option>
                              ))}
                          </select>
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            min="0.0001"
                            step="any"
                            value={tier.stepFactor}
                            onChange={(e) => handleUpdateTier(idx, 'stepFactor', e.target.value)}
                            placeholder="VD: 10, 100..."
                            className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-cyan-400 text-xs font-mono font-bold focus:border-indigo-500 focus:outline-none text-right"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <select
                            value={tier.parentUnitName}
                            onChange={(e) => handleUpdateTier(idx, 'parentUnitName', e.target.value)}
                            className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:border-indigo-500 focus:outline-none"
                          >
                            {availableParentUnitNames
                              .filter((pName) => pName !== tier.unitName)
                              .map((pName) => (
                                <option key={pName} value={pName}>
                                  {pName}
                                </option>
                              ))}
                          </select>
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={tier.equivalentNote}
                            onChange={(e) => handleUpdateTier(idx, 'equivalentNote', e.target.value)}
                            placeholder="VD: ~ 10 Kg, 24 lon..."
                            className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 text-xs focus:border-indigo-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveTier(idx)}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded-lg cursor-pointer transition-colors"
                            title="Xóa tầng này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* SECTION 4: TỔNG KẾT CHUỖI QUY ĐỔI */}
          <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Xem trước chuỗi quy đổi:</span>
              </span>
              <span className="text-[11px] text-cyan-400 font-mono font-bold">
                {resolvedTiers.length} tầng ({selectedBaseUOM?.name} là gốc)
              </span>
            </div>

            <div className="flex items-center flex-wrap gap-1 text-xs">
              {[...resolvedTiers].reverse().map((tier, rIdx) => (
                <React.Fragment key={tier.id}>
                  <span
                    className={`px-2 py-0.5 rounded-lg border text-xs ${
                      tier.isBase
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold'
                        : 'bg-indigo-500/20 border-indigo-500/40 text-white font-medium'
                    }`}
                  >
                    {tier.unitSymbol || tier.unitName}{' '}
                    <span className="text-[10px] opacity-75 font-mono">
                      (x{tier.ratioToBase.toLocaleString('vi-VN')} {selectedBaseUOM?.symbol || selectedBaseUOM?.name})
                    </span>
                  </span>

                  {rIdx < resolvedTiers.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-slate-500 flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
            {/* Formula Summary List */}
            <div className="space-y-1 pt-1 text-xs">
              {resolvedTiers
                .filter((t) => !t.isBase)
                .map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between py-1 px-2.5 bg-slate-900/50 rounded-lg text-slate-300 font-mono text-[11px]"
                  >
                    <span>• {t.formulaDisplay}</span>
                    {t.equivalentNote && (
                      <span className="text-amber-300/80 italic font-sans text-[10px]">({t.equivalentNote})</span>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-purple-600/25 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{initialData ? 'Lưu Thay Đổi Nhóm ĐVT' : 'Tạo Nhóm ĐVT Mới'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
