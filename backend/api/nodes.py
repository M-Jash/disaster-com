"""
DECS Nodes / Topology API Endpoints
"""
import socket
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from models.schemas import NodeInfo
from database import Database

router = APIRouter(prefix="/api/nodes", tags=["Nodes & Topology"])

def get_db():
    from main import app_state
    return app_state.db

def get_settings():
    from main import app_state
    return app_state.settings

def get_relay_engine():
    from main import app_state
    return app_state.relay_engine


def get_local_ip() -> str:
    """Best-effort local LAN IP address discovery"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0.2)
        # Connect to a dummy address (does not actually send data)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


@router.get("", response_model=List[NodeInfo])
def list_discovered_nodes(db: Database = Depends(get_db)):
    """List all mesh nodes discovered on the local network"""
    return db.get_nodes()


@router.get("/self")
def get_self_node_info(
    settings = Depends(get_settings),
    relay_engine = Depends(get_relay_engine),
    db: Database = Depends(get_db)
) -> Dict[str, Any]:
    """Retrieve identity and networking parameters of current node"""
    stats = db.get_stats()
    return {
        "node_id": settings.node_id,
        "node_name": settings.node_name,
        "role": settings.role,
        "ip_address": get_local_ip(),
        "udp_port": settings.udp_port,
        "broadcast_ip": settings.broadcast_ip,
        "default_hop_count": settings.default_hop_count,
        "relay_enabled": settings.relay_enabled,
        "is_socket_bound": relay_engine.udp_node.is_bound,
        "socket_error": relay_engine.udp_node.last_error,
        "duplicate_cache_size": relay_engine.dup_cache.size(),
        "stats": stats
    }
