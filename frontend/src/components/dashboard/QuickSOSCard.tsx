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
  ShieldAlert,
  ArrowRight,
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

  const categories: { id: EmergencyCategory; label: string; icon: any }[] = [
    { id: 'MEDICAL', label: 'Medical Aid', icon: HeartPulse },
    { id: 'TRAPPED', label: 'Trapped / Debris', icon: LifeBuoy },
    { id: 'FIRE', label: 'Fire / Hazard', icon: Flame },
    { id: 'FLOOD', label: 'Flood / Water', icon: Waves },
    { id: 'FOOD_WATER', label: 'Supplies / Food', icon: Apple },
    { id: 'MISSING_PERSON', label: 'Missing Person', icon: UserX },
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
    <div className="p-6 sm:p-7 rounded-[32px] bg-[#eaf1f1] text-slate-900 border border-white/80 shadow-2xl relative overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-full bg-[#ff4e18] text-white shadow-md shadow-[#ff4e18]/40">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 font-mono">
                RAPID EMERGENCY SOS DISPATCH
              </h2>
              <span className="px-3 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#ff4e18] text-white">
                HIGH PRIORITY
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">Instant multi-hop UDP broadcast to all mesh transceivers</p>
          </div>
        </div>

        <button
          onClick={onOpenDetailedModal}
          className="px-4 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-800 text-xs font-mono font-bold border border-slate-300 shadow-sm transition flex items-center gap-1.5"
        >
          <span>Detailed Mode & GPS</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {successNotice && (
        <div className="mb-4 p-3.5 rounded-2xl bg-emerald-100 border border-emerald-300 text-xs font-mono font-bold text-emerald-900 flex items-center justify-between animate-fadeIn shadow-sm">
          <span>✓ SOS Alert broadcasted over UDP and added to active mesh relay queue.</span>
        </div>
      )}

      {/* Category Pills - Bento Style */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5 mb-5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center justify-center gap-2 px-3 py-3 rounded-full border text-xs font-mono font-bold transition-all duration-200 active:scale-95 ${
                isSelected
                  ? 'bg-[#ff4e18] text-white border-[#ff4e18] shadow-lg shadow-[#ff4e18]/30 scale-[1.02]'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{cat.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleQuickSend} className="space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <input
              type="text"
              value={sosText}
              onChange={(e) => setSosText(e.target.value)}
              placeholder={`Situation details (e.g. 3 people trapped on roof near collapsed bridge)...`}
              className="w-full px-5 py-3.5 rounded-full bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff4e18] focus:ring-2 focus:ring-[#ff4e18]/20 transition font-sans shadow-sm"
            />
          </div>

          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
            <input
              type="text"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              placeholder="Landmark / Sector / Room #"
              className="w-full pl-11 pr-4 py-3.5 rounded-full bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff4e18] focus:ring-2 focus:ring-[#ff4e18]/20 transition font-sans shadow-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs font-mono">
          <span className="text-slate-600">
            Broadcasting as: <strong className="text-slate-900">{sessionStorage.getItem('decs_user_name') || 'Local Node'}</strong> • Max TTL: <strong className="text-[#ff4e18]">5 Hops</strong>
          </span>

          {/* Solid Orange Pill Button with Black Circle Icon */}
          <button
            type="submit"
            disabled={isSending}
            className="flex items-center space-x-2.5 px-7 py-3.5 rounded-full bg-[#ff4e18] hover:bg-[#ff6230] disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-[#ff4e18]/40 transition-all transform hover:scale-[1.02] active:scale-[0.98] tracking-wider"
          >
            <span>{isSending ? 'TRANSMITTING...' : 'BROADCAST SOS NOW'}</span>
            <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center text-white">
              <Send className="w-3 h-3" />
            </div>
          </button>
        </div>
      </form>
    </div>
  );
};
