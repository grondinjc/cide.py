/* Central class that will interact will all other classes. */
function AppIDE(pushInterval) {

  // Setup event handlers
  var obj = this; // For closure

  // This will be used to store the value inside
  // the data attribute at the following key
  this._DATA_TEXT_KEY = "saved-text";

  // Listened events to handle user inputs
  this._TEXT_EVENTS = "input paste";

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
  

  this.init = function(lastVersionZoneId, displayZoneId) {

    // Get a ref to edit nodes
    var nodeLastVersion = $("#" + lastVersionZoneId);
    this._nodeDisplay = $("#" + displayZoneId);

    // Required to get cursor position on contentEditable pre tag
    var elementDisplay = document.getElementById(displayZoneId);

    // Create classes
    this._changeMemory = new LocalChanges();
    this._zoneLastVersion = new LastVersionZone(nodeLastVersion);
    this._zoneDisplay = new DisplayZone(this._nodeDisplay);
    this._tree = new ProjectTreeView();

    // Handle ways of sending and receiving data from/to server
    this._requestHandler = new RequestHandler('ide', this.receive);
    // TODO block / wait for the WS to be open before allowing ws-based stuff

    // Diff lib to compare two texts
    this._difftool = new diff_match_patch();
    
    // Initialize stored text data attribute
    this._nodeDisplay.data(this._DATA_TEXT_KEY, this._nodeDisplay.text() || ""); 
    
    // Push changes handler 
    this._pushIntervalHandle = setInterval( 
      function() {
        // try push
        var changes = obj._changeMemory.get();
        if(changes.length == 0) 
          return;

        // Send and clear on success
        var modifObject = createModifGroup(changes, obj._openedFile, obj._fileRevision);
        obj._requestHandler.put("save", modifObject, function(){
          // Will I delete new input ??
          console.log("Changes sent, clear local changes");
          obj._changeMemory.clear();
        });
      },
      this._pushInterval
    );

    // Local and display sync handler
    this._nodeDisplay.bind(this._TEXT_EVENTS, this._handleInputEvent);

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
    var oldText = obj._nodeDisplay.data(obj._DATA_TEXT_KEY);
    var newText = obj._nodeDisplay.text();
    if(oldText == newText) return; // paste events are trigged early
    obj._nodeDisplay.data(obj._DATA_TEXT_KEY, newText); 

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
      // Save content in data attributes
      obj._nodeDisplay.data(obj._DATA_TEXT_KEY, response.content);
    });
  };

  this._updateDisplayNoEvent = function(text) {
    // Hack to avoid considering server text as the user input
    this._nodeDisplay.unbind(this._TEXT_EVENTS);
    this._zoneDisplay.update(text);
    this._nodeDisplay.bind(this._TEXT_EVENTS, this._handleInputEvent);
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
    this._updateDisplayNoEvent(initialDelta.content); 
  };

  this.notifySoft = function(modifications) {
    this._changeMemory.update(modifications.changes);
    this._zoneLastVersion.update(modifications.changes);
    this._updateDisplayNoEvent(this._combineText());
  };

  this._combineText = function() {
    var base = this._zoneLastVersion.get();
    var modifs = this._changeMemory.get();
    modifs.map(function(mod) {
      base = mod.type == CHANGE_RM_TYPE ?
        base.cut(mod.pos, mod.pos+mod.count):
        base.insert(mod.content, mod.pos);
    });
    return base;
  };
};
