"""
DECS - Disaster Emergency Communication System
Main FastAPI Application Entrypoint & Networking Lifecycle Engine
"""
import sys
import os
import asyncio
import logging
from contextlib import asynccontextmanager
from dataclasses import dataclass
from typing import Optional

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from config import settings, Settings
from database import Database
from firebase_client import firebase_client
from networking.relay_engine import RelayEngine
from api.websocket import ConnectionManager

# API Routers
from api.messages import router as messages_router
from api.incidents import router as incidents_router
from api.nodes import router as nodes_router
from api.network import router as network_router
from api.settings import router as settings_router
from api.demo import router as demo_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger("decs.main")


@dataclass
class AppState:
    settings: Settings
    db: Database
    ws_manager: ConnectionManager
    relay_engine: RelayEngine


# Singleton application state container
app_state: Optional[AppState] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global app_state
    logger.info("Initializing DECS Backend Networking Engine...")

    # 1. Initialize SQLite Database
    db = Database(db_path=settings.db_path)

    # 1b. Initialize Firebase Cloud Sync
    if getattr(settings, "firebase_enabled", True):
        firebase_client.key_path = getattr(settings, "firebase_key_path", "firebase-service-account.json")
        firebase_client.initialize()

    # 2. Initialize WebSocket Manager
    ws_manager = ConnectionManager()
    loop = asyncio.get_running_loop()
    ws_manager.set_event_loop(loop)

    # 3. Initialize Multi-Hop Relay Engine & UDP Node
    relay_engine = RelayEngine(
        settings=settings,
        db=db,
        ws_broadcaster=ws_manager.broadcast_sync
    )

    # Store global state
    app_state = AppState(
        settings=settings,
        db=db,
        ws_manager=ws_manager,
        relay_engine=relay_engine
    )

    # 4. Start UDP Networking Listener
    socket_started = relay_engine.start()
    if socket_started:
        logger.info(
            "DECS Node [%s] ACTIVE. Listening on UDP :%d, Broadcast: %s",
            settings.node_id, settings.udp_port, settings.broadcast_ip
        )
    else:
        logger.warning("DECS UDP socket could not bind: %s", relay_engine.udp_node.last_error)

    yield  # Application is serving requests

    # Shutdown
    logger.info("Shutting down DECS Networking Engine...")
    if relay_engine:
        relay_engine.stop()
    logger.info("DECS Node stopped successfully.")


app = FastAPI(
    title="Disaster Emergency Communication System (DECS)",
    description="Resilient Local-Mesh Emergency Networking Layer over UDP Broadcast",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local development and distributed LAN devices
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(messages_router)
app.include_router(incidents_router)
app.include_router(nodes_router)
app.include_router(network_router)
app.include_router(settings_router)
app.include_router(demo_router)


@app.get("/api/status")
def get_system_status():
    """System health check and operational overview"""
    if not app_state:
        return {"status": "INITIALIZING"}

    return {
        "status": "OPERATIONAL",
        "node_id": app_state.settings.node_id,
        "node_name": app_state.settings.node_name,
        "role": app_state.settings.role,
        "udp_port": app_state.settings.udp_port,
        "broadcast_ip": app_state.settings.broadcast_ip,
        "socket_bound": app_state.relay_engine.udp_node.is_bound,
        "socket_error": app_state.relay_engine.udp_node.last_error,
        "relay_enabled": app_state.settings.relay_enabled,
        "default_hop_count": app_state.settings.default_hop_count,
        "local_network": "ACTIVE",
        "decs_engine": "ONLINE",
        "firebase_connected": firebase_client.is_connected,
        "ws_connections": len(app_state.ws_manager.active_connections)
    }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Real-time event stream to connected frontend UI clients"""
    if not app_state:
        await websocket.close()
        return

    await app_state.ws_manager.connect(websocket)
    try:
        # Send initial state synchronization packet
        initial_stats = app_state.db.get_stats()
        await websocket.send_json({
            "event": "INITIAL_SYNC",
            "data": {
                "node_id": app_state.settings.node_id,
                "node_name": app_state.settings.node_name,
                "role": app_state.settings.role,
                "stats": initial_stats,
                "nodes": app_state.db.get_nodes(),
                "firebase_connected": firebase_client.is_connected
            }
        })
        while True:
            # Keep connection alive; accept any client pings
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        app_state.ws_manager.disconnect(websocket)
    except Exception as e:
        logger.debug("WebSocket exception: %s", e)
        app_state.ws_manager.disconnect(websocket)


if __name__ == "__main__":
    port = int(os.getenv("PORT", settings.api_port))
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=port,
        reload=False,
        log_level="info"
    )
