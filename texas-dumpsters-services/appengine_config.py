from google.appengine.ext import vendor

# Add any libraries installed in the "lib" folder.
vendor.add('./lib')

#def namespace_manager_default_namespace_for_request():
    # other ideas
    # return os.environ.get('HTTP_HOST', '')
    # 
    # from google.appengine.api import namespace_manager
    # return namespace_manager.google_apps_namespace()
    # https://cloud.google.com/appengine/docs/python/multitenancy/multitenancy#Python_Setting_the_current_namespace

#    return 'DEV'
