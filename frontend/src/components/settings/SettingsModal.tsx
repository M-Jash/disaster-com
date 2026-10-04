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
      setNodeName(sessionStorage.getItem('decs_user_name') || selfNodeInfo.node_name || '');
      setRole((sessionStorage.getItem('decs_user_role') as UserRole) || selfNodeInfo.role || 'RESPONDER');
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
      const cleanName = nodeName.trim();
      if (cleanName) {
        sessionStorage.setItem('decs_user_name', cleanName);
      }
      sessionStorage.setItem('decs_user_role', role);

      await updateSettings({
        node_name: cleanName || undefined,
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
      <div className="w-full max-w-xl bg-[#eaf1f1] text-slate-900 border border-white/80 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-white/70 border-b border-slate-300/70 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-full bg-[#ff4e18] text-white">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-wide font-mono">
                DECS NODE CONFIGURATION
              </h2>
              <p className="text-xs text-slate-600 font-mono">
                Identity: <span className="text-[#ff4e18] font-bold">{sessionStorage.getItem('decs_node_id') || selfNodeInfo?.node_id || 'NODE-LOCAL'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white text-slate-600 hover:text-slate-900 border border-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 font-mono">
          {savedSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-100 border border-emerald-300 text-xs text-emerald-900 font-bold flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Configuration successfully saved and applied to networking socket.</span>
            </div>
          )}

          {/* 1. Node Callsign & Identity */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
              Operator Callsign / Display Name
            </label>
            <input
              type="text"
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
              placeholder="e.g. Command Alpha / Rescue Unit 7"
              className="w-full px-5 py-3 rounded-full bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff4e18]"
            />
          </div>

          {/* 2. Operational Role */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
              Operational Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['CIVILIAN', 'RESPONDER', 'RELAY'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2.5 rounded-full text-xs font-bold border transition ${
                    role === r
                      ? 'bg-[#ff4e18] text-white border-transparent shadow'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Automatic Multi-Hop Relay Mode Toggle */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                Multi-Hop Packet Relaying
              </span>
              <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                Automatically decrement TTL and rebroadcast packets when TTL &gt; 1
              </p>
            </div>

            <button
              type="button"
              onClick={() => setRelayEnabled(!relayEnabled)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                relayEnabled ? 'bg-[#ff4e18] justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <span className="bg-white w-4 h-4 rounded-full shadow-md transform"></span>
            </button>
          </div>

          {/* 4. Default TTL / Hop Count */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-slate-900">Default Hop Count (TTL):</span>
              <span className="font-bold text-[#ff4e18]">{defaultHops} Hops</span>
            </div>
            <input
              type="range"
              min={1}
              max={12}
              value={defaultHops}
              onChange={(e) => setDefaultHops(parseInt(e.target.value))}
              className="w-full accent-[#ff4e18]"
            />
          </div>

          {/* 5. Socket Port & Broadcast IP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                UDP Socket Port
              </label>
              <input
                type="number"
                value={udpPort}
                onChange={(e) => setUdpPort(parseInt(e.target.value) || 50005)}
                className="w-full px-4 py-2.5 rounded-full bg-white border border-slate-300 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                Broadcast Target IP
              </label>
              <input
                type="text"
                value={broadcastIp}
                onChange={(e) => setBroadcastIp(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full bg-white border border-slate-300 text-xs text-slate-900"
              />
            </div>
          </div>

          {/* 6. Session Reset Action */}
          <div className="p-5 rounded-3xl bg-red-50 border border-red-200 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-red-900">Reset Local Session History</span>
              <p className="text-[11px] text-red-700 font-sans">Purges messages, duplicate cache, and sniffer logs.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset local message and telemetry database?')) {
                  clearHistory();
                }
              }}
              className="px-4 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold transition"
            >
              Reset Data
            </button>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold transition border border-slate-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-7 py-2.5 rounded-full bg-[#ff4e18] hover:bg-[#ff6535] disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-[#ff4e18]/40 transition active:scale-95"
            >
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
