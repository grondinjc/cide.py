import cherrypy
from cherrypy import request
import simplejson
from ws4py.websocket import WebSocket
from genshi.template import TemplateLoader


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
    (Path : /ide/)

    @return: Template HTML render
    """
    cherrypy.session['username'] = 'test'
    self._logger.info("index requested by {0} ({1}:{2})".format(cherrypy.session['username'],
                                                                request.remote.ip,
                                                                request.remote.port))
    # TODO Return page/template render for the IDE part
    tmpl = self._loader.load('edit_test.html')
    # set args in generate as key1=val1, key2=val2
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
    filename = request.json['file']
    username = cherrypy.session['username']
    self._logger.info("Open for file {3} requested by {0} ({1}:{2})".format(username,
                                                                            request.remote.ip,
                                                                            request.remote.port,
                                                                            filename))

    # TODO Check parameters if needed
    # TODO Call app

    return {'file':    filename,
            'vers':    None,
            'content': None}

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
    username = cherrypy.session['username']
    filename = request.json['file']
    self._logger.info("Save for file {3} requested by {0} ({1}:{2})".format(username,
                                                                            request.remote.ip,
                                                                            request.remote.port,
                                                                            filename))

    # TODO Check parameters if needed
    # TODO Call app

    # XXX Temp dummy content for test
    self.data += request.json['content']

    filesSubscribers = [IDEWebSocket.IDEClients.values()]  # XXX TEMP, ASK APP

    for user in filesSubscribers:
      ws = IDEWebSocket.IDEClients[user]  # XXX CHECK IF WS EXIST and handle!
      ws.send(simplejson.dumps({"file":    filename,   # XXX Handle closed WS!
                                "vers":    None,
                                "type":    None,
                                "pos":     None,
                                "content": self.data}))  # XXX TEMP

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

