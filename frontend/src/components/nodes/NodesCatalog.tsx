import React from 'react';
import { useNetwork } from '../../context/NetworkContext';
import {
  Users,
  Shield,
  Radio,
  Cpu,
  Send,
  Clock,
  Activity,
  Server,
  Route,
  CheckCircle2,
} from 'lucide-react';

export const NodesCatalog: React.FC = () => {
  const { nodes, selfNodeInfo, stats, triggerPing, refreshAll } = useNetwork();

  const currentNodeId = selfNodeInfo?.node_id || stats.node_id || 'NODE-LOCAL';

  return (
    <div className="space-y-5">
      {/* Local Host Node Information Card (Section 19) */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  LOCAL NODE DIAGNOSTICS & IDENTITY
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {selfNodeInfo?.is_socket_bound ? 'ACTIVE / BOUND' : 'RUNNING'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Local Hardware & Networking Socket Parameters
              </p>
            </div>
          </div>

          <button
            onClick={() => triggerPing()}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Presence Beacon</span>
          </button>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-500">Node Identifier:</span>
            <div className="text-sm font-bold font-mono text-cyan-400 mt-1">{currentNodeId}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-500">Operating Role:</span>
            <div className="text-sm font-bold text-slate-200 uppercase mt-1">
              {selfNodeInfo?.role || stats.role || 'RELAY NODE'}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-500">Local IP / Subnet:</span>
            <div className="text-sm font-mono text-slate-300 mt-1">
              {selfNodeInfo?.ip_address || '127.0.0.1'}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-500">UDP Port:</span>
            <div className="text-sm font-mono text-emerald-400 mt-1">
              :{stats.socket_port || 50005} (Broadcast)
            </div>
          </div>
        </div>

        {/* Counter Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400">Packets Sent:</span>
            <span className="font-mono font-bold text-cyan-400">{stats.packets_sent}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400">Packets Received:</span>
            <span className="font-mono font-bold text-emerald-400">{stats.packets_received}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400">Packets Relayed:</span>
            <span className="font-mono font-bold text-purple-400">{stats.packets_relayed}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400">Duplicates Filtered:</span>
            <span className="font-mono font-bold text-rose-400">{stats.duplicates_dropped}</span>
          </div>
        </div>
      </div>

      {/* Discovered Peer Nodes Table */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Discovered Mesh Peer Nodes ({nodes.length} registered)
            </h3>
          </div>
          <span className="text-xs text-slate-500">Auto-discovered via PEER_PING beacons</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-5">Node ID</th>
                <th className="py-3 px-5">Callsign / Name</th>
                <th className="py-3 px-5">Role</th>
                <th className="py-3 px-5">IP Address</th>
                <th className="py-3 px-5">Packets Rx</th>
                <th className="py-3 px-5">Last Hop Dist</th>
                <th className="py-3 px-5">Last Seen</th>
                <th className="py-3 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {nodes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-500">
                    No external peer nodes detected on this LAN subnet yet. Launch another DECS instance or run a demo scenario.
                  </td>
                </tr>
              ) : (
                nodes.map((node) => {
                  const isCurrent = node.node_id === currentNodeId;
                  return (
                    <tr key={node.node_id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-5 font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                        {node.node_id}
                        {isCurrent && (
                          <span className="text-[9px] bg-cyan-950 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-800">
                            YOU
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-5 text-slate-200">
                        {node.node_name || '—'}
                      </td>
                      <td className="py-3 px-5 text-slate-300 font-semibold uppercase">
                        {node.role}
                      </td>
                      <td className="py-3 px-5 font-mono text-slate-400">
                        {node.ip_address || 'Subnet'}
                      </td>
                      <td className="py-3 px-5 font-mono text-slate-200">
                        {node.packets_received || 1}
                      </td>
                      <td className="py-3 px-5 font-mono text-purple-400">
                        {node.last_hop_count ? `${node.last_hop_count} hops` : 'Direct'}
                      </td>
                      <td className="py-3 px-5 text-slate-400">
                        {new Date(node.last_seen).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          ACTIVE
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
