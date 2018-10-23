import config

from models import Audit
from google.appengine.api import app_identity

class AuditInstance:

    @staticmethod
    def save(entity):
        entity = Audit.save(entity)
        return entity
    
    @staticmethod
    def get(id): 
        return Audit.get(id)

    @staticmethod
    def get_all(page, page_size, filters):
        return Audit.get_all(page, page_size, filters)