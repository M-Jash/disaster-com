# Disaster Emergency Communication System (DECS)
## Official System Operation & User Manual

---

## 1. System Overview & Purpose

The **Disaster Emergency Communication System (DECS)** is a local, resilient communication platform designed for **Computer Networks & Internet Protocol (CNIP)** demonstration and real-world disaster relief prototyping.

### Problem Scenario:
During severe disasters (such as floods, earthquakes, cyclonic storms, or regional power grid collapses), conventional communication infrastructure fails:
- Cellular towers lose power and backhaul connectivity.
- Internet Service Providers (ISPs) and DNS servers become unreachable.
- Cloud-hosted communication platforms (WhatsApp, SMS, cellular calls) cease functioning.

### DECS Solution:
DECS establishes an **ad-hoc, serverless local mesh** over standard Wi-Fi or Ethernet local area networks (LANs). By utilizing **UDP broadcast (`255.255.255.255:50005`)**, participating nodes can broadcast and relay emergency messages and SOS distress alerts without any cellular data, SIM card, or internet connection.

---

## 2. System Requirements & Architecture

### Prerequisites:
- **Operating System**: Windows 10/11, Linux, or macOS.
- **Python**: Python 3.10 or higher.
- **Node.js**: Node.js v18.0+ and npm.
- **Network**: Any local Wi-Fi router, ad-hoc hotspot, or Ethernet switch (internet access is **not** required).

### Key Architectural Components:
1. **Low-Level UDP Socket Engine**: Listens on `0.0.0.0:50005` with `SO_BROADCAST` and `SO_REUSEADDR`.
2. **Compact Wire Protocol**: Max **1024 bytes** UTF-8 JSON payload to avoid Layer 3 IP fragmentation.
3. **Multi-Hop Relaying Engine**: Automatically decrements Time-To-Live ($TTL_{n+1} = TTL_n - 1$) and rebroadcasts with collision-avoidance jitter ($25\text{ms} \le t_{\text{jitter}} \le 75\text{ms}$).
4. **Sliding-Window Duplicate Cache**: Thread-safe hash table storing unique `msg_id` entries to prevent infinite broadcast loops.
5. **SQLite WAL Database**: Local-first storage for messages, discovered peers, and wire telemetry.
6. **Tactical Command Frontend**: Modern React 19 + TypeScript dashboard with live WebSocket telemetry push.

---

## 3. Quick Start & Execution Modes

### Mode A: Single Instance Quick Start (Windows)
Double-click:
```cmd
scripts\start_node_1.bat
```
This automatically starts:
- **Backend API & UDP Socket**: `http://127.0.0.1:8000` (Listening on UDP Port `50005`)
- **React Frontend**: `http://localhost:5173`

Open your web browser at **`http://localhost:5173`**.

---

### Mode B: Dual Node Testing on a Single Machine
To test **real UDP packet transmission, reception, duplicate detection, and relaying** on one computer:

1. **Launch Node 1 (Alpha - Command Center)**:
   ```cmd
   scripts\start_node_1.bat
   ```
   * Access UI: `http://localhost:5173`

2. **Launch Node 2 (Bravo - Civilian / Relay Station)**:
   In a separate terminal:
   ```cmd
   scripts\start_node_2.bat
   ```
   * Open a second frontend on port 5174:
     ```cmd
     cd frontend
     npx vite --port 5174
     ```
   * Access UI: `http://localhost:5174`

3. **Verify Communication**:
   - Send an SOS or text message from Node 1 (`:5173`).
   - Observe Node 2 (`:5174`) instantly receive the message over UDP broadcast, play the tactical chime, update its incident feed, and log the packet in the Packet Sniffer!

---

### Mode C: Distributed Operation Across Multiple Physical Laptops
1. Connect 2 or more laptops to the same **Wi-Fi router** or **Mobile Hotspot** (ensure AP Isolation is disabled).
2. On each laptop:
   ```bash
   # Terminal 1:
   cd backend
   python main.py

   # Terminal 2:
   cd frontend
   npm run dev
   ```
3. Open `http://localhost:5173` on each laptop. The nodes will automatically discover each other via periodic UDP heartbeat beacons (`PEER_PING`).

---

## 4. Feature-by-Feature Operational Guide

### 4.1 Command Dashboard
- **KPI Stat Cards**:
  - **Active Nodes**: Count of discovered mesh peers on the subnet.
  - **Messages Relayed**: Total packets forwarded by this node.
  - **Active SOS Alerts**: Count of unresolved critical incidents.
  - **Network Health %**: Calculated based on packet drop ratios and socket state.
  - **Average Hop Count**: Average path distance of incoming packets.
- **Quick SOS Dispatcher**: One-click emergency category selector for rapid dispatch.
- **Live Mini-Feed**: Real-time ticker of the latest incoming incidents and text broadcasts.

### 4.2 Sending SOS Emergency Alerts
1. Click the prominent **🚨 SEND SOS** button in the header or dashboard.
2. Select the **Emergency Category**:
   - `Medical Assistance`
   - `Trapped / Structural Collapse`
   - `Fire / Explosion`
   - `Flood / Rising Water`
   - `Food & Water Supply`
   - `Missing Person`
   - `Other Emergency`
3. Enter situational details (e.g., number of people affected, injuries).
4. Specify location:
   - Click **Auto-Detect GPS** to fetch browser geolocation coordinates.
   - Enter manual landmark / room description (e.g., *Sector 4, Building B Roof*).
5. Set the **Initial Hop Count (TTL)** slider (Default: 5).
6. Click **Confirm & Broadcast SOS**. The packet is immediately broadcast to `255.255.255.255:50005`.

### 4.3 Incident Command & Responder Triage
1. Navigate to the **SOS Incidents** tab in the sidebar.
2. Filter incidents by **Status** (`New`, `Acknowledged`, `In Progress`, `Resolved`), **Category**, or **Priority**.
3. Click **Triage & Path Details** on any incident card to open the detail modal.
4. **Update Status**: Responders can mark the incident as `Acknowledged`, `In Progress`, or `Resolved`.
5. **View Relay Path**: The modal renders an exact vertical hop chain (e.g. `NODE-ALPHA → NODE-BRAVO → LOCAL NODE`).

### 4.4 Emergency Mesh Chat
1. Navigate to the **Emergency Chat** tab.
2. Filter messages by `All`, `Normal`, `SOS`, or `Status`.
3. Type an update in the compose bar and click **Broadcast**.
4. Each chat bubble indicates:
   - Callsign and Node ID.
   - Hop badge (e.g. `Direct Broadcast (0 hops)` or `Relayed through 2 hops`).
   - Timestamp and unique `msg_id`.

### 4.5 Packet Sniffer & Wire Telemetry
1. Navigate to the **Packet Sniffer** tab.
2. View live socket metrics:
   - `Packets Received`
   - `Packets Sent`
   - `Packets Relayed`
   - `Duplicates Dropped`
   - `TTL Expired (0)`
   - `Invalid Packets`
3. Inspect the real-time event table (`SENT`, `RECEIVED`, `RELAYED`, `DROPPED_DUPLICATE`, `DROPPED_EXPIRED`).
4. Click the **Inspect (`</>`)** button on any row to view the formatted, raw JSON wire packet.

### 4.6 Mesh Topology Visualizer
1. Navigate to the **Mesh Topology** tab.
2. The radar view displays the local node at the center and surrounding discovered peer nodes.
3. Animated signal pulse waves travel along the connection lines to represent active packet transmission.
4. Click any node circle to inspect its role, status, IP address, and packet counts.

### 4.7 5-Node Demo Simulator (For College Presentations / Vivas)
1. Navigate to the **Demo Simulator** tab.
2. Select a Computer Networks presentation scenario:
   - **Scenario 1: Multi-Hop SOS Propagation** (`NODE-A → NODE-B → NODE-C → NODE-D → NODE-E`).
   - **Scenario 2: Duplicate Packet Prevention** (Multipath arrival at `NODE-D` with duplicate dropping).
   - **Scenario 3: Hop-Count / TTL Expiration** (Terminates when TTL reaches 0).
3. Click **Execute Simulation**.
4. Use **Next Step →** to step through each node's decision logic and explain the networking principles to examiners.

### 4.8 Node Configuration & Tuning
1. Click the **Sliders / Settings** icon in the header.
2. Customize:
   - **Node Callsign / Display Name**.
   - **Role**: `Civilian`, `Responder`, or `Relay`.
   - **Multi-Hop Relaying Toggle**: Enable or disable packet forwarding.
   - **Default Hop Count**: Range from 1 to 16.
   - **UDP Socket Port**: (Default: 50005).
   - **Reset Session Data**: Clear messages, duplicate cache, and sniffer history for a fresh demo.

---

## 5. Computer Networks Technical Concepts Explained

| Concept | Implementation in DECS | Importance |
| :--- | :--- | :--- |
| **UDP DGRAM Sockets** | Uses `socket.SOCK_DGRAM` with `SO_BROADCAST` to send to `255.255.255.255`. | Connectionless, zero-handshake broadcasting ideal for emergency distress channels. |
| **Port Reuse** | Configures `SO_REUSEADDR` on socket initialization. | Allows multiple test instances to run on the same physical host during demonstrations. |
| **Hop Limit / TTL** | Each relay node decrements `hop_count` by 1. Drops when $\text{TTL} \le 1$. | Prevents infinite packet looping across the mesh network. |
| **Duplicate Prevention** | Thread-safe in-memory sliding-window cache with TTL expiration. | Prevents broadcast storms and redundant processing in dense topologies. |
| **CSMA/CA Jitter** | Relay worker applies a random delay ($25\text{ms} \le t \le 75\text{ms}$) before re-broadcasting. | Mitigates RF packet collisions on shared half-duplex Wi-Fi media. |
| **Payload MTU Constraint**| Serialization strictly limits payload to $\le 1024$ bytes. | Guarantees single-frame transmission without Layer 3 IP fragmentation. |

---

## 6. Verification & Automated Testing

To run the automated test suite:
```bash
cd backend
python -m pytest -v
```

### Verified Test Cases:
1. `test_packet.py`: Validates serialization, deserialization, 1024-byte limit enforcement, and schema validation.
2. `test_duplicate.py`: Verifies first-arrival acceptance, second-arrival rejection, and TTL expiration.
3. `test_relay_ttl.py`: Verifies hop count decrement ($5 \rightarrow 4 \rightarrow 3 \rightarrow 2 \rightarrow 1 \rightarrow 0$) and path chaining.
4. `test_udp_sockets.py`: Tests real live UDP loopback transmission between two sockets.
5. `test_database.py`: Tests SQLite message saving, incident triage updates, and event logging.

---

## 7. Troubleshooting & FAQs

### Q1: "UDP socket bind failed on port 50005"
- **Cause**: Another application or an existing DECS instance is currently using port 50005.
- **Fix**: Either close the existing terminal/process, or change the UDP port in `backend/config.py` (or through the Settings dialog).

### Q2: "Nodes on two separate laptops cannot discover each other"
- **Cause**: Wi-Fi Access Point (AP) Isolation is enabled on your router, or Windows Defender Firewall is blocking incoming UDP packets.
- **Fix**:
  1. Open Windows Defender Firewall $\rightarrow$ Allow an app $\rightarrow$ Allow Python.
  2. If using a mobile hotspot, ensure AP Isolation / Client Isolation is disabled.

### Q3: "Browser GPS location is not detected"
- **Cause**: Browser permissions or lack of hardware GPS receiver.
- **Fix**: Enter the manual landmark/room description in the Location field. DECS is designed to function 100% offline with manual landmark coordinates.

---

## 8. Practical Limitations Disclosure

- **Physical Range**: Transmission is bounded by local 802.11 Wi-Fi / Ethernet broadcast domains.
- **Best-Effort Delivery**: UDP does not provide TCP-style ACKs; multi-hop relaying and periodic beacons provide best-effort resilience.
- **Scope**: Designed as an academic CNIP demonstration of decentralized ad-hoc protocols rather than a certified military-grade radio appliance.
