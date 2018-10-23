APP_ID = None
if not APP_ID:
    from google.appengine.api import app_identity
    APP_ID = app_identity.get_application_id()

CORS_APPROVED = [
    'http://localhost:4200',
    'http://localhost:8000',
    'https://localhost:8080',
    'https://ropromo-214500.appspot.com/pricing',
    ]

NOREPLY_EMAIL = 'noreply@%s.appspotmail.com' % APP_ID


SECRET_KEY = 'REPLACE_DURING_DEPLOYMENT'

WEBAPP2CONFIG = {
    'webapp2_extras.auth': {
        'user_model': 'models.User',
        'user_attributes': ['email', 'first_name', 'last_name', 'country']
        },
    'webapp2_extras.sessions': {
        'secret_key': SECRET_KEY,
        }
    }

GOOGLE_CLOUD_STORAGE_BASE_ADDRESS_TO_DOWNLOAD = 'https://storage.googleapis.com'

API_KEY = 'cb1f8ad9-a7ca-4170-8726-76081d5a0d94'

TWILIO_ACCOUNT_SID = "AC80170de15c63cdc1d5c0f8aaf8b8be83"
TWILIO_AUTH_TOKEN = "14f871aeef4233b4adf66ea7b7ce6e6f"
TWILIO_NUMBER = "+14159361416"


#### DEV CONFIGURATION
VALID_AUTHENTICATION = False

'''Mobile Api Settings'''
WEB_CLIENT_ID = '767088802341-h97ji8mk0ikknqhegrkg0vruvp95tf0q.apps.googleusercontent.com'
ANDROID_CLIENT_ID = '767088802341-bcsn8hbpbfa5evnfk189t8jecea591b7.apps.googleusercontent.com'
IOS_CLIENT_ID = '767088802341-lcq4sqio8lbcecovpsa9q5tldupgdaql.apps.googleusercontent.com'

#### DEV CONFIGURATION


#### PROD CONFIGURATION
#VALID_AUTHENTICATION = True

#'''Mobile Api Settings'''
#WEB_CLIENT_ID = '718296751806-fntcnd4n2qugnn4nlsdipv3lrak7ucpb.apps.googleusercontent.com'
#ANDROID_CLIENT_ID = '767088802341-bcsn8hbpbfa5evnfk189t8jecea591b7.apps.googleusercontent.com'
#IOS_CLIENT_ID = '718296751806-gec4ru7iqbbpngv9onm0dh242iv7hjs5.apps.googleusercontent.com'

#### PROD CONFIGURATION
