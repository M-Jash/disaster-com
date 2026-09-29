"""
Integration tests for real UDP Socket transmission and multi-instance broadcast reception
"""
import time
import socket
from networking.udp_node import UDPNode
from networking.packet import serialize_packet, deserialize_packet, generate_msg_id
from models.schemas import PacketSchema


def test_udp_socket_send_and_receive():
    received_packets = []

    def on_receive(data, addr):
        try:
            pkt = deserialize_packet(data)
            received_packets.append((pkt, addr))
        except Exception as e:
            print("Deserialization failed:", e)

    # Receiver Node
    rx_node = UDPNode(port=50020, broadcast_ip="127.0.0.1", on_packet_received=on_receive)
    assert rx_node.start() is True

    # Sender Node
    tx_node = UDPNode(port=50021, broadcast_ip="127.0.0.1")
    assert tx_node.start() is True

    try:
        # Create test packet
        msg_id = generate_msg_id("NODE-TX")
        packet = PacketSchema(
            msg_id=msg_id,
            sender="NODE-TX",
            type="NORMAL",
            text="UDP Loopback Integration Test",
            hop_count=5
        )
        raw_bytes = serialize_packet(packet)

        # Broadcast packet targeted to port 50020
        success = tx_node.send_broadcast(raw_bytes, target_port=50020)
        assert success is True

        # Allow background receiver thread to capture packet
        time.sleep(0.3)

        assert len(received_packets) >= 1
        rx_pkt, addr = received_packets[0]
        assert rx_pkt.msg_id == msg_id
        assert rx_pkt.sender == "NODE-TX"
        assert rx_pkt.text == "UDP Loopback Integration Test"

    finally:
        rx_node.stop()
        tx_node.stop()
