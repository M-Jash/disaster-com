"""
DECS SQLite Local Persistence Database
Disaster Emergency Communication System (CNIP Mini-Project)
"""
import sqlite3
import json
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

logger = logging.getLogger("decs.database")

class Database:
    def __init__(self, db_path: str = "decs.db"):
        self.db_path = db_path
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        """Initialize database tables and WAL mode for high concurrency"""
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            # Enable WAL (Write-Ahead Logging) for safe concurrent reads/writes
            cursor.execute("PRAGMA journal_mode=WAL;")
            cursor.execute("PRAGMA synchronous=NORMAL;")

            # 1. Messages table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                msg_id TEXT UNIQUE NOT NULL,
                sender TEXT NOT NULL,
                sender_name TEXT,
                type TEXT NOT NULL,
                text TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                hop_count INTEGER NOT NULL,
                initial_hops INTEGER NOT NULL DEFAULT 5,
                priority TEXT DEFAULT 'MEDIUM',
                category TEXT DEFAULT 'GENERAL',
                latitude REAL,
                longitude REAL,
                location_desc TEXT,
                relay_path TEXT,
                incident_status TEXT DEFAULT 'NEW',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # 2. Nodes / Peers table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS nodes (
                node_id TEXT PRIMARY KEY,
                node_name TEXT,
                role TEXT DEFAULT 'RELAY',
                ip_address TEXT,
                last_seen TEXT NOT NULL,
                status TEXT DEFAULT 'ACTIVE',
                packets_received INTEGER DEFAULT 0,
                packets_sent INTEGER DEFAULT 0,
                last_hop_count INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            """)

            # 3. Events / Telemetry table (Raw Packet Sniffer & Network Events)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                event_type TEXT NOT NULL,
                msg_id TEXT,
                sender TEXT,
                details TEXT,
                raw_payload TEXT,
                hop_count INTEGER
            );
            """)

            # Indexes for high performance querying
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(type);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_messages_priority ON messages(priority);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp DESC);")

            conn.commit()
            logger.info("DECS SQLite database schema initialized successfully at %s", self.db_path)
        except Exception as e:
            logger.error("Database initialization failed: %s", e)
            raise
        finally:
            conn.close()

    # --- Message Operations ---
    def save_message(self, message_data: Dict[str, Any]) -> bool:
        """Insert a newly received or sent message. Returns True if inserted, False if duplicate."""
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            relay_path_json = json.dumps(message_data.get("relay_path", [])) if isinstance(message_data.get("relay_path"), list) else message_data.get("relay_path", "[]")
            
            loc = message_data.get("location") or {}
            lat = loc.get("latitude") if isinstance(loc, dict) else message_data.get("latitude")
            lon = loc.get("longitude") if isinstance(loc, dict) else message_data.get("longitude")
            loc_desc = loc.get("description") if isinstance(loc, dict) else message_data.get("location_desc")

            cursor.execute("""
            INSERT OR IGNORE INTO messages (
                msg_id, sender, sender_name, type, text, timestamp,
                hop_count, initial_hops, priority, category,
                latitude, longitude, location_desc, relay_path, incident_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                message_data["msg_id"],
                message_data.get("sender", "UNKNOWN"),
                message_data.get("sender_name", ""),
                message_data.get("type", "NORMAL"),
                message_data.get("text", ""),
                message_data.get("timestamp", datetime.now(timezone.utc).isoformat()),
                message_data.get("hop_count", 5),
                message_data.get("initial_hops", message_data.get("hop_count", 5)),
                message_data.get("priority", "MEDIUM"),
                message_data.get("category", "GENERAL"),
                lat,
                lon,
                loc_desc,
                relay_path_json,
                message_data.get("incident_status", "NEW")
            ))
            conn.commit()
            return cursor.rowcount > 0
        except Exception as e:
            logger.error("Error saving message: %s", e)
            return False
        finally:
            conn.close()

    def get_messages(self, limit: int = 100, msg_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieve recent messages with optional type filter"""
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            if msg_type:
                cursor.execute(
                    "SELECT * FROM messages WHERE type = ? ORDER BY timestamp DESC LIMIT ?",
                    (msg_type, limit)
                )
            else:
                cursor.execute("SELECT * FROM messages ORDER BY timestamp DESC LIMIT ?", (limit,))
            rows = cursor.fetchall()
            result = []
            for row in rows:
                item = dict(row)
                if item.get("relay_path"):
                    try:
                        item["relay_path"] = json.loads(item["relay_path"])
                    except Exception:
                        item["relay_path"] = []
                result.append(item)
            return result
        finally:
            conn.close()

    def get_incidents(self, status: Optional[str] = None, category: Optional[str] = None, priority: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieve SOS incidents with optional filters"""
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            query = "SELECT * FROM messages WHERE type = 'SOS'"
            params = []

            if status and status.upper() != "ALL":
                query += " AND incident_status = ?"
                params.append(status.upper())
            if category and category.upper() != "ALL":
                query += " AND category = ?"
                params.append(category.upper())
            if priority and priority.upper() != "ALL":
                query += " AND priority = ?"
                params.append(priority.upper())

            query += " ORDER BY CASE priority WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END, timestamp DESC"
            cursor.execute(query, params)
            rows = cursor.fetchall()
            result = []
            for row in rows:
                item = dict(row)
                if item.get("relay_path"):
                    try:
                        item["relay_path"] = json.loads(item["relay_path"])
                    except Exception:
                        item["relay_path"] = []
                result.append(item)
            return result
        finally:
            conn.close()

    def update_incident_status(self, msg_id: str, new_status: str) -> bool:
        """Update incident status (NEW, ACKNOWLEDGED, IN_PROGRESS, RESOLVED)"""
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE messages SET incident_status = ? WHERE msg_id = ? AND type = 'SOS'",
                (new_status.upper(), msg_id)
            )
            conn.commit()
            return cursor.rowcount > 0
        finally:
            conn.close()

    # --- Node / Peer Operations ---
    def upsert_node(self, node_id: str, node_name: str = "", role: str = "RELAY", ip_address: str = "", hop_count: int = 0) -> None:
        """Update last seen and stats for a peer node"""
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            now = datetime.now(timezone.utc).isoformat()
            cursor.execute("""
            INSERT INTO nodes (node_id, node_name, role, ip_address, last_seen, status, packets_received, last_hop_count)
            VALUES (?, ?, ?, ?, ?, 'ACTIVE', 1, ?)
            ON CONFLICT(node_id) DO UPDATE SET
                node_name = CASE WHEN excluded.node_name != '' THEN excluded.node_name ELSE nodes.node_name END,
                role = CASE WHEN excluded.role != '' THEN excluded.role ELSE nodes.role END,
                ip_address = CASE WHEN excluded.ip_address != '' THEN excluded.ip_address ELSE nodes.ip_address END,
                last_seen = excluded.last_seen,
                status = 'ACTIVE',
                packets_received = nodes.packets_received + 1,
                last_hop_count = excluded.last_hop_count
            """, (node_id, node_name, role, ip_address, now, hop_count))
            conn.commit()
        except Exception as e:
            logger.error("Error upserting node %s: %s", node_id, e)
        finally:
            conn.close()

    def get_nodes(self) -> List[Dict[str, Any]]:
        """Get all known nodes with current activity state"""
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM nodes ORDER BY last_seen DESC")
            rows = cursor.fetchall()
            return [dict(r) for r in rows]
        finally:
            conn.close()

    # --- Event / Telemetry Logging ---
    def log_event(self, event_type: str, msg_id: Optional[str] = None, sender: Optional[str] = None,
                  details: str = "", raw_payload: str = "", hop_count: Optional[int] = None) -> None:
        """Record packet transmission/reception/relay/drop events for live sniffer"""
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            now = datetime.now(timezone.utc).isoformat()
            cursor.execute("""
            INSERT INTO events (timestamp, event_type, msg_id, sender, details, raw_payload, hop_count)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (now, event_type, msg_id, sender, details, raw_payload, hop_count))
            conn.commit()
        except Exception as e:
            logger.error("Error logging event: %s", e)
        finally:
            conn.close()

    def get_events(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Fetch latest packet sniffer telemetry events"""
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM events ORDER BY id DESC LIMIT ?", (limit,))
            return [dict(r) for r in cursor.fetchall()]
        finally:
            conn.close()

    def get_stats(self) -> Dict[str, Any]:
        """Aggregate real-time network and message statistics"""
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            
            # Packets summary from events
            cursor.execute("SELECT event_type, COUNT(*) as cnt FROM events GROUP BY event_type")
            event_counts = {r["event_type"]: r["cnt"] for r in cursor.fetchall()}

            # Active nodes (seen within last 60 seconds)
            cursor.execute("SELECT COUNT(*) as active_count FROM nodes")
            total_nodes = cursor.fetchone()["active_count"]

            # Active SOS alerts
            cursor.execute("SELECT COUNT(*) as active_sos FROM messages WHERE type = 'SOS' AND incident_status != 'RESOLVED'")
            active_sos = cursor.fetchone()["active_sos"]

            # Total messages
            cursor.execute("SELECT COUNT(*) as total_msgs FROM messages")
            total_msgs = cursor.fetchone()["total_msgs"]

            # Average hop count for received messages
            cursor.execute("SELECT AVG(hop_count) as avg_hops FROM messages")
            avg_hops_row = cursor.fetchone()
            avg_hops = round(avg_hops_row["avg_hops"], 1) if avg_hops_row and avg_hops_row["avg_hops"] is not None else 0.0

            return {
                "active_nodes": total_nodes,
                "active_sos": active_sos,
                "total_messages": total_msgs,
                "avg_hop_count": avg_hops,
                "packets_sent": event_counts.get("SENT", 0),
                "packets_received": event_counts.get("RECEIVED", 0),
                "packets_relayed": event_counts.get("RELAYED", 0),
                "duplicates_dropped": event_counts.get("DROPPED_DUPLICATE", 0),
                "expired_dropped": event_counts.get("DROPPED_EXPIRED", 0),
                "invalid_packets": event_counts.get("INVALID_PACKET", 0),
            }
        finally:
            conn.close()

    def clear_database(self) -> None:
        """Clear historical data for a clean demonstration session"""
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM messages")
            cursor.execute("DELETE FROM nodes")
            cursor.execute("DELETE FROM events")
            conn.commit()
        finally:
            conn.close()
