import React from "react";
import { User, Shield, Sparkles } from "lucide-react";
import { Persona, PERSONAS } from "../../types/projects.types";
import { UserProfile } from "../../../../core/contexts/AuthContext";

interface ProjectPersonaBarProps {
  currentPersona: Persona;
  authUser?: UserProfile | null;
  onSelectPersona: (persona: Persona) => void;
}

export const ProjectPersonaBar: React.FC<ProjectPersonaBarProps> = ({
  currentPersona,
  authUser,
  onSelectPersona,
}) => {
  return (
    <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Left: Real User from DB & Current Role context */}
      <div className="flex items-center space-x-3 flex-wrap gap-y-1">
        {authUser && (
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs">
            <User className="w-3.5 h-3.5 text-blue-600" />
            <span>Tài khoản DB:</span>
            <b className="text-slate-900">{authUser.fullName || authUser.username}</b>
            <span className="text-[10px] text-slate-400">({authUser.role})</span>
          </div>
        )}

        <div className="flex items-center space-x-1.5">
          <Shield className="w-3.5 h-3.5 text-purple-600" />
          <span className="font-medium text-slate-500">Phân quyền thi công đang kích hoạt:</span>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${currentPersona.badgeColor}`}>
            {currentPersona.title} • {currentPersona.name} ({currentPersona.employeeId})
          </span>
        </div>
      </div>

      {/* Right: Switch between Real Database Accounts / Personas */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5">
        <span className="text-[11px] text-slate-400 font-semibold mr-1 shrink-0 flex items-center">
          <Sparkles className="w-3 h-3 text-amber-500 mr-1" />
          Kiểm thử theo nhân sự DB:
        </span>
        {PERSONAS.map((p) => {
          const isSelected = currentPersona.id === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelectPersona(p)}
              title={`${p.name} - ${p.role} (Mã NV: ${p.employeeId} | Username DB: ${p.username || "n/a"})`}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
                isSelected
                  ? "bg-slate-900 text-white shadow-xs ring-2 ring-slate-400/30"
                  : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
              }`}
            >
              <span>{p.avatar}</span>
              <span>
                Cấp {p.level}: {p.name.split(" ").slice(-1)[0]}
              </span>
              <span className={`text-[10px] font-mono font-medium ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                ({p.employeeId})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
