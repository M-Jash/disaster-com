import React, { useState, useRef, useEffect } from 'react';
import { useNetwork } from '../../context/NetworkContext';
import { PriorityLevel, EmergencyCategory } from '../../types';
import {
  Send,
  MessageSquare,
  Route,
  Clock,
  Radio,
  Sparkles,
  User,
  Shield,
  AlertTriangle,
} from 'lucide-react';

const CHAT_SHORTCUTS = [
  '🟢 Field station operational and monitoring',
  '🚨 Need immediate ambulance dispatched',
  '⚠️ Power line down on Sector 4 main road',
  '📦 Rations and drinking water needed at point B',
];

export const EmergencyChat: React.FC = () => {
  const { messages, incidents, sendMessage, selfNodeInfo } = useNetwork();

  const [text, setText] = useState<string>('');
  const [senderName, setSenderName] = useState<string>(() => sessionStorage.getItem('decs_user_name') || '');
  const [priority, setPriority] = useState<PriorityLevel>('MEDIUM');
  const [category, setCategory] = useState<EmergencyCategory>('GENERAL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [isSending, setIsSending] = useState<boolean>(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Combine messages and SOS into unified emergency channel
  const allMessages = [...messages, ...incidents]
    .filter((item, index, self) => index === self.findIndex((t) => t.msg_id === item.msg_id))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const filtered = allMessages.filter((m) => {
    if (typeFilter === 'SOS') return m.type === 'SOS';
    if (typeFilter === 'NORMAL') return m.type === 'NORMAL';
    if (typeFilter === 'STATUS') return m.type === 'STATUS';
    return true;
  });

  const sessionNodeId = sessionStorage.getItem('decs_node_id');
  const sessionUserName = sessionStorage.getItem('decs_user_name');
  const currentNodeId = sessionNodeId || selfNodeInfo?.node_id || 'LOCAL';

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filtered.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSending(true);
    try {
      await sendMessage(
        text.trim(),
        priority,
        category,
        undefined,
        senderName.trim() || undefined
      );
      setText('');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col rounded-[32px] bg-[#eaf1f1] text-slate-900 border border-white/80 shadow-2xl overflow-hidden">
      {/* Chat Header & Filters */}
      <div className="px-6 py-4 bg-white/70 border-b border-slate-300/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-full bg-[#ff4e18] text-white shadow-sm">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-slate-900 tracking-wide font-mono">
                Mesh Tactical Radio Channel
              </h2>
              <span className="px-3 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#ff4e18] text-white">
                UDP :50005
              </span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium font-sans">
              Zero-loop multi-hop UDP broadcast chat with sliding-window packet deduplication
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 text-xs font-mono">
          {['ALL', 'NORMAL', 'SOS', 'STATUS'].map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`px-3.5 py-1 rounded-full font-bold transition-all ${
                typeFilter === f
                  ? 'bg-[#ff4e18] text-white shadow-md shadow-[#ff4e18]/30'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Feed Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-xs text-slate-500 space-y-3 font-mono">
            <div className="p-4 rounded-full bg-white shadow-sm">
              <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
            </div>
            <p className="text-slate-800 font-bold">No messages recorded on this channel yet.</p>
            <p className="text-[11px] text-slate-500 max-w-sm font-sans">
              Type a broadcast message below or click a quick status chip to transmit across the local mesh network.
            </p>
          </div>
        ) : (
          filtered.map((msg) => {
            const isSelf = msg.sender === currentNodeId || Boolean(sessionUserName && msg.sender_name === sessionUserName);
            const isSOS = msg.type === 'SOS';
            const relayHops = Math.max(0, (msg.initial_hops || 5) - msg.hop_count);

            return (
              <div
                key={msg.msg_id}
                className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} max-w-2xl ${
                  isSelf ? 'ml-auto' : 'mr-auto'
                } animate-fadeIn`}
              >
                {/* Meta Header */}
                <div className="flex items-center space-x-2 text-[11px] text-slate-500 mb-1 px-1 font-mono">
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    {msg.sender_name ? `${msg.sender_name}` : msg.sender}
                    {isSelf && <span className="text-[10px] text-[#ff4e18] font-sans font-bold">(You)</span>}
                  </span>

                  <span>•</span>

                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3" />
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>

                  {isSOS && (
                    <span className="px-2.5 py-0.2 rounded-full text-[9px] font-bold bg-[#ff4e18] text-white">
                      SOS ALERT
                    </span>
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`p-4 rounded-[22px] text-sm leading-relaxed shadow-sm border ${
                    isSOS
                      ? 'bg-gradient-to-br from-[#ff5722] to-[#ff3800] text-white border-transparent shadow-md shadow-[#ff4e18]/30 font-medium'
                      : isSelf
                      ? 'bg-[#12151b] text-white border-transparent'
                      : 'bg-white text-slate-900 border-slate-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap font-sans">{msg.text}</p>
                </div>

                {/* Relay Meta Badge */}
                <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-1.5 px-1 font-mono">
                  <span className="flex items-center gap-1 text-slate-700 font-bold">
                    <Route className="w-3 h-3 text-[#ff4e18]" />
                    {relayHops === 0
                      ? 'Direct Transmission (0 hops)'
                      : `Relayed through ${relayHops} hop(s)`}
                  </span>
                  <span>•</span>
                  <span>Node: {msg.sender}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Compose Bar */}
      <form onSubmit={handleSend} className="p-5 bg-white/80 border-t border-slate-300/70 space-y-3">
        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-1.5">
          {CHAT_SHORTCUTS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setText(chip)}
              className="text-[10px] font-mono px-3 py-1 rounded-full bg-[#eaf1f1] hover:bg-orange-50 hover:border-[#ff4e18] border border-slate-200 text-slate-700 transition truncate max-w-full font-medium"
            >
              {chip}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs font-mono">
          <input
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="Callsign / Name"
            className="sm:col-span-1 px-4 py-2.5 rounded-full bg-[#eaf1f1] border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff4e18]"
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as PriorityLevel)}
            className="sm:col-span-1 px-4 py-2.5 rounded-full bg-[#eaf1f1] border border-slate-300 text-slate-900 focus:outline-none focus:border-[#ff4e18]"
          >
            <option value="MEDIUM">Priority: Normal</option>
            <option value="HIGH">Priority: High</option>
            <option value="CRITICAL">Priority: Critical</option>
            <option value="LOW">Priority: Low</option>
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as EmergencyCategory)}
            className="sm:col-span-2 px-4 py-2.5 rounded-full bg-[#eaf1f1] border border-slate-300 text-slate-900 focus:outline-none focus:border-[#ff4e18]"
          >
            <option value="GENERAL">Category: General Broadcast</option>
            <option value="MEDICAL">Category: Medical Assistance</option>
            <option value="TRAPPED">Category: Trapped / Rescue</option>
            <option value="FIRE">Category: Fire / Explosion</option>
            <option value="FLOOD">Category: Flood / Water Hazard</option>
            <option value="FOOD_WATER">Category: Food & Water</option>
          </select>
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            required
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type emergency packet message to broadcast over local UDP mesh..."
            className="flex-1 px-5 py-3 rounded-full bg-[#eaf1f1] border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff4e18] transition shadow-sm font-sans"
          />

          <button
            type="submit"
            disabled={isSending || !text.trim()}
            className="px-6 py-3 rounded-full bg-[#ff4e18] hover:bg-[#ff6535] disabled:opacity-40 text-white font-mono font-bold text-xs flex items-center space-x-2 shadow-md shadow-[#ff4e18]/40 transition active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>{isSending ? 'SENDING...' : 'BROADCAST'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
