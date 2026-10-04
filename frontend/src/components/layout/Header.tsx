import React, { useState, useEffect } from 'react';
import { useNetwork } from '../../context/NetworkContext';
import {
  Radio,
  Wifi,
  WifiOff,
  AlertTriangle,
  Sliders,
  Shield,
  Clock,
  User,
  LogOut,
  Activity,
  Zap,
} from 'lucide-react';

interface HeaderProps {
  onOpenSOSModal: () => void;
  onOpenSettingsModal: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSOSModal, onOpenSettingsModal, onLogout }) => {
  const { stats, systemStatus, isConnected } = useNetwork();
  const [timeStr, setTimeStr] = useState<string>('');

  const userName = sessionStorage.getItem('decs_user_name') || 'Operator';
  const tabNodeId = sessionStorage.getItem('decs_node_id') || systemStatus?.node_id || stats.node_id || 'NODE-LOCAL';
  const userRole = (sessionStorage.getItem('decs_user_role') || systemStatus?.role || stats.role || 'RESPONDER').toUpperCase();
  const isBound = systemStatus?.socket_bound ?? true;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(' ')[0] + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-[#0a0e17]/90 backdrop-blur-xl border-b border-white/[0.08] px-4 py-2.5 shadow-2xl shadow-black/50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Branding & Status Badge */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-600/10 border border-orange-500/40 text-orange-400 shadow-md shadow-orange-950/40">
            <Radio className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isConnected && isBound ? 'bg-emerald-400' : 'bg-rose-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected && isBound ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5 font-mono">
                DECS <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 font-mono">UDP MESH</span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block font-mono">
              Disaster Emergency Communication System • Port 50005
            </p>
          </div>
        </div>

        {/* Center: Real-Time Network Health Badges & Operator Callsign */}
        <div className="flex items-center gap-2 text-xs">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121826] border border-white/[0.08] text-slate-300 shadow-inner">
            <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-mono font-semibold text-amber-400">WAN OFFLINE</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 shadow-inner">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-mono font-bold text-emerald-400">MESH ACTIVE</span>
          </div>

          {/* User & Node Identity Badge */}
          <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#121826] border border-orange-500/30 text-slate-200 shadow-md shadow-black/40">
            <User className="w-3.5 h-3.5 text-orange-400" />
            <span className="font-bold text-white font-mono text-xs">{userName}</span>
            <span className="text-slate-600 font-mono">•</span>
            <span className="font-mono text-amber-400 font-bold text-xs">{tabNodeId}</span>
            <span className="text-slate-600 font-mono">•</span>
            <span className={`text-[9px] font-mono uppercase px-2 py-0.2 rounded-full font-bold ${
              userRole === 'RESPONDER' ? 'bg-orange-950 text-orange-300 border border-orange-700' :
              userRole === 'CIVILIAN' ? 'bg-slate-800 text-slate-300 border border-slate-700' :
              'bg-emerald-950 text-emerald-300 border border-emerald-700'
            }`}>
              {userRole}
            </span>
          </div>

          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121826]/70 border border-white/[0.08] text-slate-400 font-mono text-xs">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{timeStr}</span>
          </div>
        </div>

        {/* Right: Clean Action Controls (Settings, Logout, SOS) */}
        <div className="flex items-center space-x-2">
          {onLogout && (
            <button
              onClick={onLogout}
              title="Switch Station / Operator"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#121826] hover:bg-[#1a2236] text-slate-300 border border-white/[0.08] transition text-xs font-mono active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Switch</span>
            </button>
          )}

          <button
            onClick={onOpenSettingsModal}
            title="Node Configuration"
            className="p-2 rounded-full bg-[#121826] hover:bg-[#1a2236] text-slate-300 border border-white/[0.08] transition active:scale-95"
          >
            <Sliders className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={onOpenSOSModal}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-400 text-white font-bold text-xs shadow-[0_0_20px_rgba(249,115,22,0.4)] border border-orange-400/40 transition transform hover:scale-[1.03] active:scale-[0.98] font-mono tracking-wider animate-pulse-sos"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>SEND SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
};