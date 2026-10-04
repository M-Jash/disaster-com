"""
DECS Incidents & SOS API Endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from models.schemas import SendSOSRequest, UpdateIncidentRequest, MessageResponse
from database import Database

router = APIRouter(prefix="/api", tags=["Incidents & SOS"])

def get_db():
    from main import app_state
    return app_state.db

def get_relay_engine():
    from main import app_state
    return app_state.relay_engine


@router.get("/incidents", response_model=List[MessageResponse])
def list_incidents(
    status: Optional[str] = "ALL",
    category: Optional[str] = "ALL",
    priority: Optional[str] = "ALL",
    db: Database = Depends(get_db)
):
    """Retrieve filtered emergency incidents with multi-hop relay trace"""
    return db.get_incidents(status=status, category=category, priority=priority)


@router.post("/sos", response_model=MessageResponse)
def trigger_sos_alert(
    req: SendSOSRequest,
    relay_engine = Depends(get_relay_engine)
):
    """Broadcast a critical SOS alert to all nearby nodes and relayers"""
    try:
        packet = relay_engine.send_local_message(
            text=req.text,
            msg_type="SOS",
            priority=req.priority,
            category=req.category,
            location=req.location,
            sender_name=req.sender_name,
            sender_id=req.sender_id,
            hop_count=req.hop_count
        )
        return MessageResponse(**packet.model_dump())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to broadcast SOS alert: {e}")


@router.patch("/incidents/{msg_id}")
def update_incident_status(
    msg_id: str,
    req: UpdateIncidentRequest,
    db: Database = Depends(get_db),
    relay_engine = Depends(get_relay_engine)
):
    """Update incident triage status (NEW, ACKNOWLEDGED, IN_PROGRESS, RESOLVED)"""
    success = db.update_incident_status(msg_id, req.status)
    if not success:
        raise HTTPException(status_code=404, detail="Incident not found or could not be updated")

    # Broadcast status change event
    relay_engine._notify_ws("INCIDENT_STATUS_UPDATED", {
        "msg_id": msg_id,
        "status": req.status,
        "stats": db.get_stats()
    })
    return {"status": "success", "msg_id": msg_id, "new_status": req.status}
