function MockZone(initText){
  this.value = initText || "";
  this.text = function(arg1) {
    if(arg1 == undefined)
      return this.value;
    this.value = arg1;
  };

  // Alias to get value
  this.val = function(){
    return this.text();
  }
}


QUnit.module( "test_LastVersionZone", {
  beforeEach: function() {
    this.mock = new MockZone("Hello ");
    this.lvz = new LastVersionZone(this.mock);
    this.add1 = createAddModif("Hello", 0);
    this.add2 = createAddModif("123", 4);
    this.add3 = createAddModif("World", 6);
    this.add4 = createAddModif("monde", 6);
  }
});

QUnit.test( "testUpdate_None", function( assert ) {
  this.lvz.update([]);
  stringResult = this.mock.val();
  assert.equal(stringResult, "Hello ", "Passed!" );
});

QUnit.test( "testUpdate_AddAtEnd", function( assert ) {
  //test adding at the end
  this.lvz.update([this.add3]);
  stringResult = this.mock.val();
  assert.equal(stringResult, "Hello World", "Passed!" );
});

QUnit.test( "testUpdate_Overlaps0", function( assert ) {
  //test overlaps
  this.lvz.update([this.add1, this.add2]);
  stringResult = this.mock.val();
  assert.equal(stringResult, "Hell123oHello ", "Passed!" );
});

QUnit.test( "testUpdate_Overlaps1", function( assert ) {
  //write modifications in test 1_0 in reverse order
  this.lvz.update([this.add2, this.add1]);
  stringResult = this.mock.val();
  assert.equal(stringResult, "HelloHell123o ", "Passed!" );
});

QUnit.test( "testUpdate_Overlaps2", function( assert ) {
  //2nd modification overlaps the previous and the next
  this.lvz.update([this.add1, this.add2, this.add3]);
  stringResult = this.mock.val();
  assert.equal(stringResult, "Hell12World3oHello ");
});

QUnit.skip( "testUpdate_NegativePosAdd", function( assert ) {
  var negAdd = createAddModif("Minus", -1);
  this.lvz.update([negAdd]);
  stringResult = this.mock.val();
  assert.equal(stringResult, "Hello ", "Negative position should never happen. If they happen, content should not be changed.");
});

QUnit.skip( "testUpdate_AfterEndOfFileAdd", function( assert ) {
  var tooBigAdd = createAddModif("Too big", 100);
  this.lvz.update([tooBigAdd]);
  stringResult = this.mock.val();
  assert.equal(stringResult, "Hello ", "Position after end of file should never happen. If they happen, content should not be changed.");
});

QUnit.test( "testUpdate_SamePositions0", function( assert ) {
  //write modifications at same position
  this.lvz.update([this.add3, this.add4]);
  stringResult = this.mock.val();
  assert.equal(stringResult, "Hello mondeWorld", "Passed!");
});

QUnit.test( "testUpdate_SamePositions1", function( assert ) {
  //write modifications at same position
  this.lvz.update([this.add4, this.add3]);
  stringResult = this.mock.val();
  assert.equal(stringResult, "Hello Worldmonde", "Passed!");
});

QUnit.test( "testUpdate_BeforeAfter", function( assert ) {
  //The position of the next modification is after the previous's
  //(no overlaps)
  this.lvz.update([this.add1, this.add3]);
  stringResult = this.mock.val();
  assert.equal(stringResult, "HelloHWorldello ", "Passed!");
});

QUnit.test( "testUpdate_AfterBefore", function( assert ) {
  //The position of the next modification is before the previous's
  //(reordering of 4_0)
  this.lvz.update([this.add3, this.add1]);
  stringResult = this.mock.val();
  assert.equal(stringResult, "HelloHello World", "Passed!");
});

