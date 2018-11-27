"""This module contanis all handlers used in the project."""

import os
import json
import logging
import webapp2
import jinja2
import base64
import urllib2
import time
import ntpath
import binascii
import struct
import config
import inspect
import time

from google.appengine.api import app_identity
from datetime import datetime, timedelta
from google.appengine.ext import ndb
from google.appengine.api import memcache
from google.appengine.api import users
from google.appengine.api import taskqueue
from google.appengine.ext import blobstore
from google.appengine.ext.webapp import blobstore_handlers
from webapp2_extras.auth import InvalidAuthIdError
from webapp2_extras.auth import InvalidPasswordError
from webapp2_extras import auth
from webapp2_extras import security
from webapp2_extras import sessions
from webapp2_extras.appengine.auth import models
from services import UserService, AuditService
from models import Role, Audit, AuditActionType

logging.basicConfig(filename='app.log', filemode='w', format='%(name)s - %(levelname)s - %(message)s')
logging.warning('This will get logged to a file')
logger = logging.getLogger()

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(
        os.path.join(
            os.path.dirname(__file__),
            'xtemplates')),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

SUCCESS = 'SUCCESS'
FAIL = 'FAIL'


def get_success_reponse(**kwargs):
    kwargs.update(
        dict(
            status=SUCCESS,
        )
    )
    return kwargs


def get_fail_response(errors, **kwargs):
    if len(errors) < 1:
        raise ValueError('Fail responses require at least 1 error (errors[])')
    kwargs['errors'] = errors
    kwargs['status'] = FAIL
    return kwargs


def render(template_name, context):
    return JINJA_ENVIRONMENT.get_template(template_name).render(context)


class MissingRequiredRole(Exception):
    pass


def user_required(handler):
    """
    Decorator that checks if there's a user associated with the current session.
    Will also fail if there's no session present.
    """

    def check_login(self, *args, **kwargs):
        auth = self.auth
        if not auth.get_user_by_session():
            return self.redirect(self.uri_for('login'), abort=True)
            # TODO: May want to return a fail response instead of a redirect.
        else:
            return handler(self, *args, **kwargs)


def role_required(*required_roles, **role_options):
    """
    Decorator to ensure current user possesses the all required roles.
    """

    def wrap(handler):
        def wrapped_handler(self, *args, **kwargs):
            def fail_json(msg='User does not possess all required roles'):
                failed_respose = get_fail_response([msg])
                return self.json_data(failed_respose)

            def fail_redirect(msg='User does not possess all required roles'):
                return self.redirect(role_options['on_fail_redirect'])

            fail_response = fail_json
            print "role_options: ", role_options
            if 'on_fail_redirect' in role_options:
                fail_response = fail_redirect

            auth = self.auth
            user = auth.get_user_by_session()
            if not user:
                return fail_response('Not Authenticated.  No user found in session')
            if not 'user_id' in user:
                return fail_response()
            if len(required_roles) == 0:  # Just want to make sure you are logged in.
                return handler(self, *args, **kwargs)
            user = ndb.Key(User, user['user_id']).get()
            if user.has_any_role(*required_roles):
                return handler(self, *args, **kwargs)
            return fail_response()

        return wrapped_handler

    return wrap


def token_required(handler):
    def check_token(self, *args, **kwargs):
        try:
            token = None
            date = None
            email = None
            headers = self.request.headers

            ''' Parameters validations '''
            if headers.has_key("token"):
                token = headers["token"]
            else:
                raise ValueError("Token is required")
            if headers.has_key("sdate"):
                date = headers["sdate"]
            else:
                raise ValueError("Date is required")
            if headers.has_key("email"):
                email = headers["email"]
            else:
                raise ValueError("Email is required")

            ''' Token '''
            data = base64.b64decode(token)
            parts = data.split("/")

            ''' Token Parts '''
            api_key_decoded = parts[0]
            option_key_decoded = parts[1]
            date_decoded = parts[2]
            email_decoded = parts[3]

            ''' Extra validations '''
            if config.API_KEY != api_key_decoded:
                raise ValueError("API Key unrecognized")

            if email != email_decoded:
                raise ValueError("email doesn't match with encoded email")

            handler(self, *args)

        except Exception, e:
            errors = [str(e)]
            return self.json_data(get_fail_response(errors))

    return check_token


class BaseHandler(webapp2.RequestHandler):
    @webapp2.cached_property
    def auth(self):
        """Shortcut to access the auth instance as a property"""
        return auth.get_auth()

    @webapp2.cached_property
    def user_info(self):
        return self.auth.get_user_by_session()

    @webapp2.cached_property
    def user(self):
        u = self.user_info
        return self.user_model.get_by_id(u['user_id']) if u else None

    @webapp2.cached_property
    def user_model(self):
        return self.auth.store.user_model

    @webapp2.cached_property
    def session(self):
        return self.session_store.get_session(backend="datastore")

    def dispatch(self):
        self.session_store = sessions.get_store(request=self.request)

        try:
            webapp2.RequestHandler.dispatch(self)
        finally:
            # Save all sessions
            self.session_store.save_sessions(self.response)

    def redirect(self, *args, **kwargs):
        request_origin = self.request.headers.get('Origin', None)
        if request_origin in config.CORS_APPROVED:
            self.response.headers['Access-Control-Allow-Origin'] = request_origin
        return super(BaseHandler, self).redirect(*args, **kwargs)

    def get_request_values(self, *args, **kwargs):
        """Convenience method to extract values from either a JSON request body or form"""
        request_body = self.request.body or "{}"
        try:
            body_data = json.loads(request_body)
        except:
            body_data = {}
        values = []

        for key in args:
            val = self.request.params.get(key)
            if val:
                values.append(val)
                continue
            if key in body_data:
                values.append(body_data[key])
                continue
            values.append(self.request.get(key))
        if "to_dict" in kwargs and kwargs.get("to_dict"):
            return dict(zip(args, values))
        if len(args) == 1:
            return values[0]
        return values

    def options(self):
        request_origin = self.request.headers.get('Origin', None)
        if request_origin in config.CORS_APPROVED:
            self.response.headers['Access-Control-Allow-Origin'] = request_origin
        self.response.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept'
        return

    def json_data(self, output):
        request_origin = self.request.headers.get('Origin', None)
        if request_origin in config.CORS_APPROVED:
            self.response.headers['Access-Control-Allow-Origin'] = request_origin
        web_output = json.dumps(output, indent=2)
        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(web_output)
        return

    def render_template(self, view_filename, params=None):
        if not params:
            params = {}
        user = self.user_info
        params['user'] = user
        self.response.out.write(render(view_filename, params))

    def render(self, template_name, context={}):
        self.response.write(render(template_name, context))
        return

    def audit(self, *errors):

        errors = [str(e) for e in errors]
        error = '; '.join(errors)
        logging.error(error)

        message = "class: %s, method: %s" % (self.__class__.__name__, inspect.stack()[0][3])

        audit = Audit()
        user = users.get_current_user()
        audit.populate(
            user_email=user.email() if user else '',
            error=error,
            message=message,
        )
        AuditService.AuditInstance.save(audit)

        return self.json_data(get_fail_response(errors))


class EchoHandler(BaseHandler):
    def post(self):
        value = self.get_request_values('echo')
        return self.json_data(get_success_reponse(echo=value))


class DoGoogleApiGetRequestHandler(BaseHandler):
    def post(self):
        try:
            url = self.get_request_values('url')
            response = urllib2.urlopen(url)
            data = json.load(response)
            return self.json_data(get_success_reponse(response=data))
        except Exception, e:
            errors = [str(e)]
            return self.json_data(get_fail_response(errors))


class SignupHandler(BaseHandler):
    def get(self):
        resp = get_success_reponse()
        return self.json_data(resp)

    def post(self):
        # todo: @adozier, we need to make sure that a Driver is created when a User with role DRIVER is created
        try:
            from services import UserService
            from services import UserXCompanyService
            from models import User
            from models import UserXCompany

            email, first_name, last_name, contact_phone_desk, contact_phone_mobile, device_id, password, role, company_key, user_key = self.get_request_values(
                "email", "first_name", "last_name", "contact_phone_desk", "contact_phone_mobile", "device_id",
                "password", "role", "company_key", "user_key")
            user_name, user_domain = email.split('@')
            logging.warning(self.get_request_values("email", "first_name", "last_name", "contact_phone_desk",
                                                    "contact_phone_mobile", "device_id", "password", "role",
                                                    "company_key", "user_key"))
            user = User()

            email = email.lower()

            if user_key:

                from webapp2_extras import security

                user = UserService.UserInstance.get(user_key)

                if user is None:
                    raise ValueError("User with user_key %s does not exists" % user_key)

                user.populate(
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    contact_phone_desk=contact_phone_desk,
                    contact_phone_mobile=contact_phone_mobile,
                    device_id=device_id,
                    password=security.generate_password_hash(password, length=12)
                )

                user = user.save()
                if role is not None and role:

                    ndb.Key(Role, Role.ADMIN, parent=user.key).delete()
                    ndb.Key(Role, Role.COMPANY_ADMIN, parent=user.key).delete()
                    ndb.Key(Role, Role.DRIVER, parent=user.key).delete()
                    ndb.Key(Role, Role.DISPATCHER, parent=user.key).delete()
                    ndb.Key(Role, Role.MANAGER, parent=user.key).delete()
                    ndb.Key(Role, Role.OFFICE_ADMIN_CSR, parent=user.key).delete()
                    if role.upper() == Role.ADMIN:
                        Role(id=Role.ADMIN, name=Role.ADMIN, user=user.key, parent=user.key).put()
                    elif role.upper() == Role.COMPANY_ADMIN:
                        Role(id=Role.COMPANY_ADMIN, name=Role.COMPANY_ADMIN, user=user.key, parent=user.key).put()
                    elif role.upper() == Role.DRIVER:
                        Role(id=Role.DRIVER, name=Role.DRIVER, user=user.key, parent=user.key).put()
                    elif role.upper() == Role.DISPATCHER:
                        Role(id=Role.DISPATCHER, name=Role.DISPATCHER, user=user.key, parent=user.key).put()
                    elif role.upper() == Role.MANAGER:
                        Role(id=Role.MANAGER, name=Role.MANAGER, user=user.key, parent=user.key).put()
                    elif role.upper() == Role.OFFICE_ADMIN_CSR:
                        Role(id=Role.OFFICE_ADMIN_CSR, name=Role.OFFICE_ADMIN_CSR, user=user.key, parent=user.key).put()

                if company_key:

                    relationship = UserXCompanyService.UserXCompanyInstance.get_by_company_and_user(
                        ndb.Key(urlsafe=company_key), user.key)

                    if relationship is None:
                        userXcompany = UserXCompany()
                        userXcompany.populate(
                            user=user.key,
                            company=ndb.Key(urlsafe=company_key)
                        )
                        UserXCompanyService.UserXCompanyInstance.save(userXcompany)
                        time.sleep(0.5)
                    else:
                        UserXCompanyService.UserXCompanyInstance.remove_all_companies_from_user(user.key.urlsafe())
                        userXcompany = UserXCompany()
                        userXcompany.populate(
                            user=user.key,
                            company=ndb.Key(urlsafe=company_key)
                        )
                        UserXCompanyService.UserXCompanyInstance.save(userXcompany)
                        time.sleep(0.5)

                else:
                    UserXCompanyService.UserXCompanyInstance.remove_all_companies_from_user(user.key.urlsafe())

            else:

                existing_user = UserService.UserInstance.get_by_email(email)

                if existing_user != None:
                    # User Already Exists
                    errors = ['An Account already exists for email "%s"' % email]
                    resp = get_fail_response(errors)
                    return self.json_data(resp)

                unique_properties = ['email']
                user_data = self.user_model.create_user(
                    email,
                    unique_properties,
                    email=email, first_name=first_name, last_name=last_name, contact_phone_desk=contact_phone_desk,
                    contact_phone_mobile=contact_phone_mobile, device_id=device_id, password_raw=password,
                    verified=False)

                user_key = user_data[1].key.urlsafe()
                if role is not None and role.upper() == Role.DRIVER:
                    from services import DriverService
                    from models import Driver
                    driver = Driver()
                    driver.populate(
                        company_key=ndb.Key(urlsafe=company_key),
                        user_key=ndb.Key(urlsafe=user_key),
                        driver_email=email,
                        driver_name='{} {}'.format(first_name, last_name),
                        driver_phone=contact_phone_mobile or contact_phone_desk
                    )
                    entity = DriverService.DriverInstance.save(driver)

                if not user_data[0]:  # user_data is a tuple
                    errors = ['Unable to create user for email %s because of duplicate keys %s' % (email, user_data[1])]
                    resp = get_fail_response(errors=errors)
                    return self.json_data(resp)

                # Push queue to send email verification url
                user = user_data[1]

            user_id = user.key.urlsafe()
            if role is not None and role:
                if role.upper() == Role.ADMIN:
                    Role(id=Role.ADMIN, name=Role.ADMIN, user=user.key, parent=user.key).put()
                elif role.upper() == Role.COMPANY_ADMIN:
                    Role(id=Role.COMPANY_ADMIN, name=Role.COMPANY_ADMIN, user=user.key, parent=user.key).put()
                elif role.upper() == Role.DRIVER:
                    Role(id=Role.DRIVER, name=Role.DRIVER, user=user.key, parent=user.key).put()
                elif role.upper() == Role.DISPATCHER:
                    Role(id=Role.DISPATCHER, name=Role.DISPATCHER, user=user.key, parent=user.key).put()
                elif role.upper() == Role.MANAGER:
                    Role(id=Role.MANAGER, name=Role.MANAGER, user=user.key, parent=user.key).put()
                elif role.upper() == Role.OFFICE_ADMIN_CSR:
                    Role(id=Role.OFFICE_ADMIN_CSR, name=Role.OFFICE_ADMIN_CSR, user=user.key, parent=user.key).put()

            else:
                ndb.Key(Role, Role.ADMIN, parent=user.key).delete()

            if company_key:
                relationship = UserXCompanyService.UserXCompanyInstance.get_by_company_and_user(
                    ndb.Key(urlsafe=company_key), user.key)
                if relationship is None:
                    userXcompany = UserXCompany()
                    userXcompany.populate(
                        user=user.key,
                        company=ndb.Key(urlsafe=company_key)
                    )
                    UserXCompanyService.UserXCompanyInstance.save(userXcompany)
                    time.sleep(0.5)
            else:
                UserXCompanyService.UserXCompanyInstance.remove_all_companies_from_user(user.key.urlsafe())

            resp = get_success_reponse(user=user.to_dict())

            return self.json_data(resp)

        except Exception, e:
            errors = [str(e)]
            return self.json_data(get_fail_response(errors))


class SignInHandler(BaseHandler):

    def post(self):
        from services import UserService
        from models import User
        from webapp2_extras import security

        email, password = self.get_request_values("email", "password")

        email = email.lower()

        # todo: @adozier check if user does not exist and return - nonexistent!
        user = UserService.UserInstance.get_by_email(email)

        password_check = security.check_password_hash(password, user.password)

        if user:
            if user.is_authentication_locked():
                errors = ['Account is Temporarily Locked.  Exceeded maximum authentication failures.']
                return self.json_data(get_fail_response(errors, locked=True))

            if password_check or (password == user.password):
                resp = get_success_reponse(email=email, user=user.to_dict())
                self.auth.set_session(self.auth.store.user_to_dict(user), remember=True)
                return self.json_data(resp)
            else:
                errors = ['Login failed for user %s  password: %s was incorrect ' % (email, password)]
                resp = get_fail_response(errors, email=email)
                return self.json_data(resp)
        else:
            errors = ['Username %s is incorrect ' % (email)]
            resp = get_fail_response(errors, email=email)
            return self.json_data(resp)


class SignOutHandler(BaseHandler):
    def get(self):
        self.auth.unset_session()
        self.redirect('/')


class ProfileHandler(BaseHandler):
    @role_required()
    def get(self):
        from services import UserService
        from models import User

        google_user = users.get_current_user()
        resp = None
        if google_user is None:
            user = UserService.UserInstance.get_by_email('test@gmail.com')
            if user is None:
                resp = get_fail_response(['Not Authenticated.  No user found in session'])
            else:
                resp = get_success_reponse(user=self.user.to_dict())
        else:
            resp = get_success_reponse(user=self.user.to_dict())
        return self.json_data(resp)

    @role_required()
    def post(self):
        keys = "email first_name last_name contact_phone_desk contact_phone_mobile device_id".split()
        value_reg = self.get_request_values(*keys, to_dict=True)
        self.user.consume(value_reg)
        return self.json_data(get_success_reponse(message="Profile has been updated"))


class SignInGoogle(webapp2.RequestHandler):
    def get(self):
        return webapp2.redirect(users.create_login_url(webapp2.uri_for('verify_google_sign_in')))


class UserEmailAvailabilityHandler(BaseHandler):
    def get(self, email):
        from models import User
        user = User.get_by_email(email)
        if user:
            errors = ['Account already Exists']
            resp = get_fail_response(errors)
        else:
            resp = get_success_reponse(email=email, message='Email not in use')
        return self.json_data(resp)


class UsernameAvailabilityHandler(BaseHandler):
    def get(self, name):
        from models import UserName
        try:
            UserName.is_available(name)
            resp = get_success_reponse(message="%s is Available" % name)
        except (UserName.UserNameTaken, UserName.UserNameImproperFormat, UserName.UserNameVulgar), e:
            errors = [e.message]
            resp = get_fail_response(errors)

        return self.json_data(resp)


class UsernameHandler(BaseHandler):

    @role_required()
    def post(self):
        from models import UserName
        now = datetime.now()
        user = self.user
        name = self.get_request_values('name')
        try:
            UserName.is_available(name)
            user_name_key = UserName.new_user_name(user.key, name)
            if user.user_name:
                try:
                    old_user_name = user.user_name.get()
                    old_user_name.deleted_at = now
                    old_user_name.put()
                except:
                    pass
            user.user_name = user_name_key
            user.put()
            resp = get_success_reponse(message="User Name has been changed to %s." % name, user=user.to_dict())
        except (UserName.UserNameTaken, UserName.UserNameImproperFormat, UserName.UserNameVulgar), e:
            errors = [e.message]
            resp = get_fail_response(errors)

        return self.json_data(resp)


class VerificationHandler(BaseHandler):
    def get(self, *args, **kwargs):

        user_id, signup_token, verification_type = self.get_request_values('user_id', 'signup_token', 'type')

        user, ts = self.user_model.get_by_auth_token(int(user_id), signup_token, 'signup')

        if not user:
            user2 = user_key.get()
            if user2:
                target = '/sign_up?verification=FAIL&email=%s' % user2.email
            else:
                target = '/sign_up?verification=FAIL'
            logging.info('Could not find any user with id "%s" signup token "%s"', user_id, signup_token)
            return self.redirect(target)

        # store user data in the session
        self.auth.set_session(self.auth.store.user_to_dict(user), remember=True)

        if verification_type == 'v':
            # remove signup token, we don't want users to come back with an old link
            self.user_model.delete_signup_token(user.get_id(), signup_token)

            if not user.verified:
                user.verified = True
                user.put()

            target = '/edit_profile?verification=SUCCESS&email=%s' % user.email
            return self.redirect(target)

        elif verification_type == 'p':
            # supply user to the page
            # params = {
            #    'user': user,
            #    'token': signup_token
            # }
            # resp = get_success_reponse(token=signup_token)
            # return self.json_data(resp)
            return self.redirect('/change_password?t=%s' % signup_token)
        else:
            logging.info('verification type not supported')
            self.abort(404)


class ResendEmailVerification(BaseHandler):
    def post(self):
        user_id = self.get_request_values('user_id')
        if not user_id:
            errors = ['Missing required attribute "user_id"']
            return self.json_data(get_fail_response(errors))

        # taskqueue.add(url=self.uri_for('send_email_verification'), params=dict(user_id=user_id))

        return self.json_data(get_success_reponse(message='Verification Email has been queued'))


class AssignAdminRoleHandler(BaseHandler):
    @role_required(Role.ADMIN)
    def post(self):
        assignee_id = self.get_request_values('assignee_id')
        assignee = ndb.Key(urlsafe=assignee_id).get()
        if not assignee:
            resp = get_fail_response(['User not found'])
            return self.json_data(resp)
        Role(id=Role.ADMIN, name=Role.ADMIN, user=assignee.key, parent=assignee.key).put()
        resp = get_success_reponse(email=assignee.email, message="ADMIN role has been granted")
        return self.json_data(resp)


class RevokeAdminRoleHandler(BaseHandler):
    @role_required(Role.ADMIN)
    def post(self):
        assignee_id = self.get_request_values('assignee_id')
        assignee = ndb.Key(urlsafe=assignee_id).get()
        if not assignee:
            resp = get_fail_response(['User not found'])
            return self.json_data(resp)
        try:
            ndb.Key(Role, Role.ADMIN, parent=assignee.key).delete()
        except Exception, e:
            resp = get_fail_response(['Unable to confirm removal of ADMIN role.', e.message])
            return self.json_data(resp)

        resp = get_success_reponse(email=assignee.email, message="ADMIN role has been revoked.")
        return self.json_data(resp)


class RoleAssignmentHandler(BaseHandler):

    @role_required(Role.ADMIN)
    def get(self, assignee_id):
        if not assignee_id:
            resp = get_fail_response(errors=['Value not found for required parameter "assignee_id"'])
            return self.json_data(resp)
        assignee = ndb.Key(urlsafe=assignee_id).get()
        if not assignee:
            resp = get_fail_response(['User not found'])
            return self.json_data(resp)

        resp = get_success_reponse(user=assignee.to_dict(), message='See user.roles')
        return self.json_data(resp)

    @role_required(Role.ADMIN)
    def post(self, assignee_id, role_names_joined):
        assignee = ndb.Key(urlsafe=assignee_id).get()
        role_names = role_names_joined.split(',')

        if not assignee:
            resp = get_fail_response(['User not found'])
            return self.json_data(resp)
        if Role.ADMIN in role_names:
            resp = get_fail_response(errors=['Can not use this service to alter ADMIN role'])
            return self.json_data(resp)
        # Make sure all requested Role Names are legit names
        allowed_roles = Role.admin_assignable_roles()
        if not all(rn in allowed_roles for rn in role_names):  # TODO: This test should likely built into Role!
            bad_roles = set(role_names) - set(allowed_roles)
            resp = get_fail_response(
                errors=['Attempted to assign a Role that is not assignable: %s' % ','.join(bad_roles)])
            return self.json_data(resp)

        # At this point, we can trust all role_names
        # todo: @adozier, if a Role already exists for the user, do not add it again...
        roles = [Role(parent=assignee.key, id=rn, user=assignee.key, name=rn) for rn in role_names]
        role_keys = ndb.put_multi(roles)
        assignee._roles = roles

        resp = get_success_reponse(user=assignee.to_dict(), message='See user.roles')
        return self.json_data(resp)

    @role_required(Role.ADMIN)
    def delete(self, assignee_id, role_names_joined):
        assignee = ndb.Key(urlsafe=assignee_id).get()
        role_names = role_names_joined.split(',')

        if not assignee:
            resp = get_fail_response(['User not found'])
            return self.json_data(resp)
        if Role.ADMIN in role_names:
            resp = get_fail_response(errors=['Can not use this service to alter ADMIN role'])
            return self.json_data(resp)
        # Make sure all requested Role Names are legit names
        allowed_roles = Role.admin_assignable_roles()
        if not all(rn in allowed_roles for rn in role_names):  # TODO: This test should likely built into Role!
            bad_roles = set(role_names) - set(allowed_roles)
            resp = get_fail_response(
                errors=['Attempted to alter a Role that is not assignable: %s' % ','.join(bad_roles)])
            return self.json_data(resp)

        role_keys = [ndb.Key(Role, rn, parent=assignee.key) for rn in role_names]
        ndb.delete_multi(role_keys)
        assignee.get_roles()  # re-warms the _roles
        resp = get_success_reponse(user=assignee.to_dict())
        return self.json_data(resp)


class GoogleUserVerifyHandler(BaseHandler):

    def get(self):

        from models import User
        from models import Role

        google_user = users.get_current_user()

        if not google_user:
            return webapp2.redirect('/sign_in')

        google_email = google_user.email()

        google_email = google_email.lower()


        user = User.get_by_email(google_email)

        logging.info(user)
        print("inside google verify")
        # if not user:
        #     if users.is_current_user_admin():
        #         from os import urandom
        #         password = urandom(12)
        #         unique_properties = ['email']
        #         user_data = self.user_model.create_user(google_email,
        #         unique_properties,
        #         email=google_email, password_raw=password, verified=True, activated=True)
        #         user = user_data[1]
        #     else:
        #         return self.redirect('/errors/user_not_registered.html')

        # todo: @adozier, this same check seems to be in multiple places. put it in one place
        # if users.is_current_user_admin():
        #     # Automatically Add the ADMIN Role
        #     if (user is not None and hasattr(user, "key")):
        #         Role(id=Role.ADMIN, name=Role.ADMIN, user=user.key, parent=user.key).put()
        # else:
        #     ndb.Key(Role, Role.ADMIN, parent=user.key).delete()


        # Authenticate to this user and update session
        self.auth.set_session(self.auth.store.user_to_dict(user), remember=True)
        #
        # if user.first_name and user.last_name: # All info defined
        #     return self.redirect('/')
        # todo: @adozier, this redirect is in two different places. might investigate creating a single service to
        roles = [role.name for role in user.get_roles()]
        # print('user.roles: {0}'.format(roles))

        # serve initial page for different types of users
        if Role.DRIVER in roles:
            return self.redirect('/management/routes')
        else:
            return self.redirect('/')


class AuthenticatedContextHandler(webapp2.RequestHandler):

    def get(self):
        context = dict(authenticated=True)
        user = users.get_current_user()
        if user:
            context['user_email'] = user.email()
            context['user_nickname'] = user.nickname()
            context['user_id'] = user.user_id()
            context['user_admin'] = users.is_current_user_admin()

        web_output = json.dumps(context, indent=2)
        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(web_output)
        return


class UsersHandler(BaseHandler):

    def get(self):

        from models import User
        from models import Role
        from models import UserXCompany
        from models import Company

        # Pagination
        page = self.request.get('page')
        page_size = self.request.get('page_size')

        # Filters
        filters = {}
        filters["activated"] = self.request.get('activated')
        filters["optimized"] = self.request.get('optimized')

        email = self.request.params.get('email')
        roles_joined = self.request.params.get('roles')
        company = self.request.get('company_key')

        @ndb.tasklet
        def callback(user):
            roles = yield Role.query(ancestor=user.key).fetch_async()
            userXcompany = UserXCompany.query(UserXCompany.user == user.key).get()
            if (userXcompany is not None):
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
                if user != None:
                    keys.append(user.key)

            if keys:
                qry = qry.filter(User.key.IN(keys))

        '''Email'''
        if email:
            qry = qry.filter(User.email == email)

        '''Company'''
        if company:
            users_by_company = UserXCompany.get_all_by_company(company)
            users_ids = []
            for x in users_by_company:
                users_ids.append(x.user)
            if len(users_ids) > 0:
                qry = qry.filter(User.key.IN(users_ids))
            else:
                qry = qry.filter(User.email is None)

        '''Active'''
        if (filters["activated"] and str(filters["activated"]) == "all"):
            pass
        elif filters["activated"] and (
                json.loads(filters["activated"]) == True or json.loads(filters["activated"]) == False):
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

        if (filters["optimized"] and json.loads(filters["optimized"]) == True):
            response = {
                "total": total,
                "records": json.loads(json.dumps([u.to_dict_optimized() for u in all_users]))
            }
        else:
            response = {
                "total": total,
                "records": json.loads(json.dumps([u.to_dict() for u in all_users]))
            }

        return self.json_data(get_success_reponse(response=response))

    def delete(self):
        try:
            from services import UserService, UserXCompanyService
            from models import UserXCompany
            from models import User
            id = self.request.get('id')
            parentId = ndb.Key(urlsafe=id)
            # delete unique key
            usertobedeleted = User.get_by_key(parentId)
            models.Unique.delete_multi(['User.auth_id:' + usertobedeleted.email])
            models.Unique.delete_multi(['User.email:' + usertobedeleted.email])
            # delete company
            companydelete = UserXCompanyService.UserXCompanyInstance.remove_all_companies_from_user(id)
            # delete role
            ndb.Key(Role, Role.ADMIN, parent=parentId).delete()
            ndb.Key(Role, Role.COMPANY_ADMIN, parent=parentId).delete()
            ndb.Key(Role, Role.DRIVER, parent=parentId).delete()
            ndb.Key(Role, Role.DISPATCHER, parent=parentId).delete()
            ndb.Key(Role, Role.MANAGER, parent=parentId).delete()
            ndb.Key(Role, Role.OFFICE_ADMIN_CSR, parent=parentId).delete()
            # delete user
            UserService.UserInstance.delete(id)
            time.sleep(0.5)
            return self.json_data(get_success_reponse())

        except Exception, e:
            return self.audit(e)


class CompanyHandler(BaseHandler):

    def post(self):
        try:

            from services import CompanyService
            from models import Company

            data = json.loads(self.request.body)

            id = data.get('id')
            name = data.get('name')
            domain = data.get('domain')
            contact_phone = data.get('contact_phone')
            contact_email = data.get('contact_email')
            address = data.get('address')
            state = data.get('state')
            city = data.get('city')
            zipcode = data.get('zipcode')
            vendor_notes = data.get('vendor_notes')
            service_pricing = data.get('service_pricing')
            active = data.get('active')
            latitude = data.get('latitude')
            longitude = data.get('longitude')

            logo_name = data.get("logo_name")
            logo_data = data.get("logo_data")

            company = Company()

            company.populate(
                name=name,
                domain=domain,
                contact_phone=contact_phone,
                contact_email=contact_email,
                address=address,
                state=state,
                city=city,
                zipcode=zipcode,
                vendor_notes=vendor_notes,
                service_pricing=service_pricing,
                active=active,
                latitude=latitude,
                longitude=longitude
            )

            if id is not None:
                company.key = ndb.Key(urlsafe=id)

            company = CompanyService.CompanyInstance.save(company, logo_name, logo_data)

            return self.json_data(get_success_reponse(response=company.to_dict()))

        except Exception, e:
            return self.audit(e)

    def get(self):
        try:

            from services import CompanyService
            from models import Company

            # Pagination
            page = self.request.get('page')
            page_size = self.request.get('page_size')

            # Filters
            filters = {}
            filters["active"] = self.request.get('active')
            filters["user"] = self.request.get('user')
            filters["company"] = self.request.get('company')

            entities, total = CompanyService.CompanyInstance.get_all(page, page_size, filters)

            response = {
                "total": total,
                "records": json.loads(json.dumps([entity.to_dict() for entity in entities]))
            }

            return self.json_data(get_success_reponse(response=response))

        except Exception, e:
            return self.audit(e)

    def delete(self):
        try:
            from services import CompanyService

            id = self.request.get('id')

            CompanyService.CompanyInstance.delete(id)

            return self.json_data(get_success_reponse())

        except Exception, e:
            return self.audit(e)


class UserXCompanyHandler(BaseHandler):

    def post(self):
        try:
            from services import UserXCompanyService
            from models import UserXCompany

            data = json.loads(self.request.body)

            id = data.get('id')
            user = data.get('user')
            company = data.get('company')

            userXcompany = UserXCompany()

            userXcompany.populate(
                user=ndb.Key(urlsafe=user),
                company=ndb.Key(urlsafe=company)
            )

            if id is not None:
                userXcompany.key = ndb.Key(urlsafe=id)

            userXcompany = UserXCompanyService.UserXCompanyInstance.save(userXcompany)

            return self.json_data(get_success_reponse(response=userXcompany.to_dict()))

        except Exception, e:
            return self.audit(e)

    def delete(self):
        try:
            from services import UserXCompanyService
            from models import UserXCompany

            id = self.request.get('id')

            UserXCompanyService.UserXCompanyInstance.delete(id)

            return self.json_data(get_success_reponse())

        except Exception, e:
            return self.audit(e)

    def get(self):
        try:

            from services import UserXCompanyService
            from models import UserXCompany

            # Pagination
            page = self.request.get('page')
            page_size = self.request.get('page_size')

            entities, total = UserXCompanyService.UserXCompanyInstance.get_all(page, page_size)

            response = {
                "total": total,
                "records": json.loads(json.dumps([entity.to_dict() for entity in entities]))
            }

            return self.json_data(get_success_reponse(response=response))

        except Exception, e:
            return self.audit(e)


class CustomerHandler(BaseHandler):
    def post(self):
        try:
            from services import CustomerService
            from models import Customer

            data = json.loads(self.request.body)

            id = data.get('id')
            company_key = data.get('company_key')
            source_system_id = data.get('source_system_id')
            source_system = data.get('source_system')
            customer_account_id = data.get('customer_account_id')
            customer_name = data.get('customer_name')
            contact_name = data.get('contact_name')
            contact_email = data.get('contact_email')
            contact_phone = data.get('contact_phone')
            billing_address = data.get('billing_address')
            billing_zipcode = data.get('billing_zipcode')
            billing_state = data.get('billing_state')
            billing_city = data.get('billing_city')
            notes = data.get('notes')
            active = data.get('active')
            create_service_address = data.get('create_service_address')

            if create_service_address is None:
                create_service_address = False
            else:
                create_service_address = bool(create_service_address)

            customer = Customer()

            customer.populate(
                company_key=ndb.Key(urlsafe=company_key),
                source_system_id=source_system_id,
                source_system="web",
                customer_account_id=customer_account_id,
                customer_name=customer_name,
                contact_name=contact_name,
                contact_email=contact_email,
                contact_phone=contact_phone,
                billing_address=billing_address,
                billing_zipcode=billing_zipcode,
                billing_state=billing_state,
                billing_city=billing_city,
                active=active,
                notes=notes
            )

            if id is not None:
                customer.key = ndb.Key(urlsafe=id)

            customer = CustomerService.CustomerInstance.save(customer, create_service_address)

            return self.json_data(get_success_reponse(response=customer.to_dict()))

        except Exception, e:
            return self.audit(e)

    def get(self):
        try:
            from services import CustomerService
            from models import Customer

            # Pagination
            page = self.request.get('page')
            page_size = self.request.get('page_size')

            # Filters
            filters = {}
            filters["active"] = self.request.get('active')
            filters["company_key"] = self.request.get('company_key')
            filters["customer_key"] = self.request.get('customer_key')

            entities, total = CustomerService.CustomerInstance.get_all(page, page_size, filters)

            response = {
                "total": total,
                "records": json.loads(json.dumps([entity.to_dict() for entity in entities]))
            }

            return self.json_data(get_success_reponse(response=response))

        except Exception, e:
            return self.audit(e)

    def delete(self):
        try:
            from services import CustomerService

            id = self.request.get('id')

            CustomerService.CustomerInstance.delete(id)

            return self.json_data(get_success_reponse())

        except Exception, e:
            return self.audit(e)


class CustomerServiceAddressHandler(BaseHandler):

    def post(self):
        try:
            from services import CustomerServiceAddressService
            from models import CustomerServiceAddress

            data = json.loads(self.request.body)

            id = data.get('id')
            customer_key = data.get('customer_key')
            address = data.get('address')
            zipcode = data.get('zipcode')
            state = data.get('state')
            city = data.get('city')
            notes = data.get('notes')

            customerServiceAddress = CustomerServiceAddress()

            customerServiceAddress.populate(
                customer_key=ndb.Key(urlsafe=customer_key),
                address=address,
                zipcode=zipcode,
                state=state,
                city=city,
                notes=notes
            )

            if id is not None:
                customerServiceAddress.key = ndb.Key(urlsafe=id)

            customerServiceAddress = CustomerServiceAddressService.CustomerServiceAddressInstance.save(
                customerServiceAddress)

            return self.json_data(get_success_reponse(response=customerServiceAddress.to_dict()))

        except Exception, e:
            return self.audit(e)

    def get(self):
        try:
            from services import CustomerServiceAddressService
            from models import CustomerServiceAddress

            # Pagination
            page = self.request.get('page')
            page_size = self.request.get('page_size')

            # Filters
            filters = {}
            filters["customer"] = self.request.get('customer')

            entities, total = CustomerServiceAddressService.CustomerServiceAddressInstance.get_all(page, page_size,
                                                                                                   filters)

            response = {
                "total": total,
                "records": json.loads(json.dumps([entity.to_dict() for entity in entities]))
            }

            return self.json_data(get_success_reponse(response=response))

        except Exception, e:
            return self.audit(e)


class ImportEntityHandler(BaseHandler):
    def post(self):
        try:
            from models import Company

            data = json.loads(self.request.body)

            bussiness_entities = ["customer", "service_order", "site", "yard", "facility", "vehicle"]

            entity = data.get('entity')

            company_key = data.get("company_key")

            site_key = data.get("site_key")
            customer_key = data.get("customer_key")

            file = data.get("file")
            # Validations parameters

            if entity is None:
                raise ValueError("Entity field is required")
                error_list = "Entity field is required."
            else:
                entity = entity.lower()

            if entity not in bussiness_entities:
                raise ValueError("Entity not allowed")
                error_list = "Entity not allowed."

            if entity == "customer" and company_key is None:
                raise ValueError("When you are trying to import clients you must specify the company_key")
                error_list = error_list + "When you are trying to import clients you must specify the company_key."

            if entity == "yard" and company_key is None:
                raise ValueError("When you are trying to import yards you must specify the company_key")
                error_list = error_list + "When you are trying to import yards you must specify the company_key."

            if entity == "facility" and company_key is None:
                raise ValueError("When you are trying to import facilities you must specify the company_key")
                error_list = error_list + "When you are trying to import facilities you must specify the company_key."

            if entity == "vehicle" and company_key is None:
                raise ValueError("When you are trying to import vehicles you must specify the company_key")
                error_list = error_list + "When you are trying to import vehicles you must specify the company_key."

            uploaded_file = base64.b64decode(file)

            if uploaded_file is not None:

                source_system = "import service"

                index = 0
                total_inserted_rows = 0
                total_errors_rows = 0

                errors = []
                error_list = ""

                for line in uploaded_file.split("\n"):

                    '''if line is empty then skip it'''
                    if not line:
                        index = index + 1
                        continue

                    '''if line starts with * then skip it---This part currently does not work'''
                    if line.startswith('*'):
                        index = index + 1
                        continue

                    try:
                        row = line.split(",")

                        if False:
                            raise ValueError("row=: %s " % row)

                        if entity == "customer":

                            from services import CustomerService
                            from models import Customer

                            customer = Customer()
                            customer.populate(
                                company_key=ndb.Key(urlsafe=company_key),
                                customer_account_id=row[0],
                                source_system=source_system,
                                customer_name=row[1],
                                contact_name=row[2],
                                contact_email=row[3],
                                contact_phone=row[4],
                                billing_address=row[5],
                                billing_city=row[6],
                                billing_state=row[7],
                                billing_zipcode=row[8],
                                notes=row[9],
                                # active=json.loads(row[10].lower()) if row[10] is not None else True
                            )
                            customer_account_id = str(row[0])
                            customer_response = CustomerService.CustomerInstance.get_by_company_and_account_id(
                                customer.company_key, customer_account_id)
                            if customer_response is not None:
                                error_list = error_list + "    Customer ID already exists: " + customer_account_id + ".%"
                                raise ValueError("Customer ID already exists.")
                            CustomerService.CustomerInstance.save(customer)
                            index = index + 1
                            customer_response = None

                        elif entity == "site":

                            from services import SiteService, CustomerService
                            from models import Site

                            '''looking for customer'''
                            customer_account_id = str(row[0])
                            customer = CustomerService.CustomerInstance.get_by_account_id(customer_account_id)

                            if customer is None:
                                error_list = error_list + "    Customer Account not found ID: " + customer_account_id + ".%"
                                customer_company_key = None
                                customer_key = None
                            else:
                                customer_company_key = customer.company_key
                                customer_company = customer.company_key.urlsafe()
                                current_company = company_key
                                customer_key = customer.key.urlsafe()

                            if customer_company != current_company and customer is not None:
                                error_list = error_list + "    Customer Account not found ID: " + customer_account_id + ".%"

                            latitude = row[10]
                            longitude = row[11]
                            # try:
                            latitude_check = float(latitude)
                            if latitude_check == 0 or latitude is None:
                                # raise ValueError("Latitude Entry cannot be 0")
                                error_list = error_list + "    Latitude entry cannot be 0.%"
                            # except ValueError:
                            # raise ValueError("Latitude Entry is not Valid: %s" % latitude)
                            # error_list = error_list + "Latitude Entry is not Valid: %s" % latitude
                            # try:
                            longitude_check = float(longitude)
                            if longitude_check == 0 or longitude is None:
                                # raise ValueError("Longitude Entry cannot be 0")
                                error_list = error_list + "    Longitude entry cannot be 0.%"
                            # except ValueError:
                            # raise ValueError("Longitude Entry is not Valid: %s" % longitude)
                            # error_list = error_list + "Longitude Entry is not Valid: %s" % longitude
                            site_account_id = str(row[1])

                            site_exists = SiteService.SiteInstance.get_by_account_id_and_company_key(site_account_id,
                                                                                                     customer_company_key)

                            if site_exists is not None:
                                error_list = error_list + "    A site with this site ID already exists: " + site_account_id + ".%"

                            if len(error_list) != 0:
                                raise ValueError("There was an error.")

                            site = Site()
                            site.populate(
                                source_system=source_system,
                                company_key=ndb.Key(Company, customer_company_key.id()),
                                customer_key=ndb.Key(urlsafe=customer_key),
                                customer_account_id=customer_account_id,
                                site_account_id=row[1],
                                site_name=row[2],
                                site_address=row[3],
                                site_zipcode=row[4],
                                site_state=row[5],
                                site_city=row[6],
                                contact_name=row[7],
                                contact_email=row[8],
                                contact_phone=row[9],
                                active=True,
                                latitude=latitude,
                                longitude=longitude
                            )

                            SiteService.SiteInstance.save(site)

                            index = index + 1

                        elif entity == "service_order":

                            from services import ServiceOrderService, CustomerService, SiteService
                            from models import ServiceOrder, ServiceOrderState, PurposeOfService, AssetSize

                            '''looking for customer'''
                            customer_account_id = str(row[0])
                            customer = CustomerService.CustomerInstance.get_by_account_id(customer_account_id)
                            if customer is None:
                                error_list = error_list + "    Customer Account ID not found: " + customer_account_id + ".%"

                            '''looking for site'''
                            site_account_id = str(row[1])
                            site = SiteService.SiteInstance.get_by_account_id(site_account_id)
                            if site is None:
                                error_list = error_list + "    Site account ID not found: " + site_account_id + ".%"

                            try:
                                service_date = datetime.strptime(row[3], '%m/%d/%Y %H:%M')
                            except Exception, e:
                                print(e)
                                service_date = datetime.today()

                            purpose_of_service = row[5]
                            purpose_valid = False
                            for Purpose in PurposeOfService:
                                purpose_name = Purpose.name[:]
                                if (purpose_of_service == purpose_name):
                                    purpose_of_service = PurposeOfService(purpose_name)
                                    purpose_valid = True
                            if (not purpose_valid):
                                error_list = error_list + "    ServiceOrder does not specify a Type or Type format is incorrect.%"

                            asset_size = row[6]

                            asset_size_check = 0
                            asset_size_value = 0
                            for Asset in AssetSize:
                                asset_name = Asset.name[3:5]
                                if (asset_name == asset_size):
                                    asset_size_check = 1
                                    break
                                else:
                                    asset_size_value = asset_size_value + 1

                            if (asset_size_check != 1):
                                error_list = error_list + "after asset size"

                            service_order = ServiceOrder()

                            customer_key = customer.key.urlsafe()
                            company_key = customer.company_key.urlsafe()
                            site_key = site.key.urlsafe()

                            service_order.populate(
                                customer_account_id=row[0],
                                site_account_id=row[1],
                                service_ticket_id=row[2],
                                service_date=service_date,
                                service_time_frame=row[4],
                                purpose_of_service=purpose_of_service,
                                asset_size=AssetSize(asset_size_value),
                                notes=row[7],
                                source_system=source_system,
                                customer_key=ndb.Key(urlsafe=customer_key),
                                site_key=ndb.Key(urlsafe=site_key),
                                company_key=ndb.Key(urlsafe=company_key),
                                active=True,
                            )

                            service_ticket_id = row[2]
                            service_ticket_id_exists = ServiceOrderService.ServiceOrderInstance.get_by_service_ticket_id_and_company(
                                customer.company_key, str(service_ticket_id))
                            if service_ticket_id_exists is not None:
                                error_list = error_list + "    Service Ticket ID is not unique: " + str(
                                    service_ticket_id) + ".%"

                            if len(error_list) != 0:
                                raise ValueError("Error in uploading service orders.")

                            ServiceOrderService.ServiceOrderInstance.save(service_order)

                        elif entity == "yard":

                            from services import YardService
                            from models import Yard

                            yard = Yard()

                            yard.populate(
                                company_key=ndb.Key(urlsafe=company_key),
                                source_system=source_system,
                                yard_name=row[0],
                                yard_address=row[1],
                                yard_zipcode=row[2],
                                yard_state=row[3],
                                yard_city=row[4],
                                contact_name=row[5],
                                contact_email=row[6],
                                contact_phone=row[7],
                                active=json.loads(row[8].lower()) if row[8] is not None else True,
                                latitude=row[9],
                                longitude=row[10]
                            )

                            YardService.YardInstance.save(yard)

                        elif entity == "facility":

                            from services import FacilityService
                            from models import Facility

                            facility = Facility()

                            facility.populate(
                                company_key=ndb.Key(urlsafe=company_key),
                                source_system=source_system,
                                facility_name=row[0],
                                facility_address=row[1],
                                facility_zipcode=row[2],
                                facility_state=row[3],
                                facility_city=row[4],
                                contact_name=row[5],
                                contact_email=row[6],
                                contact_phone=row[7],
                                hours_of_operation=str(row[8]),
                                active=json.loads(row[9].lower()) if row[9] is not None else True,
                                latitude=row[10],
                                longitude=row[11]
                            )

                            FacilityService.FacilityInstance.save(facility)

                        elif entity == "vehicle":

                            from services import VehicleService, UserService
                            from models import Vehicle, User

                            email = str(row[4])

                            driver = UserService.UserInstance.get_by_email(email)

                            if driver is None:
                                raise ValueError("Driver with email %s not found" % email)
                                error_list = error_list + "    Driver with email %s not found" % email
                            if driver.has_role('DRIVER') == False:
                                raise ValueError("User exists but he/she does not have role Driver")
                                error_list = error_list + "    User exists but he/she does not have role Driver"
                            vehicle = Vehicle()

                            vehicle.populate(
                                company_key=ndb.Key(urlsafe=company_key),
                                source_system=source_system,
                                vehicle_name=row[0],
                                model=row[1],
                                size=row[2],
                                tag_number=str(row[3]),
                                driver_key=driver.key,
                                active=json.loads(row[5].lower()) if row[5] is not None else True,
                            )

                            VehicleService.VehicleInstance.save(vehicle)

                        else:
                            continue

                        total_inserted_rows = total_inserted_rows + 1
                    # This is where the errors for each row are logged.
                    except Exception, e:
                        errors.append({"The following error(s) occured in row": (index + 1)})
                        errors.append({"%^": error_list})
                        print("logging the exception")
                        print(e)
                        print("\n")
                        print(errors)
                        total_errors_rows = total_errors_rows + 1
                        error_list = ""
                        index = index + 1

                response = {
                    "total_inserted_rows": total_inserted_rows,
                    "total_errors_rows": total_errors_rows,
                    "errors": json.dumps(errors)
                }
                return self.json_data(get_success_reponse(response=response))

            else:
                return self.json_data(get_success_reponse(response="No file found"))

        except Exception, e:
            return self.audit(e)


class SiteHandler(BaseHandler):
    def post(self):
        try:
            from services import SiteService
            from models import Site

            data = json.loads(self.request.body)
            # raise ValueError("Site Handler: test 1")
            id = data.get('id')
            source_system_id = data.get('source_system_id')
            customer_key = data.get('customer_key')
            customer_account_id = data.get('customer_account_id')
            site_account_id = data.get('site_account_id')
            company_key = data.get('company_key')
            site_name = data.get('site_name')
            site_address = data.get('site_address')
            site_zipcode = data.get('site_zipcode')
            site_state = data.get('site_state')
            site_city = data.get('site_city')
            contact_name = data.get('contact_name')
            contact_email = data.get('contact_email')
            contact_phone = data.get('contact_phone')
            latitude = data.get('latitude')
            longitude = data.get('longitude')

            site = Site()

            site.populate(
                company_key=ndb.Key(urlsafe=company_key),
                source_system_id=source_system_id,
                source_system="web",
                customer_key=ndb.Key(urlsafe=customer_key),
                customer_account_id=customer_account_id,
                site_account_id=site_account_id,
                site_name=site_name,
                site_address=site_address,
                site_zipcode=site_zipcode,
                site_state=site_state,
                site_city=site_city,
                contact_name=contact_name,
                contact_email=contact_email,
                contact_phone=contact_phone,
                latitude=latitude,
                longitude=longitude
            )

            if id is not None:
                site.key = ndb.Key(urlsafe=id)

            site = SiteService.SiteInstance.save(site)
            logging.warning("no issues yet")
            return self.json_data(get_success_reponse(response=site.to_dict()))

        except Exception, e:
            return self.audit(e)

    def get(self):
        try:
            from services import SiteService
            from models import Site

            # Pagination
            page = self.request.get('page')
            page_size = self.request.get('page_size')

            # Filters
            filters = {}
            filters["active"] = self.request.get('active')
            filters["site_key"] = self.request.get('site_key')
            filters["customer_key"] = self.request.get('customer_key')
            filters["company_key"] = self.request.get('company_key')

            entities, total = SiteService.SiteInstance.get_all(page, page_size, filters)

            response = {
                "total": total,
                "records": json.loads(json.dumps([entity.to_dict() for entity in entities]))
            }

            return self.json_data(get_success_reponse(response=response))

        except Exception, e:
            return self.audit(e)

    def delete(self):
        try:
            from services import SiteService

            id = self.request.get('id')

            SiteService.SiteInstance.delete(id)

            return self.json_data(get_success_reponse())



        except Exception, e:
            return self.audit(e)


class ServiceOrderHandler(BaseHandler):
    def post(self):
        try:

            from services import ServiceOrderService
            from models import ServiceOrder, ServiceOrderState, PurposeOfService, AssetType, AssetSize, \
                ServiceOrderFailureReason

            data = json.loads(self.request.body)
            # logging.warning(data)

            id = data.get('id')
            source_system = data.get('source_system_id')
            customer_key = data.get('customer_key')
            site_key = data.get('site_key')
            company_key = data.get('company_key')
            customer_account_id = data.get('customer_account_id')
            site_account_id = data.get('site_account_id')
            service_ticket_id = data.get('service_ticket_id')

            instructions = data.get('instructions')
            notes = data.get('notes')
            state = data.get('state')
            # driver_entry_info = data.get('driver_entry_info')
            service_date = data.get('service_date')
            service_time_frame = data.get('service_time_frame')
            purpose_of_service = data.get('purpose_of_service')
            quantity = data.get('quantity')
            assets = data.get('assets')
            asset_size = data.get('asset_size')
            failure_reason = data.get('failure_reason')

            service_order = ServiceOrder()

            if state is None:
                state = 1

            if failure_reason is not None:
                failure_reason = ServiceOrderFailureReason(int(failure_reason))

            if assets is not None:
                assets = assets

            if asset_size is not None:
                asset_size = AssetSize(int(asset_size))

            if purpose_of_service is not None:
                purpose_of_service = PurposeOfService(int(purpose_of_service))

            if service_date is not None:
                service_date = datetime.strptime(service_date, "%m/%d/%Y %H:%M:%S")

            service_order.populate(
                company_key=ndb.Key(urlsafe=company_key),
                customer_account_id=customer_account_id,
                site_account_id=site_account_id,
                service_ticket_id=service_ticket_id,
                service_date=service_date,
                service_time_frame=service_time_frame,
                purpose_of_service=purpose_of_service,
                asset_size=asset_size,
                notes=notes,
                source_system=source_system,
                customer_key=ndb.Key(urlsafe=customer_key),
                site_key=ndb.Key(urlsafe=site_key),
                state=state,

                # active=json.loads(row[8].lower()) if row[8] is not None else True,
            )

            if id is not None:
                service_order.key = ndb.Key(urlsafe=id)

            service_order = ServiceOrderService.ServiceOrderInstance.save(service_order)

            return self.json_data(get_success_reponse(response=service_order.to_dict()))

        except Exception, e:

            logging.warning(e)
            return self.audit(e)

    def get(self):
        try:

            # # // ************Debug ***********************************////////////
            #             if True:
            #                 raise ValueError("Inside ServiceOrderHandler Get!!")
            # # //////////////////////////////////////////////////////////////
            from services import ServiceOrderService
            from models import ServiceOrder

            # Pagination
            page = self.request.get('page')
            page_size = self.request.get('page_size')

            # Filters
            filters = {}
            filters["active"] = self.request.get('active')
            filters["customer_key"] = self.request.get('customer_key')
            filters["site_key"] = self.request.get('site_key')
            filters["company_key"] = self.request.get('company_key')
            filters["driver_key"] = self.request.get('driver_key')
            filters["service_order_key"] = self.request.get('service_order_key')
            filters["state"] = self.request.get('state')
            filters["start_date"] = self.request.get('start_date')
            filters["end_date"] = self.request.get('end_date')

            entities, total = ServiceOrderService.ServiceOrderInstance.get_all(page, page_size, filters)

            response = {
                "total": total,
                "records": json.loads(json.dumps([entity.to_dict() for entity in entities]))
            }
            return self.json_data(get_success_reponse(response=response))

        except Exception, e:
            return self.audit(e)

    def delete(self):
        try:
            from services import ServiceOrderService

            id = self.request.get('id')

            ServiceOrderService.ServiceOrderInstance.delete(id)

            return self.json_data(get_success_reponse())

        except Exception, e:
            return self.audit(e)


class ServiceOrderProblemHandler(BaseHandler):
    def get(self):
        try:
            from services import ServiceOrderProblemService
            from models import ServiceOrderProblem

            # Pagination
            page = self.request.get('page')
            page_size = self.request.get('page_size')

            # Filters
            filters = {}
            filters["id"] = self.request.get('id')
            filters["service_order_key"] = self.request.get('service_order_key')
            filters["state"] = self.request.get('state')
            filters["start_date"] = self.request.get('start_date')
            filters["end_date"] = self.request.get('end_date')
            filters["company_key"] = self.request.get('company_key')
            filters["driver_key"] = self.request.get('driver_key')

            entities, total = ServiceOrderProblemService.ServiceOrderProblemInstance.get_all(page, page_size, filters)

            response = {
                "total": total,
                "records": json.loads(json.dumps([entity.to_dict() for entity in entities]))
            }

            return self.json_data(get_success_reponse(response=response))

        except Exception, e:
            return self.audit(e)


class ServiceOrderProblemChangeStatusHandler(BaseHandler):
    def post(self):
        try:
            from services import ServiceOrderProblemService

            data = json.loads(self.request.body)

            service_order_problem_key = data.get("service_order_problem_key")
            new_status = int(data.get("new_status"))

            service_order_problem = ServiceOrderProblemService.ServiceOrderProblemInstance.change_status(
                service_order_problem_key, new_status)

            return self.json_data(get_success_reponse(response=service_order_problem.to_dict()))

        except Exception, e:
            return self.audit(e)


class ServicePricingHandler(BaseHandler):
    def post(self):
        try:
            from services import ServicePrincingService
            from models import ServicePricing

            data = json.loads(self.request.body)

            company_key = data.get('company_key')
            entries = data.get('entries')
            result = []

            for entry in entries:

                service_pricing = ServicePricing()

                service_pricing.populate(
                    company_key=ndb.Key(urlsafe=company_key),
                    dumpser_size=entry["dumpser_size"],
                    active=entry["active"],
                    price=entry["price"]
                )

                if "id" in entry:
                    service_pricing.key = ndb.Key(urlsafe=entry["id"])

                service_pricing = ServicePrincingService.ServicePricingInstance.save(service_pricing)

                result.append(service_pricing)

            response = json.loads(json.dumps([entity.to_dict() for entity in result]))

            return self.json_data(get_success_reponse(response=response))

        except Exception, e:
            return self.audit(e)

    def get(self):
        try:
            from services import ServicePrincingService
            from models import ServicePricing

            # Pagination
            page = self.request.get('page')
            page_size = self.request.get('page_size')

            # Filters
            filters = {}
            filters["active"] = self.request.get('active')
            filters["company"] = self.request.get('company')

            entities, total = ServicePrincingService.ServicePricingInstance.get_all(page, page_size, filters)

            response = {
                "total": total,
                "records": json.loads(json.dumps([entity.to_dict() for entity in entities]))
            }

            return self.json_data(get_success_reponse(response=response))

        except Exception, e:
            return self.audit(e)

    def delete(self):
        try:
            from services import ServicePrincingService

            id = self.request.get('id')

            ServicePrincingService.ServicePricingInstance.delete(id)

            return self.json_data(get_success_reponse())

        except Exception, e:
            return self.audit(e)


class ListHandler(BaseHandler):
    def get(self, name):
        try:
            from services import ListsService

            response = ListsService.ListsInstance.get_by_name(name)

            result = get_success_reponse(response=response)

            return self.json_data(result)

        except Exception, e:
            return self.audit(e)


class YardHandler(BaseHandler):
    def post(self):
        try:
            from services import YardService
            from models import Yard

            data = json.loads(self.request.body)

            id = data.get('id')
            company_key = data.get('company_key')
            yard_name = data.get('yard_name')
            yard_address = data.get('yard_address')
            yard_zipcode = data.get('yard_zipcode')
            yard_state = data.get('yard_state')
            yard_city = data.get('yard_city')
            contact_name = data.get('contact_name')
            contact_email = data.get('contact_email')
            contact_phone = data.get('contact_phone')
            active = data.get('active')
            latitude = data.get('latitude')
            longitude = data.get('longitude')

            yard = Yard()

            yard.populate(
                source_system="web",
                company_key=ndb.Key(urlsafe=company_key),
                yard_name=yard_name,
                yard_address=yard_address,
                yard_zipcode=yard_zipcode,
                yard_state=yard_state,
                yard_city=yard_city,
                contact_name=contact_name,
                contact_email=contact_email,
                contact_phone=contact_phone,
                active=active,
                latitude=latitude,
                longitude=longitude
            )

            if id is not None:
                yard.key = ndb.Key(urlsafe=id)

            yard = YardService.YardInstance.save(yard)

            return self.json_data(get_success_reponse(response=yard.to_dict()))

        except Exception, e:
            return self.audit(e)

    def get(self):
        try:
            from services import YardService
            from models import Yard

            # Pagination
            page = self.request.get('page')
            page_size = self.request.get('page_size')

            # Filters
            filters = {}
            filters["active"] = self.request.get('active')
            filters["yard_key"] = self.request.get('yard_key')
            filters["company_key"] = self.request.get('company_key')

            entities, total = YardService.YardInstance.get_all(page, page_size, filters)

            response = {
                "total": total,
                "records": json.loads(json.dumps([entity.to_dict() for entity in entities]))
            }

            return self.json_data(get_success_reponse(response=response))

        except Exception, e:
            # todo: @adozier, clean up error reporting into one or two derived methods in BaseHandler

            return self.audit(e)

    def delete(self):
        try:
            from services import YardService

            id = self.request.get('id')

            YardService.YardInstance.delete(id)

            return self.json_data(get_success_reponse())

        except Exception, e:
            return self.audit(e)


class DriverHandler(BaseHandler):
    """
    Handles queries for a Driver entity
    """

    def get(self):
        try:
            from services import DriverService
            from models import Driver

            driver_id = self.request.get('id')

            driver = DriverService.DriverInstance.get(driver_id)

            response = {"driver": driver.to_dict()}

            return self.json_data(get_success_reponse(response=response))

        except Exception, e:
            return self.audit(e)

    def post(self):
        try:
            from services import DriverService
            from models import Driver
            print("driver---------------")

            data = json.loads(self.request.body)

            id = data.get('id')

            driver_operational = data.get('driver_operational')
            company_key = data.get('company_key')
            user_key = data.get('user_key')
            driver_name = data.get('driver_name')
            driver_email = data.get('driver_email')
            driver_phone = data.get('driver_phone')
            driver_id = data.get('driver_id')
            active = data.get('active')

            driver = Driver()

            driver.populate(
                company_key=ndb.Key(urlsafe=company_key),
                user_key=ndb.Key(urlsafe=user_key),
                driver_email=driver_email,
                driver_name=driver_name,
                driver_phone=driver_phone,
                driver_id=driver_id,
                driver_operational=driver_operational,
            )

            if id is not None:
                driver.key = ndb.Key(urlsafe=id)

            driver = DriverService.DriverInstance.save(driver)

            return self.json_data(get_success_reponse(response=driver.to_dict()))

        except Exception, e:
            return self.audit(e)

    def delete(self):
        try:
            from services import DriverService

            id = self.request.get('id')

            DriverService.DriverInstance.delete(id)

            # Filters
            filters = {}
            filters["active"] = self.request.get('active')
            filters["driver_key"] = self.request.get('driver_key')
            filters["company_key"] = self.request.get('company_key')

        except Exception, e:
            return self.audit(e)


class DriverListHandler(BaseHandler):

    def get(self):
        try:
            from services import DriverService
            from models import Driver

            # Pagination
            page = self.request.get('page')
            page_size = self.request.get('page_size')

            # Filters
            filters = {
                "active": self.request.get('active'),
                "driver_key": self.request.get('driver_key'),
                "company_key": self.request.get('company_key'),
                "user_key": self.request.get('user_key'),
            }

            entities, total = DriverService.DriverInstance.get_all(page, page_size, filters)

            response = {
                "total": total,
                "records": json.loads(json.dumps([entity.to_dict() for entity in entities]))
            }

            return self.json_data(get_success_reponse(response=response))

        except Exception, e:
            return self.audit(e)


class FacilityHandler(BaseHandler):
    def post(self):
        try:
            from services import FacilityService
            from models import Facility

            data = json.loads(self.request.body)

            id = data.get('id')
            company_key = data.get('company_key')
            facility_name = data.get('facility_name')
            facility_address = data.get('facility_address')
            facility_zipcode = data.get('facility_zipcode')
            facility_state = data.get('facility_state')
            facility_city = data.get('facility_city')
            contact_name = data.get('contact_name')
            contact_email = data.get('contact_email')
            contact_phone = data.get('contact_phone')
            hours_of_operation = data.get('hours_of_operation')
            active = data.get('active')
            latitude = data.get('latitude')
            longitude = data.get('longitude')

            facility = Facility()

            facility.populate(
                source_system="web",
                company_key=ndb.Key(urlsafe=company_key),
                facility_name=facility_name,
                facility_address=facility_address,
                facility_zipcode=facility_zipcode,
                facility_state=facility_state,
                facility_city=facility_city,
                contact_name=contact_name,
                contact_email=contact_email,
                contact_phone=contact_phone,
                hours_of_operation=hours_of_operation,
                active=active,
                latitude=latitude,
                longitude=longitude
            )

            if id is not None:
                facility.key = ndb.Key(urlsafe=id)

            facility = FacilityService.FacilityInstance.save(facility)

            return self.json_data(get_success_reponse(response=facility.to_dict()))

        except Exception, e:
            return self.audit(e)

    def get(self):
        try:
            from services import FacilityService
            from models import Facility

            # Pagination
            page = self.request.get('page')
            page_size = self.request.get('page_size')

            # Filters
            filters = {}
            filters["active"] = self.request.get('active')
            filters["facility_key"] = self.request.get('facility_key')
            filters["company_key"] = self.request.get('company_key')

            entities, total = FacilityService.FacilityInstance.get_all(page, page_size, filters)

            response = {
                "total": total,
                "records": json.loads(json.dumps([entity.to_dict() for entity in entities]))
            }

            return self.json_data(get_success_reponse(response=response))

        except Exception, e:
            return self.audit(e)

    def delete(self):
        try:
            from services import FacilityService

            id = self.request.get('id')

            FacilityService.FacilityInstance.delete(id)

            return self.json_data(get_success_reponse())

        except Exception, e:
            return self.audit(e)


class VehicleHandler(BaseHandler):
    def post(self):
        try:
            from services import VehicleService
            from models import Vehicle

            data = json.loads(self.request.body)

            id = data.get('id')
            company_key = data.get('company_key')
            vehicle_name = data.get('vehicle_name')
            driver_key = data.get('driver_key')
            model = data.get('model')
            size = data.get('size')
            tag_number = data.get('tag_number')
            active = data.get('active')

            vehicle = Vehicle()

            driver = ndb.Key(urlsafe=driver_key).get()

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

            vehicle.populate(
                source_system="web",
                company_key=ndb.Key(urlsafe=company_key),
                driver_key=ndb.Key(urlsafe=driver_key),
                vehicle_name=vehicle_name,
                model=model,
                size=size,
                tag_number=tag_number,
                active=active
            )

            if id is not None:
                vehicle.key = ndb.Key(urlsafe=id)

            vehicle = VehicleService.VehicleInstance.save(vehicle)

            return self.json_data(get_success_reponse(response=vehicle.to_dict()))

        except Exception, e:
            return self.audit(e)

    def get(self):
        try:
            from services import VehicleService
            from models import Vehicle

            # Pagination
            page = self.request.get('page')
            page_size = self.request.get('page_size')

            # Filters
            filters = {}
            filters["active"] = self.request.get('active')
            filters["vehicle_key"] = self.request.get('vehicle_key')
            filters["driver_key"] = self.request.get('driver_key')
            filters["company_key"] = self.request.get('company_key')
            entities, total = VehicleService.VehicleInstance.get_all(page, page_size, filters)

            response = {
                "total": total,
                "records": json.loads(json.dumps([entity.to_dict() for entity in entities]))
            }

            return self.json_data(get_success_reponse(response=response))

        except Exception, e:
            return self.audit(e)

    def delete(self):
        try:
            from services import VehicleService

            id = self.request.get('id')

            VehicleService.VehicleInstance.delete(id)

            return self.json_data(get_success_reponse())

        except Exception, e:
            return self.audit(e)


class RouteHandler(BaseHandler):
    def post(self):
        try:
            from services import RouteService
            from models import Route
            from models import RouteStatus

            data = json.loads(self.request.body)

            id = data.get('id')
            company_key = data.get('company_key')
            date = data.get('date')
            driver_key = data.get('driver_key')
            # vehicle_key = data.get('vehicle_key')
            total_distance = data.get('total_distance')
            total_time = data.get('total_time')
            num_of_stops = data.get('num_of_stops')
            status = data.get('status')
            notes = data.get('notes')

            route = Route()

            if company_key is not None:
                company_key = ndb.Key(urlsafe=company_key)

            if driver_key is not None:
                driver_key = ndb.Key(urlsafe=driver_key)

            if status is not None:
                status = RouteStatus(status)

            route.populate(
                company_key=company_key,
                date=datetime.strptime(date, "%m/%d/%Y"),
                driver_key=driver_key,
                total_distance=total_distance,
                total_time=total_time,
                num_of_stops=num_of_stops,
                status=status,
                notes=notes
                # vehicle_key=ndb.Key(urlsafe=vehicle_key),
            )

            if id is not None:
                route.key = ndb.Key(urlsafe=id)

            route = RouteService.RouteInstance.save(route)

            return self.json_data(get_success_reponse(response=route.to_dict()))

        except Exception, e:
            return self.audit(e)

    def get(self):
        try:
            from services import RouteService
            from models import Route

            # Pagination
            page = self.request.get('page')
            page_size = self.request.get('page_size')

            # Filters
            filters = {
                "active": self.request.get('active'),
                "route_key": self.request.get('route_key'),
                "vehicle_key": self.request.get('vehicle_key'),
                "company_key": self.request.get('company_key'),
                "driver_key": self.request.get('driver_key'),
                "start_date": self.request.get('start_date'),
                "end_date": self.request.get('end_date'),
                "status": self.request.get('status'),
                "optimized": self.request.get('optimized'),
            }

            entities, total = RouteService.RouteInstance.get_all(page, page_size, filters)

            if filters["optimized"] and json.loads(filters["optimized"]) == True:
                response = {
                    "total": total,
                    "records": json.loads(json.dumps([entity.to_dict_optimized() for entity in entities]))
                }
            else:
                response = {
                    "total": total,
                    "records": json.loads(json.dumps([entity.to_dict() for entity in entities]))
                }

            return self.json_data(get_success_reponse(response=response))

        except Exception, e:
            return self.audit(e)

    def delete(self):
        try:
            from services import RouteService

            id = self.request.get('id')

            RouteService.RouteInstance.delete(id)

            return self.json_data(get_success_reponse())

        except Exception, e:
            return self.audit(e)


class RoutesAndRouteItemHandler(BaseHandler):
    def post(self):
        try:
            from services import RouteItemService
            from models import RouteItem
            from services import RouteService
            from models import Route
            from models import RouteStatus

            print("Inside RoutesAndRouteItemHandler \n")

            routes = json.loads(self.request.body)

            for data in routes:

                print("entering the data \n")



                company_key = data.get('company_key')
                date = data.get('date')
                total_distance = data.get('distance')
                total_time = data.get('time')
                route_items = data.get('route_items')
                num_of_stops = len(route_items)

                route = Route()

                if company_key is not None:
                    company_key = ndb.Key(urlsafe=company_key)




                print("about to populate the route \n")

                route.populate(
                    company_key= company_key,
                    date=datetime.strptime(date, "%m/%d/%Y"),
                    total_distance = total_distance,
                    total_time = total_time,
                    num_of_stops = num_of_stops,
                )

                route = RouteService.RouteInstance.save(route)




                print("INSIDE RouteItemHandler")

                data = json.loads(self.request.body)

                entity_types = ["yard", "serviceorder", "facility"]

                for item in route_items:

                    dist_2_next = item.get('dist_2_next')
                    time_2_next = item.get('time_2_next')

                    route_key = route.key.id()
                    entity_type = item.get('entity_type')
                    item_key = item.get('entity_key')
                    sort_index = item.get('sort_index')
                    latitude = item.get('latitude')
                    longitude = item.get('longitude')
                    active = item.get('active')

                    print("about to populate the route item")

                    route_item = RouteItem()

                    if entity_type not in entity_types:
                        raise ValueError("Entity Type not allowed")

                    print("ok we got this far")
                    print(route_key)
                    print(dist_2_next)
                    print(time_2_next)
                    print(entity_type)
                    print(item_key)
                    print(sort_index)

                    route_item.populate(
                        route_key=ndb.Key(Route,route_key),
                        dist_2_next = dist_2_next,
                        time_2_next = time_2_next,
                        entity_type=entity_type,
                        item_key=item_key,
                        sort_index=sort_index,
                    )
                    print("past the populate")
                    RouteItemService.RouteItemInstance.save(route_item)

            return self.json_data("SUCCESS")

        except Exception, e:
            errors = [str(e)]

            message = "class: %s, method: %s" % (self.__class__.__name__, inspect.stack()[0][3])

            audit = Audit()
            audit.populate(
                user_email=users.get_current_user().email(),
                error=str(e),
                message=message
            )
            AuditService.AuditInstance.save(audit)

            return self.json_data(get_fail_response(errors))

class FlushRoutesHandler(BaseHandler):
    def delete(self):
        try:
            from services import RouteService
            from services import RouteItemService

            print("\n Inside FlushRoutesHandler \n")
            # Filters
            filters = {}
            filters["company_key"] = self.request.get('company_key')
            filters["date"]=self.request.get('date')


            print("\n About to query entities \n")

            print(filters)
            print("\n")

            entities, total = RouteService.RouteInstance.get_todays(filters)

            print("finished the query")

            for entity in entities:
                route_item_filters = {}
                route_item_filters["active"] = self.request.get('active')
                route_item_filters["route_key"] = self.request.get('route_key')
                route_items, total_route_items = RouteItemService.RouteItemInstance.get_all('', '', route_item_filters)

                for route_item in route_items:
                    route_item.key.delete()

                entity.key.delete()

            return self.json_data(get_success_reponse())

        except Exception, e:
            return self.audit(e)


class RouteItemStatusHandler(BaseHandler):

    def post(self):
        try:
            from services import RouteItemService
            data = json.loads(self.request.body)
            key = data.get('id')
            status = int(data.get('status'))
            RouteItemService.RouteItemInstance.set_status(key, status)

        except Exception, e:
            return self.audit(e)

    def get(self):
        try:
            from services import RouteItemService
            key = self.request.get('id')
            status = RouteItemService.RouteItemInstance.get_status(key)
            return self.json_data(get_success_reponse(status=status))

        except Exception, e:
            return self.audit(e)


class RouteItemHandler(BaseHandler):
    def post(self):
        try:
            from services import RouteItemService
            from models import RouteItem

            print("INSIDE RouteItemHandler")

            data = json.loads(self.request.body)

            entity_types = ["yard", "serviceorder", "facility"]

            for item in data:

                id = item.get('id')
                dist_2_next = item.get('dist_2_next')
                time_2_next = item.get('time_2_next')
                route_key = item.get('route_key')
                entity_type = item.get('entity_type')
                item_key = item.get('entity_key')
                sort_index = item.get('sort_index')
                latitude = item.get('latitude')
                longitude = item.get('longitude')
                active = item.get('active')
                status = item.get('status')

                route_item = RouteItem()

                if entity_type not in entity_types:
                    raise ValueError("Entity Type not allowed")

                print("ok we got this far")

                route_item.populate(
                    route_key=ndb.Key(urlsafe=route_key),
                    dist_2_next=dist_2_next,
                    time_2_next=time_2_next,
                    entity_type=entity_type,
                    item_key=item_key,
                    sort_index=sort_index,
                )

                route_item = RouteItemService.RouteItemInstance.save(route_item)

        except Exception, e:
            return self.audit(e)

    def get(self):
        try:
            from services import RouteItemService
            from models import RouteItem
            logging.warning("inside routeitemget")
            logging.warning(self)
            # Pagination
            page = self.request.get('page')
            page_size = self.request.get('page_size')
            # Filters
            filters = {}
            filters["active"] = self.request.get('active')
            filters["route_key"] = self.request.get('route_key')

            entities, total = RouteItemService.RouteItemInstance.get_all(page, page_size, filters)

            # print("total route items: %s"%total)
            # print(entities)
            response = {
                "total": total,
                "records": json.loads(json.dumps([entity.to_dict() for entity in entities]))
            }

            return self.json_data(get_success_reponse(response=response))

        except Exception, e:
            return self.audit(e)


class SendSmsHandler(BaseHandler):
    def post(self):
        try:
            data = json.loads(self.request.body)

            to = data.get('to')
            message = data.get('message')

            from helpers import SmsApi

            response = SmsApi.Twilio.send(to, message)

            return self.json_data(get_success_reponse())

        except Exception, e:
            errors = [str(e)]
            return self.json_data(get_fail_response(errors))


class SendSmsToDriverHandler(BaseHandler):
    def post(self):
        try:
            data = json.loads(self.request.body)

            driver_key = data.get('driver_key')
            message = data.get('message')

            driver = ndb.Key(urlsafe=driver_key).get()

            if driver is not None:
                roles = Role.query(ancestor=driver.key).fetch()

                is_driver = False
                for role in roles:

                    if role.name == 'DRIVER':
                        is_driver = True
                        break

                if is_driver:

                    if not driver.contact_phone_mobile:
                        raise ValueError("Driver hasn't a valid contact phone mobile associated")

                    from helpers import SmsApi
                    response = SmsApi.Twilio.send(driver.contact_phone_mobile, message)
                    return self.json_data(get_success_reponse())

                else:
                    raise ValueError("The key is associated to one user but he/she is not a driver")

            else:
                raise ValueError("Driver does not exists")

        except Exception, e:
            errors = [str(e)]
            return self.json_data(get_fail_response(errors))


class AssetInventoryHandler(BaseHandler):

    def get(self):
        try:
            from services import AssetInventoryService
            from models import AssetInventory

            # Pagination
            page = self.request.get('page')
            page_size = self.request.get('page_size')

            # Filters
            filters = {}
            filters["company_key"] = self.request.get('company_key')

            entities, total = AssetInventoryService.AssetInventoryInstance.get_all(page, page_size, filters)

            response = {
                "total": total,
                "records": json.loads(json.dumps([entity.to_dict() for entity in entities]))
            }

            return self.json_data(get_success_reponse(response=response))

        except Exception, e:
            return self.audit(e)


class MessageHandler(BaseHandler):
    def post(self):
        try:
            from services import MessageService
            from models import Message

            data = json.loads(self.request.body)

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

            return self.json_data(get_success_reponse(response=message.to_dict()))

        except Exception, e:
            return self.audit(e)

    def get(self):
        try:
            from services import MessageService
            from models import Message

            # Pagination
            page = self.request.get('page')
            page_size = self.request.get('page_size')

            # Filters
            filters = {}
            filters["id"] = self.request.get('id')
            filters["company_key"] = self.request.get('company_key')
            filters["sender_user_key"] = self.request.get('sender_user_key')
            filters["receiver_user_key"] = self.request.get('receiver_user_key')
            filters["active"] = self.request.get('active')
            filters["date"] = self.request.get('date')
            filters["start_date"] = self.request.get('start_date')
            filters["end_date"] = self.request.get('end_date')
            filters["parent_message_key"] = self.request.get('parent_message_key')

            # options
            options = {}
            options["no-childs"] = self.request.get('no-childs')

            # Sort
            sort = self.request.get('sort')

            entities, total = MessageService.MessageInstance.get_all(page, page_size, filters, sort)

            response = {
                "total": total,
                "records": json.loads(json.dumps([entity.to_dict_with_childs(options) for entity in entities]))
            }

            return self.json_data(get_success_reponse(response=response))

        except Exception, e:
            return self.audit(e)

    def delete(self):
        try:
            from services import MessageService

            id = self.request.get('id')

            MessageService.MessageInstance.delete(id)

            return self.json_data(get_success_reponse())

        except Exception, e:
            return self.audit(e)


class NotificationHandler(BaseHandler):
    def post(self):
        try:
            from services import NotificationService
            from models import Notification

            data = json.loads(self.request.body)

            id = data.get('id')
            company_key = data.get('company_key')
            user_key = data.get('user_key')
            notification_text = data.get("notification_text")
            notification_params = data.get("notification_params")
            notification_status = data.get("notification_status")
            notification_type = data.get("notification_type")

            notification = Notification()

            notification.populate(
                company_key=ndb.Key(urlsafe=company_key),
                user_key=ndb.Key(urlsafe=user_key),
                notification_text=notification_text,
                notification_params=notification_params,
                notification_status=notification_status,
                notification_type=notification_type
            )

            if id is not None:
                notification.key = ndb.Key(urlsafe=id)

            notification = NotificationService.NotificationInstance.save(notification)

            return self.json_data(get_success_reponse(response=notification.to_dict()))

        except Exception, e:
            return self.audit(e)

    def get(self):
        try:
            from services import NotificationService
            from models import Notification

            # Pagination
            page = self.request.get('page')
            page_size = self.request.get('page_size')

            # Filters
            filters = {}
            filters["id"] = self.request.get('id')
            filters["company_key"] = self.request.get('company_key')
            filters["user_key"] = self.request.get('user_key')
            filters["active"] = self.request.get('active')
            filters["date"] = self.request.get('date')
            filters["start_date"] = self.request.get('start_date')
            filters["end_date"] = self.request.get('end_date')
            filters["notification_status"] = self.request.get('notification_status')
            filters["notification_type"] = self.request.get('notification_type')
            filters["optimized"] = self.request.get('optimized')

            # Sort
            sort = self.request.get('sort')

            entities, total = NotificationService.NotificationInstance.get_all(page, page_size, filters, sort)

            if (filters["optimized"] and json.loads(filters["optimized"]) == True):
                response = {
                    "total": total,
                    "records": json.loads(json.dumps([entity.to_dict_optimized() for entity in entities]))
                }
            else:
                response = {
                    "total": total,
                    "records": json.loads(json.dumps([entity.to_dict() for entity in entities]))
                }

            return self.json_data(get_success_reponse(response=response))

        except Exception, e:
            return self.audit(e)

    def delete(self):
        try:
            from services import NotificationService

            id = self.request.get('id')

            NotificationService.NotificationInstance.delete(id)

            return self.json_data(get_success_reponse())

        except Exception, e:
            return self.audit(e)


class RouteIncidentHandler(BaseHandler):

    def post(self):
        try:

            from services import RouteIncidentService, ServiceOrderService
            from models import RouteIncident, RouteIncidentStatus

            data = json.loads(self.request.body)

            id = data.get('id')
            service_ticket_id = data.get('service_ticket_id')
            # driver_key = data.get('driver_key')
            order_key = data.get('order_id')
            # incident_type = data.get("incident_type")
            order_canceled = data.get('order_canceled')
            # status = data.get("status")
            report_datetime = data.get('report_datetime')
            if report_datetime is not None:
                report_datetime = datetime.strptime(report_datetime, "%m/%d/%Y %H:%M:%S")

            incident_notes = data.get("incident_notes")

            route_incident = RouteIncident()

            route_incident.populate(
                # driver_key=ndb.Key(urlsafe=driver_key),
                order_key=ndb.Key(urlsafe=order_key),
                report_datetime=report_datetime,
                service_ticket_id=service_ticket_id,
                order_canceled=order_canceled,
                # incident_type=incident_type,
                incident_notes=incident_notes,
            )

            if order_canceled:
                # ServiceOrderService.ServiceOrderInstance.delete(order_key)
                ServiceOrderService.ServiceOrderInstance.activedactive(order_key, False)

            # The line below is where the error is occuring. acting as if the incident has an id when it does not
            if id is not None:
                route_incident.key = ndb.Key(urlsafe=id)

            route_incident = RouteIncidentService.RouteIncidentInstance.save(route_incident)

            return self.json_data(get_success_reponse(response=route_incident.to_dict()))

        except Exception, e:
            return self.audit(e)

    def get(self):
        try:
            from services import RouteIncidentService

            # Pagination
            page = self.request.get('page')
            page_size = self.request.get('page_size')

            # Filters
            filters = {}
            filters["id"] = self.request.get('id')
            # filters["route_key"] = self.request.get('route_key')
            filters["order_key"] = self.request.get('order_key')
            filters["start_date"] = self.request.get('start_date')
            filters["end_date"] = self.request.get('end_date')
            filters["company_key"] = self.request.get('company_key')
            logging.warning("get incident list starts here")
            entities, total = RouteIncidentService.RouteIncidentInstance.get_all(page, page_size, filters)

            response = {
                "total": total,
                "records": json.loads(json.dumps([entity.to_dict() for entity in entities]))
            }

            return self.json_data(get_success_reponse(response=response))

        except Exception, e:
            return self.audit(e)

    def delete(self):
        try:
            from services import RouteIncidentService

            id = self.request.get('id')

            RouteIncidentService.RouteIncidentInstance.delete(id)

            return self.json_data(get_success_reponse())

        except Exception, e:
            return self.audit(e)


class AttachmentHandler(blobstore_handlers.BlobstoreUploadHandler, BaseHandler):

    def post(self):
        try:
            from helpers import Attachments

            data = json.loads(self.request.body)

            file_name = data.get("file_name")
            file_data = data.get("file_data")
            content_type = data.get("content_type")
            entity_key = data.get("entity_key")

            response = Attachments.AttachmentsHelper.upload(file_name, file_data, content_type, entity_key)

            return self.json_data(get_success_reponse(response=response))

        except Exception, e:
            return self.audit(e)

    def get(self):
        try:
            from helpers import Attachments

            entity_key = self.request.get('entity_key')

            list = Attachments.AttachmentsHelper.get_attachments_by_entity_key(entity_key)

            response = json.loads(json.dumps(list))

            return self.json_data(get_success_reponse(response=response))
        except Exception, e:
            return self.audit(e)


class RoutePositionHistoryHandler(BaseHandler):

    def post(self):
        try:
            from services import RoutePositionHistoryService
            from models import RoutePositionHistory

            data = json.loads(self.request.body)

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

            route_position_history = RoutePositionHistoryService.RoutePositionHistoryInstance.save(
                route_position_history)

            return self.json_data(get_success_reponse(response=route_position_history.to_dict()))

        except Exception, e:
            return self.audit(e)

    def get(self):
        try:
            from services import RoutePositionHistoryService

            # Pagination
            page = self.request.get('page')
            page_size = self.request.get('page_size')

            # Filters
            filters = {}
            filters["id"] = self.request.get('id')
            filters["route_key"] = self.request.get('route_key')

            entities, total = RoutePositionHistoryService.RoutePositionHistoryInstance.get_all(page, page_size, filters)

            response = {
                "total": total,
                "records": json.loads(json.dumps([entity.to_dict() for entity in entities]))
            }

            return self.json_data(get_success_reponse(response=response))

        except Exception, e:
            return self.audit(e)


class TestRouteHandler(BaseHandler):
    def get(self):
        # try:
        from services import RouteService, RouteItemService, FacilityService
        from models import Route, RouteItem, Facility

        route = Route()

        date = "05/04/2018 12:12:00"

        route.populate(
            date=datetime.strptime(date, "%m/%d/%Y %H:%M:%S"),
            company_key=ndb.Key(urlsafe="aghkZXZ-Tm9uZXIUCxIHQ29tcGFueRiAgICAgPCLCgw"),
            notes="",
            driver_key=ndb.Key(urlsafe="aghkZXZ-Tm9uZXIRCxIEVXNlchiAgICAgICACgw"),
            vehicle_key=ndb.Key(urlsafe="aghkZXZ-Tm9uZXIUCxIHVmVoaWNsZRiAgICAgMjjCww"),
        )

        route = RouteService.RouteInstance.save(route)

        facilities, total = FacilityService.FacilityInstance.get_all(None, None, {
            "company_key": "aghkZXZ-Tm9uZXIUCxIHQ29tcGFueRiAgICAgPCLCgw", "facility_key": "", "active": "all"})

        print(facilities)

        for x in range(len(facilities)):
            route_item = RouteItem()
            f = facilities[x]

            route_item.populate(route_key=route.key,
                                entity_type="facility",
                                entity_key=f.key,
                                sort_index=x,
                                active=True,
                                latitude=f.latitude,
                                longitude=f.longitude)
            RouteItemService.RouteItemInstance.save(route_item)

        return self.json_data(get_success_reponse(response=route.to_dict()))
