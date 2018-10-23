import config
import logging

from models import RoutePositionHistory

logger = logging.getLogger()

class RoutePositionHistoryInstance:

    @staticmethod
    def save(entity):
        
        if entity.key is None:            
            entity = RoutePositionHistory.save(entity)
        else:
            current = RoutePositionHistory.get(entity.key.urlsafe())
            if current is not None:
                current.route_key = entity.route_key
                current.latitude = entity.latitude
                current.longitude = entity.longitude
                entity = RoutePositionHistory.save(entity)
            else:
                raise ValueError("Route Position History does not exists")
        return entity   
            
    @staticmethod
    def get(id): 
        return RoutePositionHistory.get(id)

    @staticmethod
    def get_all(page, page_size, filters):
        return RoutePositionHistory.get_all(page, page_size, filters)