import React, { useState, useEffect } from 'react';
import { useNetwork } from '../../context/NetworkContext';
import {
  Radio,
  Wifi,
  WifiOff,
  AlertTriangle,
  Volume2,
  VolumeX,
  RefreshCw,
  Sliders,
  Shield,
  Clock,
  Send,
} from 'lucide-react';

interface HeaderProps {
  onOpenSOSModal: () => void;
  onOpenSettingsModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSOSModal, onOpenSettingsModal }) => {
  const { stats, systemStatus, isConnected, isMuted, toggleMute, triggerPing, refreshAll } = useNetwork();
  const [timeStr, setTimeStr] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(' ')[0] + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshAll();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const nodeId = systemStatus?.node_id || stats.node_id || 'NODE-LOCAL';
  const role = systemStatus?.role || stats.role || 'RELAY';
  const isBound = systemStatus?.socket_bound ?? true;

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Branding & Status Badge */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Radio className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isConnected && isBound ? 'bg-emerald-400' : 'bg-rose-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected && isBound ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                DECS <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">MESH v1.0</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Disaster Emergency Communication System (Local UDP Mesh)
            </p>
          </div>
        </div>

        {/* Center: Real-Time Network Health Badges */}
        <div className="flex items-center gap-2 text-xs">
          {/* Internet Status (Honest Offline Status) */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300">
            <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">CELLULAR / WAN:</span>
            <span className="font-semibold text-amber-400">OFFLINE</span>
          </div>

          {/* Local Mesh State */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-800/60 text-emerald-300">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">LOCAL MESH:</span>
            <span className="font-bold text-emerald-400">UDP ACTIVE</span>
          </div>

          {/* Active Node Info */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-950/40 border border-cyan-800/60 text-cyan-300">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>ID: <strong className="font-mono font-bold text-white">{nodeId}</strong></span>
            <span className="text-slate-500">•</span>
            <span className="uppercase text-cyan-400 font-semibold">{role}</span>
          </div>

          {/* Clock */}
          <div className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800/50 border border-slate-700/50 text-slate-400 font-mono">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{timeStr}</span>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Peer Discovery Ping */}
          <button
            onClick={() => triggerPing()}
            title="Broadcast peer discovery beacon"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Send className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Beacon</span>
          </button>

          {/* Audio Toggle */}
          <button
            onClick={toggleMute}
            title={isMuted ? 'Unmute tactical audio' : 'Mute tactical audio'}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Refresh */}
          <button
            onClick={handleManualRefresh}
            title="Refresh network data"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <RefreshCw className={`w-4 h-4 text-slate-400 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettingsModal}
            title="Node Configuration"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <Sliders className="w-4 h-4 text-slate-400" />
          </button>

          {/* CRITICAL SOS BUTTON */}
          <button
            onClick={onOpenSOSModal}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-950/60 border border-red-400/30 transition transform hover:scale-[1.02] active:scale-[0.98] animate-pulse-sos"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>SEND SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
};
