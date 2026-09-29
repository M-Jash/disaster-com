import React, { useState } from 'react';
import { MessageItem, IncidentStatus } from '../../types';
import { useNetwork } from '../../context/NetworkContext';
import {
  X,
  AlertOctagon,
  MapPin,
  Clock,
  Route,
  Shield,
  CheckCircle2,
  AlertTriangle,
  ArrowDown,
  Navigation,
} from 'lucide-react';

interface IncidentDetailModalProps {
  incident: MessageItem | null;
  onClose: () => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({ incident, onClose }) => {
  const { updateIncidentStatus, selfNodeInfo } = useNetwork();
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  if (!incident) return null;

  const handleStatusChange = async (newStatus: IncidentStatus) => {
    setIsUpdating(true);
    try {
      await updateIncidentStatus(incident.msg_id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const statusOptions: { id: IncidentStatus; label: string; color: string }[] = [
    { id: 'NEW', label: 'New', color: 'bg-red-950 text-red-400 border-red-800' },
    { id: 'ACKNOWLEDGED', label: 'Acknowledged', color: 'bg-amber-950 text-amber-400 border-amber-800' },
    { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-cyan-950 text-cyan-400 border-cyan-800' },
    { id: 'RESOLVED', label: 'Resolved', color: 'bg-emerald-950 text-emerald-400 border-emerald-800' },
  ];

  const relayPath = incident.relay_path || [incident.sender];
  const currentNodeId = selfNodeInfo?.node_id || 'CURRENT_NODE';

  // Construct full visualized hop sequence
  const fullPath = [...relayPath];
  if (!fullPath.includes(currentNodeId)) {
    fullPath.push(currentNodeId);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/40">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white font-mono">{incident.msg_id}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-400 border border-red-800">
                  {incident.priority}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Category: <strong className="text-white">{incident.category}</strong> • Origin: <span className="font-mono text-cyan-400">{incident.sender}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status Bar / Workflow */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Responder Triage Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {statusOptions.map((opt) => {
                const isActive = incident.incident_status === opt.id;
                return (
                  <button
                    key={opt.id}
                    disabled={isUpdating}
                    onClick={() => handleStatusChange(opt.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition text-center ${
                      isActive
                        ? `${opt.color} shadow-md scale-[1.02] ring-1 ring-cyan-400`
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Original Emergency Message Text */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Emergency Message Content
            </label>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-sm text-slate-100 leading-relaxed font-sans">
              "{incident.text}"
            </div>
          </div>

          {/* Location & Coordinates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-semibold">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Location Landmark</span>
              </div>
              <div className="text-sm font-medium text-white">
                {incident.location_desc || 'No manual description provided'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-semibold">
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span>GPS Coordinates</span>
              </div>
              <div className="text-sm font-mono text-emerald-300">
                {incident.latitude != null && incident.longitude != null
                  ? `${incident.latitude.toFixed(5)}, ${incident.longitude.toFixed(5)}`
                  : 'GPS Unavailable (Offline/Manual)'}
              </div>
            </div>
          </div>

          {/* Computer Networks Multi-Hop Relay Path Visualizer */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-950/60 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Route className="w-4 h-4" />
                Multi-Hop Packet Relay Path
              </label>
              <span className="text-xs text-slate-400 font-mono">
                {incident.hop_count} hops remaining (Initial: {incident.initial_hops || 5})
              </span>
            </div>

            {/* Vertical Chain Diagram */}
            <div className="flex flex-col items-center space-y-1.5 py-2">
              {fullPath.map((nodeId, idx) => {
                const isOrigin = idx === 0;
                const isCurrent = idx === fullPath.length - 1;
                return (
                  <React.Fragment key={idx}>
                    <div
                      className={`w-full max-w-md px-4 py-2 rounded-xl text-xs font-mono flex items-center justify-between border ${
                        isOrigin
                          ? 'bg-red-950/40 text-red-300 border-red-800/60'
                          : isCurrent
                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                          : 'bg-cyan-950/30 text-cyan-300 border-cyan-800/50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-300">
                          {idx + 1}
                        </span>
                        <span className="font-bold">{nodeId}</span>
                      </div>
                      <span className="text-[11px] uppercase tracking-wider font-semibold">
                        {isOrigin ? 'ORIGIN' : isCurrent ? 'LOCAL RECEIVER' : 'MESH RELAY'}
                      </span>
                    </div>

                    {idx < fullPath.length - 1 && (
                      <ArrowDown className="w-4 h-4 text-slate-600 animate-bounce" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Received at: {new Date(incident.timestamp).toLocaleString()}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
