import React, { useState } from 'react';
import { NetworkProvider } from './context/NetworkContext';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { TabType } from './components/layout/Sidebar';

export const App: React.FC = () => {
  const [inApp, setInApp] = useState<boolean>(true); // Default directly to tactical command dashboard for fast workflow
  const [initialTab, setInitialTab] = useState<TabType>('dashboard');

  return (
    <NetworkProvider>
      {inApp ? (
        <DashboardPage initialTab={initialTab} />
      ) : (
        <LandingPage
          onLaunchDashboard={() => {
            setInitialTab('dashboard');
            setInApp(true);
          }}
          onExploreDemo={() => {
            setInitialTab('demo');
            setInApp(true);
          }}
        />
      )}
    </NetworkProvider>
  );
};

export default App;
