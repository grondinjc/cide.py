from unittest import TestCase
from mock import MagicMock, patch
from cide.server.chatController import (ChatController)


def return_arg(arg):
  return arg


class TestChatControllerSend(TestCase):

  def setUp(self):
    self.mock_app = MagicMock()
    self.mock_logger = MagicMock()
    self.cc = ChatController(self.mock_app, self.mock_logger)

  def tearDown(self):
    pass

  @patch('simplejson.dumps')
  @patch('cide.server.chatController.ChatWebSocket')
  def test_sendTo_normal(self, mock_chat_ws, mock_json_dumps):
    mock_ws_u1 = MagicMock()
    mock_ws_u2 = MagicMock()
    mock_chat_ws.ChatClients = {'u1': mock_ws_u1, 'u2': mock_ws_u2}
    mock_json_dumps.side_effect = return_arg

    self.cc.sendTo('someone', 'my message', ['u1', 'u2'], 0)

    mock_ws_u1.send.assert_called_with({"author": 'someone',
                                        "message": 'my message',
                                        "timestamp": 0})
    mock_ws_u2.send.assert_called_with({"author": 'someone',
                                        "message": 'my message',
                                        "timestamp": 0})
    self.assertFalse(self.mock_logger.warning.called)
    self.assertFalse(self.mock_logger.error.called)

  @patch('simplejson.dumps')
  @patch('cide.server.chatController.ChatWebSocket')
  def test_sendTo_no_users(self, mock_chat_ws, mock_json_dumps):
    mock_ws_u1 = MagicMock()
    mock_ws_u2 = MagicMock()
    mock_chat_ws.ChatClients = {'u1': mock_ws_u1, 'u2': mock_ws_u2}

    self.cc.sendTo('someone', 'my message', [], 0)

    self.assertFalse(mock_json_dumps.called)
    self.assertFalse(mock_ws_u1.send.called)
    self.assertFalse(mock_ws_u2.send.called)
    self.assertFalse(self.mock_logger.warning.called)
    self.assertFalse(self.mock_logger.error.called)

  @patch('simplejson.dumps')
  @patch('cide.server.chatController.ChatWebSocket')
  def test_sendTo_no_ws(self, mock_chat_ws, mock_json_dumps):
    mock_chat_ws.ChatClients = {}
    self.mock_app.removeUser.return_value = ('someone', 'message', [], 0)

    self.cc.sendTo('someone', 'my message', ['u1'], 0)

    self.assertFalse(mock_json_dumps.called)
    self.mock_logger.warning.assert_called_with('u1 has no WS in server')
    self.assertFalse(self.mock_logger.error.called)

  @patch('simplejson.dumps')
  @patch('cide.server.chatController.ChatWebSocket')
  def test_sendTo_not_all_users(self, mock_chat_ws, mock_json_dumps):
    mock_ws_u1 = MagicMock()
    mock_ws_u2 = MagicMock()
    mock_chat_ws.ChatClients = {'u1': mock_ws_u1, 'u2': mock_ws_u2}
    mock_json_dumps.side_effect = return_arg

    self.cc.sendTo('someone', 'my message', ['u1'], 0)

    mock_ws_u1.send.assert_called_with({"author": 'someone',
                                        "message": 'my message',
                                        "timestamp": 0})
    self.assertFalse(mock_ws_u2.send.called)
    self.assertFalse(self.mock_logger.warning.called)
    self.assertFalse(self.mock_logger.error.called)

  @patch('simplejson.dumps')
  @patch('cide.server.chatController.ChatWebSocket')
  def test_sendTo_error_ws(self, mock_chat_ws, mock_json_dumps):
    mock_ws_u1 = MagicMock()
    mock_ws_u1.send.side_effect = Exception()
    mock_ws_u1.peer_address = ('1.2.3.4', 1234)
    mock_chat_ws.ChatClients = {'u1': mock_ws_u1}
    mock_json_dumps.side_effect = return_arg

    self.cc.sendTo('someone', 'my message', ['u1'], 0)

    self.assertFalse(self.mock_app.removeUser.called)
    self.assertFalse(self.mock_logger.warning.called)
    self.mock_logger.error.assert_called_with("u1 (('1.2.3.4', 1234)) WS transfer failed")

