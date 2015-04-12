// Central point of interractions
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
