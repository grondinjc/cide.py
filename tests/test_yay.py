from unittest import TestCase

from libyay import yay

class TestLibYay(TestCase):
  def test_yay(self):
    self.assertEqual(yay(), "Yay!")

