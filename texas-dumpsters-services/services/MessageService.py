import config
import logging

from models import Message, Notification
from google.appengine.api import app_identity

logger = logging.getLogger()

class MessageInstance:

    @staticmethod
    def save(entity):

        if entity.parent_message_key is not None:
            parent_message = entity.parent_message_key.get()
            if parent_message is None:
                raise ValueError("Parent message does not exists")           

        if not entity.message_body:
            raise ValueError("Message body is required")

        if entity.key is None:            
            entity = Message.save(entity)
            
            notification = Notification()
            notification.populate(
                company_key=entity.company_key,
                user_key=entity.receiver_user_key,      
                notification_text=entity.message_title,
                notification_params=entity.key.urlsafe(),
                notification_status="unread",
                notification_type="Message"
            )
            Notification.save(notification)
            
        else:
            current = Message.get(entity.key.urlsafe())
            if current is not None:
                current.company_key = entity.company_key
                current.parent_message_key = entity.parent_message_key
                current.sender_user_key = entity.sender_user_key
                current.receiver_user_key = entity.receiver_user_key
                current.message_type = entity.message_type
                current.message_title = entity.message_title
                current.message_body = entity.message_body
                current.message_status = entity.message_status                
                entity = Message.save(entity)
            else:
                raise ValueError("Message does not exists")
        return entity
    
    @staticmethod
    def get(id): 
        return Message.get(id)

    @staticmethod
    def get_all(page, page_size, filters, sort):
        return Message.get_all(page, page_size, filters, sort)

    @staticmethod
    def delete(id):
        entity = Message.get(id)
        if(entity is None):
            raise ValueError("Message does not exists")
        else:
            entity.active = False
            Message.save(entity)