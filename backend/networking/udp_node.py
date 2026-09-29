"""
DECS Low-Level UDP Networking Node
Socket creation, broadcast transmission, and asynchronous background receiver thread
"""
import socket
import threading
import logging
from typing import Callable, Optional, Tuple

logger = logging.getLogger("decs.udp_node")


class UDPNode:
    """
    Low-level UDP networking manager.
    Handles socket initialization, SO_BROADCAST / SO_REUSEADDR binding,
    background listening loop, and broadcast transmissions.
    """
    def __init__(
        self,
        port: int = 50005,
        broadcast_ip: str = "255.255.255.255",
        on_packet_received: Optional[Callable[[bytes, Tuple[str, int]], None]] = None
    ):
        self.port = port
        self.broadcast_ip = broadcast_ip
        self.on_packet_received = on_packet_received
        self._sock: Optional[socket.socket] = None
        self._rx_thread: Optional[threading.Thread] = None
        self._running = False
        self._lock = threading.Lock()
        self.is_bound = False
        self.last_error: Optional[str] = None

    def start(self) -> bool:
        """Initialize socket and spawn background receiver thread"""
        with self._lock:
            if self._running:
                return True

            try:
                # Create UDP socket (SOCK_DGRAM)
                self._sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                
                # Enable broadcasting permission
                self._sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)

                # Allow reuse of address/port for testing multiple local instances
                self._sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
                
                # Check for SO_REUSEPORT on Unix-like systems
                if hasattr(socket, "SO_REUSEPORT"):
                    try:
                        self._sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEPORT, 1)
                    except (AttributeError, OSError):
                        pass

                # Set timeout so receiver loop can cleanly exit on shutdown
                self._sock.settimeout(1.0)

                # Bind to all interfaces (0.0.0.0) on the configured UDP port
                self._sock.bind(("", self.port))
                self.is_bound = True
                self._running = True
                self.last_error = None
                logger.info("UDP socket bound successfully to 0.0.0.0:%d (Broadcast: %s)", self.port, self.broadcast_ip)

                # Start receiver thread
                self._rx_thread = threading.Thread(target=self._receive_loop, name="DECS-UDP-Receiver", daemon=True)
                self._rx_thread.start()
                return True

            except OSError as e:
                self.is_bound = False
                self._running = False
                self.last_error = f"Socket Error on port {self.port}: {e}"
                logger.error("Failed to bind UDP socket on port %d: %s", self.port, e)
                return False

    def _receive_loop(self) -> None:
        """Continuously listen for incoming UDP broadcast packets"""
        logger.info("UDP Receiver loop started on port %d", self.port)
        while self._running:
            try:
                if not self._sock:
                    break
                data, addr = self._sock.recvfrom(2048)
                if data and self.on_packet_received:
                    try:
                        self.on_packet_received(data, addr)
                    except Exception as e:
                        logger.exception("Error in packet receive handler: %s", e)
            except socket.timeout:
                continue
            except OSError as e:
                if self._running:
                    logger.warning("UDP socket receive exception: %s", e)
                break
        logger.info("UDP Receiver loop terminated")

    def send_broadcast(self, data: bytes, target_port: Optional[int] = None) -> bool:
        """Send raw packet bytes via UDP broadcast to (broadcast_ip, port)"""
        if not self._sock or not self.is_bound:
            logger.warning("Attempted to send packet while UDP socket is not bound")
            return False

        dest_port = target_port or self.port
        try:
            # Send to broadcast IP
            self._sock.sendto(data, (self.broadcast_ip, dest_port))
            return True
        except Exception as e:
            logger.error("Failed to broadcast UDP packet to %s:%d: %s", self.broadcast_ip, dest_port, e)
            return False

    def stop(self) -> None:
        """Cleanly close socket and terminate receiver thread"""
        with self._lock:
            self._running = False
            self.is_bound = False
            if self._sock:
                try:
                    self._sock.close()
                except Exception:
                    pass
                self._sock = None

        if self._rx_thread and self._rx_thread.is_alive():
            self._rx_thread.join(timeout=2.0)
        logger.info("UDP Node stopped successfully")
