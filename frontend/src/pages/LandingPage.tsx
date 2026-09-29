import React from 'react';
import {
  Radio,
  WifiOff,
  Shield,
  Activity,
  ArrowRight,
  AlertTriangle,
  Waves,
  Flame,
  Zap,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';

interface LandingPageProps {
  onLaunchDashboard: () => void;
  onExploreDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchDashboard,
  onExploreDemo,
}) => {
  const disasterCards = [
    {
      title: 'Flood & Cyclone Emergencies',
      description: 'When power grids and cellular towers submerge, local UDP broadcast allows nearby relief teams and citizens to coordinate evacuation.',
      icon: Waves,
      color: 'text-blue-400 border-blue-900/50 bg-blue-950/20',
    },
    {
      title: 'Earthquakes & Structural Collapses',
      description: 'Survivors and first responders exchange distress packets over direct device-to-device Wi-Fi/LAN links without needing internet routing.',
      icon: AlertTriangle,
      color: 'text-amber-400 border-amber-900/50 bg-amber-950/20',
    },
    {
      title: 'Grid & Cellular Blackouts',
      description: 'Continuous emergency beaconing and multi-hop relaying keeps critical SOS signals hopping across neighborhood participating nodes.',
      icon: Zap,
      color: 'text-purple-400 border-purple-900/50 bg-purple-950/20',
    },
  ];

  return (
    <div className="min-h-screen bg-[#080c14] text-white flex flex-col justify-between relative overflow-hidden">
      {/* Background Animated Gradient Mesh Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-600/10 blur-[140px] pointer-events-none rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-red-600/10 blur-[140px] pointer-events-none rounded-full"></div>

      {/* Top Navbar */}
      <nav className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-6 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight">DECS</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                OFFLINE MESH
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onExploreDemo}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition"
            >
              Demo Simulator
            </button>
            <button
              onClick={onLaunchDashboard}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white shadow-lg shadow-cyan-950 transition"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 text-center space-y-8 z-10">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs font-semibold">
          <WifiOff className="w-3.5 h-3.5 text-cyan-400" />
          <span>Zero Cloud Dependencies • 100% Local UDP Mesh Networking</span>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            When Infrastructure Fails, <br />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Communication Shouldn't.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A resilient local communication platform designed to help nearby devices exchange emergency information and SOS alerts when conventional internet and cellular towers are unavailable.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={onLaunchDashboard}
            className="flex items-center space-x-2 px-8 py-3.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-sm font-bold text-white shadow-xl shadow-cyan-950 transition transform hover:scale-[1.02]"
          >
            <Radio className="w-4 h-4" />
            <span>Launch Command Dashboard</span>
          </button>

          <button
            onClick={onExploreDemo}
            className="flex items-center space-x-2 px-8 py-3.5 rounded-2xl bg-purple-950/60 hover:bg-purple-900/80 text-sm font-bold text-purple-200 border border-purple-800/80 transition"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Explore 5-Node Simulation</span>
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-12 text-left">
          {disasterCards.map((c, idx) => {
            const Icon = c.icon;
            return (
              <div
                key={idx}
                className={`p-6 rounded-3xl border ${c.color} backdrop-blur-md shadow-xl`}
              >
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 w-fit mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{c.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{c.description}</p>
              </div>
            );
          })}
        </div>

        {/* Computer Networks Technical Architecture Summary */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 text-left grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-cyan-400 font-bold uppercase tracking-wider">UDP Broadcast</span>
            <p className="text-slate-400">Socket binding on 0.0.0.0:50005 with SO_BROADCAST to 255.255.255.255</p>
          </div>
          <div className="space-y-1">
            <span className="text-emerald-400 font-bold uppercase tracking-wider">TTL / Hop Decrement</span>
            <p className="text-slate-400">Strict hop limit reduction at each node preventing routing loops</p>
          </div>
          <div className="space-y-1">
            <span className="text-rose-400 font-bold uppercase tracking-wider">Duplicate Prevention</span>
            <p className="text-slate-400">Thread-safe sliding-window cache filtering repeated msg_id instances</p>
          </div>
          <div className="space-y-1">
            <span className="text-purple-400 font-bold uppercase tracking-wider">Local SQLite WAL</span>
            <p className="text-slate-400">High-concurrency local database preserving message history offline</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 px-6 text-center text-xs text-slate-500">
        <p>DECS • Disaster Emergency Communication System • Computer Networks (CNIP) Mini-Project</p>
      </footer>
    </div>
  );
};
