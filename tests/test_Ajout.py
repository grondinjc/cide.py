from unittest import TestCase

from libZoneTransit import Ajout
from libZoneTransit import Fichier
from pdb import set_trace as dbg

class TestAjout(TestCase):
  def setUp(self):
    self.fichier = Fichier("test")
    self.ajout = Ajout(2, 4, "allo")

  def tearDown(self):
    pass

  def test_getPosition(self):
    self.assertEqual(self.ajout.position, 2)

  def test_getTaille(self):
    self.assertEqual(self.ajout.taille, 4)

  def test_effectuer(self):
    self.ajout.effectuer(self.fichier)
    self.assertEqual(self.fichier.contenu, "teallost")
