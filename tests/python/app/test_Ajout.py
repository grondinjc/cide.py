from unittest import TestCase

from libZoneTransit import Addition
from libZoneTransit import Removal
from libZoneTransit import File
from pdb import set_trace as dbg

class TestAjout(TestCase):
  def setUp(self):
    self.file = File("test")
    self.addition = Addition(2, 4, "allo", "me")

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
    modification = Removal(1, 3, "me")
    self.addition.update(modification)
    self.assertEqual(self.addition.position, 1)
    
  def test_getData(self):
    self.assertEqual(self.addition.data, "allo")
    
  def test_isAdd(self):
    self.assertTrue(self.addition.isAdd())
    
  def test_isRemove(self):
    self.assertFalse(self.addition.isRemove())
