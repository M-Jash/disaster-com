import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Sidebar, TabType } from '../components/layout/Sidebar';
import { DisclaimerBanner } from '../components/layout/DisclaimerBanner';
import { StatCards } from '../components/dashboard/StatCards';
import { QuickSOSCard } from '../components/dashboard/QuickSOSCard';
import { LiveMiniFeed } from '../components/dashboard/LiveMiniFeed';
import { QuickChatBox } from '../components/dashboard/QuickChatBox';
import { SOSModal } from '../components/sos/SOSModal';
import { SettingsModal } from '../components/settings/SettingsModal';
import { IncidentFeed } from '../components/incidents/IncidentFeed';
import { EmergencyChat } from '../components/messages/EmergencyChat';
import { NetworkMonitor } from '../components/network/NetworkMonitor';
import { MeshTopologyVisualizer } from '../components/topology/MeshTopologyVisualizer';
import { DemoSimulator } from '../components/demo/DemoSimulator';
import { NodesCatalog } from '../components/nodes/NodesCatalog';
import { MessageItem } from '../types';

interface DashboardPageProps {
  initialTab?: TabType;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ initialTab = 'dashboard' }) => {
  const [currentTab, setCurrentTab] = useState<TabType>(initialTab);
  const [isSOSModalOpen, setIsSOSModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenSOSModal={() => setIsSOSModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
      />

      {/* Scope Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-3 sm:p-4 gap-4">
        {/* Navigation Sidebar */}
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

        {/* Tab Content View */}
        <main className="flex-1 overflow-y-auto min-w-0 space-y-4">
          {currentTab === 'dashboard' && (
            <div className="space-y-4 animate-fadeIn">
              {/* KPI Statistics */}
              <StatCards />

              {/* Quick SOS Dispatcher */}
              <QuickSOSCard onOpenDetailedModal={() => setIsSOSModalOpen(true)} />

              {/* Live Feeds Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <LiveMiniFeed onNavigateTab={(tab) => setCurrentTab(tab as TabType)} />
                <div className="space-y-4">
                  <QuickChatBox />
                  <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-900/30 text-xs text-slate-300 space-y-1.5">
                    <span className="font-bold text-cyan-300">Resilient Routing Protocol:</span>
                    <p className="text-slate-400 leading-relaxed">
                      Every packet broadcasted by this device is assigned a unique <code className="font-mono text-cyan-300">msg_id</code> and a Time-To-Live <code className="font-mono text-cyan-300">hop_count</code>.
                      Participating neighbors on the subnet receive the packet, verify it is not in their duplicate cache, decrement the hop count, and rebroadcast.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'sos' && (
            <div className="animate-fadeIn">
              <IncidentFeed />
            </div>
          )}

          {currentTab === 'messages' && (
            <div className="animate-fadeIn">
              <EmergencyChat />
            </div>
          )}

          {currentTab === 'network' && (
            <div className="animate-fadeIn">
              <NetworkMonitor />
            </div>
          )}

          {currentTab === 'topology' && (
            <div className="animate-fadeIn">
              <MeshTopologyVisualizer />
            </div>
          )}

          {currentTab === 'nodes' && (
            <div className="animate-fadeIn">
              <NodesCatalog />
            </div>
          )}

          {currentTab === 'demo' && (
            <div className="animate-fadeIn">
              <DemoSimulator />
            </div>
          )}

          {currentTab === 'settings' && (
            <div className="animate-fadeIn space-y-4">
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
                <h2 className="text-base font-bold text-white mb-2">Node Configuration & Preferences</h2>
                <p className="text-xs text-slate-400 mb-4">
                  Click the button below to modify runtime networking socket options, role, or clear local storage.
                </p>
                <button
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow transition"
                >
                  Open Configuration Dialog
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <SOSModal
        isOpen={isSOSModalOpen}
        onClose={() => setIsSOSModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
};
