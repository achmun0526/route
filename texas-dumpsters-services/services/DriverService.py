import config
from models import Driver
# from google.appengine.api import app_identity

class DriverInstance:

    @staticmethod
    def save(entity):
        if entity.key is None:
            entity = Driver.save(entity)
        else:
            current = Driver.get(entity.key)
            if current is not None:
                # current.driver_phone = entity.driver_phone
                # current.driver_email = entity.driver_email
                # current.driver_id = entity.driver_id
                # current.driver_operational = entity.driver_operational
                # current.driver_name = entity.driver_name
                entity = Driver.save(entity)
            else:
                raise ValueError("Driver does not exists")
        return entity

    @staticmethod
    def get(id):
        return Driver.get(id)

    @staticmethod
    def get_all(page, page_size, filters):
        return Driver.get_all(page, page_size, filters)

    @staticmethod
    def delete(id):
        entity = Driver.get(id)
        if(entity is None):
            raise ValueError("Driver does not exists")
        else:
            entity.key.delete()
            # entity.active = False
            # Driver.save(entity)
