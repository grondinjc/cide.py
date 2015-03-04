from unittest import TestCase

from libZoneTransit import ZoneTransit
from libZoneTransit import Suppression
from libZoneTransit import Ajout
from pdb import set_trace as dbg

class TestZoneTransit(TestCase):
  def setUp(self):
    self.ajout = Ajout(2, 4, "allo")
    self.suppression = Suppression(2, 9)
    self.zone = ZoneTransit("Hello World")

  def tearDown(self):
    pass

  def test_add(self):
    self.zone.add(self.ajout)
    self.assertFalse(self.zone.estVide())

  def test_ecrireModifications(self):
    self.zone.add(self.ajout)
    self.zone.add(self.suppression)
    self.zone.ecrireModifications()
    self.assertEqual(self.zone.contenu, "Heallo")
    
  def test_estVide(self):
    self.assertTrue(self.zone.estVide())