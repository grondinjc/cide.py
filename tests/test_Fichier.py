from unittest import TestCase

from libZoneTransit import Fichier
from pdb import set_trace as dbg

class TestFichier(TestCase):
  def setUp(self):
    self.fichier = Fichier("test")

  def tearDown(self):
    pass

  def test_getContenu(self):
    self.assertEqual(self.fichier.contenu, "test")

  def test_ecrireSurDisque(self):
    self.fichier.ecrireSurDisque()

  def test_inserer(self):
    self.fichier.inserer("Hello World", 0, 11)
    self.assertEqual(self.fichier.contenu, "Hello Worldtest")

  def test_supprimer(self):
    self.fichier.supprimer(0, 1)
    self.assertEqual(self.fichier.contenu, "est")
