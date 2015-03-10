/* Class to store all changes done by the user */
function LocalChanges() {

  // Reuse the same states to accelerate
  this._removeState = new LocalChangeRemoveState(this);
  this._addState = new LocalChangeAddState(this);

  // First state
  this._state = this._addState;
  this._state.init();

  this._modifications = [];
}
LocalChanges.prototype.get = function() {
  if(this._state.isChangeInProgress())
    this.saveChange(this._state.getPendingChange())
    this._state.init();
  return this._modifications.dcopy();
};
LocalChanges.prototype.update = function(deltas) {
  /* At request was received from the server.
  It can be additions, or removals or both.
  All saved offset need to be updated */
  deltas.map(function(delta) {
    // For stored change
    this._modifications.map(function(mod) {
      if(delta.pos < mod.pos) {
        mod.pos += delta.type == CHANGE_RM_TYPE ?
          -delta.count :
          delta.content.length;
      }
    });
    // For current change, when defined
    this._state.update(delta);
  }, this);
};
LocalChanges.prototype.clear = function() {
  this._modifications.clear();
  this._state.init();
};
LocalChanges.prototype.addChange = function(at, val) { 
  if(!val) return;
  this._state.add(at, val); 
};
LocalChanges.prototype.removeChange = function(at, count) { 
  if(!count) return;
  this._state.remove(at, count); 
};
LocalChanges.prototype.handleSwitchToAddState = function(val, at){
  // Get any pending change to avoid data miss
  if(this._state.isChangeInProgress())
    this.saveChange(this._state.getPendingChange());
  
  this._state = this._addState;
  this._state.init();
  this._state.add(val, at);
};
LocalChanges.prototype.handleSwitchToRemoveState = function(val, count){
  // Get any pending change to avoid data miss
  if(this._state.isChangeInProgress())
    this.saveChange(this._state.getPendingChange());

  this._state = this._removeState;
  this._state.init();
  this._state.remove(val, count);
};
LocalChanges.prototype.saveChange = function(change) {
  this._modifications.push(change);
};


function LocalChangeAddState(mem){
  this._mem = mem;
  this._addedData = undefined;

  this._posUnknownState = new PositionUnknownState(this);
  this._posKnownState = new PositionKnownState(this, 0);
  this._posState = this._posUnknownState;
}
LocalChangeAddState.prototype.add = function(at, val){
  // Set when cursor was not set before
  this._posState.trySet(at);
  
  var theoricalAt = this._posState.get() + this._addedData.length;
  if(theoricalAt != at && this._addedData.length != 0) {
    // change somewhere else... save 
    this._mem.saveChange(createAddModif(this._addedData, this._posState.get()));

    // and start new change
    this._posState.set(at);
    this._addedData = val;
  }
  else {
    this._addedData += val;
  }
};
LocalChangeAddState.prototype.remove = function(at, count) { 
  this._mem.handleSwitchToRemoveState(at, count); 
};
LocalChangeAddState.prototype.init = function() {
  this._posState = this._posUnknownState;
  this._addedData = "";
};
LocalChangeAddState.prototype.isChangeInProgress = function() {
  return this._addedData.length != 0;
};
LocalChangeAddState.prototype.getPendingChange = function() {
  return createAddModif(this._addedData, this._posState.get());
};
LocalChangeAddState.prototype.update = function(delta) {
  this._posState.update(delta);
};
LocalChangeAddState.prototype.switchToKnownPosition = function(pos) {
  this._posState = this._posKnownState;
  this._posState.set(pos);
};


function LocalChangeRemoveState(mem){
  this._mem = mem;
  this._removedCount = undefined;

  this._posUnknownState = new PositionUnknownState(this);
  this._posKnownState = new PositionKnownState(this, 0);
  this._posState = this._posUnknownState;
}
LocalChangeRemoveState.prototype.add = function(at, val){
  this._mem.handleSwitchToAddState(at, val); 
};
LocalChangeRemoveState.prototype.remove = function(at, count) { 
  // Set when cursor was not set before
  // Needed because we don`t know here the size of the full text
  this._posState.trySet(at);

  var theoricalAt = this._posState.get() - this._removedCount;
  if(theoricalAt != at && this._removedCount != 0) {
    // change somewhere else... save 
    this._mem.saveChange(createRemoveModif(this._removedCount, this._posState.get()));

    // and start new change
    this._posState.set(at);
    this._removedCount = count;
  }
  else {
    this._removedCount += count;
  }
};
LocalChangeRemoveState.prototype.init = function() {
  this._posState = this._posUnknownState;
  this._removedCount = 0;
};
LocalChangeRemoveState.prototype.isChangeInProgress = function() {
  return this._removedCount != 0;
};
LocalChangeRemoveState.prototype.getPendingChange = function() {
  return createRemoveModif(this._removedCount, this._posState.get());
};
LocalChangeRemoveState.prototype.update = function(delta) {
  this._posState.update(delta);
};
LocalChangeRemoveState.prototype.switchToKnownPosition = function(pos) {
  this._posState = this._posKnownState;
  this._posState.set(pos);
};

function PositionUnknownState(changeState){
  this._changeState = changeState;
}

// Commented out since it should never be called
// It will be an error when trying to call this function
// PositionUnknownState.prototype.get ...

PositionUnknownState.prototype.set = function(pos){
  // Switch state
  this._changeState.switchToKnownPosition(pos);
};
// Tries to assign a value when none are already set
PositionUnknownState.prototype.trySet = function(pos){
  // Switch state
  this._changeState.switchToKnownPosition(pos);
};
PositionUnknownState.prototype.update = function(delta){
  // Nothing to do since the current position is unknown
};


function PositionKnownState(changeState, pos){
  this._changeState = changeState;
  this._pos = pos;
}
PositionKnownState.prototype.get = function(){
  return this._pos;
};
PositionKnownState.prototype.set = function(pos){
  this._pos = pos;
};
// Tries to assign a value when none are already set
PositionKnownState.prototype.trySet = function(pos){
  // Nothing to do since a position is known
};
PositionKnownState.prototype.update = function(delta){
  if(delta.pos <= this._pos) {
    this._pos += delta.type == CHANGE_RM_TYPE ? 
      -delta.count : 
      delta.content.length;
  }
};