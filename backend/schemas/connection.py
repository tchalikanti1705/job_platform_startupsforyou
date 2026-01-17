"""
Connection Schemas - Request/Response models for founder-engineer connections
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid


def generate_connection_id():
    return f"conn_{uuid.uuid4().hex[:12]}"


class ConnectionStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"


class MessageType(str, Enum):
    TEXT = "text"
    SYSTEM = "system"


# ============ Request Schemas ============

class ConnectionRequest(BaseModel):
    """Schema for sending a connection request (founder to engineer)"""
    engineer_id: str
    role_id: Optional[str] = None  # Optional: specific role being discussed
    message: str = Field(..., min_length=10, max_length=1000)


class ConnectionReply(BaseModel):
    """Schema for replying to a connection"""
    accept: bool
    message: Optional[str] = Field(None, max_length=1000)


class SendMessage(BaseModel):
    """Schema for sending a message in a connection"""
    content: str = Field(..., min_length=1, max_length=2000)


# ============ Response Schemas ============

class Message(BaseModel):
    """Message model within a connection"""
    message_id: str
    sender_id: str
    sender_name: str
    content: str
    message_type: MessageType = MessageType.TEXT
    sent_at: datetime
    read: bool = False


class ConnectionResponse(BaseModel):
    """Schema for connection response"""
    connection_id: str
    founder_id: str
    engineer_id: str
    role_id: Optional[str] = None
    status: ConnectionStatus
    messages: List[Message] = Field(default_factory=list)
    created_at: datetime
    updated_at: Optional[datetime] = None
    # Populated fields
    founder_name: Optional[str] = None
    startup_name: Optional[str] = None
    engineer_name: Optional[str] = None
    role_title: Optional[str] = None


class ConnectionListResponse(BaseModel):
    """Schema for paginated connection list"""
    connections: List[ConnectionResponse]
    total: int
    page: int
    page_size: int
    has_more: bool
