import config

from models import Vehicle
from google.appengine.api import app_identity

class VehicleInstance:

    @staticmethod
    def save(entity):
        if entity.key is None:
            entity = Vehicle.save(entity)
        else:
            current = Vehicle.get(entity.key.urlsafe())
            if current is not None:
                current.vehicle_name = entity.vehicle_name
                current.company_key = entity.company_key
                current.driver_key = entity.driver_key
                current.model = entity.model
                current.size = entity.size
                current.tag_number = entity.tag_number
                current.active = entity.active
                entity = Vehicle.save(entity)
            else:
                raise ValueError("Vehicle does not exists")
        return entity
    
    @staticmethod
    def get(id): 
        return Vehicle.get(id)

    @staticmethod
    def get_all(page, page_size, filters):
        return Vehicle.get_all(page, page_size, filters)

    @staticmethod
    def delete(id):
        entity = Vehicle.get(id)
        if(entity is None):
            raise ValueError("Vehicle does not exists")
        else:
            entity.active = False
            Vehicle.save(entity)