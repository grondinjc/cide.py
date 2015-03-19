from unittest import TestCase

from libZoneTransit import TransitZone
from libZoneTransit import Addition
from libZoneTransit import Removal
from pdb import set_trace as dbg

class TestTransitZone(TestCase):
  def setUp(self):
    self.zone = TransitZone("Hello World")
    self.removal = Removal(6,5)

  def tearDown(self):
    pass

  def test_deleteBeforeAdd_Overlaps0(self):
    add = Addition(7,"123")
    self.zone.add(self.removal)
    self.zone.add(add)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "Hello 123")
    
  def test_deletBeforeAdd_Overlaps1(self):
    add = Addition(7,"123")
    self.zone.add(add)
    self.zone.add(self.removal)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "Hello rld")
    #order is important in this case

  def test_deleteBeforeAdd_NoOverlaps0(self):
    add = Addition(11,"!")
    self.zone.add(self.removal)
    self.zone.add(add)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "Hello !")
    
  def test_deleteBeforeAdd_NoOverlaps1(self):
    add = Addition(11,"!")
    self.zone.add(add)
    self.zone.add(self.removal)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "Hello !")
    
  def test_addBeforeDelete0(self):
    add = Addition(2, "123")
    self.zone.add(add)
    self.zone.add(self.removal)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "He123llo ")
    
  def test_addBeforeDelete1(self):
    add = Addition(2, "123")
    self.zone.add(self.removal)
    self.zone.add(add)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "He123llo ")
    
  def test_addAndDeleteSamePosition0(self):
    add = Addition(6, "123")
    self.zone.add(self.removal)
    self.zone.add(add)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "Hello 123")
    
  def test_addAndDeleteSamePosition1(self):
    add = Addition(6, "123")
    self.zone.add(add)
    self.zone.add(self.removal)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "Hello 123")
    
  def test_DeleteInDelete0(self):
    removal1 = Removal(7,3)
    self.zone.add(removal1)
    self.zone.add(self.removal)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "Hello ")
    
  def test_DeleteInDelete1(self):
    removal1 = Removal(7,3)
    self.zone.add(self.removal)
    self.zone.add(removal1)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "Hello ")
    
  def test_DeletesOverlaps0(self):
    removal1 = Removal(5,3)
    self.zone.add(self.removal)
    self.zone.add(removal1)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "Hello")
    
  def test_DeletesOverlaps1(self):
    removal1 = Removal(5,3)
    self.zone.add(removal1)
    self.zone.add(self.removal)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "Hello")
    
  def test_DeletesNoOverlaps0(self):
    removal1 = Removal(0,5)
    self.zone.add(self.removal)
    self.zone.add(removal1)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, " ")
    
  def test_DeletesNoOverlaps1(self):
    removal1 = Removal(0,5)
    self.zone.add(removal1)
    self.zone.add(self.removal)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, " ")
    
  def test_DeletesSamePosition0(self):
    removal1 = Removal(6,5)
    self.zone.add(self.removal)
    self.zone.add(removal1)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "Hello ")
    
  def test_DeletesSamePosition1(self):
    removal1 = Removal(6,5)
    self.zone.add(removal1)
    self.zone.add(self.removal)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "Hello ")