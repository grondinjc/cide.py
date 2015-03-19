from unittest import TestCase

from libZoneTransit import TransitZone
from libZoneTransit import Removal
from libZoneTransit import Addition
from libZoneTransit import Modifications
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
    self.zone.add(Addition(0, "test"))
    self.assertFalse(self.zone.isEmpty())

  def test_writeModificationsComplex(self):
    self.zone.add(self.removal1)
    self.zone.add(self.removal2)
    self.zone.add(self.addition1)
    self.zone.add(self.addition2)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "allomonde")
    
  def test_returnedVectorWriteModifications(self):
    self.zone.add(self.removal1)
    self.zone.add(self.addition1)
    _,modifications = self.zone.writeModifications()
    self.assertEqual(len(modifications), 2)
    self.assertEqual(modifications[0], self.removal1)
    self.assertEqual(modifications[1], self.addition1)
    
  def test_returnedVectorSameModifications(self):
    additionSame = Addition(self.addition1)
    self.assertEqual(additionSame.position, self.addition1.position)
    self.zone.add(self.addition1)
    self.zone.add(additionSame)
    _,modifications = self.zone.writeModifications()
    self.assertEqual(len(modifications), 2)
    self.assertEqual(modifications[0].position, 6)
    self.assertEqual(modifications[1].position, 10)
    
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
    
  def test_writeModificationsFromSameBundle0(self):
    bundle = Modifications()
    add0 = Addition(11,"1")
    add1 = Addition(12,"2")
    add2 = Addition(13,"3")
    bundle.extend([add0,add1,add2])
    self.zone.add(bundle)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "Hello World123")
    
  def test_writeModificationsFromSameBundle1(self):
    bundle = Modifications()
    add0 = Addition(11,"1")
    add1 = Addition(12,"2")
    add2 = Addition(13,"3")
    rem1 = Removal(13,1)
    bundle.extend([add0,add1,add2,rem1])
    self.zone.add(bundle)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "Hello World12")
    
  def test_writeTwoBundles0(self):
    bundle = Modifications()
    add0 = Addition(11,"1")
    add1 = Addition(12,"2")
    add2 = Addition(13,"3")
    bundle.extend([add0,add1,add2])
    self.zone.add(self.addition1)
    self.zone.add(bundle)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "Hello alloWorld123")
    
  def test_writeTwoBundles1(self):
    bundle = Modifications()
    add0 = Addition(11,"1")
    add1 = Addition(12,"2")
    add2 = Addition(13,"3")
    bundle.extend([add0,add1,add2])
    self.zone.add(self.removal1)
    self.zone.add(bundle)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "123")
    
  def test_isEmpty(self):
    self.assertTrue(self.zone.isEmpty())