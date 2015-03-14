// 
CHANGE_RM_TYPE = -1;
CHANGE_ADD_TYPE = 1; 

// used for /ide/save
function createModifGroup(changes, file, vers) { return { file: file, vers: vers, changes: changes}; }

function createAddModif(content, pos) { return { content: content, pos: pos, type: CHANGE_ADD_TYPE}; }
function createRemoveModif(count, pos) { return { count: count, pos: pos, type: CHANGE_RM_TYPE}; }

// used for /ide/open
function createOpen(filename) { return { file: filename}; }
// used for /ide/dump
function createDump(filename) { return { filename: filename}; }

// used for /chat/send
function createChatMessage(msg) { return { message: msg}; }


function ObjectAddChange(pos, content){
  this._pos = pos;
  this._content = content;
}
ObjectAddChange.prototype.size = function(){
  return this._content.length;
};
ObjectAddChange.prototype.applyOnText = function(text){
  return text.insert(this._content, this._pos);
};
ObjectAddChange.prototype.applyOnPos = function(pos){
  return pos + (this._pos <= pos ? this.size() : 0);
};
ObjectAddChange.prototype.updatePos = function(modObject){
  this._pos = modObject.applyOnPos(this._pos);
};
ObjectAddChange.prototype.serialize = function(){
  return createAddModif(this._content, this._pos);
};

function ObjectRemoveChange(pos, count){
  this._pos = pos;
  this._count = count;
}
ObjectRemoveChange.prototype.size = function(){
  return this._count;
};
ObjectRemoveChange.prototype.applyOnText = function(text){
  return text.cutFrom(this._pos, this._count);
};
ObjectRemoveChange.prototype.applyOnPos = function(pos){
  return pos - (this._pos <= pos ? this.size() : 0);
};
ObjectRemoveChange.prototype.updatePos = function(modObject){
  this._pos = modObject.applyOnPos(this._pos);
};
ObjectRemoveChange.prototype.serialize = function(){
  return createRemoveModif(this._count, this._pos);
};


function ObjectChangeFactory(changeObjJSON){
  return changeObjJSON.type == CHANGE_ADD_TYPE ?
    new ObjectAddChange(changeObjJSON.pos, changeObjJSON.content):
    new ObjectRemoveChange(changeObjJSON.pos, changeObjJSON.count);
}

function serializeObjectChangeList(changesList){
  var serialized = [];
  for(var i = 0; i < changesList.length; ++i){
    serialized.push(changesList[i].serialize());
  }
  return serialized;
}
