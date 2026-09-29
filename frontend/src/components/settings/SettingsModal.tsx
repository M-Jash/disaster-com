import React, { useState, useEffect } from 'react';
import { useNetwork } from '../../context/NetworkContext';
import { UserRole } from '../../types';
import {
  Sliders,
  X,
  Radio,
  Shield,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { selfNodeInfo, stats, updateSettings, clearHistory } = useNetwork();

  const [nodeName, setNodeName] = useState<string>('');
  const [role, setRole] = useState<UserRole>('RESPONDER');
  const [relayEnabled, setRelayEnabled] = useState<boolean>(true);
  const [defaultHops, setDefaultHops] = useState<number>(5);
  const [udpPort, setUdpPort] = useState<number>(50005);
  const [broadcastIp, setBroadcastIp] = useState<string>('255.255.255.255');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (selfNodeInfo) {
      setNodeName(selfNodeInfo.node_name || '');
      setRole(selfNodeInfo.role || 'RESPONDER');
      setRelayEnabled(selfNodeInfo.relay_enabled ?? true);
      setDefaultHops(selfNodeInfo.default_hop_count || 5);
      setUdpPort(selfNodeInfo.udp_port || 50005);
      setBroadcastIp(selfNodeInfo.broadcast_ip || '255.255.255.255');
    }
  }, [selfNodeInfo, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings({
        node_name: nodeName.trim() || undefined,
        role,
        relay_enabled: relayEnabled,
        default_hop_count: defaultHops,
        udp_port: Number(udpPort),
        broadcast_ip: broadcastIp.trim() || undefined,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                DECS NODE CONFIGURATION
              </h2>
              <p className="text-xs text-slate-400">
                Identity: <span className="font-mono text-cyan-400 font-bold">{selfNodeInfo?.node_id || 'NODE-LOCAL'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5">
          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Configuration successfully saved and applied to networking socket.</span>
            </div>
          )}

          {/* 1. Node Callsign & Identity */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Node Callsign / Display Name
            </label>
            <input
              type="text"
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
              placeholder="e.g. Command Alpha / Rescue Unit 7"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* 2. Operational Role */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Operational Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['CIVILIAN', 'RESPONDER', 'RELAY'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                    role === r
                      ? 'bg-cyan-600 text-white border-cyan-500 shadow-md ring-1 ring-cyan-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Automatic Multi-Hop Relay Mode Toggle */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wide">
                Multi-Hop Packet Relaying
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Automatically decrement TTL and rebroadcast packets when TTL &gt; 1
              </p>
            </div>

            <button
              type="button"
              onClick={() => setRelayEnabled(!relayEnabled)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                relayEnabled ? 'bg-cyan-600 justify-end' : 'bg-slate-800 justify-start'
              }`}
            >
              <span className="bg-white w-4 h-4 rounded-full shadow-md transform"></span>
            </button>
          </div>

          {/* 4. Default TTL / Hop Count */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Default Hop Count (TTL):</span>
              <span className="font-mono font-bold text-cyan-400">{defaultHops} Hops</span>
            </div>
            <input
              type="range"
              min={1}
              max={12}
              value={defaultHops}
              onChange={(e) => setDefaultHops(parseInt(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>

          {/* 5. Socket Port & Broadcast IP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                UDP Socket Port
              </label>
              <input
                type="number"
                value={udpPort}
                onChange={(e) => setUdpPort(parseInt(e.target.value) || 50005)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Broadcast Target IP
              </label>
              <input
                type="text"
                value={broadcastIp}
                onChange={(e) => setBroadcastIp(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* 6. Dangerous Actions */}
          <div className="p-4 rounded-2xl bg-red-950/20 border border-red-900/40 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-red-300">Reset Local Session History</span>
              <p className="text-[11px] text-red-400/80">Purges messages, duplicate cache, and sniffer logs.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset local message and telemetry database?')) {
                  clearHistory();
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-red-900/40 hover:bg-red-800 text-red-200 border border-red-700/60 font-semibold transition"
            >
              Reset Data
            </button>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-cyan-950 transition"
            >
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
