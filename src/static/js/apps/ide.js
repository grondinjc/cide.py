DEFAULT_PUSH_INTERVAL = 2000; // ms

/* Central class that will interact will all other classes. */
function AppIDE(pushInterval) {

  // Setup event handlers
  var obj = this; // For closure

  this._openedFile = undefined;
  this._fileRevision = undefined;

  this._difftool = null;

  // Quick hack
  // wait to receive projet tree
  // wait for user to select file
  // Suppose user selected main.py
  this._openedFile = "/main.py";

  // Handle null value
  this._pushInterval = pushInterval || DEFAULT_PUSH_INTERVAL;
  this._pushIntervalHandle = null;

  this._changeMemory = null;
  this._zoneLastVersion = null;
  this._zoneDisplay = null;

  this._nodeDisplay = null;

  this._sentChanges = null;
  this._bundleID = 0;
  

  this.init = function(lastVersionZoneId, displayZoneId) {
    // Required to get cursor position on contentEditable pre tag
    var elementDisplay = document.getElementById(displayZoneId);

    // Create classes
    this._changeMemory = new LocalChanges();
    this._zoneLastVersion = new LastVersionZone($("#" + lastVersionZoneId));
    this._zoneDisplay = new DisplayZone($("#" + displayZoneId), this._handleInputEvent);
    this._tree = new ProjectTreeView();

    // Handle ways of sending and receiving data from/to server
    this._requestHandler = new RequestHandler('ide', this.receive);
    // TODO block / wait for the WS to be open before allowing ws-based stuff

    // Diff lib to compare two texts
    this._difftool = new diff_match_patch();
    
    // Push changes handler 
    this._sentChanges = [];
    this._pushIntervalHandle = setInterval( 
      function() {
        // try push
        var changes = obj._changeMemory.get();
        if(changes.length == 0) 
          return;

        // Clear changes to avoid resending
        obj._changeMemory.clear();
        var currentBundleID = obj._bundleID;
        ++obj._bundleID;

        // Save and send, delete sent changes on success
        var modifObject = createModifGroup(changes, obj._openedFile, currentBundleID);
        console.log("Current bundle id is ", currentBundleID, modifObject);
        obj._sentChanges.push([currentBundleID, modifObject]); // place at end of array
        obj._requestHandler.put("save", modifObject, function(){
          // Will I delete new input ??
          var clearChange = obj._sentChanges[0];
          console.log("ACK bundle id is ", clearChange[0], clearChange[1]);
          obj._sentChanges.shift(); // pop front
          /*if(clearChange[0] != currentBundleID){
            alert("Fuck up happened");
          }*/
        }, function(){}, true);
      },
      this._pushInterval
    );


    // Initialise Tree root.
    this._tree.initRoot("tree");

    // Load TreeView content
    this._requestHandler.get("tree", {}, function(response){
      response.nodes.forEach(function(elem){
        obj._tree.addNode(elem.node, elem.isDir);
      });
    });
  };

  this._handleInputEvent = function(evt) {
    // Get old value, compare and store new
    // $(this) corresponds to nodeDisplay
    var oldText = obj._zoneDisplay.getLastVersion();
    var newText = obj._zoneDisplay.getText();

    if(oldText == newText) return; // paste events are trigged early
    obj._zoneDisplay.saveVersion(newText);

    // https://code.google.com/p/google-diff-match-patch/wiki/API
    // A diff is a pair (type, text) where type is 1 for addition,
    // 0  for 'no-change' and -1 for substraction
    var diff = obj._difftool.diff_main(oldText, newText);
    // Since this function is triggered after one change,
    // which corresponds to a maximum of two diff elements,
    // position needs to be computed over iteration
    // -- Add text : 1 diff add element
    // -- Remove text : 1 diff remove element
    // -- Highlight text and add text : 1 diff add element and 1 diff remove element 
    var at = 0;
    diff.map(function(change){
      switch(change[0]) {
        case -1:
          obj._changeMemory.removeChange(at+change[1].length, change[1].length);
          break;
        case 1:
          obj._changeMemory.addChange(at, change[1]);
          // no break on purpose
        case 0:     
          at += change[1].length;
          break;
      }
    });     
  };

  this.showFileContent = function(filepath) {
    // force send any pending changes on current file (if any)
    // TODO changeFileState class

    // Do request
    this._requestHandler.post("open", createOpen(filepath), function(response){
      // on success
      obj._fileRevision = response.vers;
      obj.notifyForce(createAddModif(response.content, 0));
    });
  };

  // Data received from server
  this.receive = function(opCode, jsonObj){
    // Check if opCode means fileAdd

    // opCode is textEdit
    obj.notifySoft(jsonObj);
  };

  // Does not receive a group of modifications since
  // every zone will be overriden. One delta is enough
  this.notifyForce = function(initialDelta) {
    this._zoneLastVersion.put(initialDelta.content);
    this._changeMemory.clear();
    this._zoneDisplay.forceUpdate([initialDelta.content, initialDelta.content.length]); 
  };

  this.notifySoft = function(modifications) {
    this._changeMemory.update(modifications.changes);
    this._zoneLastVersion.update(modifications.changes);

    var cursor_pos = this._zoneDisplay.getCursorPos();
    this._zoneDisplay.forceUpdate(this._combineText(cursor_pos));
  };

  this._combineText = function(cursor_pos) {
    var base = this._zoneLastVersion.get();
    var modifs = this._changeMemory.get();
    modifs.map(function(mod) {
      base = mod.type == CHANGE_RM_TYPE ?
        base.cut(mod.pos, mod.pos+mod.count):
        base.insert(mod.content, mod.pos);

      // The delete will need to be thinked a bit more
      cursor_pos = mod.pos <= cursor_pos ?
        cursor_pos + (mod.type == CHANGE_RM_TYPE ? 0 : mod.content) :
        cursor_pos;
    });
    return [base, cursor_pos];
  };
};
