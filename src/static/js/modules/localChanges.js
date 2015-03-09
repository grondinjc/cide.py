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
  this._startAddedPos = undefined;
  this._addedData = undefined;
}
LocalChangeAddState.prototype.add = function(at, val){
  // Set when cursor was not set before
  this._startAddedPos = this._startAddedPos || at;
  
  var theoricalAt = this._startAddedPos + this._addedData.length;
  if(theoricalAt != at && this._addedData.length != 0) {
    // change somewhere else... save 
    this._mem.saveChange(createAddModif(this._addedData, this._startAddedPos));

    // and start new change
    this._startAddedPos = at;
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
  this._startAddedPos = undefined;
  this._addedData = "";
};
LocalChangeAddState.prototype.isChangeInProgress = function() {
  return this._addedData.length != 0;
};
LocalChangeAddState.prototype.getPendingChange = function() {
  return createAddModif(this._addedData, this._startAddedPos);
};
LocalChangeAddState.prototype.update = function(delta) {
  if(this._startAddedPos != undefined && delta.pos <= this._startAddedPos) {
    this._startAddedPos += delta.type == CHANGE_RM_TYPE ? 
      -delta.count : 
      delta.content.length;
  }
};


function LocalChangeRemoveState(mem){
  this._mem = mem;
  this._startRemovePos = undefined;
  this._removedCount = undefined;
}
LocalChangeRemoveState.prototype.add = function(at, val){
  this._mem.handleSwitchToAddState(at, val); 
};
LocalChangeRemoveState.prototype.remove = function(at, count) { 
  // Set when cursor was not set before
  // Needed because we don`t know here the size of the full text
  this._startRemovePos = this._startRemovePos || at;

  var theoricalAt = this._startRemovePos - this._removedCount;
  if(theoricalAt != at && this._removedCount != 0) {
    // change somewhere else... save 
    this._mem.saveChange(createRemoveModif(this._removedCount, this._startRemovePos));

    // and start new change
    this._startRemovePos = at;
    this._removedCount = count;
  }
  else {
    this._removedCount += count;
  }
};
LocalChangeRemoveState.prototype.init = function() {
  this._startRemovePos = undefined;
  this._removedCount = 0;
};
LocalChangeRemoveState.prototype.isChangeInProgress = function() {
  return this._removedCount != 0;
};
LocalChangeRemoveState.prototype.getPendingChange = function() {
  return createRemoveModif(this._removedCount, this._startRemovePos);
};
LocalChangeRemoveState.prototype.update = function(delta) {
  if(this._startRemovePos != undefined && delta.pos <= this._startRemovePos) {
    this._startRemovePos += delta.type == CHANGE_RM_TYPE ? 
      -delta.count : 
      delta.content.length;
  }
};
