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
} from 'lucide-react';

export const DemoSimulator: React.FC = () => {
  const { runSimulation } = useNetwork();

  const [scenario, setScenario] = useState<string>('MULTI_HOP_SOS');
  const [initialHops, setInitialHops] = useState<number>(4);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const scenarios = [
    {
      id: 'MULTI_HOP_SOS',
      name: '1. Multi-Hop SOS Propagation',
      description: 'Simulates NODE-A broadcasting critical flood SOS. Hop count decrements at each relay (NODE-B → NODE-C → NODE-D → NODE-E).',
      icon: Flame,
    },
    {
      id: 'DUPLICATE_LOOP',
      name: '2. Duplicate Packet Prevention',
      description: 'Demonstrates multipath broadcast where NODE-D receives duplicate packets from two relay branches and drops the redundant packet.',
      icon: ShieldAlert,
    },
    {
      id: 'TTL_EXPIRATION',
      name: '3. Hop-Count / TTL Expiration',
      description: 'Demonstrates hop limit boundary. When TTL reaches 0, the packet is stored locally but dropped from further rebroadcast.',
      icon: Route,
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
      <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/60 flex items-center justify-between gap-3 text-xs text-purple-200">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
          <p>
            <strong className="text-purple-300 uppercase tracking-wider">Demo / Classroom Simulation Mode:</strong>{' '}
            Visualizes multi-node routing, TTL decrement, and duplicate packet rejection step-by-step for project presentations.
          </p>
        </div>
        <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-purple-900 text-purple-300 border border-purple-700">
          DEMO ENGINE
        </span>
      </div>

      {/* Scenario Controls */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Select Computer Networks Demonstration Scenario
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-purple-950/50 text-white border-purple-500 ring-1 ring-purple-500 shadow-lg'
                    : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-purple-400' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">{sc.name}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{sc.description}</p>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center space-x-3 text-xs">
            <span className="text-slate-400 font-medium">Initial Packet TTL:</span>
            <div className="flex items-center space-x-1">
              {[2, 3, 4, 5].map((hops) => (
                <button
                  key={hops}
                  onClick={() => setInitialHops(hops)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                    initialHops === hops
                      ? 'bg-purple-600 text-white shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
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
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-purple-950 transition"
          >
            <Play className="w-4 h-4" />
            <span>{isLoading ? 'Running Scenario...' : 'Execute Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Step-by-Step Simulation Visualizer Stage */}
      {simResult && (
        <div className="p-6 rounded-3xl bg-slate-950 border border-purple-900/40 shadow-2xl space-y-6 animate-fadeIn">
          {/* Top Stage Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-purple-400 font-mono">
                  STEP {activeStepIndex + 1} OF {simResult.steps.length}
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs font-mono text-slate-300">
                  MSG ID: {simResult.msg_id}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                {currentStep?.action}
              </h2>
            </div>

            {/* Stepper Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevStep}
                disabled={activeStepIndex === 0}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-xs font-semibold transition"
              >
                ← Previous
              </button>

              <button
                onClick={handleNextStep}
                disabled={activeStepIndex === simResult.steps.length - 1}
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white text-xs font-bold transition shadow"
              >
                Next Step →
              </button>
            </div>
          </div>

          {/* Virtual Node Chain Visualization */}
          <div className="grid grid-cols-5 gap-2 py-4">
            {['NODE-A', 'NODE-B', 'NODE-C', 'NODE-D', 'NODE-E'].map((nodeName, idx) => {
              const isCurrent = currentStep?.node.includes(nodeName);
              const isTraversed = currentStep?.relay_path.some((p) => p.includes(nodeName));

              return (
                <div
                  key={nodeName}
                  className={`p-3 rounded-2xl border text-center transition ${
                    isCurrent
                      ? 'bg-purple-950/60 text-white border-purple-400 ring-2 ring-purple-500/50 shadow-lg scale-105'
                      : isTraversed
                      ? 'bg-slate-900/80 text-slate-300 border-cyan-800/60'
                      : 'bg-slate-950/50 text-slate-600 border-slate-800/50'
                  }`}
                >
                  <div className="text-[10px] font-mono text-slate-400 mb-1">Node {idx + 1}</div>
                  <div className="text-xs font-bold font-mono text-cyan-300">{nodeName}</div>
                  <div className="mt-1 text-[9px] uppercase tracking-wider font-semibold text-slate-400">
                    {idx === 0 ? 'Origin' : idx === 4 ? 'Command' : 'Mesh Relay'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Step Detail Explanation Box */}
          {currentStep && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">
                  Network Action at {currentStep.node}:
                </span>
                <span className="font-mono text-purple-400 font-bold">
                  Remaining TTL: {currentStep.hop_count} Hops
                </span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-sans">
                {currentStep.details}
              </p>
              <div className="pt-2 flex items-center space-x-2 text-xs font-mono text-cyan-400">
                <Route className="w-3.5 h-3.5" />
                <span>Relay Trace: {currentStep.relay_path.join(' → ')}</span>
              </div>
            </div>
          )}

          {/* Computer Networks Viva Explanation */}
          <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-900/40 text-xs text-slate-300 space-y-1">
            <strong className="text-cyan-300">Computer Networks Concept Demonstrated:</strong>
            <p className="text-slate-400">
              {scenario === 'MULTI_HOP_SOS' &&
                'Each participating relay node inspects the hop_count field. If hop_count > 1, it decrements the count by 1 and rebroadcasts the packet, extending effective wireless coverage.'}
              {scenario === 'DUPLICATE_LOOP' &&
                'In wireless broadcast meshes, a node may receive the same packet over multiple paths. The DuplicateCache (sliding-window hash set) detects identical msg_id and immediately drops the redundant packet, stopping broadcast storms.'}
              {scenario === 'TTL_EXPIRATION' &&
                'Time-To-Live (TTL) / Hop Limit prevents routing loops from circulating forever. When hop_count reaches 0, transmission terminates safely.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
