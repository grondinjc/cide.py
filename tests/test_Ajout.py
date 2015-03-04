from unittest import TestCase

from libZoneTransit import Addition
from libZoneTransit import Removal
from libZoneTransit import File
from pdb import set_trace as dbg

class TestAjout(TestCase):
  def setUp(self):
    self.file = File("test")
    self.addition = Addition(2, 4, "allo")

  def tearDown(self):
    pass

  def test_getPosition(self):
    self.assertEqual(self.addition.position, 2)

  def test_getTaille(self):
    self.assertEqual(self.addition.size, 4)

  def test_effectuer(self):
    self.addition.apply(self.file)
    self.assertEqual(self.file.content, "teallost")

  def test_mettreAJour(self):
    modification = Removal(0,3)
    self.addition.update(modification)
    self.assertEqual(self.addition.position, 0)