function MockZoneDisplay(initPos){
  this.valuePos = initPos != undefined ? initPos : 0;
  this.valueText = initPos != undefined ? initPos : 0;
}
MockZoneDisplay.prototype.focus = function(){};
MockZoneDisplay.prototype.data = function(){};
MockZoneDisplay.prototype.bind = function(){};
MockZoneDisplay.prototype.unbind = function(){};
MockZoneDisplay.prototype.text = function(text){
  if(text == undefined)
    return this.valueText;
  this.valueText = text;
};
MockZoneDisplay.prototype.caret = function(pos){
  if(pos == undefined)
    return this.valuePos;
  this.valuePos = pos;
};
// For testing
MockZoneDisplay.prototype.getPos = function(){ return this.valuePos; };
MockZoneDisplay.prototype.setPos = function(pos){ this.valuePos = pos; };
MockZoneDisplay.prototype.getText = function(){ return this.valueText; };
MockZoneDisplay.prototype.setText = function(text){ this.valueText = text; };

function MockInputHandler(){}


// Tests for LocalChanges module
QUnit.module( "test_Display", {
  beforeEach: function() {
    this.mzd = new MockZoneDisplay();
    this.dz = new DisplayZone(this.mzd, MockInputHandler);
  },
  afterEach: function() {
    // Nothing to be done
  }
});



QUnit.test("testForceUpdate :: empty string", function(assert) {
  var text_pos = ["", 0];
  this.dz.forceUpdate(text_pos);
  assert.ok(this.mzd.getPos() == 0, "Pos should be as sent");
  assert.ok(this.mzd.getText() == "", "Text should be as sent");
});

QUnit.test("testForceUpdate :: empty string ; exceeding pos", function(assert) {
  var text_pos = ["", 1];
  this.dz.forceUpdate(text_pos);
  assert.ok(this.mzd.getPos() == 0, "Pos should be set to maximum");
  assert.ok(this.mzd.getText() == "", "Text should be as sent");
});

QUnit.test("testForceUpdate :: empty string ; negative pos", function(assert) {
  var text_pos = ["", -1];
  this.dz.forceUpdate(text_pos);
  assert.ok(this.mzd.getPos() == 0, "Pos should be set to minimum");
  assert.ok(this.mzd.getText() == "", "Text should be as sent");
});

QUnit.test("testForceUpdate :: not empty string", function(assert) {
  var text_pos = ["abc", 0];
  this.dz.forceUpdate(text_pos);
  assert.ok(this.mzd.getPos() == 0, "Pos should be as sent");
  assert.ok(this.mzd.getText() == "abc", "Text should be as sent");
});

QUnit.test("testForceUpdate :: not empty string ; exceeding pos", function(assert) {
  var text_pos = ["abc", 3];
  this.dz.forceUpdate(text_pos);
  assert.ok(this.mzd.getPos() == 3, "Pos should be set to maximum");
  assert.ok(this.mzd.getText() == "abc", "Text should be as sent");
});

QUnit.test("testForceUpdate :: not empty string ; negative pos", function(assert) {
  var text_pos = ["abc", -1];
  this.dz.forceUpdate(text_pos);
  assert.ok(this.mzd.getPos() == 0, "Pos should be set to minimum");
  assert.ok(this.mzd.getText() == "abc", "Text should be as sent");
});