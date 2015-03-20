import sys
import os
import logging
import cherrypy
from configobj import ConfigObj
from ws4py.server.cherrypyserver import WebSocketPlugin, WebSocketTool
from cide.server.welcomeController import WelcomeController
from cide.server.ideController import IDEController
from cide.server.chatController import ChatController
from cide.server.identifyController import IdentifyController, check_identify
from cide.app.python.chat import Chat
from cide.app.python.core import Core

from cide.preprocessor.compile import compile as sass_compiler

def abort_launch(msg):
  cherrypy.log(msg)
  sys.exit(1)

# Read config file name from command parameters
if len(sys.argv) != 3:
  error_msg = "Missing or too many arguments. "
  error_msg += "Usage : python {0} <configs_file> <project_config_file>".format(sys.argv[0])
  abort_launch(error_msg)
else:
  configs_file = sys.argv[1]
  project_configs_file = sys.argv[2]

# Get the server and app config from the config file received
bin_dir = os.path.abspath(os.path.dirname(__file__))
templates_dir = os.path.normpath(os.path.join(bin_dir, '../src/templates'))
preprocessor_dir = os.path.normpath(os.path.join(bin_dir, '../src/preprocessor'))
compiled_dir = os.path.normpath(os.path.join(bin_dir, '../src/static/css'))

# Configuration objects to fetch information from
configs = ConfigObj(configs_file)
project_config = ConfigObj(project_configs_file)

# Server configurations
server_conf_file = configs['DEFAULT']['server']
welcomeController_conf_file = configs['DEFAULT']['welcomeController']
ideController_conf_file = configs['DEFAULT']['ideController']
chatController_conf_file = configs['DEFAULT']['chatController']
identifyController_conf_file = configs['DEFAULT']['identifyController']
cide_log_file = configs['DEFAULT']['log_file']

# Project configuration
project_conf = dict(name = project_config['CoreApp']['name'],
                    base_dir = project_config['CoreApp']['project_base_dir'],
                    code_dir = project_config['CoreApp']['project_code_dir'],
                    exec_dir = project_config['CoreApp']['project_exec_dir'],
                    backup_dir = project_config['CoreApp']['project_backup_dir'])

# Project Realtime relative configuration
cycle_time = int(project_config['CoreAppRealtime']['cycle_time'])
time_buffer_critical = int(project_config['CoreAppRealtime']['time_buffer_critical'])
time_buffer_secondary = int(project_config['CoreAppRealtime']['time_buffer_secondary'])
time_buffer_auxiliary = int(project_config['CoreAppRealtime']['time_buffer_auxiliary'])
core_conf = dict(cycle_time = cycle_time, 
                 buffer_critical = time_buffer_critical,
                 buffer_secondary = time_buffer_secondary,
                 buffer_auxiliary = time_buffer_auxiliary)

# Project Realtime relative configuration validation
for time_buffer in (time_buffer_critical, time_buffer_secondary, time_buffer_auxiliary):
  if time_buffer > 100 and time_buffer < 0:
    abort_launch("Configuration error : time buffer needs to be within range [0;100]")
if sum((time_buffer_critical, time_buffer_secondary, time_buffer_auxiliary)) > 100:
  abort_launch("Configuration error : The sum of time buffers must not exceed 100")
if cycle_time <= 0:
  abort_launch("Configuration error : The cycle time must be a none-zero positive value")

# Compile all sass stylesheets
sass_compiler(preprocessor_dir, compiled_dir)

# Setup Log
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(module)s - %(message)s')
handler = logging.FileHandler(cide_log_file)
handler.setFormatter(formatter)
logger = logging.getLogger('cide.py')
logger.setLevel(logging.DEBUG)
logger.addHandler(handler)

# Set server config with config file
cherrypy.config.update(server_conf_file)

# Loading and setting Websocket plugin
WebSocketPlugin(cherrypy.engine).subscribe()
cherrypy.tools.websocket = WebSocketTool()

# Instanciate App
chatApp = Chat(logger)
coreApp = Core(project_conf, core_conf, logger)

# Bind for server event (start/stop)
cherrypy.engine.subscribe('start', coreApp.start)
cherrypy.engine.subscribe('stop', coreApp.stop)

# Load Identification/Auth handler
cherrypy.tools.auth = cherrypy.Tool('before_handler', check_identify)

# Map URI path to controllers
cherrypy.tree.mount(WelcomeController(logger), "/", welcomeController_conf_file)
cherrypy.tree.mount(IDEController(coreApp, templates_dir, logger), "/ide", ideController_conf_file)
cherrypy.tree.mount(ChatController(chatApp, logger), "/chat", chatController_conf_file)
cherrypy.tree.mount(IdentifyController(templates_dir, logger), "/identify",
                    identifyController_conf_file)

# Start server
cherrypy.engine.start()
cherrypy.engine.block()

