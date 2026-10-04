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
      {/* Local Host Node Information Card */}
      <div className="p-6 sm:p-7 rounded-[32px] bg-[#eaf1f1] text-slate-900 border border-white/80 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-[#ff4e18] text-white shadow-sm">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black text-slate-900 tracking-wide font-mono">
                  LOCAL NODE DIAGNOSTICS & IDENTITY
                </h2>
                <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono">
                  {selfNodeInfo?.is_socket_bound ? 'ACTIVE / BOUND' : 'RUNNING'}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium font-mono">
                Local Hardware & Networking Socket Parameters
              </p>
            </div>
          </div>

          <button
            onClick={() => triggerPing()}
            className="flex items-center space-x-1.5 px-6 py-2.5 rounded-full bg-[#ff4e18] hover:bg-[#ff6535] text-white text-xs font-bold font-mono shadow-md shadow-[#ff4e18]/40 transition active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Presence Beacon</span>
          </button>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-slate-500 font-bold">Node Identifier:</span>
            <div className="text-sm font-black font-mono text-[#ff4e18] mt-1">{currentNodeId}</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-slate-500 font-bold">Operating Role:</span>
            <div className="text-sm font-black text-slate-900 uppercase mt-1">
              {selfNodeInfo?.role || stats.role || 'RELAY NODE'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-slate-500 font-bold">Local IP / Subnet:</span>
            <div className="text-sm font-mono text-slate-800 font-semibold mt-1">
              {selfNodeInfo?.ip_address || '127.0.0.1'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-slate-500 font-bold">UDP Port:</span>
            <div className="text-sm font-mono text-emerald-700 font-black mt-1">
              :{stats.socket_port || 50005} (Broadcast)
            </div>
          </div>
        </div>

        {/* Counter Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-sm">
            <span className="text-slate-600 font-bold">Packets Sent:</span>
            <span className="font-mono font-black text-[#ff4e18]">{stats.packets_sent}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-sm">
            <span className="text-slate-600 font-bold">Packets Received:</span>
            <span className="font-mono font-black text-emerald-700">{stats.packets_received}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-sm">
            <span className="text-slate-600 font-bold">Packets Relayed:</span>
            <span className="font-mono font-black text-amber-600">{stats.packets_relayed}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-sm">
            <span className="text-slate-600 font-bold">Duplicates Filtered:</span>
            <span className="font-mono font-black text-red-600">{stats.duplicates_dropped}</span>
          </div>
        </div>
      </div>

      {/* Discovered Peer Nodes Table */}
      <div className="rounded-[32px] bg-[#eaf1f1] text-slate-900 border border-white/80 shadow-xl overflow-hidden">
        <div className="px-6 py-4 bg-white/70 border-b border-slate-300/70 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Users className="w-4 h-4 text-[#ff4e18]" />
            <h3 className="text-sm font-black text-slate-900 tracking-wide font-mono">
              Discovered Mesh Peer Nodes ({nodes.length} registered)
            </h3>
          </div>
          <span className="text-xs text-slate-600 font-mono font-bold bg-[#dce5e7] px-3 py-1 rounded-full">
            PEER_PING BEACONS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#dce5e7]/60 text-slate-700 font-bold border-b border-slate-300/70">
              <tr>
                <th className="py-3.5 px-5">Node ID</th>
                <th className="py-3.5 px-5">Callsign / Name</th>
                <th className="py-3.5 px-5">Role</th>
                <th className="py-3.5 px-5">IP Address</th>
                <th className="py-3.5 px-5">Packets Rx</th>
                <th className="py-3.5 px-5">Last Hop Dist</th>
                <th className="py-3.5 px-5">Last Seen</th>
                <th className="py-3.5 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {nodes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-600 font-sans font-medium">
                    No external peer nodes detected on this LAN subnet yet. Launch another DECS instance or run a demo scenario.
                  </td>
                </tr>
              ) : (
                nodes.map((node) => {
                  const isCurrent = node.node_id === currentNodeId;
                  return (
                    <tr key={node.node_id} className="hover:bg-white/60 transition">
                      <td className="py-3 px-5 font-mono font-bold text-[#ff4e18] flex items-center gap-1.5">
                        {node.node_id}
                        {isCurrent && (
                          <span className="text-[9px] bg-black text-white px-2 py-0.2 rounded-full font-bold">
                            YOU
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-5 text-slate-900 font-bold">
                        {node.node_name || '—'}
                      </td>
                      <td className="py-3 px-5 text-slate-700 font-semibold uppercase">
                        {node.role}
                      </td>
                      <td className="py-3 px-5 font-mono text-slate-600">
                        {node.ip_address || 'Subnet'}
                      </td>
                      <td className="py-3 px-5 font-mono text-slate-900 font-black">
                        {node.packets_received || 1}
                      </td>
                      <td className="py-3 px-5 font-mono text-slate-800 font-bold">
                        {node.last_hop_count ? `${node.last_hop_count} hops` : 'Direct'}
                      </td>
                      <td className="py-3 px-5 text-slate-600">
                        {new Date(node.last_seen).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
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
