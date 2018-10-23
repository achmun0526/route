import config

from models import ServicePricing
from google.appengine.api import app_identity

class ServicePricingInstance:

    @staticmethod
    def save(entity):
        if entity.key is None:
            entity = ServicePricing.save(entity)
        else:
            current = ServicePricing.get(entity.key.urlsafe())
            if current is not None:
                current.dumpser_size = entity.dumpser_size
                current.price = entity.price
                current.active = entity.active
                entity = ServicePricing.save(entity)                
            else:
                raise ValueError("Service Pricing does not exists")
        return entity
    
    @staticmethod
    def get(id): 
        return ServicePricing.get(id)

    @staticmethod
    def get_all(page, page_size, filters):
        return ServicePricing.get_all(page, page_size, filters)

    @staticmethod
    def delete(id):
        entity = ServicePricing.get(id)
        if(entity is None):
            raise ValueError("ServicePricing does not exists")
        else:
            entity.active = False
            ServicePricing.save(entity)