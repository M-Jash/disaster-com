"""
DECS Settings API Endpoint
"""
from fastapi import APIRouter, Depends, HTTPException
from models.schemas import UpdateSettingsRequest
from database import Database

router = APIRouter(prefix="/api/settings", tags=["Settings"])

def get_settings():
    from main import app_state
    return app_state.settings

def get_relay_engine():
    from main import app_state
    return app_state.relay_engine

def get_db():
    from main import app_state
    return app_state.db


@router.get("")
def get_current_settings(settings = Depends(get_settings)):
    """Get active DECS system configuration"""
    return {
        "node_id": settings.node_id,
        "node_name": settings.node_name,
        "role": settings.role,
        "udp_port": settings.udp_port,
        "broadcast_ip": settings.broadcast_ip,
        "default_hop_count": settings.default_hop_count,
        "max_payload_bytes": settings.max_payload_bytes,
        "relay_enabled": settings.relay_enabled,
        "peer_heartbeat_interval": settings.peer_heartbeat_interval,
        "duplicate_cache_ttl": settings.duplicate_cache_ttl
    }


@router.put("")
def update_settings(
    req: UpdateSettingsRequest,
    settings = Depends(get_settings),
    relay_engine = Depends(get_relay_engine),
    db: Database = Depends(get_db)
):
    """Dynamically modify runtime settings"""
    if req.node_name is not None:
        settings.node_name = req.node_name
    if req.role is not None:
        settings.role = req.role
    if req.relay_enabled is not None:
        settings.relay_enabled = req.relay_enabled
    if req.default_hop_count is not None:
        settings.default_hop_count = req.default_hop_count
    if req.broadcast_ip is not None:
        settings.broadcast_ip = req.broadcast_ip
        relay_engine.udp_node.broadcast_ip = req.broadcast_ip

    # If UDP port changed, restart socket
    if req.udp_port is not None and req.udp_port != settings.udp_port:
        settings.udp_port = req.udp_port
        relay_engine.udp_node.stop()
        relay_engine.udp_node.port = req.udp_port
        success = relay_engine.udp_node.start()
        if not success:
            raise HTTPException(status_code=500, detail=f"Failed to bind new UDP port {req.udp_port}")

    relay_engine._notify_ws("SETTINGS_UPDATED", {"settings": get_current_settings(settings)})
    return {"status": "success", "settings": get_current_settings(settings)}
