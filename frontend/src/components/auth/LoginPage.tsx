import React, { useState, useEffect } from 'react';
import { Shield, Radio, User, AlertTriangle, RefreshCw, ArrowRight, Zap, Wifi, Activity, Terminal } from 'lucide-react';
import { UserRole } from '../../types';

interface LoginPageProps {
  onLoginSuccess: (name: string, nodeId: string, role: UserRole) => void;
}

const PRESET_PROFILES: { label: string; name: string; role: UserRole; icon: string; desc: string; tag: string }[] = [
  { label: 'SAR Field Commander', name: 'Alpha-Lead', role: 'RESPONDER', icon: '🚨', desc: 'Search & Rescue field unit lead', tag: 'COMMAND' },
  { label: 'Triage Medical Unit', name: 'Medic-Unit-1', role: 'RESPONDER', icon: '🚑', desc: 'Emergency casualty & medical aid', tag: 'MEDIC' },
  { label: 'Shelter Evacuee', name: 'Civilian-Alice', role: 'CIVILIAN', icon: '🏠', desc: 'Civilian survival & SOS alerts', tag: 'CITIZEN' },
  { label: 'Hilltop Mesh Repeater', name: 'Hilltop-Relay', role: 'RELAY', icon: '📡', desc: 'Dedicated multi-hop routing node', tag: 'REPEATER' },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('RESPONDER');
  const [nodeId, setNodeId] = useState('');
  const [error, setError] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const generateNodeId = () => {
    const hex = Math.random().toString(16).substring(2, 6).toUpperCase();
    return `NODE-${hex}`;
  };

  useEffect(() => {
    setNodeId(generateNodeId());
  }, []);

  const handlePresetSelect = (preset: typeof PRESET_PROFILES[0]) => {
    setName(preset.name);
    setRole(preset.role);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Please enter an operator callsign or station name.');
      return;
    }

    const finalNodeId = nodeId.trim() || generateNodeId();

    sessionStorage.setItem('decs_user_name', cleanName);
    sessionStorage.setItem('decs_node_id', finalNodeId);
    sessionStorage.setItem('decs_user_role', role);

    onLoginSuccess(cleanName, finalNodeId, role);
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-orange-500 selection:text-white hud-grid">
      {/* Dynamic ambient background glow rings */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-orange-500/12 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Futuristic decorative background HUD lines */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-15">
        <div className="w-[500px] h-[500px] rounded-full border border-dashed border-orange-500/40 animate-radar" />
        <div className="w-[750px] h-[750px] rounded-full border border-slate-700/40 absolute" />
      </div>

      {/* Main Terminal Card */}
      <div className="relative w-full max-w-xl z-10">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#121826] border border-orange-500/30 text-orange-400 text-xs font-mono font-medium mb-3.5 shadow-lg shadow-orange-950/40 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            <span className="text-slate-300">DISASTER EMERGENCY COMMUNICATION SYSTEM</span>
            <span className="text-orange-400 font-bold">• DECS v1.0</span>
          </div>

          <div className="flex items-center justify-center gap-3.5 mb-2">
            <div className="p-3.5 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 rounded-2xl shadow-xl shadow-orange-950/60 text-white ring-1 ring-orange-400/40 animate-signal">
              <Radio className="w-7 h-7" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono flex items-center gap-2">
                STATION <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">ONBOARDING</span>
              </h1>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-0.5">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  UDP 50005 READY
                </span>
                <span>•</span>
                <span>OFFLINE AD-HOC MESH</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Box */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 border border-white/[0.08] relative overflow-hidden">
          {/* Subtle top edge lighting */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs font-mono animate-fadeIn">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Operator Callsign / Station Name */}
            <div>
              <label className="block text-xs font-mono text-slate-300 font-semibold uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Operator Callsign / Station Name <span className="text-orange-400">*</span></span>
                <span className="text-[10px] text-slate-500 lowercase font-mono">isolated to this tab</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="e.g. Alpha-Lead, Medic Unit 1, Alice"
                  maxLength={40}
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 bg-[#090e18] border border-white/[0.08] rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-mono shadow-inner"
                />
              </div>
            </div>

            {/* Role Selection Grid */}
            <div>
              <label className="block text-xs font-mono text-slate-300 font-semibold uppercase tracking-wider mb-2">
                Tactical Station Role
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(['RESPONDER', 'CIVILIAN', 'RELAY'] as UserRole[]).map((r) => {
                  const isSelected = role === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-center sm:items-start justify-center text-center sm:text-left ${
                        isSelected
                          ? r === 'RESPONDER'
                            ? 'bg-orange-500/20 border-orange-500/80 text-orange-200 shadow-md shadow-orange-950 ring-1 ring-orange-500/40'
                            : r === 'CIVILIAN'
                            ? 'bg-amber-500/20 border-amber-500/80 text-amber-200 shadow-md shadow-amber-950 ring-1 ring-amber-500/40'
                            : 'bg-emerald-500/20 border-emerald-500/80 text-emerald-200 shadow-md shadow-emerald-950 ring-1 ring-emerald-500/40'
                          : 'bg-[#090e18] border-white/[0.06] text-slate-400 hover:border-white/[0.15] hover:text-slate-300 hover:bg-[#141a29]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        {r === 'RESPONDER' && <Shield className="w-3.5 h-3.5 text-orange-400" />}
                        {r === 'CIVILIAN' && <User className="w-3.5 h-3.5 text-amber-400" />}
                        {r === 'RELAY' && <Radio className="w-3.5 h-3.5 text-emerald-400" />}
                        <span className="text-xs font-bold font-mono uppercase">{r}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono hidden sm:inline leading-tight">
                        {r === 'RESPONDER' && 'Emergency triage & SAR'}
                        {r === 'CIVILIAN' && 'Civilian SOS broadcast'}
                        {r === 'RELAY' && 'Multi-hop forwarding'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generated Node ID Box */}
            <div className="bg-[#090e18] border border-white/[0.06] rounded-2xl p-3.5 flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Local Hardware Node ID
                  </div>
                  <div className="text-sm font-mono font-bold text-amber-400 tracking-wider">
                    {nodeId || 'GENERATING...'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setNodeId(generateNodeId())}
                className="p-2 rounded-xl bg-[#141a29] hover:bg-[#1a2236] text-slate-300 hover:text-white transition border border-white/[0.08] flex items-center gap-1.5 text-xs font-mono active:scale-95"
                title="Regenerate Node ID"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Regen</span>
              </button>
            </div>

            {/* Quick Profile Presets */}
            <div>
              <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-orange-400" />
                <span>Quick Deployment Presets:</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_PROFILES.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handlePresetSelect(p)}
                    className="p-2.5 rounded-2xl bg-[#090e18] border border-white/[0.06] hover:border-orange-500/40 hover:bg-[#141a29] text-left transition group relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base">{p.icon}</span>
                      <span className="text-[9px] font-mono px-2 py-0.2 rounded-full bg-[#1a2236] text-slate-400 border border-white/[0.06]">
                        {p.tag}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-white font-mono truncate">
                      {p.label}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">
                      {p.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-400 text-white font-mono font-bold rounded-full shadow-[0_0_25px_rgba(249,115,22,0.4)] transition-all flex items-center justify-center gap-2 tracking-wider text-sm active:scale-[0.99] border border-orange-400/40"
            >
              <span>ENTER EMERGENCY MESH STATION</span>
              <ArrowRight className={`w-4 h-4 transition-transform duration-200 ${isHovered ? 'translate-x-1' : ''}`} />
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="mt-5 text-center text-[11px] font-mono text-slate-500 space-y-1">
          <p className="flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Zero Cloud / Internet Dependency • 100% Offline UDP LAN Mesh
          </p>
          <p className="text-slate-600">Open multiple tabs to simulate separate nodes communicating independently.</p>
        </div>
      </div>
    </div>
  );
};
