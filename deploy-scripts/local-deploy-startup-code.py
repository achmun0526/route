"""This module contanis all models used in the project."""


import inspect
import json
import logging
import time
import webapp2_extras.appengine.auth.models

from datetime import datetime, timedelta
from google.appengine.api import users
from google.appengine.ext import ndb
from google.appengine.ext.blobstore.blobstore import BlobInfo
from google.appengine.ext.ndb import msgprop
from protorpc import messages
from webapp2_extras import security

logger = logging.getLogger()

class BaseModel(ndb.Model):
    """This class is the base for the others classes."""

    created_at = ndb.DateTimeProperty(auto_now_add=True)
    modified_at = ndb.DateTimeProperty(auto_now=True)

class User(webapp2_extras.appengine.auth.models.User):

    created_at = ndb.DateTimeProperty(auto_now_add=True)
    modified_at = ndb.DateTimeProperty(auto_now=True)

    authentication_failure_at = ndb.DateTimeProperty()
    authentication_failure_count = ndb.IntegerProperty()

    email = ndb.StringProperty(required=True)
    first_name = ndb.StringProperty()
    last_name = ndb.StringProperty()
    contact_phone_desk = ndb.StringProperty()
    contact_phone_mobile = ndb.StringProperty()
    device_id = ndb.StringProperty()
    country = ndb.StringProperty()

    activated = ndb.BooleanProperty(required=True,
        default=True)  # I don't recall how or if this attribute is being used

    def save(self):
        action_type = AuditActionType.Created
        if self.key is not None:
            action_type = AuditActionType.Updated
        key = self.put()

        if key is not None:
            audit = Audit()
            audit.populate(
                entity_name=self.__class__.__name__,
                entity_key=key,
                action=action_type,
                user_email=users.get_current_user().email() if users.get_current_user() is not None else ''
            )
            audit.save()

        return self.get(key)

    @classmethod
    def create_signup_token(cls, *args, **kwargs):
        if len(args) == 1:
            user_id = args[0]
            try:
                int(user_id)
            except Exception:
                raise ValueError("The provided ID value must be an Integer")
        return super(cls, User).create_signup_token(*args, **kwargs)

    def register_authentication_failure(self, auto_save=True):
        now = datetime.now()
        ten_minutes = timedelta(minutes=10)
        five_minutes = timedelta(minutes=5)
        if not self.authentication_failure_at:
            self.authentication_failure_at = now
            self.authentication_failure_count = 1
        else:
            duration_since_last_failure = now - self.authentication_failure_at
            if duration_since_last_failure >= five_minutes:  # reset to now
                self.authentication_failure_at = now
                self.authentication_failure_count = 1
            else:  # increment the count
                self.authentication_failure_count += 1
        if auto_save:
            self.put()

    def register_authentication_success(self, auto_save=True):
        if self.authentication_failure_at:
            self.authentication_failure_at = None
            self.authentication_failure_count = 0
            if auto_save:
                self.put()

    def is_authentication_locked(self):
        now = datetime.now()
        if not self.authentication_failure_at:
            return False
        duration_since_last_failure = now - self.authentication_failure_at
        ten_minutes =timedelta(minutes=10)
        if duration_since_last_failure >= ten_minutes:
            return False
        if self.authentication_failure_count >= 3:
            return True
        return False

    def set_password(self, raw_password):
        """Sets the password for the current user

        :param raw_password:
            The raw password which will be hashed and stored
        """
        self.password = security.generate_password_hash(
            raw_password, length=12)

    def get_roles(self):
        roles = Role.query(ancestor=self.key).order(Role.name).fetch()
        self._roles = roles
        return roles

    def has_any_role(self, *roles):
        role_keys = [
            ndb.Key('Role', role_id, parent=self.key) for role_id in roles
        ]
        if any(ndb.get_multi(role_keys)):
            return True
        return False

    def has_roles(self, *roles):
        role_keys = [
            ndb.Key('Role', role_id, parent=self.key) for role_id in roles
        ]
        if all(ndb.get_multi(role_keys)):
            return True
        return False

    def has_role(self, role):

        roles = self.get_roles()

        is_in_role = False

        for role in roles:
            if role.name.lower() == role.name.lower():
                is_in_role = True
                break

        return is_in_role

    @classmethod
    def get_by_roles(cls,roles_joined):
        role_names = roles_joined.split(',')
        roles = Role.query(Role.name.IN(role_names))
        user_keys = set([role.user for role in roles])
        all_users = ndb.get_multi(user_keys)
        role_reg = {}
        for role in roles:
            role_reg.setdefault(role.user.urlsafe(), []).append(role)
        for user in all_users:
            user._roles = role_reg[user.key.urlsafe()]
        return all_users

    @classmethod
    def get_by_roles_and_company(cls,roles_joined,company_key):
        role_names = roles_joined.split(',')
        roles = Role.query(Role.name.IN(role_names))
        user_keys = set([role.user for role in roles])

        if len(user_keys) == 0:
            return []

        users_by_company = UserXCompany.query().filter(ndb.AND(UserXCompany.user.IN(user_keys), ndb.AND(UserXCompany.company == company_key))).fetch()
        keys = []
        for uc in users_by_company:
            keys.append(uc.user)

        if len(keys) == 0:
            return []

        all_users = ndb.get_multi(keys)

        return all_users

    @classmethod
    def get_by_current_google_user(cls):
        from google.appengine.api import users
        google_user = users.get_current_user()
        if not google_user:
            return None
        user = User.query(User.email == google_user.email()).get()
        if not user:
            return None
        return user

    @classmethod
    def get_by_email(cls, email):
        user = cls.query(cls.email == email).get()
        return user

    @classmethod
    def get_by_key(cls, key):
        user = key.get()
        return user

    @classmethod
    def get_by_urlsafe(cls, url_string):
        key = ndb.Key(urlsafe=url_string)
        user = key.get()
        return user

    @classmethod
    def get(cls, key):
        user = key.get()
        return user

    @classmethod
    def get_by_auth_token(cls, user_id, token, subject='auth'):
        """Returns a user object based on a user ID and token.

        :param user_id:
            The user_id of the requesting user.
        :param token:
            The token string to be verified.
        :returns:
            A tuple ``(User, timestamp)``, with a user object and
            the token timestamp, or ``(None, None)`` if both were not found.
        """
        token_key = cls.token_model.get_key(user_id, subject, token)
        user_key = ndb.Key(cls, user_id)
        # Use get_multi() to save a RPC call.
        valid_token, user = ndb.get_multi([token_key, user_key])
        if valid_token and user:
            timestamp = int(time.mktime(valid_token.created.timetuple()))
            return user, timestamp

        return None, None

    def to_dict(self):

        profile = dict(
            created_at=self.created_at.isoformat(),
            modified_at=self.modified_at.isoformat(),
            email=self.email,
            first_name=self.first_name,
            last_name=self.last_name,
            contact_phone_desk=self.contact_phone_desk,
            contact_phone_mobile=self.contact_phone_mobile,
            device_id=self.device_id,
            activated = self.activated
            )

        try:
            profile['user_key'] = self.key.urlsafe()
            profile['user_id'] = self.key.id()
        except:
            pass

        if hasattr(self, '_roles'):
            profile['roles'] = [r.name for r in self._roles]
        else:
            self._roles = self.get_roles()
            profile['roles'] = [r.name for r in self._roles]

        userXCompany = UserXCompany.query(UserXCompany.user == self.key).get()

        if userXCompany is not None:

            profile["company_key"] = userXCompany.company.urlsafe()
            company = userXCompany.company.get()

            if company is not None:
                profile["company"] = company.to_dict()

        return profile

    def to_dict_optimized(self):
        profile = dict(
            created_at=self.created_at.isoformat(),
            modified_at=self.modified_at.isoformat(),
            email=self.email,
            first_name=self.first_name,
            last_name=self.last_name,
            contact_phone_desk=self.contact_phone_desk,
            contact_phone_mobile=self.contact_phone_mobile,
            device_id=self.device_id,
            activated = self.activated
            )

        try:
            profile['user_key'] = self.key.urlsafe()
            profile['user_id'] = self.key.id()
        except:
            pass

        return profile


    def consume(self, value_reg, defer=False):
        keys = "email first_name last_name contact_phone_desk contact_phone_mobile device_id".split(
        )
        for key in keys:
            if key not in value_reg:
                continue
            val = value_reg[key]
            if key == 'email':
                continue
            if key == 'user_name':
                continue
            setattr(self, key, val)
        if not defer:
            self.put()

    @classmethod
    def get_by_email(cls, email):
        """Returns a user object based on an email.

        :param email:
            String representing the user email. Examples:

        :returns:
            A user object.
        """
        return cls.query(cls.email == email).get()

    @classmethod
    def create_resend_token(cls, user_id):
        entity = cls.token_model.create(user_id, 'resend-activation-mail')
        return entity.token

    @classmethod
    def validate_resend_token(cls, user_id, token):
        return cls.validate_token(user_id, 'resend-activation-mail', token)

    @classmethod
    def delete_resend_token(cls, user_id, token):
        cls.token_model.get_key(user_id, 'resend-activation-mail',
                                token).delete()


class UserName(BaseModel):
    name = ndb.StringProperty(required=True)
    user = ndb.KeyProperty(User, required=True)
    deleted_at = ndb.DateTimeProperty(
    )  # make it possible to change user names, but with path of recovery.

    class UserNameTaken(ValueError):
        pass

    class UserNameVulgar(ValueError):
        pass

    class UserNameImproperFormat(ValueError):
        pass

    @classmethod
    def new_user_name(cls, user_key, name):
        if not cls.is_available(name):
            raise ValueError("That User Name is not available")
        user_name = cls(id=name.lower(), user=user_key, name=name).put()
        return user_name

    @classmethod
    def is_available(cls, name):

        user_name = ndb.Key('UserName', name.lower()).get()
        if (user_name):
            raise cls.UserNameTaken('"%s" is already in use' % name)
        # There is NOT an existing record for given name,
        # but if it contains offensive words it is not available
        if (cls.is_offensive(name)):
            raise cls.UserNameVulgar('"%s" appears to be inappropriate' % name)
        if (not cls.is_proper_format(name)):
            raise cls.UserNameImproperFormat(
                '"%s" does not conform to specified format' % name)
        return True

    @classmethod
    def is_offensive(cls, name):

        if 'badword' in name:
            return True
        return False
        #raise NotImplementedError('Need to define is_offensive()')

    @classmethod
    def is_proper_format(cls, name):
        if name.lower() in ['badformat']:
            return False
        return True
        #raise NotImplementedError('Need to define proper username format rules')




class Role(ndb.Model):
    created_at = ndb.DateTimeProperty(auto_now_add=True)
    name = ndb.StringProperty(required=True)
    user = ndb.KeyProperty(User, required=True)

    ADMIN = 'ADMIN'
    COMPANY_ADMIN = 'COMPANY ADMINISTRATOR'
    DRIVER = 'DRIVER'
    MANAGER ='MANAGER'
    DISPATCHER ='DISPATCHER'
    OFFICE_ADMIN_CSR ='OFFICE ADMIN-CSR'

    @classmethod
    def user_assignable_roles(cls):
        return []

    @classmethod
    def admin_assignable_roles(cls):
        return [cls.ADMIN, cls.COMPANY_ADMIN, cls.DRIVER]


class Company(BaseModel):

    name = ndb.StringProperty(required=True)
    domain = ndb.StringProperty()
    contact_phone = ndb.StringProperty()
    contact_email = ndb.StringProperty()
    address = ndb.StringProperty()
    vendor_notes = ndb.StringProperty()
    service_pricing = ndb.FloatProperty()
    logo_url = ndb.StringProperty()
    active = ndb.BooleanProperty(required=True, default=True)
    zipcode = ndb.StringProperty()
    state = ndb.StringProperty()
    city = ndb.StringProperty()
    latitude = ndb.StringProperty()
    longitude = ndb.StringProperty()

    def save(self):

        action_type = AuditActionType.Created
        if self.key is not None:
            action_type = AuditActionType.Updated
        key = self.put()

        if key is not None:
            audit = Audit()
            audit.populate(
                entity_name=self.__class__.__name__,
                entity_key=key,
                action=action_type,
                user_email=users.get_current_user().email() if users.get_current_user() is not None else ''
            )
            audit.save()

        return self.get(key.urlsafe())

    @classmethod
    def get(cls, id):
        key = ndb.Key(urlsafe = id)
        if(key is not None):
            return key.get()
        return None

    @classmethod
    def get_all(cls, page, page_size, filters):

        total = 0
        query = cls.query()
        entities = None

        if str(filters["user"]):
            user = User.get_by_urlsafe(filters["user"])
            if user is not None:
                #If user sent is not admin we filter companies by user, if user is admin we send all companies
                is_admin = user.has_roles(Role.ADMIN)
                if is_admin == False:
                    companies_by_user = UserXCompany.get_all_by_user(filters["user"])
                    companies_ids = []
                    for x in companies_by_user:
                        companies_ids.append(x.company)
                    if len(companies_ids) > 0:
                        query = query.filter(cls.key.IN(companies_ids))
                    else:
                        query = query.filter(cls.name == None)

        if str(filters["company"]):
            query = query.filter(cls.key == ndb.Key(urlsafe = filters["company"]))

        '''Active'''
        if (filters["active"] and str(filters["active"]) == "all"):
            pass
        elif filters["active"] and (json.loads(filters["active"]) == True or json.loads(filters["active"]) == False):
            query = query.filter(cls.active == json.loads(filters["active"]))
        else:
            query = query.filter(cls.active == True)

        '''Pagination'''
        if (not page or not page_size):
            entities = query.order(-cls.created_at).fetch()
            total = len(entities)
        else:
            offset = int(page_size) * (int(page) - 1)
            limit = int(page_size)
            entities = query.order(-cls.created_at).fetch(offset=offset, limit=limit)
            total = query.count()

        return entities, total

    def to_dict(self):

        service_pricing = ServicePricing.query(ServicePricing.active == True).filter(ServicePricing.company_key == self.key).fetch()

        return dict(
            id = self.key.urlsafe(),
            name = self.name,
            domain = self.domain,
            contact_phone = self.contact_phone,
            contact_email = self.contact_email,
            address = self.address,
            vendor_notes = self.vendor_notes,
            service_pricing = json.loads(json.dumps([entity.to_dict() for entity in service_pricing])),
            logo_url = self.logo_url,
            active = self.active,
            zipcode = self.zipcode,
            state = self.state,
            city = self.city,
            latitude = self.latitude,
            longitude = self.longitude
        )

class Driver(BaseModel):

    created_at = ndb.DateTimeProperty(auto_now_add=True)
    modified_at = ndb.DateTimeProperty(auto_now=True)

    authentication_failure_at = ndb.DateTimeProperty()
    authentication_failure_count = ndb.IntegerProperty()


    company_key = ndb.KeyProperty(kind=Company, required=True)
    driver_email = ndb.StringProperty(required=True)
    driver_name = ndb.StringProperty()
    driver_phone= ndb.StringProperty()
    driver_operational = ndb.StringProperty()
    driver_id = ndb.StringProperty()

    active = ndb.BooleanProperty(default=True)

    activated = ndb.BooleanProperty(required=True,
        default=True)  # I don't recall how or if this attribute is being used

    def save(self):
        action_type = AuditActionType.Created
        if self.key is not None:
            action_type = AuditActionType.Updated
        key = self.put()

        if key is not None:
            audit = Audit()
            audit.populate(
                entity_name=self.__class__.__name__,
                entity_key=key,
                action=action_type,
                user_email=users.get_current_user().email() if users.get_current_user() is not None else ''
            )
            audit.save()
            # May need to change this to just self.get(key)
        return self.get(key.urlsafe())

    @classmethod
    def get_all(cls, page, page_size, filters):

        total = 0
        query = cls.query()
        entities = None

        if str(filters["driver_key"]):
            query = query.filter(cls.key == ndb.Key(urlsafe = filters["driver_key"]))
        if str(filters["company_key"]):
            query = query.filter(cls.company_key == ndb.Key(urlsafe = filters["company_key"]))

        '''Active'''
        if (filters["active"] and str(filters["active"]) == "all"):
            pass
        elif filters["active"] and (json.loads(filters["active"]) == True or json.loads(filters["active"]) == False):
            query = query.filter(cls.active == json.loads(filters["active"]))
        else:
            query = query.filter(cls.active == True)



        '''Pagination'''
        if (not page or not page_size):
            entities = query.order(-cls.created_at).fetch()
            total = len(entities)
        else:
            offset = int(page_size) * (int(page) - 1)
            limit = int(page_size)
            entities = query.order(-cls.created_at).fetch(offset=offset, limit=limit)
            total = query.count()

        return entities, total

    @classmethod
    def get(cls, id):
        key = ndb.Key(urlsafe = id)
        if(key is not None):
            return key.get()
        return None

    def to_dict(self):
        return dict(
            id = self.key.urlsafe(),
            company_key = self.company_key.urlsafe(),
            driver_name = self.driver_name,
            driver_email = self.driver_email,
            driver_operational = self.driver_operational,
            driver_phone = self.driver_phone,
            driver_id = self.driver_id,
            active = self.active,
        )

class UserXCompany(BaseModel):

    user = ndb.KeyProperty(kind=User, required=True)
    company = ndb.KeyProperty(kind=Company, required=True)

    def save(self):
        action_type = AuditActionType.Created
        if self.key is not None:
            action_type = AuditActionType.Updated
        key = self.put()

        if key is not None:
            audit = Audit()
            audit.populate(
                entity_name=self.__class__.__name__,
                entity_key=key,
                action=action_type,
                user_email=users.get_current_user().email() if users.get_current_user() is not None else ''
            )
            audit.save()

        return self.get(key.urlsafe())

    def delete(cls):

        temp_key = cls.key

        cls.key.delete()

        action_type = AuditActionType.Deleted
        if temp_key is not None:
            audit = Audit()
            audit.populate(
                entity_name=cls.__class__.__name__,
                entity_key=temp_key,
                action=action_type,
                user_email=users.get_current_user().email() if users.get_current_user() is not None else ''
            )
            audit.save()

    @classmethod
    def get(cls, id):
        key = ndb.Key(urlsafe = id)
        if(key is not None):
            return key.get()
        return None

    @classmethod
    def get_by_company_and_user(cls, company, user):
        entity = cls.query(ndb.AND(cls.company == company, ndb.AND(cls.user == user))).get()
        return entity

    @classmethod
    def get_all_by_user(cls, user):
        entities = cls.query(cls.user == ndb.Key(urlsafe = user)).fetch()
        return entities

    @classmethod
    def get_all_by_company(cls, company):
        entities = cls.query(cls.company == ndb.Key(urlsafe = company)).fetch()
        return entities

    @classmethod
    def get_all(cls, page, page_size):

        total = 0
        query = cls.query()
        entities = None

        if (not page or not page_size):
            entities = query.order(-cls.created_at).fetch()
            total = len(entities)
        else:
            offset = int(page_size) * (int(page) - 1)
            limit = int(page_size)
            entities = query.order(-cls.created_at).fetch(offset=offset, limit=limit)
            total = query.count()

        return entities, total

    @classmethod
    def remove_all_companies_from_user(cls, user):
        ndb.delete_multi(
            cls.query(cls.user == ndb.Key(urlsafe = user)).fetch(keys_only=True)
        )

    def to_dict(self):

        user = User.get_by_urlsafe(self.user.urlsafe())
        company = Company.get(self.company.urlsafe())

        return dict(
            id = self.key.urlsafe(),
            user = user.to_dict(),
            company = company.to_dict()
        )

class Customer(BaseModel):

    company_key = ndb.KeyProperty(kind=Company, required=True)
    source_system_id = ndb.StringProperty()
    customer_account_id = ndb.StringProperty()
    source_system = ndb.StringProperty()
    customer_name = ndb.StringProperty()
    contact_name = ndb.StringProperty()
    contact_email = ndb.StringProperty()
    contact_phone = ndb.StringProperty()
    billing_address = ndb.StringProperty()
    billing_zipcode = ndb.StringProperty()
    billing_state = ndb.StringProperty()
    billing_city = ndb.StringProperty()
    notes = ndb.StringProperty()
    active = ndb.BooleanProperty(required=True, default=True)

    def save(self):
        action_type = AuditActionType.Created
        if self.key is not None:
            action_type = AuditActionType.Updated
        key = self.put()

        if key is not None:
            audit = Audit()
            audit.populate(
                entity_name=self.__class__.__name__,
                entity_key=key,
                action=action_type,
                user_email=users.get_current_user().email() if users.get_current_user() is not None else ''
            )
            audit.save()

        return self.get(key.urlsafe())

    @classmethod
    def get_all(cls, page, page_size, filters):

        total = 0
        query = cls.query()
        entities = None

        if str(filters["company_key"]):
            query = query.filter(cls.company_key == ndb.Key(urlsafe = filters["company_key"]))

        if str(filters["customer_key"]):
            query = query.filter(cls.key == ndb.Key(urlsafe = filters["customer_key"]))

        '''Active'''
        if (filters["active"] and str(filters["active"]) == "all"):
            pass
        elif filters["active"] and (json.loads(filters["active"]) == True or json.loads(filters["active"]) == False):
            query = query.filter(cls.active == json.loads(filters["active"]))
        else:
            query = query.filter(cls.active == True)

        '''Pagination'''
        if (not page or not page_size):
            entities = query.order(-cls.created_at).fetch()
            total = len(entities)
        else:
            offset = int(page_size) * (int(page) - 1)
            limit = int(page_size)
            entities = query.order(-cls.created_at).fetch(offset=offset, limit=limit)
            total = query.count()

        return entities, total

    @classmethod
    def get_by_name(cls, name):
        return cls.query().filter(cls.customer_name == name).order(-cls.created_at).get()

    @classmethod
    def get_by_account_id(cls, customer_account_id):
        return cls.query().filter(cls.customer_account_id == customer_account_id).order(-cls.created_at).get()

    @classmethod
    def get_by_company_and_account_id(cls, company_key, customer_account_id):
        entity = cls.query(ndb.AND(cls.company_key == company_key, ndb.AND(cls.customer_account_id == customer_account_id))).get()
        return entity

    @classmethod
    def get(cls, id):
        key = ndb.Key(urlsafe = id)
        if(key is not None):
            return key.get()
        return None

    def to_dict(self):
        return dict(
            id = self.key.urlsafe(),
            company_key = self.company_key.urlsafe(),
            company = self.company_key.get().to_dict(),
            source_system_id = self.source_system_id,
            source_system = self.source_system,
            customer_account_id=self.customer_account_id,
            customer_name = self.customer_name,
            contact_name = self.contact_name,
            contact_email = self.contact_email,
            contact_phone = self.contact_phone,
            billing_address = self.billing_address,
            billing_zipcode = self.billing_zipcode,
            billing_state = self.billing_state,
            billing_city = self.billing_city,
            active = self.active,
            notes = self.notes
        )

class CustomerServiceAddress(BaseModel):

    customer_key = ndb.KeyProperty(kind=Customer, required=True)
    address = ndb.StringProperty()
    zipcode = ndb.StringProperty()
    state = ndb.StringProperty()
    city = ndb.StringProperty()
    notes = ndb.StringProperty()

    def save(self):
        action_type = AuditActionType.Created
        if self.key is not None:
            action_type = AuditActionType.Updated
        key = self.put()

        if key is not None:
            audit = Audit()
            audit.populate(
                entity_name=self.__class__.__name__,
                entity_key=key,
                action=action_type,
                user_email=users.get_current_user().email() if users.get_current_user() is not None else ''
            )
            audit.save()

        return self.get(key.urlsafe())

    @classmethod
    def get_all(cls, page, page_size, filters):

        total = 0
        query = cls.query()
        entities = None

        if str(filters["customer"]):
            query = query.filter(cls.customer_key == ndb.Key(urlsafe = filters["customer"]))

        '''Pagination'''
        if (not page or not page_size):
            entities = query.order(-cls.created_at).fetch()
            total = len(entities)
        else:
            offset = int(page_size) * (int(page) - 1)
            limit = int(page_size)
            entities = query.order(-cls.created_at).fetch(offset=offset, limit=limit)
            total = query.count()

        return entities, total

    @classmethod
    def get(cls, id):
        key = ndb.Key(urlsafe = id)
        if(key is not None):
            return key.get()
        return None

    def to_dict(self):
        return dict(
            id = self.key.urlsafe(),
            customer_key = self.customer_key.urlsafe(),
            address = self.address,
            zipcode = self.zipcode,
            state = self.state,
            city = self.city,
            notes = self.notes
        )

class Site(BaseModel):

    source_system_id = ndb.StringProperty()
    source_system = ndb.StringProperty()
    customer_key = ndb.KeyProperty(kind=Customer, required=True)
    company_key = ndb.KeyProperty(kind=Company, required=True)
    customer_account_id=ndb.StringProperty()
    site_account_id=ndb.StringProperty()
    site_name = ndb.StringProperty()
    site_address = ndb.StringProperty()
    site_zipcode = ndb.StringProperty()
    site_state = ndb.StringProperty()
    site_city = ndb.StringProperty()
    contact_name = ndb.StringProperty()
    contact_email = ndb.StringProperty()
    contact_phone = ndb.StringProperty()
    latitude = ndb.StringProperty()
    longitude = ndb.StringProperty()
    active = ndb.BooleanProperty(required=True, default=True)

    def save(self):
        action_type = AuditActionType.Created
        if self.key is not None:
            action_type = AuditActionType.Updated
        key = self.get(self.key)

        return "past put - :)"
        #if key is not None:
        #    audit = Audit()
        #    audit.populate(
        #        entity_name=self.__class__.__name__,
        #        entity_key=key,
        #        action=action_type,
        #        user_email=users.get_current_user().email() if users.get_current_user() is not None else ''
        #    )
        #    audit.save()

        #return self.get(key.urlsafe())

    @classmethod
    def get_all(cls, page, page_size, filters):

        total = 0
        query = cls.query()
        entities = None

        if str(filters["site_key"]):
            query = query.filter(cls.key == ndb.Key(urlsafe = filters["site_key"]))

        if str(filters["customer_key"]):
            query = query.filter(cls.customer_key == ndb.Key(urlsafe = filters["customer_key"]))

        if str(filters["company_key"]):
            keys = str(filters["company_key"]).split(',')
            companies_keys = []
            for key in keys:
                companies_keys.append(ndb.Key(urlsafe=key))
            customers = Customer.query().filter(Customer.company_key.IN(companies_keys)).fetch(keys_only=True)
            if (customers is not None and len(customers) > 0):
                query = query.filter(cls.customer_key.IN(customers))
            else:
                query = query.filter(cls.customer_key == None)

        '''Active'''
        if (filters["active"] and str(filters["active"]) == "all"):
            pass
        elif filters["active"] and (json.loads(filters["active"]) == True or json.loads(filters["active"]) == False):
            query = query.filter(cls.active == json.loads(filters["active"]))
        else:
            query = query.filter(cls.active == True)

        '''Pagination'''
        if (not page or not page_size):
            entities = query.order(-cls.created_at).fetch()
            total = len(entities)
        else:
            offset = int(page_size) * (int(page) - 1)
            limit = int(page_size)
            entities = query.order(-cls.created_at).fetch(offset=offset, limit=limit)
            total = query.count()

        return entities, total

    @classmethod
    def get(cls, id):
        key = ndb.Key(urlsafe = id)
        if(key is not None):
            return key.get()
        return None

    @classmethod
    def get_by_name(cls, name):
        return cls.query().filter(cls.site_name == name).order(-cls.created_at).get()

    @classmethod
    def get_by_account_id(cls, site_account_id):
        return cls.query().filter(cls.site_account_id == site_account_id).order(-cls.created_at).get()

    @classmethod
    def get_by_account_id_and_company_key(cls, site_account_id, company_key):
        entity = cls.query(ndb.AND(cls.company_key == company_key, ndb.AND(cls.site_account_id == site_account_id))).get()
        return entity

    def to_dict(self):
        return dict(
            id = self.key.urlsafe(),
            source_system_id = self.source_system_id,
            source_system = self.source_system,
            customer_key = self.customer_key.urlsafe(),
            customer = self.customer_key.get().to_dict(),
            site_name = self.site_name,
            site_account_id = self.site_account_id,
            site_address = self.site_address,
            site_zipcode = self.site_zipcode,
            site_state = self.site_state,
            site_city = self.site_city,
            contact_name = self.contact_name,
            contact_email = self.contact_email,
            contact_phone = self.contact_phone,
            latitude = self.latitude,
            longitude = self.longitude,
            active = self.active
        )

class ServiceOrderState(messages.Enum):
    Unassigned = 1
    Assigned = 2
    Problem = 3
    Failed = 4
    Completed = 5

class PurposeOfService(messages.Enum):
    Delivery = 1
    Removal = 2
    Swap = 3
    Relocate = 4

class AssetType(messages.Enum):
    yard = 1
    TrashBin = 2

class AssetSize(messages.Enum):
    Yrd10 = 1
    Yrd11 = 2
    Yrd12 = 3
    Yrd15 = 4
    Yrd18 = 5
    Yrd20 = 6
    Yrd30 = 7
    Yrd40 = 8
    Yrd50 = 9


class ServiceOrderFailureReason(messages.Enum):
    BadInfoFromCustomer = 1
    BlockedContainer = 2
    ContainerOverweight = 3
    ContainerOverloaded = 4
    SiteContactUnavailable = 5
    BadConditions = 6
    MechanicalFailure = 7

class ServiceOrder(BaseModel):

    company_key = ndb.KeyProperty(kind=Company, required=True)
    created_by = ndb.StringProperty()
    source_system_id = ndb.StringProperty()
    source_system = ndb.StringProperty()
    customer_account_id = ndb.StringProperty()
    site_account_id = ndb.StringProperty()
    service_ticket_id = ndb.StringProperty()
    customer_key = ndb.KeyProperty(kind=Customer, required=True)
    assets = ndb.StringProperty()
    site_key = ndb.KeyProperty(kind=Site, required=True)
    instructions = ndb.StringProperty()
    notes = ndb.StringProperty()
    state = ndb.IntegerProperty()
    driver_entry_info = ndb.StringProperty()
    service_date=ndb.DateTimeProperty()
    service_time_frame = ndb.StringProperty() # am/pm
    purpose_of_service = msgprop.EnumProperty(PurposeOfService)
    active = ndb.BooleanProperty(required=True, default=True)
    quantity = ndb.IntegerProperty()
    asset_size = msgprop.EnumProperty(AssetSize)
    finalized_notes = ndb.StringProperty()
    finalized_datetime = ndb.DateTimeProperty()
    failure_reason = msgprop.EnumProperty(ServiceOrderFailureReason)


    def save(self):

        action_type = AuditActionType.Created
        if self.key is not None:
            action_type = AuditActionType.Updated

        key = self.put()
        if key is not None:
            audit = Audit()
            audit.populate(
                entity_name=self.__class__.__name__,
                entity_key=key,
                action=action_type,
                user_email=users.get_current_user().email() if users.get_current_user() is not None else ''
            )
            audit.save()

        return self.get(key.urlsafe())


    @classmethod
    def get_all(cls, page, page_size, filters):

        total = 0
        query = cls.query()
        entities = None

        if str(filters["service_order_key"]):
            query = query.filter(cls.key == ndb.Key(urlsafe = filters["service_order_key"]))

        if str(filters["driver_key"]):

            keys = str(filters["driver_key"]).split(',')
            drivers_keys = []
            for key in keys:
                drivers_keys.append(ndb.Key(urlsafe=key))

            routes_keys = Route.query().filter(Route.driver_key.IN(drivers_keys)).fetch(keys_only=True)
            if len(routes_keys) > 0:
                route_items_of_type_service_order = RouteItem.query().filter(ndb.AND(RouteItem.entity_type == "serviceorder", ndb.AND(RouteItem.route_key.IN(routes_keys))))
                service_order_keys = []
                for x in route_items_of_type_service_order:
                    service_order_keys.append(x.entity_key)
                if len(service_order_keys) > 0:
                    query = query.filter(cls.key.IN(service_order_keys))
                else:
                    query = query.filter(cls.customer_key == None) #This condition will never be given since the customer_key field is required
            else:
                query = query.filter(cls.customer_key == None) #This condition will never be given since the customer_key field is required

        if filters["state"]:
            query = query.filter(cls.state == ServiceOrderState(int(filters["state"])))

        if(str(filters["start_date"]) and str(filters["end_date"])):

            sd = datetime.strptime(str(filters["start_date"]), "%m/%d/%Y")
            ed = datetime.strptime(str(filters["end_date"]), "%m/%d/%Y")
            ed = ed + timedelta(hours=23, minutes=59, seconds=59)
            query = query.filter(ndb.AND(cls.service_date >= sd, ndb.AND(cls.service_date <= ed)))

        if str(filters["customer_key"]):
            query = query.filter(cls.customer_key == ndb.Key(urlsafe = filters["customer_key"]))

        if str(filters["site_key"]):
            query = query.filter(cls.site_key == ndb.Key(urlsafe = filters["site_key"]))

        if str(filters["company_key"]):
            keys = str(filters["company_key"]).split(',')
            companies_keys = []
            for key in keys:
                companies_keys.append(ndb.Key(urlsafe=key))

            customers = Customer.query().filter(Customer.company_key.IN(companies_keys)).fetch(keys_only=True)
            if (customers is not None and len(customers) > 0):
                query = query.filter(cls.customer_key.IN(customers))
            else:
                query = query.filter(cls.customer_key == None)

        '''Active'''
        if (filters["active"] and str(filters["active"]) == "all"):
            pass
        elif filters["active"] and (json.loads(filters["active"]) == True or json.loads(filters["active"]) == False):
            query = query.filter(cls.active == json.loads(filters["active"]))
        else:
            query = query.filter(cls.active == True)

        '''Pagination'''
        if (not page or not page_size):
            entities = query.order(-cls.service_date).fetch()
            total = len(entities)
        else:
            offset = int(page_size) * (int(page) - 1)
            limit = int(page_size)
            entities = query.order(-cls.service_date).fetch(offset=offset, limit=limit)
            total = query.count()

        return entities, total

    @classmethod
    def get_by_service_ticket_id(cls, service_ticket_id):
        return cls.query().filter(cls.service_ticket_id == service_ticket_id).get()

    @classmethod
    def get(cls, id):
        key = ndb.Key(urlsafe = id)
        if(key is not None):
            return key.get()
        return None

    def to_dict(self):
        from helpers import Attachments
        has_attachments = Attachments.AttachmentsHelper.exists_attachments_for_entity_key(self.key.urlsafe())
        return dict(
            id = self.key.urlsafe(),
            has_attachments = has_attachments,
            source_system_id = self.source_system_id,
            source_system = self.source_system,
            customer_account_id = self.customer_account_id,
            site_account_id = self.site_account_id,
            service_ticket_id = self.service_ticket_id,
            customer_key = self.customer_key.urlsafe(),
            customer = self.customer_key.get().to_dict(),
            site_key = self.site_key.urlsafe(),
            assets = self.assets,
            site = self.site_key.get().to_dict(),
            instructions = self.instructions,
            notes = self.notes,
            state = int(self.state) if self.state is not None else None,
            failure_reason = int(self.failure_reason) if self.failure_reason is not None else None,
            service_time_frame = self.service_time_frame,
            purpose_of_service = int(self.purpose_of_service) if self.purpose_of_service is not None else None,
            driver_entry_info = self.driver_entry_info,
            service_date = self.service_date.strftime("%Y-%m-%d %H:%M:%S") if self.service_date is not None else None,
            active = self.active,
            quantity = self.quantity,
            finalized_notes = self.finalized_notes,
            finalized_datetime = self.finalized_datetime.strftime("%Y-%m-%d %H:%M") if self.finalized_datetime is not None else None,
            asset_size = int(self.asset_size) if self.asset_size is not None else None
        )

class ServiceOrderProblemState(messages.Enum):
    Active = 1
    Resolved = 2
    NotResolved = 3
    Failed = 4

class ServiceOrderProblem(BaseModel):

    created_by = ndb.StringProperty()

    company_key = ndb.KeyProperty(kind=Company, required=True)
    driver_key = ndb.KeyProperty(kind=User, required=True)
    service_order_key = ndb.KeyProperty(kind=ServiceOrder, required=True)
    description = ndb.StringProperty()
    finalized_datetime = ndb.DateTimeProperty()
    state = msgprop.EnumProperty(ServiceOrderProblemState)
    problem_datetime = ndb.DateTimeProperty()

    def save(self):
        action_type = AuditActionType.Created
        if self.key is not None:
            action_type = AuditActionType.Updated
        key = self.put()

        if key is not None:
            audit = Audit()
            audit.populate(
                entity_name=self.__class__.__name__,
                entity_key=key,
                action=action_type,
                user_email=users.get_current_user().email() if users.get_current_user() is not None else ''
            )
            audit.save()

        return self.get(key.urlsafe())

    @classmethod
    def get(cls, id):
        key = ndb.Key(urlsafe = id)
        if(key is not None):
            return key.get()
        return None

    @classmethod
    def get_by_service_order(cls, service_order_key):
        query = cls.query().filter(cls.service_order_key == service_order_key).fetch()
        return query

    @classmethod
    def get_all(cls, page, page_size, filters):

        total = 0
        query = cls.query()
        entities = None

        '''Id'''
        if str(filters["id"]):
            query = query.filter(cls.key == ndb.Key(urlsafe = filters["id"]))

        '''service_order_key'''
        if str(filters["service_order_key"]):
            query = query.filter(cls.service_order_key == ndb.Key(urlsafe = filters["service_order_key"]))

        '''state'''
        if filters["state"]:
            query = query.filter(cls.state == ServiceOrderState(int(filters["state"])))

        '''Range of dates'''
        if (str(filters["start_date"]) and str(filters["end_date"])):
            sd = datetime.strptime(str(filters["start_date"]), "%m/%d/%Y")
            ed = datetime.strptime(str(filters["end_date"]), "%m/%d/%Y")
            ed = ed + timedelta(hours=23, minutes=59, seconds=59)
            query = query.filter(ndb.AND(cls.problem_datetime >= sd, ndb.AND(cls.problem_datetime <= ed)))

        if str(filters["company_key"]):
            query = query.filter(cls.company_key == ndb.Key(urlsafe = filters["company_key"]))

        if str(filters["driver_key"]):
            query = query.filter(cls.driver_key == ndb.Key(urlsafe = filters["driver_key"]))

        #Fix entities without problem date
        #list_of_entities = cls.query().fetch()
        #for entity in list_of_entities:
        #     entity.problem_datetime = entity.created_at
        #ndb.put_multi(list_of_entities)

        '''Pagination'''
        if (not page or not page_size):
            entities = query.order(-cls.problem_datetime).fetch()
            total = query.count()
        else:
            offset = int(page_size) * (int(page) - 1)
            limit = int(page_size)
            entities = query.order(-cls.problem_datetime).fetch(offset=offset, limit=limit)
            total = query.count()

        return entities, total

    def to_dict(self):
        from helpers import Attachments
        has_attachments = Attachments.AttachmentsHelper.exists_attachments_for_entity_key(self.key.urlsafe())
        return dict(
            id = self.key.urlsafe(),
            has_attachments = has_attachments,
            company_key = self.company_key.urlsafe(),
            driver_key = self.driver_key.urlsafe(),
            service_ticket_id=self.service_ticket_id,
            service_order_key = self.service_order_key.urlsafe(),
            service_order = self.service_order_key.get().to_dict(),
            description = self.description,
            created_at = self.created_at.strftime("%Y-%m-%d %H:%M") if self.created_at is not None else None,
            finalized_datetime = self.finalized_datetime.strftime("%Y-%m-%d %H:%M") if self.finalized_datetime is not None else None,
            problem_datetime = self.problem_datetime.strftime("%Y-%m-%d %H:%M") if self.problem_datetime is not None else None,
            state = int(self.state) if self.state is not None else None
        )

class ServicePricing(BaseModel):

    company_key = ndb.KeyProperty(kind=Company, required=True)
    dumpser_size = ndb.FloatProperty(required=True)
    price = ndb.FloatProperty(required=True)
    active = ndb.BooleanProperty(required=True, default=True)

    def save(self):
        action_type = AuditActionType.Created
        if self.key is not None:
            action_type = AuditActionType.Updated
        key = self.put()

        if key is not None:
            audit = Audit()
            audit.populate(
                entity_name=self.__class__.__name__,
                entity_key=key,
                action=action_type,
                user_email=users.get_current_user().email() if users.get_current_user() is not None else ''
            )
            audit.save()

        return self.get(key.urlsafe())

    @classmethod
    def get_all(cls, page, page_size, filters):

        total = 0
        query = cls.query()
        entities = None

        if str(filters["company"]):
            query = query.filter(cls.company_key == ndb.Key(urlsafe = filters["company"]))

        '''Active'''
        if (filters["active"] and str(filters["active"]) == "all"):
            pass
        elif filters["active"] and (json.loads(filters["active"]) == True or json.loads(filters["active"]) == False):
            query = query.filter(cls.active == json.loads(filters["active"]))
        else:
            query = query.filter(cls.active == True)

        if (not page or not page_size):
            entities = query.order(cls.sort_index, -cls.created_at).fetch()
            total = len(entities)
        else:
            offset = int(page_size) * (int(page) - 1)
            limit = int(page_size)
            entities = query.order(cls.sort_index, -cls.created_at).fetch(offset=offset, limit=limit)
            total = query.count()

        return entities, total

    @classmethod
    def get(cls, id):
        key = ndb.Key(urlsafe = id)
        if(key is not None):
            return key.get()
        return None

    def to_dict(self):
        return dict(
            id = self.key.urlsafe(),
            dumpser_size = self.dumpser_size,
            price = self.price,
            active = self.active
        )

class AuditActionType(messages.Enum):
    Created = 1
    Updated = 2
    Deleted = 3

class Audit(BaseModel):

    entity_name = ndb.StringProperty()
    entity_key = ndb.KeyProperty()
    action = msgprop.EnumProperty(AuditActionType)
    user_email = ndb.StringProperty()
    error = ndb.StringProperty()
    message = ndb.StringProperty()

    created_at = ndb.DateTimeProperty(auto_now_add=True)
    modified_at = ndb.DateTimeProperty(auto_now=True)

    def save(self):
        key = self.put()
        return self.get(key.urlsafe())

    @classmethod
    def get_all(cls, page, page_size, filters):

        total = 0
        query = cls.query()
        entities = None

        if (not page or not page_size):
            entities = query.order(-cls.created_at).fetch()
            total = len(entities)
        else:
            offset = int(page_size) * (int(page) - 1)
            limit = int(page_size)
            entities = query.order(-cls.created_at).fetch(offset=offset, limit=limit)
            total = query.count()

        return entities, total

    @classmethod
    def get(cls, id):
        key = ndb.Key(urlsafe = id)
        if(key is not None):
            return key.get()
        return None

    def to_dict(self):
        return dict(
            id = self.key.urlsafe(),
            entity_name = self.entity_name,
        )

class Yard(BaseModel):

    source_system = ndb.StringProperty()
    company_key = ndb.KeyProperty(kind=Company, required=True)
    yard_name = ndb.StringProperty()
    yard_address = ndb.StringProperty()
    yard_zipcode = ndb.StringProperty()
    yard_state = ndb.StringProperty()
    yard_city = ndb.StringProperty()
    contact_name = ndb.StringProperty()
    contact_email = ndb.StringProperty()
    contact_phone = ndb.StringProperty()
    active = ndb.BooleanProperty(required=True, default=True)
    latitude = ndb.StringProperty()
    longitude = ndb.StringProperty()

    def save(self):
        action_type = AuditActionType.Created
        if self.key is not None:
            action_type = AuditActionType.Updated
        key = self.put()

        if key is not None:
            audit = Audit()
            audit.populate(
                entity_name=self.__class__.__name__,
                entity_key=key,
                action=action_type,
                user_email=users.get_current_user().email() if users.get_current_user() is not None else ''
            )
            audit.save()

        return self.get(key.urlsafe())

    @classmethod
    def get_all(cls, page, page_size, filters):

        total = 0
        query = cls.query()
        entities = None

        if str(filters["yard_key"]):
            query = query.filter(cls.key == ndb.Key(urlsafe = filters["yard_key"]))
        if str(filters["company_key"]):
            query = query.filter(cls.company_key == ndb.Key(urlsafe = filters["company_key"]))

        '''Active'''
        if (filters["active"] and str(filters["active"]) == "all"):
            pass
        elif filters["active"] and (json.loads(filters["active"]) == True or json.loads(filters["active"]) == False):
            query = query.filter(cls.active == json.loads(filters["active"]))
        else:
            query = query.filter(cls.active == True)



        '''Pagination'''
        if (not page or not page_size):
            entities = query.order(-cls.created_at).fetch()
            total = len(entities)
        else:
            offset = int(page_size) * (int(page) - 1)
            limit = int(page_size)
            entities = query.order(-cls.created_at).fetch(offset=offset, limit=limit)
            total = query.count()

        return entities, total

    @classmethod
    def get(cls, id):
        key = ndb.Key(urlsafe = id)
        if(key is not None):
            return key.get()
        return None

    def to_dict(self):
        return dict(
            id = self.key.urlsafe(),
            source_system = self.source_system,
            company_key = self.company_key.urlsafe(),
            yard_name = self.yard_name,
            yard_address = self.yard_address,
            yard_zipcode = self.yard_zipcode,
            yard_state = self.yard_state,
            yard_city = self.yard_city,
            contact_name = self.contact_name,
            contact_email = self.contact_email,
            contact_phone = self.contact_phone,
            active = self.active,
            latitude = self.latitude,
            longitude = self.longitude
        )

class Facility(BaseModel):

    source_system = ndb.StringProperty()
    company_key = ndb.KeyProperty(kind=Company, required=True)
    facility_name = ndb.StringProperty()
    facility_address = ndb.StringProperty()
    facility_zipcode = ndb.StringProperty()
    facility_state = ndb.StringProperty()
    facility_city = ndb.StringProperty()
    contact_name = ndb.StringProperty()
    contact_email = ndb.StringProperty()
    contact_phone = ndb.StringProperty()
    hours_of_operation = ndb.StringProperty()
    active = ndb.BooleanProperty(required=True, default=True)
    latitude = ndb.StringProperty()
    longitude = ndb.StringProperty()

    def save(self):
        action_type = AuditActionType.Created
        if self.key is not None:
            action_type = AuditActionType.Updated
        key = self.put()

        if key is not None:
            audit = Audit()
            audit.populate(
                entity_name=self.__class__.__name__,
                entity_key=key,
                action=action_type,
                user_email=users.get_current_user().email() if users.get_current_user() is not None else ''
            )
            audit.save()

        return self.get(key.urlsafe())

    @classmethod
    def get_all(cls, page, page_size, filters):

        total = 0
        query = cls.query()
        entities = None

        if str(filters["facility_key"]):
            query = query.filter(cls.key == ndb.Key(urlsafe = filters["facility_key"]))
        if str(filters["company_key"]):
            query = query.filter(cls.company_key == ndb.Key(urlsafe = filters["company_key"]))

        '''Active'''
        if filters["active"] and str(filters["active"]) == "all":
            pass
        elif filters["active"] and (json.loads(filters["active"]) == True or json.loads(filters["active"]) == False):
            query = query.filter(cls.active == json.loads(filters["active"]))
        else:
            query = query.filter(cls.active == True)

        '''Pagination'''
        if not page or not page_size:
            entities = query.order(-cls.created_at).fetch()
            total = len(entities)
        else:
            offset = int(page_size) * (int(page) - 1)
            limit = int(page_size)
            entities = query.order(-cls.created_at).fetch(offset=offset, limit=limit)
            total = query.count()

        return entities, total

    @classmethod
    def get(cls, id):
        key = ndb.Key(urlsafe = id)
        if(key is not None):
            return key.get()
        return None

    def to_dict(self):
        return dict(
            id = self.key.urlsafe(),
            source_system = self.source_system,
            company_key = self.company_key.urlsafe(),
            facility_name = self.facility_name,
            facility_address = self.facility_address,
            facility_zipcode = self.facility_zipcode,
            facility_state = self.facility_state,
            facility_city = self.facility_city,
            contact_name = self.contact_name,
            contact_email = self.contact_email,
            contact_phone = self.contact_phone,
            hours_of_operation = self.hours_of_operation,
            active = self.active,
            latitude = self.latitude,
            longitude = self.longitude
        )

class Vehicle(BaseModel):

    source_system = ndb.StringProperty()
    company_key = ndb.KeyProperty(kind=Company, required=True)
    vehicle_name = ndb.StringProperty()
    model = ndb.StringProperty()
    size = ndb.StringProperty()
    tag_number = ndb.StringProperty()
    driver_key = ndb.KeyProperty(kind=User, required=True) #Default driver of vehicle
    active = ndb.BooleanProperty(required=True, default=True)

    def save(self):
        action_type = AuditActionType.Created
        if self.key is not None:
            action_type = AuditActionType.Updated
        key = self.put()

        if key is not None:
            audit = Audit()
            audit.populate(
                entity_name=self.__class__.__name__,
                entity_key=key,
                action=action_type,
                user_email=users.get_current_user().email() if users.get_current_user() is not None else ''
            )
            audit.save()

        return self.get(key.urlsafe())

    @classmethod
    def get_all(cls, page, page_size, filters):

        total = 0
        query = cls.query()
        entities = None

        if str(filters["vehicle_key"]):
            query = query.filter(cls.key == ndb.Key(urlsafe = filters["driver_key"]))
        if str(filters["driver_key"]):
            query = query.filter(cls.driver_key == ndb.Key(urlsafe = filters["driver_key"]))
        if str(filters["company_key"]):
            query = query.filter(cls.company_key == ndb.Key(urlsafe = filters["company_key"]))

        '''Active'''
        if (filters["active"] and str(filters["active"]) == "all"):
            pass
        elif filters["active"] and (json.loads(filters["active"]) == True or json.loads(filters["active"]) == False):
            query = query.filter(cls.active == json.loads(filters["active"]))
        else:
            query = query.filter(cls.active == True)

        '''Pagination'''
        if (not page or not page_size):
            entities = query.order(-cls.created_at).fetch()
            total = len(entities)
        else:
            offset = int(page_size) * (int(page) - 1)
            limit = int(page_size)
            entities = query.order(-cls.created_at).fetch(offset=offset, limit=limit)
            total = query.count()

        return entities, total

    @classmethod
    def get(cls, id):
        key = ndb.Key(urlsafe = id)
        if(key is not None):
            return key.get()
        return None

    def to_dict(self):
        return dict(
            id = self.key.urlsafe(),
            source_system = self.source_system,
            company_key = self.company_key.urlsafe(),
            driver_key = self.driver_key.urlsafe(),
            driver = self.driver_key.get().to_dict(),
            vehicle_name = self.vehicle_name,
            model = self.model,
            size = self.size,
            tag_number = self.tag_number,
            active = self.active
        )

class RouteStatus(messages.Enum):
    New = 1 #default
    InProgress = 2
    Completed = 3
    Failed = 4 #when the route is not completed

class Route(BaseModel):

    created_by = ndb.StringProperty()

    company_key = ndb.KeyProperty(kind=Company, required=True)
    date = ndb.DateTimeProperty(required=True)
    driver_key = ndb.KeyProperty(kind=Driver)
    total_distance = ndb.FloatProperty()
    total_time = ndb.FloatProperty()
    num_of_stops = ndb.IntegerProperty()
    status = msgprop.EnumProperty(RouteStatus, default=RouteStatus.New)
    active = ndb.BooleanProperty(required=True, default=True)
    notes = ndb.StringProperty()

    def save(self):
        action_type = AuditActionType.Created
        if self.key is not None:
            action_type = AuditActionType.Updated
        key = self.put()

        if key is not None:
            audit = Audit()
            audit.populate(
                entity_name=self.__class__.__name__,
                entity_key=key,
                action=action_type,
                user_email=users.get_current_user().email() if users.get_current_user() is not None else ''
            )
            audit.save()

        return self.get(key.urlsafe())

    @classmethod
    def get_all_in_progress_by_driver_key(cls, driver_key):
        return cls.query().filter(ndb.AND(cls.driver_key == driver_key, ndb.AND(cls.status == RouteStatus.InProgress))).fetch()

    @classmethod
    def get_all(cls, page, page_size, filters):

        total = 0
        query = cls.query()
        entities = None

        if str(filters["route_key"]):
            query = query.filter(cls.key == ndb.Key(urlsafe = filters["route_key"]))

        if str(filters["status"]):
            query = query.filter(cls.status == RouteStatus(int(filters["status"])))

        if str(filters["vehicle_key"]):
            keys = str(filters["vehicle_key"]).split(',')
            vehicles_keys = []
            for key in keys:
                vehicles_keys.append(ndb.Key(urlsafe=key))
            if len(vehicles_keys) > 0:
                query = query.filter(cls.vehicle_key.IN(vehicles_keys))
            else:
                #Here we need to put a condition, which will never be given.
                fictional_date = datetime.strptime("02/01/1970", "%m/%d/%Y")
                query = query.filter(cls.date == fictional_date)

        if str(filters["driver_key"]):
            keys = str(filters["driver_key"]).split(',')
            drivers_keys = []
            for key in keys:
                drivers_keys.append(ndb.Key(urlsafe=key))
            if len(drivers_keys) > 0:
                query = query.filter(cls.driver_key.IN(drivers_keys))
            else:
                #Here we need to put a condition, which will never be given.
                fictional_date = datetime.strptime("02/01/1970", "%m/%d/%Y")
                query = query.filter(cls.date == fictional_date)

        if str(filters["company_key"]):
            keys = str(filters["company_key"]).split(',')
            companies_keys = []
            for key in keys:
                companies_keys.append(ndb.Key(urlsafe=key))
            if len(companies_keys) > 0:
                query = query.filter(cls.company_key.IN(companies_keys))
            else:
                #Here we need to put a condition, which will never be given.
                fictional_date = datetime.strptime("02/01/1970", "%m/%d/%Y")
                query = query.filter(cls.date == fictional_date)

        if(str(filters["start_date"]) and str(filters["end_date"])):

            sd = datetime.strptime(str(filters["start_date"]), "%m/%d/%Y")
            ed = datetime.strptime(str(filters["end_date"]), "%m/%d/%Y")
            ed = ed + timedelta(hours=23, minutes=59, seconds=59)
            query = query.filter(ndb.AND(cls.date >= sd, ndb.AND(cls.date <= ed)))

        '''Active'''
        if (filters["active"] and str(filters["active"]) == "all"):
            pass
        elif filters["active"] and (json.loads(filters["active"]) == True or json.loads(filters["active"]) == False):
            query = query.filter(cls.active == json.loads(filters["active"]))
        else:
            query = query.filter(cls.active == True)

        '''Pagination'''
        if (not page or not page_size):
            entities = query.order(-cls.date).fetch()
            total = len(entities)
        else:
            offset = int(page_size) * (int(page) - 1)
            limit = int(page_size)
            entities = query.order(-cls.date).fetch(offset=offset, limit=limit)
            total = query.count()

        return entities, total

    @classmethod
    def get(cls, id):
        key = ndb.Key(urlsafe = id)
        if(key is not None):
            return key.get()
        return None

    def to_dict(self):

        logging.warning("inside to_dict")
        return dict(
            id = self.key.urlsafe(),
            company_key = self.company_key.urlsafe(),
            date = self.date.strftime("%m/%d/%y"),
            driver_key = self.driver_key.urlsafe() if self.driver_key is not None else None,
            total_distance = self.total_distance,
            total_time = self.total_time,
            status = int(self.status) if self.status is not None else None,
            notes = self.notes,
            active = self.active,

        )

    def to_dict_optimized(self):
        return dict(
            id = self.key.urlsafe(),
            date = self.date.strftime("%Y-%m-%d %H:%M:%S"),
            driver_key = self.driver_key.urlsafe(),
            driver = self.driver_key.get().to_dict(),
            company_key = self.company_key.urlsafe(),
            vehicle_key = self.vehicle_key.urlsafe(),
            vehicle = self.vehicle_key.get().to_dict(),
            notes = self.notes,
            active = self.active,
            status = int(self.status) if self.status is not None else None
        )



class RouteItem(BaseModel):

    dist_2_next = ndb.FloatProperty()
    time_2_next = ndb.FloatProperty()
    route_key = ndb.KeyProperty(kind=Route, required=True)
    serviceorder_key = ndb.KeyProperty(kind=ServiceOrder)
    yard_key = ndb.KeyProperty(kind=Yard)
    facility_key = ndb.KeyProperty(kind=Facility)
    entity_type = ndb.StringProperty(required=True)
    item_key = ndb.StringProperty()
    sort_index = ndb.IntegerProperty()

    active = ndb.BooleanProperty(required=True, default=True)
    latitude = ndb.StringProperty()
    longitude = ndb.StringProperty()

    def save(self):
        logging.warning("inside save")
        action_type = AuditActionType.Created
        if self.key is not None:
            action_type = AuditActionType.Updated

        if self.entity_type =='serviceorder':
            logging.warning("in serviceorder")
            self.serviceorder_key = ndb.Key(ServiceOrder,self.item_key)
        elif self.entity_type =="yard":
            self.yard_key = ndb.Key(Yard,self.item_key)
        else:
            self.facility_key = ndb.Key(Facility,self.item_key)

        key = self.put()

        if key is not None:
            audit = Audit()
            audit.populate(
                entity_name=self.__class__.__name__,
                entity_key=key,
                action=action_type,
                user_email=users.get_current_user().email() if users.get_current_user() is not None else ''
            )
            audit.save()

        return self.get(key.urlsafe())


    def delete(cls):

        temp_key = cls.key

        entity = cls.key.get().entity_key.get()
        if cls.entity_type == 'serviceorder' and entity is not None:
            entity.state = ServiceOrderState.Unassigned
            entity.save()

        cls.key.delete()

        action_type = AuditActionType.Deleted
        if temp_key is not None:
            audit = Audit()
            audit.populate(
                entity_name=cls.__class__.__name__,
                entity_key=temp_key,
                action=action_type,
                user_email=users.get_current_user().email() if users.get_current_user() is not None else ''
            )
            audit.save()

    @classmethod
    def get_by_entity_key(cls, entity_key):
        query = cls.query().filter(cls.entity_key == entity_key).get()
        return query

    @classmethod
    def get_all(cls, page, page_size, filters):

        total = 0
        query = cls.query()
        entities = None

        if str(filters["route_key"]):
            query = query.filter(cls.route_key == ndb.Key(urlsafe = filters["route_key"]))

        '''Active'''
        if (filters["active"] and str(filters["active"]) == "all"):
            pass
        elif filters["active"] and (json.loads(filters["active"]) == True or json.loads(filters["active"]) == False):
            query = query.filter(cls.active == json.loads(filters["active"]))
        else:
            query = query.filter(cls.active == True)

        '''Pagination'''
        if (not page or not page_size):
            entities = query.order(cls.sort_index).fetch()
            total = len(entities)
        else:
            offset = int(page_size) * (int(page) - 1)
            limit = int(page_size)
            entities = query.order(cls.sort_index).fetch(offset=offset, limit=limit)
            total = query.count()

        return entities, total

    @classmethod
    def get(cls, id):
        key = ndb.Key(urlsafe = id)
        if(key is not None):
            return key.get()
        return None

    @classmethod
    def get_last_by_sort_index(cls):
        entity = cls.query().order(-cls.sort_index, -cls.created_at).get()
        return entity

    def to_dict(self):

        entity = self.entity_key.get()

        return dict(
            id = self.key.urlsafe(),
            route_key = self.route_key.urlsafe(),
            dist_2_next = self.dist_2_next,
            time_2_next = self.time_2_next,
            entity_type = self.entity_type,
            entity_key = self.entity_key.urlsafe(),
            entity = entity.to_dict() if entity is not None else None,
            sort_index = self.sort_index,
            active = self.active,
            latitude = self.latitude,
            longitude = self.longitude
        )

class RouteIncidentStatus(messages.Enum):
    Reported = 1
    InProgress = 2
    Resolved = 3
    Failed = 4

class RouteIncidentType(messages.Enum):
    PoliceIncident = 1
    MechanicalFailure = 2
    FuelEmpty = 3
    MinorAccident = 4
    MajorAccident = 5
    IllnessInjury = 6

class RouteIncident(BaseModel):

    created_by = ndb.StringProperty()
    created_at = ndb.DateTimeProperty(auto_now_add=True)
    modified_at = ndb.DateTimeProperty(auto_now=True)
    service_ticket_id = ndb.StringProperty()
    order_canceled = ndb.BooleanProperty()
    # driver_key = ndb.KeyProperty(kind=User)
    order_key = ndb.KeyProperty(kind=ServiceOrder, required=True)
    # incident_type = msgprop.EnumProperty(RouteIncidentType)
    # status = msgprop.EnumProperty(RouteIncidentStatus, default=RouteIncidentStatus.Reported)
    incident_notes = ndb.StringProperty()
    report_datetime = ndb.DateTimeProperty()

    def save(self):
        action_type = AuditActionType.Created
        if self.key is not None:
            action_type = AuditActionType.Updated
        key = self.put()

        if key is not None:
            audit = Audit()
            audit.populate(
                entity_name=self.__class__.__name__,
                entity_key=key,
                action=action_type,
                user_email=users.get_current_user().email() if users.get_current_user() is not None else ''
            )
            audit.save()

        return self.get(key.urlsafe())

    @classmethod
    def get(cls, id):
        key = ndb.Key(urlsafe = id)
        if(key is not None):
            return key.get()
        return None

    # @classmethod
    # def get_by_route(cls, route_key):
    #     query = cls.query().filter(cls.route_key == route_key).fetch()
    #     return query

    @classmethod
    def get_all(cls, page, page_size, filters):

        total = 0
        query = cls.query()
        entities = None

        # '''Id'''
        # if str(filters["id"]):
        #     query = query.filter(cls.key == ndb.Key(urlsafe = filters["id"]))

        # '''route key'''
        # if str(filters["order_key"]):
        #     query = query.filter(cls.order_key == ndb.Key(urlsafe = filters["order_key"]))

        # '''driver key'''
        # if str(filters["driver_key"]):
        #     query = query.filter(cls.driver_key == ndb.Key(urlsafe = filters["driver_key"]))



        '''Range of dates'''
        if(str(filters["start_date"]) and str(filters["end_date"])):
            sd = datetime.strptime(str(filters["start_date"]), "%m/%d/%Y")
            ed = datetime.strptime(str(filters["end_date"]), "%m/%d/%Y")
            ed = ed + timedelta(hours=23, minutes=59, seconds=59)
            query = query.filter(ndb.AND(cls.report_datetime >= sd, ndb.AND(cls.report_datetime <= ed)))

        '''Pagination'''
        if (not page or not page_size):
            entities = query.order(-cls.report_datetime).fetch()
            total = len(entities)
        else:
            offset = int(page_size) * (int(page) - 1)
            limit = int(page_size)
            entities = query.order(-cls.report_datetime).fetch(offset=offset, limit=limit)
            # entities = query.order(-cls.sort_index).fetch(offset=offset, limit=limit)

            total = query.count()

        return entities, total

    def to_dict(self):
        from helpers import Attachments
        has_attachments = Attachments.AttachmentsHelper.exists_attachments_for_entity_key(self.key.urlsafe())
        return dict(
            id=self.key.urlsafe(),
            has_attachments = has_attachments,
            # driver_key=self.driver_key.urlsafe(),
            # driver=self.driver_key.get().to_dict() if self.driver_key is not None else None,
            order_key=self.order_key.urlsafe(),
            # route=self.route_key.get().to_dict() if self.route_key is not None else None,
            # incident_type=int(self.incident_type) if self.incident_type is not None else None,
            # status=int(self.status) if self.status is not None else None,

            service_ticket_id=self.service_ticket_id,
            order_canceled =str(self.order_canceled),
            incident_notes=self.incident_notes,
            created_at=self.created_at.isoformat(),
            modified_at=self.modified_at.isoformat(),
            report_datetime=self.report_datetime.strftime("%Y-%m-%d %H:%M:%S") if self.report_datetime is not None else None,
        )

    def to_dict_without_route(self):

        return dict(
            id=self.key.urlsafe(),
            # incident_type=int(self.incident_type) if self.incident_type is not None else None,
            # status=int(self.status) if self.status is not None else None,
            incident_notes=self.incident_notes,
            created_at=self.created_at.isoformat(),
            order_key=self.order_key.urlsafe(),
            order_canceled = self.order_canceled,
            service_ticket_id=self.service_ticket_id,
            modified_at=self.modified_at.isoformat(),
            report_datetime=self.report_datetime.strftime("%Y-%m-%d %H:%M:%S") if self.report_datetime is not None else None,
        )

class AssetInventory(BaseModel):

    asset_size = msgprop.EnumProperty(AssetSize)
    company_key = ndb.KeyProperty(kind=Company, required=True)
    yard_key = ndb.KeyProperty(kind=Yard, required=False)
    count = ndb.IntegerProperty()

    def save(self):
        action_type = AuditActionType.Created
        if self.key is not None:
            action_type = AuditActionType.Updated
        key = self.put()

        if key is not None:
            audit = Audit()
            audit.populate(
                entity_name=self.__class__.__name__,
                entity_key=key,
                action=action_type,
                user_email=users.get_current_user().email() if users.get_current_user() is not None else ''
            )
            audit.save()

        return self.get(key.urlsafe())

    @classmethod
    def get_all(cls, page, page_size, filters):

        total = 0
        query = cls.query()
        entities = None

        if str(filters["company_key"]):
            query = query.filter(cls.company_key == ndb.Key(urlsafe = filters["company_key"]))

        '''Pagination'''
        if (not page or not page_size):
            entities = query.order(-cls.created_at).fetch()
            total = len(entities)
        else:
            offset = int(page_size) * (int(page) - 1)
            limit = int(page_size)
            entities = query.order(-cls.created_at).fetch(offset=offset, limit=limit)
            total = query.count()

        return entities, total

    @classmethod
    def get(cls, id):
        key = ndb.Key(urlsafe = id)
        if(key is not None):
            return key.get()
        return None

    def to_dict(self):

        return dict(
            id = self.key.urlsafe(),
            asset_size = int(self.asset_size) if self.asset_size is not None else None,
            company_key = self.company_key.urlsafe(),
            company = self.company_key.get().to_dict() if self.company_key is not None else None,
            yard_key = self.yard_key.urlsafe() if self.yard_key is not None else None,
            yard = self.yard_key.get().to_dict() if self.yard_key is not None else None,
            count = self.count,
            created_at=self.created_at.isoformat(),
            modified_at=self.modified_at.isoformat()
        )

class Message(BaseModel):

    company_key = ndb.KeyProperty(kind=Company, required=True)
    parent_message_key = ndb.KeyProperty(kind='Message', required=False)
    sender_user_key = ndb.KeyProperty(kind=User)
    receiver_user_key = ndb.KeyProperty(kind=User, required=True)
    message_type = ndb.StringProperty()
    message_title = ndb.StringProperty()
    message_body = ndb.StringProperty(required=True)
    message_status = ndb.StringProperty()
    active = ndb.BooleanProperty(required=True, default=True)

    def save(self):
        action_type = AuditActionType.Created
        if self.key is not None:
            action_type = AuditActionType.Updated
        key = self.put()

        if key is not None:
            audit = Audit()
            audit.populate(
                entity_name=self.__class__.__name__,
                entity_key=key,
                action=action_type,
                user_email=users.get_current_user().email() if users.get_current_user() is not None else ''
            )
            audit.save()

        return self.get(key.urlsafe())

    @classmethod
    def get_all(cls, page, page_size, filters, sort):

        total = 0
        query = cls.query()
        entities = None

        '''Id'''
        if str(filters["id"]):
            query = query.filter(cls.key == ndb.Key(urlsafe = filters["id"]))

        '''Company'''
        if str(filters["company_key"]):
            query = query.filter(cls.company_key == ndb.Key(urlsafe = filters["company_key"]))

        '''Sender user'''
        if str(filters["sender_user_key"]):
            query = query.filter(cls.sender_user_key == ndb.Key(urlsafe = filters["sender_user_key"]))

        '''Receiver user'''
        if str(filters["receiver_user_key"]):
            query = query.filter(cls.receiver_user_key == ndb.Key(urlsafe = filters["receiver_user_key"]))


        '''Parent message key'''
        if str(filters["parent_message_key"]):
            if(str(filters["parent_message_key"]) == "None"):
                query = query.filter(cls.parent_message_key == None)
            else:
                query = query.filter(cls.parent_message_key == ndb.Key(urlsafe = filters["parent_message_key"]))

        '''Active'''
        if (filters["active"] and str(filters["active"]) == "all"):
            pass
        elif filters["active"] and (json.loads(filters["active"]) == True or json.loads(filters["active"]) == False):
            query = query.filter(cls.active == json.loads(filters["active"]))
        else:
            query = query.filter(cls.active == True)

        '''Range of dates'''
        if(str(filters["start_date"]) and str(filters["end_date"])):
            sd = datetime.strptime(str(filters["start_date"]), "%m/%d/%Y")
            ed = datetime.strptime(str(filters["end_date"]), "%m/%d/%Y")
            ed = ed + timedelta(hours=23, minutes=59, seconds=59)
            query = query.filter(ndb.AND(cls.created_at >= sd, ndb.AND(cls.created_at <= ed)))

        '''Date'''
        if str(filters["date"]):
            sd = datetime.strptime(str(filters["date"]), "%m/%d/%Y")
            ed = datetime.strptime(str(filters["date"]), "%m/%d/%Y")
            ed = ed + timedelta(hours=23, minutes=59, seconds=59)
            query = query.filter(ndb.AND(cls.created_at >= sd, ndb.AND(cls.created_at <= ed)))

        '''Pagination'''
        if (not page or not page_size):
            if sort == 'asc':
                entities = query.order(cls.created_at).fetch()
            else:
                entities = query.order(-cls.created_at).fetch()
            total = len(entities)
        else:
            offset = int(page_size) * (int(page) - 1)
            limit = int(page_size)
            if sort == 'asc':
                entities = query.order(cls.created_at).fetch(offset=offset, limit=limit)
            else:
                entities = query.order(-cls.created_at).fetch(offset=offset, limit=limit)
            total = query.count()

        return entities, total

    @classmethod
    def get(cls, id):
        key = ndb.Key(urlsafe = id)
        if(key is not None):
            return key.get()
        return None

    def to_dict(self):
        return dict(
            id = self.key.urlsafe(),
            company_key = self.company_key.urlsafe(),
            #When a message is saved. is not necessary the info about of its father
            #parent_message_key = self.parent_message_key.urlsafe() if self.parent_message_key is not None else None,
            #parent_message = self.parent_message_key.get().to_dict() if self.parent_message_key is not None else None,
            sender_user_key = self.sender_user_key.urlsafe(),
            sender_user = self.sender_user_key.get().to_dict(),
            receiver_user_key = self.receiver_user_key.urlsafe(),
            receiver_user = self.receiver_user_key.get().to_dict(),
            message_type = self.message_type,
            message_title = self.message_title,
            message_body = self.message_body,
            message_status = self.message_status,
            active = self.active,
            created_at=self.created_at.isoformat(),
            modified_at=self.modified_at.isoformat()
        )

    def to_dict_with_childs(self, options = {}):
        childs = []
        if "no-childs" in options and options["no-childs"] and json.loads(options["no-childs"]) == True:
            childs.append("No childs option activated")
        else:
            messages = Message.query(Message.parent_message_key == self.key).fetch()
            childs = json.loads(json.dumps([entity.to_dict_with_childs(options) for entity in messages]))
        return dict(
            id = self.key.urlsafe(),
            company_key = self.company_key.urlsafe(),
            sender_user_key = self.sender_user_key.urlsafe(),
            sender_user = self.sender_user_key.get().to_dict(),
            receiver_user_key = self.receiver_user_key.urlsafe(),
            receiver_user = self.receiver_user_key.get().to_dict(),
            parent_message_key = self.parent_message_key.urlsafe() if self.parent_message_key is not None else None,
            message_type = self.message_type,
            message_title = self.message_title,
            message_body = self.message_body,
            message_status = self.message_status,
            active = self.active,
            created_at=self.created_at.isoformat(),
            modified_at=self.modified_at.isoformat(),
            childs = childs
        )

class Notification(BaseModel):

    company_key = ndb.KeyProperty(kind=Company, required=False)
    user_key = ndb.KeyProperty(kind=User, required=True)
    notification_text = ndb.StringProperty()
    notification_params = ndb.StringProperty()
    notification_status = ndb.StringProperty(default = "unread")
    notification_type = ndb.StringProperty()
    active = ndb.BooleanProperty(required=True, default=True)

    def save(self):
        action_type = AuditActionType.Created
        if self.key is not None:
            action_type = AuditActionType.Updated
        key = self.put()

        if key is not None:
            audit = Audit()
            audit.populate(
                entity_name=self.__class__.__name__,
                entity_key=key,
                action=action_type,
                user_email=users.get_current_user().email() if users.get_current_user() is not None else ''
            )
            audit.save()

        return self.get(key.urlsafe())

    @classmethod
    def get(cls, id):
        key = ndb.Key(urlsafe = id)
        if(key is not None):
            return key.get()
        return None

    @classmethod
    def get_all(cls, page, page_size, filters, sort):

        total = 0
        query = cls.query()
        entities = None

        '''Id'''
        if str(filters["id"]):
            query = query.filter(cls.key == ndb.Key(urlsafe = filters["id"]))

        '''Company'''
        if str(filters["company_key"]):
            query = query.filter(cls.company_key == ndb.Key(urlsafe = filters["company_key"]))

        '''User'''
        if str(filters["user_key"]):
            query = query.filter(cls.user_key == ndb.Key(urlsafe = filters["user_key"]))

        '''Notification Status'''
        if str(filters["notification_status"]):
            query = query.filter(cls.notification_status == filters["notification_status"])

        '''Notification Type'''
        if str(filters["notification_type"]):
            query = query.filter(cls.notification_type == filters["notification_type"])

        '''Active'''
        if (filters["active"] and str(filters["active"]) == "all"):
            pass
        elif filters["active"] and (json.loads(filters["active"]) == True or json.loads(filters["active"]) == False):
            query = query.filter(cls.active == json.loads(filters["active"]))
        else:
            query = query.filter(cls.active == True)

        '''Range of dates'''
        if(str(filters["start_date"]) and str(filters["end_date"])):
            sd = datetime.strptime(str(filters["start_date"]), "%m/%d/%Y")
            ed = datetime.strptime(str(filters["end_date"]), "%m/%d/%Y")
            ed = ed + timedelta(hours=23, minutes=59, seconds=59)
            query = query.filter(ndb.AND(cls.created_at >= sd, ndb.AND(cls.created_at <= ed)))

        '''Date'''
        if str(filters["date"]):
            sd = datetime.strptime(str(filters["date"]), "%m/%d/%Y")
            ed = datetime.strptime(str(filters["date"]), "%m/%d/%Y")
            ed = ed + timedelta(hours=23, minutes=59, seconds=59)
            query = query.filter(ndb.AND(cls.created_at >= sd, ndb.AND(cls.created_at <= ed)))

        '''Pagination'''
        if (not page or not page_size):
            if sort == 'asc':
                entities = query.order(cls.created_at).fetch()
            else:
                entities = query.order(-cls.created_at).fetch()
            total = len(entities)
        else:
            offset = int(page_size) * (int(page) - 1)
            limit = int(page_size)
            if sort == 'asc':
                entities = query.order(cls.created_at).fetch(offset=offset, limit=limit)
            else:
                entities = query.order(-cls.created_at).fetch(offset=offset, limit=limit)
            total = query.count()

        return entities, total

    def to_dict(self):
        return dict(
            id = self.key.urlsafe(),
            company_key = self.company_key.urlsafe() if self.company_key is not None else None,
            user_key = self.user_key.urlsafe() if self.user_key is not None else None,
            user = self.user_key.get().to_dict() if self.user_key is not None else None,
            notification_text = self.notification_text,
            notification_params = self.notification_params,
            notification_status = self.notification_status,
            notification_type = self.notification_type,
            active = self.active,
            created_at=self.created_at.isoformat(),
            modified_at=self.modified_at.isoformat()
        )

    def to_dict_optimized(self):
        return dict(
            id = self.key.urlsafe(),
            company_key = self.company_key.urlsafe() if self.company_key is not None else None,
            user_key = self.user_key.urlsafe() if self.user_key is not None else None,
            notification_text = self.notification_text,
            notification_params = self.notification_params,
            notification_status = self.notification_status,
            notification_type = self.notification_type,
            active = self.active,
            created_at=self.created_at.isoformat(),
            modified_at=self.modified_at.isoformat()
        )


class Attachment(BaseModel):
    created_at = ndb.DateTimeProperty(auto_now_add=True)
    created_by = ndb.UserProperty(auto_current_user_add=True)
    blob_key = ndb.BlobKeyProperty()

    def to_dict(self):
        blob_info = BlobInfo.get(self.blob_key)
        return dict(
            attachment_id=self.key.urlsafe(),
            blob_id=unicode(self.blob_key),
            created_at=self.created_at.isoformat(),
            created_by=self.created_by.email(),
            content_type=blob_info.content_type,
            filename=blob_info.filename,
            size=blob_info.size, )

class RoutePositionHistory(BaseModel):

    created_by = ndb.UserProperty(auto_current_user_add=True)
    modified_by = ndb.UserProperty(auto_current_user=True)
    route_key = ndb.KeyProperty(kind=Route, required=True)
    latitude = ndb.StringProperty()
    longitude = ndb.StringProperty()

    def save(self):
        action_type = AuditActionType.Created
        if self.key is not None:
            action_type = AuditActionType.Updated
        key = self.put()

        if key is not None:
            audit = Audit()
            audit.populate(
                entity_name=self.__class__.__name__,
                entity_key=key,
                action=action_type,
                user_email=users.get_current_user().email() if users.get_current_user() is not None else ''
            )
            audit.save()

        return self.get(key.urlsafe())

    @classmethod
    def get(cls, id):
        key = ndb.Key(urlsafe = id)
        if(key is not None):
            return key.get()
        return None

    @classmethod
    def get_all(cls, page, page_size, filters):

        total = 0
        query = cls.query()
        entities = None

        '''Id'''
        if str(filters["id"]):
            query = query.filter(cls.key == ndb.Key(urlsafe = filters["id"]))

        '''Route'''
        if str(filters["route_key"]):
            query = query.filter(cls.route_key == ndb.Key(urlsafe = filters["route_key"]))

        '''Pagination'''
        if (not page or not page_size):
            entities = query.order(-cls.created_at).fetch()
            total = len(entities)
        else:
            offset = int(page_size) * (int(page) - 1)
            limit = int(page_size)
            entities = query.order(-cls.created_at).fetch(offset=offset, limit=limit)
            total = query.count()

        return entities, total

    def to_dict(self):
        return dict(
            id = self.key.urlsafe(),
            route_key = self.route_key.urlsafe() if self.route_key is not None else None,
            latitude=self.latitude,
            longitude=self.longitude,
            created_by=self.created_by,
            created_at=self.created_at.isoformat(),
            modified_at=self.modified_at.isoformat(),
            modified_by=self.modified_by
        )


test_facility = Facility(id="test_facility",company_key = ndb.Key(Company,"test_company"),contact_name="forest schwartz",contact_phone="456-895-4865",facility_address = "1100 waterfall drive", latitude="33.1903204",longitude="-96.7147663",facility_zipcode="75070")

test_yard = Yard(id="test_yard",company_key = ndb.Key(Company,"test_company"),contact_name="marc segel",contact_phone="456-895-8569",yard_address = "3131 Bolton Rd", latitude="29.503460",longitude="-98.183840",yard_zipcode="78124")

test_user = User(id="test_user",email="test@gmail.com",password="check123",first_name="forest",last_name="schwartz",contact_phone_mobile="404-617-9402",contact_phone_desk="404-617-9402",verified=True,device_id="place_holder")

test_company = Company(id="test_company",active=True,address="9346 TX-106 Loop",name="South Texas 6-29")

test_userXcompany = UserXCompany(company=ndb.Key(Company,"test_company"),user=ndb.Key(User,"test_user"))

test_role = Role(parent=ndb.Key(User, "test_user"),name="ADMIN",user=ndb.Key(User, "test_user"))

test_site1 = Site(id ="test_site1",active=True,contact_name="Luis",contact_email = "lluisitu@gmail.com",customer_key = ndb.Key(Customer,"test_customer"),latitude = "29.352650",longitude = "-98.296510",site_address = "7173 FM1618",site_city = "San Antonio",site_name = "East Central High School",company_key = ndb.Key(Company,"test_company") )
test_site2 = Site(id ="test_site2",active=True,contact_name="Bill",contact_email = "bill@gmail.com",customer_key = ndb.Key(Customer,"test_customer"),latitude = "29.394150",longitude = "-98.281070",site_address = "2850 Stuart Rd",site_city = "Adkins",site_name = "Meals Made Easy",company_key = ndb.Key(Company,"test_company") )
test_site3 = Site(id ="test_site3",active=True,contact_name="John",contact_email = "john@gmail.com",customer_key = ndb.Key(Customer,"test_customer"),latitude = "29.532430",longitude = "-98.523190",site_address = "6915 West Ave",site_city = "Castle Hills,",site_name = "CVS",company_key = ndb.Key(Company,"test_company") )
test_site4 = Site(id ="test_site4",active=True,contact_name="Franky",contact_email = "franky@gmail.com",customer_key = ndb.Key(Customer,"test_customer"),latitude = "29.235220",longitude = "-98.659860",site_address = "15204 E Loop 1604 S",site_city = "San Antonio",site_name = "Terror Land",company_key = ndb.Key(Company,"test_company") )

test_so1 = ServiceOrder(id ="test_so1",active=True,asset_size= AssetSize(4),customer_key=ndb.Key(Customer,"test_customer"),purpose_of_service=PurposeOfService(2),site_key=ndb.Key(Site,'test_site1'),company_key = ndb.Key(Company,"test_company"))
test_so2 = ServiceOrder(id="test_so2",active=True,asset_size=AssetSize(2),customer_key=ndb.Key(Customer,"test_customer"),purpose_of_service=PurposeOfService(3),site_key=ndb.Key(Site,'test_site2'),company_key = ndb.Key(Company,"test_company"))
test_so3 = ServiceOrder(id="test_so3",active=True,asset_size=AssetSize(3),customer_key=ndb.Key(Customer,"test_customer"),purpose_of_service=PurposeOfService(1),site_key=ndb.Key(Site,'test_site3'),company_key = ndb.Key(Company,"test_company"))
test_so4 = ServiceOrder(id="test_so4",active=True,asset_size=AssetSize(2),customer_key=ndb.Key(Customer,"test_customer"),purpose_of_service=PurposeOfService(2),site_key=ndb.Key(Site,'test_site4'),company_key = ndb.Key(Company,"test_company"))

test_customer = Customer(id = "test_customer",company_key = ndb.Key(Company,"test_company"),contact_email = "f.schwartz@txdumpsers.com",customer_name = "john ranquist",contact_phone="404-295-8469")

test_driver1 = Driver(id="test_driver1",company_key = ndb.Key(Company,"test_company"),driver_email="driver1@gmail.com",driver_id="123",driver_name="Saber Tooth",driver_phone="486-984-5135")
test_driver2 = Driver(id="test_driver2",company_key = ndb.Key(Company,"test_company"),driver_email="driver2@gmail.com",driver_id="456",driver_name="Professor X",driver_phone="486-984-7777")

test_route1 = Route(id="test_route1",company_key =  ndb.Key(Company,"test_company"),driver_key = ndb.Key(Driver,"test_driver1"),notes="all routes going good", status = RouteStatus(1),date = datetime.today())
test_route2 = Route(id="test_route2",company_key =  ndb.Key(Company,"test_company"),driver_key = ndb.Key(Driver,"test_driver2"),notes="", status = RouteStatus(1),date = datetime.today())

test_route_item1 = RouteItem(id="test_route_item1",dist_2_next=12.5,time_2_next=0.25,entity_type="facility",item_key="test_facility",route_key = ndb.Key(Route,"test_route1"))
test_route_item2 = RouteItem(id="test_route_item2",dist_2_next=3.0,time_2_next=0.1,entity_type="serviceorder",item_key="test_so3",route_key = ndb.Key(Route,"test_route1"))
test_route_item3 = RouteItem(id="test_route_item3",dist_2_next=30,time_2_next=0.5,entity_type="serviceorder",item_key="test_so4",route_key = ndb.Key(Route,"test_route1"))
test_route_item4 = RouteItem(id="test_route_item4",dist_2_next=16.25,time_2_next=0.18,entity_type="yard",item_key="test_yard",route_key = ndb.Key(Route,"test_route1"))
test_route_item5 = RouteItem(id="test_route_item5",dist_2_next=36,time_2_next=0.6,entity_type="facility",item_key="test_facility",route_key = ndb.Key(Route,"test_route1"))

test_route_item6 = RouteItem(id="test_route_item6",dist_2_next=11.2,time_2_next=0.15,entity_type="facility",item_key="test_facility",route_key = ndb.Key(Route,"test_route2"))
test_route_item7 = RouteItem(id="test_route_item7",dist_2_next=45,time_2_next=0.75,entity_type="serviceorder",item_key="test_so2",route_key = ndb.Key(Route,"test_route2"))
test_route_item8 = RouteItem(id="test_route_item8",dist_2_next=14.3,time_2_next=0.118,entity_type="yard",item_key="test_yard",route_key = ndb.Key(Route,"test_route2"))
test_route_item9 = RouteItem(id="test_route_item9",dist_2_next=36,time_2_next=0.45,entity_type="serviceorder",item_key="test_so1",route_key = ndb.Key(Route,"test_route2"))
test_route_item10 = RouteItem(id="test_route_item10",dist_2_next=13.1,time_2_next=0.12,entity_type="yard",item_key="test_yard",route_key = ndb.Key(Route,"test_route2"))
test_route_item11 = RouteItem(id="test_route_item11",dist_2_next=18,time_2_next=0.23,entity_type="facility",item_key="test_facility",route_key = ndb.Key(Route,"test_route2"))


test_facility.put()

test_yard.put()

test_user.put()

test_company.put()

test_userXcompany.put()

test_role.put()

test_so1.put()
test_so2.put()
test_so3.put()
test_so4.put()

test_site1.put()
test_site2.put()
test_site3.put()
test_site4.put()

test_customer.put()

test_driver1.put()
test_driver2.put()

test_route1.put()
test_route2.put()

test_route_item1.put()
test_route_item2.put()
test_route_item3.put()
test_route_item4.put()
test_route_item5.put()
test_route_item6.put()
test_route_item7.put()
test_route_item8.put()
test_route_item9.put()
test_route_item10.put()
test_route_item11.put()
