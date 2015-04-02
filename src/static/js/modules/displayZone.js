/* Visible section by the user */
function DisplayZone(node, inputHandler){
  // This will be used to store the value inside
  // the data attribute at the following key
  this._DATA_TEXT_KEY = "saved-text";
  // Listened events to handle user inputs
  this._TEXT_EVENTS = "input";

  this._zone = node;
  this._inputHandler = inputHandler;
  // Initialize stored text data attribute
  var initText = this.getText() || "";
  this._zone.data(this._DATA_TEXT_KEY, initText);
  // Local and display sync handler
  this._zone.bind(this._TEXT_EVENTS, this._inputHandler);
}

DisplayZone.prototype.update = function(text){
  this._zone.text(text);
};
DisplayZone.prototype.forceUpdate = function(text_pos){
  // text is at 0 and cursor pos is at 1
  // Hack to avoid considering server text as the user input
  this._zone.unbind(this._TEXT_EVENTS);
  this.update(text_pos[0]);
  this._zone.bind(this._TEXT_EVENTS, this._inputHandler);
  // Save content in data attributes
  this.saveVersion(text_pos[0]);
  // Set cursor 
  this._zone.focus();
  this.setCursorPos(text_pos[1]);
};
DisplayZone.prototype.saveVersion = function(text){
  this._zone.data(this._DATA_TEXT_KEY, text);
};
DisplayZone.prototype.getLastVersion = function(){
  return this._zone.data(this._DATA_TEXT_KEY);
};
DisplayZone.prototype.getText = function(){
  return this._zone.text();
};
DisplayZone.prototype.getCursorPos = function(){
  return !this._zone.text() ? 0 : this._zone.caret();
};
DisplayZone.prototype.setCursorPos = function(pos){
  if(this._zone.text()){
    pos = Math.min(pos, this.getText().length); // Checkup upper bound
    pos = Math.max(pos, 0); // Checkup lower bound
    this._zone.caret(pos);
  }
};
