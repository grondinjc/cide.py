import os
from sys import argv
from pdb import set_trace as dbg
from threading import Lock

import libZoneTransit
from cide.app.utils import (get_existing_files, get_existing_nodes)

class Core(object):

  def __init__(self, project_name, project_path, logger):
    self._logger = logger
    self._project_name = project_name
    self._project_path = project_path # considered as /

    # Make sure directories exists
    if not os.path.exists(self._project_path):
      os.makedirs(self._project_path)
      # Create default file ???

    # Recreate structure from existing files on disk
    self._project_files = list()
    existing_files_path = get_existing_files(self._project_path)
    for file_name in existing_files_path:
      with open(file_name, 'r') as f:
        self._project_files.append(libZoneTransit.ZoneTransit(f.read()))

  # Files, directories and empty directories
  def get_project_nodes(self):
    return get_existing_nodes(self._project_path)
  

  def add_file(self, file_name):
    pass

  def remove_file(self, file_name):
    pass

  def rename_file(self, old_file_name, new_file_name):
    pass

  def add_directory(self, dir_name):
    pass

  def remove_directory(self, dir_name):
    pass

  def rename_directory(self, old_dir_name, new_dir_name):
    pass



if __name__ == "__main__":

  if len(argv) <= 2:
    error = "Error : Missing parameters \n"
    error += "Usage : python {0} <project_name> <project_path>"
    raise Exception(error)

  name = argv[1]
  path = argv[2]
  # path/name will be considered as the project root
  core = Core(name, path, None)
  print core.get_project_nodes()