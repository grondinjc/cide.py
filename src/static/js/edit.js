// Central point of interractions
DEFAULT_PUSH_INTERVAL = 2000; // ms
ideApplication = null;
tree = null;
chatApplication = null;

// Requests
RETRY_CONNECT_TIMEOUT = 2000; // ms

// Initialize content when ready
$(document).ready(init);
$(window).on("beforeunload", terminate);

function init() {

  // Application Chat
  chatApplication = new AppChat("chat-display", "chat-user-text-input", "chat-user-text-btn");

  // Application IDE
  ideApplication = new AppIDE();
  ideApplication.init('editorLastVersion', 'editorDisplay');

  // Quick hack
  ideApplication.showFileContent(ideApplication._openedFile);
}

function terminate(){
  if(chatApplication)
    chatApplication.close();
  // ide.close would send a stopNotify request
}


// TEST_ONLY
function addNewTextAt(){
  var content = $('#addText').val();
  var at = parseInt($('#addAt').val());
  var modA = createAddModif(content, at);
  ideApplication.notifySoft(createModifGroup([modA], "fileName", 0));
}

function removeTextAt() {
  var count = parseInt($('#rmCountText').val());
  var at = parseInt($('#rmAt').val());
  var modA = createRemoveModif(count, at);
  ideApplication.notifySoft(createModifGroup([modA], "fileName", 0));
}

function test_ajax() {
  var modObject = createModif("abc", 0);
  var modifObject = createModifGroup([modObject], "fileName", 0);
  ideApplication._requestHandler.post("save", modifObject, function(){
    console.log("Success reveived comm");
    ideApplication._changeMemory.clear();
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
  tree.addNode('dir-toto/');

  tree.addNode('/d/');
  tree.addNode('d/sub-toto-file');
  tree.addNode('d/sub-toto-dir/');
}
