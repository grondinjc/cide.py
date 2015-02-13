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
  var zoneLocal = new LocalZone('editorLocal');
  var zoneLastVersion = new LastVersionZone('editorLastVersion');
  var zoneDisplay = new DisplayZone('editorDisplay');

  communicator = new Communicator(zoneLocal, zoneLastVersion, zoneDisplay);
  communicator.showFileContent("dummyStringForNow");
}


// TEST_ONLY
function addNewTextAt(){
  var content = $('#addText').val();
  var at = $('#addAt').val();
  registerUserUpdate(content, at);
}

function test_queue() {
  registerServerUpdate("X", 0);
  registerServerUpdate("Y", 11);
  registerServerUpdate("Z", 3);
}


setTimeout(function t() {
  communicator.notifySoft("abc", 0);
}, 2000);

// #####################################
// #####                           #####
// #####          Classes          #####
// #####                           #####
// #####################################

// JSON Representation helpers
function createModifGroup(deltas) { return {revision: 0, deltas: deltas}; }
function createModif(val, at) { return {val: val, at: at}; }


function Communicator(zl, zlv, zd, pushInterval) {

  // Handle null value
  pushInterval = pushInterval || DEFAULT_PUSH_INTERVAL;

  this.zoneLocal = zl;
  this.zoneLastVersion = zlv;
  this.zoneDisplay = zd;
  this.fileRevision = 0;

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
    this.zoneLocal.clear();
    this.zoneDisplay.update(newVal);
  };

  this.notifySoft = function(newVal, at) {
    // Quickhack
    var repr = [createModif(newVal, at)];
    this.zoneLastVersion.update(repr);
    this.zoneLocal.update(newVal, at);
    this.zoneDisplay.update(this.combineText());
  };

  this.combineText = function() {
    //this.zoneLocal.get
    //this.zoneLastVersion = zlv;
    return "Combined magic";
  };

  this.pushChanges = function() {
    // try push
    var changes = this.zoneLocal.get();
    if(changes.length == 0) return;
    // Send
    this.send(changes);
  };
  //this.pushIntervalHandle = setInterval(this.pushChanges, pushInterval);


};

function DisplayZone(zoneID){
  this.node = $("#" + zoneID);
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

function LastVersionZone(zoneID) {
  this.zone = $("#" + zoneID);

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

function LocalZone(zoneID) {
  this.zone = $("#" + zoneID);

  this.modifications = [];
  this.currentModificationPos = 0;

  this.get = function() {
    //return this.modifications;
    return createModif(this.zone.val(), this.currentModificationPos);
  };

  this.pos = function() {
    return this.currentModificationPos;
  };

  this.clear = function() {
    this.zone.val("");
    this.modifications.clear();
    this.currentModificationPos = 0;
  };

  this.update = function(val, at) {
    this.currentModificationPos += (at < this.currentModificationPos) ? val.length : 0;
  };
}


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

/* ARRAY HELPER */
Array.prototype.clear = function() {
  while (this.length) {
    this.pop();
  }
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
