import webapp2

import config
from basehandlers import *

app = webapp2.WSGIApplication([


], debug=False, config=config.WEBAPP2CONFIG)
