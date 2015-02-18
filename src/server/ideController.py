import cherrypy
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
    # TODO Return page/template render for the IDE part
    tmpl = self._loader.load('edit_test.html')
    # set args in generate as key1=val1, key2=val2
    stream = tmpl.generate()
    return stream.render('html')

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

    @return: If ok: Nothing + (200)
             If version is too old : Nothing + (410 - Gone)
    """
    self._logger.info("Changes received from {0}:{1}".format(cherrypy.request.remote.ip,
                                                             cherrypy.request.remote.port))
    input_json = cherrypy.request.json

    # XXX Temp dummy content for test
    self.data += input_json['content']
    for client in IDEWebSocket.IDEClients:
      client.send(simplejson.dumps({"content": self.data}))

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
    """
    # XXX Temp dummy content
    return {"content": self.data}

  @cherrypy.expose
  def ws(self):
    """
    Method must exist to serve as a exposed hook for the websocket
    (Path : /ide/ws)
    """
    self._logger.info("WS creation request from {0}:{1}".format(cherrypy.request.remote.ip,
                                                                cherrypy.request.remote.port))


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

