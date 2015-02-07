import sys
import cherrypy
from ws4py.server.cherrypyserver import WebSocketPlugin, WebSocketTool
from cide.server.ideController import IDEController

# Read config file name from command parameters
config_filename = sys.argv[1]

# Set server config with config file
cherrypy.config.update(config_filename)

# Loading and setting Websocket plugin
WebSocketPlugin(cherrypy.engine).subscribe()
cherrypy.tools.websocket = WebSocketTool()

# Start server for '/' mappings, with config file
cherrypy.quickstart(IDEController(cherrypy.config['SRC']), "/", config_filename)
