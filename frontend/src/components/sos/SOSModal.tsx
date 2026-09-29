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
  const [senderName, setSenderName] = useState<string>('');
  const [locationDesc, setLocationDesc] = useState<string>('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [hopCount, setHopCount] = useState<number>(5);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories: { id: EmergencyCategory; label: string; icon: any; color: string }[] = [
    { id: 'MEDICAL', label: 'Medical Assistance', icon: HeartPulse, color: 'text-rose-400 border-rose-600/40 bg-rose-950/20' },
    { id: 'TRAPPED', label: 'Trapped / Structural', icon: LifeBuoy, color: 'text-amber-400 border-amber-600/40 bg-amber-950/20' },
    { id: 'FIRE', label: 'Fire / Explosion', icon: Flame, color: 'text-orange-400 border-orange-600/40 bg-orange-950/20' },
    { id: 'FLOOD', label: 'Flood / Rising Water', icon: Waves, color: 'text-blue-400 border-blue-600/40 bg-blue-950/20' },
    { id: 'FOOD_WATER', label: 'Food / Water Supply', icon: Apple, color: 'text-emerald-400 border-emerald-600/40 bg-emerald-950/20' },
    { id: 'MISSING_PERSON', label: 'Missing Person', icon: UserX, color: 'text-purple-400 border-purple-600/40 bg-purple-950/20' },
    { id: 'GENERAL', label: 'Other Emergency', icon: HelpCircle, color: 'text-slate-300 border-slate-600/40 bg-slate-900' },
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
        setGeoError(`GPS unavailable: ${err.message}. You can enter coordinates or a landmark manually.`);
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
      <div className="w-full max-w-2xl bg-slate-900 border border-red-900/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-950/80 to-slate-900 border-b border-red-900/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/40 animate-pulse-sos">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                EMERGENCY SOS BROADCAST
              </h2>
              <p className="text-xs text-red-300/80">
                High-priority multi-hop packet dispatch over UDP mesh
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* 1. Category Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              1. Emergency Category <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center space-x-2 p-2.5 rounded-xl border text-xs font-semibold transition text-left ${
                      isSelected
                        ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-950/60 scale-[1.02]'
                        : `text-slate-300 ${cat.color} hover:border-slate-600`
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
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              2. Situation / Message Details <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Provide critical situation details: Number of people affected, specific danger, immediate injuries, access restrictions..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
            />
          </div>

          {/* 3. Priority & Caller Alias */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Priority Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['CRITICAL', 'HIGH', 'MEDIUM'] as PriorityLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setPriority(lvl)}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      priority === lvl
                        ? lvl === 'CRITICAL'
                          ? 'bg-red-600 text-white border-red-500 shadow'
                          : lvl === 'HIGH'
                          ? 'bg-amber-600 text-white border-amber-500 shadow'
                          : 'bg-cyan-600 text-white border-cyan-500 shadow'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Caller Callsign / Name (Optional)
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="e.g. Civilian Alice / Rescue Unit 3"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition"
              />
            </div>
          </div>

          {/* 4. Location Information */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-cyan-400" />
                Location & Coordinates
              </label>

              <button
                type="button"
                onClick={handleFetchGeolocation}
                disabled={isLocating}
                className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900 text-xs transition"
              >
                <Compass className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Detecting GPS...' : 'Auto-Detect GPS'}</span>
              </button>
            </div>

            {geoError && <p className="text-[11px] text-amber-400">{geoError}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={locationDesc}
                onChange={(e) => setLocationDesc(e.target.value)}
                placeholder="Landmark / Sector / Room # (e.g. Block C, Roof)"
                className="sm:col-span-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />

              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="Latitude (e.g. 12.9716)"
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />

              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="Longitude (e.g. 77.5946)"
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* 5. TTL / Hop Count Slider */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-slate-300">Initial Relay Hop Limit (TTL):</span>
              <p className="text-[11px] text-slate-500">Number of mesh forward hops before packet expires</p>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min={1}
                max={10}
                value={hopCount}
                onChange={(e) => setHopCount(parseInt(e.target.value))}
                className="w-24 accent-red-500"
              />
              <span className="font-mono font-bold text-white bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
                {hopCount} Hops
              </span>
            </div>
          </div>

          {/* Disclaimer / Warning Box */}
          <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/40 text-xs text-red-300/90 flex items-start space-x-2">
            <Radio className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p>
              Your SOS will be encoded into a <strong>JSON UDP broadcast packet</strong> and propagated through all nearby participating DECS nodes.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !text.trim()}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold shadow-xl shadow-red-950 transition transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'DISPATCHING...' : 'CONFIRM & BROADCAST SOS'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
