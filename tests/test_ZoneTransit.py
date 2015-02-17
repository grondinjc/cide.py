from unittest import TestCase

import libZoneTransit
from pdb import set_trace as dbg

class TestZoneTransit(TestCase):
  def test_ctor(self):
		#dbg()
		fichierTest = libZoneTransit.Fichier("test")
		modifTest = libZoneTransit.Ajout(5, 3, fichierTest, "allo")
		ztTest = libZoneTransit.ZoneTransit(fichierTest)
		
		self.assertEqual(modifTest.position, 5)
		self.assertEqual(modifTest.taille, 3)
		self.assertEqual(modifTest.fichierID, fichierTest)

		fichierTest.ecrireSurDisque()
		fichierTest.inserer("Hello World", 0, 11)
		fichierTest.supprimer(1, 11)

		ztTest.add(modifTest)
		modif = ztTest.remove()
		self.assertEqual(modifTest, modif)

		fichierTest.printContenu()
