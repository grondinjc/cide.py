import sys
from cherrypy import (config as server_conf,
                      quickstart,
                      engine,
                      tools)
from ws4py.server.cherrypyserver import WebSocketPlugin, WebSocketTool
from cide.server.index import Welcome

# Read config file name from command parameters
config_filename = sys.argv[1]

# Set server config with config file
server_conf.update(config_filename)

# Loading and setting Websocket plugin
WebSocketPlugin(engine).subscribe()
tools.websocket = WebSocketTool()

# Start server for '/' mappings, with config file
quickstart(Welcome(), "/", config_filename)
