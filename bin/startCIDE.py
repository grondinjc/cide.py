import sys
import os
import sass
import logging
import cherrypy
from configobj import ConfigObj
from ws4py.server.cherrypyserver import WebSocketPlugin, WebSocketTool
from cide.server.welcomeController import WelcomeController
from cide.server.ideController import IDEController
from cide.server.chatController import ChatController
from cide.app.python.chat import Chat

PREPROCESSOR_STYLE_EXT = '.scss'
COMPILED_STYLE_EXT = '.css'

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
cide_log_file = configs['DEFAULT']['log_file']

# Detect all SASS files
scss_files = ["{0}/{1}".format(preprocessor_dir,filename) 
              for filename in os.listdir(preprocessor_dir) 
              if filename.endswith(PREPROCESSOR_STYLE_EXT)]

# Process all detected SASS files
for scss in scss_files:
  # for more options, check help by doing 
  # python -c "import sass;help(sass.compile)
  compiled_css = sass.compile(filename=scss)
  compiled_css_path = os.path.join(compiled_dir, 
                                   os.path.basename(scss).replace(PREPROCESSOR_STYLE_EXT, 
                                                                  COMPILED_STYLE_EXT))
  # Open file in write mode to override any existing content
  with open(compiled_css_path, 'w') as compiled_file:
    compiled_file.write(compiled_css)

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

# Map URI path to controllers
cherrypy.tree.mount(WelcomeController(logger), "/", welcomeController_conf_file)
cherrypy.tree.mount(IDEController(templates_dir, logger), "/ide", ideController_conf_file)
cherrypy.tree.mount(ChatController(chatApp, logger), "/chat", chatController_conf_file)

# Start server
cherrypy.engine.start()
cherrypy.engine.block()

