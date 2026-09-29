"""
DECS Packet Engine
Serialization, Deserialization, Validation, and Wire Protocol (Max 1024 bytes)
"""
import json
import time
import random
import string
from typing import Dict, Any, Union
from pydantic import ValidationError
from models.schemas import PacketSchema

MAX_PACKET_BYTES = 1024


class PacketError(Exception):
    """Base exception for packet errors"""
    pass


class PacketSizeExceededError(PacketError):
    """Raised when wire packet exceeds maximum byte size (1024 bytes)"""
    pass


class MalformedPacketError(PacketError):
    """Raised when incoming packet is not valid JSON"""
    pass


class InvalidPacketSchemaError(PacketError):
    """Raised when packet schema validation fails"""
    pass


def generate_msg_id(node_id: str) -> str:
    """Generate a globally unique message ID: <NODE_ID>-<timestamp_ms>-<rand>"""
    ts_ms = int(time.time() * 1000)
    rand_suffix = "".join(random.choices(string.hexdigits.upper()[:16], k=3))
    return f"{node_id}-{ts_ms}-{rand_suffix}"


def serialize_packet(packet: Union[PacketSchema, Dict[str, Any]]) -> bytes:
    """
    Serialize Packet to compact UTF-8 JSON bytes.
    Enforces maximum payload size of 1024 bytes.
    """
    if isinstance(packet, PacketSchema):
        data = packet.model_dump(exclude_none=True)
    elif isinstance(packet, dict):
        try:
            data = PacketSchema(**packet).model_dump(exclude_none=True)
        except ValidationError as e:
            raise InvalidPacketSchemaError(f"Schema validation failed: {e}")
    else:
        raise InvalidPacketSchemaError("Invalid packet object type")

    # Compact JSON representation (no extra whitespace)
    json_str = json.dumps(data, separators=(",", ":"), ensure_ascii=False)
    encoded_bytes = json_str.encode("utf-8")

    if len(encoded_bytes) > MAX_PACKET_BYTES:
        raise PacketSizeExceededError(
            f"Packet size {len(encoded_bytes)} bytes exceeds maximum {MAX_PACKET_BYTES} bytes"
        )

    return encoded_bytes


def deserialize_packet(raw_bytes: bytes) -> PacketSchema:
    """
    Deserialize raw wire bytes into a validated PacketSchema object.
    Raises MalformedPacketError or InvalidPacketSchemaError on invalid input.
    """
    if len(raw_bytes) > MAX_PACKET_BYTES:
        raise PacketSizeExceededError(
            f"Received wire packet size {len(raw_bytes)} bytes exceeds limit {MAX_PACKET_BYTES} bytes"
        )

    try:
        raw_str = raw_bytes.decode("utf-8")
    except UnicodeDecodeError as e:
        raise MalformedPacketError(f"UTF-8 decoding failed: {e}")

    try:
        data = json.loads(raw_str)
    except json.JSONDecodeError as e:
        raise MalformedPacketError(f"JSON parsing failed: {e}")

    if not isinstance(data, dict):
        raise MalformedPacketError("Packet payload is not a JSON object")

    try:
        return PacketSchema(**data)
    except ValidationError as e:
        raise InvalidPacketSchemaError(f"Schema validation failed: {e}")
