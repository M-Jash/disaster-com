import {
  MessageItem,
  NodeInfo,
  NetworkStats,
  TelemetryEvent,
  SystemStatus,
  SimulationResult,
  LocationData,
  PriorityLevel,
  EmergencyCategory,
  IncidentStatus,
  UserRole,
} from '../types';

const API_BASE = '/api';

export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errData.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  // System Status
  getStatus: () => fetchJson<SystemStatus>(`${API_BASE}/status`),

  // Messages
  getMessages: (limit = 100, type?: string) => {
    const query = type ? `?limit=${limit}&type=${type}` : `?limit=${limit}`;
    return fetchJson<MessageItem[]>(`${API_BASE}/messages${query}`);
  },
  sendMessage: (data: {
    text: string;
    priority?: PriorityLevel;
    category?: EmergencyCategory;
    location?: LocationData;
    sender_name?: string;
    hop_count?: number;
  }) =>
    fetchJson<MessageItem>(`${API_BASE}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Incidents / SOS
  getIncidents: (status = 'ALL', category = 'ALL', priority = 'ALL') =>
    fetchJson<MessageItem[]>(
      `${API_BASE}/incidents?status=${status}&category=${category}&priority=${priority}`
    ),
  sendSOS: (data: {
    category: EmergencyCategory;
    text: string;
    priority?: PriorityLevel;
    location?: LocationData;
    sender_name?: string;
    hop_count?: number;
  }) =>
    fetchJson<MessageItem>(`${API_BASE}/sos`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateIncidentStatus: (msg_id: string, status: IncidentStatus) =>
    fetchJson<{ status: string; msg_id: string; new_status: IncidentStatus }>(
      `${API_BASE}/incidents/${msg_id}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    ),

  // Nodes
  getNodes: () => fetchJson<NodeInfo[]>(`${API_BASE}/nodes`),
  getSelfNode: () => fetchJson<any>(`${API_BASE}/nodes/self`),

  // Network & Telemetry
  getStats: () => fetchJson<NetworkStats>(`${API_BASE}/network/stats`),
  getEvents: (limit = 150) => fetchJson<TelemetryEvent[]>(`${API_BASE}/network/events?limit=${limit}`),
  clearHistory: () => fetchJson<{ status: string; message: string }>(`${API_BASE}/network/clear`, { method: 'POST' }),
  triggerPing: () => fetchJson<{ status: string; message: string }>(`${API_BASE}/network/ping`, { method: 'POST' }),

  // Settings
  getSettings: () => fetchJson<any>(`${API_BASE}/settings`),
  updateSettings: (data: {
    node_name?: string;
    role?: UserRole;
    relay_enabled?: boolean;
    default_hop_count?: number;
    udp_port?: number;
    broadcast_ip?: string;
  }) =>
    fetchJson<any>(`${API_BASE}/settings`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Demo Simulation
  runSimulation: (data: {
    scenario: string;
    initial_hops?: number;
    origin_node?: string;
    message_text?: string;
    emergency_type?: string;
    priority?: string;
    category?: string;
  }) =>
    fetchJson<SimulationResult>(`${API_BASE}/demo/simulate`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
