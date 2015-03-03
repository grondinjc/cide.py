import os

def get_existing_files(path):
  file_paths = []
  for root, _, files in os.walk(path, topdown=True):
    file_paths.extend([os.path.join(root, name) for name in files])
  return file_paths

def get_existing_nodes(path):
  node_paths = []
  for root, dirs, files in os.walk(path, topdown=True):
    node_paths.extend([(os.path.join(root, name), False) for name in files])
    node_paths.extend([(os.path.join(root, name), True) for name in dirs])
  return node_paths