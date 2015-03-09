/* Class to store the last version of the file received by
the server. It is updated by applying every delta. */
function LastVersionZone(node) {
  this._zone = node;

  this.update = function(modifications) {
	  //modifications are applied as received (same order)
    //no indexing are applied to the modifications
    var changedContent = this._zone.val();
    modifications.map(function(mod) {
      changedContent = mod.type == CHANGE_RM_TYPE ?
        // Remove
        (changedContent.slice(0, mod.pos - mod.count) + changedContent.slice(mod.pos)) :
        // Add
        (changedContent.slice(0, mod.pos) + mod.content + changedContent.slice(mod.pos));
    });
    
    this._zone.val(changedContent);
  };

  this.put = function(text) {
    this._zone.val(text);
  };

  this.get = function() {
     return this._zone.val();
  };
}
