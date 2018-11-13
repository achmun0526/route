import webapp2

import config
from basehandlers import *

app = webapp2.WSGIApplication([

     webapp2.Route('/x/v1/echo', handler=EchoHandler),

     # Do request
     webapp2.Route('/x/a/v1/do_google_api_get_request', handler=DoGoogleApiGetRequestHandler),

     # Authentication
     webapp2.Route('/x/v1/sign_in', handler=SignInHandler, name='sign_in'),
     webapp2.Route('/x/v1/sign_in_google', handler=SignInGoogle, name='sign_in_google'), # redirects to Google Auth
     webapp2.Route('/x/a/v1/sign_out', handler=SignOutHandler, name='sign_out'),
     webapp2.Route('/x/v1/sign_up', handler=SignupHandler, name='sign_up'),

     # Role Assignment
     webapp2.Route('/x/v1/user/roles/assign_admin', handler=AssignAdminRoleHandler, name='assign_admin'),
     webapp2.Route('/x/v1/user/roles/revoke_admin', handler=RevokeAdminRoleHandler, name='revoke_admin'),
     webapp2.Route('/x/v1/user/roles/<assignee_id>', handler=RoleAssignmentHandler, name='get_roles'),
     webapp2.Route('/x/v1/user/roles/<assignee_id>/<role_names_joined>', handler=RoleAssignmentHandler, name='alter_roles'),
     webapp2.Route('/x/a/v1/users', handler=UsersHandler, name='get_users'),

     # Front End Support
     webapp2.Route('/x/v1/user/email/availability/<email>', handler=UserEmailAvailabilityHandler, name='email_availability'),

     # Authentication Request Handlers
     webapp2.Route('/x/a/v1/user/google/verify', handler=GoogleUserVerifyHandler, name='verify_google_sign_in'),
     webapp2.Route('/x/a/v1/context', handler=AuthenticatedContextHandler, name='auth_context'),

     # Profile Support
     webapp2.Route('/x/v1/user/user_name/availability/<name>', handler=UsernameAvailabilityHandler),
     webapp2.Route('/x/v1/user/user_name', handler=UsernameHandler),
     webapp2.Route('/x/v1/user/resend_email_varification', handler=ResendEmailVerification),
     webapp2.Route('/x/v1/user/verify_user_email', handler=VerificationHandler),
     webapp2.Route('/x/v1/user/profile', handler=ProfileHandler),

     #Lists
     webapp2.Route('/x/a/v1/list/<name>', handler=ListHandler),

     # Company
     webapp2.Route('/x/a/v1/company', handler=CompanyHandler),

     # User X Company
     webapp2.Route('/x/a/v1/userxcompany', handler=UserXCompanyHandler),

     # Customer
     webapp2.Route('/x/a/v1/customer', handler=CustomerHandler),

     # Driver
     webapp2.Route('/x/a/v1/driver', handler=DriverHandler),
     webapp2.Route('/x/a/v1/driver_list', handler=DriverListHandler),

     # Customer Service Address
     webapp2.Route('/x/a/v1/customer_service_address', handler=CustomerServiceAddressHandler),

     # Site
     webapp2.Route('/x/a/v1/site', handler=SiteHandler),

     # Service Order
     webapp2.Route('/x/a/v1/serviceorder', handler=ServiceOrderHandler),

     # Service Order Problem
     webapp2.Route('/x/a/v1/service_order_problem', handler=ServiceOrderProblemHandler),
     webapp2.Route('/x/a/v1/service_order_problem/change_status', handler=ServiceOrderProblemChangeStatusHandler),

     # Service Pricing
     webapp2.Route('/x/a/v1/servicepricing', handler=ServicePricingHandler),

     # Yard
     webapp2.Route('/x/a/v1/yard', handler=YardHandler),

     # Facility
     webapp2.Route('/x/a/v1/facility', handler=FacilityHandler),

     # Vehicle
     webapp2.Route('/x/a/v1/vehicle', handler=VehicleHandler),


     # Route
     webapp2.Route('/x/a/v1/route', handler=RouteHandler),
     webapp2.Route('/x/a/v1/flush_routes', handler=FlushRoutesHandler),

     # Route Item
     webapp2.Route('/x/a/v1/route_item', handler=RouteItemHandler),

     # Route Incident
     webapp2.Route('/x/a/v1/route_incident', handler=RouteIncidentHandler),

     # Asset Inventory
     webapp2.Route('/x/a/v1/asset_inventory', handler=AssetInventoryHandler),

     # SMS Api
     webapp2.Route('/x/a/v1/sms/send_message', handler=SendSmsHandler),
     webapp2.Route('/x/a/v1/sms/send_message_to_driver', handler=SendSmsToDriverHandler),

     # Message
     webapp2.Route('/x/a/v1/message', handler=MessageHandler),

     # Import Entity
     webapp2.Route('/x/a/v1/import_entity', handler=ImportEntityHandler),

     # Notification
     webapp2.Route('/x/a/v1/notification', handler=NotificationHandler),

     # Attachment
     webapp2.Route('/x/a/v1/attachment', handler=AttachmentHandler),

     # Route Position History
     webapp2.Route('/x/a/v1/route_position_history', handler=RoutePositionHistoryHandler),

     # test route handler
     webapp2.Route('/x/v1/test_route_handler', handler=TestRouteHandler)

], debug=False, config=config.WEBAPP2CONFIG)
