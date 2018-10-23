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

        # obj = entity.entity_key.get()
        # entity_name = obj.__class__.__name__.lower()
        #
        # if entity.entity_type != entity_name:
        #     raise ValueError("Entity key is not of type %s... you are sending a object type: %s" % (entity.entity_type, entity_name))
        #
        # if entity.key is None:
        #     sort_index = 0
        #     last = RouteItem.get_last_by_sort_index()
        #     if last is not None:
        #         sort_index = int(last.sort_index + 1)
        #     entity.sort_index = sort_index
        #     entity = RouteItem.save(entity)
        # else:
        #     current = RouteItem.get(entity.key.urlsafe())
        #     if current is not None:
        #         current.route_key = entity.route_key
        #         current.entity_type = entity.entity_type
        #         current.entity_key = entity.entity_key
        #         current.sort_index = entity.sort_index
        #         current.active = entity.active
        #         current.latitude = entity.latitude
        #         current.longitude = entity.longitude
        #         entity = RouteItem.save(entity)
        #     else:
        #         raise ValueError("RouteItem does not exists")
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
