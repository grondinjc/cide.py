import cherrypy
from cherrypy import request
import simplejson
from ws4py.websocket import WebSocket
from genshi.template import TemplateLoader
import uuid  # XXX Temp for fake session id... Could be used for real?


class IDEController(object):
  """
  Controller of the IDE/Editing part
  """

  def __init__(self, template_path, logger):
    """
    IDEController initialiser

    @param template_path: Path to the template directory
    @param logger: The CIDE.py logger instance
    """
    self._loader = TemplateLoader(template_path, auto_reload=True)
    self._logger = logger

    # XXX Temp dummy vars
    self.data = ""

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

    tmpl = self._loader.load('basic_demo.html')  # XXX Change for real template
    stream = tmpl.generate()
    return stream.render('html')

  @cherrypy.expose
  @cherrypy.tools.json_out()
  @cherrypy.tools.json_in()
  def open(self):
    """
    Subscribe a client to updates for a given file and send a dump of the file
    If the file doesn't exist, it's created.
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

    return {'file':    filename,
            'vers':    None,
            'content': self.data}  # XXX TEMP

  @cherrypy.expose
  @cherrypy.tools.json_out()
  @cherrypy.tools.json_in()
  def close(self):
    """
    Unsubscribe a client to updates for a given file
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
    filename = cherrypy.request.json['file']
    self._logger.info("Close for file {3} requested by {0} ({1}:{2})".format(username,
                                                                             request.remote.ip,
                                                                             request.remote.port,
                                                                             filename))

    # TODO Check parameters if needed
    # TODO Call app

  @cherrypy.expose
  @cherrypy.tools.json_out()
  @cherrypy.tools.json_in()
  def save(self):
    """
    Receive changes to a file from the client
    (Path : /ide/save)

    Input must be JSON of the following format:
      {
        'file':    '<<Filepath of edited file>>',
        'vers':    '<<File version>>',
        'type':    '<<Type of edit (ins | del)>>',
        'pos':     '<<Position of edit>>',
        'content': '<<Content of insert | Number of deletes>>'
      }

    Output on the WS will be JSON of the following format:
      {
        'file':    '<<Filepath of edited file>>',
        'vers':    '<<File version>>',
        'type':    '<<Type of edit (ins | del)>>',
        'pos':     '<<Position of edit>>',
        'content': '<<Content of insert | Number of deletes>>'
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
    content = request.json['content']
    self._logger.info("Save for file {3} requested by {0} ({1}:{2})".format(username,
                                                                            request.remote.ip,
                                                                            request.remote.port,
                                                                            filename))

    # TODO Check parameters if needed
    # TODO Call app

    # XXX Temp dummy content for test
    self.data += content

    fileSubscribers = [IDEWebSocket.IDEClients.values()]  # XXX TEMP, ASK APP

    for user in fileSubscribers:
      ws = IDEWebSocket.IDEClients.get(user)
      if ws:
        # try:
        ws.send(simplejson.dumps({"file":    filename,   # XXX Handle closed WS!
                                  "vers":    None,
                                  "type":    None,
                                  "pos":     None,
                                  "content": self.data}))  # XXX TEMP
        # except:
        # self._logger.error("{0} ({1}:{2}) WS transfer failed".format(username,
        # request.remote.ip,
        # request.remote.port))
        # TODO Remove/clear

      else:
        self._logger.error("{0} ({1}:{2}) has no WS in server".format(username,
                                                                      request.remote.ip,
                                                                      request.remote.port))
        # TODO remove from subscribers to file?

  @cherrypy.expose
  @cherrypy.tools.json_out()
  @cherrypy.tools.json_in()
  def dump(self):
    """
    Sends the current content of a given file
    (Path : /ide/dump)

    User must start to buffer changes received for file before requesting dump.
    The server will register the user to receive updates, then send the dump,
    so the user misses no update. The user will have to detect which updates
    to apply based on the ``version`` sent.

    Input must be JSON of the following format:
      {
        'file': '<<Filepath of requested file>>'
      }

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

    self._logger.debug("Dump by {0} ({1}:{2}) JSON: {3}".format(cherrypy.session['username'],
                                                                request.remote.ip,
                                                                request.remote.port,
                                                                request.json))

    username = cherrypy.session['username']
    filename = cherrypy.request.json['file']
    self._logger.info("Dump of file {3} requested by {0} ({1}:{2})".format(username,
                                                                           request.remote.ip,
                                                                           request.remote.port,
                                                                           filename))
    # TODO Check parameters if needed
    # TODO Call app

    return {'file':    filename,
            'vers':    None,
            'content': self.data}  # XXX TEMP

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

  def closed(self, code, reason=None):
    del self.IDEClients[self.username]

