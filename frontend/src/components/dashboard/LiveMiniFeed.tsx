import React from 'react';
import { useNetwork } from '../../context/NetworkContext';
import { MessageItem } from '../../types';
import { AlertOctagon, MessageSquare, Route, Clock, ChevronRight } from 'lucide-react';

interface LiveMiniFeedProps {
  onSelectIncident?: (incident: MessageItem) => void;
  onNavigateTab: (tab: any) => void;
}

export const LiveMiniFeed: React.FC<LiveMiniFeedProps> = ({ onSelectIncident, onNavigateTab }) => {
  const { incidents, messages } = useNetwork();

  // Combine latest incidents and messages, sorted by timestamp descending
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
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-400 border border-red-800">CRITICAL SOS</span>;
    }
    switch (priority) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-400 border border-red-800">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">HIGH</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">NORMAL</span>;
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            <h3 className="text-sm font-bold text-white tracking-wide">Live Mesh Activity Feed</h3>
          </div>
          <button
            onClick={() => onNavigateTab('incidents' as any)}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center font-medium"
          >
            View All <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        {combinedItems.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 space-y-1">
            <p>No network packets received yet.</p>
            <p className="text-[11px] text-slate-600">Send an emergency message or run the Demo simulation.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {combinedItems.map((item) => {
              const isSOS = item.type === 'SOS';
              return (
                <div
                  key={item.msg_id}
                  onClick={() => onSelectIncident && isSOS && onSelectIncident(item)}
                  className={`p-2.5 rounded-xl border transition cursor-pointer ${
                    isSOS
                      ? 'bg-red-950/20 border-red-900/40 hover:border-red-600/50'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center space-x-1.5">
                      {isSOS ? (
                        <AlertOctagon className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      ) : (
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      {getPriorityBadge(item.priority, item.type)}
                      <span className="font-mono text-slate-300 font-semibold">{item.sender}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1 text-cyan-400">
                        <Route className="w-3 h-3" />
                        {item.hop_count} hops left
                      </span>
                      <span className="flex items-center gap-0.5 text-slate-500">
                        <Clock className="w-3 h-3" />
                        {formatTime(item.timestamp)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                    {item.text}
                  </p>

                  {item.location_desc && (
                    <div className="mt-1 text-[11px] text-slate-400 truncate">
                      📍 {item.location_desc}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-3 mt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
        <span>UDP Broadcast Protocol</span>
        <span>Auto-synced via WebSockets</span>
      </div>
    </div>
  );
};
