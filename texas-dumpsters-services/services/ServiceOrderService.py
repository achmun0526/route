import config
import logging
import json
from google.appengine.ext import ndb
from google.appengine.api import users
from models import ServiceOrder, ServiceOrderState, ServiceOrderFailureReason,  ServiceOrderProblem, ServiceOrderProblemState
from datetime import datetime, timedelta
from services import ServiceOrderProblemService

logger = logging.getLogger()

class ServiceOrderInstance:

    @staticmethod
    def save(entity):

        email = users.get_current_user().email() if users.get_current_user() is not None else None

        if email is not None:
            entity.created_by = email

        if entity.key is None:
            entity = ServiceOrder.save(entity)
        else:
            current = ServiceOrder.get(entity.key.urlsafe())
            if current is not None:
                entity = ServiceOrder.save(entity)
            else:
                raise ValueError("Service order does not exists")
        return entity

    @staticmethod
    def get(id):
        return ServiceOrder.get(id)
    @staticmethod
    def get_by_service_ticket_id(service_ticket_id):
        return ServiceOrder.get_by_service_ticket_id(service_ticket_id)
    @staticmethod
    def get_by_service_ticket_id_and_company(company_key,service_ticket_id):
        return ServiceOrder.get_by_service_ticket_id_and_company(company_key, service_ticket_id)


    @staticmethod
    def get_all(page, page_size, filters):
        return ServiceOrder.get_all(page, page_size, filters)

    @staticmethod
    def change_status(service_order_key, new_status, finalized_notes, finalized_datetime, service_order_problem_json, failure_reason):

        service_order = ServiceOrder.get(service_order_key)

        service_order_problem = None

        if(service_order is None):
            raise ValueError("Service Order does not exists")

        if (new_status == int(ServiceOrderState.Failed) or new_status == int(ServiceOrderState.Completed)) and (not finalized_notes or not finalized_datetime):
            raise ValueError("When new_status is failed or completed, you need to send the fields finalized_notes & finalized_datetime (m/d/y h:m)")

        if (new_status == int(ServiceOrderState.Failed) or new_status == int(ServiceOrderState.Completed)):
            service_order.finalized_notes = finalized_notes
            service_order.finalized_datetime = datetime.strptime(finalized_datetime, "%m/%d/%Y %H:%M")

        if (new_status == int(ServiceOrderState.Failed)):
            service_order.failure_reason = ServiceOrderFailureReason(failure_reason)
            problems = ServiceOrderProblem.get_by_service_order(service_order.key)
            for problem in problems:
                problem.state = ServiceOrderProblemState.Failed
                ServiceOrderProblem.save(problem)

        if (new_status == int(ServiceOrderState.Completed)):
            problems = ServiceOrderProblem.get_by_service_order(service_order.key)
            for problem in problems:
                problem.state = ServiceOrderProblemState.Resolved
                ServiceOrderProblem.save(problem)


        if new_status == int(ServiceOrderState.Problem) and service_order_problem_json is None:
            raise ValueError("When new_status is problem, you need to send the service order problem")

        if new_status == int(ServiceOrderState.Problem):


            company_key = service_order.customer_key.get().company_key

            driver = ndb.Key(urlsafe=service_order_problem_json["driver_key"]).get()

            if driver is None:
                raise ValueError("Driver is required")

            roles = driver.get_roles()

            is_driver = False

            for role in roles:
                if role.name == "DRIVER":
                    is_driver = True
                    break

            if is_driver == False:
                raise ValueError("Key specified as driver is not a Driver")

            service_order_problem = ServiceOrderProblem(
                company_key = company_key,
                # site_key = site.key,
                driver_key = driver.key,
                service_order_key = service_order.key,
                description = service_order_problem_json["description"],
                state = ServiceOrderProblemState.Active,
                problem_datetime = datetime.strptime(service_order_problem_json["problem_datetime"], "%m/%d/%Y %H:%M")
            )

            service_order_problem = ServiceOrderProblemService.ServiceOrderProblemInstance.save(service_order_problem)

        service_order.state = ServiceOrderState(int(new_status))
        service_order = ServiceOrder.save(service_order)

        #When service order problem is created, the return object is the service order problem and not service order
        if new_status == int(ServiceOrderState.Problem):
            return service_order_problem

        return service_order

    @staticmethod
    def delete(id):
        entity = ServiceOrder.get(id)
        if(entity is None):
            raise ValueError("service order does not exists")
        else:
            entity.active = False
            ServiceOrder.save(entity)
