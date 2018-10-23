import config

from models import Notification
from google.appengine.api import app_identity

class NotificationInstance:

    @staticmethod
    def save(entity):        
        if entity.key is None:            

            if not entity.notification_status:
                entity.notification_status = "unread"

            if not (entity.notification_status == "read" or entity.notification_status == "unread"):
                raise ValueError("notification_status can be only 'read' or 'unread'")

            entity = Notification.save(entity)
        else:
            
            if not (entity.notification_status == "read" or entity.notification_status == "unread"):
                raise ValueError("notification_status can be only 'read' or 'unread'")

            current = Notification.get(entity.key.urlsafe())
            if current is not None:
                current.company_key = entity.company_key
                current.user_key = entity.user_key
                current.notification_text = entity.notification_text
                current.notification_params = entity.notification_params
                current.notification_status = entity.notification_status
                current.notification_type = entity.notification_type
                entity = Notification.save(entity)
            else:
                raise ValueError("Notification does not exists")
        return entity
    
    @staticmethod
    def get(id): 
        return Notification.get(id)

    @staticmethod
    def get_all(page, page_size, filters, sort):
        return Notification.get_all(page, page_size, filters, sort)

    @staticmethod
    def delete(id):
        entity = Notification.get(id)
        if(entity is None):
            raise ValueError("Notification does not exists")
        else:
            entity.active = False
            Notification.save(entity)