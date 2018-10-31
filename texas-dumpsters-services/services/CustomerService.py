import os
import base64
import config
import logging

from models import Customer
from google.appengine.api import app_identity

logger = logging.getLogger()

class CustomerInstance:

    @staticmethod
    def save(entity, create_service_address=False):

        if entity.key is None:
            entity = Customer.save(entity)

            if create_service_address == True:

                from services import CustomerServiceAddressService
                from models import CustomerServiceAddress

                customerServiceAddress = CustomerServiceAddress()

                customerServiceAddress.populate(
                    customer_key=entity.key,
                    address = entity.billing_address,
                    zipcode = entity.billing_zipcode,
                    state = entity.billing_state,
                    city = entity.billing_city,
                    notes = entity.notes
                )

                CustomerServiceAddressService.CustomerServiceAddressInstance.save(customerServiceAddress)

        else:
            current = Customer.get(entity.key.urlsafe())
            if current is not None:
                current.source_system_id = entity.source_system_id
                current.source_system = entity.source_system
                current.customer_name = entity.customer_name
                current.customer_account_id = entity.customer_account_id
                current.contact_name = entity.contact_name
                current.contact_email = entity.contact_email
                current.contact_phone = entity.contact_phone
                current.billing_address = entity.billing_address
                current.billing_zipcode = entity.billing_zipcode
                current.billing_state = entity.billing_state
                current.billing_city = entity.billing_city
                current.notes = entity.notes
                current.active = entity.active
                entity = Customer.save(entity)
            else:
                raise ValueError("Customer does not exists")
        return entity

    @staticmethod
    def get(id):
        return Customer.get(id)

    @staticmethod
    def get_all(page, page_size, filters):
        return Customer.get_all(page, page_size, filters)

    @staticmethod
    def delete(id):
        entity = Customer.get(id)
        if(entity is None):
            raise ValueError("Customer does not exists")
        else:
            #Code for deleting entity from website, not datastore
            #entity.active = False
            #Customer.save(entity)
            entity.key.delete()

    @staticmethod
    def get_by_name(name):
        return Customer.get_by_name(name)

    @staticmethod
    def get_by_account_id(customer_account_id):
        return Customer.get_by_account_id(customer_account_id)

    @staticmethod
    def get_by_company_and_account_id(company_key, customer_account_id):
        return Customer.get_by_company_and_account_id(company_key, customer_account_id)
    
