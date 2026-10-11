export type MessageType = "NORMAL" | "SOS" | "STATUS" | "PING" | "ACK";
export type PriorityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type EmergencyCategory =
  | "MEDICAL"
  | "TRAPPED"
  | "FIRE"
  | "FLOOD"
  | "FOOD_WATER"
  | "MISSING_PERSON"
  | "GENERAL"
  | "STATUS";

export type IncidentStatus = "NEW" | "ACKNOWLEDGED" | "IN_PROGRESS" | "RESOLVED";
export type UserRole = "CIVILIAN" | "RESPONDER" | "RELAY";

export interface LocationData {
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
}

export interface MessageItem {
  id?: number;
  msg_id: string;
  sender: string;
  sender_name?: string;
  type: MessageType;
  text: string;
  timestamp: string;
  hop_count: number;
  initial_hops: number;
  priority: PriorityLevel;
  category: EmergencyCategory;
  latitude?: number | null;
  longitude?: number | null;
  location_desc?: string | null;
  relay_path: string[];
  incident_status: IncidentStatus;
}

export interface NodeInfo {
  node_id: string;
  node_name?: string;
  role: string;
  ip_address?: string;
  last_seen: string;
  status: "ACTIVE" | "IDLE" | "OFFLINE";
  packets_received: number;
  packets_sent: number;
  last_hop_count: number;
}

export interface TelemetryEvent {
  id?: number;
  timestamp: string;
  event_type: "SENT" | "RECEIVED" | "RELAYED" | "DROPPED_DUPLICATE" | "DROPPED_EXPIRED" | "INVALID_PACKET" | "SOCKET_BOUND" | "SOCKET_ERROR" | "PEER_DISCOVERED";
  msg_id?: string | null;
  sender?: string | null;
  details?: string | null;
  raw_payload?: string | null;
  hop_count?: number | null;
}

export interface NetworkStats {
  active_nodes: number;
  active_sos: number;
  total_messages: number;
  avg_hop_count: number;
  packets_sent: number;
  packets_received: number;
  packets_relayed: number;
  duplicates_dropped: number;
  expired_dropped: number;
  invalid_packets: number;
  socket_port: number;
  broadcast_ip: string;
  relay_enabled: boolean;
  node_id: string;
  role: string;
}

export interface SystemStatus {
  status: string;
  node_id: string;
  node_name: string;
  role: string;
  udp_port: number;
  broadcast_ip: string;
  socket_bound: boolean;
  socket_error?: string | null;
  relay_enabled: boolean;
  default_hop_count: number;
  local_network: string;
  decs_engine: string;
  firebase_connected?: boolean;
  ws_connections: number;
}

export interface DemoStep {
  step: number;
  type: "ORIGINATE" | "RELAY" | "DUPLICATE_DROP" | "EXPIRED" | "DELIVERED";
  node: string;
  action: string;
  hop_count: number;
  relay_path: string[];
  details: string;
  status: string;
  status_color: "emerald" | "cyan" | "amber" | "rose";
}

export interface SimulationResult {
  status: string;
  scenario: string;
  msg_id: string;
  total_steps: number;
  steps: DemoStep[];
  is_simulation: boolean;
}
