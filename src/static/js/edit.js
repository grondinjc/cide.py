// Central point of interractions
DEFAULT_PUSH_INTERVAL = 2000; // ms
communicator = null;
tree = null;

// Requests
HOST = window.location.host;
RETRY_CONNECT_TIMEOUT = 2000; // ms

// Initialize content when ready
$(document).ready(init);
function init() {
  tree = new ProjectTreeView();
  tree.initRoot("tree", "ProjectName");

  // Classes
  communicator = new Communicator();
  communicator.init('editorLastVersion', 'editorDisplay');

  // Quick hack
  //communicator.showFileContent(communicator._openedFile);
}


// TEST_ONLY
function addNewTextAt(){
  var content = $('#addText').val();
  var at = $('#addAt').val();
}

function test_notify() {
  var modA = createModif("111", 0);
  var modB = createModif("444", 6);
  communicator.notifySoft(createModifGroup([modA, modB], "fileName", 0));
}

function test_ajax() {
  var modObject = createModif("abc", 0);
  var modifObject = createModifGroup([modObject], "fileName", 0);
  communicator._requestHandler.post("save", modifObject, function(){
    console.log("Success reveived comm");
    communicator._changeMemory.clear();
  });
}

function test_AddNode() {
  var nodeName = $('#textNode').val();
  tree.addNode(nodeName);
}

function test_RemoveNode() {
  var nodeName = $('#textNode').val();
  tree.removeNode(nodeName);
}

function test_ManyAddNode() {
  tree.addNode('file-toto');
  tree.addNode('/file-toto');
  tree.addNode('dir-toto/');
  tree.addNode('/dir-toto/');

  tree.addNode('/d/');
  tree.addNode('d/sub-toto-file');
  tree.addNode('/d/sub-toto-file');
  tree.addNode('d/sub-toto-dir/');
  tree.addNode('/d/sub-toto-dir/');
}

// #####################################
// #####                           #####
// #####          Classes          #####
// #####                           #####
// #####################################

/* Central class that will interact will all other classes. */
function Communicator(pushInterval) {

  // Setup event handlers
  var obj = this; // For closure

  // This will be used to store the value inside
  // the data attribute at the following key
  this._DATA_TEXT_KEY = "saved-text";

  this._openedFile = undefined;
  this._fileRevision = undefined;

  this._difftool = null;

  // Quick hack
  // wait to receive projet tree
  // wait for user to select file
  // Suppose user selected main.py
  this._openedFile = "main.py";

  // Handle null value
  this._pushInterval = pushInterval || DEFAULT_PUSH_INTERVAL;
  this._pushIntervalHandle = null;

  this._changeMemory = null;
  this._zoneLastVersion = null;
  this._zoneDisplay = null;
  

  this.init = function(lastVersionZoneId, displayZoneId) {

    // Get a ref to edit nodes
    var nodeLastVersion = $("#" + lastVersionZoneId);
    var nodeDisplay = $("#" + displayZoneId);

    // Required to get cursor position on contentEditable pre tag
    var elementDisplay = document.getElementById(displayZoneId);

    // Create classes
    this._changeMemory = new LocalChanges();
    this._zoneLastVersion = new LastVersionZone(nodeLastVersion);
    this._zoneDisplay = new DisplayZone(nodeDisplay);

    // Handle ways of sending and receiving data from/to server
    this._requestHandler = new RequestHandler(HOST, this.receive);
    this._requestHandler.init();

    // Diff lib to compare two texts
    this._difftool = new diff_match_patch();
    
    // Initialize stored text data attribute
    nodeDisplay.data(this._DATA_TEXT_KEY, nodeDisplay.text() || ""); 
    
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
          console.log("Changes sent, clear local changes");
          obj._changeMemory.clear();
        });
      },
    this._pushInterval);

    // Local and display sync handler
    nodeDisplay.bind("input paste", function(evt) {
      
      // Get old value, compare and store new
      // S(this) corresponds to nodeDisplay
      var oldText = nodeDisplay.data(obj._DATA_TEXT_KEY);
      var newText = nodeDisplay.text();
      if(oldText == newText) return; // paste events are trigged early
      nodeDisplay.data(obj._DATA_TEXT_KEY, newText); 

      // https://code.google.com/p/google-diff-match-patch/wiki/API
      // A diff is a pair (type, text) where type is 1 for addition,
      // 0  for 'no-change' and -1 for substraction
      var diff = obj._difftool.diff_main(oldText, newText);
      // Since this function is triggered after one change,
      // only one change will be detected. No need to compute
      // cursor position over iteration
      diff.map(function(change){
        if(change[0] != 0){
          var at = getCaretCharacterOffsetWithin(elementDisplay);
          change[0] == 1 ? 
            // Cursor position represent updated position, we need to adjust it
            obj._changeMemory.addChange(at-change[1].length, change[1]) : 
            obj._changeMemory.removeChange(at, change[1].length);
        }
      });     
    });
  };

  this.showFileContent = function(filepath) {
    // force send any pending changes on current file (if any)
    // TODO changeFileState class

    // Do request
    this._requestHandler.post("open", createOpen(filepath), function(response){
      // on success
      obj._fileRevision = response.vers;
      obj.notifyForce(createModif(response.content, 0));
    });
  };

  // Data received from server
  this.receive = function(opCode, jsonObj){
    // Check if opCode means fileAdd

    // opCode is textEdit
    obj.notifySoft(jsonObj);
  };

  // change to modification group ?
  this.notifyForce = function(initialDelta) {
    this._zoneLastVersion.put(initialDelta.content);
    this._zoneDisplay.update(initialDelta.content);
    this._changeMemory.clear();
  };

  this.notifySoft = function(modifications) {
    this._changeMemory.update(modifications.changes);
    this._zoneLastVersion.update(modifications.changes);
    this._zoneDisplay.update(this.combineText());
  };

  this.combineText = function() {
    var base = this._zoneLastVersion.get();
    var modifs = this._changeMemory.get();
    for(var i = 0; i < modifs.length; ++i){
      base = base.insert(modifs[i].content, modifs[i].pos);
    }
    return base;
  };
};

/* Visible section by the user */
function DisplayZone(node){
  this._zone = node;

  this.update = function(text){
    this._zone.text(text);
  };
}

/* Class to store the last version of the file received by
the server. It is updated by applying every delta. */
function LastVersionZone(node) {
  this._zone = node;

  this.update = function(modifications) {
    var changedContent = this._zone.val();
    for(var i = 0; i < modifications.length; ++i) {
      // Eventually, check type 
      changedContent = (changedContent.slice(0, modifications[i].pos) + modifications[i].content + changedContent.slice(modifications[i].pos));
    }
    
    this._zone.val(changedContent);
  };

  this.put = function(text) {
    this._zone.val(text);
  };

  this.get = function() {
     return this._zone.val();
  };
}


/* Class to store all changes done by the user */
function LocalChanges() {

  var obj; // for closure

  this._removeState = new LocalChangeRemoveState(this);
  this._addState = new LocalChangeAddState(this);

  // First state
  this._state = this._addState;
  this._state.init();

  this._modifications = [];
}
LocalChanges.prototype.get = function() {
  return (this._currentModificationPos == undefined || this._currentChange.length == 0) ?
    this._modifications.dcopy() :
    // Quick hack
    this._modifications.concat([createModif(this._currentChange, this._currentModificationPos)]);
};
LocalChanges.prototype.update = function(deltas) {
  /* At request was received from the server.
  It can be additions, or removals or both.
  All saved offset need to be updated */
  deltas.map(function(delta) {
    // For stored change
    this._modifications.map(function(mod) {
      mod.pos += (delta.pos < mod.pos) ? delta.content.length : 0;
    });
    // For current change, when defined
    if(this._currentModificationPos != undefined) {
      this._currentModificationPos += (delta.pos < this._currentModificationPos) ? delta.content.length : 0;
    }
  }, this);
};
LocalChanges.prototype.clear = function() {
  this._modifications.clear();
  this._currentModificationPos = undefined;
  this._currentChangeData = undefined;
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
  this._startAddedPos = 0;
  this._addedData = "";
};
LocalChangeAddState.prototype.isChangeInProgress = function() {
  return this._addedData.length != 0;
};
LocalChangeAddState.prototype.getPendingChange = function() {
  return createAddModif(this._addedData, this._startAddedPos);
};





function LocalChangeRemoveState(mem){
  this._mem = mem;
  this._startRemovePos = undefined;
  this._removedCount = undefined;
}
LocalChangeRemoveState.prototype.add = function(at, val){
  this._mem.handleSwitchToAddState(at, count); 
};
LocalChangeRemoveState.prototype.remove = function(at, count) { 
};
LocalChangeRemoveState.prototype.init = function() {
  this._startRemovePos = 0;
  this._removedCount = 0;
};
LocalChangeRemoveState.prototype.isChangeInProgress = function() {
  return this._removedCount != 0;
};
LocalChangeRemoveState.prototype.getPendingChange = function() {
  return createRemoveModif(this._removedCount, this._startRemovePos);
};

/* Class to encapsulate how communications are done.
This will allow to change only internal representation
easily when needed */
function RequestHandler(host, recvCallback) {

  // For closure
  var obj = this;

  this._hostws = "ws://"+ host +"/ide/ws";
  this._retryTimeout = null;
  this._socket = null;

  this._recv = recvCallback;
  this._emptyCallback = function(){};

  this.init = function() {
    this._connect();
  };

  this._connect = function() {
    /*this._socket = new WebSocket(this._hostws);
    this._socket.onopen = this._socket_onopen;
    this._socket.onmessage = this._socket_onmessage;
    this._socket.onclose = this._socket_onclose;*/
  };

  this._socket_onopen = function(){
    clearTimeout(obj._retryTimeout);
  };

  this._socket_onmessage = function(msg){
    var json_obj = $.parseJSON(msg.data);
    if('opCode' in json_obj) {
      // json_obj is in two parts ... opCode and data
      obj._recv(json_obj.opCode, json_obj.data);
    }
    else {
      // Send default opcode
      console.log("No opCode in ws request for content", json_obj);
      obj._recv(0, json_obj);
    }
  };

  this._socket_onclose = function(){
    clearTimeout(obj._retryTimeout);
    obj._retryTimeout = setTimeout(obj._connect, RETRY_CONNECT_TIMEOUT);
  };

  this._send = function(type, controller, requestData, successCallback, errorCallback) {
    successCallback = successCallback || this._emptyCallback;
    errorCallback = errorCallback || this._emptyCallback;

    /*$.ajax({
      type: type,
      url: controller,
      data: requestData,
      cache: false,
      contentType: 'application/json',
      dataType: "json",
      success: function(response, text) { 
        successCallback(response, text);
      },
      error: function(request, status, error) {  
        errorCallback(request, status, error);
      }
    });*/ 
  };

  // Send a POST ; data is in payload
  this.post = function(controller, data, successCallback, errorCallback) {
    this._send("POST", controller, JSON.stringify(data), successCallback, errorCallback);
  };

  // Send a PUT ; data is in payload
  this.put = function(controller, data, successCallback, errorCallback) {
    this._send("PUT", controller, JSON.stringify(data), successCallback, errorCallback);
  };

  // Send a GET ; data is in query string
  this.get = function(controller, data, successCallback, errorCallback) {
    this._send("GET", controller, $.param(data), successCallback, errorCallback);
  };
}


/* Class to encapsulate tree view representation 
of the project */
function ProjectTreeView() {
  this._ID_PREFIX = "tree-node";

  this.initRoot = function(treeID, rootNodeName){
    $("#"+treeID).append(
      $('<ul>').append(
        $('<li>').attr("class", "parent_li").append(
          $('<span>').attr("class", "tree-node-dir").on("click", this._dirClick).append(
            $('<i>').attr("class", "icon-folder-open")).append(
            rootNodeName)).append(
          $('<ul>').attr("id", this._ID_PREFIX+'/'))));
  };

  this.addNode = function(nodepath) {
    nodepath = this._setAbsolute(nodepath).trim();
    if(this._isDir(nodepath)){
      // Create directory
      var parts = nodepath.split("/");
      var parentDir = parts.slice(0, -2).join("/") + "/";
      // The size-1 is necessary empty, size-2 contains the name
      this._addDir(parts[parts.length-2]+"/", parentDir);
    }
    else {
      // Create file
      var parts = nodepath.split("/");
      var parentDir = parts.slice(0, -1).join("/") + "/";
      this._addFile(parts[parts.length-1], parentDir);
    }
  };

  this.removeNode = function(nodepath){
    nodepath = this._setAbsolute(nodepath).trim();
    if(nodepath == "/"){
      console.log("TRYING TO REMOVE ROOT FOLDER .... BAD ...");
      alert("TRYING TO REMOVE ROOT FOLDER .... BAD ...");
      return;
    }

    if(this._isDir(nodepath)) {
      // Remove element and children
      this._getDirNode(this._ID_PREFIX+nodepath).parent().remove();
    }
    else { // File
      this._getFileNode(this._ID_PREFIX+nodepath).remove();
    }
  };

  this._isDir = function(path) {
    return path.endsWith("/");
  };

  this._getFileNode = function(id) {
    // Workaround to allow slashes in selector
    return $("li[id='" + id + "']");
  };

  this._getDirNode = function(id) {
    // Workaround to allow slashes in selector
    return $("ul[id='" + id + "']");
  };

  this._setAbsolute = function(path){
    return path.startsWith("/") ? path : "/" + path;
  };

  this._addDir = function(dirname, parentDir){
    var parentId = this._ID_PREFIX + parentDir;
    var nodeId = parentId + dirname;

    if(this._getDirNode(nodeId).length != 0){
      alert("Node already exists : " + (parentDir + dirname));
      return;
    }

    this._getDirNode(parentId).append(
      $('<li>').attr("class", "parent_li")
               .append(
        $('<span>').attr("class", "tree-node-dir")
                   .on("click", this._dirClick)
                   .append($('<i>').attr("class", "icon-folder-open"))
                   .append(dirname))
               .append(
        $('<ul>').attr("id", nodeId)));
  };

  this._addFile = function(filename, parentDir) {
    var parentId = this._ID_PREFIX + parentDir;
    var nodeId = parentId + filename;

    if(this._getFileNode(nodeId).length != 0){
      alert("Node already exists : " + (parentDir + filename));
      return;
    }

    this._getDirNode(parentId).append(
      $('<li>').attr("class", "parent_li")
               .attr("id", nodeId)
               .append(
        $('<span>').attr("class", "tree-node-file")
                   .attr("title", parentDir+filename)
                   .on("click", this._fileClick)
                   .append($('<i>').attr("class", "icon-file"))
               .append(filename)));
  };

  this._fileClick = function(e) {
    // 'this' is now the treeview node element
    alert("TODO: Switch to file " + this.title);
    //communicator.showFileContent(this.title);
    e.stopPropagation();
  };

  this._dirClick = function(e) {
    // 'this' is now the treeview node element
    var children = $(this).parent('li.parent_li').find(' > ul > li');
    if (children.is(":visible")) {
        children.hide('fast');
        $(this).attr('title', 'Expand this branch').find(' > i').addClass('icon-plus-sign').removeClass('icon-minus-sign');
    } else {
        children.show('fast');
        $(this).attr('title', 'Collapse this branch').find(' > i').addClass('icon-minus-sign').removeClass('icon-plus-sign');
    }
    e.stopPropagation();
  };
}


// ##########################################
// #####                                #####
// #####         Representation         #####
// #####                                #####
// ##########################################

// used for /ide/save
function createModifGroup(changes, file, vers) { return { file: file, vers: vers, changes: changes}; }

function createAddModif(content, pos) { return { content: content, pos: pos, type: 0}; }
function createRemoveModif(count, pos) { return { count: count, pos: pos, type: 1}; }

// used for /ide/open
function createOpen(filename) { return { file: filename}; }

// ###################################
// #####                         #####
// #####         Helpers         #####
// #####                         #####
// ###################################

/* SELECTION HELPER FUNCTIONS */
$.fn.selectRange = function(start, end) {
  // Check 'end' variable presence
  end = (end == undefined) ? start : end; 
  // Apply cursor to all given elements
  return this.each(function() {
    if (this.setSelectionRange) {
      this.focus();
      this.setSelectionRange(start, end);
    } else if (this.createTextRange) {
      var range = this.createTextRange();
      range.collapse(true);
      range.moveEnd('character', end);
      range.moveStart('character', start);
      range.select();
    }
  });
};

/* CURSOR HELPER FUNCTIONS */
$.fn.setCursorPosition = function(pos) { this.selectRange(pos, pos); };
$.fn.getCursorPosition = function() { return this.prop("selectionStart"); };

// getCaretCharacterOffsetWithin(document.getElementById("editorDisplay"));
function getCaretCharacterOffsetWithin(element) {
  var caretOffset = 0;
  var doc = element.ownerDocument || element.document;
  var win = doc.defaultView || doc.parentWindow;
  var sel;
  if (typeof win.getSelection != "undefined") {
    sel = win.getSelection();
    if (sel.rangeCount > 0) {
      var range = win.getSelection().getRangeAt(0);
      var preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      caretOffset = preCaretRange.toString().length;
    }
  } else if ( (sel = doc.selection) && sel.type != "Control") {
    var textRange = sel.createRange();
    var preCaretTextRange = doc.body.createTextRange();
    preCaretTextRange.moveToElementText(element);
    preCaretTextRange.setEndPoint("EndToEnd", textRange);
    caretOffset = preCaretTextRange.text.length;
  }
  return caretOffset;
}

/* ARRAY HELPER */
Array.prototype.dcopy = function() {
  return $.extend(true, [], this);
};
Array.prototype.clear = function() {
  while (this.length) {
    this.pop();
  }
};

/* STRING HELPER */
String.prototype.insert = function(str, index) {
  return this.slice(0, index) + str + this.slice(index);
};
String.prototype.startsWith = function (str) {
  return this.indexOf(str) == 0;
};
String.prototype.endsWith = function(str) {
    var d = this.length - str.length;
    var ends = d >= 0 && this.lastIndexOf(str) === d;
    return d >= 0 && this.lastIndexOf(str) === d;
};

/* MEASUREMENT HELPER */
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
