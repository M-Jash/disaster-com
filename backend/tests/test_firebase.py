"""
Unit tests for Firebase client and non-blocking sync safety
"""
import pytest
from firebase_client import FirebaseSyncClient
from database import Database
import os

TEST_DB_PATH = "test_firebase_decs.db"


@pytest.fixture
def test_db():
    if os.path.exists(TEST_DB_PATH):
        os.remove(TEST_DB_PATH)
    database = Database(db_path=TEST_DB_PATH)
    yield database
    if os.path.exists(TEST_DB_PATH):
        os.remove(TEST_DB_PATH)


def test_firebase_client_offline_graceful_degradation():
    client = FirebaseSyncClient(key_path="non_existent_key.json", enabled=True)
    # Should not throw exception even if key does not exist
    initialized = client.initialize()
    assert initialized is False
    assert client.is_connected is False

    # Sync operations should safely no-op without raising exceptions
    client.sync_message({"msg_id": "TEST-1", "text": "hello"})
    client.sync_incident_status("TEST-1", "RESOLVED")
    client.sync_node({"node_id": "NODE-1"})


def test_database_operations_with_offline_firebase(test_db):
    # Ensure database operations succeed even when Firebase is offline
    msg_data = {
        "msg_id": "MSG-OFFLINE-001",
        "sender": "NODE-OFFLINE",
        "type": "SOS",
        "text": "Emergency with offline Firebase",
        "hop_count": 5,
        "priority": "CRITICAL",
        "category": "MEDICAL",
        "incident_status": "NEW"
    }
    assert test_db.save_message(msg_data) is True

    # Test status update
    assert test_db.update_incident_status("MSG-OFFLINE-001", "RESOLVED") is True

    # Test node upsert
    test_db.upsert_node("NODE-OFFLINE", "Offline Node", "CIVILIAN", "192.168.1.10", 3)
    nodes = test_db.get_nodes()
    assert any(n["node_id"] == "NODE-OFFLINE" for n in nodes)
