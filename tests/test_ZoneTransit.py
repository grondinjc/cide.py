from unittest import TestCase

import libZoneTransit
from pdb import set_trace as dbg

class TestZoneTransit(TestCase):
  def test_ctor(self):
		#dbg()
		ztTest = libZoneTransit.ZoneTransit()
		modifTest = libZoneTransit.Modification(5, 3)
		fichierTest = libZoneTransit.Fichier()
		self.assertEqual(modifTest.position, 5)
		self.assertEqual(modifTest.taille, 3)
