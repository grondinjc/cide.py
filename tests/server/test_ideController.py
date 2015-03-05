from unittest import TestCase

from cide.server.ideController import (is_valid_path, 
                                       is_valid_changes)

from pdb import set_trace as dbg

class TestIdeControllerPathValidator(TestCase):

  def test_bad_type(self):
    path = 0
    self.assertFalse(is_valid_path(path))

  def test_empty_string(self):
    path = ""
    self.assertFalse(is_valid_path(path))

  def test_current_no_root(self):
    path = "."
    self.assertFalse(is_valid_path(path))

  def test_parent_no_root(self):
    path = ".."
    self.assertFalse(is_valid_path(path))

  def test_root(self):
    path = "/"
    self.assertFalse(is_valid_path(path))

  def test_file_no_root(self):
    path = "node"
    self.assertFalse(is_valid_path(path))

  def test_file_with_dot_no_root(self):
    path = "node.py"
    self.assertFalse(is_valid_path(path))

  def test_no_root_ending_slash(self):
    path = "node/"
    self.assertFalse(is_valid_path(path))

  def test_no_root_ending_slash_with_spaces(self):
    path = "node/ "
    self.assertFalse(is_valid_path(path))

  def test_no_root_dir_current(self):
    path = "node/." # meaning /node/
    self.assertFalse(is_valid_path(path))

  def test_no_root_dir_parent(self):
    path = "node/.." # meaning /
    self.assertFalse(is_valid_path(path))

  def test_no_root_dir_current_file(self):
    path = "node/./node2" # meaning /
    self.assertFalse(is_valid_path(path))

  def test_dir_multiple_parent_no_root(self):
    path = "../../.."
    self.assertFalse(is_valid_path(path))

  def test_current_with_root(self):
    path = "/."
    self.assertFalse(is_valid_path(path))

  def test_parent_with_root(self):
    path = "/.."
    self.assertFalse(is_valid_path(path))

  def test_file_with_root(self):
    path = "/node"
    self.assertTrue(is_valid_path(path))

  def test_file_with_dot_with_root(self):
    path = "/node.py"
    self.assertTrue(is_valid_path(path))

  def test_with_root_ending_slash(self):
    path = "/node/"
    self.assertFalse(is_valid_path(path))

  def test_with_root_ending_slash_with_spaces(self):
    path = "/node/ "
    self.assertFalse(is_valid_path(path))

  def test_with_root_dir_current(self):
    path = "/node/." # meaning /node/
    self.assertFalse(is_valid_path(path))

  def test_with_root_dir_parent(self):
    path = "/node/.." # meaning /
    self.assertFalse(is_valid_path(path))

  def test_with_root_dir_current_file(self):
    path = "/node/./node2" # meaning /
    self.assertFalse(is_valid_path(path))

  def test_dir_multiple_parent_with_root(self):
    path = "/../../.."
    self.assertFalse(is_valid_path(path))


class TestIdeControllerChangesValidator(TestCase):

  def test_empty_array(self):
    changes = []
    self.assertTrue(is_valid_changes(changes))

  def test_bad_type(self):
    changes = 0
    self.assertFalse(is_valid_changes(changes))

  def test_bad_element_type(self):
    changes = [['abc', 1, 0]]
    self.assertFalse(is_valid_changes(changes))


  # Content/Count parameter verification tests

  def test_missing_content_count_keys(self):
    changes = [dict(pos=0, type=str(10))]
    self.assertFalse(is_valid_changes(changes))

  def test_both_content_count_keys(self):
    changes = [dict(content='abc', count=1, pos=0, type=1)]
    self.assertFalse(is_valid_changes(changes))


  # Type parameter verification tests

  def test_missing_type_key(self):
    changes = [dict(content='abc', pos=0)]
    self.assertFalse(is_valid_changes(changes))

  def test_bad_type_type(self):
    changes = [dict(content='abc', pos=0, type=str(10))]
    self.assertFalse(is_valid_changes(changes))

  def test_bad_type_value(self):
    changes = [dict(content='abc', pos=0, type=10)]
    self.assertFalse(is_valid_changes(changes))


  # Pos parameter verification tests

  def test_missing_pos_key(self):
    changes = [dict(content='abc', type=1)]
    self.assertFalse(is_valid_changes(changes))

  def test_bad_pos_type(self):
    changes = [dict(content='abc', pos=str(10), type=1)]
    self.assertFalse(is_valid_changes(changes))

  def test_bad_pos_value(self):
    changes = [dict(content='abc', pos=-13, type=1)]
    self.assertFalse(is_valid_changes(changes))


  # Valid tests

  def test_valid_add(self):
    changes = [dict(content='abc', pos=0, type=1)]
    self.assertTrue(is_valid_changes(changes))

  def test_valid_remove(self):
    changes = [dict(count=10, pos=0, type=-1)]
    self.assertTrue(is_valid_changes(changes))