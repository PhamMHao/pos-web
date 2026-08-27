import React, { useState, useEffect } from 'react';
import { X, Check, ArrowRightLeft, Scale } from 'lucide-react';
import { MasterUOMConversion, UnitOfMeasure } from '../../types';

interface UOMConversionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (conversion: Omit<MasterUOMConversion, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: MasterUOMConversion | null;
  unitsOfMeasure: UnitOfMeasure[];
}

export const UOMConversionModal: React.FC<UOMConversionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  unitsOfMeasure,
}) => {
  const [fromUnitName, setFromUnitName] = useState('Thùng');
  const [factor, setFactor] = useState<number | string>(10);
  const [toUnitName, setToUnitName] = useState('Cuộn');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  useEffect(() => {
    if (initialData) {
      setFromUnitName(initialData.fromUnitName);
      setFactor(initialData.factor);
      setToUnitName(initialData.toUnitName);
      setNote(initialData.note || '');
      setStatus(initialData.status);
    } else {
      const defaultFrom = unitsOfMeasure[1]?.name || unitsOfMeasure[0]?.name || 'Thùng';
      const defaultTo = unitsOfMeasure[0]?.name || 'Cái';
      setFromUnitName(defaultFrom);
      setFactor(10);
      setToUnitName(defaultTo);
      setNote('');
      setStatus('active');
    }
  }, [initialData, isOpen, unitsOfMeasure]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numFactor = typeof factor === 'number' ? factor : parseFloat(factor) || 1;
    if (numFactor <= 0) return;

    const fromObj = unitsOfMeasure.find((u) => u.name === fromUnitName);
    const toObj = unitsOfMeasure.find((u) => u.name === toUnitName);

    onSave({
      fromUnitName,
      fromUnitId: fromObj?.id,
      factor: numFactor,
      toUnitName,
      toUnitId: toObj?.id,
      note: note.trim() || `1 ${fromUnitName} = ${numFactor} ${toUnitName}`,
      status,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {initialData ? 'Chỉnh Sửa Quy Đổi ĐVT' : 'Thiết Lập Quy Đổi Đơn Vị Tính'}
              </h3>
              <p className="text-xs text-slate-400">Quy tắc: 1 Đơn Vị Tính = Hệ Số x Đơn Vị Tính</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Conversion Formula Input Row */}
          <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-3">
            <label className="block text-xs font-bold text-slate-300">Công thức quy đổi:</label>
            <div className="grid grid-cols-1 sm:grid-cols-11 gap-2 items-center">
              {/* From Unit */}
              <div className="sm:col-span-4">
                <span className="block text-[10px] text-slate-400 mb-1">1 Đơn vị tính:</span>
                <select
                  value={fromUnitName}
                  onChange={(e) => setFromUnitName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-xs focus:border-purple-500 focus:outline-none"
                >
                  {unitsOfMeasure.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name} ({u.symbol || u.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Equal Sign */}
              <div className="sm:col-span-1 text-center font-bold text-slate-500 text-sm">=</div>

              {/* Factor */}
              <div className="sm:col-span-2">
                <span className="block text-[10px] text-slate-400 mb-1">Hệ số:</span>
                <input
                  type="number"
                  required
                  min="0.0001"
                  step="any"
                  value={factor}
                  onChange={(e) => setFactor(e.target.value)}
                  placeholder="10"
                  className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-cyan-400 font-mono font-bold text-xs focus:border-purple-500 focus:outline-none text-center"
                />
              </div>

              {/* To Unit */}
              <div className="sm:col-span-4">
                <span className="block text-[10px] text-slate-400 mb-1">Đơn vị quy đổi sang:</span>
                <select
                  value={toUnitName}
                  onChange={(e) => setToUnitName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-xs focus:border-purple-500 focus:outline-none"
                >
                  {unitsOfMeasure
                    .filter((u) => u.name !== fromUnitName)
                    .map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name} ({u.symbol || u.name})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Live Formula Preview */}
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-center">
              <span className="text-xs text-purple-300 font-mono font-bold">
                1 {fromUnitName} = {Number(factor || 1).toLocaleString('vi-VN')} {toUnitName}
              </span>
            </div>
          </div>

          {/* Note & Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Ghi chú / Mô tả</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: 1 Thùng cáp mạng = 10 Cuộn, 1 Cuộn = 100m..."
              className="w-full px-3 py-2 bg-slate-850 border border-slate-700 rounded-xl text-white text-xs focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Trạng thái</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
              className="w-full px-3 py-2 bg-slate-850 border border-slate-700 rounded-xl text-white text-xs focus:border-purple-500 focus:outline-none"
            >
              <option value="active">Hoạt động (Áp dụng)</option>
              <option value="inactive">Tạm ngưng</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-purple-600/25 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{initialData ? 'Lưu Thay Đổi' : 'Tạo Quy Đổi Mới'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
