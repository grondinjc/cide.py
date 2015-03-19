import sys
import os
import Queue
from copy import deepcopy
from threading import Lock, Thread
from collections import namedtuple

from cide.app.python.utils.nodes import (get_existing_files,
                                         get_existing_dirs)

# Other stategies will be used but are not required
from cide.app.python.utils.strategies import (StrategyCallEmpty)

from libZoneTransit import (TransitZone as EditBuffer,
                            Addition as EditAdd,
                            Removal as EditRemove)


Error = namedtuple('Error', ['message'])
Warning = namedtuple('Warning', ['message'])


class Core(object):
  """
  Cide.py core app module
  """

  # Class to hold every change element using a name
  # Data field would be the content if is_add is True and the count when False
  Change = namedtuple('Change', ['pos', 'data', 'is_add'])

  # Not global as it only refers to the application only
  # Tuple to hold const pair (transitZone, user registered to changes)
  FileUserPair = namedtuple('FileUserPair', ['file', 'users'])

  def __init__(self, project_name, project_path, logger):
    """
    Core initialiser

    @type project_name: str
    @type project_path: str
    @type logger: logging.Logger
    @type num_threads: int

    @param project_name: The name of the project being edited
    @param project_path: The system path when files will be written
    @param logger: The CIDE.py logger instance
    @param num_threads: The number of worker for asynchronous tasks
    """

    self._project_name = project_name
    self._project_path = project_path  # considered as /
    self._logger = logger

    # Make sure directories exists
    if not os.path.exists(self._project_path):
      os.makedirs(self._project_path)
      # Create default file ???

    # Asociation filepath -> (zoneTransit, set(userlist))
    # Recreate structure from existing files on disk
    self._project_files = dict()
    existing_files_path = get_existing_files(self._project_path)
    for path in existing_files_path:
      with open(os.path.join(self._project_path, path.lstrip('/')), 'r') as f:
        self._project_files[path] = self._create_file_unsafe(f.read())

    # Lock when interracting with `filesystem` or with `users`
    self._project_files_lock = Lock()

    # Lock when dealing with application listeners
    self._core_listeners_lock = Lock()
    self._core_listeners = list()  # List for direct indexing

    # Initialize first strategy to null since nobody is registered
    first_strategy = StrategyCallEmpty(self._change_core_strategy_unsafe)
    self._core_listeners_strategy = first_strategy

    self.tasks = Queue.Queue()
    self._thread = CoreThread(self)

  """
  Sync Call
  The call completes the task and returns with the result, if any
  """

  def start(self):
    """
    Start the application
    """
    self._thread.start()

  def stop(self):
    """
    Stop the application
    """
    self._thread.stop()
    self.tasks.put_nowait((lambda: None))  # Unblock Queue if empty

  def get_project_name(self):
    """
    Get the project name
    """
    return self._project_name

  def add_file(self, path):
    """
    Adds a file to the project tree

    @type path: str

    @param path: The path of the new file to be added in the project tree
    """
    # XXX Currently Unused
    with self._project_files_lock:
      if path not in self._project_files:
        self._project_files[path] = self._create_file_unsafe()

  def delete_file(self, path):
    """
    Removes a file to the project tree

    @type path: str

    @param path: The path of the file to be removed in the project tree
    """
    # XXX Currently Unused
    with self._project_files_lock:
      if path in self._project_files:
        del self._project_files[path]

  def _add_task(self, f):
    """
    Add a task into the threadpool
    Execution centralized into a function to hide flaws of external library

    @type f: lambda

    @param f: The task wrapped with args inside a callable (function or lambda)
    """
    self.tasks.put(f)

  def _create_file_unsafe(self, content=""):
    """
    Creates the representation of a file
    Construction isolated in a function to simply further changes
    This function is unsafe since no locking is done

    @type content: str

    @param content: The initial content of the file representation

    @return FileUserPair namedtuple
    """
    return self.FileUserPair(EditBuffer(content), set())

  """
  Async Call
  The call queues the task.
  If there's a result to receive, the caller must have the callback for it
  """
  def get_project_nodes(self, caller):
    """
    Get all files and directories from project

    @param caller: Username of the client to answer to

    List of nodes is: list((str, bool)) [(<<Project node>>, <<Node is directory flag>>)]
    Callback will be called with: nodes, caller
    """
    self._add_task(lambda: self._task_get_project_nodes(caller))

  def get_file_content(self, path, caller):
    """
    Get the content of a file

    @type path: str
    @type caller: str

    @param path: The path of the file in the project tree
    @param caller: Username of the client to answer to

    Callback will be called with: tuple (<<File name>>, <<File Content>>, <<File Version>>), caller
    """
    self._add_task(lambda: self._task_get_file_content(path, caller))

  def register_user_to_file(self, user, path):
    """
    Register a user to a file in order to receive file modification
    notifications. When the file does not exists, it is created

    @type user: str
    @type path: str

    @param user: The user name
    @param path: The path of the file to be registered to
    """
    self._add_task(lambda: self._task_register_user_to_file(user, path))

  def unregister_user_to_file(self, user, path):
    """
    Unregister a user to a file in order to stop receiving file modification
    notifications

    @type user: str
    @type path: str

    @param user: The user name
    @param path: The path of the file to be unregistrered from
    """
    self._add_task(lambda: self._task_unregister_user_to_file(user, path))

  def unregister_user_to_all_files(self, user):
    """
    Unregister a user from all files in order to stop receiving file modification
    notifications

    @type user: str

    @param user: The user name
    """
    self._add_task(lambda: self._task_unregister_user_to_all_files(user))

  def file_edit(self, path, changes):
    """
    Send changes, text added or text removed, to the file

    @type path: str
    @type changes: list [Change namedtuple]

    @param path: The path of the file in the project tree
    @param changes: Changes to be applied on the file
    """
    self._logger.info("File_edit lock requested ... ")
    with self._project_files_lock:
      self._logger.info("File_edit lock requested ... ACQUIRED ")
      if path in self._project_files:
        for c in changes:
          # Encoding required since c++ module requires str type
          change_object = (EditAdd(c.pos, c.data.encode("utf-8")) if c.is_add
                           else EditRemove(c.pos, c.data))
          self._project_files[path].file.add(change_object)
        # register async task to apply changes
        self._add_task(lambda: self._task_apply_changes(path))
        self._logger.info("File_edit task added")

  """
  Tasks call section
  Those are queued to be executed by the CoreThread
  """
  def _task_get_project_nodes(self, caller):
    """
    Task to get all files and directories from project

    @param caller: Username of the client to answer to

    Callback called: notify_get_project_nodes
    List of nodes is: list((str, bool)) [(<<Project node>>, <<Node is directory flag>>)]
    Callback will be called with: nodes, caller
    """
    with self._project_files_lock:
      sorted_nodes = ([(d, True) for d in get_existing_dirs(self._project_path)] +
                      [(f, False) for f in self._project_files.keys()])
      sorted_nodes.sort()

      self._notify_event(lambda l: l.notify_get_project_nodes(sorted_nodes, caller))

  def _task_get_file_content(self, path, caller):
    """
    Task to get the content of a file

    @type path: str
    @type path: caller

    @param path: The path of the file in the project tree
    @param caller: Username of the client to answer to

    Callback will be called with: tuple (<<File name>>, <<File Content>>, <<File Version>>)
    """
    result = None
    with self._project_files_lock:
      if path in self._project_files:
        result = (path,
                  self._project_files[path].file.content,
                  0)  # Version

    self._notify_event(lambda l: l.notify_get_file_content(result, caller))

  def _task_register_user_to_file(self, user, path):
    """
    Task to register a user to a file in order to receive file modification
    notifications. When the file does not exists, it is created

    @type user: str
    @type path: str

    @param user: The user name
    @param path: The path of the file to be registered to
    """
    with self._project_files_lock:
      if path not in self._project_files:
        # Create file when does not exists
        self._project_files[path] = self._create_file_unsafe()
      # Register user
      self._project_files[path].users.add(user)

  def _task_unregister_user_to_file(self, user, path):
    """
    Task to unregister a user to a file in order to stop receiving file modification
    notifications

    @type user: str
    @type path: str

    @param user: The user name
    @param path: The path of the file to be unregistrered from
    """
    with self._project_files_lock:
      if path in self._project_files:
        self._project_files[path].users.discard(user)

  def _task_unregister_user_to_all_files(self, user):
    """
    Task to unregister a user from all files in order to stop receiving file modification
    notifications

    @type user: str

    @param user: The user name
    """
    with self._project_files_lock:
      for f in self._project_files:
        f.users.discard(user)

  def _task_apply_changes(self, path):
    """
    Async task to apply pending modifications on the file

    @type path: str

    @param path: The path of the file on which modifications will be applied
    """
    self._logger.info("_task_apply_changes lock requested")
    try:
      with self._project_files_lock:
        self._logger.info("_task_apply_changes lock acquired")
        if path in self._project_files:
          version, changes = self._project_files[path].file.writeModifications()
          users_registered = deepcopy(self._project_files[path].users)
          self._logger.info("_task_apply_changes call notify")
          self._add_task(lambda: self._notify_event(
            lambda l: l.notify_file_edit(path,
                                         changes,
                                         version,
                                         users_registered)))
          self._logger.info("_task_apply_changes call notify ... CALLED")

        self._logger.info("_task_apply_changes lock about to be released")
    except:
      e = sys.exc_info()[0]
      self._logger.exception("EXCEPTION RAISED {0}".format(e))
    finally:
      self._logger.info("_task_apply_changes lock released")

  """
  Observer and Stategy design patterns
  Handle event notifications to registered objects

  The listener will need to implement the following functions :
   - notify_file_edit(filename, changes, version, users)
   - notify_get_project_nodes(nodes_list)
   - notify_get_file_content(nodes_list)
  """

  def register_application_listener(self, listener):
    """
    Registers the listener to any events of the application

    @param listener: The observer requesting notifications from the app
    """
    with self._core_listeners_lock:
      if listener not in self._core_listeners:
        self._core_listeners.append(listener)
        self._core_listeners_strategy.upgrade_strategy()

  def unregister_application_listener(self, listener):
    """
    Unregisters the listener to stop receiving event notifications from the app

    @param listener: The observer requesting notifications from the application
    """
    with self._core_listeners_lock:
      if listener in self._core_listeners:
        self._core_listeners.remove(listener)
        self._core_listeners_strategy.downgrade_strategy()

  def _change_core_strategy_unsafe(self, strategy):
    """
    Change the current strategy
    This function is unsafe since no locking is done

    @param strategy: The new strategy to use
    """
    self._core_listeners_strategy = strategy

  def _notify_event(self, f):
    """
    Transfers an event to all application listeners using the current strategy

    @type f: callable

    @param f: The notification callable
    """
    # with self._core_listeners_lock:
    self._core_listeners_strategy.send(f, self._core_listeners)


class CoreThread(Thread):
  """
  Core app Thread
  """

  def __init__(self, app):
    """
    @type app: core.Core

    @param app: The core application
    """
    Thread.__init__(self)
    self._app = app
    self._stop_asked = False

  def stop(self):
    self._stop_asked = True

  def run(self):
    while not self._stop_asked:
      task = self._app.tasks.get()
      task()


