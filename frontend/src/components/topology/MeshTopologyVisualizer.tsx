import React, { useState } from 'react';
import { useNetwork } from '../../context/NetworkContext';
import {
  Network,
  Send,
  Cpu,
  Users,
  Radio,
  Wifi,
  Shield,
  Activity,
  Zap,
} from 'lucide-react';

export const MeshTopologyVisualizer: React.FC = () => {
  const { nodes, selfNodeInfo, stats, triggerPing } = useNetwork();
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [isPinging, setIsPinging] = useState<boolean>(false);

  const currentNodeId = sessionStorage.getItem('decs_node_id') || selfNodeInfo?.node_id || stats.node_id || 'NODE-LOCAL';
  const currentUserName = sessionStorage.getItem('decs_user_name') || 'Local Transceiver';
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
          node_name: p.node_name || `Peer-${idx + 1}`,
          role: p.role || 'RELAY',
          status: p.status || 'ACTIVE',
          ip_address: p.ip_address || '192.168.1.X',
          packets_received: p.packets_received || 1,
          angle,
          distance: 140,
        };
      })
    : [
        { node_id: 'NODE-EST-01', node_name: 'SAR-Scout-1', role: 'RESPONDER', status: 'ACTIVE', isVirtual: true, ip_address: '192.168.1.101', angle: 0, distance: 135, packets_received: 12 },
        { node_id: 'NODE-EST-02', node_name: 'Medic-Hub', role: 'RESPONDER', status: 'ACTIVE', isVirtual: true, ip_address: '192.168.1.102', angle: Math.PI * 0.4, distance: 145, packets_received: 18 },
        { node_id: 'NODE-EST-03', node_name: 'Hilltop-Tower', role: 'RELAY', status: 'ACTIVE', isVirtual: true, ip_address: '192.168.1.103', angle: Math.PI * 0.8, distance: 130, packets_received: 45 },
        { node_id: 'NODE-EST-04', node_name: 'Shelter-East', role: 'CIVILIAN', status: 'IDLE', isVirtual: true, ip_address: '192.168.1.104', angle: Math.PI * 1.25, distance: 150, packets_received: 6 },
        { node_id: 'NODE-EST-05', node_name: 'Relay-Sector-B', role: 'RELAY', status: 'ACTIVE', isVirtual: true, ip_address: '192.168.1.105', angle: Math.PI * 1.7, distance: 140, packets_received: 31 },
      ];

  const centerX = 250;
  const centerY = 200;

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-6 rounded-[32px] bg-[#eaf1f1] text-slate-900 border border-white/80 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-full bg-[#ff4e18] text-white shadow-sm">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900 tracking-wide font-mono">
                Ad-Hoc Mesh Topology & Radar Scope
              </h2>
              <span className="px-3 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#ff4e18] text-white">
                ACTIVE RADAR
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Live RF signal propagation and peer transceivers discovered over 255.255.255.255 broadcast beacons
            </p>
          </div>
        </div>

        <button
          onClick={handlePing}
          disabled={isPinging}
          className="flex items-center space-x-2 px-6 py-2.5 rounded-full bg-[#ff4e18] hover:bg-[#ff6535] disabled:opacity-50 text-white text-xs font-mono font-bold shadow-md shadow-[#ff4e18]/40 transition active:scale-95"
        >
          <Send className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
          <span>{isPinging ? 'BROADCASTING BEACON...' : 'TRANSMIT BEACON'}</span>
        </button>
      </div>

      {/* Main Radar & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Animated Radar Canvas - Bento Light Radar */}
        <div className="lg:col-span-2 p-6 rounded-[32px] bg-[#eaf1f1] text-slate-900 border border-white/80 shadow-2xl relative overflow-hidden flex items-center justify-center min-h-[420px]">
          {/* Concentric radar rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
            <div className="w-[100px] h-[100px] rounded-full border border-slate-400"></div>
            <div className="w-[200px] h-[200px] rounded-full border border-slate-400 absolute"></div>
            <div className="w-[300px] h-[300px] rounded-full border border-slate-400 absolute"></div>
            <div className="w-[380px] h-[380px] rounded-full border border-dashed border-[#ff4e18]/50 absolute animate-radar"></div>
          </div>

          {/* SVG Canvas for nodes and multi-hop paths */}
          <svg viewBox="0 0 500 400" className="w-full h-full max-w-[500px] max-h-[400px] z-10">
            {/* Multi-Hop Signal Lines & Traveling Pulse Particles */}
            {displayPeers.map((peer, idx) => {
              const x = centerX + Math.cos(peer.angle) * peer.distance;
              const y = centerY + Math.sin(peer.angle) * peer.distance;
              return (
                <g key={`line-${idx}`}>
                  <line x1={centerX} y1={centerY} x2={x} y2={y} stroke="#ff4e18" strokeWidth="1.5" strokeDasharray="5 5" className="opacity-40" />
                  <circle r="4" fill="#ff4e18">
                    <animateMotion path={`M ${centerX} ${centerY} L ${x} ${y}`} dur="2.2s" repeatCount="indefinite" begin={`${idx * 0.35}s`} />
                  </circle>
                </g>
              );
            })}

            {/* Peer Nodes */}
            {displayPeers.map((peer, idx) => {
              const x = centerX + Math.cos(peer.angle) * peer.distance;
              const y = centerY + Math.sin(peer.angle) * peer.distance;
              const isSelected = selectedNode?.node_id === peer.node_id;

              return (
                <g
                  key={`node-${idx}`}
                  className="cursor-pointer transition-transform duration-200 hover:scale-110"
                  onClick={() => setSelectedNode(peer)}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 22 : 18}
                    fill="#ffffff"
                    stroke={isSelected ? '#ff4e18' : '#0f172a'}
                    strokeWidth={isSelected ? 3 : 2}
                  />
                  <text x={x} y={y + 3.5} textAnchor="middle" fill="#0f172a" fontSize="9" fontWeight="bold" fontFamily="monospace">
                    N{idx + 1}
                  </text>
                  <text x={x} y={y + 30} textAnchor="middle" fill="#334155" fontSize="8" fontWeight="bold" fontFamily="monospace">
                    {peer.node_name || peer.node_id}
                  </text>
                </g>
              );
            })}

            {/* Central Local Node */}
            <g
              className="cursor-pointer"
              onClick={() =>
                setSelectedNode({
                  node_id: currentNodeId,
                  node_name: currentUserName,
                  role: sessionStorage.getItem('decs_user_role') || selfNodeInfo?.role || 'RESPONDER',
                  status: 'ACTIVE',
                  isSelf: true,
                  ip_address: selfNodeInfo?.ip_address || '127.0.0.1 (Local)',
                  packets_received: stats.packets_received || 0,
                  packets_sent: stats.packets_sent || 0,
                })
              }
            >
              <circle cx={centerX} cy={centerY} r="32" fill="none" stroke="#ff4e18" strokeWidth="1.5" opacity="0.4">
                <animate attributeName="r" values="26;42;26" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0;0.8" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx={centerX} cy={centerY} r="26" fill="#ff4e18" stroke="#ffffff" strokeWidth="3" />
              <text x={centerX} y={centerY - 2} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="monospace">
                THIS NODE
              </text>
              <text x={centerX} y={centerY + 9} textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold" fontFamily="monospace">
                {currentNodeId}
              </text>
            </g>
          </svg>
        </div>

        {/* Node Telemetry Inspector */}
        <div className="p-6 rounded-[32px] bg-[#eaf1f1] text-slate-900 border border-white/80 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-300/70">
              <Cpu className="w-4 h-4 text-[#ff4e18]" />
              <h3 className="text-xs font-mono font-black text-slate-900 uppercase tracking-wider">
                RF Node Telemetry Inspector
              </h3>
            </div>

            {selectedNode ? (
              <div className="space-y-3 pt-3 animate-fadeIn">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-sm">
                  <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Station Identifier</div>
                  <div className="text-base font-black font-mono text-[#ff4e18]">{selectedNode.node_id}</div>
                  <div className="text-xs text-slate-800 font-bold">{selectedNode.node_name || 'Station Transceiver'}</div>
                  {selectedNode.isSelf && (
                    <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#ff4e18] text-white">
                      CURRENT DEVICE (LOCAL TAB)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-3 rounded-2xl bg-white border border-slate-200">
                    <span className="text-slate-500 text-[10px] font-bold">ROLE:</span>
                    <div className="font-bold text-slate-900 uppercase mt-0.5">{selectedNode.role || 'RELAY'}</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-slate-200">
                    <span className="text-slate-500 text-[10px] font-bold">STATUS:</span>
                    <div className="font-bold text-emerald-700 uppercase mt-0.5">{selectedNode.status || 'ACTIVE'}</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-slate-200 col-span-2">
                    <span className="text-slate-500 text-[10px] font-bold">IP / SUBNET:</span>
                    <div className="font-mono text-slate-800 font-semibold mt-0.5">{selectedNode.ip_address || '192.168.1.X'}</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-slate-200 col-span-2 flex items-center justify-between">
                    <span className="text-slate-500 text-[10px] font-bold">PACKETS ROUTED:</span>
                    <div className="font-black text-[#ff4e18]">{selectedNode.packets_received || 0}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500 space-y-2 font-mono">
                <Cpu className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="font-medium text-slate-600">Click any node in the radar display to inspect its real-time telemetry parameters.</p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-300/70 text-[10px] font-mono text-slate-500 flex items-center justify-between">
            <span>Frequency: 2.4 / 5 GHz UDP</span>
            <span className="text-emerald-700 font-bold">● 100% Ad-Hoc</span>
          </div>
        </div>
      </div>

      {/* Discovered Peer Table */}
      <div className="rounded-[32px] bg-[#eaf1f1] text-slate-900 border border-white/80 shadow-xl overflow-hidden">
        <div className="px-6 py-4 bg-white/60 border-b border-slate-300/70 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Users className="w-4 h-4 text-[#ff4e18]" />
            <h3 className="text-sm font-black text-slate-900 tracking-wide font-mono">
              Mesh Peer Directory & Relay Paths ({nodes.length} registered)
            </h3>
          </div>
          <span className="text-xs text-slate-600 font-mono font-bold bg-[#dce5e7] px-3 py-1 rounded-full">
            UDP :50005
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#dce5e7]/60 text-slate-700 font-bold border-b border-slate-300/70">
              <tr>
                <th className="py-3.5 px-5">Node ID</th>
                <th className="py-3.5 px-5">Callsign</th>
                <th className="py-3.5 px-5">Role</th>
                <th className="py-3.5 px-5">IP Address</th>
                <th className="py-3.5 px-5">Packets Rx</th>
                <th className="py-3.5 px-5">Hop Distance</th>
                <th className="py-3.5 px-5">Last Seen</th>
                <th className="py-3.5 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {nodes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-600 font-sans font-medium">
                    Self-node is actively broadcasting UDP beacons on this subnet. Open another tab or launch node 2 to see instant peer discovery.
                  </td>
                </tr>
              ) : (
                nodes.map((node) => {
                  const isCurrent = node.node_id === currentNodeId;
                  return (
                    <tr key={node.node_id} className="hover:bg-white/60 transition">
                      <td className="py-3 px-5 font-bold text-[#ff4e18] flex items-center gap-1.5">
                        {node.node_id}
                        {isCurrent && (
                          <span className="text-[9px] bg-black text-white px-2 py-0.2 rounded-full font-bold">
                            YOU
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-5 text-slate-900 font-sans font-bold">{node.node_name || '—'}</td>
                      <td className="py-3 px-5 text-slate-700 font-semibold uppercase">{node.role}</td>
                      <td className="py-3 px-5 text-slate-600">{node.ip_address || 'Subnet'}</td>
                      <td className="py-3 px-5 text-slate-900 font-black">{node.packets_received || 1}</td>
                      <td className="py-3 px-5 text-slate-800 font-bold">
                        {node.last_hop_count ? `${node.last_hop_count} hops` : 'Direct'}
                      </td>
                      <td className="py-3 px-5 text-slate-600">{new Date(node.last_seen).toLocaleTimeString()}</td>
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