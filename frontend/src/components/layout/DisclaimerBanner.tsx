import React, { useState } from 'react';
import { Info, X, ShieldAlert } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="bg-slate-900/90 border-b border-cyan-900/40 px-4 py-2 text-xs text-slate-300 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />
          <p>
            <strong className="text-cyan-300">Local Mesh Scope Notice:</strong> DECS provides direct,
            resilient local communication across participating Wi-Fi / LAN devices using UDP broadcast and multi-hop relaying.
            It does not require cellular or internet connectivity. Transmission range is determined by local physical medium and network configuration.
          </p>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-slate-400 hover:text-slate-200 p-1 shrink-0"
          title="Dismiss notice"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
