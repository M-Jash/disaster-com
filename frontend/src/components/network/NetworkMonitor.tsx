import React, { useState } from 'react';
import { useNetwork } from '../../context/NetworkContext';
import { TelemetryEvent } from '../../types';
import {
  Activity,
  Radio,
  Repeat,
  ShieldAlert,
  Clock,
  Trash2,
  RefreshCw,
  Eye,
  X,
  Code,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Terminal,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export const NetworkMonitor: React.FC = () => {
  const { stats, events, clearHistory, refreshAll, systemStatus } = useNetwork();
  const [inspectEvent, setInspectEvent] = useState<TelemetryEvent | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredEvents = events.filter((e) => {
    if (filterType === 'ALL') return true;
    return e.event_type === filterType;
  });

  const chartData = [
    { name: 'Sent', count: stats.packets_sent || 0, color: '#ff4e18' },
    { name: 'Received', count: stats.packets_received || 0, color: '#10b981' },
    { name: 'Relayed', count: stats.packets_relayed || 0, color: '#f59e0b' },
    { name: 'Duplicates Dropped', count: stats.duplicates_dropped || 0, color: '#ef4444' },
    { name: 'TTL Expired', count: stats.expired_dropped || 0, color: '#64748b' },
    { name: 'Invalid', count: stats.invalid_packets || 0, color: '#94a3b8' },
  ];

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'SENT':
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-orange-100 text-[#ff4e18] border border-orange-200 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> SENT</span>;
      case 'RECEIVED':
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1"><ArrowDownLeft className="w-3 h-3" /> RX</span>;
      case 'RELAYED':
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1"><Repeat className="w-3 h-3" /> RELAY</span>;
      case 'DROPPED_DUPLICATE':
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-red-100 text-red-800 border border-red-200 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> DUP DROP</span>;
      case 'DROPPED_EXPIRED':
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-slate-200 text-slate-800 border border-slate-300">TTL 0</span>;
      case 'INVALID_PACKET':
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-slate-200 text-slate-800 border border-slate-300">INVALID</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-slate-200 text-slate-800">{type}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Socket Telemetry Banner */}
      <div className="p-6 sm:p-7 rounded-[32px] bg-[#eaf1f1] text-slate-900 border border-white/80 shadow-2xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-[#ff4e18] text-white shadow-sm">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-wide font-mono">
                  UDP SOCKET TELEMETRY & WIRE PACKET SNIFFER
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  PORT {stats.socket_port || 50005} • BOUND
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium font-mono">
                Broadcast Target: <span className="font-mono font-bold text-[#ff4e18]">{stats.broadcast_ip || '255.255.255.255'}</span> • Max Wire Payload: <span className="font-mono font-bold text-slate-900">1024 Bytes</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => refreshAll()}
              className="p-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition active:scale-95 shadow-sm"
              title="Refresh telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => clearHistory()}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-white hover:bg-red-50 text-red-600 border border-slate-200 text-xs font-mono font-bold transition active:scale-95 shadow-sm"
              title="Reset packet logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        </div>

        {/* 6 Core Networking Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">Packets Received</div>
            <div className="text-2xl font-black font-mono text-emerald-700 mt-1">{stats.packets_received}</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">Packets Sent</div>
            <div className="text-2xl font-black font-mono text-[#ff4e18] mt-1">{stats.packets_sent}</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">Packets Relayed</div>
            <div className="text-2xl font-black font-mono text-amber-600 mt-1">{stats.packets_relayed}</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">Duplicates Dropped</div>
            <div className="text-2xl font-black font-mono text-red-600 mt-1">{stats.duplicates_dropped}</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">TTL Expired (0)</div>
            <div className="text-2xl font-black font-mono text-slate-700 mt-1">{stats.expired_dropped}</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">Invalid Packets</div>
            <div className="text-2xl font-black font-mono text-slate-500 mt-1">{stats.invalid_packets}</div>
          </div>
        </div>
      </div>

      {/* Visual Chart of Packet Activity */}
      <div className="p-6 rounded-[32px] bg-[#eaf1f1] text-slate-900 border border-white/80 shadow-xl">
        <h3 className="text-xs font-mono font-black text-slate-800 uppercase tracking-wider mb-4">
          Packet Distribution & Telemetry Summary
        </h3>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontFamily="monospace" />
              <YAxis stroke="#64748b" fontSize={10} fontFamily="monospace" allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '1rem', fontSize: '11px', fontFamily: 'monospace', color: '#0f172a' }}
                itemStyle={{ color: '#0f172a' }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Real-time Packet Sniffer Table */}
      <div className="rounded-[32px] bg-[#eaf1f1] text-slate-900 border border-white/80 shadow-2xl overflow-hidden">
        {/* Table Header Controls */}
        <div className="px-6 py-4 bg-white/70 border-b border-slate-300/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <Activity className="w-4 h-4 text-[#ff4e18]" />
            <h3 className="text-sm font-black text-slate-900 tracking-wide font-mono">
              Live Wire Packet Sniffer Stream ({filteredEvents.length} events captured)
            </h3>
          </div>

          <div className="flex items-center space-x-1 text-xs font-mono">
            {['ALL', 'RECEIVED', 'SENT', 'RELAYED', 'DROPPED_DUPLICATE', 'DROPPED_EXPIRED'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 rounded-full font-bold transition-all ${
                  filterType === t
                    ? 'bg-[#ff4e18] text-white shadow-md shadow-[#ff4e18]/30'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {t.replace('DROPPED_', '')}
              </button>
            ))}
          </div>
        </div>

        {/* Table Rows */}
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#dce5e7]/60 text-slate-700 font-bold border-b border-slate-300/70 sticky top-0 backdrop-blur-md">
              <tr>
                <th className="py-3.5 px-4">Time</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Sender</th>
                <th className="py-3.5 px-4">Message ID</th>
                <th className="py-3.5 px-4">TTL / Hop</th>
                <th className="py-3.5 px-4">Network Event Details</th>
                <th className="py-3.5 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500 font-sans font-medium">
                    No packet events recorded yet. Transmit an emergency message or broadcast an SOS to view wire packets.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt, idx) => (
                  <tr key={idx} className="hover:bg-white/60 transition">
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getEventBadge(evt.event_type)}
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-bold whitespace-nowrap">
                      {evt.sender || '—'}
                    </td>
                    <td className="py-3 px-4 text-[#ff4e18] font-bold whitespace-nowrap truncate max-w-[140px]">
                      {evt.msg_id || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-bold whitespace-nowrap">
                      {evt.hop_count != null ? `${evt.hop_count} hops` : '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-sans truncate max-w-xs">
                      {evt.details || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {evt.raw_payload ? (
                        <button
                          onClick={() => setInspectEvent(evt)}
                          className="p-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 transition shadow-sm"
                          title="Inspect raw JSON packet"
                        >
                          <Code className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw JSON Packet Inspector Modal */}
      {inspectEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 bg-[#eaf1f1] border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-[#ff4e18]" />
                <h3 className="text-sm font-black text-slate-900 font-mono">
                  Raw Wire Packet [{inspectEvent.msg_id}]
                </h3>
              </div>
              <button
                onClick={() => setInspectEvent(null)}
                className="p-1.5 rounded-full bg-white text-slate-600 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 font-mono">
              <div className="text-xs text-slate-600 flex items-center justify-between">
                <span>Event: <strong className="text-slate-900">{inspectEvent.event_type}</strong></span>
                <span>Payload Size: <strong className="text-[#ff4e18]">{inspectEvent.raw_payload?.length || 0} bytes</strong> (Limit: 1024)</span>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-900 text-xs text-emerald-400 whitespace-pre-wrap overflow-x-auto leading-relaxed shadow-inner">
                {(() => {
                  try {
                    return JSON.stringify(JSON.parse(inspectEvent.raw_payload || '{}'), null, 2);
                  } catch {
                    return inspectEvent.raw_payload;
                  }
                })()}
              </pre>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setInspectEvent(null)}
                className="px-6 py-2 rounded-full bg-[#12151b] hover:bg-slate-800 text-xs font-mono text-white font-bold transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
