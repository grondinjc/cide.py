function MockZoneLastVersion(initText){
  this.value = initText || "";
}
MockZoneLastVersion.prototype.text = function(arg1){
  if(arg1 == undefined)
    return this.value;
  this.value = arg1;
};
MockZoneLastVersion.prototype.val = function(){
  return this.text();
};


QUnit.module("test_LastVersionZone", {
  beforeEach: function() {
    this.mock = new MockZoneLastVersion("Hello ");
    this.lvz = new LastVersionZone(this.mock);
    this.add1 = new ObjectAddChange(0, "Hello");
    this.add2 = new ObjectAddChange(4, "123");
    this.add3 = new ObjectAddChange(6, "World");
    this.add4 = new ObjectAddChange(6, "monde");
  }
});

QUnit.test("testUpdate (add) :: None", function(assert) {
  this.lvz.update([]);
  stringResult = this.mock.val();
  assert.equal(stringResult, "Hello ", "Passed!");
});

QUnit.test("testUpdate (add) :: AddAtEnd", function(assert) {
  //test adding at the end
  this.lvz.update([this.add3]);
  stringResult = this.mock.val();
  assert.equal(stringResult, "Hello World", "Passed!");
});

QUnit.test("testUpdate (add) :: Overlaps0", function(assert) {
  //test overlaps
  this.lvz.update([this.add1, this.add2]);
  stringResult = this.mock.val();
  assert.equal(stringResult, "Hell123oHello ", "Passed!");
});

QUnit.test("testUpdate (add) :: Overlaps1", function(assert) {
  //write modifications in test 1_0 in reverse order
  this.lvz.update([this.add2, this.add1]);
  stringResult = this.mock.val();
  assert.equal(stringResult, "HelloHell123o ", "Passed!");
});

QUnit.test("testUpdate (add) :: Overlaps2", function(assert) {
  //2nd modification overlaps the previous and the next
  this.lvz.update([this.add1, this.add2, this.add3]);
  stringResult = this.mock.val();
  assert.equal(stringResult, "Hell12World3oHello ");
});

QUnit.test( "testUpdate (add) :: NegativePosAdd", function(assert) {
  var negAdd = new ObjectAddChange(-1, "Minus");
  this.lvz.update([negAdd]);
  stringResult = this.mock.val();
  assert.equal(stringResult, "MinusHello ", "Should not happen, would be updated");
});

QUnit.test( "testUpdate (add) :: AfterEndOfFileAdd", function(assert) {
  var tooBigAdd = new ObjectAddChange(100, "Too big");
  this.lvz.update([tooBigAdd]);
  stringResult = this.mock.val();
  assert.equal(stringResult, "Hello Too big", "Should not happen, would be updated");
});

QUnit.test("testUpdate (add) :: SamePositions0", function(assert) {
  //write modifications at same position
  this.lvz.update([this.add3, this.add4]);
  stringResult = this.mock.val();
  assert.equal(stringResult, "Hello mondeWorld", "Passed!");
});

QUnit.test("testUpdate (add) :: SamePositions1", function(assert) {
  //write modifications at same position
  this.lvz.update([this.add4, this.add3]);
  stringResult = this.mock.val();
  assert.equal(stringResult, "Hello Worldmonde", "Passed!");
});

QUnit.test("testUpdate (add) :: BeforeAfter", function(assert) {
  //The position of the next modification is after the previous's
  //(no overlaps)
  this.lvz.update([this.add1, this.add3]);
  stringResult = this.mock.val();
  assert.equal(stringResult, "HelloHWorldello ", "Passed!");
});

QUnit.test("testUpdate (add) :: AfterBefore", function(assert) {
  //The position of the next modification is before the previous's
  //(reordering of 4_0)
  this.lvz.update([this.add3, this.add1]);
  stringResult = this.mock.val();
  assert.equal(stringResult, "HelloHello World", "Passed!");
});


// Redefine module to override setUp function
// without having to rewrite previous tests
QUnit.module("test_LastVersionZone", {
  beforeEach: function() {
    this.mock = new MockZoneLastVersion("0123456789");
    this.lvz = new LastVersionZone(this.mock);
  }
});



QUnit.test("testUpdate (remove) :: no changes", function(assert) {
  this.lvz.update([]);
  stringResult = this.mock.val();
  assert.equal(stringResult, "0123456789", "Should stay the same");
});

QUnit.test("testUpdate (remove) :: empty change", function(assert) {
  var changes = [new ObjectRemoveChange(0, 0)];
  this.lvz.update(changes);
  stringResult = this.mock.val();
  assert.equal(stringResult, "0123456789", "Should stay the same");
});

QUnit.test("testUpdate (remove) :: edit at end", function(assert) {
  var changes = [new ObjectRemoveChange(8, 2)];
  this.lvz.update(changes);
  stringResult = this.mock.val();
  assert.equal(stringResult, "01234567", "Should be edited");
});

QUnit.test("testUpdate (remove) :: edit at end ; exceeding", function(assert) {
  var changes = [new ObjectRemoveChange(8, 3)];
  this.lvz.update(changes);
  stringResult = this.mock.val();
  assert.equal(stringResult, "01234567", "Should be edited");
});

QUnit.test("testUpdate (remove) :: multiple edit ; overlapping", function(assert) {
  var changes = [new ObjectRemoveChange(5, 3),
                 new ObjectRemoveChange(3, 3)];
  this.lvz.update(changes);
  stringResult = this.mock.val();
  assert.equal(stringResult, "0129", "Should be edited");
});

QUnit.test("testUpdate (remove) :: multiple edit ; overlapped (2)", function(assert) {
  var changes = [new ObjectRemoveChange(3, 3),
                 new ObjectRemoveChange(5, 3)];
  this.lvz.update(changes);
  stringResult = this.mock.val();
  assert.equal(stringResult, "01267", "Should be edited");
});

QUnit.test("testUpdate (remove) :: multiple edit ; overlapped (3)", function(assert) {
  var changes = [new ObjectRemoveChange(3, 3),
                 new ObjectRemoveChange(5, 3),
                 new ObjectRemoveChange(3, 2)];
  this.lvz.update(changes);
  stringResult = this.mock.val();
  assert.equal(stringResult, "012", "Should be edited");
});

QUnit.test( "testUpdate (remove) :: negative count", function(assert) {
  var changes = [new ObjectRemoveChange(0, -1)];
  this.lvz.update(changes);
  stringResult = this.mock.val();
  assert.equal(stringResult, "0123456789", "Should not be edited");
});

QUnit.test( "testUpdate (remove) :: negative position", function(assert) {
  var changes = [new ObjectRemoveChange(-1, 1)];
  this.lvz.update(changes);
  stringResult = this.mock.val();
  assert.equal(stringResult, "123456789", "Should not happen, would be edited");
});

QUnit.test( "testUpdate (remove) :: exceeding position", function(assert) {
  var changes = [new ObjectRemoveChange(100, 1)];
  this.lvz.update(changes);
  stringResult = this.mock.val();
  assert.equal(stringResult, "0123456789", "Should not be edited");
});

QUnit.test("testUpdate (remove) :: multiple edit ; same position", function(assert) {
  var changes = [new ObjectRemoveChange(2, 2),
                 new ObjectRemoveChange(2, 2)];
  this.lvz.update(changes);
  stringResult = this.mock.val();
  assert.equal(stringResult, "016789", "Should be edited");
});

QUnit.test("testUpdate (remove) :: multiple edit ; consecutive not overlapping ; increasing", function(assert) {
  var changes = [new ObjectRemoveChange(2, 2),
                 new ObjectRemoveChange(4, 4)];
  this.lvz.update(changes);
  stringResult = this.mock.val();
  assert.equal(stringResult, "0145", "Should be edited");
});

QUnit.test("testUpdate (remove) :: multiple edit ; consecutive not overlapping ; decreasing", function(assert) {
  var changes = [new ObjectRemoveChange(4, 4),
                 new ObjectRemoveChange(5, 1)];
  this.lvz.update(changes);
  stringResult = this.mock.val();
  assert.equal(stringResult, "01238", "Should be edited");
});