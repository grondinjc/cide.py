
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
  // TODO Use template to put IP:PORT here?
  //var host = "ws://localhost:8080/ide/ws";
  var host = "ws://10.44.88.142:8080/ide/ws";
  var retryTimeout;
  var socket = new WebSocket(host);

  socket.onopen = function(){
    clearTimeout(retryTimeout);
    alert('WSOPEN');
    refreshChat();
  }

  socket.onmessage = function(msg){
    var json_result = jQuery.parseJSON(msg.data);
    $('#content').html(json_result.content);
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
  modification = {
    "content": $('#editor').val() + '<br>'
  };
  $.ajax({
    type: "POST",
    url: "save",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify(modification),
    cache: false,
    success: function(data) {
      console.log('SEND SUCCESS')
      $('#editor').val('');
    }
  });
}

function refreshChat() {
  $.ajax({
    type: "GET",
    url: "dump",
    dataType: "text",
    success: function(data) {
      var json_result = jQuery.parseJSON(data);
      console.log('REFRESH SUCCESS')
      $('#content').html(json_result.content);
    }
  });
}
