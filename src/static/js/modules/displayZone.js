/* Visible section by the user */
function DisplayZone(node){
  this._zone = node;

  this.update = function(text){
    this._zone.text(text);
  };
}
