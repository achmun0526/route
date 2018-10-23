import config

from services import AssetInventoryService
from models import Yard, AssetSize, AssetInventory
from google.appengine.api import app_identity

class YardInstance:

    @staticmethod
    def save(entity):
        if entity.key is None:
            entity = Yard.save(entity)

            '''Create Asset Inventory'''
            from models import AssetSize
            from random import randint

            for e in AssetSize:
                inventory = AssetInventory()
                inventory.populate(
                    asset_size = AssetSize(int(e)),
                    company_key = entity.company_key,
                    yard_key = entity.key,
                    count = randint(1, 10)
                )
                AssetInventoryService.AssetInventoryInstance.save(inventory)

        else:
            current = Yard.get(entity.key.urlsafe())
            if current is not None:
                current.company_key = entity.company_key
                current.yard_name = entity.yard_name
                current.yard_address = entity.yard_address
                current.yard_zipcode = entity.yard_zipcode
                current.yard_state = entity.yard_state
                current.yard_city = entity.yard_city
                current.contact_name = entity.contact_name
                current.contact_email = entity.contact_email
                current.contact_phone = entity.contact_phone
                current.active = entity.active
                current.latitude = entity.latitude
                current.longitude = entity.longitude
                entity = Yard.save(entity)
            else:
                raise ValueError("Yard does not exists")
        return entity
    
    @staticmethod
    def get(id): 
        return Yard.get(id)

    @staticmethod
    def get_all(page, page_size, filters):
        return Yard.get_all(page, page_size, filters)

    @staticmethod
    def delete(id):
        entity = Yard.get(id)
        if(entity is None):
            raise ValueError("Yard does not exists")
        else:
            entity.active = False
            Yard.save(entity)