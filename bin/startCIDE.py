import sys
import os
import ConfigParser
import cherrypy
from ws4py.server.cherrypyserver import WebSocketPlugin, WebSocketTool
from cide.server.welcomeController import WelcomeController
from cide.server.ideController import IDEController

# Read config file name from command parameters
if len(sys.argv) != 2:
  # XXX Log staring error
  print "Missing or too many arguments. Usage : python startCIDE.py <<configs_file>>"
  sys.exit(1)
else:
  configs_file = sys.argv[1]


# Get the server and app config from the config file received
bin_dir = os.path.dirname(__file__)
templates_dir = os.path.join(bin_dir, '../src/templates')

configs = ConfigParser.RawConfigParser({'SRC': '/srv/www/cide.py/src'})
configs.read(configs_file)

server_conf_file = os.path.join(bin_dir, configs.get('DEFAULT', 'server'))
welcomeController_conf_file = os.path.join(bin_dir, configs.get('DEFAULT', 'welcomeController'))
ideController_conf_file = os.path.join(bin_dir, configs.get('DEFAULT', 'ideController'))

# Set server config with config file
cherrypy.config.update(server_conf_file)

# Loading and setting Websocket plugin
WebSocketPlugin(cherrypy.engine).subscribe()
cherrypy.tools.websocket = WebSocketTool()

# Map URI path to controllers
cherrypy.tree.mount(WelcomeController(), "/", welcomeController_conf_file)
cherrypy.tree.mount(IDEController(templates_dir), "/ide", ideController_conf_file)

# Start server
cherrypy.engine.start()
cherrypy.engine.block()

