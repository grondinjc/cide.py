from unittest import TestCase

from libZoneTransit import File
from pdb import set_trace as dbg

class TestFichier(TestCase):
  def setUp(self):
    self.file = File("test")

  def tearDown(self):
    pass

  def test_getContenu(self):
    self.assertEqual(self.file.content, "test")

  def test_ecrireSurDisque(self):
    self.file.writeToDisk()

  def test_inserer(self):
    self.file.insert("Hello World", 0, 11)
    self.assertEqual(self.file.content, "Hello Worldtest")

  def test_supprimer(self):
    self.file.delete(0, 1)
    self.assertEqual(self.file.content, "est")
