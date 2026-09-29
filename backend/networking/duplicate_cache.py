"""
DECS Duplicate Packet Prevention Cache
Thread-safe LRU / Sliding-Window TTL Cache for message IDs
"""
import time
import threading
from typing import Dict


class DuplicateCache:
    """
    Tracks recently seen msg_ids with an expiration TTL (e.g. 300 seconds).
    Thread-safe implementation with automatic eviction.
    """
    def __init__(self, ttl_seconds: int = 300, max_entries: int = 5000):
        self.ttl_seconds = ttl_seconds
        self.max_entries = max_entries
        self._cache: Dict[str, float] = {}  # msg_id -> expiration_timestamp
        self._lock = threading.Lock()

    def is_duplicate(self, msg_id: str) -> bool:
        """
        Check if msg_id was already seen within TTL.
        If NOT seen, records msg_id and returns False (not duplicate).
        If seen and active, returns True (is duplicate).
        """
        now = time.time()
        with self._lock:
            # First purge expired entries if cache is growing
            if len(self._cache) > 100:
                self._evict_expired(now)

            if msg_id in self._cache:
                exp = self._cache[msg_id]
                if now < exp:
                    return True  # Active duplicate
                else:
                    # Expired, refresh expiration and accept as new
                    self._cache[msg_id] = now + self.ttl_seconds
                    return False

            # If cache exceeds max entries, remove oldest
            if len(self._cache) >= self.max_entries:
                oldest_key = min(self._cache, key=self._cache.get)
                del self._cache[oldest_key]

            # Add new entry
            self._cache[msg_id] = now + self.ttl_seconds
            return False

    def add(self, msg_id: str) -> None:
        """Explicitly add a message ID (e.g. locally originated) to prevent loopback processing"""
        now = time.time()
        with self._lock:
            self._cache[msg_id] = now + self.ttl_seconds

    def has(self, msg_id: str) -> bool:
        """Query without modifying state"""
        now = time.time()
        with self._lock:
            if msg_id in self._cache:
                return now < self._cache[msg_id]
            return False

    def _evict_expired(self, now: float) -> None:
        """Evict all keys where expiration < now"""
        expired_keys = [k for k, exp in self._cache.items() if exp <= now]
        for k in expired_keys:
            del self._cache[k]

    def size(self) -> int:
        with self._lock:
            return len(self._cache)

    def clear(self) -> None:
        with self._lock:
            self._cache.clear()
