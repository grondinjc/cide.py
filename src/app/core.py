import os
from sys import argv
from pdb import set_trace as dbg
from threading import Lock
from collections import namedtuple

from cide.app.utils import (get_existing_files, get_existing_nodes)

from libZoneTransit import (ZoneTransit, 
                            Ajout as EditAdd, 
                            Suppression as EditRemove)

# Class to hold every change element using a name
# Data field would be the conent if is_add is True and the count when False
Change = namedtuple('Change', ['pos', 'data', 'is_add'])

# The core application
class Core(object):

  # Not global as it only refers to the application only
  # Tuple to hold const pair (zoneTransit, user registered to changes)
  FileUserPair = namedtuple('UserFilePair', ['zt', 'users'])

  def __init__(self, project_name, project_path, logger, initial_observer=None):
    self._logger = logger
    self._project_name = project_name
    self._project_path = project_path # considered as /

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
        self._project_files[path] = Core._create_file_no_lock(f.read())

    # Lock when interracting with `filesystem` or with `users`
    self._project_files_lock = Lock()


  # Files, directories and empty directories
  def get_project_nodes(self):
    return get_existing_nodes(self._project_path)

  def get_file_content(self, path):
    with self._project_files_lock:
      return self._project_files[path].zt.contenu

  def file_edit(self, path, changes):
    with self._project_files_lock:
      for c in changes:
        change_class = EditAdd if c.is_add else EditRemove
        self._project_files[path].zt.add(change_class(c.pos, c.data))
  
  def add_file(self, file_path):
    with self._project_files_lock:
      if file_path not in self._project_files:
        self._project_files[file_path] = self._create_file_no_lock()

  def delete_file(self, file_path):
    with self._project_files_lock:
      if file_path in self._project_files:
        del self._project_files[file_path]

  def rename_file(self, file_path, new_file_name):
    pass

  def add_directory(self, dir_path):
    pass

  def delete_directory(self, dir_path):
    pass

  def rename_directory(self, dir_path, new_dir_name):
    pass

  def register_user_to_file(user, path):
    with self._project_files_lock:
      self._project_files[path].users.add(user)

  def unregister_user_to_file(user, path):
    with self._project_files_lock:
      if user in self._project_files[path].users:
        self._project_files[path].users.remove(user)

  @classmethod
  def _create_file_no_lock(cls, content=""):
    return cls.FileUserPair(ZoneTransit(content), set())


# Debug only
if __name__ == "__main__":

  if len(argv) <= 2:
    error = "Error : Missing parameters \n"
    error += "Usage : python {0} <project_name> <project_path>"
    raise Exception(error)

  name = argv[1]
  path = argv[2]

  add1 = Change(0, "Hello", True)
  add2 = Change(1, "XXX", True)
  # expects "HXXXello"

  file_edited = "/file2"
  core = Core(name, path, None)
  core.add_file(file_edited)
  core.file_edit(file_edited, [add1, add2])

  # hack to execute changes 
  with core._project_files_lock:
    core._project_files[file_edited].zt.ecrireModifications()

  print "\n\n", core.get_file_content(file_edited)