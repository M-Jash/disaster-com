import React, { useState } from 'react';
import { useNetwork } from '../../context/NetworkContext';
import { Send, MessageSquare, Zap } from 'lucide-react';

const QUICK_CHIPS = [
  '🟢 All team members accounted for & safe',
  '🚑 Need First Aid supplies at our location',
  '⚠️ Main road blocked by debris, seek alternate route',
  '📦 Food and clean water distribution needed',
  '📶 Mesh repeater signal verified and strong',
];

export const QuickChatBox: React.FC = () => {
  const { sendMessage } = useNetwork();
  const [text, setText] = useState<string>('');
  const [senderName, setSenderName] = useState<string>(() => sessionStorage.getItem('decs_user_name') || '');
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsBroadcasting(true);
    try {
      await sendMessage(
        text.trim(),
        'MEDIUM',
        'GENERAL',
        undefined,
        senderName.trim() || undefined
      );
      setText('');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleChipClick = (chip: string) => {
    setText(chip);
  };

  return (
    <div className="p-6 rounded-[32px] bg-[#eaf1f1] text-slate-900 border border-white/80 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-full bg-[#ff4e18] text-white shadow-sm">
            <MessageSquare className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black text-slate-900 tracking-wide font-mono">Quick Mesh Broadcast</h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500 font-bold bg-[#dce5e7] px-2.5 py-1 rounded-full">
          PORT 50005
        </span>
      </div>

      {/* Quick Template Chips */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {QUICK_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleChipClick(chip)}
            className="text-[10px] font-mono px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-[#ff4e18] hover:bg-orange-50 text-slate-700 transition truncate max-w-full font-medium"
          >
            {chip}
          </button>
        ))}
      </div>

      <form onSubmit={handleSend} className="space-y-2.5 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          <div className="sm:col-span-1">
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Callsign / Alias"
              className="w-full px-4 py-3 rounded-full bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff4e18] focus:ring-2 focus:ring-[#ff4e18]/20 transition font-mono shadow-sm"
            />
          </div>

          <div className="sm:col-span-3 flex space-x-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Broadcast status or info to nearby nodes..."
              className="flex-1 px-5 py-3 rounded-full bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff4e18] focus:ring-2 focus:ring-[#ff4e18]/20 transition font-mono shadow-sm"
            />
            <button
              type="submit"
              disabled={isBroadcasting || !text.trim()}
              className="px-6 py-3 rounded-full bg-[#ff4e18] hover:bg-[#ff6535] disabled:opacity-40 text-white font-mono font-bold text-xs flex items-center space-x-1.5 transition shadow-md shadow-[#ff4e18]/40 active:scale-95 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
