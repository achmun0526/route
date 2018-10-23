import config
import logging

from models import Route, RouteStatus, User, RouteIncident, RouteIncidentStatus
from google.appengine.api import app_identity
from google.appengine.api import users

logger = logging.getLogger()

class RouteInstance:

    @staticmethod
    def save(entity):

        email = users.get_current_user().email()

        if email is not None:
            entity.created_by = email

        if entity.key is None:
            entity = Route.save(entity)
        else:
            current = Route.get(entity.key.urlsafe())
            if current is not None:
                current.company_key = entity.company_key
                current.date = entity.date
                current.driver_key = entity.driver_key
                current.total_distance = entity.total_distance
                current.total_time = entity.total_time
                current.num_of_stops = entity.num_of_stops
                current.status = entity.status
                current.notes = entity.notes
                current.active = entity.active

                entity = Route.save(entity)
            else:
                raise ValueError("Route does not exists")

        return entity

    @staticmethod
    def get(id):
        return Route.get(id)

    @staticmethod
    def get_all(page, page_size, filters):
        return Route.get_all(page, page_size, filters)

    @staticmethod
    def delete(id):
        entity = Route.get(id)
        if(entity is None):
            raise ValueError("Route does not exists")
        else:
            entity.active = False
            Route.save(entity)

    @staticmethod
    def change_status(route_key, new_status):
        route = Route.get(route_key)
        if(route is None):
            raise ValueError("Route does not exists")

        if new_status == int(RouteStatus.InProgress):
            driver_key = route.driver_key
            routes = Route.get_all_in_progress_by_driver_key(driver_key)
            if len(routes) > 0:
                route_in_progress = routes[0]
                raise ValueError("Driver already has a route in progress. Current route in pogress " + route.key.urlsafe())

        if new_status == int(RouteStatus.Failed):
            route_incidents = RouteIncident.get_by_route(route.key)
            if len(route_incidents) > 0:
                for route_incident in route_incidents:
                    route_incident.status = RouteIncidentStatus.Failed
                    RouteIncident.save(route_incident)

        route.status = RouteStatus(int(new_status))
        route = Route.save(route)
        return route
