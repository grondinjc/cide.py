import cherrypy
from cherrypy import request
import simplejson
from ws4py.websocket import WebSocket
import uuid  # XXX Temp for fake session id... Could be used for real?


class ChatController(object):
  """
  Controller of the chat
  """

  def __init__(self, app, logger):
    """
    ChatController initialiser

    @type app: cide.app.python.chat.Chat
    @type logger: logging.Logger

    @param app: The Chat App instance
    @param logger: The CIDE.py logger instance
    """
    self._app = app
    self._logger = logger

    self._logger.debug("ChatController instance created")

  @cherrypy.expose
  def connect(self):
    """
    Subscribe a client to the chat, to receive new messages
    Method : PUT
    (Path : /chat/connect)

    The user may start to receive messages before he gets the response for this request.
    """
    if not cherrypy.session.get('username'):
      cherrypy.session['username'] = str(uuid.uuid4())  # XXX Session should be set by the id module

    username = cherrypy.session['username']
    self._logger.info("Connect to chat requested by {0} ({1}:{2})".format(username,
                                                                          request.remote.ip,
                                                                          request.remote.port))

    result = self._app.addUser(username)
    self.sendTo(*result)

  @cherrypy.expose
  def disconnect(self):
    """
    Unsubscribe a client from the chat, stop sending new messages
    Method : PUT
    (Path : /chat/disconnect)
    """
    if not cherrypy.session.get('username'):
      cherrypy.session['username'] = str(uuid.uuid4())  # XXX Session should be set by the id module

    username = cherrypy.session['username']
    self._logger.info("Disconnect from chat requested by {0} ({1}:{2})".format(username,
                                                                               request.remote.ip,
                                                                               request.remote.port))

    result = self._app.removeUser(username)
    self.sendTo(*result)

  @cherrypy.expose
  @cherrypy.tools.json_in()
  def send(self):
    """
    Receive new message from the client
    Method : PUT
    (Path : /chat/send)

    Input must be JSON of the following format:
      {
        'message': '<<Content of the message>>'
      }

    Output on the WS will be JSON of the following format:
      {
        'author':  '<<Author (username) of the sender>>',
        'message': '<<Content of the message>>'
      }
    """
    if not cherrypy.session.get('username'):
      cherrypy.session['username'] = str(uuid.uuid4())  # XXX Session should be set by the id module

    self._logger.debug("Send by {0} ({1}:{2}) JSON: {3}".format(cherrypy.session['username'],
                                                                request.remote.ip,
                                                                request.remote.port,
                                                                request.json))

    username = cherrypy.session['username']
    message = request.json['message']
    self._logger.info("Send message '{3}' requested by {0} ({1}:{2})".format(username,
                                                                             request.remote.ip,
                                                                             request.remote.port,
                                                                             message))

    result = self._app.handleMessage(username, message)
    self.sendTo(*result)

  @cherrypy.expose
  def ws(self):
    """
    Method must exist to serve as a exposed hook for the websocket
    (Path : /chat/ws)
    """
    if not cherrypy.session.get('username'):
      cherrypy.session['username'] = str(uuid.uuid4())  # XXX Session should be set by the id module

    username = cherrypy.session['username']
    self._logger.info("WS creation request from {0} ({1}:{2})".format(username,
                                                                      request.remote.ip,
                                                                      request.remote.port))

  def sendTo(self, data, users):
    """
    Send data to list of user

    @param data: The data to send
    @param users: The set of users to send to
    """
    for user in users:
      ws = ChatWebSocket.ChatClients.get(user)
      if ws:
        try:
          ws.send(simplejson.dumps(data))
        except:
          self._logger.error("{0} ({1}) WS transfer failed".format(user, ws.peer_address))

      else:
        self._logger.error("{0} has no WS in server".format(user))
        result = self._app.removeUser(user)
        self.sendTo(*result)


class ChatWebSocket(WebSocket):
  """
  WebSocket for the ChatController
  """
  ChatClients = {}

  def __init__(self, *args, **kw):
    WebSocket.__init__(self, *args, **kw)
    self.username = None

  def opened(self):
    self.username = cherrypy.session['username']
    self.ChatClients[self.username] = self
    cherrypy.log("User {0} ({1}) ChatWS connected".format(self.username, self.peer_address))

  def closed(self, code, reason=None):
    del self.ChatClients[self.username]
    cherrypy.log("User {0} ({1}) ChatWS disconnected. Reason: {3}".format(self.username,
                                                                          self.peer_address,
                                                                          reason))

