// CONSTANTS
LINE_REPR = 'li';
LINE_REPR_TAG = '<' + LINE_REPR +'>';
LINE_CLASS_VISIBLE = 'line';
LINE_CLASS_INVISIBLE = 'emptyLine';

// Create see_table
// It index represent a line and each value is the size of the line
var seek_table = [];
seek_table[0] = 0;

// Represent the numper of lines added
var max_number_of_lines_reached = 0;

// Initialize content when ready
$(document).ready(init);


function init() {
  // Execute request to get first file
  var fileContent = "Hello\nWorld";
  updateTextArea(fileContent, 0);
  updateDisplay();
}


function updateSeekTable(){
  seek_table = $('#editorInput').val().split("\n").map(function(line){
    return line.length;
  });
}


function updateTextArea(newVal, at){
  var editor_zone = $('#editorInput');
  var current_pos = editor_zone.getCursorPosition();
  
  // Add new text
  var content = editor_zone.val();
  editor_zone.val(content.slice(0, at) + newVal + content.slice(at));
  // Restore cursor position and
  // adjust cursor position if added text was before
  current_pos += (at < current_pos) ? newVal.length : 0;
  editor_zone.setCursorPosition(current_pos);
}


function updateDisplay(){
  var lines = htmlEncode($('#editorInput').val()).split("\n");
  var linesContainer = $("#editorDisplay");
  
  // Repopulate existing line-tags
  var index;
  var max_loop = Math.min(lines.length, max_number_of_lines_reached);
  for(index = 0; index < max_loop; ++index){
    var lineNode = linesContainer.children().eq(index);
    lineNode.text(lines[index]);
    lineNode.attr('class', LINE_CLASS_VISIBLE); // Required when line was invisible
  }

  // Add new line-tags
  for( ; index < lines.length; ++index){
    linesContainer.append(
      // Create line tag
      $(LINE_REPR_TAG).attr('class', LINE_CLASS_VISIBLE)
                      .append(lines[index]));
    ++max_number_of_lines_reached;
  }

  // Hide other lines
  // Don't delete them 
  for( ; index < max_number_of_lines_reached; ++index){
    linesContainer.children().eq(index).attr('class', LINE_CLASS_INVISIBLE);
  }
}



// TEST_ONLY
function addNewTextAt(){
  var content = $('#addText').val();
  var at = $('#addAt').val();
  updateTextArea(content, at);
}



function test() {
  updateDisplay();
}


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

/* HTML STATEMENT HELPER FUNCTIONS */
function htmlEncode(value) { return $('<div/>').text(value).html(); }
function htmlDecode(value) { return $('<div/>').html(value).text(); }




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
