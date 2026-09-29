import React, { useState } from 'react';
import { useNetwork } from '../../context/NetworkContext';
import { MessageItem, IncidentStatus, EmergencyCategory, PriorityLevel } from '../../types';
import { IncidentDetailModal } from './IncidentDetailModal';
import {
  AlertOctagon,
  Filter,
  Route,
  Clock,
  MapPin,
  CheckCircle,
  Clock3,
  Flame,
  Waves,
  HeartPulse,
  LifeBuoy,
  Apple,
  UserX,
  Shield,
} from 'lucide-react';

export const IncidentFeed: React.FC = () => {
  const { incidents, updateIncidentStatus } = useNetwork();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [selectedIncident, setSelectedIncident] = useState<MessageItem | null>(null);

  const sosIncidents = incidents.filter((i) => i.type === 'SOS');

  const filteredIncidents = sosIncidents.filter((inc) => {
    if (statusFilter !== 'ALL' && inc.incident_status !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && inc.category !== categoryFilter) return false;
    if (priorityFilter !== 'ALL' && inc.priority !== priorityFilter) return false;
    return true;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'MEDICAL':
        return <HeartPulse className="w-4 h-4 text-rose-400" />;
      case 'TRAPPED':
        return <LifeBuoy className="w-4 h-4 text-amber-400" />;
      case 'FIRE':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'FLOOD':
        return <Waves className="w-4 h-4 text-blue-400" />;
      case 'FOOD_WATER':
        return <Apple className="w-4 h-4 text-emerald-400" />;
      case 'MISSING_PERSON':
        return <UserX className="w-4 h-4 text-purple-400" />;
      default:
        return <AlertOctagon className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'NEW':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-950 text-red-400 border border-red-800">NEW</span>;
      case 'ACKNOWLEDGED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950 text-amber-400 border border-amber-800">ACKNOWLEDGED</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">IN PROGRESS</span>;
      case 'RESOLVED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">RESOLVED</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-3">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span>Incident Triage Filters ({filteredIncidents.length} matching)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Status Filter */}
          <div>
            <label className="block text-slate-400 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New (Unassigned)</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-slate-400 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Categories</option>
              <option value="MEDICAL">Medical</option>
              <option value="TRAPPED">Trapped</option>
              <option value="FIRE">Fire</option>
              <option value="FLOOD">Flood</option>
              <option value="FOOD_WATER">Food / Water</option>
              <option value="MISSING_PERSON">Missing Person</option>
              <option value="GENERAL">General</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-slate-400 mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents Feed List */}
      {filteredIncidents.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
          <AlertOctagon className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No Incidents Found</h3>
          <p className="text-xs text-slate-500">
            No active SOS packets match your filter criteria, or no emergency has been broadcasted yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredIncidents.map((incident) => {
            const isResolved = incident.incident_status === 'RESOLVED';
            return (
              <div
                key={incident.msg_id}
                className={`p-5 rounded-2xl border transition shadow-lg flex flex-col justify-between ${
                  isResolved
                    ? 'bg-slate-900/40 border-slate-800/80 opacity-70'
                    : 'bg-slate-900/90 border-red-900/40 hover:border-red-600/60'
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                        {getCategoryIcon(incident.category)}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white tracking-wide">
                          {incident.category}
                        </span>
                        <div className="text-[11px] font-mono text-slate-400">
                          {incident.msg_id}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {getStatusBadge(incident.incident_status)}
                    </div>
                  </div>

                  {/* Message Content */}
                  <p className="text-sm text-slate-100 font-medium leading-relaxed mb-3">
                    "{incident.text}"
                  </p>

                  {/* Location Info */}
                  {incident.location_desc && (
                    <div className="mb-3 flex items-center space-x-1.5 text-xs text-slate-300 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{incident.location_desc}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Meta & Action */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1 text-cyan-400">
                      <Route className="w-3.5 h-3.5" />
                      {incident.hop_count} hops left
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedIncident(incident)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition"
                  >
                    Triage & Path Details →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Incident Detail Modal */}
      <IncidentDetailModal
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
      />
    </div>
  );
};
