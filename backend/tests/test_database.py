"""
Unit tests for SQLite database persistence, incident triage, and telemetry logging
"""
import os
import pytest
from database import Database

TEST_DB_PATH = "test_decs.db"


@pytest.fixture
def db():
    if os.path.exists(TEST_DB_PATH):
        os.remove(TEST_DB_PATH)
    database = Database(db_path=TEST_DB_PATH)
    yield database
    if os.path.exists(TEST_DB_PATH):
        os.remove(TEST_DB_PATH)


def test_save_and_retrieve_message(db):
    msg_data = {
        "msg_id": "TEST-MSG-001",
        "sender": "NODE-X",
        "sender_name": "Bob",
        "type": "NORMAL",
        "text": "All clear at Zone 3",
        "hop_count": 4,
        "priority": "LOW",
        "category": "GENERAL",
        "relay_path": ["NODE-X", "NODE-Y"]
    }
    saved = db.save_message(msg_data)
    assert saved is True

    # Duplicate save should be ignored
    saved_again = db.save_message(msg_data)
    assert saved_again is False

    messages = db.get_messages()
    assert len(messages) == 1
    assert messages[0]["msg_id"] == "TEST-MSG-001"
    assert messages[0]["relay_path"] == ["NODE-X", "NODE-Y"]


def test_incident_filtering_and_status_update(db):
    sos_data = {
        "msg_id": "SOS-FIRE-999",
        "sender": "NODE-FIRE-1",
        "sender_name": "Chief Dave",
        "type": "SOS",
        "text": "Fire spreading rapidly in Sector 5",
        "hop_count": 5,
        "priority": "CRITICAL",
        "category": "FIRE",
        "incident_status": "NEW"
    }
    db.save_message(sos_data)

    incidents = db.get_incidents(status="NEW", category="FIRE")
    assert len(incidents) == 1
    assert incidents[0]["msg_id"] == "SOS-FIRE-999"

    # Update triage status to IN_PROGRESS
    updated = db.update_incident_status("SOS-FIRE-999", "IN_PROGRESS")
    assert updated is True

    in_progress_incidents = db.get_incidents(status="IN_PROGRESS")
    assert len(in_progress_incidents) == 1
    assert in_progress_incidents[0]["incident_status"] == "IN_PROGRESS"


def test_telemetry_event_logging(db):
    db.log_event("SENT", msg_id="M-1", sender="NODE-A", details="Test send", hop_count=5)
    db.log_event("DROPPED_DUPLICATE", msg_id="M-1", sender="NODE-B", details="Duplicate dropped")

    events = db.get_events()
    assert len(events) == 2
    assert events[0]["event_type"] == "DROPPED_DUPLICATE"

    stats = db.get_stats()
    assert stats["packets_sent"] == 1
    assert stats["duplicates_dropped"] == 1
