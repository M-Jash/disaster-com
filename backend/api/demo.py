"""
DECS Demonstration & Multi-Node Simulation Engine
Designed for interactive classroom / viva presentations to demonstrate multi-hop mesh routing,
hop-count reduction, duplicate packet rejection, and TTL expiration without needing 5 physical laptops.
"""
import time
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/demo", tags=["Demo Simulation Mode"])

def get_relay_engine():
    from main import app_state
    return app_state.relay_engine

def get_db():
    from main import app_state
    return app_state.db


class SimulationRequest(BaseModel):
    scenario: str = Field(default="MULTI_HOP_SOS", description="MULTI_HOP_SOS, DUPLICATE_LOOP, TTL_EXPIRATION, MESH_FLOOD")
    initial_hops: int = Field(default=4, ge=1, le=10)
    origin_node: str = Field(default="NODE-A", description="Originating node")
    message_text: str = Field(default="Flash flood warning near Sector 7. Immediate evacuation needed.", description="Simulation message")
    emergency_type: str = Field(default="SOS", description="SOS or NORMAL")
    priority: str = Field(default="CRITICAL", description="CRITICAL, HIGH, MEDIUM")
    category: str = Field(default="FLOOD", description="Emergency category")


@router.post("/simulate")
def run_simulation(req: SimulationRequest, relay_engine = Depends(get_relay_engine), db = Depends(get_db)):
    """
    Executes a multi-node mesh propagation simulation step-by-step.
    Generates realistic hop decrement logs, duplicate drop points, and relay traces.
    """
    steps: List[Dict[str, Any]] = []
    
    # Virtual Mesh Topology Nodes
    nodes = ["NODE-A (Origin)", "NODE-B (Relay 1)", "NODE-C (Relay 2)", "NODE-D (Relay 3)", "NODE-E (Command Base)"]
    sim_msg_id = f"SIM-{req.origin_node}-{int(time.time())}-99"
    
    current_hops = req.initial_hops
    relay_path = [req.origin_node]

    # Step 1: Origin node broadcasts
    steps.append({
        "step": 1,
        "type": "ORIGINATE",
        "node": req.origin_node,
        "action": f"ORIGINATED {req.emergency_type} BROADCAST",
        "hop_count": current_hops,
        "relay_path": list(relay_path),
        "details": f"{req.origin_node} creates packet [{sim_msg_id}] with initial TTL={current_hops}. Broadcasts over local UDP.",
        "status": "SENT",
        "status_color": "emerald"
    })

    if req.scenario == "MULTI_HOP_SOS":
        # Linear multi-hop propagation A -> B -> C -> D -> E
        hop_nodes = ["NODE-B", "NODE-C", "NODE-D", "NODE-E"]
        for idx, node in enumerate(hop_nodes, start=2):
            if current_hops <= 1:
                # TTL Expired
                steps.append({
                    "step": idx,
                    "type": "EXPIRED",
                    "node": node,
                    "action": "TTL EXPIRED (PACKET DROPPED)",
                    "hop_count": 0,
                    "relay_path": list(relay_path),
                    "details": f"{node} received packet but hop_count is {current_hops}. Message stored locally; will NOT relay further.",
                    "status": "EXPIRED",
                    "status_color": "amber"
                })
                break

            # Decrement hop
            current_hops -= 1
            relay_path.append(node)
            steps.append({
                "step": idx,
                "type": "RELAY",
                "node": node,
                "action": f"RECEIVED & RELAYED (TTL: {current_hops + 1} → {current_hops})",
                "hop_count": current_hops,
                "relay_path": list(relay_path),
                "details": f"{node} validated packet, checked duplicate cache (PASSED), decremented TTL, and rebroadcast to next hops.",
                "status": "RELAYED",
                "status_color": "cyan"
            })

    elif req.scenario == "DUPLICATE_LOOP":
        # A broadcasts to B and C; both forward to D; D receives from B first, then drops from C!
        steps.append({
            "step": 2,
            "type": "RELAY",
            "node": "NODE-B",
            "action": f"RELAY VIA PATH 1 (TTL: {current_hops} → {current_hops - 1})",
            "hop_count": current_hops - 1,
            "relay_path": [req.origin_node, "NODE-B"],
            "details": "NODE-B receives packet, checks duplicate cache (MISS), decrements hop to 3, rebroadcasts to NODE-D.",
            "status": "RELAYED",
            "status_color": "cyan"
        })
        steps.append({
            "step": 3,
            "type": "RELAY",
            "node": "NODE-C",
            "action": f"RELAY VIA PATH 2 (TTL: {current_hops} → {current_hops - 1})",
            "hop_count": current_hops - 1,
            "relay_path": [req.origin_node, "NODE-C"],
            "details": "NODE-C receives original broadcast, checks cache (MISS), decrements hop to 3, rebroadcasts to NODE-D.",
            "status": "RELAYED",
            "status_color": "cyan"
        })
        steps.append({
            "step": 4,
            "type": "DELIVERED",
            "node": "NODE-D",
            "action": "FIRST ARRIVAL ACCEPTED (FROM NODE-B)",
            "hop_count": current_hops - 2,
            "relay_path": [req.origin_node, "NODE-B", "NODE-D"],
            "details": "NODE-D receives copy from NODE-B first. Checks duplicate cache: NEW ID. Stores in DB and cache.",
            "status": "ACCEPTED",
            "status_color": "emerald"
        })
        steps.append({
            "step": 5,
            "type": "DUPLICATE_DROP",
            "node": "NODE-D",
            "action": "DUPLICATE DETECTED & DROPPED (FROM NODE-C)",
            "hop_count": current_hops - 2,
            "relay_path": [req.origin_node, "NODE-C", "NODE-D"],
            "details": f"NODE-D receives copy from NODE-C. Cache lookup: msg_id {sim_msg_id} already exists! DROPPED IMMEDIATELY.",
            "status": "DROPPED",
            "status_color": "rose"
        })

    elif req.scenario == "TTL_EXPIRATION":
        # Short initial TTL e.g. 2 hops
        steps.append({
            "step": 2,
            "type": "RELAY",
            "node": "NODE-B",
            "action": "RELAYED (TTL: 2 → 1)",
            "hop_count": 1,
            "relay_path": ["NODE-A", "NODE-B"],
            "details": "NODE-B decrements TTL from 2 to 1 and rebroadcasts.",
            "status": "RELAYED",
            "status_color": "cyan"
        })
        steps.append({
            "step": 3,
            "type": "EXPIRED",
            "node": "NODE-C",
            "action": "TTL EXPIRED AT HOP LIMIT (TTL = 0)",
            "hop_count": 0,
            "relay_path": ["NODE-A", "NODE-B", "NODE-C"],
            "details": "NODE-C receives packet with hop_count=1. Cannot decrement further. Message delivered to local UI but dropped from mesh.",
            "status": "EXPIRED",
            "status_color": "amber"
        })

    # Broadcast simulation event over WebSockets to animate UI in real-time
    relay_engine._notify_ws("SIMULATION_RUN", {
        "scenario": req.scenario,
        "msg_id": sim_msg_id,
        "steps": steps
    })

    return {
        "status": "success",
        "scenario": req.scenario,
        "msg_id": sim_msg_id,
        "total_steps": len(steps),
        "steps": steps,
        "is_simulation": True
    }
