import config

from models import Facility
from google.appengine.api import app_identity

class FacilityInstance:

    @staticmethod
    def save(entity):
        if entity.key is None:
            entity = Facility.save(entity)
        else:
            current = Facility.get(entity.key.urlsafe())
            if current is not None:
                current.facility_name = entity.facility_name
                current.facility_address = entity.facility_address
                current.facility_zipcode = entity.facility_zipcode
                current.facility_state = entity.facility_state
                current.facility_city = entity.facility_city
                current.contact_name = entity.contact_name
                current.contact_email = entity.contact_email
                current.contact_phone = entity.contact_phone
                current.hours_of_operation = entity.hours_of_operation
                current.active = entity.active
                current.latitude = entity.latitude
                current.longitude = entity.longitude                
                entity = Facility.save(entity)
            else:
                raise ValueError("Facility does not exists")
        return entity
    
    @staticmethod
    def get(id): 
        return Facility.get(id)

    @staticmethod
    def get_all(page, page_size, filters):
        return Facility.get_all(page, page_size, filters)

    @staticmethod
    def delete(id):
        entity = Facility.get(id)
        if(entity is None):
            raise ValueError("Facility does not exists")
        else:
            entity.active = False
            Facility.save(entity)