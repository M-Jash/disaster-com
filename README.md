# DECS — Disaster Emergency Communication System
### A Resilient Local Mesh Emergency Networking Platform (CNIP Mini-Project)

![DECS Status](https://img.shields.io/badge/DECS-Operational-emerald?style=for-the-badge&logo=shield)
![Network Protocol](https://img.shields.io/badge/Protocol-UDP%20Broadcast%20(50005)-cyan?style=for-the-badge)
![Mesh Relaying](https://img.shields.io/badge/Routing-Multi--Hop%20TTL-purple?style=for-the-badge)
![Zero Cloud](https://img.shields.io/badge/Infrastructure-100%25%20Offline%20LAN-amber?style=for-the-badge)

---

## 1. Executive Summary & Design Philosophy

The **Disaster Emergency Communication System (DECS)** is a decentralized, local-first emergency communication application developed for **Computer Networks & Internet Protocol (CNIP)** coursework.

When catastrophic natural disasters (floods, earthquakes, cyclones, landslides) or severe power grid failures disable central internet backbones, cellular base stations, and DNS servers, conventional applications (WhatsApp, phone calls, SMS) immediately fail.

**DECS solves the "last-mile disconnected bubble"** by enabling nearby commodity laptops and mobile devices on the same physical Wi-Fi or LAN medium to form an autonomous, self-healing mesh. Using **UDP socket broadcast (`SO_BROADCAST`)**, **compact JSON wire frames**, **sliding-window duplicate suppression**, and **multi-hop TTL decrement**, DECS propagates critical SOS alerts and status updates across participating nodes without requiring any cloud server, SIM card, or external infrastructure.

---

## 2. Key Features

- **True UDP Broadcast Networking**: Direct socket transmission to `255.255.255.255:50005` with `SO_REUSEADDR` / `SO_BROADCAST` socket options.
- **Compact Wire Protocol**: Max **1024 bytes** UTF-8 JSON payload to prevent IP-layer packet fragmentation over 802.11 MTU.
- **Multi-Hop Packet Relaying**: Automated TTL (`hop_count`) decrement ($TTL_{n+1} = TTL_n - 1$) and collision-avoidance jitter delay (25ms–75ms) allowing packets to traverse past line-of-sight barriers.
- **Sliding-Window Duplicate Protection**: In-memory thread-safe `DuplicateCache` tracking unique `msg_id` values to prevent broadcast storms and routing loops.
- **Tactical Emergency Command Dashboard**: Real-time incident triage (`NEW` $\rightarrow$ `ACKNOWLEDGED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `RESOLVED`), KPI metrics, and Web Audio API synthesized alert chimes.
- **Real-Time Packet Sniffer**: Live wire event stream displaying raw JSON payloads, socket telemetry counters, and hop path traces.
- **5-Node Demo & Simulator Mode**: Built-in classroom/viva presentation simulator showing step-by-step packet propagation across virtual nodes (`NODE-A` $\rightarrow$ `NODE-B` $\rightarrow$ `NODE-C` $\rightarrow$ `NODE-D` $\rightarrow$ `NODE-E`).
- **Zero Cloud Local Persistence**: SQLite with Write-Ahead Logging (WAL) mode for resilient offline concurrent storage.

---

## 3. Technology Stack

### Backend Architecture
- **Language**: Python 3.10+ (Tested on Python 3.13)
- **Networking Core**: Low-level Python `socket` module (UDP DGRAM, `SO_BROADCAST`, `SO_REUSEADDR`)
- **Concurrency**: Python `threading` & `asyncio` for background packet ingress loop and peer heartbeat beacons
- **REST & WebSocket API**: FastAPI, Uvicorn, WebSockets
- **Validation**: Pydantic v2 (Strict byte length and data integrity enforcement)
- **Persistence**: SQLite with WAL journaling (`decs.db`)
- **Test Framework**: Pytest (`pytest-v`)

### Frontend Architecture
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite + `@tailwindcss/vite`
- **Styling**: Tailwind CSS (Tactical Dark Command Center theme)
- **Icons**: Lucide React
- **Telemetry Charts**: Recharts
- **Audio Synthesis**: Native Browser Web Audio API (100% offline oscillator beeps)

---

## 4. System & Networking Architecture

```
                    +---------------------------------------+
                    |           DECS React UI Client        |
                    +-------------------+-------------------+
                                        | (WebSocket + REST)
                    +-------------------v-------------------+
                    |           FastAPI Web Server          |
                    +-------------------+-------------------+
                                        |
      +---------------------------------+---------------------------------+
      |                                 |                                 |
+-----v-------------+        +----------v-----------+        +------------v------------+
|  SQLite Database  |        |  Duplicate Cache Set |        |    Multi-Hop Relay      |
|     (WAL Mode)    |        |  (Sliding TTL Window)|        |      State Engine       |
+-------------------+        +----------------------+        +------------+------------+
                                                                          |
                                                              +-----------v------------+
                                                              |    UDP Socket Node     |
                                                              |  (0.0.0.0:50005 RX/TX) |
                                                              +-----------+------------+
                                                                          |
                                                     UDP Broadcast (255.255.255.255:50005)
                                                                          |
                                 +----------------------------------------+----------------------------------------+
                                 |                                        |                                        |
                       +---------v---------+                    +---------v---------+                    +---------v---------+
                       |    NODE-ALPHA     |                    |    NODE-BRAVO     |                    |   NODE-CHARLIE    |
                       | (Emergency Node)  |                    |   (Relay Node)    |                    | (Command Station) |
                       +-------------------+                    +-------------------+                    +-------------------+
```

---

## 5. JSON Wire Packet Specification

Packets are serialized into compact UTF-8 JSON strings strictly under **1024 bytes**.

```json
{
  "version": "1.0",
  "msg_id": "NODE-7A21-1727515000-001",
  "sender": "NODE-7A21",
  "sender_name": "Civilian Alice",
  "type": "SOS",
  "text": "Medical assistance required at Block C Roof. 3 people injured.",
  "hop_count": 4,
  "initial_hops": 5,
  "timestamp": "2026-09-28T15:30:00.000Z",
  "priority": "CRITICAL",
  "category": "MEDICAL",
  "location": {
    "latitude": 12.9716,
    "longitude": 77.5946,
    "description": "Block C Roof, Sector 4"
  },
  "relay_path": [
    "NODE-7A21",
    "NODE-B042"
  ]
}
```

### Packet Field Definitions:
- `msg_id` *(string, required)*: Globally unique message identifier formatted as `<NODE_ID>-<timestamp_ms>-<rand_hex>`.
- `sender` *(string, required)*: Originating node hardware identifier.
- `type` *(string, required)*: `SOS`, `NORMAL`, `STATUS`, `PING`, `ACK`.
- `text` *(string, required)*: Emergency message payload (Max 350 characters).
- `hop_count` *(integer, required)*: Remaining Time-To-Live hops (Range 0–16).
- `initial_hops` *(integer)*: TTL configured at origin.
- `priority` *(string)*: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`.
- `category` *(string)*: `MEDICAL`, `TRAPPED`, `FIRE`, `FLOOD`, `FOOD_WATER`, `MISSING_PERSON`, `GENERAL`.
- `location` *(object, optional)*: Manual GPS latitude/longitude and landmark description.
- `relay_path` *(array of strings)*: Trace sequence of node IDs that forwarded this packet.

---

## 6. Multi-Hop Relaying & Collision Avoidance

### Relaying Algorithm:
1. **Packet Arrival**: The UDP background thread receives raw bytes from `recvfrom(2048)`.
2. **Size & Schema Check**: Reject packets $> 1024$ bytes or malformed JSON (record `INVALID_PACKET`).
3. **Self-Loopback Filter**: If `sender == self.node_id`, ignore immediately.
4. **Duplicate Lookup**: Check in-memory `DuplicateCache`:
   - If `msg_id` already present $\rightarrow$ Log `DROPPED_DUPLICATE` and terminate.
   - If fresh $\rightarrow$ Add `msg_id` to cache with 300s expiration.
5. **Local Processing**: Persist to SQLite, notify connected WebSockets, update peer discovery catalog.
6. **Relay Decision**:
   - If `relay_enabled == True` and `packet.type != 'PING'`:
     - If `packet.hop_count > 1`:
       - Calculate: `relayed_packet.hop_count = packet.hop_count - 1`
       - Append `self.node_id` to `relay_path`.
       - Apply random **CSMA/CA collision-avoidance jitter** ($25\text{ ms} \le t_{\text{jitter}} \le 75\text{ ms}$).
       - Re-serialize and broadcast via UDP.
       - Log `RELAYED` telemetry event.
     - Else (`hop_count <= 1`):
       - Log `DROPPED_EXPIRED` (TTL expired at boundary; local delivery complete).

---

## 7. Installation & Quick Start

### Prerequisites
- Python 3.10+ (FastAPI, Uvicorn, Pydantic, Pytest)
- Node.js 18+ and npm

### 1. Clone & Setup Backend
```bash
# Navigate to backend
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run automated tests to verify networking stack
pytest -v

# run backend
python main.py
```

### 2. Setup Frontend
```bash
# In a separate terminal, navigate to frontend
cd frontend

# Install npm dependencies
npm install

# Start Vite React frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 8. Multi-Instance Testing on Local Machine / LAN

To demonstrate real multi-node communication between two nodes:

### Option A: Using Pre-Built Batch Scripts (Windows)
1. **Run Node 1**: Double-click `scripts\start_node_1.bat` (Port 8000 / Web UI: 5173).
2. **Run Node 2**: Double-click `scripts\start_node_2.bat` (Port 8001 / Web UI: 5174).

### Option B: Running on Multiple Physical Laptops on Same Wi-Fi
1. Connect 2 or more laptops to the same Wi-Fi router (or mobile hotspot with AP isolation turned off).
2. Start DECS on Laptop 1 (`python main.py`).
3. Start DECS on Laptop 2 (`python main.py`).
4. Broadcast an SOS on Laptop 1. Laptop 2 will instantly receive, play the tactical emergency alarm, show the packet in the sniffer, and relay it!

---

## 9. Classroom & Viva Demonstration Guide

Use the built-in **Demo Simulator** tab for interactive presentations:

1. Click **Demo Simulator** in the sidebar.
2. Select a scenario:
   - **Scenario 1: Multi-Hop SOS Propagation** — Shows step-by-step hop decrement from `NODE-A` through `NODE-B`, `NODE-C`, `NODE-D`, to `NODE-E`.
   - **Scenario 2: Duplicate Packet Prevention** — Demonstrates multi-path arrival at `NODE-D` and immediate duplicate dropping.
   - **Scenario 3: TTL Expiration** — Demonstrates network boundary termination when TTL hits zero.
3. Click **Execute Simulation** and step through each hop using **Next Step →**.

---

## 10. Automated Test Verification

All backend networking routines are thoroughly tested with Pytest:

```bash
cd backend
pytest -v
python main.py
```

### Test Coverage Summary:
- `test_packet.py`: Wire serialization, deserialization, 1024-byte size limit enforcement, malformed JSON handling.
- `test_duplicate.py`: Duplicate msg_id detection, first arrival acceptance, TTL sliding-window eviction.
- `test_relay_ttl.py`: TTL reduction logic ($5 \rightarrow 4 \rightarrow 3 \rightarrow 2 \rightarrow 1$), relay path chaining, expiration.
- `test_udp_sockets.py`: Live socket loopback communication between transmitter and receiver instances.
- `test_database.py`: SQLite persistence, incident triage status updates, and telemetry logging.

---

## 11. Practical Limitations & Scope Disclosure

- **Physical Medium Range**: DECS operates over local Layer 2/3 broadcast domains (Wi-Fi 802.11 / Ethernet). Communication range is governed by RF signal strength and router configuration (AP isolation should be disabled on guest Wi-Fi networks).
- **Firewall Configuration**: OS firewalls must permit inbound UDP on port `50005`.
- **GPS Coordinates**: In browser environments without hardware GPS sensors, approximate or manual landmark inputs serve as fallbacks.
- **Scope**: Designed as a college networking prototype demonstrating resilient ad-hoc emergency protocols, not as a certified military hardware appliance.

---

## 12. License & Academic Attribution
Developed for the **Computer Networks & Internet Protocol (CNIP)** Mini-Project. Open-source educational reference for emergency mesh protocols.
