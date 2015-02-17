from unittest import TestCase

import libZoneTransit
from pdb import set_trace as dbg

class TestZoneTransit(TestCase):
  def test_ctor(self):
		#dbg()
		fichierTest = libZoneTransit.Fichier("test")
		fichierTest.printContenu()
		
		modifTest = libZoneTransit.Ajout(2, 4, fichierTest, "allo")
		ztTest = libZoneTransit.ZoneTransit(fichierTest)
		
		self.assertEqual(modifTest.position, 2)
		self.assertEqual(modifTest.taille, 4)
		self.assertEqual(modifTest.fichierID, fichierTest)

		fichierTest.ecrireSurDisque()
		fichierTest.inserer("Hello World", 0, 11)
		fichierTest.printContenu()

		fichierTest.supprimer(1, 11)
		fichierTest.printContenu()

		ztTest.add(modifTest)
		ztTest.ecrireModifications()
		fichierTest.printContenu()

		modif = ztTest.remove()
		self.assertEqual(modifTest, modif)

		suppTest = libZoneTransit.Suppression(2, 5, fichierTest)
		ztTest.add(suppTest)
		ztTest.ecrireModifications()
		fichierTest.printContenu()
