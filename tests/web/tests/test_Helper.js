// Tests for Helpers functions
QUnit.module( "test_Helper");

/* Encoder and decoder for html entities */
function htmlEncode(value) { return $('<div/>').text(value).html(); }
function htmlDecode(value) { return $('<div/>').html(value).text(); }

QUnit.test("testHtmlEncode :: plaintext", function(assert) {
  var result = htmlEncode("plain");
  assert.ok(result == "plain", "Text should be the same");
});

QUnit.test("testHtmlEncode :: html tags", function(assert) {
  var result = htmlEncode("<h1>Hello</h1>");
  assert.ok(result == "&lt;h1&gt;Hello&lt;/h1&gt;", "Text should be encoded");
});

QUnit.test("testHtmlEncode :: break lines", function(assert) {
  var result = htmlEncode("plain \n text");
  assert.ok(result == "plain \n text", "Text should be the same");
});

QUnit.test("testHtmlEncode :: spaces", function(assert) {
  var result = htmlEncode("plain text");
  assert.ok(result == "plain text", "Text should be the same");
});

QUnit.test("testHtmlEncode :: already encoded", function(assert) {
  // The '&' should be encoded again. This should not happen
  // This text is only there to expose the bahavior
  var result = htmlEncode("&lt;h1&gt;Hello&lt;/h1&gt;");
  assert.ok(result == "&amp;lt;h1&amp;gt;Hello&amp;lt;/h1&amp;gt;", "Text should be encoded again");
});



QUnit.test("testHtmlDecode :: plaintext", function(assert) {
  var result = htmlDecode("plain");
  assert.ok(result == "plain", "Text should be the same");
});

QUnit.test("testHtmlDecode :: html tags", function(assert) {
  var result = htmlDecode("&lt;h1&gt;Hello&lt;/h1&gt;");
  assert.ok(result == "<h1>Hello</h1>", "Text should be decoded");
});

QUnit.test("testHtmlDecode :: break lines", function(assert) {
  var result = htmlDecode("plain \n text");
  assert.ok(result == "plain \n text", "Text should be encoded");
});

QUnit.test("testHtmlDecode :: spaces", function(assert) {
  var result = htmlDecode("plain text");
  assert.ok(result == "plain text", "Text should be encoded");
});

QUnit.test("testHtmlDecode :: already decoded", function(assert) {
  // The '&' should be encoded again. This should not happen
  // This text is only there to expose the bahavior
  var result = htmlDecode("<h1>Hello</h1>");
  assert.ok(result == "Hello", "Text should be stripped of tags");
});



QUnit.test("testStringInsert :: empty base string ; empty input ; valid pos", function(assert) {
  var base = "".insert("", 0);
  assert.ok(base == "", "Text should be the same");
});

QUnit.test("testStringInsert :: empty base string ; empty input ; exceeding pos", function(assert) {
  var base = "".insert("", 1);
  assert.ok(base == "", "Pos should be set to max");
});

QUnit.test("testStringInsert :: empty base string ; empty input ; negative pos", function(assert) {
  var base = "".insert("", -1);
  assert.ok(base == "", "Pos should be set to min");
});

QUnit.test("testStringInsert :: empty base string ; not empty input ; valid pos", function(assert) {
  var base = "".insert("abc", 0);
  assert.ok(base == "abc", "Text should be the one added");
});

QUnit.test("testStringInsert :: empty base string ; not empty input ; exceeding pos", function(assert) {
  var base = "".insert("abc", 5);
  assert.ok(base == "abc", "Pos should be set to max");
});

QUnit.test("testStringInsert :: empty base string ; not empty input ; negative pos", function(assert) {
  var base = "".insert("abc", -1);
  assert.ok(base == "abc", "Pos should be set to min");
});

QUnit.test("testStringInsert :: not empty base string ; not empty input ; valid pos", function(assert) {
  var base = "123".insert("abc", 0);
  assert.ok(base == "abc123", "Text should be the same");
});

QUnit.test("testStringInsert :: not empty base string ; not empty input ; exceeding pos", function(assert) {
  var base = "123".insert("abc", 5);
  assert.ok(base == "123abc", "Pos should be set to max");
});

QUnit.test("testStringInsert :: not empty base string ; not empty input ; negative pos", function(assert) {
  var base = "123".insert("abc", -1);
  assert.ok(base == "abc123", "Pos should be set to min");
});



QUnit.test("testStringStartsWith :: empty search on empty string", function(assert) {
  assert.ok("".startsWith(""), "Should be detected");
});

QUnit.test("testStringStartsWith :: search on empty string", function(assert) {
  assert.ok(!"".startsWith("abc"), "Should not be detected");
});

QUnit.test("testStringStartsWith :: search on same string", function(assert) {
  assert.ok("abc".startsWith("abc"), "Should be detected");
});

QUnit.test("testStringStartsWith :: pattern in middle", function(assert) {
  assert.ok(!"line1\nline2".startsWith("\n"), "Should not be detected");
});

QUnit.test("testStringStartsWith :: pattern at first", function(assert) {
  assert.ok("\nline1line2".startsWith("\n"), "Should be detected");
});

QUnit.test("testStringStartsWith :: pattern at end", function(assert) {
  assert.ok(!"line1line2\n".startsWith("\n"), "Should not be detected");
});



QUnit.test("testStringEndsWith :: empty search on empty string", function(assert) {
  assert.ok("".endsWith(""), "Should be detected");
});

QUnit.test("testStringEndsWith :: search on empty string", function(assert) {
  assert.ok(!"".endsWith("abc"), "Should not be detected");
});

QUnit.test("testStringEndsWith :: search on same string", function(assert) {
  assert.ok("abc".endsWith("abc"), "Should be detected");
});

QUnit.test("testStringEndsWith :: pattern in middle", function(assert) {
  assert.ok(!"line1\nline2".endsWith("\n"), "Should not be detected");
});

QUnit.test("testStringEndsWith :: pattern at first", function(assert) {
  assert.ok(!"\nline1line2".endsWith("\n"), "Should not be detected");
});

QUnit.test("testStringEndsWith :: pattern at end", function(assert) {
  assert.ok("line1line2\n".endsWith("\n"), "Should be detected");
});



QUnit.test("testStringCutFrom :: empty base ; valid position", function(assert) {
  var base = "";
  var result = base.cutFrom(0, 0);
  assert.ok(result == "", "Should be the same");
});

QUnit.test("testStringCutFrom :: empty base ; negative position", function(assert) {
  var base = "";
  var result = base.cutFrom(0, -1);
  assert.ok(result == "", "Should be the same");
});

QUnit.test("testStringCutFrom :: empty base ; exceeding position", function(assert) {
  var base = "";
  var result = base.cutFrom(0, 1);
  assert.ok(result == "", "Should be the same");
});

QUnit.test("testStringCutFrom :: base string ; valid position", function(assert) {
  var base = "abcdefg";
  var result = base.cutFrom(0, 3);
  assert.ok(result == "defg", "Should be cut");
});

QUnit.test("testStringCutFrom :: base string ; negative position", function(assert) {
  var base = "abcdefg";
  var result = base.cutFrom(0, -1);
  assert.ok(result == "abcdefg", "Should be the same string");
});

QUnit.test("testStringCutFrom :: base string ; exceeding position", function(assert) {
  var base = "abcdefg";
  var result = base.cutFrom(0, 10);
  assert.ok(result == "", "Should be the empty string");
});
