from unittest import TestCase

from libZoneTransit import TransitZone
from libZoneTransit import Removal
from libZoneTransit import Addition
from pdb import set_trace as dbg

class TestTransitZone(TestCase):
  def setUp(self):
    self.addition1 = Addition(6, 4, "allo")
    self.removal1 = Removal(0, 11)
    self.removal2 = Removal(6,5)
    self.addition2 = Addition(6, 5, "monde")
    self.zone = TransitZone("Hello World")

  def tearDown(self):
    pass

  def test_add(self):
    self.zone.add(self.addition1)
    self.assertFalse(self.zone.isEmpty())

  def test_writeModificationsComplex(self):
    self.zone.add(self.removal1)
    self.zone.add(self.removal2)
    self.zone.add(self.addition1)
    self.zone.add(self.addition2)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "allomonde")
    
  def test_writeRemovalEmptyContent(self):
    emptyFileZone = TransitZone("")
    emptyFileZone.add(self.removal1)
    self.zone.writeModifications()
    self.assertEqual(emptyFileZone.content, "")
    
  def test_writeAddAfterRemoval(self):
    self.zone.add(self.removal1)
    self.zone.add(self.addition1)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "allo")
    
  def test_writeAddAfterRemovalSamePosition(self):
    self.zone.add(self.removal2)
    self.zone.add(self.addition2)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "Hello monde")
      
  def test_writeRemovalAfterAddSamePosition(self):
    self.zone.add(self.addition2)
    self.zone.add(self.removal2)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "Hello monde")
    
  def test_writeTwoAddsSamePosition(self):
    self.zone.add(self.addition1)
    self.zone.add(self.addition2)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "Hello allomondeWorld")
    
  def test_isEmpty(self):
    self.assertTrue(self.zone.isEmpty())