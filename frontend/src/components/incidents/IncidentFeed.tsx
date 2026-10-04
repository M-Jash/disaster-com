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
  ArrowRight,
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
        return <HeartPulse className="w-4 h-4 text-red-600" />;
      case 'TRAPPED':
        return <LifeBuoy className="w-4 h-4 text-amber-600" />;
      case 'FIRE':
        return <Flame className="w-4 h-4 text-[#ff4e18]" />;
      case 'FLOOD':
        return <Waves className="w-4 h-4 text-blue-600" />;
      case 'FOOD_WATER':
        return <Apple className="w-4 h-4 text-emerald-600" />;
      case 'MISSING_PERSON':
        return <UserX className="w-4 h-4 text-purple-600" />;
      default:
        return <AlertOctagon className="w-4 h-4 text-slate-600" />;
    }
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'NEW':
        return <span className="px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#ff4e18] text-white">NEW</span>;
      case 'ACKNOWLEDGED':
        return <span className="px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">ACKNOWLEDGED</span>;
      case 'IN_PROGRESS':
        return <span className="px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-100 text-blue-900 border border-blue-300">IN PROGRESS</span>;
      case 'RESOLVED':
        return <span className="px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">RESOLVED</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters Toolbar */}
      <div className="p-6 rounded-[32px] bg-[#eaf1f1] text-slate-900 border border-white/80 shadow-md space-y-4">
        <div className="flex items-center space-x-2 text-xs font-mono font-black text-slate-900 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-[#ff4e18]" />
          <span>Incident Triage Filters ({filteredIncidents.length} matching)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          {/* Status Filter */}
          <div>
            <label className="block text-slate-600 font-bold mb-1.5">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-full bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-[#ff4e18] shadow-sm font-semibold"
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
            <label className="block text-slate-600 font-bold mb-1.5">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-full bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-[#ff4e18] shadow-sm font-semibold"
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
            <label className="block text-slate-600 font-bold mb-1.5">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-full bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-[#ff4e18] shadow-sm font-semibold"
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
        <div className="p-12 rounded-[32px] bg-[#eaf1f1] text-slate-900 border border-white/80 text-center space-y-2">
          <AlertOctagon className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-black text-slate-800 font-mono">No Incidents Found</h3>
          <p className="text-xs text-slate-500 font-medium font-sans">
            No active SOS packets match your filter criteria, or no emergency has been broadcasted yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIncidents.map((incident) => {
            const isResolved = incident.incident_status === 'RESOLVED';
            return (
              <div
                key={incident.msg_id}
                className={`p-6 rounded-[32px] border transition shadow-lg flex flex-col justify-between ${
                  isResolved
                    ? 'bg-[#eaf1f1]/70 border-slate-200 opacity-80'
                    : 'bg-[#eaf1f1] border-white/80 hover:bg-[#f1f7f7]'
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2.5 rounded-full bg-white border border-slate-200 shadow-sm">
                        {getCategoryIcon(incident.category)}
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 tracking-wide font-mono">
                          {incident.category}
                        </span>
                        <div className="text-[11px] font-mono text-slate-500 font-bold">
                          {incident.msg_id}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {getStatusBadge(incident.incident_status)}
                    </div>
                  </div>

                  {/* Message Content */}
                  <p className="text-sm text-slate-800 font-medium leading-relaxed mb-4 font-sans">
                    "{incident.text}"
                  </p>

                  {/* Location Info */}
                  {incident.location_desc && (
                    <div className="mb-3 flex items-center space-x-1.5 text-xs text-slate-700 bg-white p-3 rounded-2xl border border-slate-200 font-mono">
                      <MapPin className="w-3.5 h-3.5 text-[#ff4e18] shrink-0" />
                      <span className="truncate font-semibold">{incident.location_desc}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Meta & Action */}
                <div className="pt-3 border-t border-slate-300/70 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1 text-[#ff4e18] font-bold">
                      <Route className="w-3.5 h-3.5" />
                      {incident.hop_count} hops left
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedIncident(incident)}
                    className="px-4 py-1.5 rounded-full bg-[#ff4e18] hover:bg-[#ff6535] text-white text-xs font-bold font-mono transition shadow-sm"
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
