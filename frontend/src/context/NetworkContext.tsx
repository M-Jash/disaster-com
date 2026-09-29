import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  MessageItem,
  NodeInfo,
  NetworkStats,
  TelemetryEvent,
  SystemStatus,
  SimulationResult,
  IncidentStatus,
  EmergencyCategory,
  PriorityLevel,
  LocationData,
  UserRole,
} from '../types';
import { api } from '../services/api';
import { playEmergencyAlertSound, playPacketRelayChirp } from '../utils/audio';

interface NetworkContextType {
  messages: MessageItem[];
  incidents: MessageItem[];
  nodes: NodeInfo[];
  stats: NetworkStats;
  events: TelemetryEvent[];
  systemStatus: SystemStatus | null;
  selfNodeInfo: any;
  isConnected: boolean;
  isMuted: boolean;
  activeSimulation: SimulationResult | null;
  toggleMute: () => void;
  sendMessage: (
    text: string,
    priority?: PriorityLevel,
    category?: EmergencyCategory,
    location?: LocationData,
    senderName?: string,
    hops?: number
  ) => Promise<MessageItem>;
  sendSOS: (
    category: EmergencyCategory,
    text: string,
    priority?: PriorityLevel,
    location?: LocationData,
    senderName?: string,
    hops?: number
  ) => Promise<MessageItem>;
  updateIncidentStatus: (msg_id: string, status: IncidentStatus) => Promise<void>;
  clearHistory: () => Promise<void>;
  triggerPing: () => Promise<void>;
  updateSettings: (data: {
    node_name?: string;
    role?: UserRole;
    relay_enabled?: boolean;
    default_hop_count?: number;
    udp_port?: number;
    broadcast_ip?: string;
  }) => Promise<void>;
  runSimulation: (scenario: string, hops?: number, origin?: string, text?: string) => Promise<SimulationResult>;
  refreshAll: () => Promise<void>;
}

const defaultStats: NetworkStats = {
  active_nodes: 1,
  active_sos: 0,
  total_messages: 0,
  avg_hop_count: 0,
  packets_sent: 0,
  packets_received: 0,
  packets_relayed: 0,
  duplicates_dropped: 0,
  expired_dropped: 0,
  invalid_packets: 0,
  socket_port: 50005,
  broadcast_ip: '255.255.255.255',
  relay_enabled: true,
  node_id: 'INIT',
  role: 'RESPONDER',
};

const NetworkContext = createContext<NetworkContextType | null>(null);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [incidents, setIncidents] = useState<MessageItem[]>([]);
  const [nodes, setNodes] = useState<NodeInfo[]>([]);
  const [stats, setStats] = useState<NetworkStats>(defaultStats);
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [selfNodeInfo, setSelfNodeInfo] = useState<any>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeSimulation, setActiveSimulation] = useState<SimulationResult | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const toggleMute = () => setIsMuted((prev) => !prev);

  // Initial Data Fetch
  const refreshAll = useCallback(async () => {
    try {
      const [msgs, incs, nds, st, evts, sysStatus, selfInfo] = await Promise.all([
        api.getMessages(100),
        api.getIncidents(),
        api.getNodes(),
        api.getStats(),
        api.getEvents(150),
        api.getStatus().catch(() => null),
        api.getSelfNode().catch(() => null),
      ]);

      setMessages(msgs);
      setIncidents(incs);
      setNodes(nds);
      setStats(st);
      setEvents(evts);
      if (sysStatus) setSystemStatus(sysStatus);
      if (selfInfo) setSelfNodeInfo(selfInfo);
      setIsConnected(true);
    } catch {
      setIsConnected(false);
    }
  }, []);

  // Setup Live WebSocket Connection
  useEffect(() => {
    let unmounted = false;

    function connectWebSocket() {
      if (unmounted) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (unmounted) return;
        setIsConnected(true);
        refreshAll();
      };

      ws.onmessage = (event) => {
        if (unmounted) return;
        try {
          const payload = JSON.parse(event.data);
          const { event: evtType, data } = payload;

          if (evtType === 'PACKET_RECEIVED') {
            const pkt: MessageItem = data.packet;
            if (pkt.type === 'SOS') {
              if (!isMuted) playEmergencyAlertSound();
              setIncidents((prev) => [pkt, ...prev.filter((i) => i.msg_id !== pkt.msg_id)]);
            } else if (pkt.type === 'NORMAL' || pkt.type === 'STATUS') {
              if (!isMuted) playPacketRelayChirp();
              setMessages((prev) => [pkt, ...prev.filter((m) => m.msg_id !== pkt.msg_id)]);
            }
            if (data.stats) setStats(data.stats);
            if (data.nodes) setNodes(data.nodes);
          } else if (evtType === 'PACKET_SENT') {
            const pkt: MessageItem = data.packet;
            if (pkt.type === 'SOS') {
              setIncidents((prev) => [pkt, ...prev.filter((i) => i.msg_id !== pkt.msg_id)]);
            } else {
              setMessages((prev) => [pkt, ...prev.filter((m) => m.msg_id !== pkt.msg_id)]);
            }
            if (data.stats) setStats(data.stats);
          } else if (evtType === 'PACKET_RELAYED') {
            if (!isMuted) playPacketRelayChirp();
            if (data.stats) setStats(data.stats);
          } else if (evtType === 'INCIDENT_STATUS_UPDATED') {
            setIncidents((prev) =>
              prev.map((inc) =>
                inc.msg_id === data.msg_id ? { ...inc, incident_status: data.status } : inc
              )
            );
            if (data.stats) setStats(data.stats);
          } else if (evtType === 'TELEMETRY_UPDATE' || evtType === 'SETTINGS_UPDATED') {
            if (data.stats) setStats(data.stats);
          } else if (evtType === 'HISTORY_CLEARED') {
            setMessages([]);
            setIncidents([]);
            setEvents([]);
            setNodes([]);
            if (data.stats) setStats(data.stats);
          } else if (evtType === 'SIMULATION_RUN') {
            // Live simulation broadcast
          }

          // Fetch fresh events & stats on any telemetry change
          api.getEvents(80).then(setEvents).catch(() => {});
          api.getStats().then(setStats).catch(() => {});
          api.getNodes().then(setNodes).catch(() => {});
        } catch {
          // Ignore invalid messages
        }
      };

      ws.onclose = () => {
        if (unmounted) return;
        setIsConnected(false);
        // Auto-reconnect after 3 seconds
        reconnectTimeoutRef.current = window.setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connectWebSocket();
    refreshAll();

    // Fallback polling interval every 8 seconds
    const interval = setInterval(() => {
      refreshAll();
    }, 8000);

    return () => {
      unmounted = true;
      clearInterval(interval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [refreshAll, isMuted]);

  // Actions
  const sendMessage = async (
    text: string,
    priority: PriorityLevel = 'MEDIUM',
    category: EmergencyCategory = 'GENERAL',
    location?: LocationData,
    senderName?: string,
    hops?: number
  ) => {
    const res = await api.sendMessage({
      text,
      priority,
      category,
      location,
      sender_name: senderName,
      hop_count: hops,
    });
    setMessages((prev) => [res, ...prev.filter((m) => m.msg_id !== res.msg_id)]);
    refreshAll();
    return res;
  };

  const sendSOS = async (
    category: EmergencyCategory,
    text: string,
    priority: PriorityLevel = 'CRITICAL',
    location?: LocationData,
    senderName?: string,
    hops?: number
  ) => {
    const res = await api.sendSOS({
      category,
      text,
      priority,
      location,
      sender_name: senderName,
      hop_count: hops,
    });
    setIncidents((prev) => [res, ...prev.filter((i) => i.msg_id !== res.msg_id)]);
    if (!isMuted) playEmergencyAlertSound();
    refreshAll();
    return res;
  };

  const updateIncidentStatus = async (msg_id: string, status: IncidentStatus) => {
    await api.updateIncidentStatus(msg_id, status);
    setIncidents((prev) =>
      prev.map((inc) => (inc.msg_id === msg_id ? { ...inc, incident_status: status } : inc))
    );
    refreshAll();
  };

  const clearHistory = async () => {
    await api.clearHistory();
    setMessages([]);
    setIncidents([]);
    setEvents([]);
    setNodes([]);
    refreshAll();
  };

  const triggerPing = async () => {
    await api.triggerPing();
    refreshAll();
  };

  const updateSettings = async (data: {
    node_name?: string;
    role?: UserRole;
    relay_enabled?: boolean;
    default_hop_count?: number;
    udp_port?: number;
    broadcast_ip?: string;
  }) => {
    await api.updateSettings(data);
    refreshAll();
  };

  const runSimulation = async (scenario: string, hops?: number, origin?: string, text?: string) => {
    const res = await api.runSimulation({
      scenario,
      initial_hops: hops,
      origin_node: origin,
      message_text: text,
    });
    setActiveSimulation(res);
    return res;
  };

  return (
    <NetworkContext.Provider
      value={{
        messages,
        incidents,
        nodes,
        stats,
        events,
        systemStatus,
        selfNodeInfo,
        isConnected,
        isMuted,
        activeSimulation,
        toggleMute,
        sendMessage,
        sendSOS,
        updateIncidentStatus,
        clearHistory,
        triggerPing,
        updateSettings,
        runSimulation,
        refreshAll,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
