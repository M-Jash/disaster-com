import React, { useState } from 'react';
import { useNetwork } from '../../context/NetworkContext';
import {
  Network,
  Send,
  Cpu,
  Users,
} from 'lucide-react';

export const MeshTopologyVisualizer: React.FC = () => {
  const { nodes, selfNodeInfo, stats, triggerPing } = useNetwork();
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [isPinging, setIsPinging] = useState<boolean>(false);

  const currentNodeId = selfNodeInfo?.node_id || stats.node_id || 'NODE-LOCAL';
  const peerNodes = nodes.filter((n) => n.node_id !== currentNodeId);

  const handlePing = async () => {
    setIsPinging(true);
    await triggerPing();
    setTimeout(() => setIsPinging(false), 800);
  };

  const displayPeers = peerNodes.length > 0
    ? peerNodes.map((p, idx) => {
        const total = peerNodes.length;
        const angle = (idx / total) * 2 * Math.PI;
        return {
          node_id: p.node_id,
          role: p.role || 'RELAY',
          status: p.status || 'ACTIVE',
          ip_address: p.ip_address || '192.168.1.X',
          packets_received: p.packets_received,
          angle,
          distance: 140,
        };
      })
    : [
        { node_id: 'NODE-EST-01', role: 'RELAY', status: 'ACTIVE', isVirtual: true, ip_address: '192.168.1.101', angle: 0, distance: 135 },
        { node_id: 'NODE-EST-02', role: 'RESPONDER', status: 'ACTIVE', isVirtual: true, ip_address: '192.168.1.102', angle: Math.PI * 0.4, distance: 145 },
        { node_id: 'NODE-EST-03', role: 'RELAY', status: 'ACTIVE', isVirtual: true, ip_address: '192.168.1.103', angle: Math.PI * 0.8, distance: 130 },
        { node_id: 'NODE-EST-04', role: 'CIVILIAN', status: 'IDLE', isVirtual: true, ip_address: '192.168.1.104', angle: Math.PI * 1.25, distance: 150 },
        { node_id: 'NODE-EST-05', role: 'RELAY', status: 'ACTIVE', isVirtual: true, ip_address: '192.168.1.105', angle: Math.PI * 1.7, distance: 140 },
      ];

  const centerX = 250;
  const centerY = 200;

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              Mesh Network Topology & Peers
            </h2>
            <p className="text-xs text-slate-400">
              Visualizes peer nodes and signal paths discovered via periodic UDP broadcast beacons
            </p>
          </div>
        </div>

        <button
          onClick={handlePing}
          disabled={isPinging}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold shadow transition"
        >
          <Send className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
          <span>{isPinging ? 'Broadcasting...' : 'Broadcast Mesh Beacon'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden flex items-center justify-center min-h-[400px]">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-[120px] h-[120px] rounded-full border border-cyan-500"></div>
            <div className="w-[240px] h-[240px] rounded-full border border-cyan-500 absolute"></div>
            <div className="w-[360px] h-[360px] rounded-full border border-cyan-500 absolute"></div>
          </div>

          <svg viewBox="0 0 500 400" className="w-full h-full max-w-[500px] max-h-[400px] z-10">
            {displayPeers.map((peer, idx) => {
              const x = centerX + Math.cos(peer.angle) * peer.distance;
              const y = centerY + Math.sin(peer.angle) * peer.distance;
              return (
                <g key={`line-${idx}`}>
                  <line x1={centerX} y1={centerY} x2={x} y2={y} stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4 4" className="opacity-70" />
                  <circle r="3" fill="#38bdf8">
                    <animateMotion path={`M ${centerX} ${centerY} L ${x} ${y}`} dur="2.5s" repeatCount="indefinite" begin={`${idx * 0.4}s`} />
                  </circle>
                </g>
              );
            })}

            {displayPeers.map((peer, idx) => {
              const x = centerX + Math.cos(peer.angle) * peer.distance;
              const y = centerY + Math.sin(peer.angle) * peer.distance;
              const isSelected = selectedNode?.node_id === peer.node_id;

              return (
                <g key={`node-${idx}`} className="cursor-pointer transition-transform hover:scale-110" onClick={() => setSelectedNode(peer)}>
                  <circle cx={x} cy={y} r={isSelected ? 20 : 16} fill="#0f172a" stroke={peer.status === 'ACTIVE' ? '#10b981' : '#64748b'} strokeWidth={isSelected ? 3 : 2} />
                  <text x={x} y={y + 3} textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">
                    N{idx + 1}
                  </text>
                  <text x={x} y={y + 26} textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="bold" fontFamily="monospace">
                    {peer.node_id}
                  </text>
                </g>
              );
            })}

            <g
              className="cursor-pointer"
              onClick={() => setSelectedNode({ node_id: currentNodeId, role: selfNodeInfo?.role || 'LOCAL_HOST', status: 'ACTIVE', isSelf: true, ip_address: selfNodeInfo?.ip_address || '127.0.0.1' })}
            >
              <circle cx={centerX} cy={centerY} r="30" fill="none" stroke="#06b6d4" strokeWidth="1.5" opacity="0.6">
                <animate attributeName="r" values="24;38;24" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0;0.8" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx={centerX} cy={centerY} r="24" fill="#082f49" stroke="#06b6d4" strokeWidth="3" />
              <text x={centerX} y={centerY - 2} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                THIS NODE
              </text>
              <text x={centerX} y={centerY + 9} textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="bold" fontFamily="monospace">
                {currentNodeId}
              </text>
            </g>
          </svg>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Node Telemetry Inspector
            </h3>

            {selectedNode ? (
              <div className="space-y-3 animate-fadeIn">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400">Node Identifier</div>
                  <div className="text-base font-bold font-mono text-cyan-400">{selectedNode.node_id}</div>
                  {selectedNode.isSelf && (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                      CURRENT DEVICE
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-500">Role:</span>
                    <div className="font-bold text-slate-200 uppercase mt-0.5">{selectedNode.role || 'RELAY'}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-500">Status:</span>
                    <div className="font-bold text-emerald-400 uppercase mt-0.5">{selectedNode.status || 'ACTIVE'}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 col-span-2">
                    <span className="text-slate-500">IP Address:</span>
                    <div className="font-mono text-slate-300 mt-0.5">{selectedNode.ip_address || 'Local Subnet'}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500 space-y-2">
                <Cpu className="w-8 h-8 text-slate-700 mx-auto" />
                <p>Click any node in the topology diagram to inspect its routing parameters.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Discovered Mesh Peer Directory ({nodes.length} registered)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">UDP Port :{stats.socket_port || 50005}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-5">Node ID</th>
                <th className="py-3 px-5">Callsign</th>
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
                  <td colSpan={8} className="text-center py-8 text-slate-500">
                    No external peer nodes detected on this LAN subnet yet. (Self-node is broadcasting beacons).
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
                      <td className="py-3 px-5 text-slate-200">{node.node_name || '—'}</td>
                      <td className="py-3 px-5 text-slate-300 font-semibold uppercase">{node.role}</td>
                      <td className="py-3 px-5 font-mono text-slate-400">{node.ip_address || 'Subnet'}</td>
                      <td className="py-3 px-5 font-mono text-slate-200">{node.packets_received || 1}</td>
                      <td className="py-3 px-5 font-mono text-purple-400">
                        {node.last_hop_count ? `${node.last_hop_count} hops` : 'Direct'}
                      </td>
                      <td className="py-3 px-5 text-slate-400">{new Date(node.last_seen).toLocaleTimeString()}</td>
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