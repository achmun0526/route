import config

from models import Site
from google.appengine.api import app_identity

class SiteInstance:

    @staticmethod
    def save(entity):
        if entity.key is None:
            entity = Site.save(entity)
        else:
            current = Site.get(entity.key.urlsafe())
            if current is not None:
                current.source_system_id = entity.source_system_id
                current.source_system = entity.source_system
                current.customer_account_id = entity.customer_account_id
                current.site_account_id=entity.site_account_id
                current.site_name = entity.site_name
                current.site_address = entity.site_address
                current.site_zipcode = entity.site_zipcode
                current.site_state = entity.site_state
                current.site_city = entity.site_city
                current.contact_name = entity.contact_name
                current.contact_email = entity.contact_email
                current.contact_phone = entity.contact_phone
                current.active = entity.active
                current.latitude = entity.latitude
                current.longitude = entity.longitude
                entity = Site.save(entity)
            else:
                raise ValueError("Site does not exists")
        return entity

    @staticmethod
    def get(id):
        return Site.get(id)

    @staticmethod
    def get_all(page, page_size, filters):
        return Site.get_all(page, page_size, filters)

    @staticmethod
    def delete(id):
        entity = Site.get(id)
        if(entity is None):
            raise ValueError("Site does not exists")
        else:
            entity.active = False
            Site.save(entity)

    @staticmethod
    def get_by_name(name):
        return Site.get_by_name(name)

    @staticmethod
    def get_by_account_id(site_account_id):
        return Site.get_by_account_id(site_account_id)

    @staticmethod
    def get_by_account_id_and_company_key(site_account_id, company_key):
        return Site.get_by_account_id_and_company_key(site_account_id, company_key)
