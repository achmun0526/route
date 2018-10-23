# [START imports]
import endpoints
import logging
import json
import functools
import config

from datetime import datetime, timedelta
from protorpc import messages
from protorpc import message_types
from protorpc import remote
from google.appengine.ext import ndb
# [END imports]

SUCCESS='SUCCESS'
FAIL='FAIL'

logger = logging.getLogger()

# [START messages]

# Validation API
class GeneralField(messages.Field):
    """
    Allow for normal non-Message objects to be serialised to JSON.
    This allows for variable result objects or dictionaries to be returned (Note: these objects must be Json serialisable).
    """
    VARIANTS = frozenset([messages.Variant.MESSAGE])

    DEFAULT_VARIANT = messages.Variant.MESSAGE

    def __init__(self,
                             number,
                             required=False,
                             repeated=False,
                             variant=None):
        """Constructor.

        Args:
            number: Number of field.  Must be unique per message class.
            required: Whether or not field is required.  Mutually exclusive to
                'repeated'.
            repeated: Whether or not field is repeated.  Mutually exclusive to
                'required'.
            variant: Wire-format variant hint.

        Raises:
            FieldDefinitionError when invalid message_type is provided.
        """
        super(GeneralField, self).__init__(number,
                                                                             required=required,
                                                                             repeated=repeated,
                                                                             variant=variant)

    def __set__(self, message_instance, value):
        """Set value on message.

        Args:
            message_instance: Message instance to set value on.
            value: Value to set on message.
        """        
        
        if isinstance(value, dict):                        
            if len(value) > 0:                
                self.type = type(value)
            else:
                self.type = type(self)         
        else:            
            self.type = type(value)
        self.__initialized = True

        super(GeneralField, self).__set__(message_instance, value)

    def __setattr__(self, name, value):
        """Setter overidden to allow assignment to fields after creation.

        Args:
            name: Name of attribute to set.
            value: Value to assign.
        """
        object.__setattr__(self, name, value)

    def value_from_message(self, message):
        """Convert a message to a value instance.

        Used by deserializers to convert from underlying messages to
        value of expected user type.

        Args:
            message: A message instance of type self.message_type.

        Returns:
            Value of self.message_type.
        """
        return message

    def value_to_message(self, value):
        """Convert a value instance to a message.

        Used by serializers to convert Python user types to underlying
        messages for transmission.

        Args:
            value: A value of type self.type.

        Returns:
            An instance of type self.message_type.
        """
        return value

class GetRequest(messages.Message): 

    #Pagination
    page = messages.StringField(1, required=False, default="")
    page_size = messages.StringField(2, required=False, default="")

    #options
    no_childs = messages.StringField(3, required=False, default="")

    #sort
    sort = messages.StringField(4, required=False, default="")

    #Filters
    id = messages.StringField(5, required=False, default="")
    name = messages.StringField(6, required=False, default="")
    active = messages.StringField(7, required=False, default="")
    route_key = messages.StringField(8, required=False, default="")
    driver_key = messages.StringField(9, required=False, default="")
    vehicle_key = messages.StringField(10, required=False, default="")
    company_key = messages.StringField(11, required=False, default="")
    start_date = messages.StringField(12, required=False, default="")
    end_date = messages.StringField(13, required=False, default="")
    status = messages.StringField(14, required=False, default="")
    sender_user_key = messages.StringField(15, required=False, default="")
    receiver_user_key = messages.StringField(16, required=False, default="")
    parent_message_key = messages.StringField(17, required=False, default="")
    date = messages.StringField(18, required=False, default="")
    entity_key = messages.StringField(19, required=False, default="")
    email = messages.StringField(20, required=False, default="")
    activated = messages.StringField(21, required=False, default="")
    roles = messages.StringField(22, required=False, default="")
    service_order_key = messages.StringField(23, required=False, default="")
    state = messages.StringField(24, required=False, default="")
    

class PostRequest(messages.Message):    
    payload = GeneralField(1)

class Response(messages.Message):    
    status = messages.StringField(1)
    response = GeneralField(2)

# End Validation API

# [END messages]

# [START auth_config]
WEB_CLIENT_ID = config.WEB_CLIENT_ID
ANDROID_CLIENT_ID = config.ANDROID_CLIENT_ID
IOS_CLIENT_ID = config.IOS_CLIENT_ID

ANDROID_AUDIENCE = WEB_CLIENT_ID

ALLOWED_CLIENT_IDS = [
    WEB_CLIENT_ID, ANDROID_CLIENT_ID, IOS_CLIENT_ID,
    endpoints.API_EXPLORER_CLIENT_ID]
# [END auth_config]

# [START multiclass]
api_collection = endpoints.api(
    name='texas_dumpsters_api', 
    version='v1.0',
    api_key_required=True,     
    allowed_client_ids=ALLOWED_CLIENT_IDS,
    audiences=[WEB_CLIENT_ID, ANDROID_AUDIENCE, IOS_CLIENT_ID],
    scopes=[endpoints.EMAIL_SCOPE],
    auth_level=endpoints.AUTH_LEVEL.REQUIRED)

@api_collection.api_class(
    resource_name='echo1', 
    path='echo1')
class Echo1(remote.Service):

    @endpoints.method(message_types.VoidMessage, Response, path='say_a_number', http_method='GET')
    def say_a_number(self, request):
        try:
            import random
            number = random.randint(0, 100)
            return Response(
                status=SUCCESS,
                response=number
            )
        except Exception, e:
            errors = str(e)
            return Response(status=FAIL, response=errors)

@api_collection.api_class(
    resource_name='echo2', 
    path='echo2')
class Echo2(remote.Service):

    @endpoints.method(message_types.VoidMessage, Response, path='say_a_negative_number', http_method='GET')
    def say_a_negative_number(self, request):
        try:
            import random
            number = random.randint(0, 100) * -1  
            return Response(
                status=SUCCESS,
                response=number
            )
        except Exception, e:
            errors = str(e)
            return Response(status=FAIL, response=errors)
            


@api_collection.api_class(
    resource_name='echo3', 
    path='echo3')
class Echo3(remote.Service):
    
    @endpoints.method(message_types.VoidMessage, Response, path='who_i_am', http_method='GET')
    def who_i_am(self, request):

        '''Authorization'''
        if config.VALID_AUTHENTICATION == True:
            user = endpoints.get_current_user()
            if user is None:        
                raise endpoints.UnauthorizedException

        try:                     
            user_name = user.email()
            return Response(
                status=SUCCESS,
                response='Hello, {}'.format(user_name)
            )
        except Exception, e:
            errors = str(e)
            return Response(status=FAIL, response=errors)

@api_collection.api_class(resource_name='validation', path='validation')
class Validation(remote.Service):

    '''It gets the info the user associated to a specific email'''
    @endpoints.method(PostRequest, Response, path='get_user_by_email', http_method='post')
    def get_user_by_email(self, request):

        '''Authorization'''
        if config.VALID_AUTHENTICATION == True:
            user = endpoints.get_current_user()
            if user is None:        
                raise endpoints.UnauthorizedException

        try:
            data = request.payload 

            from services import UserService
            user = UserService.UserInstance.get_by_email(data.get("email"))
            
            if user is None:
                raise ValueError("User not found")

            roles = user.get_roles()

            is_driver = False

            for role in roles:
                if role.name == "DRIVER":
                    is_driver = True
                    break

            if is_driver == False:
                raise ValueError("User is not a Driver")
            
            return Response(
                status=SUCCESS,
                response=user.to_dict()
            )            
        except Exception, e:
            errors = str(e)
            return Response(status=FAIL, response=errors)

@api_collection.api_class(resource_name='users', path='users')
class Users(remote.Service):
    
    '''It gets the routes associated to one driver'''
    @endpoints.method(GetRequest, Response, path='get', http_method='get')
    def get(self, request):

        '''Authorization'''
        if config.VALID_AUTHENTICATION == True:
            user = endpoints.get_current_user()
            if user is None:        
                raise endpoints.UnauthorizedException

        try:          
            from models import User
            from models import Role
            from models import UserXCompany
            from models import Company

            #Pagination
            page = request.page
            page_size = request.page_size

            #Filters
            filters = {}
            filters["activated"] = request.activated

            email = request.email
            roles_joined = request.roles
            company = request.company_key

            @ndb.tasklet
            def callback(user):
                roles = yield Role.query(ancestor=user.key).fetch_async()
                userXcompany = UserXCompany.query(UserXCompany.user==user.key).get()
                if(userXcompany is not None):
                    company = Company.query(Company.key == userXcompany.company).get()
                    if company is not None:
                        user._company = company.to_dict()
                user._roles = roles

                raise ndb.Return(user)

            qo = ndb.QueryOptions(limit=100)

            all_users = []
            total = 0

            qry = User.query()

            '''Role'''
            if roles_joined:
                all_users = User.get_by_roles(roles_joined.upper())
                keys = []
                for user in all_users:
                    keys.append(user.key)

                if not keys:
                    qry = qry.filter(User.email == None)
                else:
                    qry = qry.filter(User.key.IN(keys))
            
            '''Email'''
            if email:
                qry = qry.filter(User.email==email)

            '''Company'''
            if company:
                users_by_company = UserXCompany.get_all_by_company(company)
                users_ids = []
                for x in users_by_company:
                    users_ids.append(x.user)
                if len(users_ids) > 0:
                    qry = qry.filter(User.key.IN(users_ids))               
                else:
                    qry = qry.filter(User.email == None)                        
            
            '''Active'''       
            if (filters["activated"] and str(filters["activated"]) == "all"):
                pass
            elif filters["activated"] and (json.loads(filters["activated"]) == True or json.loads(filters["activated"]) == False):
                qry = qry.filter(User.activated == json.loads(filters["activated"]))
            else:
                qry = qry.filter(User.activated == True)

            if (not page or not page_size):
                all_users = qry.order(-User.created_at).fetch()
                total = len(all_users)
            else:
                offset = int(page_size) * (int(page) - 1)
                limit = int(page_size)
                all_users = qry.order(-User.created_at).fetch(offset=offset, limit=limit)
                total = qry.count()
            
            response = {
                "total":  total,
                "records":  json.loads(json.dumps([u.to_dict() for u in all_users]))
            } 

            return Response(
                status=SUCCESS,
                response=response
            ) 

        except Exception, e:
            errors = str(e)
            return Response(status=FAIL, response=errors)               

@api_collection.api_class(resource_name='list', path='list')
class List(remote.Service):

    '''It gets the list specified by name'''
    @endpoints.method(GetRequest, Response, path='get_by_name', http_method='get')
    def get_by_name(self, request):

        '''Authorization'''
        if config.VALID_AUTHENTICATION == True:
            user = endpoints.get_current_user()
            if user is None:        
                raise endpoints.UnauthorizedException

        try:                       
            from services import ListsService

            response = ListsService.ListsInstance.get_by_name(request.name)
     
            return Response(
                status=SUCCESS,
                response=response
            )            

        except Exception, e:
            errors = str(e)
            return Response(status=FAIL, response=errors)

@api_collection.api_class(resource_name='route', path='route')
class Route(remote.Service): 

    '''It gets the routes associated to one driver'''
    @endpoints.method(GetRequest, Response, path='get', http_method='get')
    def get(self, request):

        '''Authorization'''
        if config.VALID_AUTHENTICATION == True:
            user = endpoints.get_current_user()
            if user is None:        
                raise endpoints.UnauthorizedException

        try:                       
            from services import RouteService
            from models import Route

            #Pagination
            page = request.page
            page_size = request.page_size
  
             #Filters
            filters = {}
            filters["active"] = request.active
            filters["route_key"] = request.route_key
            filters["vehicle_key"] = request.vehicle_key
            filters["company_key"] = request.company_key
            filters["driver_key"] = request.driver_key
            filters["start_date"] = request.start_date
            filters["end_date"] = request.end_date
            filters["status"] = request.status

            entities, total = RouteService.RouteInstance.get_all(page, page_size, filters)

            response = {
                "total":  total,
                "records":
                  json.loads(json.dumps([entity.to_dict() for entity in entities]))
            }            

            return Response(
                status=SUCCESS,
                response=response
            )    
        except Exception, e:
            errors = str(e)
            return Response(status=FAIL, response=errors)

    '''Change the status of the specific route'''
    @endpoints.method(PostRequest, Response, path='change_status', http_method='post')
    def change_status(self, request):

        '''Authorization'''
        if config.VALID_AUTHENTICATION == True:
            user = endpoints.get_current_user()
            if user is None:        
                raise endpoints.UnauthorizedException

        try:            
            data = request.payload             

            from services import RouteService
            from models import Route, RouteStatus

            route_key = data.get("route_key")
            new_status = int(data.get("new_status"))
                       
            route = RouteService.RouteInstance.change_status(route_key, new_status)
            
            return Response(
                status=SUCCESS,
                response=route.to_dict()
            )                  
        except Exception, e:
            errors = str(e)
            return Response(status=FAIL, response=errors)

    @api_collection.api_class(resource_name='route_incident', path='route_incident')
    class RouteIncident(remote.Service):

        '''Saves a new route incident'''
        @endpoints.method(PostRequest, Response, path='save', http_method='post')
        def save(self, request):

            created_by = ''

            '''Authorization'''
            if config.VALID_AUTHENTICATION == True:
                user = endpoints.get_current_user()
                if user is None:        
                    raise endpoints.UnauthorizedException
                else:
                    created_by = user.email()

            try:            
                data = request.payload               

                from services import RouteIncidentService
                from models import RouteIncident, RouteIncidentStatus, RouteIncidentType

                id=data.get('id') 
                driver_key=data.get('driver_key')
                route_key=data.get('route_key')
                incident_type=data.get("incident_type")
                status=data.get("status")
                incident_notes=data.get("incident_notes")
                report_datetime=data.get("report_datetime")

                route_incident = RouteIncident()

                route_incident.populate(
                    created_by = created_by,
                    driver_key=ndb.Key(urlsafe=driver_key),
                    route_key=ndb.Key(urlsafe=route_key),                       
                    incident_notes=incident_notes,
                    report_datetime=datetime.strptime(report_datetime, "%m/%d/%Y %H:%M")
                )

                if status is None:
                    route_incident.status = RouteIncidentStatus.Reported
                else:
                    route_incident.status = RouteIncidentStatus(int(status))

                if incident_type is not None:                
                    route_incident.incident_type = RouteIncidentType(int(incident_type))

                if id is not None:
                    route_incident.key = ndb.Key(urlsafe=id)                                 

                route_incident = RouteIncidentService.RouteIncidentInstance.save(route_incident)
                
                return Response(
                    status=SUCCESS,
                    response=route_incident.to_dict()
                )                  

            except Exception, e:
                errors = str(e)
                return Response(status=FAIL, response=errors)

        '''It gets the routes incidents'''
        @endpoints.method(GetRequest, Response, path='get', http_method='get')
        def get(self, request):

            '''Authorization'''
            if config.VALID_AUTHENTICATION == True:
                user = endpoints.get_current_user()
                if user is None:        
                    raise endpoints.UnauthorizedException

            try:                 
                from services import RouteIncidentService
                
                #Pagination
                page = request.page
                page_size = request.page_size

                #Filters
                filters = {}
                filters["id"] = request.id
                filters["route_key"] = request.route_key
                filters["driver_key"] = request.driver_key
                filters["start_date"] = request.start_date
                filters["end_date"] = request.end_date
                
                entities, total = RouteIncidentService.RouteIncidentInstance.get_all(page, page_size, filters)

                response = {
                    "total":  total,
                    "records":  json.loads(json.dumps([entity.to_dict() for entity in entities]))
                }

                return Response(
                    status=SUCCESS,
                    response=response
                )    
            except Exception, e:
                errors = str(e)
                return Response(status=FAIL, response=errors)  

        '''Change the status of the specific route incident'''
        @endpoints.method(PostRequest, Response, path='change_status', http_method='post')
        def change_status(self, request):

            '''Authorization'''
            if config.VALID_AUTHENTICATION == True:
                user = endpoints.get_current_user()
                if user is None:        
                    raise endpoints.UnauthorizedException
            try:                         
                data = request.payload                            
                from services import RouteIncidentService
                from models import RouteIncident, RouteIncidentStatus
                route_incident = RouteIncidentService.RouteIncidentInstance.get(data.get("route_incident_key"))
                if route_incident is None:
                    raise ValueError("Route Incident not found")                            
                route_incident.status = RouteIncidentStatus(int(data.get("new_status")))
                route_incident = RouteIncidentService.RouteIncidentInstance.save(route_incident)
                return Response(
                    status=SUCCESS,
                    response=route_incident.to_dict()
                )                  
            except Exception, e:
                errors = str(e)
                return Response(status=FAIL, response=errors)

    @api_collection.api_class(resource_name='message', path='message')
    class Message(remote.Service):

        '''Saves a new route incident'''
        @endpoints.method(PostRequest, Response, path='save', http_method='post')
        def save(self, request):

            '''Authorization'''
            if config.VALID_AUTHENTICATION == True:
                user = endpoints.get_current_user()
                if user is None:        
                    raise endpoints.UnauthorizedException
            try:
                data = request.payload                            

                from services import MessageService
                from models import Message

                id = data.get('id')
                company_key = data.get('company_key')
                parent_message_key = data.get('parent_message_key')
                sender_user_key = data.get('sender_user_key')
                receiver_user_key = data.get('receiver_user_key')     
                message_type = data.get('message_type')    
                message_title = data.get('message_title')    
                message_body = data.get('message_body')   
                message_status = data.get('message_status')                                

                message = Message()

                message.populate(
                    company_key=ndb.Key(urlsafe=company_key),
                    parent_message_key=ndb.Key(urlsafe=parent_message_key) if parent_message_key is not None else None,
                    sender_user_key=ndb.Key(urlsafe=sender_user_key),
                    receiver_user_key=ndb.Key(urlsafe=receiver_user_key),
                    message_type=message_type,
                    message_title=message_title,
                    message_body=message_body,
                    message_status=message_status
                )

                if message.sender_user_key == message.receiver_user_key:
                    raise ValueError("Are you trying to send a message to yourself?")

                if id is not None:
                    message.key = ndb.Key(urlsafe=id)                     

                message = MessageService.MessageInstance.save(message)      

                return Response(
                    status=SUCCESS,
                    response=message.to_dict()
                )   

            except Exception, e:
                errors = str(e)
                return Response(status=FAIL, response=errors)
    
        @endpoints.method(GetRequest, Response, path='get', http_method='get')
        def get(self, request):

            '''Authorization'''
            if config.VALID_AUTHENTICATION == True:
                user = endpoints.get_current_user()
                if user is None:        
                    raise endpoints.UnauthorizedException

            try:                
                from services import MessageService
                from models import Message

                #Pagination
                page = request.page
                page_size = request.page_size

                #Filters
                filters = {}
                filters["id"] = request.id
                filters["company_key"] = request.company_key
                filters["sender_user_key"] = request.sender_user_key
                filters["receiver_user_key"] = request.receiver_user_key
                filters["active"] = request.active
                filters["date"] = request.date
                filters["start_date"] = request.start_date
                filters["end_date"] = request.end_date
                filters["parent_message_key"] = request.parent_message_key
                
                #options
                options = {}
                options["no-childs"] = request.no_childs

                #Sort
                sort = request.sort
            
                entities, total = MessageService.MessageInstance.get_all(page, page_size, filters, sort)            

                response = {
                    "total":  total,
                    "records":  json.loads(json.dumps([entity.to_dict_with_childs(options) for entity in entities]))
                }

                return Response(
                    status=SUCCESS,
                    response=response
                )   

            except Exception, e:
                errors = str(e)
                return Response(status=FAIL, response=errors)

    @api_collection.api_class(resource_name='attachment', path='attachment')
    class Attachment(remote.Service):

        '''Upload a new file'''
        @endpoints.method(PostRequest, Response, path='upload', http_method='post')
        def upload(self, request):

            '''Authorization'''
            if config.VALID_AUTHENTICATION == True:
                user = endpoints.get_current_user()
                if user is None:        
                    raise endpoints.UnauthorizedException

            try:
                from helpers import Attachments

                data = request.payload                
                
                file_name = data.get("file_name")  
                file_data = data.get("file_data")  
                content_type = data.get("content_type")  
                entity_key = data.get("entity_key")             

                response = Attachments.AttachmentsHelper.upload(file_name, file_data, content_type, entity_key)

                return Response(
                    status=SUCCESS,
                    response=response
                )   
            except Exception, e:
                errors = str(e)
                return Response(status=FAIL, response=errors)
        
        '''Get a list of atachaments by entity key'''
        @endpoints.method(GetRequest, Response, path='get', http_method='get')
        def get(self, request):

            '''Authorization'''
            if config.VALID_AUTHENTICATION == True:
                user = endpoints.get_current_user()
                if user is None:        
                    raise endpoints.UnauthorizedException

            try:            
                from helpers import Attachments
                               
                entity_key = request.entity_key

                list = Attachments.AttachmentsHelper.get_attachments_by_entity_key(entity_key)
                
                response = json.loads(json.dumps(list))

                return Response(
                    status=SUCCESS,
                    response=response
                )   
            except Exception, e:
                errors = str(e)
                return Response(status=FAIL, response=errors)

    @api_collection.api_class(resource_name='route_position_history', path='route_position_history')
    class RoutePositionHistory(remote.Service):

        '''Saves a new route position history'''
        @endpoints.method(PostRequest, Response, path='save', http_method='post')
        def save(self, request):

            '''Authorization'''
            if config.VALID_AUTHENTICATION == True:
                user = endpoints.get_current_user()
                if user is None:        
                    raise endpoints.UnauthorizedException

            try:

                data = request.payload   
                
                from services import RoutePositionHistoryService
                from models import RoutePositionHistory

                id = data.get('id')            
                route_key = data.get('route_key')
                latitude = data.get("latitude")
                longitude = data.get("longitude")            

                route_position_history = RoutePositionHistory()

                route_position_history.populate(                
                    route_key=ndb.Key(urlsafe=route_key),
                    latitude=latitude,             
                    longitude=longitude
                )
                        
                if id is not None:
                    route_position_history.key = ndb.Key(urlsafe=id)                     

                route_position_history = RoutePositionHistoryService.RoutePositionHistoryInstance.save(route_position_history)

                return Response(
                    status=SUCCESS,
                    response=route_position_history.to_dict()
                )   

            except Exception, e:
                errors = str(e)
                return Response(status=FAIL, response=errors)

    @api_collection.api_class(resource_name='service_order', path='service_order')
    class ServiceOrder(remote.Service):

        '''Change the status of the specific service order'''
        @endpoints.method(PostRequest, Response, path='change_status', http_method='post')
        def change_status(self, request):

            '''Authorization'''
            if config.VALID_AUTHENTICATION == True:
                user = endpoints.get_current_user()
                if user is None:        
                    raise endpoints.UnauthorizedException

            try:            
                data = request.payload             

                from services import ServiceOrderService
                from models import ServiceOrder
                
                service_order_key = data.get("service_order_key")
                new_status = int(data.get("new_status"))
                finalized_notes = data.get("finalized_notes")
                finalized_datetime = data.get("finalized_datetime")                
                service_order_problem = data.get("service_order_problem")
                failure_reason = data.get("failure_reason")
               
                service_order = ServiceOrderService.ServiceOrderInstance.change_status(service_order_key, new_status, finalized_notes, finalized_datetime, service_order_problem, failure_reason)
             
                return Response(
                    status=SUCCESS,
                    response=service_order.to_dict()
                )                  
            except Exception, e:
                errors = str(e)
                return Response(status=FAIL, response=errors)

    @api_collection.api_class(resource_name='service_order_problem', path='service_order_problem')
    class ServiceOrderProblem(remote.Service):
        
        @endpoints.method(GetRequest, Response, path='get', http_method='get')
        def get(self, request):

            '''Authorization'''
            if config.VALID_AUTHENTICATION == True:
                user = endpoints.get_current_user()
                if user is None:        
                    raise endpoints.UnauthorizedException
                
            try:                
                from services import ServiceOrderProblemService
                from models import ServiceOrderProblem

                #Pagination
                page = request.page
                page_size = request.page_size

                #Filters
                filters = {}
                filters["id"] = request.id
                filters["service_order_key"] = request.service_order_key
                filters["state"] = request.state
            
                entities, total = ServiceOrderProblemService.ServiceOrderProblemInstance.get_all(page, page_size, filters)

                response = {
                    "total":  total,
                    "records":  json.loads(json.dumps([entity.to_dict() for entity in entities]))
                }

                return Response(
                    status=SUCCESS,
                    response=response
                )   

            except Exception, e:
                errors = str(e)
                return Response(status=FAIL, response=errors)
        
        '''Change the status of the specific service order'''
        @endpoints.method(PostRequest, Response, path='change_status', http_method='post')
        def change_status(self, request):

            '''Authorization'''
            if config.VALID_AUTHENTICATION == True:
                user = endpoints.get_current_user()
                if user is None:        
                    raise endpoints.UnauthorizedException

            try:            
                from services import ServiceOrderProblemService
                
                data = request.payload             

                service_order_problem_key = data.get("service_order_problem_key")
                new_status = int(data.get("new_status"))
            
                service_order_problem = ServiceOrderProblemService.ServiceOrderProblemInstance.change_status(service_order_problem_key, new_status)
             
                return Response(
                    status=SUCCESS,
                    response=service_order_problem.to_dict()
                )                  
            except Exception, e:
                errors = str(e)
                return Response(status=FAIL, response=errors)
# [END multiclass]