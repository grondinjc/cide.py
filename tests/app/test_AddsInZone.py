from unittest import TestCase

from libZoneTransit import TransitZone
from libZoneTransit import Addition
from pdb import set_trace as dbg

class TestTransitZone(TestCase):
  def setUp(self):
    self.addition1 = Addition(0, 5, "Hello")
    self.addition2 = Addition(4, 3, "123")
    self.addition3 = Addition(6, 5, "World")
    self.addition4 = Addition(6, 5, "monde")
    self.zone = TransitZone("Hello ")

  def tearDown(self):
    pass

  def test_add0(self):
    #test adding at the end
    self.zone.add(self.addition3)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "Hello World")

  def test_add1_0(self):
    #test overlaps
    self.zone.add(self.addition1)
    self.zone.add(self.addition2)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "HelloHell123o ")
    
  def test_add1_1(self):
    #write modifications in test 1_0 in reverse order
    self.zone.add(self.addition2)
    self.zone.add(self.addition1)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "HelloHell123o ")
    
  def test_add2_0(self):
    #2nd modification overlaps the previous and the next
    self.zone.add(self.addition1)
    self.zone.add(self.addition2)
    self.zone.add(self.addition3)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "HelloHell123o World")
    
  def test_add2_1(self):
    #reordering of 2_0
    self.zone.add(self.addition1)
    self.zone.add(self.addition3)
    self.zone.add(self.addition2)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "HelloHell123o World")
    
  def test_add2_2(self):
    #reordering of 2_0
    self.zone.add(self.addition2)
    self.zone.add(self.addition1)
    self.zone.add(self.addition3)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "HelloHell123o World")
    
  def test_add2_3(self):
    #reordering of 2_0
    self.zone.add(self.addition2)
    self.zone.add(self.addition3)
    self.zone.add(self.addition1)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "HelloHell123o World")
    
  def test_add2_4(self):
    #reordering of 2_0
    self.zone.add(self.addition3)
    self.zone.add(self.addition2)
    self.zone.add(self.addition1)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "HelloHell123o World")
    
  def test_add2_5(self):
    #reordering of 2_0
    self.zone.add(self.addition3)
    self.zone.add(self.addition1)
    self.zone.add(self.addition2)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "HelloHell123o World")
    
  def test_add3_0(self):
    #write modifications at same position
    self.zone.add(self.addition3)
    self.zone.add(self.addition4)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "Hello Worldmonde")
    
  def test_add3_1(self):
    #reordering of 3_0
    self.zone.add(self.addition4)
    self.zone.add(self.addition3)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "Hello mondeWorld")
    #this is a case where the order of the modifications matters
    
  def test_add4_0(self):
    #The position of the next modification is after the previous's
    #(no overlaps)
    self.zone.add(self.addition1)
    self.zone.add(self.addition3)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "HelloHello World")
    
  def test_add4_1(self):
    #The position of the next modification is before the previous's
    #(reordering of 4_0)
    self.zone.add(self.addition3)
    self.zone.add(self.addition1)
    self.zone.writeModifications()
    self.assertEqual(self.zone.content, "HelloHello World")