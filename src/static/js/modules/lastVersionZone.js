/* Class to store the last version of the file received by
the server. It is updated by applying every delta. */
function LastVersionZone(node) {
  this._zone = node;

  this.update = function(modifications) {
	  //modifications are applied as received (same order)
    //no indexing are applied to the modifications
    var changedContent = this.get();
    for(var modifIndex = 0; modifIndex < modifications.length; ++modifIndex){
      changedContent = modifications[modifIndex].applyOnText(changedContent);
    }
    
    this.put(changedContent);
  };

  this.put = function(text) {
    this._zone.text(text);
  };

  this.get = function() {
     return this._zone.text();
  };
}
