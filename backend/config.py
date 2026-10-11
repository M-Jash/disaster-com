"""
DECS Configuration Module
Disaster Emergency Communication System (CNIP Mini-Project)
"""
import os
import random
import string
from dataclasses import dataclass, field
from typing import Optional


def generate_node_id() -> str:
    """Generate a realistic random node ID like NODE-7A21"""
    suffix = "".join(random.choices(string.hexdigits.upper()[:16], k=4))
    return f"NODE-{suffix}"


@dataclass
class Settings:
    # Node identity
    node_id: str = field(
        default_factory=lambda: os.getenv("DECS_NODE_ID", generate_node_id())
    )
    node_name: str = os.getenv("DECS_NODE_NAME", "Emergency Rescue Node")
    role: str = os.getenv("DECS_ROLE", "RESPONDER")  # CIVILIAN, RESPONDER, RELAY

    # Networking Configuration
    udp_port: int = int(os.getenv("DECS_UDP_PORT", "50005"))
    broadcast_ip: str = os.getenv("DECS_BROADCAST_IP", "255.255.255.255")
    default_hop_count: int = int(os.getenv("DECS_DEFAULT_HOPS", "5"))
    max_payload_bytes: int = int(os.getenv("DECS_MAX_PAYLOAD", "1024"))
    relay_enabled: bool = os.getenv("DECS_RELAY_ENABLED", "true").lower() == "true"
    peer_heartbeat_interval: int = int(os.getenv("DECS_HEARTBEAT_INTERVAL", "15"))
    duplicate_cache_ttl: int = int(os.getenv("DECS_DUP_CACHE_TTL", "300"))  # 5 mins

    # Local Storage
    db_path: str = os.getenv("DECS_DB_PATH", "decs.db")

    # Firebase Cloud Sync
    firebase_enabled: bool = os.getenv("DECS_FIREBASE_ENABLED", "true").lower() == "true"
    firebase_key_path: str = os.getenv("DECS_FIREBASE_KEY_PATH", "firebase-service-account.json")
    firebase_project_id: Optional[str] = os.getenv("DECS_FIREBASE_PROJECT_ID", None)

    # API / Server
    api_port: int = int(os.getenv("DECS_API_PORT", "8000"))
    api_host: str = os.getenv("DECS_API_HOST", "0.0.0.0")

    # Simulation / Demo Mode
    demo_mode: bool = False


# Global settings singleton instance
settings = Settings()
