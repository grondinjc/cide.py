from unittest import TestCase

from libZoneTransit import Suppression
from libZoneTransit import Fichier
from pdb import set_trace as dbg

class TestSuppression(TestCase):
  def setUp(self):
    self.fichier = Fichier("test")
    self.suppression = Suppression(2, 2)

  def tearDown(self):
    pass

  def test_getPosition(self):
    self.assertEqual(self.suppression.position, 2)

  def test_getTaille(self):
    self.assertEqual(self.suppression.taille, 2)

  def test_effectuer(self):
    self.suppression.effectuer(self.fichier)
    self.assertEqual(self.fichier.contenu, "te")
