import cherrypy
from genshi.template import TemplateLoader


class AuthUtils(object):
  SESSION_KEY = '_cp_username'
  AUTH_REQUIRED_FLAG = 'auth.require'

  @staticmethod
  def check_credentials(username, password):
    """Verifies credentials for username and password.
    Returns None on success or a string describing the error on failure
    """
    if username in ('joe', 'steve', 'bobette'):
      return None
    else:
      return u"Incorrect username or password."

  @staticmethod
  def check_auth(*args, **kwargs):
    """A tool that looks in config for 'auth.require'. If found and it
    is not None, a login is required and the entry is evaluated as a list of
    conditions that the user must fulfill"""
    from pdb import set_trace as dbg
    dbg()
    conditions = cherrypy.request.config.get('auth.require', None)
    if conditions is not None:
      username = cherrypy.session.get(AuthUtils.SESSION_KEY)
      if username:
        cherrypy.request.login = username

        # Check if a precondition is not respected
        # When so, redirect to login
        for condition in conditions:
          if not condition():
            raise cherrypy.HTTPRedirect("/auth/login")
      else:
        raise cherrypy.HTTPRedirect("/auth/login")

  @staticmethod
  def require(*conditions):
    """A decorator that appends conditions to the auth.require config
    variable."""
    def decorate(f):
      if not hasattr(f, '_cp_config'):
        f._cp_config = dict()
      if 'auth.require' not in f._cp_config:
        f._cp_config['auth.require'] = []
      f._cp_config['auth.require'].extend(conditions)
      return f
    return decorate


  # Conditions are callables that return True
  # if the user fulfills the conditions they define, False otherwise
  #
  # They can access the current username as cherrypy.request.login
  #
  # Define those at will however suits the application.
  @staticmethod
  def member_of(groupname):
    def check():
      # replace with actual check if <username> is in <groupname>
      return cherrypy.request.login == 'joe' and groupname == 'admin'
    return check

  @staticmethod
  def name_is(reqd_username):
    return lambda: reqd_username == cherrypy.request.login

  # These might be handy
  @staticmethod
  def any_of(*conditions):
    """Returns True if any of the conditions match"""
    def check():
      for c in conditions:
        if c():
          return True
      return False
    return check

  # By default all conditions are required, but this might still be
  # needed if you want to use it inside of an any_of(...) condition
  @staticmethod
  def all_of(*conditions):
    """Returns True if all of the conditions match"""
    def check():
      for c in conditions:
        if not c():
          return False
      return True
    return check


class AuthController(object):
  """
  Controller for the privacy and restriction rules
  """

  def __init__(self, template_path, logger):
    """
    AuthController initialiser

    @param template_path: Path to the template directory
    @param logger: The CIDE.py logger instance
    """
    self._loader = TemplateLoader(template_path, auto_reload=True)
    self._logger = logger

    self._logger.debug("AuthController instance created")
    
  def on_login(self, username):
    """Called on successful login"""
  
  def on_logout(self, username):
      """Called on logout"""
  
  def get_loginform(self, username, msg="Enter login information", from_page="/"):
      return """<html><body>
          <form method="post" action="/auth/login">
          <input type="hidden" name="from_page" value="%(from_page)s" />
          %(msg)s<br />
          Username: <input type="text" name="username" value="%(username)s" /><br />
          Password: <input type="password" name="password" /><br />
          <input type="submit" value="Log in" />
      </body></html>""" % locals()
  
  @cherrypy.expose
  def index(self):
    return "Auth index"

  @cherrypy.expose
  def login(self, username=None, password=None, from_page="/"):
    # This function is called by the login form
    if username is None or password is None:
      return self.get_loginform("", from_page=from_page)
    
    # Login form fields were not empty
    # When credential are checked and valid, they are saved
    error_msg = AuthUtils.check_credentials(username, password)
    if error_msg:
      # Credentials were not accepted
      return self.get_loginform(username, error_msg, from_page)
    else:
      cherrypy.session[AuthUtils.SESSION_KEY] = cherrypy.request.login = username
      self.on_login(username)
      raise cherrypy.HTTPRedirect(from_page or "/")
  
  @cherrypy.expose
  def logout(self, from_page="/"):
    username = cherrypy.session.get(AuthUtils.SESSION_KEY, None)
    cherrypy.session[AuthUtils.SESSION_KEY] = None
    if username:
      cherrypy.request.login = None
      self.on_logout(username)
    raise cherrypy.HTTPRedirect(from_page or "/")