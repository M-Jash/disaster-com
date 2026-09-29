"""
Unit tests for Duplicate Packet Prevention and Expiration Cache
"""
import time
from networking.duplicate_cache import DuplicateCache


def test_duplicate_cache_first_arrival_accepted():
    cache = DuplicateCache(ttl_seconds=10)
    msg_id = "NODE-1-1001"
    
    # First time: not a duplicate
    is_dup = cache.is_duplicate(msg_id)
    assert is_dup is False


def test_duplicate_cache_second_arrival_rejected():
    cache = DuplicateCache(ttl_seconds=10)
    msg_id = "NODE-1-1002"

    # First time -> False
    assert cache.is_duplicate(msg_id) is False

    # Second time -> True (Duplicate detected and dropped)
    assert cache.is_duplicate(msg_id) is True

    # Third time -> Still True
    assert cache.is_duplicate(msg_id) is True


def test_explicit_add_marks_duplicate():
    cache = DuplicateCache(ttl_seconds=10)
    msg_id = "SELF-ORIGINATED-001"
    cache.add(msg_id)

    # Subsequent check should report duplicate
    assert cache.is_duplicate(msg_id) is True


def test_cache_ttl_expiration():
    # Very short TTL for test
    cache = DuplicateCache(ttl_seconds=0.1)
    msg_id = "SHORT-LIVED-001"

    assert cache.is_duplicate(msg_id) is False
    assert cache.is_duplicate(msg_id) is True

    # Wait for TTL to expire
    time.sleep(0.15)

    # After expiration, it should be treated as fresh
    assert cache.is_duplicate(msg_id) is False
