import React from 'react';
import {
  LayoutDashboard,
  AlertOctagon,
  MessageSquare,
  Network,
  Activity,
  PlayCircle,
  Radio,
} from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext';

export type TabType =
  | 'dashboard'
  | 'sos'
  | 'messages'
  | 'topology'
  | 'network'
  | 'demo';

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
      badgeColor: 'bg-red-500 text-white animate-pulse',
    },
    {
      id: 'messages' as TabType,
      label: 'Emergency Chat',
      icon: MessageSquare,
      badge: stats.total_messages > 0 ? stats.total_messages : null,
      badgeColor: 'bg-slate-700 text-slate-300',
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
      badgeColor: 'bg-cyan-950 text-cyan-400 border border-cyan-800',
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900/90 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-5">
        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Operations Menu
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`ml-2 px-2 py-0.5 text-[10px] font-bold rounded-full ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Presentation Demo Mode Trigger */}
        <div className="pt-2">
          <button
            onClick={() => onSelectTab('demo')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold border transition ${
              currentTab === 'demo'
                ? 'bg-purple-950/60 text-purple-200 border-purple-500/60 ring-1 ring-purple-500'
                : 'bg-purple-950/20 text-purple-300 border-purple-900/40 hover:bg-purple-950/40'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <PlayCircle className="w-4 h-4 text-purple-400" />
              <span>Demo Simulator</span>
            </div>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-purple-900 text-purple-200 border border-purple-700">
              VIVA
            </span>
          </button>
        </div>

        {/* Live Network Health Micro-Widget */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              UDP Socket
            </span>
            <span className="font-mono text-cyan-400">:{stats.socket_port}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60 text-[11px]">
            <div>
              <span className="text-slate-500">Relayed:</span>{' '}
              <span className="font-mono font-bold text-slate-200">{stats.packets_relayed}</span>
            </div>
            <div>
              <span className="text-slate-500">Duplicates:</span>{' '}
              <span className="font-mono font-bold text-rose-400">{stats.duplicates_dropped}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
        <span>DECS Mesh Layer</span>
        <span className="text-slate-400 font-mono">255.255.255.255</span>
      </div>
    </aside>
  );
};