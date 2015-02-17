// CONSTANTS
LINE_REPR = 'li';
LINE_REPR_TAG = '<' + LINE_REPR +'>';
LINE_CLASS_VISIBLE = 'line';
LINE_CLASS_INVISIBLE = 'emptyLine';

// Central point of interractions
DEFAULT_PUSH_INTERVAL = 2000; // ms
communicator = null;

// Initialize content when ready
$(document).ready(init);
function init() {
  // Classes
  communicator = new Communicator();
  communicator.init('editorLastVersion', 'editorDisplay');
  communicator.showFileContent("dummyStringForNow");
}


// TEST_ONLY
function addNewTextAt(){
  var content = $('#addText').val();
  var at = $('#addAt').val();
}

function test_notify() {
  var modA = createModif("111", 0);
  var modB = createModif("444", 6);
  communicator.notifySoft(createModifGroup([modA, modB]));
}

// #####################################
// #####                           #####
// #####          Classes          #####
// #####                           #####
// #####################################

function Communicator(pushInterval) {

  // Handle null value
  this.pushInterval = pushInterval || DEFAULT_PUSH_INTERVAL;
  this.pushIntervalHandle = null;

  this.zoneLocal = null;
  this.zoneLastVersion = null;
  this.zoneDisplay = null;
  this.fileRevision = 0;



  this.init = function(lastVersionZoneId, displayZoneId) {
    
    // Get a ref to edit nodes
    var nodeLastVersion = $("#" + lastVersionZoneId);
    var nodeDisplay = $("#" + displayZoneId);

    // Required to get cursor position on contentEditable pre tag
    var elementDisplay = document.getElementById(displayZoneId);

    // Create classes
    this.changeMemory = new LocalChanges();
    this.zoneLastVersion = new LastVersionZone(nodeLastVersion);
    this.zoneDisplay = new DisplayZone(nodeDisplay);

    // Setup event handlers
    var obj = this; // For closure

    // Push changes handler 
    this.pushIntervalHandle = setInterval( 
      function() {
        // try push
        var changes = obj.changeMemory.get();
        if(changes.length == 0) return;
        // Send
        obj.send(changes);
      }, 
    this.pushInterval);

    // Local and display sync handler
    nodeDisplay.keypress(function(evt) {
      evt = evt || window.event;
      var charKey = String.fromCharCode(evt.which);
      var charAt = (getCaretCharacterOffsetWithin(elementDisplay) || 0);
      obj.changeMemory.addChange(charKey, charAt);
    });
  };

  this.showFileContent = function(filepath) {
    // Do request
    var content = "Hello\nWorld";
    // The revision from the response
    this.fileRevision = 0;
    this.notifyForce(createModif(content, 0));
  };

  this.send = function(modifications) {
    // ajax
  };

  this.receive = function(){
    // websocket
  };

  // change to modification group ?
  this.notifyForce = function(initialDelta) {
    this.zoneLastVersion.put(initialDelta.val, initialDelta.at);
    this.zoneDisplay.update(initialDelta.val);
    this.changeMemory.clear();
  };

  this.notifySoft = function(modifications) {
    this.changeMemory.update(modifications.deltas);
    this.zoneLastVersion.update(modifications.deltas);
    this.zoneDisplay.update(this.combineText());
  };

  this.combineText = function() {
    var base = this.zoneLastVersion.get();
    var modifs = this.changeMemory.get();
    for(var i = 0; i < modifs.length; ++i){
      base = base.insert(modifs[i].val, modifs[i].at);
    }
    return base;
  };
};

function DisplayZone(node){
  this.node = node;
  // Represent the numper of lines added
  this.max_number_of_lines_reached = 0;

  this.update = function(text){
    this.node.text(text);
  };
}

function LastVersionZone(node) {
  this.zone = node;

  this.update = function(modifications) {
    var content = this.zone.val();
    for(var i = 0; i < modifications.length; ++i) {
      content = (content.slice(0, modifications[i].at) + modifications[i].val + content.slice(modifications[i].at));
    }
    
    this.zone.val(content);
  };

  this.put = function(text) {
    this.zone.val(text);
  };

  this.get = function() {
     return this.zone.val();
  };
}

function LocalChanges() {

  this.modifications = [];
  this.currentModificationPos = undefined;
  this.currentChange = "";

  this.get = function() {
    return (this.currentModificationPos == undefined || this.currentChange.length == 0) ?
      this.modifications.dcopy() :
      // Quick hack
      this.modifications.concat([createModif(this.currentChange, this.currentModificationPos)]);
  };

  this.clear = function() {
    this.modifications.clear();
    this.currentModificationPos = undefined;
    this.currentChange = "";
  };

  /* At request was received from the server.
  All saved offset need to be updated */
  this.update = function(deltas) {
    deltas.map(function(delta) {
      // For stored change
      this.modifications.map(function(mod) {
        mod.at += (delta.at < mod.at) ? delta.val.length : 0;
      });
      // For current change, when defined
      if(this.currentModificationPos != undefined) {
        this.currentModificationPos += (delta.at < this.currentModificationPos) ? delta.val.length : 0;
      }
    }, this);
  };

  /* A change has been made localy. Store it. */
  this.addChange = function(val, at) {
    // Set cursor pos when undefined
    this.currentModificationPos = (this.currentModificationPos || at);

    var theoricalAt = this.currentModificationPos + this.currentChange.length;
    if(theoricalAt != at && this.currentChange.length != 0) {
      // change somewhere else... save 
      this.modifications.push(createModif(this.currentChange, this.currentModificationPos));

      // and start new change
      this.currentModificationPos = at;
      this.currentChange = val;
    }
    else {
      this.currentChange += val;
    }
  };
}


// ###################################
// #####                         #####
// #####         Helpers         #####
// #####                         #####
// ###################################

/* JSON Representation helpers */
function createModifGroup(deltas) { return {revision: 0, deltas: deltas}; }
function createModif(val, at) { return {val: val, at: at}; }

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


/*
$(document).ready(function() {
  if(!("WebSocket" in window)){
    alert("BOOM NO WEBSOCKET");
  }else{
    connect();
  }
});

$('#editor').keypress(function(event) {
  if (event.which == 13) {  //Enter Key
    event.preventDefault();
    sendChanges();
  }
});

function connect() {
  var host = "ws://localhost:8080/ws";
  //var host = "ws://10.44.88.142:8080/ws";
  var retryTimeout;
  var socket = new WebSocket(host);

  socket.onopen = function(){
    clearTimeout(retryTimeout);
    alert('WSOPEN');
    refreshChat();
  }

  socket.onmessage = function(msg){
    $('#content').html(msg.data);
  }

  socket.onclose = function(){
    clearTimeout(retryTimeout);
    alert('WSCLOSE');
    retryTimeout = setTimeout(function(){
      connect();
    }, 3000);
  }      
}

function sendChanges() {
  $.ajax({
    type: "POST",
    url: "save",
    data: "content=" + $('#editor').val() + '<br>',
    cache: false,
    dataType: "text",
    success: function(data) {
      console.log('SEND SUCCESS')
      $('#editor').val('');
      //alert('AJAX SUCCESS');
      //$('#content').text(data);
    }
  });
}

function refreshChat() {
  $.ajax({
    type: "GET",
    url: "refresh",
    dataType: "text",
    success: function(data) {
      console.log('REFRESH SUCCESS')
      $('#content').html(data);
      //alert('AJAX SUCCESS');
      //$('#content').text(data);
    }
  });
}*/
