"""
DECS Multi-Hop Relay Engine & Protocol State Machine
Handles packet ingress, validation, duplicate filtering, TTL/hop-count control,
automatic peer discovery heartbeat, persistence, and real-time event distribution.
"""
import time
import random
import logging
import threading
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime, timezone

from config import Settings
from database import Database
from models.schemas import PacketSchema, Location, MessageType, PriorityLevel, EmergencyCategory
from networking.packet import (
    serialize_packet, deserialize_packet, generate_msg_id,
    PacketSizeExceededError, MalformedPacketError, InvalidPacketSchemaError, MAX_PACKET_BYTES
)
from networking.duplicate_cache import DuplicateCache
from networking.udp_node import UDPNode

logger = logging.getLogger("decs.relay_engine")


class RelayEngine:
    """
    Central controller orchestrating:
    - UDP Packet Reception & Transmission
    - Duplicate Cache
    - Multi-hop Relay Rules & TTL Decrement
    - SQLite Persistence
    - Real-time WebSocket Notifications
    """
    def __init__(self, settings: Settings, db: Database, ws_broadcaster: Optional[Any] = None):
        self.settings = settings
        self.db = db
        self.ws_broadcaster = ws_broadcaster
        self.dup_cache = DuplicateCache(ttl_seconds=settings.duplicate_cache_ttl)

        # Initialize UDP Node
        self.udp_node = UDPNode(
            port=self.settings.udp_port,
            broadcast_ip=self.settings.broadcast_ip,
            on_packet_received=self.handle_incoming_packet
        )

        # Heartbeat thread for peer discovery
        self._heartbeat_thread: Optional[threading.Thread] = None
        self._running = False

    def start(self) -> bool:
        """Start UDP listener and peer discovery beacon"""
        self._running = True
        success = self.udp_node.start()
        if success:
            self.db.log_event(
                event_type="SOCKET_BOUND",
                details=f"UDP socket active on port {self.settings.udp_port}, Broadcast: {self.settings.broadcast_ip}"
            )
            # Start periodic heartbeat for automatic peer discovery
            self._heartbeat_thread = threading.Thread(
                target=self._heartbeat_loop, name="DECS-Heartbeat", daemon=True
            )
            self._heartbeat_thread.start()
        else:
            self.db.log_event(
                event_type="SOCKET_ERROR",
                details=f"Socket bind failed: {self.udp_node.last_error}"
            )
        return success

    def stop(self) -> None:
        """Stop UDP listener and background jobs"""
        self._running = False
        self.udp_node.stop()
        if self._heartbeat_thread and self._heartbeat_thread.is_alive():
            self._heartbeat_thread.join(timeout=2.0)

    def _heartbeat_loop(self) -> None:
        """Periodically broadcast PEER_PING beacon for automatic mesh neighbor discovery"""
        time.sleep(2.0)  # Initial grace period
        while self._running:
            try:
                self.broadcast_ping()
            except Exception as e:
                logger.debug("Heartbeat ping error: %s", e)
            time.sleep(self.settings.peer_heartbeat_interval + random.uniform(-1.0, 1.0))

    def broadcast_ping(self) -> None:
        """Send a lightweight discovery ping beacon"""
        msg_id = generate_msg_id(self.settings.node_id)
        packet = PacketSchema(
            msg_id=msg_id,
            sender=self.settings.node_id,
            sender_name=self.settings.node_name,
            type="PING",
            text=f"BEACON:{self.settings.role}",
            hop_count=1,
            initial_hops=1,
            priority="LOW",
            category="STATUS",
            relay_path=[self.settings.node_id]
        )
        self.dup_cache.add(msg_id)
        try:
            raw_bytes = serialize_packet(packet)
            self.udp_node.send_broadcast(raw_bytes)
        except Exception as e:
            logger.debug("Failed to send discovery ping: %s", e)

    # --- Originating Local Messages / SOS ---
    def send_local_message(
        self,
        text: str,
        msg_type: MessageType = "NORMAL",
        priority: PriorityLevel = "MEDIUM",
        category: EmergencyCategory = "GENERAL",
        location: Optional[Location] = None,
        sender_name: Optional[str] = None,
        sender_id: Optional[str] = None,
        hop_count: Optional[int] = None
    ) -> PacketSchema:
        """Create, record, and broadcast a local message or SOS alert"""
        hops = hop_count or self.settings.default_hop_count
        origin_node = sender_id or self.settings.node_id
        msg_id = generate_msg_id(origin_node)
        name = sender_name or self.settings.node_name

        packet = PacketSchema(
            msg_id=msg_id,
            sender=origin_node,
            sender_name=name,
            type=msg_type,
            text=text,
            hop_count=hops,
            initial_hops=hops,
            priority=priority,
            category=category,
            location=location,
            relay_path=[origin_node]
        )

        # 1. Add to local duplicate cache
        self.dup_cache.add(msg_id)

        # 2. Persist to SQLite
        self.db.save_message(packet.model_dump())

        # 3. Serialize to wire bytes (max 1024 bytes)
        raw_bytes = serialize_packet(packet)

        # 4. Broadcast via UDP
        send_success = self.udp_node.send_broadcast(raw_bytes)

        # 5. Log Telemetry Event
        raw_json_str = raw_bytes.decode("utf-8", errors="replace")
        self.db.log_event(
            event_type="SENT",
            msg_id=msg_id,
            sender=origin_node,
            details=f"Broadcast {msg_type} (Priority: {priority}, Initial Hops: {hops}, Success: {send_success})",
            raw_payload=raw_json_str,
            hop_count=hops
        )

        # 6. Notify WebSockets
        self._notify_ws("PACKET_SENT", {
            "packet": packet.model_dump(),
            "event_type": "SENT",
            "stats": self.db.get_stats()
        })

        return packet

    # --- Incoming Wire Packet Handling & Multi-Hop Relay ---
    def handle_incoming_packet(self, raw_bytes: bytes, addr: Tuple[str, int]) -> None:
        if len(raw_bytes) > MAX_PACKET_BYTES:
            self.db.log_event(
                event_type="INVALID_PACKET",
                details=f"Oversized packet rejected ({len(raw_bytes)} bytes > {MAX_PACKET_BYTES} bytes) from {addr[0]}"
            )
            self._notify_ws("TELEMETRY_UPDATE", {"event_type": "INVALID_PACKET"})
            return

        try:
            packet = deserialize_packet(raw_bytes)
        except (MalformedPacketError, InvalidPacketSchemaError, PacketSizeExceededError) as e:
            raw_preview = raw_bytes[:100].decode("utf-8", errors="replace")
            self.db.log_event(
                event_type="INVALID_PACKET",
                details=f"Invalid packet from {addr[0]}: {str(e)}",
                raw_payload=raw_preview
            )
            self._notify_ws("TELEMETRY_UPDATE", {"event_type": "INVALID_PACKET"})
            return

        # Check Duplicate Cache
        if self.dup_cache.is_duplicate(packet.msg_id):
            self.db.log_event(
                event_type="DROPPED_DUPLICATE",
                msg_id=packet.msg_id,
                sender=packet.sender,
                details=f"Duplicate packet {packet.msg_id} dropped to prevent routing loops",
                hop_count=packet.hop_count
            )
            self._notify_ws("TELEMETRY_UPDATE", {
                "event_type": "DROPPED_DUPLICATE",
                "msg_id": packet.msg_id,
                "sender": packet.sender,
                "stats": self.db.get_stats()
            })
            return

        # New Packet Accepted
        raw_json_str = raw_bytes.decode("utf-8", errors="replace")
        self.db.log_event(
            event_type="RECEIVED",
            msg_id=packet.msg_id,
            sender=packet.sender,
            details=f"Received {packet.type} ({packet.priority}) - {packet.hop_count} hops remaining",
            raw_payload=raw_json_str,
            hop_count=packet.hop_count
        )

        self.db.upsert_node(
            node_id=packet.sender,
            node_name=packet.sender_name or "",
            role="RELAY",
            ip_address=addr[0],
            hop_count=packet.hop_count
        )

        if packet.type in ["NORMAL", "SOS", "STATUS"]:
            self.db.save_message(packet.model_dump())

        self._notify_ws("PACKET_RECEIVED", {
            "packet": packet.model_dump(),
            "event_type": "RECEIVED",
            "stats": self.db.get_stats(),
            "nodes": self.db.get_nodes()
        })

        if packet.type == "PING":
            return

        if self.settings.relay_enabled:
            if packet.hop_count > 1:
                threading.Thread(
                    target=self._relay_worker,
                    args=(packet,),
                    name=f"Relay-{packet.msg_id}",
                    daemon=True
                ).start()
            else:
                self.db.log_event(
                    event_type="DROPPED_EXPIRED",
                    msg_id=packet.msg_id,
                    sender=packet.sender,
                    details=f"TTL expired (Hop count reached limit). Local delivery complete, will not forward.",
                    hop_count=packet.hop_count
                )
                self._notify_ws("TELEMETRY_UPDATE", {
                    "event_type": "DROPPED_EXPIRED",
                    "msg_id": packet.msg_id,
                    "stats": self.db.get_stats()
                })

    def _relay_worker(self, original_packet: PacketSchema) -> None:
        time.sleep(random.uniform(0.025, 0.075))

        new_hop = original_packet.hop_count - 1
        relay_path = list(original_packet.relay_path or [])
        if self.settings.node_id not in relay_path:
            relay_path.append(self.settings.node_id)

        relayed_packet = original_packet.model_copy(
            update={
                "hop_count": new_hop,
                "relay_path": relay_path
            }
        )

        try:
            relayed_bytes = serialize_packet(relayed_packet)
            self.udp_node.send_broadcast(relayed_bytes)

            raw_json_str = relayed_bytes.decode("utf-8", errors="replace")
            self.db.log_event(
                event_type="RELAYED",
                msg_id=relayed_packet.msg_id,
                sender=relayed_packet.sender,
                details=f"Forwarded packet (Hops: {original_packet.hop_count} → {new_hop}, Path: {' → '.join(relay_path)})",
                raw_payload=raw_json_str,
                hop_count=new_hop
            )

            self._notify_ws("PACKET_RELAYED", {
                "packet": relayed_packet.model_dump(),
                "event_type": "RELAYED",
                "stats": self.db.get_stats()
            })
        except Exception as e:
            logger.error("Failed to relay packet %s: %s", original_packet.msg_id, e)

    def _notify_ws(self, event_name: str, payload: Dict[str, Any]) -> None:
        if self.ws_broadcaster:
            try:
                self.ws_broadcaster(event_name, payload)
            except Exception as e:
                logger.debug("WebSocket broadcast error: %s", e)
