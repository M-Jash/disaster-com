import React, { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="bg-[#0e1422]/90 border-b border-orange-500/20 px-4 py-2 text-xs text-slate-300 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 font-mono">
        <div className="flex items-center space-x-2.5">
          <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0" />
          <p className="text-[11px] leading-tight text-slate-300">
            <strong className="text-orange-300">OFFLINE UDP BROADCAST MESH:</strong> Operating on port <span className="text-white font-bold">50005</span>.
            Zero cloud/cellular dependence. All packets propagate peer-to-peer via multi-hop relaying with sliding-window loop suppression.
          </p>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/[0.08] transition shrink-0"
          title="Dismiss notice"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
