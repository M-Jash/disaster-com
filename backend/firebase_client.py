"""
DECS Firebase Firestore Cloud Synchronization Client
Provides asynchronous cloud persistence alongside offline SQLite.
"""
import os
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("decs.firebase")

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False
    logger.warning("firebase-admin package not installed. Cloud sync will be disabled.")


class FirebaseSyncClient:
    def __init__(self, key_path: str = "firebase-service-account.json", enabled: bool = True):
        self.key_path = key_path
        self.enabled = enabled
        self.db = None
        self.app = None
        self.is_connected = False

    def initialize(self) -> bool:
        """Initializes Firebase Admin SDK and Firestore client."""
        if not self.enabled:
            logger.info("Firebase sync is disabled in config.")
            return False

        if not FIREBASE_AVAILABLE:
            logger.warning("firebase-admin not installed. Run: pip install firebase-admin")
            return False

        # Check for key file (relative to backend folder or absolute path)
        possible_paths = [
            self.key_path,
            os.path.join(os.path.dirname(__file__), self.key_path),
            os.path.join(os.getcwd(), self.key_path),
            self.key_path + ".json",
            os.path.join(os.path.dirname(__file__), self.key_path + ".json"),
            os.path.join(os.getcwd(), self.key_path + ".json"),
        ]

        resolved_path = None
        for p in possible_paths:
            if os.path.exists(p):
                resolved_path = p
                break

        if not resolved_path:
            logger.warning(
                "Firebase service account key not found at '%s'. "
                "Place 'firebase-service-account.json' in backend/ to enable cloud sync.",
                self.key_path
            )
            return False

        try:
            cred = credentials.Certificate(resolved_path)
            if not firebase_admin._apps:
                self.app = firebase_admin.initialize_app(cred)
            else:
                self.app = firebase_admin.get_app()

            self.db = firestore.client()
            self.is_connected = True
            logger.info("✓ Firebase Firestore connected successfully!")
            return True
        except Exception as e:
            logger.error("Failed to initialize Firebase: %s", e)
            self.is_connected = False
            return False

    def sync_message(self, message: Dict[str, Any]):
        """Uploads message/SOS to Firestore collection 'messages'."""
        if not self.is_connected or not self.db:
            return

        try:
            msg_id = message.get("msg_id")
            if not msg_id:
                return

            doc_ref = self.db.collection("messages").document(msg_id)
            doc_ref.set(message, merge=True)
            logger.debug("Synced message [%s] to Firebase Firestore.", msg_id)
        except Exception as e:
            logger.warning("Failed to sync message to Firebase: %s", e)

    def sync_incident_status(self, msg_id: str, status: str):
        """Updates triage status in Firestore."""
        if not self.is_connected or not self.db:
            return

        try:
            doc_ref = self.db.collection("messages").document(msg_id)
            doc_ref.update({"incident_status": status})
            logger.debug("Updated status of incident [%s] in Firebase to %s.", msg_id, status)
        except Exception as e:
            logger.warning("Failed to sync status update to Firebase: %s", e)

    def sync_node(self, node: Dict[str, Any]):
        """Uploads discovered node to Firestore collection 'nodes'."""
        if not self.is_connected or not self.db:
            return

        try:
            node_id = node.get("node_id")
            if not node_id:
                return

            doc_ref = self.db.collection("nodes").document(node_id)
            doc_ref.set(node, merge=True)
            logger.debug("Synced node [%s] to Firebase Firestore.", node_id)
        except Exception as e:
            logger.warning("Failed to sync node to Firebase: %s", e)


# Global singleton instance
firebase_client = FirebaseSyncClient()