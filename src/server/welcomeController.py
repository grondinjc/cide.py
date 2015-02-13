class WelcomeController(object):
  """
  Empty Controller to distrubute static welcoming content.
  """

  def __init__(self, logger):
    """
    WelcomeController initialiser

    @param logger: The CIDE.py logger instance
    """
    self._logger = logger
    self._logger.debug("WelcomeController instance created")

