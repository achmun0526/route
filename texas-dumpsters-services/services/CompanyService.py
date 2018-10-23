import os
import base64
import config
import cloudstorage as gcs

from services import AssetInventoryService
from models import Company, AssetSize, AssetInventory
from google.appengine.api import app_identity

class CompanyInstance:
    
    @staticmethod
    def save(entity, logo_name, logo_data): 

        if logo_name:  
            if logo_name.lower().endswith(('.png')):    
                pass
            else:
                raise ValueError("The logo only supports .png extension")

        if entity.key is None:
            entity.active=True
            entity = Company.save(entity)

            '''Create Asset Inventory'''
            from models import AssetSize
            from random import randint

            for e in AssetSize:
                inventory = AssetInventory()
                inventory.populate(
                    asset_size = AssetSize(int(e)),
                    company_key = entity.key,
                    count = randint(1, 10)
                )
                AssetInventoryService.AssetInventoryInstance.save(inventory)                
            
        else:
            current = Company.get(entity.key.urlsafe())
            if current is not None:
                current.name = entity.name
                current.domain = entity.domain
                current.state = entity.state
                current.city = entity.city
                current.zipcode = entity.zipcode
                current.contact_phone = entity.contact_phone
                current.contact_email = entity.contact_email
                current.address = entity.address
                current.vendor_notes = entity.vendor_notes
                current.active = entity.active
                current.latitude = entity.latitude
                current.longitude = entity.longitude
                entity = Company.save(entity)
            else:
                raise ValueError("Company does not exists")

        if logo_name and logo_data:
            bucket_name = os.environ.get('BUCKET_NAME', app_identity.get_default_gcs_bucket_name())
            path = "/" + bucket_name + "/" + entity.key.urlsafe() + "/" + logo_name
            write_retry_params = gcs.RetryParams(backoff_factor=1.1)
            gcs_file = gcs.open(path,
                                'w',
                                content_type='image/png',
                                options={'x-goog-meta-foo':'foo',
                                        'x-goog-acl':'public-read',
                                        'x-goog-meta-bar':'bar'},
                                retry_params=write_retry_params)
            gcs_file.write(base64.b64decode(logo_data))
            gcs_file.close()
            entity.logo_url = config.GOOGLE_CLOUD_STORAGE_BASE_ADDRESS_TO_DOWNLOAD + "/" + bucket_name + "/" + entity.key.urlsafe() + "/" + logo_name
            entity = Company.save(entity)
                           
        return entity
  
    @staticmethod
    def get(id): 
        return Company.get(id)

    @staticmethod
    def get_all(page, page_size, filters):
        return Company.get_all(page, page_size, filters)
    
    @staticmethod
    def delete(id):
        entity = Company.get(id)
        if(entity is None):
            raise ValueError("Company does not exists")
        else:
            entity.active = False
            Company.save(entity)