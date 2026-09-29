"""
DECS WebSocket Manager
Provides real-time bi-directional telemetry and event streaming to frontend clients
"""
import json
import logging
import asyncio
from typing import List, Dict, Any
from fastapi import WebSocket

logger = logging.getLogger("decs.websocket")


class ConnectionManager:
    """Manages active WebSocket connections from React frontend instances"""
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self._loop: Optional[asyncio.AbstractEventLoop] = None

    def set_event_loop(self, loop: asyncio.AbstractEventLoop):
        self._loop = loop

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info("New WebSocket client connected (Total: %d)", len(self.active_connections))

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info("WebSocket client disconnected (Total: %d)", len(self.active_connections))

    async def broadcast(self, event_type: str, data: Dict[str, Any]):
        """Send JSON message to all connected clients"""
        if not self.active_connections:
            return

        payload = json.dumps({"event": event_type, "data": data})
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(payload)
            except Exception:
                disconnected.append(connection)

        for conn in disconnected:
            self.disconnect(conn)

    def broadcast_sync(self, event_type: str, data: Dict[str, Any]):
        """Thread-safe synchronous broadcast wrapper callable from UDP networking threads"""
        if not self.active_connections:
            return

        if self._loop and self._loop.is_running():
            asyncio.run_coroutine_threadsafe(self.broadcast(event_type, data), self._loop)
