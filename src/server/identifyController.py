import cherrypy
import urllib
from genshi.template import TemplateLoader
from threading import Lock

SESSION_KEY = 'username'


def check_identify(*args, **kwargs):
  """
  A tool that looks in config for 'identify.require'. If found and it
  is not None, a login is required if user is not identified already.
  """
  login_required = cherrypy.request.config.get('identify.require', False)
  from_page = urllib.quote(cherrypy.request.request_line.split()[1])
  if login_required:
    username = cherrypy.session.get(SESSION_KEY)
    if username:
      cherrypy.request.login = username

    else:
      raise cherrypy.HTTPRedirect("/identify/login?from_page=%s" % from_page)


def require_identify():
  """
  A decorator that appends the identification requirement
  to the identify.require config variable.
  """
  def decorate(f):
    if not hasattr(f, '_cp_config'):
      f._cp_config = dict()

    f._cp_config['identify.require'] = True
    return f

  return decorate


class IdentifyController(object):

  def __init__(self, template_path, logger):
    """
    IdentifyController initialiser

    @type logger: logging.Logger

    @param template_path: Path to the template directory
    @param logger: The CIDE.py logger instance
    """
    self._loader = TemplateLoader(template_path, auto_reload=True)
    self._logger = logger

    self._newUsernameLock = Lock()

    self._logger.debug("IdentifyController instance created")

  def check_username(self, username):
    """
    Check if username is available and correct

    @type username: str

    @param username: Username to check

    @return: None or error message, if any
    """
    if username == 'system':
      return "Username 'system' is not allowed"

    for _, sess in cherrypy.session.cache.items():
      if sess[0].get('username') == username:
        return "Username already used"

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
    self._logger.info("Login for username '{0}'.".format(username))
    if username is None or username == '':
      return self.get_loginform("", from_page=from_page)

    with self._newUsernameLock:
      error_msg = self.check_username(username)
      if error_msg:
        self._logger.warning("Login failed for username '{0}'.".format(username))
        return self.get_loginform(username, error_msg, from_page)

      else:
        self._logger.info("Login succeded for username '{0}'.".format(username))
        cherrypy.session[SESSION_KEY] = cherrypy.request.login = username
        raise cherrypy.HTTPRedirect(from_page or "/")

  @cherrypy.expose
  def logout(self, from_page="/"):
    """
    Log out a user

    @param username: Username to log out

    @return: Page the log ou was requested from, or '/' page
    """
    sess = cherrypy.session
    username = sess.get(SESSION_KEY, None)
    self._logger.info("Logout for username '{0}'.".format(username))

    sess[SESSION_KEY] = None
    if username:
      cherrypy.request.login = None
      self._app.removeUsername(username)

    raise cherrypy.HTTPRedirect(from_page or "/")
