import cherrypy
import urllib
from threading import Lock
from genshi.template import TemplateLoader

SESSION_KEY = 'username'


def check_identify(*args, **kwargs):
  """
  A tool that looks in config for 'identify.require'. If found and it
  is not None, a login is required and the entry is evaluated as a list of
  conditions that the user must fulfill
  """
  conditions = cherrypy.request.config.get('identify.require', None)
  from_page = urllib.quote(cherrypy.request.request_line.split()[1])
  if conditions is not None:
    username = cherrypy.session.get(SESSION_KEY)
    if username:
      cherrypy.request.login = username
      for condition in conditions:
        # A condition is just a callable that returns true or false
        if not condition():
          raise cherrypy.HTTPRedirect("/identify/login?from_page=%s" % from_page)

    else:
      raise cherrypy.HTTPRedirect("/identify/login?from_page=%s" % from_page)


def require_identify(*conditions):
  """
  A decorator that appends conditions to the identify.require config
  variable.
  """
  def decorate(f):
    if not hasattr(f, '_cp_config'):
      f._cp_config = dict()

    if 'identify.require' not in f._cp_config:
      f._cp_config['identify.require'] = []

    f._cp_config['identify.require'].extend(conditions)
    return f

  return decorate


class IdentifyController(object):

  __usernamesLock = Lock()
  __usernames = set()

  @classmethod
  def check_username(cls, username):
    """
    Verifies that username is not used or 'system'

    @param username: Username to check

    @return: None on success or a string describing the error on failure
    """
    with cls.__usernamesLock:
      if username == "system":
        return u"Username 'system' is not allowed."

      elif username in cls.__usernames:
        return u"Username already used."

      else:
        cls.__usernames.add(username)

  def __init__(self, template_path, logger):
    """
    IdentifyController initialiser

    @param template_path: Path to the template directory
    @param logger: The CIDE.py logger instance
    """
    self._loader = TemplateLoader(template_path, auto_reload=True)
    self._logger = logger

    self._logger.debug("IdentifyController instance created")

  def get_loginform(self, username, msg="Enter login information", from_page="/"):
    return """<html><body>
      <form method="post" action="/identify/login">
      <input type="hidden" name="from_page" value="%(from_page)s" />
      %(msg)s<br />
      Username: <input type="text" name="username" value="%(username)s" /><br />
      <input type="submit" value="Log in" />
    </body></html>""" % locals()

  @cherrypy.expose
  def login(self, username=None, from_page="/"):
    """
    Attempt to log in new user

    @param username: Username to log in

    @return: Log in form, or redirect content if log in is successfull
    """
    # TODO LOG
    if username is None:
      return self.get_loginform("", from_page=from_page)

    error_msg = self.check_username(username)
    if error_msg:
      return self.get_loginform(username, error_msg, from_page)

    else:
      cherrypy.session[SESSION_KEY] = cherrypy.request.login = username
      raise cherrypy.HTTPRedirect(from_page or "/")

  @cherrypy.expose
  def logout(self, from_page="/"):
    """
    Log out a user

    @param username: Username to log out

    @return: Page the log ou was requested from, or '/' page
    """
    # TODO LOG
    sess = cherrypy.session
    username = sess.get(SESSION_KEY, None)
    sess[SESSION_KEY] = None
    if username:
      cherrypy.request.login = None
      with self.__usernamesLock:
        self.__usernames.discard(username)

    raise cherrypy.HTTPRedirect(from_page or "/")
