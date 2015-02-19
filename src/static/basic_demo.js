
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
  // TODO Use template to put IP:PORT here? Or JS
  //var host = "ws://localhost:8080/ide/ws";
  var wsUrl = "ws://10.44.88.142:8080/ide/ws";
  var retryTimeout;
  var socket = new WebSocket(wsUrl);

  socket.onopen = function(){
    clearTimeout(retryTimeout);
    alert('WSOPEN');
    openIDE();
  }

  socket.onmessage = function(msg){
    var json_result = $.parseJSON(msg.data);
    console.log('CONTENT RECEIVED' + json_result.file);
    var contents = "";
    json_result.changes.forEach(function(change) {
      contents += change.content;
    });
    $('#content').html(contents);
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
  var reqjson = {
    "file": "test",
    "changes": [{"content": $('#editor').val() + '<br>'}]
  };
  $.ajax({
    type: "PUT",
    url: "save",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify(reqjson),
    cache: false,
    success: function(data) {
      console.log('SEND SUCCESS')
      $('#editor').val('');
    }
  });
}

function openIDE() {
  var reqjson = {
    "file": "test"
  };
  $.ajax({
    type: "GET",
    url: "dump",
    data: 'filename=test',
    success: function(json_result) {
      console.log('REFRESH SUCCESS' + json_result.file);
      $('#content').html(json_result.content);
    }
  });
}

