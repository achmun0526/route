import config
import logging

from models import User, ServiceOrderProblem, ServiceOrder, ServiceOrderProblemState, ServiceOrderState, Notification, Audit, RouteItem
from services import AuditService
from helpers import Notifier
from google.appengine.ext import ndb
from google.appengine.api import app_identity
from google.appengine.api import users

logger = logging.getLogger()

class ServiceOrderProblemInstance:

    @staticmethod
    def save(entity):        
        
        is_new = True        

        if entity.key is None:
            entity = ServiceOrderProblem.save(entity)
        else:
            is_new = False
            current = ServiceOrderProblem.get(entity.key.urlsafe())
            if current is not None:                
                current.state = entity.state                
                entity = ServiceOrderProblem.save(entity)
            else:
                raise ValueError("Service order problem does not exists")        
                
        csr_users = User.get_by_roles_and_company("OFFICE ADMIN-CSR",  entity.service_order_key.get().customer_key.get().company_key)                
    
        sender = config.NOREPLY_EMAIL

        try:          
            route_item = RouteItem.get_by_entity_key(entity.service_order_key)        
            if route_item is not None:            
                route = route_item.route_key.get()                    
                if route is not None:
                    dispatcher_email = route.created_by
                    if dispatcher_email is not None:
                        dispatcher = User.get_by_email(dispatcher_email)                
                        if dispatcher is not None:

                            subject = ""
                            body = ""

                            if is_new == True:
                                subject = "new problem"
                                body = "The user %s has reported and problem on the system" % (entity.created_by)
                            else:
                                subject = "problem update"
                                body = "The user %s has made an update on problem: %s " % (entity.created_by, entity.key.urlsafe())

                            '''1. Send internal message and email to creator of the route'''
                            Notifier.InternalMessageAndEmailHelper.send_internal_message(route.company_key, entity.driver_key, dispatcher.key, subject, body)
                            Notifier.InternalMessageAndEmailHelper.send_email(sender, dispatcher_email, subject, body)

                            '''2. Send internal message and email to csr users'''
                            for user in csr_users:
                                Notifier.InternalMessageAndEmailHelper.send_internal_message(route.company_key, entity.driver_key, user.key, subject, body)
                                Notifier.InternalMessageAndEmailHelper.send_email(sender, user.email, subject, body)
                        
        except Exception, e:
            errors = [str(e)] 
            message = "Error sending notification about route incident. Sender %s" % sender
            audit = Audit()
            audit.populate(                
                user_email='',
                error=str(e),
                message=message
            )
            AuditService.AuditInstance.save(audit)
                        
        return entity  

    @staticmethod
    def get(id):
        return ServiceOrderProblem.get(id)

    @staticmethod
    def get_all(page, page_size, filters):
        return ServiceOrderProblem.get_all(page, page_size, filters)

    @staticmethod 
    def change_status(service_order_problem_key, new_status):

        current = ServiceOrderProblem.get(service_order_problem_key)

        if current is not None:
            service_order = current.service_order_key.get()

            if (new_status == int(ServiceOrderProblemState.Resolved)):
                service_order.state = ServiceOrderState.Assigned
                ServiceOrder.save(service_order)

            if (new_status == int(ServiceOrderProblemState.NotResolved)):
                service_order.state = ServiceOrderState.Failed
                ServiceOrder.save(service_order)

            current.state = ServiceOrderProblemState(new_status)
            return ServiceOrderProblem.save(current)

        else:
            raise ValueError("Service order problem does not exists")    