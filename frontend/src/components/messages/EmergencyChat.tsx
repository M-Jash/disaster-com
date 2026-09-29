import React, { useState, useRef, useEffect } from 'react';
import { useNetwork } from '../../context/NetworkContext';
import { MessageItem, PriorityLevel, EmergencyCategory } from '../../types';
import {
  Send,
  MessageSquare,
  Route,
  Clock,
  Shield,
  AlertTriangle,
  Info,
  User,
  Sliders,
} from 'lucide-react';

export const EmergencyChat: React.FC = () => {
  const { messages, incidents, sendMessage, selfNodeInfo } = useNetwork();

  const [text, setText] = useState<string>('');
  const [senderName, setSenderName] = useState<string>('');
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

  const currentNodeId = selfNodeInfo?.node_id || 'LOCAL';

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
    <div className="h-[calc(100vh-12rem)] flex flex-col rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl overflow-hidden">
      {/* Chat Header & Filters */}
      <div className="px-5 py-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              Mesh Emergency Communication Channel
            </h2>
            <p className="text-[11px] text-slate-400">
              Multi-hop UDP broadcast chat with automatic loop prevention
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 text-xs">
          {['ALL', 'NORMAL', 'SOS', 'STATUS'].map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                typeFilter === f
                  ? 'bg-cyan-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Feed Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-xs text-slate-500 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-700" />
            <p>No messages recorded on this channel yet.</p>
            <p className="text-[11px] text-slate-600">Type a message below to broadcast to all participating local nodes.</p>
          </div>
        ) : (
          filtered.map((msg) => {
            const isSelf = msg.sender === currentNodeId;
            const isSOS = msg.type === 'SOS';
            const relayHops = Math.max(0, (msg.initial_hops || 5) - msg.hop_count);

            return (
              <div
                key={msg.msg_id}
                className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} max-w-2xl ${
                  isSelf ? 'ml-auto' : 'mr-auto'
                }`}
              >
                {/* Meta Header */}
                <div className="flex items-center space-x-2 text-[11px] text-slate-400 mb-1 px-1">
                  <span className="font-bold text-slate-200 font-mono flex items-center gap-1">
                    {msg.sender_name ? `${msg.sender_name} (${msg.sender})` : msg.sender}
                    {isSelf && <span className="text-[10px] text-cyan-400 font-sans">(You)</span>}
                  </span>

                  <span>•</span>

                  <span className="flex items-center gap-1 text-slate-500 font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>

                  {isSOS && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-950 text-red-400 border border-red-800">
                      SOS
                    </span>
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-md border ${
                    isSOS
                      ? 'bg-red-950/40 text-red-100 border-red-800/60 shadow-red-950/30'
                      : isSelf
                      ? 'bg-cyan-950/40 text-cyan-50 border-cyan-800/60'
                      : 'bg-slate-950/90 text-slate-200 border-slate-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* Relay Meta Badge */}
                <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-1 px-1 font-mono">
                  <span className="flex items-center gap-1 text-cyan-500">
                    <Route className="w-3 h-3" />
                    {relayHops === 0
                      ? 'Direct Broadcast (0 hops)'
                      : `Relayed through ${relayHops} hop(s)`}
                  </span>
                  <span>•</span>
                  <span>ID: {msg.msg_id}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Compose Bar */}
      <form onSubmit={handleSend} className="p-4 bg-slate-950 border-t border-slate-800 space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          <input
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="Callsign / Name (e.g. Unit 4)"
            className="sm:col-span-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as PriorityLevel)}
            className="sm:col-span-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="MEDIUM">Priority: Normal</option>
            <option value="HIGH">Priority: High</option>
            <option value="CRITICAL">Priority: Critical</option>
            <option value="LOW">Priority: Low</option>
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as EmergencyCategory)}
            className="sm:col-span-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="GENERAL">Category: General Status</option>
            <option value="MEDICAL">Category: Medical</option>
            <option value="TRAPPED">Category: Trapped</option>
            <option value="FIRE">Category: Fire</option>
            <option value="FLOOD">Category: Flood</option>
            <option value="FOOD_WATER">Category: Food & Water</option>
          </select>
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            required
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type emergency message to broadcast over local UDP mesh..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />

          <button
            type="submit"
            disabled={isSending || !text.trim()}
            className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-cyan-950 transition"
          >
            <Send className="w-4 h-4" />
            <span>{isSending ? 'SENDING...' : 'BROADCAST'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
