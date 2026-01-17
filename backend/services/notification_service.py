"""
Notification Service - Handle in-app and email notifications
"""
from typing import List, Dict, Optional
import logging
from datetime import datetime, timezone
import uuid

logger = logging.getLogger(__name__)


class NotificationService:
    """Service for managing notifications"""
    
    def __init__(self, db):
        self.db = db
    
    async def create_notification(
        self,
        user_id: str,
        notification_type: str,
        title: str,
        message: str,
        data: Optional[Dict] = None
    ) -> Dict:
        """Create a new notification"""
        notification_id = f"notif_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc)
        
        notification_doc = {
            "notification_id": notification_id,
            "user_id": user_id,
            "type": notification_type,
            "title": title,
            "message": message,
            "data": data or {},
            "read": False,
            "created_at": now.isoformat()
        }
        
        await self.db.notifications.insert_one(notification_doc)
        
        return notification_doc
    
    async def get_user_notifications(
        self,
        user_id: str,
        unread_only: bool = False,
        limit: int = 50
    ) -> List[Dict]:
        """Get notifications for a user"""
        query = {"user_id": user_id}
        if unread_only:
            query["read"] = False
        
        cursor = self.db.notifications.find(query, {"_id": 0})
        cursor = cursor.sort("created_at", -1).limit(limit)
        
        return [doc async for doc in cursor]
    
    async def mark_as_read(self, notification_id: str, user_id: str) -> bool:
        """Mark a notification as read"""
        result = await self.db.notifications.update_one(
            {"notification_id": notification_id, "user_id": user_id},
            {"$set": {"read": True}}
        )
        return result.modified_count > 0
    
    async def mark_all_as_read(self, user_id: str) -> int:
        """Mark all notifications as read for a user"""
        result = await self.db.notifications.update_many(
            {"user_id": user_id, "read": False},
            {"$set": {"read": True}}
        )
        return result.modified_count
    
    async def get_unread_count(self, user_id: str) -> int:
        """Get count of unread notifications"""
        return await self.db.notifications.count_documents({
            "user_id": user_id,
            "read": False
        })
    
    # Notification triggers
    async def notify_new_application(self, application: Dict, role: Dict, startup: Dict):
        """Notify founder of new application"""
        await self.create_notification(
            user_id=startup.get("founder_id"),
            notification_type="new_application",
            title="New Application",
            message=f"New application received for {role.get('title')}",
            data={
                "application_id": application.get("application_id"),
                "role_id": role.get("role_id")
            }
        )
    
    async def notify_application_status_update(self, application: Dict, new_status: str):
        """Notify engineer of application status update"""
        status_messages = {
            "reviewed": "Your application is being reviewed",
            "shortlisted": "Congratulations! You've been shortlisted",
            "interviewing": "You've been invited for an interview",
            "offered": "Congratulations! You have a job offer",
            "rejected": "Update on your application"
        }
        
        await self.create_notification(
            user_id=application.get("engineer_id"),
            notification_type="application_update",
            title="Application Update",
            message=status_messages.get(new_status, f"Application status: {new_status}"),
            data={
                "application_id": application.get("application_id"),
                "status": new_status
            }
        )
    
    async def notify_new_connection_request(self, connection: Dict):
        """Notify engineer of new connection request"""
        await self.create_notification(
            user_id=connection.get("engineer_id"),
            notification_type="connection_request",
            title="New Connection Request",
            message=f"A founder wants to connect with you",
            data={
                "connection_id": connection.get("connection_id")
            }
        )
    
    async def notify_connection_accepted(self, connection: Dict):
        """Notify founder that connection was accepted"""
        await self.create_notification(
            user_id=connection.get("founder_id"),
            notification_type="connection_accepted",
            title="Connection Accepted",
            message=f"Your connection request was accepted",
            data={
                "connection_id": connection.get("connection_id")
            }
        )
    
    async def notify_new_message(self, connection: Dict, sender_id: str):
        """Notify recipient of new message"""
        # Determine recipient
        if connection.get("founder_id") == sender_id:
            recipient_id = connection.get("engineer_id")
        else:
            recipient_id = connection.get("founder_id")
        
        await self.create_notification(
            user_id=recipient_id,
            notification_type="new_message",
            title="New Message",
            message="You have a new message",
            data={
                "connection_id": connection.get("connection_id")
            }
        )
