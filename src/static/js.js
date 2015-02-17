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
  communicator.init('editorLocal', 'editorLastVersion', 'editorDisplay');
  communicator.showFileContent("dummyStringForNow");
}


// TEST_ONLY
function addNewTextAt(){
  var content = $('#addText').val();
  var at = $('#addAt').val();
}

function test_queue() {
  registerServerUpdate("X", 0);
  registerServerUpdate("Y", 11);
  registerServerUpdate("Z", 3);
}


setTimeout(function() {
  communicator.notifySoft("abc", 0);
}, 2000);

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



  this.init = function(localZoneId, lastVersionZoneId, displayZoneId) {
    
    // Get a ref to edit nodes
    var nodeLastVersion = $("#" + lastVersionZoneId);
    var nodeDisplay = $("#" + displayZoneId);

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
      var charAt = nodeDisplay.getCursorPosition();
      obj.changeMemory.update(charKey, charAt);
    });
  };

  this.showFileContent = function(filepath) {
    // Do request
    var content = "Hello\nWorld";
    // The revision from the response
    this.fileRevision = 0;
    this.notifyForce(content, 0);
  };

  this.send = function(modifications) {
    // ajax
  };

  this.receive = function(modifications){
    // websocket
  };

  this.notifyForce = function(newVal, at) {
    this.zoneLastVersion.put(newVal, at);
    this.zoneDisplay.update(newVal);
    this.changeMemory.clear();
  };

  this.notifySoft = function(newVal, at) {
    this.changeMemory.update(newVal, at);

    // Quickhack
    var repr = [createModif(newVal, at)];
    this.zoneLastVersion.update(repr);

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
    var lines = text.split("\n");
    // Repopulate existing line-tags
    var index;
    var max_loop = Math.min(lines.length, this.max_number_of_lines_reached);
    for(index = 0; index < max_loop; ++index){
      var lineNode = this.node.children().eq(index);
      lineNode.text(lines[index]);
      // Required when line was invisible
      lineNode.attr('class', LINE_CLASS_VISIBLE); 
    }
    // Add new line-tags
    for( ; index < lines.length; ++index){
      this.node.append(
        // Create line tag
        $(LINE_REPR_TAG).attr('class', LINE_CLASS_VISIBLE)
                        .append(lines[index]));
      ++this.max_number_of_lines_reached;
    }
    // Hide other lines
    // Don't delete them 
    for( ; index < this.max_number_of_lines_reached; ++index){
      this.node.children().eq(index).attr('class', LINE_CLASS_INVISIBLE);
    }
  };
}

function LastVersionZone(node) {
  this.zone = node;

  this.add = function(newVal, at){
    // Add new text
    var content = this.zone.val();
    this.zone.val(content.slice(0, at) + newVal + content.slice(at));
  };

  this.update = function(modifications) {
    for(var i = 0; i < modifications.length; ++i) {
      this.add(modifications[i].val, modifications[i].at);
    }
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
  this.currentModificationPos = 0;
  this.currentChange = "";

  this.get = function() {
    return this.modifications;
  };

  this.clear = function() {
    this.modifications.clear();
    this.currentModificationPos = 0;
    this.currentChange = "";
  };

  this.update = function(val, at) {
    var theoricalAt = this.currentModificationPos + this.currentChange.length + 1;
    if(theoricalAt != at) {
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

/* ARRAY HELPER */
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
