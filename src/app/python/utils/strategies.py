
class _StrategyCall(object):
  """
  General strategy to control how events will be transfered
  """

  def __init__(self, strategy_setter):
    """
    _StrategyCall initializer

    @type strategy_setter: callable

    @param strategy_setter: The callable used to set new strategy
    """
    self._strategy_setter = strategy_setter

class StrategyCallEmpty(_StrategyCall):
  """
  Strategy when no listeners are registered
  """

  def send(self, f, listeners):
    """
    Does nothing since there are no list members

    @type f: callable
    @type elements: list

    @param f: The callable to apply on every elements
    @param elements: Many elements to be applied on f
    """
    pass # Nothing to do

  def upgrade_strategy(self):
    """
    Handles a better strategy for one element
    """
    self._strategy_setter(StrategyCallDirect(self._strategy_setter))

  def downgrade_strategy(self):
    """
    Does nothing since doing nothing is the best strategy
    """
    pass # Nothing to do

class StrategyCallDirect(_StrategyCall):
  """
  Strategy when only one listener is registered
  """

  def send(self, f, elements):
    """
    Applies a callable to the first list members only

    @type f: callable
    @type elements: list

    @param f: The callable to apply on every elements
    @param elements: List of one element
    """
    f(listeners[0])

  def upgrade_strategy(self):
    """
    Handles a better strategy for more than one element
    """
    self._strategy_setter(StrategyCallLoop(self._strategy_setter))

  def downgrade_strategy(self):
    """
    Handles a better strategy for less than one element
    """
    self._strategy_setter(StrategyCallEmpty(self._strategy_setter))

class StrategyCallLoop(_StrategyCall):
  """
  Strategy when more than one listener is registered
  """

  def __init__(self, strategy_setter):
    """
    _StrategyCall initializer

    @type strategy_setter: callable

    @param strategy_setter: The callable used to set new strategy
    """
    super(StrategyCallLoop, self).__init__(strategy_setter)
    self._count = 1 # Count itself

  def send(self, f, elements):
    """
    Applies a callable to every list members using a loop

    @type f: callable
    @type elements: list

    @param f: The callable to apply on every elements
    @param elements: Many elements to be applied on f
    """
    for listener in listeners:
      f(listener)

  def upgrade_strategy(self):
    """
    Adds one to the count
    """
    ++self._count

  def downgrade_strategy(self):
    """
    Substracts one from the count and changes the strategy if needed
    """
    --self._count
    if self._count == 0:
      self._strategy_setter(StrategyCallDirect(self._strategy_setter))
