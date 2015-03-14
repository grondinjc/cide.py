// Tests for LocalChanges module
QUnit.module("test_LocalChanges", {
  beforeEach: function() {
    this.lc = new LocalChanges();
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

// This should not happen 
QUnit.test("testGet :: invalid position", function(assert) {
  this.lc.addChange(-1, "abc");
  var changes = this.lc.get();
  assert.ok(changes.length != 0, "An invalid position should not happen in pratice");
});

QUnit.test("testGet :: no char ; invalid position", function(assert) {
  this.lc.addChange(-1, "");
  var changes = this.lc.get();
  assert.ok(changes.length == 0, "An invalid position should not happen in pratice");
});



QUnit.test("testClear :: empty array", function(assert) {
  this.lc.clear();
  var changes = this.lc.get();
  assert.ok(changes.length == 0, "Size should be of zero");
});

QUnit.test("testClear :: contiguous changes", function(assert) {
  this.lc.addChange(0, "1");
  this.lc.addChange(1, "2");
  this.lc.clear();
  var changes = this.lc.get();
  assert.ok(changes.length == 0, "Size should be of zero");
});

QUnit.test("testClear :: none contiguous changes", function(assert) {
  this.lc.addChange(1, "2");
  this.lc.addChange(0, "1");
  this.lc.clear();
  var changes = this.lc.get();
  assert.ok(changes.length == 0, "Size should be of zero");
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
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should be type add of '1' at 0 and '2' at 10");
});

QUnit.test("testAddChange :: none contiguous char", function(assert) {
  this.lc.addChange(10, "2");
  this.lc.addChange(1, "1");
  var changes = this.lc.get();
  var expected = [createAddModif("2", 10), 
                  createAddModif("1", 1)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should be type add of '2' at 10 and '1' at 1");
});

QUnit.test("testAddChange :: none contiguous char ; same position", function(assert) {
  this.lc.addChange(10, "a");
  this.lc.addChange(10, "A");
  var changes = this.lc.get();
  var expected = [createAddModif("a", 10), 
                  createAddModif("A", 10)];
  assert.ok(changes.length == 2, "There should be two elements");
  // Localzone does not update his own changes by itself
  assert.deepEqual(changes, expected, "Should be type add both at 10");
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
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should be type add of '123' at 0 and '456' at 10");
});

QUnit.test("testAddChange :: none contiguous block", function(assert) {
  this.lc.addChange(10, "ABC");
  this.lc.addChange(1, "abc");
  var changes = this.lc.get();
  var expected = [createAddModif("ABC", 10), 
                  createAddModif("abc", 1)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should be type add of 'ABC' at 10 and 'abc' at 1");
});

QUnit.test("testAddChange :: none contiguous block ; same position", function(assert) {
  this.lc.addChange(10, "abc");
  this.lc.addChange(10, "ABC");
  var changes = this.lc.get();
  var expected = [createAddModif("abc", 10), 
                  createAddModif("ABC", 10)];
  assert.ok(changes.length == 2, "There should be two elements");
  // Localzone does not update his own changes by itself
  assert.deepEqual(changes, expected, "Should be type add both at 10");
});

QUnit.test("testAddChange :: none contiguous block ; overlapping", function(assert) {
  this.lc.addChange(10, "abc");
  this.lc.addChange(11, "A");
  var changes = this.lc.get();
  var expected = [createAddModif("abc", 10), 
                  createAddModif("A", 11)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should be type add of 'abc' at 10 and 'A' at 11");
});



QUnit.test("testRemoveChange :: one char", function(assert) {
  this.lc.removeChange(0, 1);
  var changes = this.lc.get();
  var expected = [createRemoveModif(1, 0)];
  assert.ok(changes.length == 1, "There should only be one element");
  assert.deepEqual(changes, expected, "Should be type remove of 1 char from 0");
});

QUnit.test("testRemoveChange :: contiguous char", function(assert) {
  this.lc.removeChange(0, 1);
  this.lc.removeChange(1, 1);
  this.lc.removeChange(2, 1);
  var changes = this.lc.get();
  var expected = [createRemoveModif(3, 0)];
  assert.ok(changes.length == 1, "There should only be one element");
  assert.deepEqual(changes, expected, "Should be type remove of 3 chars from 0");
});

QUnit.test("testRemoveChange :: spaced char", function(assert) {
  this.lc.removeChange(0, 1);
  this.lc.removeChange(10, 1);
  var changes = this.lc.get();
  var expected = [createRemoveModif(1, 0),
                  createRemoveModif(1, 10)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should be type remove of 1 char from 0 and of 1 char from 10");
});

QUnit.test("testRemoveChange :: none contiguous char", function(assert) {
  this.lc.removeChange(10, 1);
  this.lc.removeChange(1, 1);
  var changes = this.lc.get();
  var expected = [createRemoveModif(1, 10), 
                  createRemoveModif(1, 1)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should be type remove of 1 char from 10 and 1 char from 1");
});

QUnit.test("testRemoveChange :: none contiguous char ; same position", function(assert) {
  this.lc.removeChange(10, 1);
  this.lc.removeChange(10, 1);
  var changes = this.lc.get();
  var expected = [createRemoveModif(1, 10), 
                  createRemoveModif(1, 10)];
  assert.ok(changes.length == 2, "There should be two elements");
  // Localzone does not update his own changes by itself
  assert.deepEqual(changes, expected, "Should be type remove both of 1 char from 10");
});

QUnit.test("testRemoveChange :: one block", function(assert) {
  this.lc.removeChange(0, 3);
  var changes = this.lc.get();
  var expected = [createRemoveModif(3, 0)];
  assert.ok(changes.length == 1, "There should only be one element");
  assert.deepEqual(changes, expected, "Should be type remove of 3 chars from 0");
});

QUnit.test("testRemoveChange :: contiguous block", function(assert) {
  this.lc.removeChange(0, 3);
  this.lc.removeChange(3, 3);
  this.lc.removeChange(6, 3);
  var changes = this.lc.get();
  var expected = [createRemoveModif(9, 0)];
  assert.ok(changes.length == 1, "There should only be one element");
  assert.deepEqual(changes, expected, "Should be type remove of 9 chars from 0");
});

QUnit.test("testRemoveChange :: spaced block", function(assert) {
  this.lc.removeChange(0, 3);
  this.lc.removeChange(10, 3);
  var changes = this.lc.get();
  var expected = [createRemoveModif(3, 0),
                  createRemoveModif(3, 10)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should be type remove of 3 chars from 0 and 3 chars from 10");
});

QUnit.test("testRemoveChange :: none contiguous block", function(assert) {
  this.lc.removeChange(10, 3);
  this.lc.removeChange(1, 3);
  var changes = this.lc.get();
  var expected = [createRemoveModif(3, 10), 
                  createRemoveModif(3, 1)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should be type remove of 3 chars from 10 and 3 chars from 1");
});

QUnit.test("testRemoveChange :: none contiguous block ; same position", function(assert) {
  this.lc.removeChange(10, 3);
  this.lc.removeChange(10, 3);
  var changes = this.lc.get();
  var expected = [createRemoveModif(3, 10), 
                  createRemoveModif(3, 10)];
  assert.ok(changes.length == 2, "There should be two elements");
  // Localzone does not update his own changes by itself
  assert.deepEqual(changes, expected, "Should be type remove both of 3 chars from 10");
});

QUnit.test("testRemoveChange :: none contiguous block ; overlapping", function(assert) {
  this.lc.removeChange(10, 3);
  this.lc.removeChange(11, 1);
  var changes = this.lc.get();
  var expected = [createRemoveModif(3, 10), 
                  createRemoveModif(1, 11)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should be type remove of 3 chars from 10 and of 1 char from 11");
});



QUnit.test("testUpdate (add) :: one char ; one update pos before", function(assert) {
  this.lc.addChange(10, "A"); // Base changes
  var deltas = [new ObjectAddChange(0, "a")];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createAddModif("A", 11)];
  assert.ok(changes.length == 1, "There should only be one element");
  assert.deepEqual(changes, expected, "Should be updated");
});

QUnit.test("testUpdate (add) :: one char ; one update pos after", function(assert) {
  this.lc.addChange(10, "A"); // Base changes
  var deltas = [new ObjectAddChange(20, "a")];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createAddModif("A", 10)];
  assert.ok(changes.length == 1, "There should only be one element");
  assert.deepEqual(changes, expected, "Should not be updated");
});

QUnit.test("testUpdate (add) :: one char ; one update pos same", function(assert) {
  this.lc.addChange(10, "A"); // Base changes
  var deltas = [new ObjectAddChange(10, "a")];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createAddModif("A", 11)];
  assert.ok(changes.length == 1, "There should only be one element");
  assert.deepEqual(changes, expected, "Should be updated");
});

QUnit.test("testUpdate (add) :: contiguous char ; one update pos before", function(assert) {
  this.lc.addChange(10, "A");
  this.lc.addChange(11, "B");
  this.lc.addChange(12, "C"); // Base changes
  var deltas = [new ObjectAddChange(0, "a")];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createAddModif("ABC", 11)];
  assert.ok(changes.length == 1, "There should only be one element");
  assert.deepEqual(changes, expected, "Should be updated at 11");
});

QUnit.test("testUpdate (add) :: contiguous char ; one update pos after", function(assert) {
  this.lc.addChange(10, "A");
  this.lc.addChange(11, "B");
  this.lc.addChange(12, "C"); // Base changes
  var deltas = [new ObjectAddChange(20, "a")];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createAddModif("ABC", 10)];
  assert.ok(changes.length == 1, "There should only be one element");
  assert.deepEqual(changes, expected, "Should not be updated");
});

QUnit.test("testUpdate (add) :: contiguous char ; one update pos same", function(assert) {
  this.lc.addChange(10, "A");
  this.lc.addChange(11, "B");
  this.lc.addChange(12, "C"); // Base changes
  var deltas = [new ObjectAddChange(10, "a")];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createAddModif("ABC", 11)];
  assert.ok(changes.length == 1, "There should only be one element");
  assert.deepEqual(changes, expected, "Should be updated");
});

QUnit.test("testUpdate (add) :: spaced char ; one update pos before", function(assert) {
  this.lc.addChange(5, "1");
  this.lc.addChange(10, "2"); // Base changes
  var deltas = [new ObjectAddChange(0, "a")];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createAddModif("1", 6),
                  createAddModif("2", 11)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should be updated");
});

QUnit.test("testUpdate (add) :: spaced char ; one update pos after", function(assert) {
  this.lc.addChange(5, "1");
  this.lc.addChange(10, "2"); // Base changes
  var deltas = [new ObjectAddChange(20, "a")];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createAddModif("1", 5),
                  createAddModif("2", 10)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should not be updated");
});

QUnit.test("testUpdate (add) :: spaced char ; one update pos same", function(assert) {
  this.lc.addChange(5, "1");
  this.lc.addChange(10, "2"); // Base changes
  var deltas = [new ObjectAddChange(10, "a")];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createAddModif("1", 5),
                  createAddModif("2", 11)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Only last one should be updated");
});

QUnit.test("testUpdate (add) :: none contiguous char ; one update pos before", function(assert) {
  this.lc.addChange(10, "2");
  this.lc.addChange(5, "1"); // Base changes
  var deltas = [new ObjectAddChange(0, "a")];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createAddModif("2", 11),
                  createAddModif("1", 6)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should be updated");
});

QUnit.test("testUpdate (add) :: none contiguous char ; one update pos after", function(assert) {
  this.lc.addChange(10, "2");
  this.lc.addChange(5, "1"); // Base changes
  var deltas = [new ObjectAddChange(20, "a")];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createAddModif("2", 10),
                  createAddModif("1", 5)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should not be updated");
});

QUnit.test("testUpdate (add) :: none contiguous char ; one update pos same", function(assert) {
  this.lc.addChange(10, "2");
  this.lc.addChange(5, "1"); // Base changes
  var deltas = [new ObjectAddChange(10, "a")];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createAddModif("2", 11),
                  createAddModif("1", 5)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Only last one should be updated");
});

QUnit.test("testUpdate (add) :: none contiguous char ; same position ; one update pos before", function(assert) {
  this.lc.addChange(10, "a");
  this.lc.addChange(10, "A"); // Base changes
  var deltas = [new ObjectAddChange(0, "a")];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createAddModif("a", 11),
                  createAddModif("A", 11)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should be updated");
});

QUnit.test("testUpdate (add) :: none contiguous char ; same position ; one update pos after", function(assert) {
  this.lc.addChange(10, "a");
  this.lc.addChange(10, "A"); // Base changes
  var deltas = [new ObjectAddChange(20, "a")];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createAddModif("a", 10),
                  createAddModif("A", 10)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should not be updated");
});

QUnit.test("testUpdate (add) :: none contiguous char ; same position ; one update pos same", function(assert) {
  this.lc.addChange(10, "a");
  this.lc.addChange(10, "A"); // Base changes
  var deltas = [new ObjectAddChange(10, "a")];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createAddModif("a", 11),
                  createAddModif("A", 11)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should be updated");
});

QUnit.test("testUpdate (add) :: one block ; one update pos before", function(assert) {
  this.lc.addChange(10, "123"); // Base changes
  var deltas = [new ObjectAddChange(0, "abc")];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createAddModif("123", 13)];
  assert.ok(changes.length == 1, "There should only one elements");
  assert.deepEqual(changes, expected, "Should be updated");
});

QUnit.test("testUpdate (add) :: one block ; one update pos after", function(assert) {
  this.lc.addChange(10, "123"); // Base changes
  var deltas = [new ObjectAddChange(20, "abc")];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createAddModif("123", 10)];
  assert.ok(changes.length == 1, "There should only one elements");
  assert.deepEqual(changes, expected, "Should not be updated");
});

QUnit.test("testUpdate (add) :: one block ; one update pos same", function(assert) {
  this.lc.addChange(10, "123"); // Base changes
  var deltas = [new ObjectAddChange(10, "abc")];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createAddModif("123", 13)];
  assert.ok(changes.length == 1, "There should only one elements");
  assert.deepEqual(changes, expected, "Should be updated");
});

QUnit.test("testUpdate (add) :: contiguous block ; one update pos before", function(assert) {
  this.lc.addChange(10, "123");
  this.lc.addChange(13, "456");
  this.lc.addChange(16, "789"); // Base changes
  var deltas = [new ObjectAddChange(0, "abc")];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createAddModif("123456789", 13)];
  assert.ok(changes.length == 1, "There should only one elements");
  assert.deepEqual(changes, expected, "Should be updated");
});

QUnit.test("testUpdate (add) :: contiguous block ; one update pos after", function(assert) {
  this.lc.addChange(10, "123");
  this.lc.addChange(13, "456");
  this.lc.addChange(16, "789"); // Base changes
  var deltas = [new ObjectAddChange(20, "abc")];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createAddModif("123456789", 10)];
  assert.ok(changes.length == 1, "There should only one elements");
  assert.deepEqual(changes, expected, "Should not be updated");
});

QUnit.test("testUpdate (add) :: contiguous block ; one update pos same", function(assert) {
  this.lc.addChange(10, "123");
  this.lc.addChange(13, "456");
  this.lc.addChange(16, "789"); // Base changes
  var deltas = [new ObjectAddChange(10, "abc")];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createAddModif("123456789", 13)];
  assert.ok(changes.length == 1, "There should only one elements");
  assert.deepEqual(changes, expected, "Only last one should be updated");
});

QUnit.test("testUpdate (add) :: spaced block ; one update pos before", function(assert) {
  this.lc.addChange(5, "123");
  this.lc.addChange(13, "456"); // Base changes
  var deltas = [new ObjectAddChange(0, "abc")];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createAddModif("123", 8),
                  createAddModif("456", 16)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should be updated");
});

QUnit.test("testUpdate (add) :: spaced block ; one update pos after", function(assert) {
  this.lc.addChange(5, "123");
  this.lc.addChange(13, "456"); // Base changes
  var deltas = [new ObjectAddChange(20, "abc")];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createAddModif("123", 5),
                  createAddModif("456", 13)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should not be updated");
});

QUnit.test("testUpdate (add) :: spaced block ; one update pos same", function(assert) {
  this.lc.addChange(5, "123");
  this.lc.addChange(13, "456"); // Base changes
  var deltas = [new ObjectAddChange(13, "abc")];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createAddModif("123", 5),
                  createAddModif("456", 16)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Only last one should be updated");
});

QUnit.test("testUpdate (add) :: none contiguous block ; one update pos before", function(assert) {
  this.lc.addChange(13, "456");
  this.lc.addChange(5, "123"); // Base changes
  var deltas = [new ObjectAddChange(0, "abc")];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createAddModif("456", 16),
                  createAddModif("123", 8)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should be updated");
});

QUnit.test("testUpdate (add) :: none contiguous block ; one update pos after", function(assert) {
  this.lc.addChange(13, "456");
  this.lc.addChange(5, "123"); // Base changes
  var deltas = [new ObjectAddChange(20, "abc")];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createAddModif("456", 13),
                  createAddModif("123", 5)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should not be updated");
});

QUnit.test("testUpdate (add) :: none contiguous block ; one update pos same", function(assert) {
  this.lc.addChange(13, "456");
  this.lc.addChange(5, "123"); // Base changes
  var deltas = [new ObjectAddChange(13, "abc")];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createAddModif("456", 16),
                  createAddModif("123", 5)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Only last one should be updated");
});

QUnit.test("testUpdate (add) :: none contiguous block ; same position ; one update pos before", function(assert) {
  this.lc.addChange(10, "abc");
  this.lc.addChange(10, "ABC"); // Base changes
  var deltas = [new ObjectAddChange(0, "abc")];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createAddModif("abc", 13), 
                  createAddModif("ABC", 13)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should be updated");
});

QUnit.test("testUpdate (add) :: none contiguous block ; same position ; one update pos after", function(assert) {
  this.lc.addChange(10, "abc");
  this.lc.addChange(10, "ABC"); // Base changes
  var deltas = [new ObjectAddChange(20, "abc")];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createAddModif("abc", 10), 
                  createAddModif("ABC", 10)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should not be updated");
});

QUnit.test("testUpdate (add) :: none contiguous block ; same position ; one update pos same", function(assert) {
  this.lc.addChange(10, "abc");
  this.lc.addChange(10, "ABC"); // Base changes
  var deltas = [new ObjectAddChange(10, "abc")];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createAddModif("abc", 13), 
                  createAddModif("ABC", 13)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should be updated");
});

QUnit.test("testUpdate (add) :: none contiguous block ; overlapping ; one update pos before", function(assert) {
  this.lc.addChange(10, "abc");
  this.lc.addChange(11, "A"); // Base changes
  var deltas = [new ObjectAddChange(0, "abc")];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createAddModif("abc", 13), 
                  createAddModif("A", 14)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should be updated");
});

QUnit.test("testUpdate (add) :: none contiguous block ; overlapping ; one update pos after", function(assert) {
  this.lc.addChange(10, "abc");
  this.lc.addChange(11, "A"); // Base changes
  var deltas = [new ObjectAddChange(20, "abc")];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createAddModif("abc", 10), 
                  createAddModif("A", 11)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should not be updated");
});

QUnit.test("testUpdate (add) :: none contiguous block ; overlapping ; one update pos same", function(assert) {
  this.lc.addChange(10, "abc");
  this.lc.addChange(11, "A"); // Base changes
  var deltas = [new ObjectAddChange(11, "abc")];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createAddModif("abc", 10), 
                  createAddModif("A", 14)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Only last one should be updated");
});



QUnit.test("testUpdate (remove) :: one char ; one update pos before", function(assert) {
  this.lc.removeChange(10, 1); // Base changes
  var deltas = [new ObjectRemoveChange(0, 1)];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createRemoveModif(1, 9)];
  assert.ok(changes.length == 1, "There should only be one element");
  assert.deepEqual(changes, expected, "Should be updated");
});

QUnit.test("testUpdate (remove) :: one char ; one update pos after", function(assert) {
  this.lc.removeChange(10, 1); // Base changes
  var deltas = [new ObjectRemoveChange(20, 1)];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createRemoveModif(1, 10)];
  assert.ok(changes.length == 1, "There should only be one element");
  assert.deepEqual(changes, expected, "Should not be updated");
});

QUnit.test("testUpdate (remove) :: one char ; one update pos same", function(assert) {
  this.lc.removeChange(10, 1); // Base changes
  var deltas = [new ObjectRemoveChange(10, 1)];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createRemoveModif(1, 9)];
  assert.ok(changes.length == 1, "There should only be one element");
  assert.deepEqual(changes, expected, "Should be updated");
});

QUnit.test("testUpdate (remove) :: contiguous char ; one update pos before", function(assert) {
  this.lc.removeChange(10, 1);
  this.lc.removeChange(11, 1);
  this.lc.removeChange(12, 1); // Base changes
  var deltas = [new ObjectRemoveChange(0, 1)];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createRemoveModif(3, 9)];
  assert.ok(changes.length == 1, "There should only be one element");
  assert.deepEqual(changes, expected, "Should be updated at 11");
});

QUnit.test("testUpdate (remove) :: contiguous char ; one update pos after", function(assert) {
  this.lc.removeChange(10, 1);
  this.lc.removeChange(11, 1);
  this.lc.removeChange(12, 1); // Base changes
  var deltas = [new ObjectRemoveChange(20, 1)];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createRemoveModif(3, 10)];
  assert.ok(changes.length == 1, "There should only be one element");
  assert.deepEqual(changes, expected, "Should not be updated");
});

QUnit.test("testUpdate (remove) :: contiguous char ; one update pos same", function(assert) {
  this.lc.removeChange(10, 1);
  this.lc.removeChange(11, 1);
  this.lc.removeChange(12, 1); // Base changes
  var deltas = [new ObjectRemoveChange(10, 1)];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createRemoveModif(3, 9)];
  assert.ok(changes.length == 1, "There should only be one element");
  assert.deepEqual(changes, expected, "Should be updated");
});

QUnit.test("testUpdate (remove) :: spaced char ; one update pos before", function(assert) {
  this.lc.removeChange(5, 1);
  this.lc.removeChange(10, 1); // Base changes
  var deltas = [new ObjectRemoveChange(0, 1)];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createRemoveModif(1, 4),
                  createRemoveModif(1, 9)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should be updated");
});

QUnit.test("testUpdate (remove) :: spaced char ; one update pos after", function(assert) {
  this.lc.removeChange(5, 1);
  this.lc.removeChange(10, 1); // Base changes
  var deltas = [new ObjectRemoveChange(20, 1)];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createRemoveModif(1, 5),
                  createRemoveModif(1, 10)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should not be updated");
});

QUnit.test("testUpdate (remove) :: spaced char ; one update pos same", function(assert) {
  this.lc.removeChange(5, 1);
  this.lc.removeChange(10, 1); // Base changes
  var deltas = [new ObjectRemoveChange(10, 1)];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createRemoveModif(1, 5),
                  createRemoveModif(1, 9)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Only last one should be updated");
});

QUnit.test("testUpdate (remove) :: none contiguous char ; one update pos before", function(assert) {
  this.lc.removeChange(10, 1);
  this.lc.removeChange(5, 1); // Base changes
  var deltas = [new ObjectRemoveChange(0, 1)];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createRemoveModif(1, 9),
                  createRemoveModif(1, 4)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should be updated");
});

QUnit.test("testUpdate (remove) :: none contiguous char ; one update pos after", function(assert) {
  this.lc.removeChange(10, 1);
  this.lc.removeChange(5, 1); // Base changes
  var deltas = [new ObjectRemoveChange(20, 1)];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createRemoveModif(1, 10),
                  createRemoveModif(1, 5)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should not be updated");
});

QUnit.test("testUpdate (remove) :: none contiguous char ; one update pos same", function(assert) {
  this.lc.removeChange(10, 1);
  this.lc.removeChange(5, 1); // Base changes
  var deltas = [new ObjectRemoveChange(10, 1)];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createRemoveModif(1, 9),
                  createRemoveModif(1, 5)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Only last one should be updated");
});

QUnit.test("testUpdate (remove) :: none contiguous char ; same position ; one update pos before", function(assert) {
  this.lc.removeChange(10, 1);
  this.lc.removeChange(10, 1); // Base changes
  var deltas = [new ObjectRemoveChange(0, 1)];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createRemoveModif(1, 9),
                  createRemoveModif(1, 9)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should be updated");
});

QUnit.test("testUpdate (remove) :: none contiguous char ; same position ; one update pos after", function(assert) {
  this.lc.removeChange(10, 1);
  this.lc.removeChange(10, 1); // Base changes
  var deltas = [new ObjectRemoveChange(20, 1)];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createRemoveModif(1, 10),
                  createRemoveModif(1, 10)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should not be updated");
});

QUnit.test("testUpdate (remove) :: none contiguous char ; same position ; one update pos same", function(assert) {
  this.lc.removeChange(10, 1);
  this.lc.removeChange(10, 1); // Base changes
  var deltas = [new ObjectRemoveChange(10, 1)];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createRemoveModif(1, 9),
                  createRemoveModif(1, 9)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should be updated");
});

QUnit.test("testUpdate (remove) :: one block ; one update pos before", function(assert) {
  this.lc.removeChange(10, 3); // Base changes
  var deltas = [new ObjectRemoveChange(0, 3)];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createRemoveModif(3, 7)];
  assert.ok(changes.length == 1, "There should only one elements");
  assert.deepEqual(changes, expected, "Should be updated");
});

QUnit.test("testUpdate (remove) :: one block ; one update pos after", function(assert) {
  this.lc.removeChange(10, 3); // Base changes
  var deltas = [new ObjectRemoveChange(20, 3)];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createRemoveModif(3, 10)];
  assert.ok(changes.length == 1, "There should only one elements");
  assert.deepEqual(changes, expected, "Should not be updated");
});

QUnit.test("testUpdate (remove) :: one block ; one update pos same", function(assert) {
  this.lc.removeChange(10, 3); // Base changes
  var deltas = [new ObjectRemoveChange(10, 3)];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createRemoveModif(3, 7)];
  assert.ok(changes.length == 1, "There should only one elements");
  assert.deepEqual(changes, expected, "Should be updated");
});

QUnit.test("testUpdate (remove) :: contiguous block ; one update pos before", function(assert) {
  this.lc.removeChange(10, 3);
  this.lc.removeChange(13, 3);
  this.lc.removeChange(16, 3); // Base changes
  var deltas = [new ObjectRemoveChange(0, 3)];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createRemoveModif(9, 7)];
  assert.ok(changes.length == 1, "There should only one elements");
  assert.deepEqual(changes, expected, "Should be updated");
});

QUnit.test("testUpdate (remove) :: contiguous block ; one update pos after", function(assert) {
  this.lc.removeChange(10, 3);
  this.lc.removeChange(13, 3);
  this.lc.removeChange(16, 3); // Base changes
  var deltas = [new ObjectRemoveChange(20, 3)];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createRemoveModif(9, 10)];
  assert.ok(changes.length == 1, "There should only one elements");
  assert.deepEqual(changes, expected, "Should not be updated");
});

QUnit.test("testUpdate (remove) :: contiguous block ; one update pos same", function(assert) {
  this.lc.removeChange(10, 3);
  this.lc.removeChange(13, 3);
  this.lc.removeChange(16, 3); // Base changes
  var deltas = [new ObjectRemoveChange(10, 3)];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createRemoveModif(9, 7)];
  assert.ok(changes.length == 1, "There should only one elements");
  assert.deepEqual(changes, expected, "Only last one should be updated");
});

QUnit.test("testUpdate (remove) :: spaced block ; one update pos before", function(assert) {
  this.lc.removeChange(5, 3);
  this.lc.removeChange(13, 3); // Base changes
  var deltas = [new ObjectRemoveChange(0, 3)];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createRemoveModif(3, 2),
                  createRemoveModif(3, 10)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should be updated");
});

QUnit.test("testUpdate (remove) :: spaced block ; one update pos after", function(assert) {
  this.lc.removeChange(5, 3);
  this.lc.removeChange(13, 3); // Base changes
  var deltas = [new ObjectRemoveChange(20, 3)];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createRemoveModif(3, 5),
                  createRemoveModif(3, 13)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should not be updated");
});

QUnit.test("testUpdate (remove) :: spaced block ; one update pos same", function(assert) {
  this.lc.removeChange(5, 3);
  this.lc.removeChange(13, 3); // Base changes
  var deltas = [new ObjectRemoveChange(13, 3)];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createRemoveModif(3, 5),
                  createRemoveModif(3, 10)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Only last one should be updated");
});

QUnit.test("testUpdate (remove) :: none contiguous block ; one update pos before", function(assert) {
  this.lc.removeChange(13, 3);
  this.lc.removeChange(5, 3); // Base changes
  var deltas = [new ObjectRemoveChange(0, 3)];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createRemoveModif(3, 10),
                  createRemoveModif(3, 2)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should be updated");
});

QUnit.test("testUpdate (remove) :: none contiguous block ; one update pos after", function(assert) {
  this.lc.removeChange(13, 3);
  this.lc.removeChange(5, 3); // Base changes
  var deltas = [new ObjectRemoveChange(20, 3)];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createRemoveModif(3, 13),
                  createRemoveModif(3, 5)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should not be updated");
});

QUnit.test("testUpdate (remove) :: none contiguous block ; one update pos same", function(assert) {
  this.lc.removeChange(13, 3);
  this.lc.removeChange(5, 3); // Base changes
  var deltas = [new ObjectRemoveChange(13, 3)];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createRemoveModif(3, 10),
                  createRemoveModif(3, 5)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Only last one should be updated");
});

QUnit.test("testUpdate (remove) :: none contiguous block ; same position ; one update pos before", function(assert) {
  this.lc.removeChange(10, 3);
  this.lc.removeChange(10, 3); // Base changes
  var deltas = [new ObjectRemoveChange(0, 3)];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createRemoveModif(3, 7), 
                  createRemoveModif(3, 7)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should be updated");
});

QUnit.test("testUpdate (remove) :: none contiguous block ; same position ; one update pos after", function(assert) {
  this.lc.removeChange(10, 3);
  this.lc.removeChange(10, 3); // Base changes
  var deltas = [new ObjectRemoveChange(20, 3)];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createRemoveModif(3, 10), 
                  createRemoveModif(3, 10)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should not be updated");
});

QUnit.test("testUpdate (remove) :: none contiguous block ; same position ; one update pos same", function(assert) {
  this.lc.removeChange(10, 3);
  this.lc.removeChange(10, 3); // Base changes
  var deltas = [new ObjectRemoveChange(10, 3)];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createRemoveModif(3, 7), 
                  createRemoveModif(3, 7)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should be updated");
});

QUnit.test("testUpdate (remove) :: none contiguous block ; overlapping ; one update pos before", function(assert) {
  this.lc.removeChange(10, 3);
  this.lc.removeChange(10, 1); // Base changes
  var deltas = [new ObjectRemoveChange(0, 3)];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createRemoveModif(3, 7), 
                  createRemoveModif(1, 7)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should be updated");
});

QUnit.test("testUpdate (remove) :: none contiguous block ; overlapping ; one update pos after", function(assert) {
  this.lc.removeChange(10, 3);
  this.lc.removeChange(10, 1); // Base changes
  var deltas = [new ObjectRemoveChange(20, 3)];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createRemoveModif(3, 10), 
                  createRemoveModif(1, 10)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Should not be updated");
});

QUnit.test("testUpdate (remove) :: none contiguous block ; overlapping ; one update pos same", function(assert) {
  this.lc.removeChange(10, 3);
  this.lc.removeChange(10, 1); // Base changes
  var deltas = [new ObjectRemoveChange(11, 3)];
  this.lc.update(deltas);
  var changes = this.lc.get();
  var expected = [createRemoveModif(3, 10), 
                  createRemoveModif(1, 10)];
  assert.ok(changes.length == 2, "There should be two elements");
  assert.deepEqual(changes, expected, "Only last one should be updated");
});
