import os
import shutil

def get_existing_files(path):
  file_paths = []
  for root, _, files in os.walk(path, topdown=True):
    file_paths.extend(['/' + os.path.relpath(os.path.join(root, name), path) for name in files])
  return file_paths

def get_existing_dirs(path):
  dir_paths = []
  for root, dirs, _ in os.walk(path, topdown=True):
    dir_paths.extend(['/' + os.path.relpath(os.path.join(root, name), path) for name in dirs])
  return dir_paths

def remove_dir_content(dirpath):
  shutil.rmtree(dirpath)
  os.mkdir(dirpath)

def remove_dir(dirpath):
  shutil.rmtree(dirpath)