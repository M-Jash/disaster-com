"""
DECS Pydantic Schemas and Data Models
Disaster Emergency Communication System (CNIP Mini-Project)
"""
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field
from datetime import datetime, timezone

# Types
MessageType = Literal["NORMAL", "SOS", "STATUS", "PING", "ACK"]
PriorityLevel = Literal["CRITICAL", "HIGH", "MEDIUM", "LOW"]
EmergencyCategory = Literal[
    "MEDICAL", "TRAPPED", "FIRE", "FLOOD", "FOOD_WATER", "MISSING_PERSON", "GENERAL", "STATUS"
]
IncidentStatus = Literal["NEW", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED"]
UserRole = Literal["CIVILIAN", "RESPONDER", "RELAY"]


class Location(BaseModel):
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0, description="Latitude coordinate")
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0, description="Longitude coordinate")
    description: Optional[str] = Field(None, max_length=120, description="Manual landmark/location description")


class PacketSchema(BaseModel):
    """Network Wire Packet Format (Compact JSON, Max ~1024 Bytes)"""
    version: str = Field(default="1.0", max_length=5)
    msg_id: str = Field(..., max_length=64, description="Globally unique message ID (e.g. NODE-7A21-1727515000-001)")
    sender: str = Field(..., max_length=32, description="Originating node identifier")
    sender_name: Optional[str] = Field(default="", max_length=50, description="Display name or alias")
    type: MessageType = Field(default="NORMAL", description="Packet type: NORMAL, SOS, STATUS, PING, ACK")
    text: str = Field(..., max_length=350, description="Message payload text")
    hop_count: int = Field(default=5, ge=0, le=16, description="Remaining Time-To-Live hops")
    initial_hops: int = Field(default=5, ge=1, le=16, description="Initial TTL when packet originated")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat(), description="ISO 8601 UTC timestamp")
    priority: PriorityLevel = Field(default="MEDIUM", description="Emergency priority level")
    category: EmergencyCategory = Field(default="GENERAL", description="Incident classification")
    location: Optional[Location] = Field(default=None, description="Optional GPS or manual landmark coordinates")
    relay_path: List[str] = Field(default_factory=list, description="Array of node IDs that relayed this packet")


class SendMessageRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=350)
    priority: PriorityLevel = "MEDIUM"
    category: EmergencyCategory = "GENERAL"
    location: Optional[Location] = None
    sender_name: Optional[str] = None
    sender_id: Optional[str] = None
    hop_count: Optional[int] = Field(default=None, ge=1, le=16)


class SendSOSRequest(BaseModel):
    category: EmergencyCategory = "MEDICAL"
    text: str = Field(..., min_length=1, max_length=350)
    priority: PriorityLevel = "CRITICAL"
    location: Optional[Location] = None
    sender_name: Optional[str] = None
    sender_id: Optional[str] = None
    hop_count: Optional[int] = Field(default=5, ge=1, le=16)


class UpdateIncidentRequest(BaseModel):
    status: IncidentStatus


class UpdateSettingsRequest(BaseModel):
    node_name: Optional[str] = None
    role: Optional[UserRole] = None
    relay_enabled: Optional[bool] = None
    default_hop_count: Optional[int] = Field(None, ge=1, le=16)
    udp_port: Optional[int] = Field(None, ge=1024, le=65535)
    broadcast_ip: Optional[str] = None


class MessageResponse(BaseModel):
    id: Optional[int] = None
    msg_id: str
    sender: str
    sender_name: Optional[str] = ""
    type: MessageType
    text: str
    timestamp: str
    hop_count: int
    initial_hops: int = 5
    priority: PriorityLevel = "MEDIUM"
    category: EmergencyCategory = "GENERAL"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_desc: Optional[str] = None
    relay_path: List[str] = []
    incident_status: IncidentStatus = "NEW"


class NodeInfo(BaseModel):
    node_id: str
    node_name: Optional[str] = ""
    role: str = "RELAY"
    ip_address: Optional[str] = ""
    last_seen: str
    status: str = "ACTIVE"
    packets_received: int = 0
    packets_sent: int = 0
    last_hop_count: int = 0


class TelemetryEvent(BaseModel):
    id: Optional[int] = None
    timestamp: str
    event_type: str
    msg_id: Optional[str] = None
    sender: Optional[str] = None
    details: Optional[str] = None
    raw_payload: Optional[str] = None
    hop_count: Optional[int] = None


class NetworkStats(BaseModel):
    active_nodes: int = 0
    active_sos: int = 0
    total_messages: int = 0
    avg_hop_count: float = 0.0
    packets_sent: int = 0
    packets_received: int = 0
    packets_relayed: int = 0
    duplicates_dropped: int = 0
    expired_dropped: int = 0
    invalid_packets: int = 0
    socket_port: int = 50005
    broadcast_ip: str = "255.255.255.255"
    relay_enabled: bool = True
    node_id: str = ""
    role: str = "RESPONDER"


class DemoSimulationStep(BaseModel):
    step_number: int
    current_node: str
    next_node: Optional[str]
    hop_count: int
    action: str  # "ORIGINATE", "RELAY", "DUPLICATE_DROP", "TTL_EXPIRE", "DELIVERED"
    details: str
    packet: Dict[str, Any]
