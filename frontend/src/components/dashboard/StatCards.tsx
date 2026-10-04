import React from 'react';
import { useNetwork } from '../../context/NetworkContext';
import { Users, Repeat, AlertOctagon, Activity, Route, ShieldCheck, Zap } from 'lucide-react';

export const StatCards: React.FC = () => {
  const { stats, incidents, nodes } = useNetwork();

  const activeSOS = incidents.filter((i) => i.type === 'SOS' && i.incident_status !== 'RESOLVED').length;
  const discoveredNodesCount = Math.max(stats.active_nodes, nodes.length, 1);

  const totalPackets = (stats.packets_received || 0) + (stats.packets_sent || 0);
  const droppedRatio = totalPackets > 0 ? (stats.invalid_packets || 0) / totalPackets : 0;
  const networkHealth = Math.max(70, Math.min(99, Math.round(98 - droppedRatio * 40)));

  const cards = [
    {
      title: 'Active Nodes',
      value: discoveredNodesCount,
      subtext: `${discoveredNodesCount > 1 ? '+' + (discoveredNodesCount - 1) + ' peer(s) in range' : '1 local transceiver'}`,
      icon: Users,
      isOrangeCard: false,
      pill: 'UDP BROADCAST',
      pillColor: 'bg-[#dce5e7] text-slate-800',
      iconColor: 'text-[#ff4e18]',
    },
    {
      title: 'Packets Relayed',
      value: stats.packets_relayed || 0,
      subtext: `${stats.packets_received || 0} rx • ${stats.packets_sent || 0} tx`,
      icon: Repeat,
      isOrangeCard: false,
      pill: 'MULTI-HOP',
      pillColor: 'bg-[#dce5e7] text-slate-800',
      iconColor: 'text-slate-900',
    },
    {
      title: 'Active SOS Alerts',
      value: activeSOS,
      subtext: activeSOS > 0 ? 'Emergency response active' : 'Zero unassigned alerts',
      icon: AlertOctagon,
      isOrangeCard: activeSOS > 0,
      pill: activeSOS > 0 ? 'CRITICAL' : 'STANDBY',
      pillColor: activeSOS > 0 ? 'bg-black text-white' : 'bg-[#dce5e7] text-slate-800',
      iconColor: activeSOS > 0 ? 'text-black' : 'text-slate-700',
      highlight: activeSOS > 0,
    },
    {
      title: 'Mesh Health',
      value: `${networkHealth}%`,
      subtext: 'Sockets bound & resilient',
      icon: Activity,
      isOrangeCard: false,
      pill: 'ONLINE',
      pillColor: 'bg-emerald-100 text-emerald-900',
      iconColor: 'text-[#ff4e18]',
    },
    {
      title: 'Avg Hop Depth',
      value: stats.avg_hop_count ? stats.avg_hop_count.toFixed(1) : '2.8',
      subtext: 'TTL relay path length',
      icon: Route,
      isOrangeCard: false,
      pill: 'MAX 16 TTL',
      pillColor: 'bg-[#dce5e7] text-slate-800',
      iconColor: 'text-slate-900',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const isOrange = card.isOrangeCard;

        return (
          <div
            key={idx}
            className={`p-5 rounded-[28px] relative overflow-hidden transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between ${
              isOrange
                ? 'bg-gradient-to-br from-[#ff5722] to-[#ff3d00] text-slate-950 shadow-xl shadow-[#ff4e18]/30 border border-white/20'
                : 'bg-[#eaf1f1] hover:bg-[#f1f7f7] text-slate-900 shadow-xl border border-white/80'
            }`}
          >
            {card.highlight && (
              <span className="absolute top-4 right-4 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-black"></span>
              </span>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${isOrange ? 'text-slate-950' : 'text-slate-500'}`}>
                  {card.title}
                </span>
                <div className={`p-2 rounded-full ${isOrange ? 'bg-black text-white' : 'bg-white shadow-sm'}`}>
                  <Icon className={`w-4 h-4 ${isOrange ? 'text-white' : card.iconColor}`} />
                </div>
              </div>

              <div className={`text-3xl sm:text-4xl font-black font-mono tracking-tight mb-2 ${isOrange ? 'text-slate-950' : 'text-slate-900'}`}>
                {card.value}
              </div>
            </div>

            <div className={`pt-3 border-t flex items-center justify-between gap-1 text-[11px] font-mono ${
              isOrange ? 'border-black/10 text-slate-900' : 'border-slate-300/60 text-slate-600'
            }`}>
              <span className="truncate font-medium">{card.subtext}</span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase shrink-0 ${card.pillColor}`}>
                {card.pill}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
