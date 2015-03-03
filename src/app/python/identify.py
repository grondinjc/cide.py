from threading import Lock


class Identify(object):
  """
  User identification app module
  """

  def __init__(self, logger):
    """
    Indentify initialiser

    @type logger: logging.Logger

    @param logger: The CIDE.py logger instance
    """
    self._logger = logger

    self._usernamesLock = Lock()
    self._usernames = set()

    self._logger.debug("Identify module instance created")

  def addUsername(self, username):
    """
    Add a username to the used usernames
    Verifies that username is not used or 'system'

    @param username: Username to add

    @return: None on success or a string describing the error on failure
    """
    self._logger.info("Adding {0} to used username".format(username))

    with self._usernamesLock:
      if username == "system":
        self._logger.warning("Someone tried to user user 'system'.")
        return u"Username 'system' is not allowed."

      elif username in self._usernames:
        self._logger.warning("{0} was already in used usernames.".format(username))
        return u"Username already used."

      else:
        self._usernames.add(username)

  def removeUsername(self, username):
    """
    Remove a username from the used usernames

    @param username: Username to remove

    @return: None
    """
    self._logger.info("Removing {0} from used usernames".format(username))

    with self._usernamesLock:
      self._usernames.discard(username)

