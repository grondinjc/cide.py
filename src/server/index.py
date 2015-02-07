import os
import cherrypy
from ws4py.websocket import WebSocket
from genshi.template import TemplateLoader


class Welcome(object):

  template_dir = "templates"

  def __init__(self):
    self.loader = TemplateLoader(os.path.join(os.path.dirname(__file__), 'templates'),
                                 auto_reload=True)
    self.data = ""

  @cherrypy.expose
  def index(self):
    return "Hello world"
  # tmpl = loader.load('edit.html')
  # # set args in generate as key1=val1, key2=val2
  # stream = tmpl.generate()
  # return stream.render('html')

  # @cherrypy.expose
  # def save(self, content):
  # self.data += content
  # for user in Publisher.Subscriber:
  # user.send(self.data)

  # @cherrypy.expose
  # def refresh(self):
  # return self.data

  @cherrypy.expose
  def ws(self):
    "Needs to be there for WebSocket"


class Publisher(WebSocket):
  Subscriber = set()

  def __init__(self, *args, **kw):
    WebSocket.__init__(self, *args, **kw)
    self.Subscriber.add(self)

  def closed(self, code, reason=None):
    self.Subscriber.remove(self)

