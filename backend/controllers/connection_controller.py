"""
Connection Controller - Handles founder-engineer connections and messaging
"""
from datetime import datetime, timezone
from typing import Optional, List
import uuid
import logging

from schemas.connection import (
    ConnectionRequest, ConnectionResponse, ConnectionStatus,
    ConnectionListResponse, Message, MessageType, generate_connection_id
)

logger = logging.getLogger(__name__)


class ConnectionController:
    """Controller for connection operations"""
    
    def __init__(self, db):
        self.db = db
    
    async def create_connection(self, founder_id: str, data: ConnectionRequest) -> ConnectionResponse:
        """Create a new connection request (founder to engineer)"""
        # Verify founder has a startup
        startup = await self.db.startups.find_one({"founder_id": founder_id})
        if not startup:
            raise ValueError("You need to create a startup first")
        
        # Verify engineer exists
        engineer = await self.db.users.find_one({"user_id": data.engineer_id, "role": "engineer"})
        if not engineer:
            raise ValueError("Engineer not found")
        
        # Check for existing connection
        existing = await self.db.connections.find_one({
            "founder_id": founder_id,
            "engineer_id": data.engineer_id
        })
        if existing:
            raise ValueError("Connection already exists with this engineer")
        
        connection_id = generate_connection_id()
        now = datetime.now(timezone.utc)
        
        # Create initial message
        founder_user = await self.db.users.find_one({"user_id": founder_id})
        initial_message = {
            "message_id": f"msg_{uuid.uuid4().hex[:12]}",
            "sender_id": founder_id,
            "sender_name": founder_user["name"],
            "content": data.message,
            "message_type": MessageType.TEXT.value,
            "sent_at": now.isoformat(),
            "read": False
        }
        
        connection_doc = {
            "connection_id": connection_id,
            "founder_id": founder_id,
            "engineer_id": data.engineer_id,
            "startup_id": startup["startup_id"],
            "role_id": data.role_id,
            "status": ConnectionStatus.PENDING.value,
            "messages": [initial_message],
            "created_at": now.isoformat(),
            "updated_at": None
        }
        
        await self.db.connections.insert_one(connection_doc)
        
        # Get role info if provided
        role = None
        if data.role_id:
            role = await self.db.roles.find_one({"role_id": data.role_id}, {"title": 1})
        
        return ConnectionResponse(
            connection_id=connection_id,
            founder_id=founder_id,
            engineer_id=data.engineer_id,
            role_id=data.role_id,
            status=ConnectionStatus.PENDING,
            messages=[Message(**{**initial_message, "sent_at": now})],
            created_at=now,
            founder_name=founder_user["name"],
            startup_name=startup["name"],
            engineer_name=engineer["name"],
            role_title=role["title"] if role else None
        )
    
    async def respond_to_connection(
        self,
        connection_id: str,
        engineer_id: str,
        accept: bool,
        message: Optional[str] = None
    ) -> ConnectionResponse:
        """Respond to a connection request (engineer)"""
        conn = await self.db.connections.find_one({"connection_id": connection_id})
        if not conn:
            raise ValueError("Connection not found")
        
        if conn["engineer_id"] != engineer_id:
            raise ValueError("Not authorized to respond to this connection")
        
        if conn["status"] != ConnectionStatus.PENDING.value:
            raise ValueError("Connection has already been responded to")
        
        now = datetime.now(timezone.utc)
        new_status = ConnectionStatus.ACCEPTED if accept else ConnectionStatus.DECLINED
        
        update_data = {
            "status": new_status.value,
            "updated_at": now.isoformat()
        }
        
        # Add response message if provided
        if message:
            engineer = await self.db.users.find_one({"user_id": engineer_id})
            response_message = {
                "message_id": f"msg_{uuid.uuid4().hex[:12]}",
                "sender_id": engineer_id,
                "sender_name": engineer["name"],
                "content": message,
                "message_type": MessageType.TEXT.value,
                "sent_at": now.isoformat(),
                "read": False
            }
            await self.db.connections.update_one(
                {"connection_id": connection_id},
                {
                    "$set": update_data,
                    "$push": {"messages": response_message}
                }
            )
        else:
            await self.db.connections.update_one(
                {"connection_id": connection_id},
                {"$set": update_data}
            )
        
        return await self.get_connection(connection_id)
    
    async def send_message(
        self,
        connection_id: str,
        sender_id: str,
        content: str
    ) -> ConnectionResponse:
        """Send a message in a connection"""
        conn = await self.db.connections.find_one({"connection_id": connection_id})
        if not conn:
            raise ValueError("Connection not found")
        
        # Verify sender is part of the connection
        if sender_id not in [conn["founder_id"], conn["engineer_id"]]:
            raise ValueError("Not authorized to send messages in this connection")
        
        # Check connection is accepted
        if conn["status"] != ConnectionStatus.ACCEPTED.value:
            raise ValueError("Cannot send messages until connection is accepted")
        
        sender = await self.db.users.find_one({"user_id": sender_id})
        now = datetime.now(timezone.utc)
        
        new_message = {
            "message_id": f"msg_{uuid.uuid4().hex[:12]}",
            "sender_id": sender_id,
            "sender_name": sender["name"],
            "content": content,
            "message_type": MessageType.TEXT.value,
            "sent_at": now.isoformat(),
            "read": False
        }
        
        await self.db.connections.update_one(
            {"connection_id": connection_id},
            {
                "$push": {"messages": new_message},
                "$set": {"updated_at": now.isoformat()}
            }
        )
        
        return await self.get_connection(connection_id)
    
    async def get_connection(self, connection_id: str) -> Optional[ConnectionResponse]:
        """Get connection by ID"""
        conn = await self.db.connections.find_one({"connection_id": connection_id}, {"_id": 0})
        if not conn:
            return None
        
        return await self._enrich_connection(conn)
    
    async def get_user_connections(
        self,
        user_id: str,
        role: str,
        page: int = 1,
        page_size: int = 20,
        status: Optional[str] = None
    ) -> ConnectionListResponse:
        """Get connections for a user"""
        if role == "founder":
            query = {"founder_id": user_id}
        else:
            query = {"engineer_id": user_id}
        
        if status:
            query["status"] = status
        
        total = await self.db.connections.count_documents(query)
        
        cursor = self.db.connections.find(query, {"_id": 0})
        cursor = cursor.skip((page - 1) * page_size).limit(page_size)
        cursor = cursor.sort("updated_at", -1)
        
        connections = []
        async for doc in cursor:
            connections.append(await self._enrich_connection(doc))
        
        return ConnectionListResponse(
            connections=connections,
            total=total,
            page=page,
            page_size=page_size,
            has_more=(page * page_size) < total
        )
    
    async def _enrich_connection(self, doc: dict) -> ConnectionResponse:
        """Enrich connection with related data"""
        founder = await self.db.users.find_one({"user_id": doc["founder_id"]}, {"name": 1})
        engineer = await self.db.users.find_one({"user_id": doc["engineer_id"]}, {"name": 1})
        startup = await self.db.startups.find_one({"startup_id": doc["startup_id"]}, {"name": 1})
        
        role = None
        if doc.get("role_id"):
            role = await self.db.roles.find_one({"role_id": doc["role_id"]}, {"title": 1})
        
        created_at = doc["created_at"]
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)
        
        updated_at = doc.get("updated_at")
        if updated_at and isinstance(updated_at, str):
            updated_at = datetime.fromisoformat(updated_at)
        
        # Convert messages
        messages = []
        for msg in doc.get("messages", []):
            sent_at = msg["sent_at"]
            if isinstance(sent_at, str):
                sent_at = datetime.fromisoformat(sent_at)
            messages.append(Message(
                message_id=msg["message_id"],
                sender_id=msg["sender_id"],
                sender_name=msg["sender_name"],
                content=msg["content"],
                message_type=msg.get("message_type", "text"),
                sent_at=sent_at,
                read=msg.get("read", False)
            ))
        
        return ConnectionResponse(
            connection_id=doc["connection_id"],
            founder_id=doc["founder_id"],
            engineer_id=doc["engineer_id"],
            role_id=doc.get("role_id"),
            status=doc["status"],
            messages=messages,
            created_at=created_at,
            updated_at=updated_at,
            founder_name=founder["name"] if founder else None,
            startup_name=startup["name"] if startup else None,
            engineer_name=engineer["name"] if engineer else None,
            role_title=role["title"] if role else None
        )
