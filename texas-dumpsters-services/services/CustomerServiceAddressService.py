import os
import base64
import config

from models import CustomerServiceAddress, Customer
from google.appengine.api import app_identity

class CustomerServiceAddressInstance:

    @staticmethod
    def save(entity):

        customer = Customer.get(entity.customer_key.urlsafe())

        if customer is None:
            raise ValueError("Customer with id %s does not exists" % entity.customer_key)

        if entity.key is None:
            entity = CustomerServiceAddress.save(entity)            
        else:
            current = CustomerServiceAddress.get(entity.key.urlsafe())
            if current is not None:                
                current.address = entity.address
                current.zipcode = entity.zipcode
                current.state = entity.state
                current.city = entity.city
                current.notes = entity.notes
                entity = CustomerServiceAddress.save(entity)                
            else:
                raise ValueError("CustomerServiceAddress does not exists")
        return entity
    
    @staticmethod
    def get(id): 
        return CustomerServiceAddress.get(id)

    @staticmethod
    def get_all(page, page_size, filters):
        return CustomerServiceAddress.get_all(page, page_size, filters)