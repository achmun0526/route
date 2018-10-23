import config
import logging

from models import AssetInventory

logger = logging.getLogger()

class AssetInventoryInstance:

    @staticmethod
    def save(entity):
        
        if entity.key is None:            
            entity = AssetInventory.save(entity)
        else:
            current = AssetInventory.get(entity.key.urlsafe())
            if current is not None:
                current.asset_size = entity.asset_size
                current.company_key = entity.company_key
                current.yard_key = entity.yard_key
                current.count = entity.count
            else:
                raise ValueError("Asset Inventory does not exists")
        return entity
    
    @staticmethod
    def delete(id):
        pass
            
    @staticmethod
    def get(id): 
        return AssetInventory.get(id)

    @staticmethod
    def get_all(page, page_size, filters):
        return AssetInventory.get_all(page, page_size, filters)