// Central point of interractions
DEFAULT_PUSH_INTERVAL = 2000; // ms
communicator = null;

// Requests
HOST = window.location.host;
RETRY_CONNECT_TIMEOUT = 2000; // ms

// Initialize content when ready
$(document).ready(init);
function init() {
  // Classes
  communicator = new Communicator();
  communicator.init('editorLastVersion', 'editorDisplay');

  // Quick hack
  communicator.showFileContent(communicator._openedFile);
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

// #####################################
// #####                           #####
// #####          Classes          #####
// #####                           #####
// #####################################

/* Central class that will interact will all other classes. */
function Communicator(pushInterval) {

  // Setup event handlers
  var obj = this; // For closure

  this._openedFile = undefined;
  this._fileRevision = undefined;

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
    nodeDisplay.keypress(function(evt) {
      evt = evt || window.event;
      var charKey = String.fromCharCode(evt.which);
      var charAt = (getCaretCharacterOffsetWithin(elementDisplay) || 0);
      obj._changeMemory.addChange(charKey, charAt);
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

  this._modifications = [];
  this._currentModificationPos = undefined;
  this._currentChange = "";

  this.get = function() {
    return (this._currentModificationPos == undefined || this._currentChange.length == 0) ?
      this._modifications.dcopy() :
      // Quick hack
      this._modifications.concat([createModif(this._currentChange, this._currentModificationPos)]);
  };

  this.clear = function() {
    this._modifications.clear();
    this._currentModificationPos = undefined;
    this._currentChange = "";
  };

  /* At request was received from the server.
  All saved offset need to be updated */
  this.update = function(deltas) {
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

  /* A change has been made localy. Store it. */
  this.addChange = function(val, at) {
    // Set cursor pos when undefined
    this._currentModificationPos = (this._currentModificationPos || at);

    var theoricalAt = this._currentModificationPos + this._currentChange.length;
    if(theoricalAt != at && this._currentChange.length != 0) {
      // change somewhere else... save 
      this._modifications.push(createModif(this._currentChange, this._currentModificationPos));

      // and start new change
      this._currentModificationPos = at;
      this._currentChange = val;
    }
    else {
      this._currentChange += val;
    }
  };
}


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
    this._socket = new WebSocket(this._hostws);
    this._socket.onopen = this._socket_onopen;
    this._socket.onmessage = this._socket_onmessage;
    this._socket.onclose = this._socket_onclose;
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

    $.ajax({
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
    }); 
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


// ##########################################
// #####                                #####
// #####         Representation         #####
// #####                                #####
// ##########################################

// used for /ide/save
function createModifGroup(changes, file, vers) { return { file: file, vers: vers, changes: changes}; }
function createModif(content, pos, type) { return { content: content, pos: pos, type: type}; }

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

/* MEASUREMENT HELPER */
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
