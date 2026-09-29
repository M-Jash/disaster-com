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
    { name: 'Sent', count: stats.packets_sent || 0, color: '#06b6d4' },
    { name: 'Received', count: stats.packets_received || 0, color: '#10b981' },
    { name: 'Relayed', count: stats.packets_relayed || 0, color: '#8b5cf6' },
    { name: 'Duplicates Dropped', count: stats.duplicates_dropped || 0, color: '#f43f5e' },
    { name: 'TTL Expired', count: stats.expired_dropped || 0, color: '#f59e0b' },
    { name: 'Invalid', count: stats.invalid_packets || 0, color: '#64748b' },
  ];

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'SENT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> SENT</span>;
      case 'RECEIVED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1"><ArrowDownLeft className="w-3 h-3" /> RECEIVED</span>;
      case 'RELAYED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-400 border border-purple-800 flex items-center gap-1"><Repeat className="w-3 h-3" /> RELAYED</span>;
      case 'DROPPED_DUPLICATE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> DUP DROPPED</span>;
      case 'DROPPED_EXPIRED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">TTL EXPIRED</span>;
      case 'INVALID_PACKET':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">INVALID</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">{type}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Socket Telemetry Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  UDP SOCKET TELEMETRY & PACKET ENGINE
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  PORT {stats.socket_port || 50005} • LISTENING
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Broadcast Target: <span className="font-mono text-cyan-400">{stats.broadcast_ip || '255.255.255.255'}</span> • Max Payload: <span className="font-mono text-cyan-400">1024 Bytes</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => refreshAll()}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Refresh telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => clearHistory()}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-red-950/60 hover:text-red-300 text-slate-400 border border-slate-700 text-xs font-semibold transition"
              title="Reset packet logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        </div>

        {/* 6 Core Networking Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Packets Received</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{stats.packets_received}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Packets Sent</div>
            <div className="text-xl font-bold font-mono text-cyan-400 mt-1">{stats.packets_sent}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Packets Relayed</div>
            <div className="text-xl font-bold font-mono text-purple-400 mt-1">{stats.packets_relayed}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Duplicates Dropped</div>
            <div className="text-xl font-bold font-mono text-rose-400 mt-1">{stats.duplicates_dropped}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">TTL Expired (0)</div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1">{stats.expired_dropped}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Invalid Packets</div>
            <div className="text-xl font-bold font-mono text-slate-400 mt-1">{stats.invalid_packets}</div>
          </div>
        </div>
      </div>

      {/* Visual Chart of Packet Activity */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Packet Distribution & Telemetry Summary
        </h3>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                itemStyle={{ color: '#f1f5f9' }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Real-time Packet Sniffer Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        {/* Table Header Controls */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Live Wire Packet Sniffer Stream ({filteredEvents.length} events)
            </h3>
          </div>

          <div className="flex items-center space-x-1.5 text-xs">
            {['ALL', 'RECEIVED', 'SENT', 'RELAYED', 'DROPPED_DUPLICATE', 'DROPPED_EXPIRED'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  filterType === t
                    ? 'bg-cyan-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {t.replace('DROPPED_', '')}
              </button>
            ))}
          </div>
        </div>

        {/* Table Rows */}
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800 sticky top-0 backdrop-blur-md">
              <tr>
                <th className="py-2.5 px-4">Time</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Sender</th>
                <th className="py-2.5 px-4">Message ID</th>
                <th className="py-2.5 px-4">TTL / Hop</th>
                <th className="py-2.5 px-4">Network Event Details</th>
                <th className="py-2.5 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500 font-sans">
                    No packet events recorded yet. Transmit a message or run a demo scenario to see live packet capture.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      {getEventBadge(evt.event_type)}
                    </td>
                    <td className="py-2.5 px-4 text-slate-200 font-bold whitespace-nowrap">
                      {evt.sender || '—'}
                    </td>
                    <td className="py-2.5 px-4 text-cyan-400 whitespace-nowrap truncate max-w-[140px]">
                      {evt.msg_id || '—'}
                    </td>
                    <td className="py-2.5 px-4 text-purple-400 font-bold whitespace-nowrap">
                      {evt.hop_count != null ? `${evt.hop_count} hops` : '—'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-300 font-sans truncate max-w-xs">
                      {evt.details || '—'}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {evt.raw_payload ? (
                        <button
                          onClick={() => setInspectEvent(evt)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 transition"
                          title="Inspect raw JSON packet"
                        >
                          <Code className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-slate-600">—</span>
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
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono">
                  Raw Wire Packet [{inspectEvent.msg_id}]
                </h3>
              </div>
              <button
                onClick={() => setInspectEvent(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Event: <strong>{inspectEvent.event_type}</strong></span>
                <span>Payload Size: <strong>{inspectEvent.raw_payload?.length || 0} bytes (Limit: 1024)</strong></span>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                {(() => {
                  try {
                    return JSON.stringify(JSON.parse(inspectEvent.raw_payload || '{}'), null, 2);
                  } catch {
                    return inspectEvent.raw_payload;
                  }
                })()}
              </pre>
            </div>

            <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 text-right">
              <button
                onClick={() => setInspectEvent(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
