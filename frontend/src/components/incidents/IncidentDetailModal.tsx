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
    { id: 'NEW', label: 'New', color: 'bg-[#ff4e18] text-white' },
    { id: 'ACKNOWLEDGED', label: 'Acknowledged', color: 'bg-amber-100 text-amber-900 border border-amber-300' },
    { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 text-blue-900 border border-blue-300' },
    { id: 'RESOLVED', label: 'Resolved', color: 'bg-emerald-100 text-emerald-900 border border-emerald-300' },
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
      <div className="w-full max-w-2xl bg-[#eaf1f1] text-slate-900 border border-white/80 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-white/70 border-b border-slate-300/70 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-full bg-[#ff4e18] text-white">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black text-slate-900 font-mono">{incident.msg_id}</h2>
                <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-[#ff4e18] text-white">
                  {incident.priority}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-mono">
                Category: <strong className="text-slate-900">{incident.category}</strong> • Origin: <span className="font-mono text-[#ff4e18] font-bold">{incident.sender}</span>
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status Bar / Workflow */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <label className="block text-xs font-mono font-black text-slate-800 uppercase tracking-wider mb-2">
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
                    className={`py-2 px-3 rounded-full text-xs font-mono font-bold border transition text-center ${
                      isActive
                        ? `${opt.color} shadow-md scale-[1.02] ring-2 ring-[#ff4e18]/40`
                        : 'bg-[#eaf1f1] text-slate-700 border-slate-200 hover:border-slate-300'
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
            <label className="block text-xs font-mono font-black text-slate-800 uppercase tracking-wider">
              Emergency Message Content
            </label>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 leading-relaxed font-sans font-medium shadow-sm">
              "{incident.text}"
            </div>
          </div>

          {/* Location & Coordinates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-sm">
              <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-bold">
                <MapPin className="w-4 h-4 text-[#ff4e18]" />
                <span>Location Landmark</span>
              </div>
              <div className="text-sm font-bold text-slate-900 font-sans">
                {incident.location_desc || 'No manual description provided'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-sm">
              <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-bold">
                <Navigation className="w-4 h-4 text-emerald-600" />
                <span>GPS Coordinates</span>
              </div>
              <div className="text-sm font-mono text-emerald-800 font-bold">
                {incident.latitude != null && incident.longitude != null
                  ? `${incident.latitude.toFixed(5)}, ${incident.longitude.toFixed(5)}`
                  : 'GPS Unavailable (Offline/Manual)'}
              </div>
            </div>
          </div>

          {/* Computer Networks Multi-Hop Relay Path Visualizer */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 space-y-3 font-mono shadow-sm">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-[#ff4e18] uppercase tracking-wider flex items-center gap-1.5">
                <Route className="w-4 h-4" />
                Multi-Hop Packet Relay Path
              </label>
              <span className="text-xs text-slate-500 font-mono font-bold">
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
                      className={`w-full max-w-md px-4 py-2.5 rounded-2xl text-xs font-mono flex items-center justify-between border ${
                        isOrigin
                          ? 'bg-[#ff4e18] text-white border-transparent'
                          : isCurrent
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                          : 'bg-[#eaf1f1] text-slate-800 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isOrigin ? 'bg-black text-white' : 'bg-white text-slate-800'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="font-bold">{nodeId}</span>
                      </div>
                      <span className="text-[11px] uppercase tracking-wider font-semibold">
                        {isOrigin ? 'ORIGIN' : isCurrent ? 'LOCAL RECEIVER' : 'MESH RELAY'}
                      </span>
                    </div>

                    {idx < fullPath.length - 1 && (
                      <ArrowDown className="w-4 h-4 text-slate-400 animate-bounce" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white/70 border-t border-slate-300/70 flex items-center justify-between text-xs text-slate-600 font-mono font-medium">
          <span>Received at: {new Date(incident.timestamp).toLocaleString()}</span>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[#12151b] hover:bg-slate-800 text-white font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
