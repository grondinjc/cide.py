// hack waiting for eminent change by other team member
CHANGE_RM_TYPE = -1;
CHANGE_ADD_TYPE = 1; 

QUnit.module( "test_LocalChanges", {
  beforeEach: function() {
    this.lc = new LocalChanges();
  },
  afterEach: function() {
    // Nothing to be done
  }
});


QUnit.test("testGet :: empty array", function(assert) {
  var changes = this.lc.get();
  assert.ok(changes.length == 0, "Default has no modification");
});

QUnit.test("testGet :: no char", function(assert) {
  this.lc.addChange(0, "");
  var changes = this.lc.get();
  assert.ok(changes.length == 0, "There should be no elements");
});

QUnit.test("testGet :: invalid position", function(assert) {
  this.lc.addChange(-1, "abc");
  var changes = this.lc.get();
  assert.ok(changes.length == 0, "There should be no elements");
});

QUnit.test("testGet :: no char ; invalid position", function(assert) {
  this.lc.addChange(-1, "");
  var changes = this.lc.get();
  assert.ok(changes.length == 0, "There should be no elements");
});



QUnit.test("testAddChange :: one char", function(assert) {
  this.lc.addChange(0, "1");
  var changes = this.lc.get();
  var expected = [createAddModif("1", 0)];
  assert.ok(changes.length == 1, "There should only be one element");
  assert.deepEqual(changes, expected, "Should be type add of '1' at 0");
});

QUnit.test("testAddChange :: contiguous char", function(assert) {
  this.lc.addChange(0, "1");
  this.lc.addChange(1, "2");
  this.lc.addChange(2, "3");
  var changes = this.lc.get();
  var expected = [createAddModif("123", 0)];
  assert.ok(changes.length == 1, "There should only be one element");
  assert.deepEqual(changes, expected, "Should be type add of '123' at 0");
});

QUnit.test("testAddChange :: spaced char", function(assert) {
  this.lc.addChange(0, "1");
  this.lc.addChange(10, "2");
  var changes = this.lc.get();
  var expected = [createAddModif("1", 0),
                  createAddModif("2", 10)];
  assert.ok(changes.length == 2, "There should only be one element");
  assert.deepEqual(changes, expected, "Should be type add of '1' at 0 and '2' at 10");
});

QUnit.test("testAddChange :: one block", function(assert) {
  this.lc.addChange(0, "123");
  var changes = this.lc.get();
  var expected = [createAddModif("123", 0)];
  assert.ok(changes.length == 1, "There should only be one element");
  assert.deepEqual(changes, expected, "Should be type add of '123' at 0");
});

QUnit.test("testAddChange :: contiguous block", function(assert) {
  this.lc.addChange(0, "123");
  this.lc.addChange(3, "456");
  this.lc.addChange(6, "789");
  var changes = this.lc.get();
  var expected = [createAddModif("123456789", 0)];
  assert.ok(changes.length == 1, "There should only be one element");
  assert.deepEqual(changes, expected, "Should be type add of '123456789' at 0");
});

QUnit.test("testAddChange :: spaced block", function(assert) {
  this.lc.addChange(0, "123");
  this.lc.addChange(10, "456");
  var changes = this.lc.get();
  var expected = [createAddModif("123", 0),
                  createAddModif("456", 10)];
  assert.ok(changes.length == 2, "There should only be one element");
  assert.deepEqual(changes, expected, "Should be type add of '123' at 0 and '456' at 10");
});