# auteure: Mariane Maynard
"""
Fonctions testant le temps d'execution de chacune des taches du core
"""

from datetime import datetime
import random
from cide.app.python.core import Core, MAX_USERS, MAX_FILES
import logging
from Queue import Queue


class Benchmarks(object):
  def __init__(self):

    self.project_conf = dict(name='Benchmarks',
                             base_dir='./temp',
                             code_dir='./temp',
                             exec_dir='./temp/exec',
                             backup_dir='./temp/bck',
                             tmp_dir='./temp/tmp')

    # Not used since tasks are called directly
    self.core_conf = dict(cycle_time=100000,
                          buffer_critical=50,
                          buffer_secondary=40,
                          buffer_auxiliary=10)

    # Setup Log
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(module)s - %(message)s')
    handler = logging.FileHandler("log_benchmarks")
    handler.setFormatter(formatter)
    self.logger = logging.getLogger('cide.py')
    self.logger.setLevel(logging.DEBUG)
    self.logger.addHandler(handler)

    self.core = Core(self.project_conf, self.core_conf, self.logger)
    self.callers = []
    self.files = []
    self.changes = []
    self.executables = [path for path in self.core._project_files]
    self.core = None

    for i in range(MAX_USERS):
      self.callers.append(chr(ord('a')+i / 26) + chr(ord('a')+i % 26))

    for i in range(MAX_FILES):
      filename = ""
      for j in range(random.randint(1, 100)):
        filename += '/' + chr(ord('a')+i / 26) + chr(ord('a')+i % 26)
      self.files.append(filename)

  def setUp(self):
    self.core = Core(self.project_conf, self.core_conf, self.logger)

    for file in self.files:
      self.core.add_file(file)

    # Register all users to all files
    for file in self.files:
      for user in self.callers:
        self.core._task_open_file(user, file)

    # One change per user per file
    for file in self.files:
      for user in self.callers:
        self.core._task_file_edit(file, [Core.Change(0, "Hello", True)], user)

  def tearDown(self):
    self.core = None

  def benchmarks_task_get_project_nodes(self):
    print 'Test de _task_get_project_nodes'
    caller = random.choice(self.callers)
    self.myTimeIt(lambda: self.core._task_get_project_nodes(caller))
    print ' '

  def benchmarks_task_get_file_content(self):
    print 'Test de _task_get_file_content'
    caller = random.choice(self.callers)
    file = random.choice(self.files)
    self.myTimeIt(lambda: self.core._task_get_file_content(file, caller))
    print ' '

  def benchmarks_task_open_file(self):
    print 'Test de _task_open_file'
    user = random.choice(self.callers)
    file = random.choice(self.files)
    self.myTimeIt(lambda: self.core._task_open_file(user, file))
    print ' '

  def benchmarks_task_unregister_user_to_file(self):
    print 'Test de _task_unregister_user_to_file'
    user = random.choice(self.callers)
    file = random.choice(self.files)
    self.myTimeIt(lambda: self.core._task_unregister_user_to_file(user, file))
    print ' '

  def benchmarks_task_unregister_user_to_all_files(self):
    print 'Test de _task_unregister_user_to_all_files'
    user = random.choice(self.callers)
    self.myTimeIt(lambda: self.core._task_unregister_user_to_all_files(user))
    print ' '

  def benchmarks_task_file_edit(self):
    print 'Test de _task_file_edit'
    file = random.choice(self.files)
    user = random.choice(self.callers)
    self.myTimeIt(lambda: self.core._task_file_edit(file, [Core.Change(0, "Hello", True)], user))
    print ' '

  def benchmarks_task_check_apply_notify(self):
    print 'Test de task_check_apply_notify'
    self.myTimeIt(lambda: self.core.task_check_apply_notify())
    print ' '

  def benchmarks_task_create_archive(self):
    print 'Test de _task_create_archive'
    caller = random.choice(self.callers)
    self.myTimeIt(lambda: self.core._task_create_archive('.', caller, Queue()))
    print ' '

  def bencharmarks_task_program_launch(self):
    print 'Test de _task_program_launch'
    caller = random.choice(self.callers)
    mainpath = random.choice(self.executables)
    self.myTimeIt(lambda: self.core._task_program_launch(mainpath, '', caller))
    print ''

  def benchmarks_task_program_input(self):
    print 'Test de _task_program_input'
    caller = random.choice(self.callers)
    specificSetup = lambda: self.task_program_setup(caller)
    self.myTimeIt(lambda: self.core._task_program_input(caller, caller), specificSetup=specificSetup)
    print ''

  def benchmarks_task_program_kill(self):
    print 'Test de _task_program_kill'
    caller = random.choice(self.callers)
    specificSetup = lambda: self.task_program_setup(caller)
    self.myTimeIt(lambda: self.core._task_program_kill(caller), specificSetup=specificSetup)
    print ''

  def benchmarks_task_write_to_disk(self):
    print 'Test de _task_write_to_disk'
    caller = random.choice(self.callers)
    self.myTimeIt(lambda: self.core._task_write_to_disk(caller))
    print ' '

  def task_program_setup(self, caller):
    # The caller launches the program
    self.core._task_program_launch('/aa.py', '', caller)
    self.core.task_check_program_output_notify()

  def benchmarks_task_check_program_output_notify(self):
    print 'Test de task_check_program_output_notify'
    specificSetup = lambda: self.check_program_output_notify_setup()
    self.myTimeIt(lambda: self.core.task_check_program_output_notify(), specificSetup=specificSetup)
    print ''

  def check_program_output_notify_setup(self):
    # All users call a program
    for caller in self.callers:
      file = random.choice(self.executables)
      self.core._task_program_launch(file, '', caller)

  def myTimeIt(self, function, n=1000, specificSetup=None):
    times = []
    for i in range(n):
      self.setUp()
      if specificSetup is not None:
        specificSetup()
      startTime = datetime.now()
      function()
      endTime = datetime.now()
      self.tearDown()
      times.append(endTime - startTime)

    print '3 first are : {0} {1} {2}'.format(*times[:3])
    print '3 last are : {0} {1} {2}'.format(*times[-1:-4:-1])

    times.sort()
    print '10 best are : {0} {1} {2} {3} {4} {5} {6} {7} {8} {9}'.format(*times[:10])
    print '10 worst are : {0} {1} {2} {3} {4} {5} {6} {7} {8} {9}'.format(*times[-1:-11:-1])

    print 'best case is : {0}'.format(min(times))
    print 'worst case is : {0}'.format(max(times))
    print 'average is: {0}'.format((reduce(lambda x, y: x + y, times)/len(times)))

benchmarks = Benchmarks()
benchmarks.benchmarks_task_get_project_nodes()
benchmarks.benchmarks_task_get_file_content()
benchmarks.benchmarks_task_open_file()
benchmarks.benchmarks_task_unregister_user_to_file()
benchmarks.benchmarks_task_unregister_user_to_all_files()
benchmarks.benchmarks_task_file_edit()
benchmarks.benchmarks_task_check_apply_notify()
benchmarks.benchmarks_task_create_archive()
benchmarks.bencharmarks_task_program_launch()
benchmarks.benchmarks_task_program_input()
benchmarks.benchmarks_task_program_kill()
benchmarks.benchmarks_task_check_program_output_notify()
benchmarks.benchmarks_task_write_to_disk()
