from unittest import TestCase

from libZoneTransit import ZoneTransit
from libZoneTransit import Ajout
from pdb import set_trace as dbg

class TestZoneTransit(TestCase):
  def setUp(self):
    self.ajout = Ajout(2, 4, "allo")
    self.zone = ZoneTransit("Hello World")

  def tearDown(self):
    pass

  def test_addRemove(self):
    self.zone.add(self.ajout)
    modif = self.zone.remove()
    self.assertEqual(self.ajout, modif)

  def test_ecrireModifications(self):
    self.zone.add(self.ajout)
    self.zone.ecrireModifications()
    self.assertEqual(self.zone.contenu, "Heallollo World")
