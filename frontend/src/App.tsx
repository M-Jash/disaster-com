import React, { useState, useEffect } from 'react';
import { NetworkProvider } from './context/NetworkContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UserRole } from './types';

export const App: React.FC = () => {
  const [sessionUser, setSessionUser] = useState<{
    name: string;
    nodeId: string;
    role: UserRole;
  } | null>(null);

  const [viewMode, setViewMode] = useState<'LANDING' | 'APP'>('LANDING');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedName = sessionStorage.getItem('decs_user_name');
    const savedNodeId = sessionStorage.getItem('decs_node_id');
    const savedRole = (sessionStorage.getItem('decs_user_role') as UserRole) || 'RESPONDER';

    if (savedName && savedNodeId) {
      setSessionUser({
        name: savedName,
        nodeId: savedNodeId,
        role: savedRole,
      });
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (name: string, nodeId: string, role: UserRole) => {
    setSessionUser({ name, nodeId, role });
    setViewMode('APP');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('decs_user_name');
    sessionStorage.removeItem('decs_node_id');
    sessionStorage.removeItem('decs_user_role');
    setSessionUser(null);
    setViewMode('LANDING');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b111e] flex items-center justify-center text-slate-400 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>INITIALIZING RAPIDCONNECT PLATFORM...</span>
        </div>
      </div>
    );
  }

  return (
    <NetworkProvider>
      {viewMode === 'LANDING' ? (
        <LandingPage
          onLaunchDashboard={() => setViewMode('APP')}
          onExploreDemo={() => setViewMode('APP')}
        />
      ) : sessionUser ? (
        <DashboardPage onLogout={handleLogout} />
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </NetworkProvider>
  );
};

export default App;
