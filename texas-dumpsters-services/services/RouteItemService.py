import config
import logging

from models import RouteItem
from google.appengine.api import app_identity

logger = logging.getLogger()

class RouteItemInstance:

    @staticmethod
    def save(entity):

        if entity.key is None:
            entity = RouteItem.save(entity)
        else:
            current = RouteItem.get(entity.key.urlsafe())
            if current is not None:
                # current.route_key = entity.route_key
                # current.driver_key = entity.driver_key
                # current.incident_type = entity.incident_type
                # current.status = entity.status
                # current.incident_notes = entity.incident_notes
                entity = RouteItem.save(entity)
            else:
                raise ValueError("Route Item does not exists")

        return entity

    @staticmethod
    def delete(id):
        entity = RouteItem.get(id)
        if(entity is None):
            raise ValueError("RouteItem does not exists")
        else:
            entity.delete()

    @staticmethod
    def get(id):
        return RouteItem.get(id)

    @staticmethod
    def get_all(page, page_size, filters):
        return RouteItem.get_all(page, page_size, filters)
