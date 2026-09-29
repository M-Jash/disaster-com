"""
Unit tests for Multi-Hop Relay Logic, Hop Count / TTL Decrement, and Expiration
"""
from models.schemas import PacketSchema


def test_hop_count_decrement_logic():
    # Simulate packet hop reduction: 5 -> 4 -> 3 -> 2 -> 1 -> 0
    packet = PacketSchema(
        msg_id="NODE-A-100",
        sender="NODE-A",
        type="NORMAL",
        text="Flood level rising",
        hop_count=5,
        initial_hops=5,
        relay_path=["NODE-A"]
    )

    nodes = ["NODE-B", "NODE-C", "NODE-D", "NODE-E"]
    current_packet = packet

    for next_node in nodes:
        assert current_packet.hop_count > 1
        new_hop = current_packet.hop_count - 1
        new_path = list(current_packet.relay_path) + [next_node]

        current_packet = current_packet.model_copy(
            update={"hop_count": new_hop, "relay_path": new_path}
        )

    # After 4 hops (NODE-A -> B -> C -> D -> E), hop_count should be 1
    assert current_packet.hop_count == 1
    assert current_packet.relay_path == ["NODE-A", "NODE-B", "NODE-C", "NODE-D", "NODE-E"]

    # At hop_count == 1, packet is delivered locally and should NOT be relayed further (TTL Expired)
    can_relay_further = current_packet.hop_count > 1
    assert can_relay_further is False
