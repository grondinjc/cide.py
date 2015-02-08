import cherrypy
from ws4py.websocket import WebSocket
from genshi.template import TemplateLoader


class IDEController(object):

  def __init__(self, template_path):
    self._loader = TemplateLoader(template_path, auto_reload=True)

    # XXX Temp dummy vars
    self.data = ""

  @cherrypy.expose
  def index(self):
    return "Hello world"
    # TODO Return page/template render for the IDE part
    # tmpl = loader.load('edit.html')
    # # set args in generate as key1=val1, key2=val2
    # stream = tmpl.generate()
    # return stream.render('html')

  @cherrypy.expose
  def sendEdit(self, content):
    # XXX Temp dummy method for test
    self.data += content
    for user in IDEWebSocket.IDEClients:
      user.send(self.data)

  @cherrypy.expose
  def refreshEdit(self):
    return self.data

  @cherrypy.expose
  def ws(self):
    "Method must exist to serve as a exposed hook for the websocket"
    # TODO log??


class IDEWebSocket(WebSocket):
  IDEClients = set()

  def __init__(self, *args, **kw):
    WebSocket.__init__(self, *args, **kw)
    self.IDEClients.add(self)

  def closed(self, code, reason=None):
    self.IDEClients.remove(self)

