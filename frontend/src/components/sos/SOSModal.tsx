import React, { useState } from 'react';
import { useNetwork } from '../../context/NetworkContext';
import { EmergencyCategory, PriorityLevel } from '../../types';
import {
  AlertTriangle,
  X,
  MapPin,
  Compass,
  HeartPulse,
  LifeBuoy,
  Flame,
  Waves,
  Apple,
  UserX,
  HelpCircle,
  Send,
  Radio,
  ShieldAlert,
} from 'lucide-react';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SOSModal: React.FC<SOSModalProps> = ({ isOpen, onClose }) => {
  const { sendSOS, selfNodeInfo, stats } = useNetwork();

  const [category, setCategory] = useState<EmergencyCategory>('MEDICAL');
  const [priority, setPriority] = useState<PriorityLevel>('CRITICAL');
  const [text, setText] = useState<string>('');
  const [senderName, setSenderName] = useState<string>(() => sessionStorage.getItem('decs_user_name') || '');
  const [locationDesc, setLocationDesc] = useState<string>('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [hopCount, setHopCount] = useState<number>(5);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories: { id: EmergencyCategory; label: string; icon: any; color: string; activeStyle: string }[] = [
    { id: 'MEDICAL', label: 'Medical Emergency', icon: HeartPulse, color: 'text-slate-800 border-slate-200', activeStyle: 'bg-[#ff4e18] text-white border-transparent shadow-md' },
    { id: 'TRAPPED', label: 'Trapped / Structural', icon: LifeBuoy, color: 'text-slate-800 border-slate-200', activeStyle: 'bg-[#ff4e18] text-white border-transparent shadow-md' },
    { id: 'FIRE', label: 'Fire / Explosion', icon: Flame, color: 'text-slate-800 border-slate-200', activeStyle: 'bg-[#ff4e18] text-white border-transparent shadow-md' },
    { id: 'FLOOD', label: 'Flood / Water Hazard', icon: Waves, color: 'text-slate-800 border-slate-200', activeStyle: 'bg-[#ff4e18] text-white border-transparent shadow-md' },
    { id: 'FOOD_WATER', label: 'Food / Water Supply', icon: Apple, color: 'text-slate-800 border-slate-200', activeStyle: 'bg-[#ff4e18] text-white border-transparent shadow-md' },
    { id: 'MISSING_PERSON', label: 'Missing Person', icon: UserX, color: 'text-slate-800 border-slate-200', activeStyle: 'bg-[#ff4e18] text-white border-transparent shadow-md' },
    { id: 'GENERAL', label: 'Other Emergency', icon: HelpCircle, color: 'text-slate-800 border-slate-200', activeStyle: 'bg-black text-white border-transparent shadow-md' },
  ];

  const handleFetchGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoError('GPS Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(5));
        setLongitude(pos.coords.longitude.toFixed(5));
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setGeoError(`GPS unavailable: ${err.message}. You can enter coordinates or landmark manually.`);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
      const latNum = latitude ? parseFloat(latitude) : undefined;
      const lonNum = longitude ? parseFloat(longitude) : undefined;

      await sendSOS(
        category,
        text.trim(),
        priority,
        {
          latitude: !isNaN(latNum as number) ? latNum : null,
          longitude: !isNaN(lonNum as number) ? lonNum : null,
          description: locationDesc.trim() || undefined,
        },
        senderName.trim() || undefined,
        hopCount
      );

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#eaf1f1] text-slate-900 border border-white/80 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-white/70 border-b border-slate-300/70 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-full bg-[#ff4e18] text-white">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-wide font-mono">
                EMERGENCY SOS BROADCAST
              </h2>
              <p className="text-xs text-slate-600 font-mono">
                High-priority multi-hop packet dispatch over UDP mesh
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white text-slate-600 hover:text-slate-900 border border-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 font-mono">
          {/* 1. Category Selection */}
          <div>
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
              1. Emergency Category <span className="text-[#ff4e18]">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center space-x-2.5 p-3 rounded-full border text-xs font-bold transition text-left ${
                      isSelected
                        ? cat.activeStyle
                        : `bg-white text-slate-800 ${cat.color} hover:border-slate-300 hover:bg-slate-50`
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Emergency Message Details */}
          <div>
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
              2. Situation Details <span className="text-[#ff4e18]">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Provide critical details: number of people affected, specific hazard, immediate injuries, access restrictions..."
              className="w-full px-5 py-3.5 rounded-3xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff4e18] focus:ring-2 focus:ring-[#ff4e18]/20 transition shadow-sm font-sans"
            />
          </div>

          {/* 3. Priority & Caller Alias */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                Priority Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['CRITICAL', 'HIGH', 'MEDIUM'] as PriorityLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setPriority(lvl)}
                    className={`py-2.5 rounded-full text-xs font-bold border transition ${
                      priority === lvl
                        ? lvl === 'CRITICAL'
                          ? 'bg-[#ff4e18] text-white border-transparent shadow'
                          : 'bg-black text-white border-transparent shadow'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                Operator Callsign (Optional)
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="e.g. Civilian Alice / Rescue Unit 3"
                className="w-full px-4 py-2.5 rounded-full bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff4e18]"
              />
            </div>
          </div>

          {/* 4. Location Information */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#ff4e18]" />
                Location & Coordinates
              </label>

              <button
                type="button"
                onClick={handleFetchGeolocation}
                disabled={isLocating}
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-[#dce5e7] text-slate-800 hover:bg-slate-200 text-xs font-bold transition"
              >
                <Compass className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Detecting GPS...' : 'Auto-Detect GPS'}</span>
              </button>
            </div>

            {geoError && <p className="text-[11px] text-amber-700 font-bold">{geoError}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={locationDesc}
                onChange={(e) => setLocationDesc(e.target.value)}
                placeholder="Landmark / Sector / Room # (e.g. Block C)"
                className="sm:col-span-1 px-4 py-2.5 rounded-full bg-[#eaf1f1] border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff4e18]"
              />

              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="Latitude (e.g. 12.9716)"
                className="px-4 py-2.5 rounded-full bg-[#eaf1f1] border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff4e18]"
              />

              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="Longitude (e.g. 77.5946)"
                className="px-4 py-2.5 rounded-full bg-[#eaf1f1] border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff4e18]"
              />
            </div>
          </div>

          {/* 5. TTL / Hop Count Slider */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 flex items-center justify-between text-xs shadow-sm">
            <div>
              <span className="font-black text-slate-900">Initial Relay Hop Limit (TTL):</span>
              <p className="text-[11px] text-slate-500 font-sans">Number of mesh forward hops before packet terminates</p>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min={1}
                max={10}
                value={hopCount}
                onChange={(e) => setHopCount(parseInt(e.target.value))}
                className="w-24 accent-[#ff4e18]"
              />
              <span className="font-bold text-slate-900 bg-[#dce5e7] px-3.5 py-1 rounded-full">
                {hopCount} Hops
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold transition border border-slate-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !text.trim()}
              className="flex items-center space-x-2 px-7 py-2.5 rounded-full bg-[#ff4e18] hover:bg-[#ff6535] disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-[#ff4e18]/40 transition transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'TRANSMITTING...' : 'BROADCAST SOS ALERT'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
