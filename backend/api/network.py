"""
DECS Network Telemetry, Socket Stats, and Packet Sniffer API
"""
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from models.schemas import NetworkStats, TelemetryEvent
from database import Database

router = APIRouter(prefix="/api/network", tags=["Network Telemetry"])

def get_db():
    from main import app_state
    return app_state.db

def get_settings():
    from main import app_state
    return app_state.settings

def get_relay_engine():
    from main import app_state
    return app_state.relay_engine


@router.get("/stats", response_model=NetworkStats)
def get_network_statistics(
    db: Database = Depends(get_db),
    settings = Depends(get_settings)
):
    """Aggregate live packet telemetry, hop metrics, and network counters"""
    raw_stats = db.get_stats()
    return NetworkStats(
        **raw_stats,
        socket_port=settings.udp_port,
        broadcast_ip=settings.broadcast_ip,
        relay_enabled=settings.relay_enabled,
        node_id=settings.node_id,
        role=settings.role
    )


@router.get("/events", response_model=List[TelemetryEvent])
def get_packet_sniffer_events(
    limit: int = 150,
    db: Database = Depends(get_db)
):
    """Fetch raw packet sniffer logs (SENT, RECEIVED, RELAYED, DROPPED_DUPLICATE, DROPPED_EXPIRED, INVALID)"""
    return db.get_events(limit=limit)


@router.post("/ping")
def trigger_network_ping(relay_engine = Depends(get_relay_engine)):
    """Trigger an immediate mesh discovery ping beacon"""
    relay_engine.broadcast_ping()
    return {"status": "success", "message": "Peer discovery ping broadcasted"}


@router.post("/clear")
def clear_network_history(
    db: Database = Depends(get_db),
    relay_engine = Depends(get_relay_engine)
):
    """Reset message history, active peer list, and packet sniffer logs for a clean demo session"""
    db.clear_database()
    relay_engine.dup_cache.clear()
    relay_engine._notify_ws("HISTORY_CLEARED", {"stats": db.get_stats()})
    return {"status": "success", "message": "Local database and duplicate cache cleared"}
