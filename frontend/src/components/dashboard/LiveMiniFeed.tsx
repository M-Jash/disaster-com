import React from 'react';
import { useNetwork } from '../../context/NetworkContext';
import { MessageItem } from '../../types';
import { AlertOctagon, MessageSquare, Route, Clock, ChevronRight, Radio } from 'lucide-react';

interface LiveMiniFeedProps {
  onSelectIncident?: (incident: MessageItem) => void;
  onNavigateTab: (tab: any) => void;
}

export const LiveMiniFeed: React.FC<LiveMiniFeedProps> = ({ onSelectIncident, onNavigateTab }) => {
  const { incidents, messages } = useNetwork();

  const combinedItems = [...incidents, ...messages]
    .filter((item, index, self) => index === self.findIndex((t) => t.msg_id === item.msg_id))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6);

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return ts;
    }
  };

  const getPriorityBadge = (priority: string, type: string) => {
    if (type === 'SOS') {
      return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#ff4e18] text-white">CRITICAL SOS</span>;
    }
    switch (priority) {
      case 'CRITICAL':
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-red-100 text-red-900 border border-red-200">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-orange-100 text-orange-900 border border-orange-200">HIGH</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-semibold bg-[#dce5e7] text-slate-800">NORMAL</span>;
    }
  };

  return (
    <div className="p-6 rounded-[32px] bg-[#eaf1f1] text-slate-900 border border-white/80 shadow-xl flex flex-col justify-between h-full space-y-4">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-300/70">
          <div className="flex items-center space-x-2.5">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </div>
            <h3 className="text-sm font-black text-slate-900 tracking-wide font-mono">Live Mesh Telemetry Stream</h3>
          </div>
          <button
            onClick={() => onNavigateTab('sos')}
            className="text-xs text-[#ff4e18] hover:text-[#ff3800] flex items-center font-mono font-bold transition"
          >
            All Incidents <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        {combinedItems.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 space-y-2">
            <Radio className="w-8 h-8 text-slate-400 mx-auto animate-pulse" />
            <p className="font-mono font-semibold text-slate-600">Listening for incoming UDP packets...</p>
            <p className="text-[11px] text-slate-500">Send an emergency message or run the Demo simulation.</p>
          </div>
        ) : (
          <div className="space-y-2.5 pt-3">
            {combinedItems.map((item) => {
              const isSOS = item.type === 'SOS';
              return (
                <div
                  key={item.msg_id}
                  onClick={() => onSelectIncident && isSOS && onSelectIncident(item)}
                  className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isSOS
                      ? 'bg-white border-orange-200 hover:border-[#ff4e18] shadow-sm'
                      : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center space-x-1.5 truncate">
                      {isSOS ? (
                        <AlertOctagon className="w-3.5 h-3.5 text-[#ff4e18] shrink-0 animate-pulse" />
                      ) : (
                        <MessageSquare className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                      )}
                      {getPriorityBadge(item.priority, item.type)}
                      <span className="font-mono text-slate-900 font-bold truncate">
                        {item.sender_name || item.sender}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono shrink-0">
                      <span className="flex items-center gap-1 text-[#ff4e18] font-bold">
                        <Route className="w-3 h-3" />
                        {item.hop_count} hops
                      </span>
                      <span className="flex items-center gap-0.5 text-slate-400">
                        <Clock className="w-3 h-3" />
                        {formatTime(item.timestamp)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-800 line-clamp-2 leading-relaxed font-sans font-medium">
                    {item.text}
                  </p>

                  {item.location_desc && (
                    <div className="mt-2 text-[10px] text-slate-600 font-mono truncate flex items-center gap-1 bg-[#dce5e7] px-2.5 py-0.5 rounded-full inline-flex">
                      <span>📍</span>
                      <span>{item.location_desc}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-300/70 text-[10px] font-mono text-slate-500 flex items-center justify-between">
        <span>UDP 50005 Broadcast Mesh</span>
        <span className="text-emerald-700 font-bold">● Live WebSocket Connected</span>
      </div>
    </div>
  );
};
