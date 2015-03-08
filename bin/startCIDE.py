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

# Read config file name from command parameters
if len(sys.argv) != 2:
  cherrypy.log("Missing or too many arguments. Usage : python startCIDE.py <<configs_file>>")
  sys.exit(1)
else:
  configs_file = sys.argv[1]

# Get the server and app config from the config file received
bin_dir = os.path.abspath(os.path.dirname(__file__))
templates_dir = os.path.normpath(os.path.join(bin_dir, '../src/templates'))
preprocessor_dir = os.path.normpath(os.path.join(bin_dir, '../src/preprocessor'))
compiled_dir = os.path.normpath(os.path.join(bin_dir, '../src/static/css'))

configs = ConfigObj(configs_file)

server_conf_file = configs['DEFAULT']['server']
welcomeController_conf_file = configs['DEFAULT']['welcomeController']
ideController_conf_file = configs['DEFAULT']['ideController']
chatController_conf_file = configs['DEFAULT']['chatController']
identifyController_conf_file = configs['DEFAULT']['identifyController']
cide_log_file = configs['DEFAULT']['log_file']

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
coreApp = Core("dummyProjectName", "/tmp/test/dummyProjectName", logger, 4)

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

