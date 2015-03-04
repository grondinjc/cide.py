import os
import cherrypy
from cherrypy import request
import simplejson
from ws4py.websocket import WebSocket
from genshi.template import TemplateLoader
import uuid  # XXX Temp for fake session id... Could be used for real?

def is_valid_path(path):
  normalized = os.path.normpath(path)
  return (normalized == path) and
         (not path.endswith('/')) # with means that '/' is illegal

def create_argument_error_msg(arg):
  return {arg: arg, message: "Invalid argument provided"}

class IDEController(object):
  """
  Controller of the IDE/Editing part
  """

  IDE_HTML_TEMPLATE = 'edit.html'

  def __init__(self, app, template_path, logger):
    """
    IDEController initialiser

    @param app: The core application
    @param template_path: Path to the template directory
    @param logger: The CIDE.py logger instance
    """
    self._app = app
    self._loader = TemplateLoader(template_path, auto_reload=True)
    self._logger = logger

    self._logger.debug("IDEController instance created")

  @cherrypy.expose
  def index(self):
    """
    IDEController index page generator
    (Path : /ide/ -- /ide/index)

    @return: Template HTML render
    """
    if not cherrypy.session.get('username'):
      cherrypy.session['username'] = uuid.uuid4()  # XXX Session should be set by the id/auth module

    username = cherrypy.session['username']
    self._logger.info("index requested by {0} ({1}:{2})".format(username,
                                                                request.remote.ip,
                                                                request.remote.port))

    tmpl = self._loader.load(IDEController.IDE_HTML_TEMPLATE)
    project_name = self._app.get_project_name()
    stream = tmpl.generate(title=project_name)
    return stream.render('html')

  @cherrypy.expose
  @cherrypy.tools.json_out()
  @cherrypy.tools.json_in()
  def open(self):
    """
    Subscribe a client to updates for a given file and send a dump of the file
    If the file doesn't exist, it's created.
    Method : POST
    (Path : /ide/open)

    User must start to buffer changes received for file before requesting open.
    The server will register the user to receive updates, then send the content,
    so the user misses no update. The user will have to detect which updates
    to apply based on the ``version`` sent.

    Input must be JSON of the following format:
      {
        'file':    '<<Filepath of file to open>>'
      }

    @return: JSON of the following format:
      {
        'file':    '<<Filepath of given file>>',
        'vers':    '<<File version>>',
        'content': '<<Content of the requested file>>'
      }
    """
    if not cherrypy.session.get('username'):
      cherrypy.session['username'] = uuid.uuid4()  # XXX Session should be set by the id/auth module

    self._logger.debug("Open by {0} ({1}:{2}) JSON: {3}".format(cherrypy.session['username'],
                                                                request.remote.ip,
                                                                request.remote.port,
                                                                request.json))

    filename = request.json['file']
    username = cherrypy.session['username']
    self._logger.info("Open for file {3} requested by {0} ({1}:{2})".format(username,
                                                                            request.remote.ip,
                                                                            request.remote.port,
                                                                            filename))

    # TODO Check parameters if needed
    # TODO Check if we have a WS before subscribing?
    # TODO Call app

    print "OPEN"
    print self.data
    return {'file':    filename,
            'vers':    None,
            'content': self.data}  # XXX TEMP

  @cherrypy.expose
  @cherrypy.tools.json_out()
  @cherrypy.tools.json_in()
  def close(self):
    """
    Unsubscribe a client to updates for a given file
    Method : PUT
    (Path : /ide/close)

    Input must be JSON of the following format:
      {
        'file':    '<<Filepath of file to close>>'
      }
    """
    if not cherrypy.session.get('username'):
      cherrypy.session['username'] = uuid.uuid4()  # XXX Session should be set by the id/auth module

    self._logger.debug("Close by {0} ({1}:{2}) JSON: {3}".format(cherrypy.session['username'],
                                                                 request.remote.ip,
                                                                 request.remote.port,
                                                                 request.json))

    username = cherrypy.session['username']
    filename = request.json['file']
    self._logger.info("Close for file {3} requested by {0} ({1}:{2})".format(username,
                                                                             request.remote.ip,
                                                                             request.remote.port,
                                                                             filename))

    # TODO Check parameters if needed
    self._app.unregister_user_to_file(username, filename)

  @cherrypy.expose
  @cherrypy.tools.json_out()
  @cherrypy.tools.json_in()
  def save(self):
    """
    Receive changes to a file from the client
    Method : PUT
    (Path : /ide/save)

    Input must be JSON of the following format:
      {
        'file':   '<<Filepath of edited file>>',
        'vers':   '<<File version>>',
        'changes': [{
                     'type':    '<<Type of edit (ins | del)>>',
                     'pos':     '<<Position of edit>>',
                     'content': '<<Content of insert | Number of deletes>>'
                   }]
      }

    Output on the WS will be JSON of the following format:
      {
        'file':    '<<Filepath of edited file>>',
        'vers':    '<<File version>>',
        'changes': [{
                     'type':    '<<Type of edit (ins | del)>>',
                     'pos':     '<<Position of edit>>',
                     'content': '<<Content of insert | Number of deletes>>'
                   }]
      }

    @return: ok: Nothing + (200)
             File doesn't exist: Nothing + (404 - Not found)
             Version is too old: Nothing + (410 - Gone)
    """
    if not cherrypy.session.get('username'):
      cherrypy.session['username'] = uuid.uuid4()  # XXX Session should be set by the id/auth module

    self._logger.debug("Save by {0} ({1}:{2}) JSON: {3}".format(cherrypy.session['username'],
                                                                request.remote.ip,
                                                                request.remote.port,
                                                                request.json))

    username = cherrypy.session['username']
    filename = request.json['file']
    changes = request.json['changes']
    self._logger.info("Save for file {3} requested by {0} ({1}:{2})".format(username,
                                                                            request.remote.ip,
                                                                            request.remote.port,
                                                                            filename))

    # TODO Check parameters if needed
    # TODO Call app

    # XXX Temp dummy content for test
    for change in changes:
      self.data += change['content']

    fileSubscribers = IDEWebSocket.IDEClients.keys()  # XXX TEMP, ASK APP

    for user in fileSubscribers:
      ws = IDEWebSocket.IDEClients.get(user)
      if ws:
        try:
          ws.send(simplejson.dumps({"file":    filename,   # XXX Handle closed WS!
                                    "vers":    None,
                                    "changes": [{
                                      "type":    None,
                                      "pos":     0,
                                      "content": self.data
                                    }]}))  # XXX TEMP
        except:
          self._logger.error("{0} ({1}:{2}) WS transfer failed".format(username,
                                                                       request.remote.ip,
                                                                       request.remote.port))

      else:
        self._logger.error("{0} ({1}:{2}) has no WS in server".format(username,
                                                                      request.remote.ip,
                                                                      request.remote.port))
        # TODO remove from subscribers to file?

  @cherrypy.expose
  @cherrypy.tools.json_out()
  def dump(self, filename):
    """
    Sends the current content of a given file
    Method : GET
    (Path : /ide/dump)

    User must start to buffer changes received for file before requesting dump.
    The server will register the user to receive updates, then send the dump,
    so the user misses no update. The user will have to detect which updates
    to apply based on the ``version`` sent.

    @param filename: Filepath of requested file

    @return: JSON of the following format:
      {
        'file':    '<<Filepath of given file>>',
        'vers':    '<<File version>>',
        'content': '<<Content of the requested file>>'
      }
      OR
      File doesn't exist: Nothing + (404 Not found)
    """
    if not cherrypy.session.get('username'):
      cherrypy.session['username'] = uuid.uuid4()  # XXX Session should be set by the id/auth module

    self._logger.debug("Dump by {0} ({1}:{2}) filename: {3}".format(cherrypy.session['username'],
                                                                    request.remote.ip,
                                                                    request.remote.port,
                                                                    filename))

    username = cherrypy.session['username']
    self._logger.info("Dump of file {3} requested by {0} ({1}:{2})".format(username,
                                                                           request.remote.ip,
                                                                           request.remote.port,
                                                                           filename))
    # TODO Check parameters if needed
    # TODO Check for exceptions
    content, version = self._app.get_file_content(filename)

    return {'file':    filename,
            'vers':    version,
            'content': content}

  @cherrypy.expose
  def ws(self):
    """
    Method must exist to serve as a exposed hook for the websocket
    (Path : /ide/ws)
    """
    if not cherrypy.session.get('username'):
      cherrypy.session['username'] = uuid.uuid4()  # XXX Session should be set by the id/auth module

    username = cherrypy.session['username']
    self._logger.info("WS creation request from {0} ({1}:{2})".format(username,
                                                                      request.remote.ip,
                                                                      request.remote.port))


class IDEWebSocket(WebSocket):
  """
  WebSocket for the IDEController
  """
  IDEClients = {}

  def __init__(self, *args, **kw):
    WebSocket.__init__(self, *args, **kw)
    self.username = None

  def opened(self):
    self.username = cherrypy.session['username']
    self.IDEClients[self.username] = self
    cherrypy.log("User {0} ({1}) WS connected".format(self.username, self.peer_address))

  def closed(self, code, reason=None):
    del self.IDEClients[self.username]
    cherrypy.log("User {0} ({1}) WS disconnected".format(self.username, self.peer_address))

