"""
DECS Messages API Endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from models.schemas import SendMessageRequest, MessageResponse
from database import Database

router = APIRouter(prefix="/api/messages", tags=["Messages"])

def get_db():
    from main import app_state
    return app_state.db

def get_relay_engine():
    from main import app_state
    return app_state.relay_engine


@router.get("", response_model=List[MessageResponse])
def list_messages(
    limit: int = 100,
    type: Optional[str] = None,
    db: Database = Depends(get_db)
):
    """Retrieve message history with optional type filter (NORMAL, SOS, STATUS)"""
    return db.get_messages(limit=limit, msg_type=type)


@router.post("", response_model=MessageResponse)
def send_message(
    req: SendMessageRequest,
    relay_engine = Depends(get_relay_engine)
):
    """Send an emergency message via local UDP broadcast and multi-hop mesh"""
    try:
        packet = relay_engine.send_local_message(
            text=req.text,
            msg_type="NORMAL",
            priority=req.priority,
            category=req.category,
            location=req.location,
            sender_name=req.sender_name,
            sender_id=req.sender_id,
            hop_count=req.hop_count
        )
        return MessageResponse(**packet.model_dump())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to broadcast message: {e}")
