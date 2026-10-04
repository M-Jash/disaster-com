import React, { useState } from 'react';
import { useNetwork } from '../../context/NetworkContext';
import { SimulationResult, DemoStep } from '../../types';
import {
  Play,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Route,
  Activity,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';

export const DemoSimulator: React.FC = () => {
  const { runSimulation } = useNetwork();

  const [scenario, setScenario] = useState<string>('MULTI_HOP_SOS');
  const [initialHops, setInitialHops] = useState<number>(4);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const scenarios = [
    {
      id: 'MULTI_HOP_SOS',
      name: '1. Multi-Hop SOS Propagation',
      description: 'Simulates NODE-A broadcasting critical flood SOS. Hop count decrements at each relay (NODE-B → NODE-C → NODE-D → NODE-E).',
      icon: Flame,
      tag: 'TTL DECREMENT',
    },
    {
      id: 'DUPLICATE_LOOP',
      name: '2. Duplicate Packet Prevention',
      description: 'Demonstrates multipath broadcast where NODE-D receives duplicate packets from two relay branches and drops the redundant packet.',
      icon: ShieldAlert,
      tag: 'LOOP PREVENTION',
    },
    {
      id: 'TTL_EXPIRATION',
      name: '3. Hop-Count / TTL Expiration',
      description: 'Demonstrates hop limit boundary. When TTL reaches 0, the packet is stored locally but dropped from further rebroadcast.',
      icon: Route,
      tag: 'TTL ZERO DROP',
    },
  ];

  const handleStartSimulation = async () => {
    setIsLoading(true);
    try {
      const res = await runSimulation(scenario, initialHops, 'NODE-A', 'Simulated Emergency Dispatch');
      setSimResult(res);
      setActiveStepIndex(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    if (!simResult) return;
    if (activeStepIndex < simResult.steps.length - 1) {
      setActiveStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex((prev) => prev - 1);
    }
  };

  const currentStep: DemoStep | null = simResult ? simResult.steps[activeStepIndex] : null;

  return (
    <div className="space-y-4">
      {/* Simulation Banner Notice */}
      <div className="p-6 rounded-[32px] bg-[#eaf1f1] text-slate-900 border border-white/80 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-full bg-[#ff4e18] text-white shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900 tracking-wide font-mono">
                Computer Networks Classroom Simulation Engine
              </h2>
              <span className="px-3 py-0.5 rounded-full font-mono text-[9px] font-bold bg-[#ff4e18] text-white">
                VIVA MODE
              </span>
            </div>
            <p className="text-slate-600 font-medium text-xs mt-0.5 font-sans">
              Visualizes multi-node routing, TTL decrement, and duplicate packet hash rejection step-by-step
            </p>
          </div>
        </div>
      </div>

      {/* Scenario Controls */}
      <div className="p-6 sm:p-7 rounded-[32px] bg-[#eaf1f1] text-slate-900 border border-white/80 shadow-2xl space-y-4">
        <h3 className="text-xs font-mono font-black text-slate-800 uppercase tracking-wider">
          Select Computer Networks Demonstration Scenario
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {scenarios.map((sc) => {
            const Icon = sc.icon;
            const isSelected = scenario === sc.id;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => {
                  setScenario(sc.id);
                  setSimResult(null);
                }}
                className={`p-5 rounded-3xl border text-left transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-br from-[#ff5722] to-[#ff3d00] text-white border-transparent shadow-xl shadow-[#ff4e18]/30 scale-[1.02]'
                    : 'bg-white text-slate-900 border-slate-200 hover:border-[#ff4e18] hover:bg-orange-50/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-full ${isSelected ? 'bg-black text-white' : 'bg-[#eaf1f1] text-slate-800'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[9px] font-mono px-3 py-0.5 rounded-full font-bold ${
                      isSelected ? 'bg-black text-white' : 'bg-[#dce5e7] text-slate-800'
                    }`}>
                      {sc.tag}
                    </span>
                  </div>
                  <span className={`text-xs font-bold font-mono block mb-1.5 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {sc.name}
                  </span>
                </div>
                <p className={`text-[11px] leading-relaxed font-sans ${isSelected ? 'text-white/90' : 'text-slate-600'}`}>
                  {sc.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-300/70">
          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="text-slate-600 font-bold">Initial Packet TTL:</span>
            <div className="flex items-center space-x-1.5">
              {[2, 3, 4, 5].map((hops) => (
                <button
                  key={hops}
                  onClick={() => setInitialHops(hops)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition ${
                    initialHops === hops
                      ? 'bg-[#ff4e18] text-white shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {hops} Hops
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartSimulation}
            disabled={isLoading}
            className="flex items-center space-x-2 px-7 py-3 rounded-full bg-[#ff4e18] hover:bg-[#ff6535] disabled:opacity-50 text-white font-mono font-bold text-xs shadow-lg shadow-[#ff4e18]/40 transition active:scale-95"
          >
            <Play className="w-4 h-4" />
            <span>{isLoading ? 'RUNNING SCENARIO...' : 'EXECUTE SIMULATION'}</span>
          </button>
        </div>
      </div>

      {/* Step-by-Step Simulation Visualizer Stage */}
      {simResult && (
        <div className="p-6 sm:p-7 rounded-[32px] bg-[#eaf1f1] text-slate-900 border border-white/80 shadow-2xl space-y-6 animate-fadeIn">
          {/* Top Stage Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-300/70">
            <div>
              <div className="flex items-center space-x-2 font-mono">
                <span className="text-xs font-bold text-white bg-[#ff4e18] px-3 py-0.5 rounded-full shadow-sm">
                  STEP {activeStepIndex + 1} OF {simResult.steps.length}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-600 truncate max-w-xs font-bold">
                  MSG ID: {simResult.msg_id}
                </span>
              </div>
              <h2 className="text-base font-black font-mono text-slate-900 mt-1.5">
                {currentStep?.action}
              </h2>
            </div>

            {/* Stepper Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevStep}
                disabled={activeStepIndex === 0}
                className="px-5 py-2.5 rounded-full bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-800 text-xs font-mono font-bold transition border border-slate-200"
              >
                ← Prev Step
              </button>

              <button
                onClick={handleNextStep}
                disabled={activeStepIndex === simResult.steps.length - 1}
                className="px-6 py-2.5 rounded-full bg-[#ff4e18] hover:bg-[#ff6535] disabled:opacity-40 text-white text-xs font-mono font-bold transition shadow-md shadow-[#ff4e18]/30"
              >
                Next Step →
              </button>
            </div>
          </div>

          {/* Virtual Node Chain Visualization */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 py-2">
            {['NODE-A', 'NODE-B', 'NODE-C', 'NODE-D', 'NODE-E'].map((nodeName, idx) => {
              const isCurrent = currentStep?.node.includes(nodeName);
              const isTraversed = currentStep?.relay_path.some((p) => p.includes(nodeName));

              return (
                <div
                  key={nodeName}
                  className={`p-4 rounded-2xl border text-center transition-all duration-300 font-mono ${
                    isCurrent
                      ? 'bg-[#ff4e18] text-white border-transparent shadow-lg shadow-[#ff4e18]/40 scale-105 font-bold'
                      : isTraversed
                      ? 'bg-white text-slate-900 border-slate-300 font-semibold'
                      : 'bg-white/50 text-slate-400 border-slate-200'
                  }`}
                >
                  <div className={`text-[10px] mb-0.5 ${isCurrent ? 'text-white/80' : 'text-slate-500'}`}>Node {idx + 1}</div>
                  <div className="text-sm font-black">{nodeName}</div>
                  <div className={`mt-1 text-[9px] uppercase tracking-wider font-semibold ${isCurrent ? 'text-white/90' : 'text-slate-500'}`}>
                    {idx === 0 ? 'Origin Node' : idx === 4 ? 'Command Post' : 'Mesh Relay'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Step Detail Explanation Box */}
          {currentStep && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2.5 font-mono shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">
                  Transceiver Event at {currentStep.node}:
                </span>
                <span className="text-slate-900 font-bold bg-[#dce5e7] px-3 py-0.5 rounded-full">
                  TTL: {currentStep.hop_count} Hops Left
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans font-medium">
                {currentStep.details}
              </p>
              <div className="pt-2 border-t border-slate-200 flex items-center space-x-2 text-xs text-[#ff4e18] font-bold">
                <Route className="w-4 h-4 shrink-0" />
                <span>Path: {currentStep.relay_path.join(' ➔ ')}</span>
              </div>
            </div>
          )}

          {/* Computer Networks Viva Explanation */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-700 space-y-1 font-mono">
            <strong className="text-slate-900 uppercase tracking-wider">Underlying Computer Networks Mechanism:</strong>
            <p className="text-slate-600 leading-relaxed font-sans mt-1">
              {scenario === 'MULTI_HOP_SOS' &&
                'Each participating relay transceiver receives the broadcast frame, verifies msg_id novelty, decrements hop_count, appends its own node ID to relay_path, and rebroadcasts across UDP port 50005.'}
              {scenario === 'DUPLICATE_LOOP' &&
                'Because wireless broadcast radiates omnidirectionally, duplicate packets arrive over multiple routes. The DuplicateCache (sliding-window hash set with 30-minute TTL) drops redundant arrivals to stop network congestion.'}
              {scenario === 'TTL_EXPIRATION' &&
                'Time-To-Live (hop limit) decrements at every hop. When hop_count reaches 0, the node logs the packet locally for telemetry but terminates further retransmission, preventing infinite routing cycles.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
