/* Class to encapsulate how communications are done.
This will allow to change only internal representation
easily when needed */
function RequestHandler(controller, recvCallback,
                        onopenCallback, oncloseCallback) {
  this.EMPTY_CALLBACK = function(){};
  

  this._hostws = "ws://"+ window.location.host +"/" + controller + "/ws";
  this._controller = controller;
  this._retryTimeout = null;
  this._socket = null;

  this._recv = recvCallback;
  this._onopen = onopenCallback || this.EMPTY_CALLBACK;
  this._onclose = oncloseCallback || this.EMPTY_CALLBACK;
  this._connectWS();
}
RequestHandler.prototype._connectWS = function() {
  this._socket = new WebSocket(this._hostws);

  // For closure
  var obj = this;

  this._socket.onopen = function(){
    clearTimeout(obj._retryTimeout);
    obj._onopen();
  };

  this._socket.onmessage = function(msg){
    var json_obj = $.parseJSON(msg.data);
    if('opCode' in json_obj) {
      // json_obj is in two parts ... opCode and data
      obj._recv(json_obj.opCode, json_obj.data);
    }
    else {
      // Send default opcode
      //console.log("No opCode in ws request for content", json_obj);
      obj._recv(0, json_obj);
    }
  };

  this._socket.onclose = function(){
    clearTimeout(obj._retryTimeout);
    obj._onclose();
    obj._retryTimeout = setTimeout(obj._connect, RETRY_CONNECT_TIMEOUT);
  };
};
RequestHandler.prototype.close = function() {
  if(this._socket){
    this._socket.close();
  }
};
RequestHandler.prototype._send = function(type, url, requestData, successCallback, errorCallback, async) {
  successCallback = successCallback || this.EMPTY_CALLBACK;
  errorCallback = errorCallback || this.EMPTY_CALLBACK;
  async = async == undefined ? true : async;

  $.ajax({
    type: type,
    url: url,
    data: requestData,
    cache: false,
    contentType: 'application/json',
    dataType: "json",
    async: async,
    success: function(response, text) { 
      successCallback(response, text);
    },
    error: function(request, status, error) {  
      if(request.status == 200){
        location.reload();
      } else {
        errorCallback(request, status, error);
      }
    }
  });
};
// Send a POST ; data is in payload
RequestHandler.prototype.post = function(url, data, successCallback, errorCallback, async) {
  this._send("POST", url, JSON.stringify(data), successCallback, errorCallback, async);
};
// Send a PUT ; data is in payload
RequestHandler.prototype.put = function(url, data, successCallback, errorCallback, async) {
  this._send("PUT", url, JSON.stringify(data), successCallback, errorCallback, async);
};
// Send a GET ; data is in query string
RequestHandler.prototype.get = function(url, data, successCallback, errorCallback, async) {
  this._send("GET", url, $.param(data), successCallback, errorCallback, async);
};
// Send a HTTP request without changing page 
RequestHandler.prototype.download = function(url, data) {
  var download_tag = $("<a>").attr('href', url + "?" + $.param(data))
                             .attr('download', '');
  download_tag[0].click();
};
