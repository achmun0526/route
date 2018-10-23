import config
import logging

from datetime import datetime
from models import User, Message, Route, RouteIncident, Notification, Audit
from services import AuditService
from google.appengine.ext import ndb
from helpers import Notifier

logger = logging.getLogger()

class RouteIncidentInstance:

    @staticmethod
    def save(entity):

        if entity.key is None:
            entity = RouteIncident.save(entity)
        else:

            current = RouteIncident.get(entity.key.urlsafe())
            if current is not None:
                # current.route_key = entity.route_key
                # current.driver_key = entity.driver_key
                # current.incident_type = entity.incident_type
                # current.status = entity.status
                # current.incident_notes = entity.incident_notes
                entity = RouteIncident.save(entity)
            else:
                raise ValueError("Route Incident does not exists")


        # csr_users = User.get_by_roles_and_company("OFFICE ADMIN-CSR",  entity.route_key.get().company_key)
        #
        # sender = config.NOREPLY_EMAIL
        #
        # try:
        #     route = entity.route_key.get()
        #     if route is not None:
        #         dispatcher_email = route.created_by
        #         if dispatcher_email is not None:
        #             dispatcher = User.get_by_email(dispatcher_email)
        #             if dispatcher is not None:
        #
        #                 subject = ""
        #                 body = ""
        #
        #                 if is_new == True:
        #                     subject = "new incident"
        #                     body = "The user %s has reported and incident on the system" % (entity.created_by)
        #                 else:
        #                     subject = "incident update"
        #                     body = "The user %s has made an update on incident: %s " % (entity.created_by, entity.key.urlsafe())
        #
        #                 '''1. Send internal message and email to creator of the route'''
        #                 Notifier.InternalMessageAndEmailHelper.send_internal_message(route.company_key, entity.driver_key, dispatcher.key, subject, body)
        #                 Notifier.InternalMessageAndEmailHelper.send_email(sender, dispatcher_email, subject, body)
        #
        #                 '''2. Send internal message and email to csr users'''
        #                 for user in csr_users:
        #                     Notifier.InternalMessageAndEmailHelper.send_internal_message(route.company_key, entity.driver_key, user.key, subject, body)
        #                     Notifier.InternalMessageAndEmailHelper.send_email(sender, user.email, subject, body)
        #
        #
        # except Exception, e:
        #     errors = [str(e)]
        #     message = "Error sending notification about route incident. Sender %s" % sender
        #     audit = Audit()
        #     audit.populate(
        #         user_email='',
        #         error=str(e),
        #         message=message
        #     )
        #     AuditService.AuditInstance.save(audit)

        return entity

    @staticmethod
    def get(id):
        return RouteIncident.get(id)

    @staticmethod
    def get_all(page, page_size, filters):
        return RouteIncident.get_all(page, page_size, filters)

    @staticmethod
    def delete(id):
        entity = RouteIncident.get(id)
        if(entity is None):
            raise ValueError("Incident does not exists")
        else:
            # entity.active = False
            # RouteIncident.save(entity)
            entity.key.delete()
