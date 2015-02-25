import cherrypy
from cherrypy import request
import simplejson
from ws4py.websocket import WebSocket
import uuid  # XXX Temp for fake session id... Could be used for real?


class ChatController(object):
  """
  Controller of the chat
  """

  def __init__(self, logger):
    """
    ChatController initialiser

    @param logger: The CIDE.py logger instance
    """
    # XXX Do we need template or something?
    self._logger = logger

    self._logger.debug("ChatController instance created")

  @cherrypy.expose
  def index(self):
    """
    ChatController index page generator
    (Path : /chat/ -- /chat/index)

    @return: ??????
    """
    if not cherrypy.session.get('username'):
      cherrypy.session['username'] = uuid.uuid4()  # XXX Session should be set by the id/auth module

    username = cherrypy.session['username']
    self._logger.info("index requested by {0} ({1}:{2})".format(username,
                                                                request.remote.ip,
                                                                request.remote.port))
    # XXX Do we need index? Send chat template (Iframe)?

  @cherrypy.expose
  def connect(self):
    """
    Subscribe a client to the chat, to receive new messages
    Method : PUT
    (Path : /chat/connect)

    The user may start to receive messages before he gets the response for this request.
    """
    if not cherrypy.session.get('username'):
      cherrypy.session['username'] = uuid.uuid4()  # XXX Session should be set by the id/auth module

    username = cherrypy.session['username']
    self._logger.info("Connect to chat requested by {0} ({1}:{2})".format(username,
                                                                          request.remote.ip,
                                                                          request.remote.port))

    # TODO Check parameters if needed
    # TODO Check if we have a WS before subscribing?
    # TODO Call app
    # TODO Send notification of connection in chat?

  @cherrypy.expose
  def disconnect(self):
    """
    Unsubscribe a client from the chat, stop sending new messages
    Method : PUT
    (Path : /chat/disconnect)
    """
    if not cherrypy.session.get('username'):
      cherrypy.session['username'] = uuid.uuid4()  # XXX Session should be set by the id/auth module

    username = cherrypy.session['username']
    self._logger.info("Disconnect from chat requested by {0} ({1}:{2})".format(username,
                                                                               request.remote.ip,
                                                                               request.remote.port))

    # TODO Check parameters if needed
    # TODO remove from subscribers to chat
    # TODO Ask for list of all user in chat
    users = ChatWebSocket.ChatClients.keys()  # XXX TEMP, ASK APP
    dc_message = {"author": "system", "message": username + " disconnected from the chat."}
    self.sendTo(dc_message, users)

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
      cherrypy.session['username'] = uuid.uuid4()  # XXX Session should be set by the id/auth module

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

    # TODO Check parameters if needed
    # TODO Call app

    # XXX TEMP, might send to only some people
    users = ChatWebSocket.ChatClients.keys()  # XXX TEMP, ASK APP
    data = {"author":  username, "message": message}
    self.sendToSubscribed(data, users)

  @cherrypy.expose
  def ws(self):
    """
    Method must exist to serve as a exposed hook for the websocket
    (Path : /chat/ws)
    """
    if not cherrypy.session.get('username'):
      cherrypy.session['username'] = uuid.uuid4()  # XXX Session should be set by the id/auth module

    username = cherrypy.session['username']
    self._logger.info("WS creation request from {0} ({1}:{2})".format(username,
                                                                      request.remote.ip,
                                                                      request.remote.port))

  def sendTo(self, data, users):
    """
    Send a data to list of user

    @param data: The data to send (dict)
    @param users: The list of users to send to
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
        # TODO remove from subscribers to chat
        # TODO Ask for list of all user in chat
        dc_message = {"author": "system", "message": user + " was disconnected from the chat."}
        self.sendTo(dc_message, users)


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

