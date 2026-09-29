import React, { useState } from 'react';
import { useNetwork } from '../../context/NetworkContext';
import { Send, MessageSquare, Shield } from 'lucide-react';

export const QuickChatBox: React.FC = () => {
  const { sendMessage, selfNodeInfo } = useNetwork();
  const [text, setText] = useState<string>('');
  const [senderName, setSenderName] = useState<string>('');
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

  return (
    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
      <div className="flex items-center space-x-2 mb-3">
        <MessageSquare className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-bold text-white tracking-wide">Quick Mesh Broadcast</h3>
      </div>

      <form onSubmit={handleSend} className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <div className="sm:col-span-1">
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Callsign / Name"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/70 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div className="sm:col-span-3 flex space-x-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Send status update or general information to nearby nodes..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700/70 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
            <button
              type="submit"
              disabled={isBroadcasting || !text.trim()}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold text-xs flex items-center space-x-1.5 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
