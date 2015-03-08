from threading import Lock
from datetime import datetime

class Chat(object):
  """
  Chat app module
  """

  TIMESTAMP_FMT = "%H:%M"

  def __init__(self, logger):
    """
    Chat initialiser

    @type logger: logging.Logger

    @param logger: The CIDE.py logger instance
    """
    self._logger = logger

    self._usersLock = Lock()
    self._users = set()

    self._logger.debug("Chat module instance created")

  def addUser(self, username):
    """
    Add a user to the chat

    @param username: Username of the user to add

    @return tuple (<<Data to send>>, <<Users to send to>>, <<Timestamp of the message>>)
    """
    self._logger.info("Adding {0} to chat users".format(username))
    message_time = datetime.now().strftime(Chat.TIMESTAMP_FMT)

    with self._usersLock:
      if username not in self._users:
        self._users.add(username)
        users = self._users.copy()

      else:
        users = []
        self._logger.warning("{0} was already in chat users.".format(username))

    return ("system", username + " connected to the chat.", users, message_time)

  def removeUser(self, username):
    """
    Remove a user from the chat

    @param username: Username of the user to remove

    @return tuple (<<Data to send>>, <<Users to send to>>, <<Timestamp of the message>>)
    """
    self._logger.info("Removing {0} from chat users".format(username))
    message_time = datetime.now().strftime(Chat.TIMESTAMP_FMT)

    with self._usersLock:
      if username in self._users:
        self._users.remove(username)
        users = self._users.copy()

      else:
        users = []
        self._logger.warning("{0} was not in chat users.".format(username))

    return ("system", username + " disconnected from the chat.", users, message_time)

  def handleMessage(self, author, message):
    """
    Handle the message. Return the data to send, and to who.

    @param author: The author of the message
    @param message: The message received

    @return tuple (<<Data to send>>, <<Users to send to>>, <<Timestamp of the message>>)
    """
    self._logger.debug("Handling message from {0}, message: {1}".format(author, message))
    message = message.strip()
    message_time = datetime.now().strftime("%H:%M")

    if message:
      with self._usersLock:
        users = self._users.copy()

    else:
      users = []
      self._logger.warning("Message from user {0} was empty. Not re-sending.".format(author))

    return (author, message, users, message_time)

