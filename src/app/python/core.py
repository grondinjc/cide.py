import os
from sys import argv
from pdb import set_trace as dbg
from threading import Lock
from collections import namedtuple

from cide.app.python.utils.nodes import (get_existing_files, 
                                         get_existing_dirs)

# Other stategies will be used but are not required
from cide.app.python.utils.strategies import (StrategyCallEmpty)

from threadpool import (ThreadPool,
                        makeRequests as create_task)

from libZoneTransit import (ZoneTransit, 
                            Ajout as EditAdd, 
                            Suppression as EditRemove)

# Class to hold every change element using a name
# Data field would be the content if is_add is True and the count when False
Change = namedtuple('Change', ['pos', 'data', 'is_add'])



Error = namedtuple('Error', ['message'])
Warning = namedtuple('Warning', ['message'])


class Core(object):
  """
  Cide.py core app module
  """

  # Not global as it only refers to the application only
  # Tuple to hold const pair (zoneTransit, user registered to changes)
  FileUserPair = namedtuple('FileUserPair', ['zt', 'users'])

  def __init__(self, project_name, project_path, logger, num_threads=4):
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
    self._project_path = project_path # considered as /
    self._logger = logger
    self._threadpool = ThreadPool(num_threads)

    # Make sure directories exists
    if not os.path.exists(self._project_path):
      os.makedirs(self._project_path)
      # Create default file ???

    # Asociation filepath -> (zoneTransit, set(userlist))
    # Recreate structure from existing files on disk
    self._project_files = dict()
    existing_files_path = get_existing_files(self._project_path)
    for path in existing_files_path:
      with open(path, 'r') as f:
        self._project_files[path] = self._create_file_unsafe(f.read())

    # Lock when interracting with `filesystem` or with `users`
    self._project_files_lock = Lock()

    # Lock when dealing with application listeners
    self._core_listeners_lock = Lock()
    self._core_listeners = set()

    # Initialize first strategy to null since nobody is registered
    first_strategy = StrategyCallEmpty(self._change_core_strategy_unsafe)
    self._core_listeners_strategy = first_strategy

  def stop(self):
    """
    Stop the application
    """
    self._stop_pool()

  def get_project_name(self):
    """
    Get the project name
    """
    return self._project_name

  def get_project_nodes(self):
    """
    Get all files and directories from project 

    @return list((str, bool)) [(<<Project node>>, <<Node is directory flag>>)]
    """
    with self._project_files_lock:
      return [(d, True) for d in get_existing_dirs(self._project_path)] +
             [(f, False) for f in self._project_files.keys()]

  def get_file_content(self, path):
    """
    Get the content of a file
    Synchronous function

    @type path: str

    @param path: The path of the file in the project tree

    @return tuple (<<File name>>, <<File Content>>, <<File Version>>)
    """
    with self._project_files_lock:
      if path in self._project_files:
        return (self._project_files[path].zt.contenu,
                0) # Version

  def file_edit(self, path, changes):
    """
    Send changes, text added or text removed, to the file

    @type path: str
    @type changes: list [Change namedtuple]

    @param path: The path of the file in the project tree
    @param changes: Changes to be applied on the file
    """
    with self._project_files_lock:
      if path in self._project_files:
        for c in changes:
          change_class = EditAdd if c.is_add else EditRemove
          self._project_files[path].zt.add(change_class(c.pos, c.data))
        # register async task to apply changes
        self._add_task(lambda: self._task_apply_changes(path))
    
  def add_file(self, path):
    """
    Adds a file to the project tree

    @type path: str
    
    @param path: The path of the new file to be added in the project tree
    """
    with self._project_files_lock:
      if path not in self._project_files:
        self._project_files[path] = self._create_file_unsafe()

  def delete_file(self, path):
    """
    Removes a file to the project tree

    @type path: str
    
    @param path: The path of the file to be removed in the project tree
    """
    with self._project_files_lock:
      if path in self._project_files:
        del self._project_files[path]

  def register_user_to_file(self, user, path):
    """
    Register a user to a file in order to receive file modification 
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

  def unregister_user_to_file(self, user, path):
    """
    Unregister a user to a file in order to stop receiving file modification 
    notifications

    @type user: str
    @type path: str
    
    @param user: The user name
    @param path: The path of the file to be unregistrered from
    """
    with self._project_files_lock:
      if user in self._project_files[path].users:
        self._project_files[path].users.remove(user)

  def _task_apply_changes(self, path):
    """
    Async task to apply pending modifications on the file

    @type path: str
    
    @param path: The path of the file on which pending modifications will be applied
    """
    with self._project_files_lock:
      if file_path in self._project_files:
        self._project_files[file_path].zt.ecrireModifications()

  def _add_task(self, f):
    """
    Add a task into the threadpool
    Execution centralized into a function to hide flaws of external library

    @type f: function
    
    @param f: The task wrapped with args inside a callable (function or lambda)
    """
    # Since task needs to receive one parameter as an arg array or receive
    # two argument a dummy lambda is needed to hides this.

    # Creates an array with one request since one tuple of args was provided
    rq = create_task(lambda *a: f(), [(None, None,)]) 
    self._threadpool.putRequest(rq[0])

  def _create_file_unsafe(self, content=""):
    """
    Creates the representation of a file
    Construction isolated in a function to simply further changes
    This function is unsafe since no locking is done

    @type content: str
    
    @param content: The initial content of the file representation

    @return FileUserPair namedtuple
    """
    return self.FileUserPair(ZoneTransit(content), set())

  def _stop_pool(self):
    """
    Stops the threadpool
    """
    self._threadpool.wait()



  """
  Observer and Stategy design patterns
  Handle event notifications to registered objects
  """

  def register_application_listener(listener):
    """
    Registers the listener to any events of the application
    
    @param listener: The observer requesting notifications from the app
    """
    with self._core_listeners_lock:
      if listener not in self._core_listeners:
        self._core_listeners.add(listener)
        self._core_listeners_strategy.upgrade_strategy()

  def unregister_application_listener(listener):
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
    with self._core_listeners_lock:
      self._core_listeners_strategy.send(f, self._core_listeners)
