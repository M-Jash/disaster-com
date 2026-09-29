"""
Unit tests for Packet Serialization, Deserialization, Size Validation, and Schema Integrity
"""
import pytest
from models.schemas import PacketSchema, Location
from networking.packet import (
    serialize_packet,
    deserialize_packet,
    generate_msg_id,
    PacketSizeExceededError,
    MalformedPacketError,
    InvalidPacketSchemaError,
    MAX_PACKET_BYTES
)


def test_generate_msg_id():
    msg_id = generate_msg_id("NODE-TEST")
    assert msg_id.startswith("NODE-TEST-")
    assert len(msg_id) > 12


def test_valid_packet_serialization_deserialization():
    packet = PacketSchema(
        msg_id="NODE-A-1727351001-001",
        sender="NODE-A",
        sender_name="Alice",
        type="SOS",
        text="Medical assistance required at Main Gate",
        hop_count=5,
        initial_hops=5,
        priority="CRITICAL",
        category="MEDICAL",
        location=Location(latitude=12.9716, longitude=77.5946, description="Main Gate"),
        relay_path=["NODE-A"]
    )

    # 1. Serialize
    raw_bytes = serialize_packet(packet)
    assert isinstance(raw_bytes, bytes)
    assert len(raw_bytes) <= MAX_PACKET_BYTES

    # 2. Deserialize
    recovered = deserialize_packet(raw_bytes)
    assert recovered.msg_id == packet.msg_id
    assert recovered.sender == "NODE-A"
    assert recovered.type == "SOS"
    assert recovered.text == packet.text
    assert recovered.hop_count == 5
    assert recovered.location.latitude == 12.9716
    assert recovered.relay_path == ["NODE-A"]


def test_packet_size_limit_rejection():
    # Construct a packet that produces > 1024 serialized bytes
    packet = PacketSchema(
        msg_id="NODE-TEST-OVERSIZED",
        sender="NODE-TEST",
        type="NORMAL",
        text="Sample message text",
        hop_count=5,
        relay_path=["NODE-LONG-NAME-TESTING-PAYLOAD-LIMITS-HERE"] * 30
    )

    # Serialization should raise PacketSizeExceededError
    with pytest.raises(PacketSizeExceededError):
        serialize_packet(packet)

    # Deserialization of huge byte string should also raise PacketSizeExceededError
    huge_bytes = b"X" * (MAX_PACKET_BYTES + 50)
    with pytest.raises(PacketSizeExceededError):
        deserialize_packet(huge_bytes)


def test_malformed_json_rejection():
    bad_bytes = b"{ this is not valid json! }"
    with pytest.raises(MalformedPacketError):
        deserialize_packet(bad_bytes)


def test_missing_required_fields():
    # Missing required field 'text' and 'sender'
    invalid_json = b'{"version": "1.0", "msg_id": "TEST-01"}'
    with pytest.raises(InvalidPacketSchemaError):
        deserialize_packet(invalid_json)
