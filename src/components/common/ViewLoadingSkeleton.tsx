import React from 'react';
import { Loader2 } from 'lucide-react';

interface ViewLoadingSkeletonProps {
  title?: string;
}

export const ViewLoadingSkeleton: React.FC<ViewLoadingSkeletonProps> = ({ title = 'Đang tải phân hệ...' }) => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 bg-slate-950/80 backdrop-blur-sm text-slate-100">
      <div className="relative flex items-center justify-center">
        {/* Glow Ring */}
        <div className="absolute w-24 h-24 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
        
        {/* Animated Spinner */}
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700/60 shadow-2xl flex items-center justify-center relative">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </div>

      <h4 className="mt-5 text-sm font-bold text-white tracking-wide flex items-center space-x-2">
        <span>{title}</span>
      </h4>
      <p className="text-xs text-slate-400 mt-1">Hệ thống đang chuẩn bị dữ liệu và giao diện tối ưu...</p>

      {/* Shimmer skeleton lines */}
      <div className="w-full max-w-md mt-6 space-y-3">
        <div className="h-2.5 bg-slate-800/80 rounded-full overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
        </div>
        <div className="h-2.5 bg-slate-800/50 rounded-full w-4/5 mx-auto overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
        </div>
      </div>
    </div>
  );
};
