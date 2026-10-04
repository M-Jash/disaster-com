import React from 'react';
import {
  LayoutDashboard,
  AlertOctagon,
  MessageSquare,
  Network,
  Activity,
  PlayCircle,
  Radio,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext';

export type TabType =
  | 'dashboard'
  | 'sos'
  | 'messages'
  | 'topology'
  | 'network'
  | 'demo'
  | 'settings';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { stats, incidents } = useNetwork();
  const activeSOSCount = incidents.filter((i) => i.type === 'SOS' && i.incident_status !== 'RESOLVED').length;

  const navItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Command Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'sos' as TabType,
      label: 'Emergency Incidents',
      icon: AlertOctagon,
      badge: activeSOSCount > 0 ? activeSOSCount : null,
      badgeColor: 'bg-orange-500 text-white animate-pulse',
    },
    {
      id: 'messages' as TabType,
      label: 'Emergency Chat',
      icon: MessageSquare,
      badge: stats.total_messages > 0 ? stats.total_messages : null,
      badgeColor: 'bg-[#1a2236] text-slate-300 border border-white/[0.08]',
    },
    {
      id: 'topology' as TabType,
      label: 'Mesh Topology & Peers',
      icon: Network,
      badge: stats.active_nodes > 1 ? `${stats.active_nodes} Nodes` : null,
      badgeColor: 'bg-emerald-950 text-emerald-400 border border-emerald-800',
    },
    {
      id: 'network' as TabType,
      label: 'Packet Sniffer',
      icon: Activity,
      badge: stats.packets_received > 0 ? stats.packets_received : null,
      badgeColor: 'bg-orange-950 text-orange-400 border border-orange-800',
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-[#0d121f]/95 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-4 flex flex-col justify-between shrink-0 shadow-2xl shadow-black/50">
      <div className="space-y-5">
        <div>
          <p className="px-3 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            Operations Menu
          </p>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-mono font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-orange-500/15 text-orange-300 border border-orange-500/40 shadow-lg shadow-orange-950/40 ring-1 ring-orange-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#141a29] border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-orange-400' : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`ml-2 px-2 py-0.5 text-[9px] font-mono font-bold rounded-full ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Presentation Demo Mode Trigger */}
        <div className="pt-2 border-t border-white/[0.08]">
          <p className="px-3 text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Classroom Mode</span>
          </p>
          <button
            onClick={() => onSelectTab('demo')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-mono font-bold border transition-all duration-200 ${
              currentTab === 'demo'
                ? 'bg-amber-950/70 text-amber-200 border-amber-500 shadow-lg shadow-amber-950/50 ring-1 ring-amber-500/30'
                : 'bg-amber-950/20 text-amber-300 border-amber-900/40 hover:bg-amber-950/40'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <PlayCircle className="w-4 h-4 text-amber-400" />
              <span>Demo Simulator</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-900 text-amber-200 border border-amber-700">
              VIVA
            </span>
          </button>
        </div>

        {/* Live Network Health Micro-Widget */}
        <div className="p-4 rounded-2xl bg-[#080d17] border border-white/[0.06] shadow-inner text-xs font-mono space-y-2.5">
          <div className="flex items-center justify-between text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Radio className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
              UDP Socket
            </span>
            <span className="text-orange-400 font-bold">:{stats.socket_port || 50005}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06] text-[10px]">
            <div>
              <span className="text-slate-500">Relayed:</span>{' '}
              <span className="font-bold text-slate-200">{stats.packets_relayed || 0}</span>
            </div>
            <div>
              <span className="text-slate-500">Duplicates:</span>{' '}
              <span className="font-bold text-orange-400">{stats.duplicates_dropped || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-white/[0.08] text-[10px] font-mono text-slate-500 flex items-center justify-between">
        <span>Broadcast IP</span>
        <span className="text-orange-400 font-bold">255.255.255.255</span>
      </div>
    </aside>
  );
};