import React from 'react';
import {
  Zap,
  MapPin,
  Users,
  Lock,
  ChevronDown,
  ArrowRight,
  Activity,
  Radio,
  Shield,
  Sparkles,
  Wifi,
  Globe,
} from 'lucide-react';

interface LandingPageProps {
  onLaunchDashboard: () => void;
  onExploreDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchDashboard, onExploreDemo }) => {
  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 font-sans selection:bg-orange-500 selection:text-white relative overflow-x-hidden">
      {/* Background ambient lighting effects matching Awsmd reference */}
      <div className="absolute top-0 right-1/4 w-[650px] h-[520px] bg-orange-500/12 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[550px] h-[550px] bg-orange-600/8 rounded-full blur-[150px] pointer-events-none" />

      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[#0b0f17]/90 backdrop-blur-md border-b border-white/[0.08] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={onLaunchDashboard}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-950/60 ring-2 ring-orange-400/30 group-hover:scale-105 transition duration-200">
              <Zap className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="text-xl font-black tracking-wider text-white uppercase font-mono">
              RAPID<span className="text-orange-400 font-semibold">CONNECT</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm text-slate-300 font-medium">
            <button className="flex items-center gap-1.5 hover:text-orange-400 transition group">
              <span>Features</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-orange-400 transition" />
            </button>
            <button className="flex items-center gap-1.5 hover:text-orange-400 transition group">
              <span>Solutions</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-orange-400 transition" />
            </button>
            <button className="flex items-center gap-1.5 hover:text-orange-400 transition group">
              <span>Mesh Protocol</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-orange-400 transition" />
            </button>
            <button className="flex items-center gap-1.5 hover:text-orange-400 transition group">
              <span>Documentation</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-orange-400 transition" />
            </button>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={onLaunchDashboard}
              className="px-6 py-2 rounded-full bg-white/[0.05] hover:bg-orange-500/20 text-white hover:text-orange-300 text-xs font-bold tracking-wider uppercase border border-white/[0.12] hover:border-orange-500/40 transition shadow-sm font-mono active:scale-95"
            >
              LOGIN
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-16 lg:pt-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-semibold shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>SYSTEMS OPERATIONAL • UDP 50005</span>
            </div>

            <div className="text-sm font-bold text-orange-400 tracking-wide font-mono uppercase flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>Ad-Hoc Emergency Mesh Network</span>
            </div>

            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black text-white tracking-tight leading-[1.1]">
              INSTANT EMERGENCY <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
                COMMUNICATION
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-lg">
              Reliable. Real-Time. Unified. <br />
              Bridging the gap with zero cellular, cloud, or internet dependencies when every second counts.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onLaunchDashboard}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-400 text-white font-bold text-xs tracking-wider uppercase shadow-[0_0_30px_rgba(249,115,22,0.45)] transition-all transform hover:scale-[1.03] active:scale-[0.98] border border-orange-400/40 font-mono"
              >
                REQUEST A DEMO
              </button>

              <button
                onClick={onExploreDemo}
                className="px-8 py-3.5 rounded-full bg-[#141a29]/90 hover:bg-[#1a2236] text-slate-200 hover:text-white font-bold text-xs tracking-wider uppercase border border-white/[0.12] hover:border-orange-500/40 transition-all shadow-md font-mono active:scale-[0.98]"
              >
                LEARN MORE
              </button>
            </div>
          </div>

          {/* 3D Topography Graphic Card with Awsmd Glow Accents */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <div className="w-full max-w-lg aspect-[4/3] rounded-3xl bg-[#121826]/80 border border-white/[0.08] p-6 relative shadow-2xl backdrop-blur-md overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* 3D Isometric Disaster Mesh Graphic */}
              <div className="relative w-64 h-48 rounded-2xl bg-gradient-to-br from-[#161f33] via-[#0f1524] to-[#0a0e19] border border-orange-500/30 shadow-2xl transform -rotate-6 skew-y-3 flex items-center justify-center">
                <div className="absolute inset-0 rounded-2xl border border-dashed border-orange-400/20 m-2 pointer-events-none" />
                <div className="absolute inset-0 rounded-2xl border border-amber-400/10 m-6 pointer-events-none" />

                <div className="relative z-20 flex flex-col items-center animate-bounce">
                  <div className="p-2.5 rounded-full bg-orange-600 text-white shadow-[0_0_25px_rgba(249,115,22,0.9)] ring-2 ring-orange-400">
                    <MapPin className="w-5 h-5 fill-current" />
                  </div>
                  <span className="mt-1 px-2 py-0.5 rounded-full bg-orange-950/90 text-orange-300 font-mono text-[9px] font-bold border border-orange-700">
                    INCIDENT #1
                  </span>
                </div>

                <div className="absolute top-4 left-6 z-10">
                  <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.8)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>

                <div className="absolute bottom-5 right-8 z-10">
                  <div className="w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-[0_0_12px_rgba(249,115,22,0.8)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>
              </div>

              {/* HUD Badge: HQ Command */}
              <div className="absolute top-4 right-4 bg-[#0d1322]/95 border border-orange-500/40 p-2.5 rounded-2xl shadow-xl z-20 flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-orange-500/20 text-orange-400">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-slate-400">HQ Command</div>
                  <div className="text-xs font-bold text-white font-mono">NODE-ALPHA</div>
                </div>
              </div>

              {/* HUD Badge: Field Unit SAR */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#0d1322]/95 border border-amber-500/40 p-2.5 rounded-2xl shadow-xl z-20 flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-slate-400">Field Unit #2</div>
                  <div className="text-xs font-bold text-amber-300 font-mono">SAR DISPATCHED</div>
                </div>
              </div>

              {/* HUD Badge: Medic Lead */}
              <div className="absolute bottom-6 left-4 bg-[#0d1322]/95 border border-emerald-500/40 p-2.5 rounded-2xl shadow-xl z-20 flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-slate-400">Medic Lead</div>
                  <div className="text-xs font-bold text-emerald-400 font-mono">TRIAGE ACTIVE</div>
                </div>
              </div>

              <div className="absolute top-6 left-6 bg-[#080d1a]/90 border border-white/[0.08] p-2 rounded-xl text-[10px] font-mono text-orange-300 shadow-lg hidden sm:block">
                <span>📡 UDP :50005 • TTL 5</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 FEATURE CARDS ROW */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-3xl bg-[#121826]/80 border border-white/[0.08] hover:border-orange-500/40 transition-all duration-200 flex flex-col justify-between group shadow-xl">
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                <span>LIVE GEOLOCATION</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Real-time topological GPS and landmark coordinate tracking across mesh hops.
              </p>
            </div>
            <div className="h-20 w-full rounded-2xl bg-[#0a0e19] border border-white/[0.06] relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#f97316_1px,transparent_1px),linear-gradient(to_bottom,#f97316_1px,transparent_1px)] bg-[size:12px_12px]" />
              <div className="flex items-center gap-3 relative z-10">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
                <span className="text-[10px] font-mono text-orange-400 font-bold">SECTOR 4 PINNED</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-[#121826]/80 border border-white/[0.08] hover:border-orange-500/40 transition-all duration-200 flex flex-col justify-between group shadow-xl">
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                <span>MULTI-CHANNEL ALERTING</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Omnidirectional multi-hop dissemination across UDP packets and direct terminal relays.
              </p>
            </div>
            <div className="h-20 w-full rounded-2xl bg-[#0a0e19] border border-white/[0.06] flex items-center justify-center gap-2 p-2">
              <span className="px-2.5 py-1 rounded-lg bg-[#141a29] border border-white/[0.08] text-[10px] font-mono font-bold text-slate-300">
                UDP
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-orange-950/60 border border-orange-800 text-[10px] font-mono font-bold text-orange-300">
                SOS
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#141a29] border border-white/[0.08] text-[10px] font-mono font-bold text-slate-300">
                RELAY
              </span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-[#121826]/80 border border-white/[0.08] hover:border-orange-500/40 transition-all duration-200 flex flex-col justify-between group shadow-xl">
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-orange-400" />
                <span>REAL-TIME AGENCY SYNC</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Unified incident triage between Police, Fire, EMS, and Search & Rescue units.
              </p>
            </div>
            <div className="h-20 w-full rounded-2xl bg-[#0a0e19] border border-white/[0.06] flex items-center justify-center gap-3">
              <Users className="w-5 h-5 text-orange-400" />
              <span className="text-[10px] font-mono text-slate-300 font-bold">100% PEER SYNC</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-[#121826]/80 border border-white/[0.08] hover:border-orange-500/40 transition-all duration-200 flex flex-col justify-between group shadow-xl">
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>RESILIENT MESH PLATFORM</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Zero cloud dependencies. Built with sliding-window duplicate packet suppression.
              </p>
            </div>
            <div className="h-20 w-full rounded-2xl bg-[#0a0e19] border border-white/[0.06] flex items-center justify-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-mono text-emerald-400 font-bold">LOOP PROTECTED</span>
            </div>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS PROCESS STEPPER */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="p-6 sm:p-8 rounded-3xl bg-[#121826]/90 border border-white/[0.08] shadow-2xl flex flex-wrap items-center justify-between gap-6">
          <div className="text-sm font-black text-white uppercase tracking-wider font-mono">
            HOW IT WORKS
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-mono font-bold">
            <div className="flex items-center gap-2 text-orange-400">
              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center text-[11px] shadow-md shadow-orange-950">
                1
              </span>
              <span>Report</span>
            </div>

            <span className="text-slate-600">⟶</span>

            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-7 h-7 rounded-full bg-[#1a2236] border border-white/[0.08] text-slate-300 flex items-center justify-center text-[11px]">
                2
              </span>
              <span>Dispatch</span>
            </div>

            <span className="text-slate-600">⟶</span>

            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-7 h-7 rounded-full bg-[#1a2236] border border-white/[0.08] text-slate-300 flex items-center justify-center text-[11px]">
                3
              </span>
              <span>Coordinate</span>
            </div>

            <span className="text-slate-600">⟶</span>

            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-7 h-7 rounded-full bg-[#1a2236] border border-white/[0.08] text-slate-300 flex items-center justify-center text-[11px]">
                4
              </span>
              <span>Resolve</span>
            </div>
          </div>

          <button
            onClick={onLaunchDashboard}
            className="flex items-center gap-2 text-xs text-orange-400 hover:text-orange-300 font-mono font-bold transition group"
          >
            <span>Launch Live Console</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.08] bg-[#080c14] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-8 text-xs font-mono text-slate-400">
          <div>
            <div className="flex items-center space-x-2.5 text-white font-bold mb-1">
              <Zap className="w-4 h-4 text-orange-500 fill-current" />
              <span>RAPIDCONNECT • DECS EMERGENCY NETWORK</span>
            </div>
            <p className="text-slate-500">Autonomous UDP Broadcast Disaster Mesh • Port 50005</p>
          </div>

          <div className="flex items-center gap-6">
            <span className="hover:text-orange-400 cursor-pointer transition">Protocol Spec</span>
            <span className="hover:text-orange-400 cursor-pointer transition">Triage API</span>
            <span className="hover:text-orange-400 cursor-pointer transition">Contact Command</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
