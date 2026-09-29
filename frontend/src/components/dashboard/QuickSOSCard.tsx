import React, { useState } from 'react';
import { useNetwork } from '../../context/NetworkContext';
import { EmergencyCategory, PriorityLevel } from '../../types';
import {
  AlertTriangle,
  Flame,
  Waves,
  HeartPulse,
  UserX,
  Apple,
  LifeBuoy,
  Send,
  MapPin,
} from 'lucide-react';

interface QuickSOSCardProps {
  onOpenDetailedModal: () => void;
}

export const QuickSOSCard: React.FC<QuickSOSCardProps> = ({ onOpenDetailedModal }) => {
  const { sendSOS, selfNodeInfo } = useNetwork();
  const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory>('MEDICAL');
  const [sosText, setSosText] = useState<string>('');
  const [locationText, setLocationText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [successNotice, setSuccessNotice] = useState<boolean>(false);

  const categories: { id: EmergencyCategory; label: string; icon: any; color: string }[] = [
    { id: 'MEDICAL', label: 'Medical', icon: HeartPulse, color: 'text-rose-400 border-rose-500/40 hover:bg-rose-950/40' },
    { id: 'TRAPPED', label: 'Trapped', icon: LifeBuoy, color: 'text-amber-400 border-amber-500/40 hover:bg-amber-950/40' },
    { id: 'FIRE', label: 'Fire', icon: Flame, color: 'text-orange-400 border-orange-500/40 hover:bg-orange-950/40' },
    { id: 'FLOOD', label: 'Flood', icon: Waves, color: 'text-blue-400 border-blue-500/40 hover:bg-blue-950/40' },
    { id: 'FOOD_WATER', label: 'Food/Water', icon: Apple, color: 'text-emerald-400 border-emerald-500/40 hover:bg-emerald-950/40' },
    { id: 'MISSING_PERSON', label: 'Missing', icon: UserX, color: 'text-purple-400 border-purple-500/40 hover:bg-purple-950/40' },
  ];

  const handleQuickSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sosText.trim() && !selectedCategory) return;

    setIsSending(true);
    try {
      const text = sosText.trim() || `${selectedCategory} emergency reported via Quick SOS`;
      await sendSOS(
        selectedCategory,
        text,
        'CRITICAL',
        locationText.trim() ? { description: locationText.trim() } : undefined
      );
      setSosText('');
      setLocationText('');
      setSuccessNotice(true);
      setTimeout(() => setSuccessNotice(false), 3500);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-red-950/30 via-slate-900 to-slate-900 border border-red-900/40 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">Emergency SOS Dispatch</h2>
            <p className="text-xs text-slate-400">Broadcasts instant high-priority alert across local UDP mesh</p>
          </div>
        </div>

        <button
          onClick={onOpenDetailedModal}
          className="text-xs text-red-400 hover:text-red-300 font-medium underline underline-offset-2"
        >
          Detailed Mode & GPS
        </button>
      </div>

      {successNotice && (
        <div className="mb-3 p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center justify-between animate-fadeIn">
          <span>✓ SOS Alert broadcasted over UDP and added to active mesh relay queue.</span>
        </div>
      )}

      {/* Category Pills */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3.5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-semibold transition ${
                isSelected
                  ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-950/50 scale-[1.02]'
                  : `bg-slate-900/80 text-slate-300 ${cat.color}`
              }`}
            >
              <Icon className="w-4 h-4 mb-1" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleQuickSend} className="space-y-2.5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="md:col-span-2">
            <input
              type="text"
              value={sosText}
              onChange={(e) => setSosText(e.target.value)}
              placeholder={`Describe emergency details (e.g. 3 people stranded near bridge)...`}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
            />
          </div>

          <div className="relative">
            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              placeholder="Landmark / Sector / Room"
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 text-xs">
          <span className="text-slate-400">
            Node: <strong className="text-slate-200">{selfNodeInfo?.node_id || 'NODE-LOCAL'}</strong> • Initial Hops: <strong>5</strong>
          </span>

          <button
            type="submit"
            disabled={isSending}
            className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-red-950 transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSending ? 'BROADCASTING...' : 'BROADCAST SOS NOW'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
